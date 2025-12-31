/**
 * Web Vitals Performance Monitoring
 * 
 * Tracks Core Web Vitals (CWV) and reports to analytics/logger
 * 
 * Metrics tracked:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay)
 * - CLS (Cumulative Layout Shift)
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 */

import { onCLS, onFCP, onFID, onLCP, onTTFB, type Metric } from 'web-vitals';
import { logger } from '$lib/utils/logger';
import { dev } from '$app/environment';

/**
 * Report Web Vitals to logger and analytics
 */
function reportWebVitals(metric: Metric) {
    const { name, value, rating, delta } = metric;

    // Log to console in dev
    if (dev) {
        console.log(`[WebVitals] ${name}:`, {
            value: Math.round(value),
            rating,
            delta: Math.round(delta),
        });
    }

    // Log to centralized logger
    logger.info(`Web Vital: ${name}`, {
        metric: name,
        value: Math.round(value),
        rating,
        delta: Math.round(delta),
        id: metric.id,
    });

    // Send to analytics (if configured)
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', name, {
            value: Math.round(value),
            metric_id: metric.id,
            metric_value: value,
            metric_delta: delta,
            metric_rating: rating,
        });
    }

    // Send to custom analytics endpoint
    if (!dev) {
        sendToAnalytics(metric);
    }
}

/**
 * Send metrics to backend analytics
 */
async function sendToAnalytics(metric: Metric) {
    try {
        await fetch('/api/analytics/web-vitals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: metric.name,
                value: metric.value,
                rating: metric.rating,
                delta: metric.delta,
                id: metric.id,
                timestamp: Date.now(),
                url: window.location.href,
                userAgent: navigator.userAgent,
            }),
        });
    } catch (error) {
        // Silently fail - don't break the app for analytics
        console.warn('Failed to send web vitals', error);
    }
}

/**
 * Initialize Web Vitals tracking
 */
export function initWebVitals() {
    // Only track in browser
    if (typeof window === 'undefined') return;

    // Track all Core Web Vitals
    onCLS(reportWebVitals);
    onFID(reportWebVitals);
    onLCP(reportWebVitals);
    onFCP(reportWebVitals);
    onTTFB(reportWebVitals);

    logger.debug('Web Vitals tracking initialized');
}

/**
 * Get performance marks for custom measurements
 */
export function markPerformance(name: string) {
    if (typeof window !== 'undefined' && window.performance) {
        window.performance.mark(name);
    }
}

/**
 * Measure time between two performance marks
 */
export function measurePerformance(name: string, startMark: string, endMark: string) {
    if (typeof window !== 'undefined' && window.performance) {
        try {
            window.performance.measure(name, startMark, endMark);
            const measure = window.performance.getEntriesByName(name)[0];

            logger.debug(`Performance: ${name}`, {
                duration: Math.round(measure.duration),
            });

            return measure.duration;
        } catch (error) {
            logger.warn('Failed to measure performance', error);
        }
    }
    return null;
}

/**
 * Performance budget thresholds (in milliseconds)
 */
export const PERFORMANCE_BUDGETS = {
    LCP: 2500, // Good: <2.5s
    FID: 100, // Good: <100ms
    CLS: 0.1, // Good: <0.1
    FCP: 1800, // Good: <1.8s
    TTFB: 800, // Good: <800ms
} as const;

/**
 * Check if metric is within budget
 */
export function isWithinBudget(metric: Metric): boolean {
    const budget = PERFORMANCE_BUDGETS[metric.name as keyof typeof PERFORMANCE_BUDGETS];
    return metric.value <= budget;
}

// TypeScript augmentation for gtag
declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
    }
}
