/**
 * Utilities Index
 * 
 * Central export point for all utility functions.
 * Import from here instead of individual files for cleaner imports.
 * 
 * Example:
 * ```ts
 * import { logger, formatDate } from '$lib/utils';
 * ```
 */

// Logger
export { logger } from './logger';
export type { LogLevel } from './logger';

// Validators
export {
    isEmpty,
    exceedsMaxLength,
    isValidEmail,
    validateDisplayName,
    validateImageFile,
} from './validators';

// Formatters
export {
    formatDate,
    formatDateTime,
    formatTimeAgo,
    formatDuration,
    formatDurationLong,
    formatNumber,
    formatCompactNumber,
    formatFileSize,
    formatPercentage,
    capitalize,
    toTitleCase,
    truncateText,
    removeAccents,
    slugify,
    getDomain,
    hexToRgb,
    rgbToHex,
    formatTrackTitle,
    formatAlbumYear,
} from './formatters';

// Timing Utilities
export { debounce, throttle } from './debounce';
