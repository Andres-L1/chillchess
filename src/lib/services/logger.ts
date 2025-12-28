import { db } from '$lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export enum LogLevel {
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error'
}

export const logger = {
    async log(level: LogLevel, message: string, details?: any, userId?: string) {
        // Only run in browser
        if (typeof window === 'undefined') return;

        try {
            await addDoc(collection(db, 'system_logs'), {
                level,
                message,
                details: details ? JSON.stringify(details, Object.getOwnPropertyNames(details)) : null,
                userId: userId || null,
                timestamp: serverTimestamp(),
                url: window.location.href,
                userAgent: navigator.userAgent
            });

            // Also log to console for development
            const style = level === LogLevel.ERROR ? 'color: red' : level === LogLevel.WARN ? 'color: orange' : 'color: cyan';
            console.log(`%c[${level.toUpperCase()}] ${message}`, style, details || '');

        } catch (e) {
            console.error('Failed to log to Firestore:', e);
        }
    },

    info(message: string, details?: any, userId?: string) {
        this.log(LogLevel.INFO, message, details, userId);
    },

    warn(message: string, details?: any, userId?: string) {
        this.log(LogLevel.WARN, message, details, userId);
    },

    error(message: string, details?: any, userId?: string) {
        this.log(LogLevel.ERROR, message, details, userId);
    }
};
