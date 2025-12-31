/**
 * Centralized Logging System
 * 
 * Usage:
 * ```ts
 * import { logger } from '$lib/utils/logger';
 * 
 * logger.info('User logged in', { userId: 123 });
 * logger.error('Failed to load data', { error });
 * logger.debug('Component mounted', { componentName: 'MyComponent' });
 * ```
 */

import { dev } from '$app/environment';

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    NONE = 4
}

interface LogContext {
    [key: string]: any;
}

interface LogEntry {
    level: LogLevel;
    message: string;
    context?: LogContext;
    timestamp: string;
    stack?: string;
}

class Logger {
    private minLevel: LogLevel;
    private logs: LogEntry[] = [];
    private maxLogsInMemory = 100;

    constructor() {
        // In dev mode, show all logs. In prod, only WARN and ERROR
        this.minLevel = dev ? LogLevel.DEBUG : LogLevel.WARN;
    }

    /**
     * Debug level logging (only in dev)
     */
    debug(message: string, context?: LogContext): void {
        this.log(LogLevel.DEBUG, message, context);
    }

    /**
     * Info level logging
     */
    info(message: string, context?: LogContext): void {
        this.log(LogLevel.INFO, message, context);
    }

    /**
     * Warning level logging
     */
    warn(message: string, context?: LogContext): void {
        this.log(LogLevel.WARN, message, context);
    }

    /**
     * Error level logging
     */
    error(message: string, error?: Error | unknown, context?: LogContext): void {
        const errorContext = {
            ...context,
            error: error instanceof Error ? {
                name: error.name,
                message: error.message,
                stack: error.stack
            } : error
        };

        this.log(LogLevel.ERROR, message, errorContext, error instanceof Error ? error.stack : undefined);
    }

    /**
     * Internal logging method
     */
    private log(level: LogLevel, message: string, context?: LogContext, stack?: string): void {
        if (level < this.minLevel) return;

        const entry: LogEntry = {
            level,
            message,
            context,
            timestamp: new Date().toISOString(),
            stack
        };

        // Store in memory (circular buffer)
        this.logs.push(entry);
        if (this.logs.length > this.maxLogsInMemory) {
            this.logs.shift();
        }

        // Console output with colors (dev only)
        if (dev) {
            this.consoleLog(entry);
        } else {
            // In production, only log errors to console
            if (level >= LogLevel.ERROR) {
                console.error(`[${entry.timestamp}] ${message}`, context);
            }
        }

        // TODO: Send critical errors to external service (Sentry, LogRocket, etc.)
        if (level === LogLevel.ERROR && !dev) {
            this.sendToExternalService(entry);
        }
    }

    /**
     * Pretty console logging for development
     */
    private consoleLog(entry: LogEntry): void {
        const colors = {
            [LogLevel.DEBUG]: 'color: #9CA3AF',
            [LogLevel.INFO]: 'color: #3B82F6',
            [LogLevel.WARN]: 'color: #F59E0B',
            [LogLevel.ERROR]: 'color: #EF4444; font-weight: bold'
        };

        const labels = {
            [LogLevel.DEBUG]: '🔍 DEBUG',
            [LogLevel.INFO]: 'ℹ️  INFO',
            [LogLevel.WARN]: '⚠️  WARN',
            [LogLevel.ERROR]: '❌ ERROR'
        };

        console.log(
            `%c[${entry.timestamp}] ${labels[entry.level]} ${entry.message}`,
            colors[entry.level],
            entry.context || ''
        );

        if (entry.stack) {
            console.log('%c' + entry.stack, 'color: #6B7280; font-size: 0.85em');
        }
    }

    /**
     * Send critical logs to external monitoring service
     */
    private sendToExternalService(entry: LogEntry): void {
        // TODO: Integrate with Sentry, LogRocket, or custom backend
        // Example:
        // fetch('/api/logs', {
        //     method: 'POST',
        //     body: JSON.stringify(entry)
        // }).catch(() => {});
    }

    /**
     * Get recent logs (for debugging UI)
     */
    getRecentLogs(count: number = 50): LogEntry[] {
        return this.logs.slice(-count);
    }

    /**
     * Clear all logs from memory
     */
    clearLogs(): void {
        this.logs = [];
    }

    /**
     * Set minimum log level
     */
    setMinLevel(level: LogLevel): void {
        this.minLevel = level;
    }

    /**
     * Export logs as JSON (for debugging)
     */
    exportLogs(): string {
        return JSON.stringify(this.logs, null, 2);
    }
}

// Export singleton instance
export const logger = new Logger();

// Export context-specific loggers
export const createContextLogger = (context: string) => ({
    debug: (message: string, extra?: LogContext) =>
        logger.debug(`[${context}] ${message}`, extra),
    info: (message: string, extra?: LogContext) =>
        logger.info(`[${context}] ${message}`, extra),
    warn: (message: string, extra?: LogContext) =>
        logger.warn(`[${context}] ${message}`, extra),
    error: (message: string, error?: Error | unknown, extra?: LogContext) =>
        logger.error(`[${context}] ${message}`, error, extra)
});
