/**
 * Formatting Utilities
 * 
 * Reusable formatters for dates, numbers, time, etc.
 */

// ============================================================================
// DATE & TIME FORMATTERS
// ============================================================================

/**
 * Formats a date to Spanish locale
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options
    };

    return dateObj.toLocaleDateString('es-ES', defaultOptions);
}

/**
 * Formats a date to show time
 */
export function formatDateTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return dateObj.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Formats time ago in human-readable format
 */
export function formatTimeAgo(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    if (diffSec < 60) return 'hace un momento';
    if (diffMin < 60) return `hace ${diffMin} minuto${diffMin > 1 ? 's' : ''}`;
    if (diffHour < 24) return `hace ${diffHour} hora${diffHour > 1 ? 's' : ''}`;
    if (diffDay < 7) return `hace ${diffDay} día${diffDay > 1 ? 's' : ''}`;
    if (diffWeek < 4) return `hace ${diffWeek} semana${diffWeek > 1 ? 's' : ''}`;
    if (diffMonth < 12) return `hace ${diffMonth} mes${diffMonth > 1 ? 'es' : ''}`;
    return `hace ${diffYear} año${diffYear > 1 ? 's' : ''}`;
}

/**
 * Formats duration in seconds to MM:SS
 */
export function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formats duration in seconds to HH:MM:SS
 */
export function formatDurationLong(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============================================================================
// NUMBER FORMATTERS
// ============================================================================

/**
 * Formats a number with thousands separators
 */
export function formatNumber(num: number): string {
    return num.toLocaleString('es-ES');
}

/**
 * Formats a number to a compact representation (1.2K, 3.4M)
 */
export function formatCompactNumber(num: number): string {
    if (num < 1000) return num.toString();
    if (num < 1_000_000) return `${(num / 1000).toFixed(1)}K`;
    if (num < 1_000_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    return `${(num / 1_000_000_000).toFixed(1)}B`;
}

/**
 * Formats bytes to human-readable size
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Formats a percentage
 */
export function formatPercentage(value: number, decimals: number = 0): string {
    return `${(value * 100).toFixed(decimals)}%`;
}

// ============================================================================
// STRING FORMATTERS
// ============================================================================

/**
 * Capitalizes first letter of a string
 */
export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Converts string to title case
 */
export function toTitleCase(str: string): string {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => capitalize(word))
        .join(' ');
}

/**
 * Truncates text and adds ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

/**
 * Removes accents from Spanish text
 */
export function removeAccents(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// ============================================================================
// URL FORMATTERS
// ============================================================================

/**
 * Creates a slug from a string
 */
export function slugify(text: string): string {
    return removeAccents(text)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Extracts domain from URL
 */
export function getDomain(url: string): string {
    try {
        return new URL(url).hostname;
    } catch {
        return url;
    }
}

// ============================================================================
// COLOR FORMATTERS
// ============================================================================

/**
 * Converts hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * Converts RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// ============================================================================
// MUSIC-SPECIFIC FORMATTERS
// ============================================================================

/**
 * Formats track title with artist
 */
export function formatTrackTitle(title: string, artist: string): string {
    return `${title} - ${artist}`;
}

/**
 * Formats album year from date
 */
export function formatAlbumYear(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.getFullYear().toString();
}
