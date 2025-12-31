/**
 * Utilities Index
 * 
 * Central export point for all utility functions.
 * Import from here instead of individual files for cleaner imports.
 * 
 * Example:
 * ```ts
 * import { logger, formatDate, validateBugTitle } from '$lib/utils';
 * ```
 */

// Logger
export { logger, createContextLogger, LogLevel } from './logger';

// Validators
export {
    isEmpty,
    exceedsMaxLength,
    isValidEmail,
    isValidUrl,
    validateProposalTitle,
    validateProposalDescription,
    validateBugTitle,
    validateBugDescription,
    validateBugSeverity,
    validateBugStatus,
    validateDisplayName,
    validateImageFile,
    validateAudioFile,
    sanitizeInput,
    truncate,
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

// Debounce (if exists)
export { debounce, throttle } from './debounce';
