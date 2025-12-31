import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { adminAuth } from '$lib/server/admin';

// POST: Create Session Cookie
export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
        const { idToken } = await request.json();

        if (!idToken) {
            return json({ error: 'Missing ID Token' }, { status: 400 });
        }

        if (!adminAuth) {
            console.error('Firebase Admin not initialized');
            return json({ error: 'Server configuration error' }, { status: 500 });
        }

        // Verify the ID token first
        // Create session cookie (expires in 5 days)
        const expiresIn = 60 * 60 * 24 * 5 * 1000;
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

        // Set cookie
        cookies.set('session', sessionCookie, {
            maxAge: expiresIn / 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'lax'
        });

        return json({ status: 'success' });

    } catch (error) {
        console.error('Session creation failed:', error);
        return json({ error: 'Unauthorized' }, { status: 401 });
    }
};

// DELETE: Sign Out
export const DELETE: RequestHandler = async ({ cookies }) => {
    cookies.delete('session', { path: '/' });
    return json({ status: 'signed_out' });
};
