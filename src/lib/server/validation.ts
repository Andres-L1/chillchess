import { APIError } from './errors';

/**
 * Validate and sanitize a file name
 * 
 * @param name - Original file name
 * @param maxLength - Maximum allowed length (default: 255)
 * @returns Sanitized file name
 * @throws APIError if validation fails
 */
export function validateFileName(name: string, maxLength: number = 255): string {
    if (!name || typeof name !== 'string') {
        throw new APIError(400, 'File name is required', 'INVALID_FILE_NAME');
    }

    // Remove leading/trailing whitespace
    const trimmed = name.trim();

    if (trimmed.length === 0) {
        throw new APIError(400, 'File name cannot be empty', 'INVALID_FILE_NAME');
    }

    if (trimmed.length > maxLength) {
        throw new APIError(
            400,
            `File name too long (max ${maxLength} characters)`,
            'FILE_NAME_TOO_LONG'
        );
    }

    // Sanitize: allow alphanumeric, spaces, hyphens, underscores, periods
    // Remove potentially dangerous characters
    const sanitized = trimmed.replace(/[^a-zA-Z0-9\s\-_.]/g, '_');

    // Prevent path traversal
    if (sanitized.includes('..') || sanitized.includes('/') || sanitized.includes('\\')) {
        throw new APIError(400, 'Invalid characters in file name', 'INVALID_FILE_NAME');
    }

    return sanitized;
}

/**
 * Validate and sanitize an artist name
 * 
 * @param name - Artist name
 * @param maxLength - Maximum allowed length (default: 100)
 * @returns Sanitized artist name
 * @throws APIError if validation fails
 */
export function validateArtistName(name: string | undefined, maxLength: number = 100): string {
    if (!name || typeof name !== 'string') {
        throw new APIError(400, 'Artist name is required', 'INVALID_ARTIST_NAME');
    }

    const trimmed = name.trim();

    if (trimmed.length < 2) {
        throw new APIError(
            400,
            'Artist name must be at least 2 characters',
            'ARTIST_NAME_TOO_SHORT'
        );
    }

    if (trimmed.length > maxLength) {
        throw new APIError(
            400,
            `Artist name too long (max ${maxLength} characters)`,
            'ARTIST_NAME_TOO_LONG'
        );
    }

    // Sanitize for use in file paths: alphanumeric, hyphens, underscores only
    const sanitized = trimmed.replace(/[^a-zA-Z0-9\-_]/g, '_');

    if (sanitized.length === 0) {
        throw new APIError(400, 'Artist name contains no valid characters', 'INVALID_ARTIST_NAME');
    }

    return sanitized;
}

/**
 * Validate and sanitize an album title
 * 
 * @param title - Album title
 * @param maxLength - Maximum allowed length (default: 200)
 * @returns Sanitized album title
 * @throws APIError if validation fails
 */
export function validateAlbumTitle(title: string | undefined, maxLength: number = 200): string {
    if (!title || typeof title !== 'string') {
        throw new APIError(400, 'Album title is required', 'INVALID_ALBUM_TITLE');
    }

    const trimmed = title.trim();

    if (trimmed.length < 1) {
        throw new APIError(400, 'Album title cannot be empty', 'INVALID_ALBUM_TITLE');
    }

    if (trimmed.length > maxLength) {
        throw new APIError(
            400,
            `Album title too long (max ${maxLength} characters)`,
            'ALBUM_TITLE_TOO_LONG'
        );
    }

    // Sanitize for use in file paths
    const sanitized = trimmed.replace(/[^a-zA-Z0-9\-_]/g, '_');

    if (sanitized.length === 0) {
        throw new APIError(400, 'Album title contains no valid characters', 'INVALID_ALBUM_TITLE');
    }

    return sanitized;
}

/**
 * Validate file size
 * 
 * @param size - File size in bytes
 * @param maxMB - Maximum allowed size in megabytes
 * @throws APIError if file is too large
 */
export function validateFileSize(size: number, maxMB: number): void {
    if (typeof size !== 'number' || size < 0) {
        throw new APIError(400, 'Invalid file size', 'INVALID_FILE_SIZE');
    }

    const maxBytes = maxMB * 1024 * 1024;

    if (size > maxBytes) {
        throw new APIError(
            413,
            `File too large (max ${maxMB}MB)`,
            'FILE_TOO_LARGE',
            { maxSize: maxMB, actualSize: (size / 1024 / 1024).toFixed(2) }
        );
    }
}

/**
 * Validate an R2 key format
 * 
 * @param key - R2 object key
 * @throws APIError if key is invalid
 */
export function validateR2Key(key: string): void {
    if (!key || typeof key !== 'string') {
        throw new APIError(400, 'R2 key is required', 'INVALID_R2_KEY');
    }

    // Prevent directory traversal
    if (key.includes('..')) {
        throw new APIError(400, 'Invalid R2 key: path traversal detected', 'INVALID_R2_KEY');
    }

    // Key should start with a valid folder
    const validPrefixes = ['submissions/', 'music/', 'catalog/'];
    const hasValidPrefix = validPrefixes.some(prefix => key.startsWith(prefix));

    if (!hasValidPrefix) {
        throw new APIError(
            403,
            'Access denied: invalid R2 key prefix',
            'INVALID_R2_KEY_PREFIX'
        );
    }
}
