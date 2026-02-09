import admin from 'firebase-admin';
// @ts-ignore: SvelteKit dynamic env module resolution
import { env } from '$env/dynamic/private';

// Initialize Firebase Admin
// Wrap in try-catch to avoid crashing if env vars are missing during build
try {
    if (!admin.apps.length) {
        // Try to use FIREBASE_SERVICE_ACCOUNT_KEY (JSON) first
        if (env.FIREBASE_SERVICE_ACCOUNT_KEY && env.FIREBASE_PROJECT_ID) {
            const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_KEY);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: env.FIREBASE_PROJECT_ID,
            });
            console.log('[Firebase Admin] Initialized with service account JSON');
        }
        // Fallback to individual env vars (for local development)
        else if (env.FB_PROJECT_ID && env.FB_CLIENT_EMAIL && env.FB_PRIVATE_KEY) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: env.FB_PROJECT_ID,
                    clientEmail: env.FB_CLIENT_EMAIL,
                    privateKey: env.FB_PRIVATE_KEY.replace(/\\n/g, '\n'),
                }),
            });
            console.log('[Firebase Admin] Initialized with individual env vars');
        } else {
            console.warn('[Firebase Admin] Skipping init: Missing required env vars');
            console.warn('Expected: FIREBASE_SERVICE_ACCOUNT_KEY + FIREBASE_PROJECT_ID');
            console.warn('Or: FB_PROJECT_ID + FB_CLIENT_EMAIL + FB_PRIVATE_KEY');
        }
    }
} catch (err) {
    console.error('[Firebase Admin] Init failed:', err);
}

// Export Admin SDK instances
export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminDB = admin.apps.length ? admin.firestore() : null;
