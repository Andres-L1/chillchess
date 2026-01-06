import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
// @ts-ignore - SvelteKit dynamic env module
import { env } from '$env/dynamic/private';
// @ts-ignore - SvelteKit dynamic env module
import { env as publicEnv } from '$env/dynamic/public';
import { requireAdmin } from '$lib/server/auth';
import { handleAPIError, logAudit } from '$lib/server/errors';

export async function POST({ locals }: RequestEvent) {
    try {
        // SECURITY: Require admin authentication
        const admin = await requireAdmin(locals);

        const R2_ACCOUNT_ID = publicEnv.PUBLIC_R2_ACCOUNT_ID || env.PUBLIC_R2_ACCOUNT_ID;
        const R2_ACCESS_KEY_ID = env.R2_ACCESS_KEY_ID;
        const R2_SECRET_ACCESS_KEY = env.R2_SECRET_ACCESS_KEY;
        const R2_BUCKET_NAME = env.R2_BUCKET_NAME || 'chillchess-music';

        if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
            return json({ error: 'R2 configuration missing' }, { status: 500 });
        }

        const R2 = new S3Client({
            region: 'auto',
            endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: R2_ACCESS_KEY_ID,
                secretAccessKey: R2_SECRET_ACCESS_KEY,
            },
        });

        // 1. List objects in submissions/temp
        const listCommand = new ListObjectsV2Command({
            Bucket: R2_BUCKET_NAME,
            Prefix: 'submissions/temp/'
        });

        const data = await R2.send(listCommand);

        if (!data.Contents || data.Contents.length === 0) {
            return json({ message: 'No temporary files found to clean.', deletedCount: 0 });
        }

        const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
        const toDelete: { Key: string }[] = [];

        for (const obj of data.Contents) {
            if (obj.LastModified && obj.LastModified.getTime() < threeDaysAgo && obj.Key) {
                toDelete.push({ Key: obj.Key });
            }
        }

        if (toDelete.length === 0) {
            return json({ message: 'No files older than 3 days found.', deletedCount: 0 });
        }

        // 2. Delete filtered objects
        const deleteCommand = new DeleteObjectsCommand({
            Bucket: R2_BUCKET_NAME,
            Delete: {
                Objects: toDelete
            }
        });

        await R2.send(deleteCommand);

        // SECURITY: Log this admin action for audit
        logAudit({
            action: 'r2_cleanup',
            userId: admin.uid,
            details: {
                deletedCount: toDelete.length,
                bucket: R2_BUCKET_NAME,
                prefix: 'submissions/temp/'
            }
        });

        return json({
            message: `Successfully cleaned ${toDelete.length} files older than 3 days.`,
            deletedCount: toDelete.length
        });

    } catch (e: any) {
        return handleAPIError(e);
    }
}
