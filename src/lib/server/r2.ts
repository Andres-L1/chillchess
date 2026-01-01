import { S3Client } from "@aws-sdk/client-s3";
// @ts-ignore
import { env } from "$env/dynamic/private";
// @ts-ignore
import { env as publicEnv } from "$env/dynamic/public";

// Fallback logic adjusted to check publicEnv for PUBLIC_ prefixed vars
const R2_ACCOUNT_ID = publicEnv.PUBLIC_R2_ACCOUNT_ID || env.PUBLIC_R2_ACCOUNT_ID || process.env.PUBLIC_R2_ACCOUNT_ID;
const ACCESS_KEY_ID = env.R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = env.R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY;

if (!R2_ACCOUNT_ID || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
    console.warn("⚠️ R2 credentials missing. File uploads will fail.");
}

export const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: ACCESS_KEY_ID || "",
        secretAccessKey: SECRET_ACCESS_KEY || "",
    },
    forcePathStyle: true, // Crucial for Cloudflare R2 to avoid DNS/CORS issues with bucket subdomains
});

// Force the correct bucket name to match Cloudflare R2 dashboard
// This overrides any potentially incorrect environment variables in Netlify
export const R2_BUCKET = "chillchess-music";
