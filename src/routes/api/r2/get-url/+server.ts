import { json } from '@sveltejs/kit';
import { r2, R2_BUCKET } from '$lib/server/r2';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function POST({ request }) {
    const { key } = await request.json();

    if (!key) {
        return json({ error: 'No key provided' }, { status: 400 });
    }

    const command = new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
    });

    try {
        // Generate a signed URL valid for 1 hour for playback/viewing
        const signedUrl = await getSignedUrl(r2, command, { expiresIn: 3600 });

        return json({ url: signedUrl });
    } catch (err) {
        console.error('Error generating signed URL:', err);
        return json({ error: 'Failed to generate playback URL' }, { status: 500 });
    }
}
