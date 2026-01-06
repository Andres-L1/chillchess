import { db } from '$lib/firebase'; // Ensure this points to a server-side initialized firebase admin or client? 
// Actually, for $lib/server we usually use firebase-admin if available, or the client SDK if verified. 
// Given the existing codebase uses client SDK in many places, verify if we have admin SDK.
// Checking previous files... `src/lib/server/admin.ts` likely has admin SDK.
// Let's use the client SDK for now as it seems to be the standard in this project, 
// BUT this is server-side code. Ideally we should use `firebase-admin`.
// However, looking at `src/lib/firebase.ts`, it seems to be client SDK.
// Let's stick to standard Firestore import for now, but creating a dedicated server-safe write.

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export type AuditAction =
    | 'submission_approved'
    | 'submission_rejected'
    | 'album_deleted'
    | 'user_banned'
    | 'user_verified'
    | 'system_config_change'
    | 'r2_cleanup'
    | 'manual_intervention'
    | string; // Allow dynamic actions from existing code

interface AuditLogParams {
    action: AuditAction;
    adminId: string;
    details: Record<string, any>;
    targetId?: string; // ID of the object being acted upon (user, album, etc)
    ip?: string;
}

export async function logAudit(params: AuditLogParams) {
    try {
        await addDoc(collection(db, 'audit_logs'), {
            ...params,
            timestamp: serverTimestamp(),
            source: 'server',
        });
    } catch (e) {
        console.error('Failed to write audit log:', e);
        // Don't throw, we don't want to break the main action if logging fails
    }
}

export async function logSystem(params: {
    event: string;
    level: 'info' | 'warn' | 'error' | 'security';
    details: Record<string, any>;
    userId?: string;
}) {
    try {
        await addDoc(collection(db, 'system_logs'), {
            ...params,
            timestamp: serverTimestamp(),
            source: 'server',
        });
    } catch (e) {
        console.error('Failed to write system log:', e);
    }
}
