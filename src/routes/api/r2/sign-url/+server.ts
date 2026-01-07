import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { r2, R2_BUCKET } from '$lib/server/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { S3RequestPresigner } from '@aws-sdk/s3-request-presigner';
import { createRequest } from '@aws-sdk/util-create-request';
import { formatUrl } from '@aws-sdk/util-format-url';
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

        const { fileName, fileType, folder, fileSize } = await request.json();

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

        // Generate a signed URL valid for 15 minutes (enough for large audio files)
        // EXCLUDE 'host' from signed headers to prevent signature mismatch errors on R2
        // R2 often has issues when the Host header changes between signing (server) and uploading (browser)

        // Manual Presigning to strictly enforce exclusion of Host header
        const signer = new S3RequestPresigner({
            ...r2.config,
            signableHeaders: new Set(['content-type']), // Strictly sign ONLY content-type
        });

        const request = await createRequest(r2, command);
        const signedUrlRequest = await signer.presign(request, {
            expiresIn: 900
        });

        const signedUrl = formatUrl(signedUrlRequest);

        return json({
            uploadUrl: signedUrl,
            key: key
        });
    } catch (err) {
        return handleAPIError(err);
    }
}
