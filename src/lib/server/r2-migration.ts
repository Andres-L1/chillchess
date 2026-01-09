import { R2_BUCKET, r2 } from '$lib/server/r2';
import { CopyObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { validateFileName } from '$lib/server/validation';

/**
 * Migrates files from submissions/ to music/Artist/Album/
 * Reusable helper for both admin approval and auto-publish
 */
export async function migrateSubmissionFiles(
    files: Array<{ key: string; name: string }>,
    artistName: string,
    albumTitle: string
): Promise<{
    migratedFiles: Array<{ key: string; name: string }>;
    errors: Array<{ file: string; error: string }>;
}> {
    const finalPath = `music/${artistName}/${albumTitle}`;
    const migratedFiles = [];
    const errors = [];

    for (const file of files) {
        // SECURITY: Ensure we are only moving things FROM submissions
        if (!file.key.startsWith('submissions/')) {
            console.warn(`SECURITY: Skipping invalid file source: ${file.key}`);
            errors.push({ file: file.key, error: 'Invalid source folder' });
            continue;
        }

        // Sanitize filename to ensure clean URL compatibility
        const originalName = file.name || file.key.split('/').pop() || 'unknown';
        // Preserve extension
        const ext = originalName.split('.').pop();
        const nameWithoutExt = originalName.replace(`.${ext}`, '');

        let safeName;
        try {
            safeName = validateFileName(nameWithoutExt) + (ext ? `.${ext}` : '');
        } catch (e) {
            // Fallback if very weird characters
            safeName = `file_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
        }

        const newKey = `${finalPath}/${safeName}`;

        try {
            // 1. Copy Object
            await r2.send(
                new CopyObjectCommand({
                    Bucket: R2_BUCKET,
                    CopySource: `${R2_BUCKET}/${file.key}`,
                    Key: newKey,
                })
            );

            // 2. Delete Original (only if copy succeeded)
            await r2.send(
                new DeleteObjectCommand({
                    Bucket: R2_BUCKET,
                    Key: file.key,
                })
            );

            migratedFiles.push({
                ...file,
                key: newKey,
            });
        } catch (err: any) {
            // Check if file was already moved
            if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
                console.log(`Source missing for ${file.key}, checking destination...`);
                try {
                    await r2.send(
                        new HeadObjectCommand({
                            Bucket: R2_BUCKET,
                            Key: newKey,
                        })
                    );
                    console.log(`✅ Destination exists. File already migrated.`);
                    migratedFiles.push({
                        ...file,
                        key: newKey,
                    });
                } catch (headErr) {
                    console.error(`❌ File lost: ${file.key}`);
                    errors.push({
                        file: file.name,
                        error: 'Archivo no encontrado',
                    });

                    // If it's NOT a cover, this is critical
                    if (!file.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
                        throw new Error(`Archivo crítico perdido: ${file.name}`);
                    }
                }
            } else {
                console.error(`R2 error for ${file.key}:`, err);
                throw new Error(`Error al migrar ${file.name}: ${err.message}`);
            }
        }
    }

    return { migratedFiles, errors };
}
