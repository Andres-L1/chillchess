import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { adminDB } from '$lib/server/admin';
import { requireAuth } from '$lib/server/auth';

/**
 * Endpoint for client-side logging (System & Audit)
 * Secures logging by validating user server-side and using admin SDK
 */
export async function POST({ request, locals }: RequestEvent) {
    if (!adminDB) {
        return json({ error: 'Database not initialized' }, { status: 500 });
    }

    try {
        const payload = await request.json();
        const { level, message, details, action, targetId } = payload;

        // Optional: Require auth for audit logs, or for all logs
        // For audit logs, we DEFINITELY want to know who did it
        let user;
        try {
            user = requireAuth(locals);
        } catch (e) {
            // Allow anonymous system logs (errors), but not audit
            if (level === 'audit') {
                return json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        if (level === 'audit') {
            if (!user) return json({ error: 'Unauthorized' }, { status: 401 });

            // Write to audit_logs
            await adminDB.collection('audit_logs').add({
                action,
                adminId: user.uid, // The user performing the action
                details,
                targetId,
                timestamp: new Date(),
                source: 'client_api'
            });
        } else {
            // Write to system_logs
            await adminDB.collection('system_logs').add({
                level: level || 'info',
                message,
                details,
                userId: user ? user.uid : 'anonymous',
                timestamp: new Date(),
                source: 'client_api',
                userAgent: request.headers.get('user-agent') || 'unknown'
            });
        }

        return json({ success: true });
    } catch (err: any) {
        console.error('Log API error:', err);
        return json({ error: err.message }, { status: 500 });
    }
}
