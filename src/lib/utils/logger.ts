import { db } from '$lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export type LogLevel = 'info' | 'warn' | 'error' | 'audit';

interface LogParams {
    message: string;
    level: LogLevel;
    details?: Record<string, any>;
    userId?: string; // Admin ID
}

class Logger {
    async log(params: LogParams) {
        const collectionName = params.level === 'audit' ? 'audit_logs' : 'system_logs';

        try {
            await addDoc(collection(db, collectionName), {
                ...params,
                timestamp: serverTimestamp(),
                source: 'client',
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
                url: typeof window !== 'undefined' ? window.location.href : 'server',
            });
        } catch (e) {
            console.error('Logger failed:', e);
        }
    }

    info(message: string, details?: any) {
        this.log({ message, level: 'info', details });
    }

    warn(message: string, details?: any) {
        this.log({ message, level: 'warn', details });
    }

    error(message: string, details?: any) {
        this.log({ message, level: 'error', details });
    }

    // Explicit audit action from client console/UI
    async audit(action: string, adminId: string, details: any, targetId?: string) {
        try {
            await addDoc(collection(db, 'audit_logs'), {
                action,
                adminId,
                details,
                targetId,
                timestamp: serverTimestamp(),
                source: 'client_admin_panel'
            });
        } catch (e) {
            console.error('Audit log failed:', e);
        }
    }
}

export const logger = new Logger();
