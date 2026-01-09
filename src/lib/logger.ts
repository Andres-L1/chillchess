/**
 * Centralized Logging System for ChillChess
 * 
 * This module provides a unified logging interface that sends error logs
 * to Firestore for admin monitoring and debugging.
 */

import { db } from '$lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { browser } from '$app/environment';
import { get } from 'svelte/store';
import { userStore } from '$lib/auth/userStore';

export type LogLevel = 'info' | 'warn' | 'error' | 'success';

interface LogEntry {
    level: LogLevel;
    message: string;
    details?: any;
    timestamp: any; // Firestore serverTimestamp
    userId?: string;
    userEmail?: string;
    url?: string;
    userAgent?: string;
}

/**
 * Send log to Firestore for admin monitoring
 */
async function sendToFirestore(level: LogLevel, message: string, details?: any) {
    if (!browser || !db) return;

    try {
        const user = get(userStore)?.user;

        const logEntry: LogEntry = {
            level,
            message,
            details: details || null,
            timestamp: serverTimestamp(),
            userId: user?.uid || 'anonymous',
            userEmail: user?.email || undefined,
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        // Add to system_logs collection for admin monitoring
        await addDoc(collection(db, 'system_logs'), logEntry);
    } catch (err) {
        // Fallback to console if Firestore fails
        console.error('[Logger] Failed to send log to Firestore:', err);
    }
}

/**
 * Log an informational message
 */
export function logInfo(message: string, details?: any) {
    console.log(`[INFO] ${message}`, details || '');
    // Optional: Only send important info to Firestore
    // sendToFirestore('info', message, details);
}

/**
 * Log a warning
 */
export function logWarn(message: string, details?: any) {
    console.warn(`[WARN] ${message}`, details || '');
    sendToFirestore('warn', message, details);
}

/**
 * Log an error (ALWAYS sent to Firestore)
 */
export function logError(message: string, error?: any) {
    console.error(`[ERROR] ${message}`, error || '');

    // Extract useful error information
    const errorDetails: any = {};

    if (error instanceof Error) {
        errorDetails.name = error.name;
        errorDetails.message = error.message;
        errorDetails.stack = error.stack;
    } else if (error) {
        errorDetails.raw = JSON.stringify(error, null, 2);
    }

    sendToFirestore('error', message, errorDetails);
}

/**
 * Log a success message
 */
export function logSuccess(message: string, details?: any) {
    console.log(`[SUCCESS] ${message}`, details || '');
    // Optional: Track important successes
    // sendToFirestore('success', message, details);
}

/**
 * Track audio playback errors specifically
 */
export function logAudioError(message: string, trackInfo: any, mediaError?: MediaError) {
    const details = {
        trackInfo,
        mediaError: mediaError ? {
            code: mediaError.code,
            message: mediaError.message,
            MEDIA_ERR_ABORTED: mediaError.MEDIA_ERR_ABORTED,
            MEDIA_ERR_NETWORK: mediaError.MEDIA_ERR_NETWORK,
            MEDIA_ERR_DECODE: mediaError.MEDIA_ERR_DECODE,
            MEDIA_ERR_SRC_NOT_SUPPORTED: mediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
        } : null
    };

    logError(message, details);
}

/**
 * Track R2 resolution errors
 */
export function logR2Error(message: string, key: string, error?: any) {
    const details = {
        r2Key: key,
        error: error instanceof Error ? {
            name: error.name,
            message: error.message
        } : error
    };

    logError(message, details);
}

/**
 * Track upload errors
 */
export function logUploadError(message: string, fileInfo: any, error?: any) {
    const details = {
        fileInfo,
        error: error instanceof Error ? {
            name: error.name,
            message: error.message
        } : error
    };

    logError(message, details);
}

// Global error handler to catch unhandled errors
if (browser) {
    window.addEventListener('error', (event) => {
        logError('Unhandled Error', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error
        });
    });

    window.addEventListener('unhandledrejection', (event) => {
        logError('Unhandled Promise Rejection', {
            reason: event.reason
        });
    });
}
