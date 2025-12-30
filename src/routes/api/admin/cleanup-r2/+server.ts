import { json } from '@sveltejs/kit';
import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
// @ts-ignore
import { R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME } from '$env/static/private';
// @ts-ignore
import { PUBLIC_R2_ACCOUNT_ID } from '$env/static/public';

export async function POST() {
    try {
        const R2 = new S3Client({
            region: 'auto',
            endpoint: `https://${PUBLIC_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
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

        return json({
            message: `Successfully cleaned ${toDelete.length} files older than 3 days.`,
            deletedCount: toDelete.length
        });

    } catch (e: any) {
        console.error('R2 Cleanup Error:', e);
        return json({ error: e.message }, { status: 500 });
    }
}
