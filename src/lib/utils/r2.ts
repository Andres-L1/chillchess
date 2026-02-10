/**
 * R2 Storage utilities for ChillChess
 * Handles R2 URL resolution and caching
 */

import { devLogger } from './devLogger';

const DEFAULT_FALLBACK = '/logo-mobile.png';
const URL_CACHE_TTL = 55 * 60 * 1000; // 55 minutes (R2 URLs expire in 1 hour)

// Simple in-memory cache for R2 URLs
const urlCache = new Map<string, { url: string; expires: number }>();

/**
 * Check if a string is an R2 key (not a full URL)
 */
export function isR2Key(str: string | undefined): boolean {
    if (!str) return false;

    // R2 keys typically start with these prefixes or don't contain '/'
    return (
        str.startsWith('music/') ||
        str.startsWith('catalog/') ||
        str.startsWith('submissions/') ||
        str.startsWith('covers/') ||
        !str.includes('/')
    );
}

/**
 * Resolve an R2 key to a signed URL
 * Uses caching to minimize API calls
 */
export async function resolveR2Url(
    r2Key: string,
    cacheKey?: string
): Promise<string | null> {
    if (!r2Key) return null;

    // Check cache first
    const key = cacheKey || r2Key;
    const cached = urlCache.get(key);
    if (cached && cached.expires > Date.now()) {
        devLogger.debug('Using cached R2 URL', { r2Key });
        return cached.url;
    }

    devLogger.debug('Fetching signed URL for R2 key', { r2Key });

    try {
        const res = await fetch('/api/r2/get-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: r2Key }),
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch R2 URL: ${res.status}`);
        }

        const { url } = await res.json();

        if (url) {
            // Cache the URL
            urlCache.set(key, {
                url,
                expires: Date.now() + URL_CACHE_TTL,
            });

            devLogger.debug('R2 URL resolved successfully', { r2Key });
            return url;
        }

        return null;
    } catch (error) {
        devLogger.error('Failed to resolve R2 URL', { r2Key, error });
        return null;
    }
}

/**
 * Resolve a cover image (either R2 key or direct URL)
 * Returns the resolved URL or fallback
 */
export async function resolveCoverUrl(
    coverKey: string | undefined,
    fallback: string = DEFAULT_FALLBACK
): Promise<string> {
    if (!coverKey) return fallback;

    // If it's already a full URL, return it
    if (!isR2Key(coverKey)) {
        return coverKey;
    }

    // It's an R2 key, resolve it
    const url = await resolveR2Url(coverKey);
    return url || fallback;
}

/**
 * Prefetch an R2 URL and cache it for later use
 * Useful for preloading next track or album art
 */
export async function prefetchR2Url(
    r2Key: string,
    cacheKey?: string
): Promise<void> {
    if (!r2Key) return;

    const key = cacheKey || r2Key;

    // Don't prefetch if already cached
    const cached = urlCache.get(key);
    if (cached && cached.expires > Date.now()) {
        return;
    }

    // Resolve and cache (ignore result)
    await resolveR2Url(r2Key, cacheKey);
}

/**
 * Clear the R2 URL cache
 * Useful for testing or when URLs might have changed
 */
export function clearR2Cache(): void {
    urlCache.clear();
    devLogger.debug('R2 URL cache cleared');
}

/**
 * Get cache statistics (for debugging)
 */
export function getR2CacheStats(): { size: number; keys: string[] } {
    return {
        size: urlCache.size,
        keys: Array.from(urlCache.keys()),
    };
}
