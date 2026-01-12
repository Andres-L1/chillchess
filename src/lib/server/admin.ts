// import admin from 'firebase-admin';
// @ts-ignore: SvelteKit dynamic env module resolution
import { env } from '$env/dynamic/private';

// FIREBASE ADMIN IS NOT SUPPORTED ON CLOUDFLARE WORKERS
// We have temporarily disabled it to allow the site to deploy.
// TODO: Replace with REST API implementation for Edge.

/*
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
*/

// Export null to prevent crashes, hooks.server.ts handles this gracefully
export const adminAuth = null; // admin.apps.length ? admin.auth() : null;
export const adminDB = null; // admin.apps.length ? admin.firestore() : null;
