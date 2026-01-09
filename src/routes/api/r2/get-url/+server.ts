import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { r2, R2_BUCKET } from '$lib/server/r2';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { requireAuth, canAccessR2Resource } from '$lib/server/auth';
import { handleAPIError } from '$lib/server/errors';
import { validateR2Key } from '$lib/server/validation';
import { globalLimiter } from '$lib/server/rate-limit';

// Shared logic for generating signed URL
async function generateSignedUrl(key: string) {
    // Validate key format and prevent path traversal
    validateR2Key(key);

    const command = new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
    });

    // Generate a signed URL valid for 1 hour for playback/viewing
    return await getSignedUrl(r2, command, { expiresIn: 3600 });
}

export async function POST({ request, locals }: RequestEvent) {
    try {
        const { key } = await request.json();

        if (!key || typeof key !== 'string') {
            return json({ error: 'No key provided', code: 'MISSING_KEY' }, { status: 400 });
        }

        // ✅ SMART SECURITY: Allow public access to music folder (published content)
        // This allows users to play music without being logged in
        if (key.startsWith('music/') || key.startsWith('catalog/')) {
            const url = await generateSignedUrl(key);
            return json({ url });
        }

        // For submissions and other private folders, require authentication
        const user = requireAuth(locals);

        // SECURITY: Rate limiting (10 requests per minute per user)
        globalLimiter.enforce(user.uid, 10, 60000);

        // SECURITY: Check if user has permission to access this resource
        if (!canAccessR2Resource(user, key)) {
            return json({
                error: 'You do not have permission to access this resource',
                code: 'FORBIDDEN'
            }, { status: 403 });
        }

        const url = await generateSignedUrl(key);
        return json({ url });
    } catch (err: any) {
        return handleAPIError(err);
    }
}

export async function GET({ url, locals }: RequestEvent) {
    try {
        const key = url.searchParams.get('key');
        console.log('[API] get-url requested for key:', key); // DEBUG

        if (!key) {
            return json({ error: 'No key provided', code: 'MISSING_KEY' }, { status: 400 });
        }

        // ✅ SMART SECURITY: Allow public access to music folder (published content)
        if (key.startsWith('music/') || key.startsWith('catalog/')) {
            console.log('[API] Public access granted for:', key); // DEBUG
            const signedUrl = await generateSignedUrl(key);
            return json({ url: signedUrl });
        }

        // For submissions and other private folders, require authentication
        const user = requireAuth(locals);

        // SECURITY: Rate limiting (10 requests per minute per user)
        globalLimiter.enforce(user.uid, 10, 60000);

        // SECURITY: Check if user has permission to access this resource
        if (!canAccessR2Resource(user, key)) {
            return json({
                error: 'You do not have permission to access this resource',
                code: 'FORBIDDEN'
            }, { status: 403 });
        }

        const signedUrl = await generateSignedUrl(key);
        return json({ url: signedUrl });
    } catch (err: any) {
        return handleAPIError(err);
    }
}
