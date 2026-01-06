import { json } from '@sveltejs/kit';
import type { NumericRange } from '@sveltejs/kit';
import { AuthError } from './auth';

/**
 * Standard API error response format
 */
export interface APIErrorResponse {
    error: string;
    code?: string;
    details?: Record<string, any>;
}

/**
 * Custom API error class
 */
export class APIError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public code?: string,
        public details?: Record<string, any>
    ) {
        super(message);
        this.name = 'APIError';
    }
}

/**
 * Handle any error and convert to proper JSON response
 * 
 * @param error - Any error object
 * @returns JSON response with appropriate status code
 */
export function handleAPIError(error: unknown): Response {
    // Handle our custom AuthError
    if (error instanceof AuthError) {
        return json(
            {
                error: error.message,
                code: error.code
            } as APIErrorResponse,
            { status: error.statusCode as NumericRange<400, 599> }
        );
    }

    // Handle our custom APIError
    if (error instanceof APIError) {
        return json(
            {
                error: error.message,
                code: error.code,
                details: error.details
            } as APIErrorResponse,
            { status: error.statusCode as NumericRange<400, 599> }
        );
    }

    // Handle standard JavaScript errors
    if (error instanceof Error) {
        console.error('[API Error]:', error);
        return json(
            {
                error: error.message || 'Internal server error',
                code: 'INTERNAL_ERROR'
            } as APIErrorResponse,
            { status: 500 }
        );
    }

    // Handle unknown error types
    console.error('[Unknown Error]:', error);
    return json(
        {
            error: 'An unexpected error occurred',
            code: 'UNKNOWN_ERROR'
        } as APIErrorResponse,
        { status: 500 }
    );
}

/**
 * Log a security event for audit purposes
 * In production, this should write to a proper logging service
 * 
 * @param event - Event name
 * @param details - Event details
 */
export function logSecurityEvent(event: string, details: Record<string, any>): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        event,
        ...details
    };

    // For now, just console.log with a clear prefix
    // TODO: Replace with proper logging service (e.g., Cloud Logging, Sentry)
    console.log(`[SECURITY] ${JSON.stringify(logEntry)}`);
}

/**
 * Log an audit trail event
 * These are important actions that should be tracked for compliance
 * 
 * @param action - Action performed
 * @param userId - User who performed the action
 * @param targetId - Target resource ID (optional)
 * @param details - Additional details (optional)
 */
export function logAudit(params: {
    action: string;
    userId: string;
    targetId?: string;
    details?: Record<string, any>;
}): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        type: 'audit',
        ...params
    };

    // For now, just console.log with clear prefix
    // TODO: Write to Firestore audit_logs collection or external service
    console.log(`[AUDIT] ${JSON.stringify(logEntry)}`);
}
