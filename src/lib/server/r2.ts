import { S3Client } from "@aws-sdk/client-s3";
import { env } from "$env/dynamic/private";

// Fallback to process.env if $env/dynamic/private is not populated (e.g. locally with .env)
const R2_ACCOUNT_ID = env.PUBLIC_R2_ACCOUNT_ID || process.env.PUBLIC_R2_ACCOUNT_ID;
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
});

export const R2_BUCKET = env.R2_BUCKET_NAME || process.env.R2_BUCKET_NAME || "chillchess-music";
