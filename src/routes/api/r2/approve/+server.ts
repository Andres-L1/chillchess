import { json } from '@sveltejs/kit';
import { r2, R2_BUCKET } from '$lib/server/r2';
import { CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export async function POST({ request }) {
    const { submissionId, artistVerifiedName, albumTitle, files } = await request.json();

    if (!files || !Array.isArray(files)) {
        return json({ error: 'No files provided' }, { status: 400 });
    }

    const migratedFiles = [];

    // Sanitize names for folder paths
    const safeArtist = artistVerifiedName.replace(/[^a-zA-Z0-9-_]/g, '_');
    const safeAlbum = albumTitle.replace(/[^a-zA-Z0-9-_]/g, '_');
    const finalPath = `music/${safeArtist}/${safeAlbum}`;

    try {
        for (const file of files) {
            // file.key is the current path in 'submissions/...'
            // We want to move it to 'music/Artist/Album/...'
            const fileName = file.name || file.key.split('/').pop();
            const newKey = `${finalPath}/${fileName}`;

            // 1. Copy Object
            await r2.send(new CopyObjectCommand({
                Bucket: R2_BUCKET,
                CopySource: `${R2_BUCKET}/${file.key}`,
                Key: newKey,
            }));

            // 2. Delete Original Object (Cleanup temp)
            await r2.send(new DeleteObjectCommand({
                Bucket: R2_BUCKET,
                Key: file.key,
            }));

            migratedFiles.push({
                ...file,
                key: newKey,
                // If using public domain R2 access, specificy it here. otherwise we generate presigned URLs for playback.
                // Assuming we use presigned URLs for everything for now to keep it private.
            });
        }

        return json({ success: true, migratedFiles });
    } catch (err: any) {
        console.error('Error migrating files:', err);
        return json({ error: err.message }, { status: 500 });
    }
}
