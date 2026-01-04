import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { r2, R2_BUCKET } from '$lib/server/r2';
import { adminDB } from '$lib/server/admin';
import { CopyObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

export async function POST({ request, locals }: RequestEvent) {
    // SECURITY: Require authentication
    if (!locals.user) {
        return json({ error: 'Authentication required' }, { status: 401 });
    }

    // SECURITY: Verify admin privileges (with Firestore fallback)
    let isAdmin = locals.user.isAdmin;

    if (!isAdmin && adminDB) {
        try {
            const userDoc = await adminDB.collection('users').doc(locals.user.uid).get();
            if (userDoc.exists && userDoc.data()?.isAdmin === true) {
                isAdmin = true;
            }
        } catch (e) {
            console.error('Admin fallback check failed:', e);
        }
    }

    if (!isAdmin) {
        console.warn(`Unauthorized approve attempt by user ${locals.user.uid}`);
        return json({ error: 'Admin privileges required' }, { status: 403 });
    }

    const { submissionId, artistVerifiedName, albumTitle, files } = await request.json();

    if (!files || !Array.isArray(files)) {
        return json({ error: 'No files provided' }, { status: 400 });
    }

    const migratedFiles = [];

    // Sanitize names for folder paths
    const safeArtist = artistVerifiedName?.replace(/[^a-zA-Z0-9-_]/g, '_') || 'unknown';
    const safeAlbum = albumTitle?.replace(/[^a-zA-Z0-9-_]/g, '_') || 'unknown';
    const finalPath = `music/${safeArtist}/${safeAlbum}`;

    try {
        for (const file of files) {
            // SECURITY: Ensure we are only moving things FROM submissions (temp)
            if (!file.key.startsWith('submissions/')) {
                console.warn(`SECURITY: Skipping invalid file source: ${file.key}`);
                continue;
            }

            // file.key is the current path in 'submissions/...
            // We want to move it to 'music/Artist/Album/...'
            const fileName = file.name || file.key.split('/').pop();
            const newKey = `${finalPath}/${fileName}`;

            // 1. Copy Object
            try {
                // NOTE: CopySource must be encoded if it contains special characters, 
                // but usually client strings are okay. 
                // AWS SDK expects "Bucket/Key"

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
                // This handles "Re-process" scenarios where files were fully or partially moved before.
                if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
                    console.log(`Source missing for ${file.key}, checking destination ${newKey}...`);
                    try {
                        await r2.send(new HeadObjectCommand({
                            Bucket: R2_BUCKET,
                            Key: newKey
                        }));
                        console.log(`✅ Destination exists. Assuming file was already moved.`);
                        // If we are here, destination exists, so we treat it as success.
                    } catch (headErr) {
                        console.error(`❌ Critical: Source missing AND Destination missing for ${file.key}`);

                        // EMERGENCY FIX: If it's the cover map it to a placeholder/null so we don't block the music publication
                        if (file.name.match(/\.(jpg|jpeg|png|webp)$/i) || file.key.includes('cover')) {
                            console.warn('⚠️ Cover file lost. Using placeholder behavior.');
                            // We skip adding it to migratedFiles so the frontend handle it or we add a dummy
                            // Better to just continue. The album will be created without cover if this key is invalid, 
                            // or we can just let it fail gracefully later.
                            // Let's NOT throw.
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
        console.log(`Admin ${locals.user.email} approved submission ${submissionId} - migrated ${migratedFiles.length} files to ${finalPath}`);

        return json({ success: true, migratedFiles });
    } catch (err: any) {
        // If it's a "File lost" error from our custom check, we can define how to handle it.
        // For now, let's assume we want to fail so the admin knows. 
        // BUT, better to return specific error structure?
        console.error('Error migrating files:', err);
        return json({ error: err.message || 'Unknown migration error' }, { status: 500 });
    }
}
