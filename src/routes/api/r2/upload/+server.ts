import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { r2, R2_BUCKET } from '$lib/server/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { requireAuth } from '$lib/server/auth';
import { handleAPIError } from '$lib/server/errors';
import { validateFileName, validateFileSize } from '$lib/server/validation';
import { globalLimiter } from '$lib/server/rate-limit';

/**
 * Direct upload to R2 via server proxy
 * This bypasses CORS issues by uploading from server-side instead of browser direct upload
 */
export async function POST({ request, locals }: RequestEvent) {
    try {
        // SECURITY: Require authentication
        const user = requireAuth(locals);

        // SECURITY: Rate limiting (10 uploads per minute per user)
        globalLimiter.enforce(user.uid, 10, 60000);

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folder = (formData.get('folder') as string) || 'submissions';

        if (!file) {
            return json({ error: 'No file provided', code: 'NO_FILE' }, { status: 400 });
        }

        // SECURITY: Validate file size (500MB limit for R2)
        validateFileSize(file.size, 500);

        // SECURITY: Validate and sanitize file name
        const sanitizedFileName = validateFileName(file.name);

        // SECURITY: Restrict to allowed paths
        const allowedFolders = ['submissions', 'artists', 'albums', 'catalog'];
        const targetFolder = folder.split('/')[0];

        if (!allowedFolders.includes(targetFolder)) {
            return json({ error: 'Invalid upload folder', code: 'INVALID_FOLDER' }, { status: 403 });
        }

        // Validate File Type
        const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/x-m4a', 'image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return json({ error: 'Invalid file type', code: 'INVALID_FILE_TYPE' }, { status: 400 });
        }

        // SECURITY: Use userId in path to prevent path traversal
        const key = `${folder}/${user.uid}/${Date.now()}_${sanitizedFileName}`;

        // Convert File to Buffer for R2 upload
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload directly to R2 from server
        const command = new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: key,
            Body: buffer,
            ContentType: file.type,
        });

        await r2.send(command);

        // Return public URL
        const PUBLIC_R2_DOMAIN = 'https://pub-e58e51867b4c44f58a32c407eb8cca7c.r2.dev';
        const publicUrl = `${PUBLIC_R2_DOMAIN}/${key}`;

        return json({
            url: publicUrl,
            key: key,
            success: true
        });
    } catch (err) {
        return handleAPIError(err);
    }
}
