/**
 * Application-wide Constants
 * 
 * Centralizes all magic numbers, strings, and configuration values
 * to avoid hardcoding throughout the app.
 */

// ============================================================================
// APP METADATA
// ============================================================================

export const APP_NAME = 'MultiTool';
export const APP_DESCRIPTION = 'Tu navaja suiza digital para freelancers';
export const APP_VERSION = '4.0.0';
export const APP_URL = 'https://chillchess.app';

// ============================================================================
// ROUTES
// ============================================================================

export const ROUTES = {
    HOME: '/',
    LANDING: '/landing',
    FREELANCE: '/freelance',
    VCARD: '/vcard',
    KANBAN: '/kanban',
    POMODORO: '/pomodoro',
    CURRENCY: '/currency',
    TIP: '/tip',
    PASSWORD: '/password',
    QR: '/qr',
    ADMIN: '/admin',
    PROFILE: '/profile',
    PRICING: '/pricing',
    COOKIES: '/cookies',
} as const;

// ============================================================================
// FIRESTORE COLLECTIONS
// ============================================================================

export const COLLECTIONS = {
    USERS: 'users',
} as const;

// ============================================================================
// LOCAL STORAGE KEYS
// ============================================================================

export const STORAGE_KEYS = {
    THEME: 'multitool_theme',
    KANBAN_TASKS: 'multitool_kanban_tasks',
    COOKIES_ACCEPTED: 'multitool_cookies_accepted',
    COOKIES_DECLINED: 'multitool_cookies_declined',
} as const;

// ============================================================================
// PAGINATION
// ============================================================================

export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    ADMIN_PAGE_SIZE: 50,
} as const;

// ============================================================================
// VALIDATION LIMITS
// ============================================================================

export const LIMITS = {
    // User Profile
    DISPLAY_NAME_MAX: 50,

    // File Uploads
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

// ============================================================================
// TIME CONSTANTS
// ============================================================================

export const TIME = {
    SECOND: 1000,
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000,
    WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

// ============================================================================
// DEBOUNCE/THROTTLE TIMINGS
// ============================================================================

export const TIMINGS = {
    SEARCH_DEBOUNCE: 300,
    INPUT_DEBOUNCE: 300,
    RESIZE_DEBOUNCE: 150,
    SCROLL_THROTTLE: 100,
    AUTO_SAVE: 2000,
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Error de conexión. Por favor, verifica tu internet.',
    AUTH_REQUIRED: 'Debes iniciar sesión para continuar.',
    PERMISSION_DENIED: 'No tienes permisos para realizar esta acción.',
    NOT_FOUND: 'El recurso solicitado no existe.',
    VALIDATION_ERROR: 'Los datos ingresados no son válidos.',
    SERVER_ERROR: 'Error del servidor. Intenta de nuevo más tarde.',
    UNKNOWN_ERROR: 'Ha ocurrido un error inesperado.',
} as const;

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const SUCCESS_MESSAGES = {
    SAVED: '✅ Guardado correctamente',
    SUBMITTED: '✅ Enviado correctamente',
    DELETED: '✅ Eliminado correctamente',
    UPDATED: '✅ Actualizado correctamente',
    CREATED: '✅ Creado correctamente',
} as const;

// ============================================================================
// REGEX PATTERNS
// ============================================================================

export const PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    URL: /^https?:\/\//,
    HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
} as const;

// ============================================================================
// THEME COLORS (Reference)
// ============================================================================

export const THEME_COLORS = {
    background: '#0B0E14',
    surface: '#0d1117',
    primary: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    text: {
        primary: '#FFFFFF',
        secondary: '#94A3B8',
        muted: '#64748B',
    },
} as const;
