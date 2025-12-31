import admin from 'firebase-admin';
import { env } from '$env/dynamic/private';

// Initialize Firebase Admin
// Wrap in try-catch to avoid crashing if env vars are missing during build
try {
    if (!admin.apps.length) {
        const projectId = env.FB_PROJECT_ID;
        const clientEmail = env.FB_CLIENT_EMAIL;
        const privateKey = env.FB_PRIVATE_KEY?.replace(/\\n/g, '\n');

        if (projectId && clientEmail && privateKey) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
            });
            console.log('[Firebase Admin] Initialized successfully');
        } else {
            console.warn('[Firebase Admin] Skipping init: Missing env vars');
        }
    }
} catch (err) {
    console.error('[Firebase Admin] Init failed:', err);
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminDB = admin.apps.length ? admin.firestore() : null;
