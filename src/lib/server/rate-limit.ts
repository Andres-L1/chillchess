import { APIError } from './errors';

/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or a dedicated rate limiting service
 */
export class RateLimiter {
    private attempts: Map<string, number[]> = new Map();

    /**
     * Check if a request should be rate limited
     * 
     * @param key - Unique identifier for this limit (e.g., userId, IP address)
     * @param maxRequests - Maximum number of requests allowed in the window
     * @param windowMs - Time window in milliseconds
     * @returns true if request is allowed, false if rate limited
     */
    check(key: string, maxRequests: number, windowMs: number): boolean {
        const now = Date.now();
        const userAttempts = this.attempts.get(key) || [];

        // Filter out attempts outside the current window
        const recentAttempts = userAttempts.filter(
            timestamp => now - timestamp < windowMs
        );

        // Check if limit exceeded
        if (recentAttempts.length >= maxRequests) {
            return false;
        }

        // Add current attempt
        recentAttempts.push(now);
        this.attempts.set(key, recentAttempts);

        return true;
    }

    /**
     * Enforce rate limit, throwing an error if exceeded
     * 
     * @param key - Unique identifier for this limit
     * @param maxRequests - Maximum number of requests allowed in the window
     * @param windowMs - Time window in milliseconds
     * @throws APIError with 429 status if rate limit exceeded
     */
    enforce(key: string, maxRequests: number, windowMs: number): void {
        if (!this.check(key, maxRequests, windowMs)) {
            const windowSeconds = Math.floor(windowMs / 1000);
            throw new APIError(
                429,
                `Rate limit exceeded. Please wait before trying again.`,
                'RATE_LIMIT_EXCEEDED',
                {
                    maxRequests,
                    windowSeconds,
                    retryAfter: Math.ceil(windowMs / 1000)
                }
            );
        }
    }

    /**
     * Clean up old entries to prevent memory leaks
     * Call this periodically (e.g., every hour)
     */
    cleanup(): void {
        const now = Date.now();
        const maxAge = 60 * 60 * 1000; // 1 hour

        for (const [key, attempts] of this.attempts.entries()) {
            const recent = attempts.filter(timestamp => now - timestamp < maxAge);
            if (recent.length === 0) {
                this.attempts.delete(key);
            } else {
                this.attempts.set(key, recent);
            }
        }
    }
}

// Global rate limiter instance
export const globalLimiter = new RateLimiter();

// Clean up every hour
if (typeof setInterval !== 'undefined') {
    setInterval(() => globalLimiter.cleanup(), 60 * 60 * 1000);
}
