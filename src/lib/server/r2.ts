import { S3Client } from "@aws-sdk/client-s3";
// ⛔ PROTECTED FILE: DO NOT MODIFY WITHOUT EXPLICIT USER CONSENT.
// Configuration is verified and working. Changes here will break production uploads.
// @ts-ignore - SvelteKit dynamic env module
import { env } from "$env/dynamic/private";
// @ts-ignore - SvelteKit dynamic env module
import { env as publicEnv } from "$env/dynamic/public";

// Fallback logic adjusted to check publicEnv for PUBLIC_ prefixed vars
const R2_ACCOUNT_ID = publicEnv.PUBLIC_R2_ACCOUNT_ID || env.PUBLIC_R2_ACCOUNT_ID || process.env.PUBLIC_R2_ACCOUNT_ID;
const ACCESS_KEY_ID = env.R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = env.R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY;

// SECURITY: Only warn about missing credentials in development, not production
if (process.env.NODE_ENV !== 'production') {
    if (!R2_ACCOUNT_ID || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
        console.warn("⚠️ [DEV] R2 credentials missing. File uploads will fail.");
    }
}

export const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: ACCESS_KEY_ID || "",
        secretAccessKey: SECRET_ACCESS_KEY || "",
    },
    forcePathStyle: true, // Crucial for Cloudflare R2 to avoid DNS/CORS issues with bucket subdomains
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
});

// Configure additional middleware to exclude host from signing
r2.middlewareStack.add(
    (next) => async (args: any) => {
        // Remove host from signable headers
        if (args.request && args.request.headers) {
            delete args.request.headers['host'];
        }
        return next(args);
    },
    {
        step: 'build',
        priority: 'high',
        name: 'removeHostHeader'
    }
);

// SECURITY: Make bucket name configurable via environment variable
// SECURITY: Make bucket name configurable via environment variable
// Forced to 'chillchess-music' to override incorrect Netlify env var
export const R2_BUCKET = "chillchess-music";

// ============================================================================
// R2 FILE DELETION UTILITIES
// ============================================================================

import { DeleteObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';

/**
 * Delete a single file from R2 storage
 */
export async function deleteR2File(key: string): Promise<boolean> {
    try {
        if (!R2_ACCOUNT_ID || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
            console.error('[R2] Missing configuration for file deletion');
            return false;
        }

        await r2.send(
            new DeleteObjectCommand({
                Bucket: R2_BUCKET,
                Key: key,
            })
        );

        console.log(`[R2] Deleted file: ${key}`);
        return true;
    } catch (error) {
        console.error(`[R2] Error deleting file ${key}:`, error);
        return false;
    }
}

/**
 * Delete multiple files from R2 storage
 */
export async function deleteR2Files(keys: string[]): Promise<{ success: number; failed: number }> {
    if (!keys || keys.length === 0) {
        return { success: 0, failed: 0 };
    }

    try {
        if (!R2_ACCOUNT_ID || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
            console.error('[R2] Missing configuration for batch deletion');
            return { success: 0, failed: keys.length };
        }

        // R2 allows max 1000 objects per delete request
        const chunks = [];
        for (let i = 0; i < keys.length; i += 1000) {
            chunks.push(keys.slice(i, i + 1000));
        }

        let successCount = 0;
        let failedCount = 0;

        for (const chunk of chunks) {
            try {
                await r2.send(
                    new DeleteObjectsCommand({
                        Bucket: R2_BUCKET,
                        Delete: {
                            Objects: chunk.map((key) => ({ Key: key })),
                            Quiet: false,
                        },
                    })
                );
                successCount += chunk.length;
                console.log(`[R2] Deleted ${chunk.length} files`);
            } catch (error) {
                console.error(`[R2] Error deleting batch:`, error);
                failedCount += chunk.length;
            }
        }

        return { success: successCount, failed: failedCount };
    } catch (error) {
        console.error('[R2] Error in batch deletion:', error);
        return { success: 0, failed: keys.length };
    }
}
