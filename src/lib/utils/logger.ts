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
        try {
            // Use server-side API for logging to avoid permission issues
            await fetch('/api/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params)
            });
        } catch (e) {
            console.error('Logger failed (API):', e);
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
            await fetch('/api/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    level: 'audit',
                    action,
                    adminId,
                    details,
                    targetId
                })
            });
        } catch (e) {
            console.error('Audit log failed (API):', e);
        }
    }
}

export const logger = new Logger();
