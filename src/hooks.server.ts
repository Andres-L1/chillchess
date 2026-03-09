import { adminAuth } from '$lib/server/admin';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    event.locals.user = null; // Default to null

    // 1. Try Session Cookie (Server-side rendered pages)
    const sessionCookie = event.cookies.get('session');

    // 2. Try Authorization Header (API calls from Client)
    const authHeader = event.request.headers.get('Authorization');

    try {
        if (sessionCookie && adminAuth) {
            // Verify Session Cookie
            const claims = await adminAuth.verifySessionCookie(sessionCookie, true);
            event.locals.user = {
                uid: claims.uid,
                email: claims.email,
                isAdmin: claims.admin === true || claims.role === 'admin'
            };
        } else if (authHeader && authHeader.startsWith('Bearer ') && adminAuth) {
            // Verify ID Token (Standard Firebase Client Token)
            const token = authHeader.split('Bearer ')[1];
            const claims = await adminAuth.verifyIdToken(token);
            event.locals.user = {
                uid: claims.uid,
                email: claims.email,
                isAdmin: claims.admin === true || claims.role === 'admin'
            };
        }
    } catch (e) {
        // Invalid session/token, user remains null
        // console.debug('Auth verification failed:', e);
    }

    const response = await resolve(event);

    // Determine path for specific header overrides
    const isWidget = event.url.pathname.startsWith('/widgets/');

    // SECURITY: Add security headers to all responses
    if (!isWidget) {
        response.headers.set('X-Frame-Options', 'DENY');
    } else {
        // Explicitly allow framing for widgets (needed for OBS)
        response.headers.delete('X-Frame-Options');
    }
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    return response;
};
