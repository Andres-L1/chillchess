import { adminDB } from '$lib/server/admin';
import { FieldValue } from 'firebase-admin/firestore';

export type AuditAction =
    | 'user_banned'
    | 'user_verified'
    | 'system_config_change'
    | 'manual_intervention'
    | string; // Allow dynamic actions

interface AuditLogParams {
    action: AuditAction;
    adminId: string;
    details: Record<string, any>;
    targetId?: string;
    ip?: string;
}

export async function logAudit(params: AuditLogParams) {
    try {
        if (!adminDB) {
            console.warn('Admin DB not initialized, skipping audit log');
            return;
        }
        await adminDB.collection('audit_logs').add({
            ...params,
            timestamp: FieldValue.serverTimestamp(),
            source: 'server',
        });
    } catch (e) {
        console.error('Failed to write audit log:', e);
    }
}

export async function logSystem(params: {
    event: string;
    level: 'info' | 'warn' | 'error' | 'security';
    details: Record<string, any>;
    userId?: string;
}) {
    try {
        if (!adminDB) {
            console.warn('Admin DB not initialized, skipping system log');
            return;
        }
        await adminDB.collection('system_logs').add({
            ...params,
            timestamp: FieldValue.serverTimestamp(),
            source: 'server',
        });
    } catch (e) {
        console.error('Failed to write system log:', e);
    }
}
