import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { adminDB } from './admin';

/**
 * User object returned by authentication
 */
export interface AuthenticatedUser {
    uid: string;
    email: string | null;
    isAdmin: boolean;
}

/**
 * Custom error class for authentication/authorization errors
 */
export class AuthError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public code?: string
    ) {
        super(message);
        this.name = 'AuthError';
    }
}

/**
 * Require that the user is authenticated
 * Throws 401 error if not authenticated
 * 
 * @param locals - SvelteKit locals object from RequestEvent
 * @returns Authenticated user object
 * @throws AuthError with 401 status if not authenticated
 */
export function requireAuth(locals: App.Locals): AuthenticatedUser {
    if (!locals.user) {
        throw new AuthError(401, 'Authentication required', 'AUTH_REQUIRED');
    }

    // Ensure email is null instead of undefined to match AuthenticatedUser type
    return {
        uid: locals.user.uid,
        email: locals.user.email ?? null,
        isAdmin: locals.user.isAdmin
    };
}

/**
 * Require that the user is authenticated AND has admin privileges
 * Checks both custom claims and Firestore for admin status
 * Throws 401 if not authenticated, 403 if not admin
 * 
 * @param locals - SvelteKit locals object from RequestEvent
 * @returns Authenticated admin user object
 * @throws AuthError with 401/403 status if not authenticated or not admin
 */
export async function requireAdmin(locals: App.Locals): Promise<AuthenticatedUser> {
    // First check if user is authenticated
    const user = requireAuth(locals);

    // Check if isAdmin flag is set (from hooks.server.ts)
    let isAdmin = user.isAdmin;

    // Fallback: Check Firestore if adminDB is available and initial check failed
    if (!isAdmin && adminDB) {
        try {
            const userDoc = await adminDB.collection('users').doc(user.uid).get();
            if (userDoc.exists && userDoc.data()?.isAdmin === true) {
                isAdmin = true;
            }
        } catch (e) {
            console.error('[requireAdmin] Firestore check failed:', e);
            // Don't throw here, just proceed with existing isAdmin value
        }
    }

    if (!isAdmin) {
        throw new AuthError(403, 'Admin privileges required', 'ADMIN_REQUIRED');
    }

    return { ...user, isAdmin: true };
}

/**
 * Check if a user has permission to access a specific R2 resource
 * 
 * @param user - Authenticated user
 * @param key - R2 object key
 * @returns true if user has access, false otherwise
 */
export function canAccessR2Resource(user: AuthenticatedUser, key: string): boolean {
    // Admins can access everything
    if (user.isAdmin) {
        return true;
    }

    // Users can access music folder (public content)
    if (key.startsWith('music/')) {
        return true;
    }

    // Users can only access their own submissions
    if (key.startsWith('submissions/')) {
        // Format is: submissions/{userId}/...
        const parts = key.split('/');
        if (parts.length >= 2 && parts[1] === user.uid) {
            return true;
        }
        return false;
    }

    // Deny access to any other folders
    return false;
}
