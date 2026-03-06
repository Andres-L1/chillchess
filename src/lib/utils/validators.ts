/**
 * Validation Utilities
 * 
 * Reusable validators to ensure data integrity across the app.
 */

import { PATTERNS, LIMITS } from '$lib/constants';


// ============================================================================
// GENERAL VALIDATORS
// ============================================================================

/**
 * Checks if a string is empty or only whitespace
 */
export function isEmpty(value: string | null | undefined): boolean {
    return !value || value.trim().length === 0;
}

/**
 * Checks if a string exceeds maximum length
 */
export function exceedsMaxLength(value: string, maxLength: number): boolean {
    return value.length > maxLength;
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
    return PATTERNS.EMAIL.test(email);
}

/**
 * Validates URL format
 */
export function isValidUrl(url: string): boolean {
    return PATTERNS.URL.test(url);
}

// ============================================================================
// USER PROFILE VALIDATORS
// ============================================================================

export function validateDisplayName(name: string): { valid: boolean; error?: string } {
    if (isEmpty(name)) {
        return { valid: false, error: 'El nombre no puede estar vacío' };
    }

    if (exceedsMaxLength(name, LIMITS.DISPLAY_NAME_MAX)) {
        return {
            valid: false,
            error: `El nombre no puede exceder ${LIMITS.DISPLAY_NAME_MAX} caracteres`
        };
    }

    return { valid: true };
}

// ============================================================================
// FILE VALIDATORS
// ============================================================================

export function validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
        return { valid: false, error: 'El archivo debe ser una imagen' };
    }

    // Check file size
    if (file.size > LIMITS.MAX_IMAGE_SIZE) {
        const maxSizeMB = LIMITS.MAX_IMAGE_SIZE / (1024 * 1024);
        return {
            valid: false,
            error: `La imagen no puede exceder ${maxSizeMB}MB`
        };
    }

    return { valid: true };
}


// ============================================================================
// SANITIZATION
// ============================================================================

/**
 * Sanitizes user input by removing dangerous characters
 */
export function sanitizeInput(input: string): string {
    return input
        .replace(/[<>]/g, '') // Remove angle brackets
        .trim();
}

/**
 * Truncates text to a maximum length
 */
export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
}
