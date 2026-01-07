import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { r2, R2_BUCKET } from '$lib/server/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { requireAuth } from '$lib/server/auth';
import { handleAPIError } from '$lib/server/errors';
import { validateFileName, validateFileSize } from '$lib/server/validation';
import { globalLimiter } from '$lib/server/rate-limit';

export async function POST({ request, locals }: RequestEvent) {
    try {
        // SECURITY: Require authentication
        const user = requireAuth(locals);

        // SECURITY: Rate limiting (10 uploads per minute per user)
        globalLimiter.enforce(user.uid, 10, 60000);

        const body = await request.json() as { fileName: string; fileType: string; folder?: string; fileSize?: number };
        const { fileName, fileType, folder, fileSize } = body;

        if (!fileName || !fileType) {
            return json({ error: 'Missing file information', code: 'MISSING_FILE_INFO' }, { status: 400 });
        }

        // SECURITY: Validate file size before signing (500MB limit for R2)
        if (fileSize) {
            validateFileSize(fileSize, 500);
        }

        // SECURITY: Validate and sanitize file name
        const sanitizedFileName = validateFileName(fileName);

        // SECURITY: Restrict to allowed paths and validate user ownership
        const allowedFolders = ['submissions', 'artists', 'albums', 'catalog'];
        const targetFolder = folder ? folder.split('/')[0] : 'temp';

        if (!allowedFolders.includes(targetFolder)) {
            return json({ error: 'Invalid upload folder', code: 'INVALID_FOLDER' }, { status: 403 });
        }

        // Validate File Type
        const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/x-m4a', 'image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(fileType)) {
            return json({ error: 'Invalid file type', code: 'INVALID_FILE_TYPE' }, { status: 400 });
        }

        // SECURITY: Use userId in path to prevent path traversal and ensure user isolation
        const key = `${folder || 'submissions'}/${user.uid}/${Date.now()}_${sanitizedFileName}`;

        const command = new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: key,
            ContentType: fileType,
        });

        // Generate a signed URL valid for 15 minutes
        // Host header exclusion is configured at the S3Client level (see r2.ts)
        const signedUrl = await getSignedUrl(r2, command, { expiresIn: 900 });

        return json({
            uploadUrl: signedUrl,
            key: key
        });
    } catch (err) {
        return handleAPIError(err);
    }
}
