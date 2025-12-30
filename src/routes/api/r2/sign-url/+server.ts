import { json } from '@sveltejs/kit';
import { r2, R2_BUCKET } from '$lib/server/r2';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function POST({ request }) {
    const { fileName, fileType, folder } = await request.json();

    if (!fileName || !fileType) {
        return json({ error: 'Missing identifying information' }, { status: 400 });
    }

    // Default to a 'temp' folder if not specified, but restrict to allowed paths
    const allowedFolders = ['submissions'];
    const targetFolder = folder ? folder.split('/')[0] : 'temp'; // simplistic check

    if (!allowedFolders.includes(targetFolder)) {
        return json({ error: 'Invalid upload folder' }, { status: 403 });
    }

    // Validate File Type
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/x-m4a', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(fileType)) {
        return json({ error: 'Invalid file type' }, { status: 400 });
    }

    const key = `${folder || 'submissions/temp'}/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;

    const command = new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        ContentType: fileType,
    });

    try {
        // Generate a signed URL valid for 5 minutes
        const signedUrl = await getSignedUrl(r2, command, { expiresIn: 300 });

        return json({
            uploadUrl: signedUrl,
            key: key
        });
    } catch (err) {
        console.error('Error generating signed URL:', err);
        return json({ error: 'Failed to generate upload URL' }, { status: 500 });
    }
}
