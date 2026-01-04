import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { r2, R2_BUCKET } from '$lib/server/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Simple in-memory rate limiting (consider Redis for production)
const uploadAttempts = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_UPLOADS_PER_WINDOW = 10;

export async function POST({ request, locals }: RequestEvent) {
    // SECURITY: Require authentication
    if (!locals.user) {
        return json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = locals.user.uid;

    // SECURITY: Rate limiting per user
    const now = Date.now();
    const userAttempts = uploadAttempts.get(userId) || [];
    const recentAttempts = userAttempts.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW_MS);

    if (recentAttempts.length >= MAX_UPLOADS_PER_WINDOW) {
        return json({ error: 'Rate limit exceeded. Please wait before uploading more files.' }, { status: 429 });
    }

    recentAttempts.push(now);
    uploadAttempts.set(userId, recentAttempts);

    const { fileName, fileType, folder, fileSize } = await request.json();

    if (!fileName || !fileType) {
        return json({ error: 'Missing identifying information' }, { status: 400 });
    }

    // SECURITY: Validate file size before signing (500MB limit for R2)
    const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
    if (fileSize && fileSize > MAX_FILE_SIZE) {
        return json({ error: 'File size exceeds 500MB limit' }, { status: 413 });
    }

    // SECURITY: Restrict to allowed paths and validate user ownership
    const allowedFolders = ['submissions', 'artists', 'albums', 'catalog'];
    const targetFolder = folder ? folder.split('/')[0] : 'temp';

    if (!allowedFolders.includes(targetFolder)) {
        return json({ error: 'Invalid upload folder' }, { status: 403 });
    }

    // Validate File Type
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/x-m4a', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(fileType)) {
        return json({ error: 'Invalid file type' }, { status: 400 });
    }

    // SECURITY: Use userId in path to prevent path traversal and ensure user isolation
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const key = `${folder || 'submissions'}/${userId}/${Date.now()}_${sanitizedFileName}`;

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
