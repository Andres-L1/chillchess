import { json } from '@sveltejs/kit';
import { r2, R2_BUCKET } from '$lib/server/r2';
import { ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import type { RequestEvent } from '@sveltejs/kit';

export const POST = async ({ locals, request }: RequestEvent) => {
    // Check admin auth
    // @ts-ignore - User is added by hooks
    if (!locals.user || !locals.user.isAdmin) {
        return json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // List all objects in submissions/rejected/
        const listCommand = new ListObjectsV2Command({
            Bucket: R2_BUCKET,
            Prefix: 'submissions/rejected/',
        });

        const listResponse = await r2.send(listCommand);
        const objects = listResponse.Contents || [];

        // Filter objects older than 30 days
        const objectsToDelete = objects.filter((obj) => {
            if (!obj.LastModified) return false;
            return obj.LastModified < thirtyDaysAgo;
        });

        if (objectsToDelete.length === 0) {
            return json({ message: 'No files to delete', deletedCount: 0 });
        }

        // Delete old files
        const deleteCommand = new DeleteObjectsCommand({
            Bucket: R2_BUCKET,
            Delete: {
                Objects: objectsToDelete.map((obj) => ({ Key: obj.Key })),
            },
        });

        await r2.send(deleteCommand);

        return json({
            message: `Successfully deleted ${objectsToDelete.length} files`,
            deletedCount: objectsToDelete.length,
        });
    } catch (error) {
        console.error('Error cleaning up rejected files:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};
