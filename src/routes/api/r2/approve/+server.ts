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

        if (!files || !Array.isArray(files) || files.length === 0) {
            return json({
                error: 'No hay archivos para migrar',
                code: 'NO_FILES',
                detail: 'El envío no tiene archivos R2 para procesar'
            }, { status: 400 });
        }

        // SECURITY: Validate and sanitize artist name and album title
        let safeArtist: string;
        let safeAlbum: string;

        try {
            safeArtist = validateArtistName(artistVerifiedName);
            safeAlbum = validateAlbumTitle(albumTitle);
        } catch (validationErr: any) {
            return json({
                error: 'Datos inválidos',
                code: 'VALIDATION_ERROR',
                detail: validationErr.message
            }, { status: 400 });
        }

        const finalPath = `music/${safeArtist}/${safeAlbum}`;
        const migratedFiles = [];
        const errors = [];

        for (const file of files) {
            // SECURITY: Ensure we are only moving things FROM submissions (temp)
            if (!file.key.startsWith('submissions/')) {
                console.warn(`SECURITY: Skipping invalid file source: ${file.key}`);
                errors.push({ file: file.key, error: 'Invalid source folder' });
                continue;
            }

            // file.key is the current path in 'submissions/...
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

                migratedFiles.push({
                    ...file,
                    key: newKey,
                });

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

                        migratedFiles.push({
                            ...file,
                            key: newKey,
                        });
                    } catch (headErr) {
                        console.error(`❌ Critical: Source missing AND Destination missing for ${file.key}`);
                        errors.push({
                            file: file.name,
                            error: 'Archivo no encontrado en submissions ni en destino'
                        });

                        // If it's the cover, skip it with warning
                        if (file.name.match(/\.(jpg|jpeg|png|webp)$/i) || file.key.includes('cover')) {
                            console.warn('⚠️ Cover file lost. Continuing with other files.');
                            continue;
                        } else {
                            throw new Error(`Archivo de audio perdido: ${file.name}. No se pudo completar la migración.`);
                        }
                    }
                } else {
                    console.error(`R2 operation failed for ${file.key}:`, err);
                    throw new Error(`Error al migrar ${file.name}: ${err.message}`);
                }
            }
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
                errorCount: errors.length,
                finalPath
            }
        });

        return json({
            success: true,
            migratedFiles,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (err: any) {
        console.error('R2 Approve Error:', err);
        return handleAPIError(err);
    }
}
