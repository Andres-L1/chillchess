import { S3Client } from "@aws-sdk/client-s3";
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
