/**
 * Validation Utilities
 * 
 * Reusable validators to ensure data integrity across the app.
 */

import { PATTERNS, LIMITS } from '$lib/constants';
import type { BugSeverity, BugStatus, ProposalCategory, ProposalStatus } from '$lib/types';

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
// PROPOSAL VALIDATORS
// ============================================================================

export function validateProposalTitle(title: string): { valid: boolean; error?: string } {
    if (isEmpty(title)) {
        return { valid: false, error: 'El título no puede estar vacío' };
    }

    if (exceedsMaxLength(title, LIMITS.PROPOSAL_TITLE_MAX)) {
        return {
            valid: false,
            error: `El título no puede exceder ${LIMITS.PROPOSAL_TITLE_MAX} caracteres`
        };
    }

    return { valid: true };
}

export function validateProposalDescription(description: string): { valid: boolean; error?: string } {
    if (isEmpty(description)) {
        return { valid: false, error: 'La descripción no puede estar vacía' };
    }

    if (exceedsMaxLength(description, LIMITS.PROPOSAL_DESCRIPTION_MAX)) {
        return {
            valid: false,
            error: `La descripción no puede exceder ${LIMITS.PROPOSAL_DESCRIPTION_MAX} caracteres`
        };
    }

    return { valid: true };
}

export function validateProposalCategory(category: string): category is ProposalCategory {
    return ['feature', 'bug', 'improvement', 'other'].includes(category);
}

export function validateProposalStatus(status: string): status is ProposalStatus {
    return ['pending', 'approved', 'rejected', 'implemented'].includes(status);
}

// ============================================================================
// BUG REPORT VALIDATORS
// ============================================================================

export function validateBugTitle(title: string): { valid: boolean; error?: string } {
    if (isEmpty(title)) {
        return { valid: false, error: 'El título no puede estar vacío' };
    }

    if (exceedsMaxLength(title, LIMITS.BUG_TITLE_MAX)) {
        return {
            valid: false,
            error: `El título no puede exceder ${LIMITS.BUG_TITLE_MAX} caracteres`
        };
    }

    return { valid: true };
}

export function validateBugDescription(description: string): { valid: boolean; error?: string } {
    if (isEmpty(description)) {
        return { valid: false, error: 'La descripción no puede estar vacía' };
    }

    if (exceedsMaxLength(description, LIMITS.BUG_DESCRIPTION_MAX)) {
        return {
            valid: false,
            error: `La descripción no puede exceder ${LIMITS.BUG_DESCRIPTION_MAX} caracteres`
        };
    }

    return { valid: true };
}

export function validateBugSeverity(severity: string): severity is BugSeverity {
    return ['low', 'medium', 'high', 'critical'].includes(severity);
}

export function validateBugStatus(status: string): status is BugStatus {
    return ['reported', 'reviewing', 'fixed', 'not-a-bug'].includes(status);
}

// ============================================================================
// MUSIC SUBMISSION VALIDATORS
// ============================================================================

export function validateSubmissionTitle(title: string): { valid: boolean; error?: string } {
    if (isEmpty(title)) {
        return { valid: false, error: 'El título no puede estar vacío' };
    }

    if (exceedsMaxLength(title, LIMITS.SUBMISSION_TITLE_MAX)) {
        return {
            valid: false,
            error: `El título no puede exceder ${LIMITS.SUBMISSION_TITLE_MAX} caracteres`
        };
    }

    return { valid: true };
}

export function validateAudioUrl(url: string): { valid: boolean; error?: string } {
    if (isEmpty(url)) {
        return { valid: false, error: 'La URL no puede estar vacía' };
    }

    if (!isValidUrl(url)) {
        return { valid: false, error: 'La URL no es válida' };
    }

    return { valid: true };
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

export function validateAudioFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('audio/')) {
        return { valid: false, error: 'El archivo debe ser de audio' };
    }

    // Check file size
    if (file.size > LIMITS.MAX_AUDIO_SIZE) {
        const maxSizeMB = LIMITS.MAX_AUDIO_SIZE / (1024 * 1024);
        return {
            valid: false,
            error: `El audio no puede exceder ${maxSizeMB}MB`
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
