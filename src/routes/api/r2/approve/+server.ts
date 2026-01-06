import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { r2, R2_BUCKET } from '$lib/server/r2';
import { adminDB } from '$lib/server/admin';
import { CopyObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { requireAdmin } from '$lib/server/auth';
import { handleAPIError, logAudit } from '$lib/server/errors';
import { validateArtistName, validateAlbumTitle } from '$lib/server/validation';

export async function POST({ request, locals }: RequestEvent) {
    try {
        // SECURITY: Require admin authentication
        const admin = await requireAdmin(locals);

        const { submissionId, artistVerifiedName, albumTitle, files } = await request.json();

        if (!files || !Array.isArray(files)) {
            return json({ error: 'No files provided', code: 'MISSING_FILES' }, { status: 400 });
        }

        // SECURITY: Validate and sanitize artist name and album title
        const safeArtist = validateArtistName(artistVerifiedName);
        const safeAlbum = validateAlbumTitle(albumTitle);

        const finalPath = `music/${safeArtist}/${safeAlbum}`;
        const migratedFiles = [];

        for (const file of files) {
            // SECURITY: Ensure we are only moving things FROM submissions (temp)
            if (!file.key.startsWith('submissions/')) {
                console.warn(`SECURITY: Skipping invalid file source: ${file.key}`);
                continue;
            }

            // file.key is the current path in 'submissions/...'
            // We want to move it to 'music/Artist/Album/...'
            const fileName = file.name || file.key.split('/').pop();
            const newKey = `${finalPath}/${fileName}`;

            // 1. Copy Object
            try {
                await r2.send(new CopyObjectCommand({
                    Bucket: R2_BUCKET,
                    CopySource: `${R2_BUCKET}/${file.key}`,
                    Key: newKey,
                }));

                // 2. Delete Original Object (Only if copy succeeded)
                await r2.send(new DeleteObjectCommand({
                    Bucket: R2_BUCKET,
                    Key: file.key,
                }));

            } catch (err: any) {
                // Robustness: If source file doesn't exist, check if it was ALREADY moved (destination exists)
                if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
                    console.log(`Source missing for ${file.key}, checking destination ${newKey}...`);
                    try {
                        await r2.send(new HeadObjectCommand({
                            Bucket: R2_BUCKET,
                            Key: newKey
                        }));
                        console.log(`✅ Destination exists. Assuming file was already moved.`);
                    } catch (headErr) {
                        console.error(`❌ Critical: Source missing AND Destination missing for ${file.key}`);

                        // If it's the cover, skip it with warning
                        if (file.name.match(/\.(jpg|jpeg|png|webp)$/i) || file.key.includes('cover')) {
                            console.warn('⚠️ Cover file lost. Using placeholder behavior.');
                            continue;
                        } else {
                            throw new Error(`File lost: ${file.name}`);
                        }
                    }
                } else {
                    throw err;
                }
            }

            migratedFiles.push({
                ...file,
                key: newKey,
            });
        }

        // SECURITY: Log approval for audit trail
        logAudit({
            action: 'submission_approved',
            userId: admin.uid,
            targetId: submissionId,
            details: {
                artistName: artistVerifiedName,
                albumTitle,
                migratedCount: migratedFiles.length,
                finalPath
            }
        });

        return json({ success: true, migratedFiles });
    } catch (err: any) {
        return handleAPIError(err);
    }
}
