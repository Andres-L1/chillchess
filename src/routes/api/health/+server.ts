import { json } from '@sveltejs/kit';
import { db } from '$lib/firebase'; // Client SDK, but works for basic check if initialized on server or we use admin
import { S3Client, ListObjectsCommand } from '@aws-sdk/client-s3';
// @ts-ignore
import { R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME } from '$env/static/private';
// @ts-ignore
import { PUBLIC_R2_ACCOUNT_ID } from '$env/static/public';
import { getDocs, collection, limit, query } from 'firebase/firestore';

export async function GET() {
    const status = {
        firebase: 'unknown',
        r2: 'unknown',
        timestamp: Date.now()
    };

    // 1. Check Firebase
    try {
        const q = query(collection(db, 'albums'), limit(1));
        await getDocs(q);
        status.firebase = 'connected';
    } catch (e) {
        console.error('Firebase Health Check Failed:', e);
        status.firebase = 'disconnected';
    }

    // 2. Check Cloudflare R2 (Check specific bucket access instead of account-wide list)
    try {
        const R2 = new S3Client({
            region: 'auto',
            endpoint: `https://${PUBLIC_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: R2_ACCESS_KEY_ID,
                secretAccessKey: R2_SECRET_ACCESS_KEY,
            },
        });

        // Use ListObjectsV2 on the specific bucket which is more likely to be allowed
        const command = new ListObjectsCommand({
            Bucket: R2_BUCKET_NAME,
            MaxKeys: 1
        });

        await R2.send(command);
        status.r2 = 'connected';
    } catch (e) {
        console.error('R2 Health Check Failed:', e);
        status.r2 = 'disconnected';
    }

    return json(status);
}
