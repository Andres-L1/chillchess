/**
 * Public R2 Configuration
 * Safe for client-side use
 */

// Hardcoded public domain as found in other parts of the codebase
export const PUBLIC_R2_DOMAIN = 'https://pub-e58e51867b4c44f58a32c407eb8cca7c.r2.dev';

/**
 * Resolves the full URL for an album or track cover.
 *
 * @param key - The R2 key (path) or full URL of the cover.
 * @param fallback - The fallback URL if the key is missing or invalid.
 * @returns The resolved full URL.
 */
export async function resolveCoverUrl(key: string | undefined | null, fallback: string = '/logo-mobile.png'): Promise<string> {
    if (!key) return fallback;

    // If it's already a full URL, return it
    if (key.startsWith('http')) return key;

    // If it's a base64 data URI, return it
    if (key.startsWith('data:')) return key;

    // Remove leading slash if present to avoid double slashes
    const cleanKey = key.startsWith('/') ? key.substring(1) : key;

    return `${PUBLIC_R2_DOMAIN}/${cleanKey}`;
}
