/**
 * Example Unit Tests
 * 
 * Demonstrates how to write tests for utilities, validators, and formatters
 */

import { describe, it, expect } from 'vitest';
import {
    formatDate,
    formatDuration,
    formatFileSize,
    capitalize,
    slugify,
} from '$lib/utils/formatters';
import {
    validateBugTitle,
    validateEmail,
    isEmpty,
} from '$lib/utils/validators';
import { debounce } from '$lib/utils/debounce';

describe('Formatters', () => {
    describe('formatDate', () => {
        it('formats date to Spanish locale', () => {
            const date = new Date('2024-12-31');
            const formatted = formatDate(date);
            expect(formatted).toMatch(/dic/i);
            expect(formatted).toContain('2024');
        });
    });

    describe('formatDuration', () => {
        it('formats seconds to MM:SS', () => {
            expect(formatDuration(125)).toBe('2:05');
            expect(formatDuration(59)).toBe('0:59');
            expect(formatDuration(3661)).toBe('61:01');
        });
    });

    describe('formatFileSize', () => {
        it('formats bytes to human readable', () => {
            expect(formatFileSize(0)).toBe('0 B');
            expect(formatFileSize(1024)).toBe('1 KB');
            expect(formatFileSize(1048576)).toBe('1 MB');
            expect(formatFileSize(1073741824)).toBe('1 GB');
        });
    });

    describe('capitalize', () => {
        it('capitalizes first letter', () => {
            expect(capitalize('hello')).toBe('Hello');
            expect(capitalize('WORLD')).toBe('World');
        });
    });

    describe('slugify', () => {
        it('converts to URL-safe slug', () => {
            expect(slugify('Hello World')).toBe('hello-world');
            expect(slugify('Café España')).toBe('cafe-espana');
            expect(slugify('Test  Multiple   Spaces')).toBe('test-multiple-spaces');
        });
    });
});

describe('Validators', () => {
    describe('isEmpty', () => {
        it('detects empty strings', () => {
            expect(isEmpty('')).toBe(true);
            expect(isEmpty('   ')).toBe(true);
            expect(isEmpty(null)).toBe(true);
            expect(isEmpty(undefined)).toBe(true);
            expect(isEmpty('text')).toBe(false);
        });
    });

    describe('validateEmail', () => {
        it('validates email format', () => {
            expect(validateEmail('test@example.com')).toBe(true);
            expect(validateEmail('user+tag@domain.co.uk')).toBe(true);
            expect(validateEmail('invalid')).toBe(false);
            expect(validateEmail('invalid@')).toBe(false);
            expect(validateEmail('@invalid.com')).toBe(false);
        });
    });

    describe('validateBugTitle', () => {
        it('validates bug titles', () => {
            const valid = validateBugTitle('Valid bug title');
            expect(valid.valid).toBe(true);
            expect(valid.error).toBeUndefined();
        });

        it('rejects empty titles', () => {
            const invalid = validateBugTitle('');
            expect(invalid.valid).toBe(false);
            expect(invalid.error).toBeDefined();
        });

        it('rejects titles that are too long', () => {
            const longTitle = 'a'.repeat(101);
            const invalid = validateBugTitle(longTitle);
            expect(invalid.valid).toBe(false);
            expect(invalid.error).toContain('exceder');
        });
    });
});

describe('Utilities', () => {
    describe('debounce', () => {
        it('debounces function calls', async () => {
            let callCount = 0;
            const fn = () => callCount++;
            const debounced = debounce(fn, 100);

            debounced();
            debounced();
            debounced();

            expect(callCount).toBe(0); // Not called yet

            await new Promise((resolve) => setTimeout(resolve, 150));

            expect(callCount).toBe(1); // Called once after delay
        });
    });
});
