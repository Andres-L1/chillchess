/**
 * Development logger utility for ChillChess
 * Automatically filters debug logs in production
 */

interface LogContext {
    [key: string]: any;
}

class DevLogger {
    private isDev: boolean;

    constructor() {
        this.isDev = import.meta.env.DEV;
    }

    /**
     * Debug logs - only shown in development
     */
    debug(message: string, context?: LogContext): void {
        if (this.isDev) {
            if (context) {
                console.log(`🔍 ${message}`, context);
            } else {
                console.log(`🔍 ${message}`);
            }
        }
    }

    /**
     * Info logs - shown in all environments
     */
    info(message: string, context?: LogContext): void {
        if (context) {
            console.info(`ℹ️ ${message}`, context);
        } else {
            console.info(`ℹ️ ${message}`);
        }
    }

    /**
     * Warning logs - shown in all environments
     */
    warn(message: string, context?: LogContext): void {
        if (context) {
            console.warn(`⚠️ ${message}`, context);
        } else {
            console.warn(`⚠️ ${message}`);
        }
    }

    /**
     * Error logs - shown in all environments
     */
    error(message: string, context?: LogContext): void {
        if (context) {
            console.error(`❌ ${message}`, context);
        } else {
            console.error(`❌ ${message}`);
        }
    }

    /**
     * Group logs together (development only)
     */
    group(label: string, callback: () => void): void {
        if (this.isDev) {
            console.group(label);
            callback();
            console.groupEnd();
        } else {
            callback();
        }
    }

    /**
     * Time a function execution (development only)
     */
    time(label: string): void {
        if (this.isDev) {
            console.time(label);
        }
    }

    timeEnd(label: string): void {
        if (this.isDev) {
            console.timeEnd(label);
        }
    }
}

export const devLogger = new DevLogger();
