import { json } from '@sveltejs/kit';
import { r2, R2_BUCKET } from '$lib/server/r2';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Shared logic for generating signed URL
async function generateSignedUrl(key: string) {
    if (!key || typeof key !== 'string') {
        throw new Error('No key provided');
    }

    // Prevent directory traversal
    if (key.includes('..')) {
        throw new Error('Invalid key');
    }

    // Restrict access to known folders
    if (!key.startsWith('submissions/') && !key.startsWith('music/')) {
        throw new Error('Access denied');
    }

    const command = new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
    });

    // Generate a signed URL valid for 1 hour for playback/viewing
    return await getSignedUrl(r2, command, { expiresIn: 3600 });
}

export async function POST({ request }) {
    try {
        const { key } = await request.json();
        const url = await generateSignedUrl(key);
        return json({ url });
    } catch (err: any) {
        if (err.message === 'Access denied') return json({ error: err.message }, { status: 403 });
        if (err.message === 'Invalid key' || err.message === 'No key provided') return json({ error: err.message }, { status: 400 });

        console.error('Error generating signed URL (POST):', err);
        return json({ error: 'Failed to generate playback URL' }, { status: 500 });
    }
}

export async function GET({ url }) {
    try {
        const key = url.searchParams.get('key');
        // If key is null, generateSignedUrl will throw 'No key provided'
        const signedUrl = await generateSignedUrl(key || '');
        return json({ url: signedUrl });
    } catch (err: any) {
        if (err.message === 'Access denied') return json({ error: err.message }, { status: 403 });
        if (err.message === 'Invalid key' || err.message === 'No key provided') return json({ error: err.message }, { status: 400 });

        console.error('Error generating signed URL (GET):', err);
        return json({ error: 'Failed to generate playback URL' }, { status: 500 });
    }
}
