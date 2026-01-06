import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { r2, R2_BUCKET } from '$lib/server/r2';
import { DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { requireAdmin } from '$lib/server/auth';
import { handleAPIError, logAudit } from '$lib/server/errors';

/**
 * Cleanup endpoint for rejected submission files
 * Deletes R2 files associated with rejected submissions
 */
export async function POST({ request, locals }: RequestEvent) {
    try {
        const admin = await requireAdmin(locals);
        const { submissionId, files } = await request.json();

        if (!files || !Array.isArray(files)) {
            return json({ error: 'No files provided', code: 'NO_FILES' }, { status: 400 });
        }

        let cleanedCount = 0;
        let failedCount = 0;
        const errors = [];

        for (const key of files) {
            if (!key || typeof key !== 'string') {
                console.warn('Invalid file key:', key);
                continue;
            }

            // SECURITY: Only allow deletion from submissions folder
            if (!key.startsWith('submissions/')) {
                console.warn(`SECURITY: Attempted to delete non-submission file: ${key}`);
                failedCount++;
                errors.push({ key, error: 'Invalid file location' });
                continue;
            }

            try {
                // Check if file exists before attempting deletion
                try {
                    await r2.send(new HeadObjectCommand({
                        Bucket: R2_BUCKET,
                        Key: key
                    }));
                } catch (headErr: any) {
                    if (headErr.$metadata?.httpStatusCode === 404) {
                        console.log(`File already deleted or doesn't exist: ${key}`);
                        cleanedCount++; // Count as success (already gone)
                        continue;
                    }
                    throw headErr;
                }

                // Delete the file
                await r2.send(new DeleteObjectCommand({
                    Bucket: R2_BUCKET,
                    Key: key
                }));

                cleanedCount++;
                console.log(`✅ Deleted: ${key}`);
            } catch (err: any) {
                console.error(`❌ Failed to delete ${key}:`, err);
                failedCount++;
                errors.push({ key, error: err.message });
            }
        }

        // Log the cleanup action
        logAudit({
            action: 'submission_files_cleanup',
            userId: admin.uid,
            targetId: submissionId,
            details: {
                cleanedCount,
                failedCount,
                totalFiles: files.length
            }
        });

        return json({
            success: true,
            cleanedCount,
            failedCount,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (err: any) {
        return handleAPIError(err);
    }
}
