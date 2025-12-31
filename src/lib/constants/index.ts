/**
 * Application-wide Constants
 * 
 * Centralizes all magic numbers, strings, and configuration values
 * to avoid hardcoding throughout the app.
 */

// ============================================================================
// APP METADATA
// ============================================================================

export const APP_NAME = 'ChillChess';
export const APP_DESCRIPTION = 'Juega ajedrez con música relajante';
export const APP_VERSION = '1.0.0';
export const APP_URL = 'https://chillchess.app';

// ============================================================================
// ROUTES
// ============================================================================

export const ROUTES = {
    HOME: '/',
    ARTISTS: '/artists',
    COLLECTION: '/coleccion',
    PROPOSALS: '/proposals',
    BUGS: '/bugs',
    ADMIN: '/admin',
    PROFILE: '/profile',
    SETTINGS: '/settings',
    PLAY: '/play',
    TOURNAMENTS: '/tournaments',
} as const;

// ============================================================================
// FIRESTORE COLLECTIONS
// ============================================================================

export const COLLECTIONS = {
    USERS: 'users',
    ARTISTS: 'artists',
    ALBUMS: 'albums',
    TRACKS: 'tracks',
    PROPOSALS: 'proposals',
    BUG_REPORTS: 'bug_reports',
    MUSIC_SUBMISSIONS: 'musicSubmissions',
    TOURNAMENTS: 'tournaments',
    GAMES: 'games',
    BACKUPS: 'backups',
    NOTIFICATIONS: 'notifications',
} as const;

// ============================================================================
// LOCAL STORAGE KEYS
// ============================================================================

export const STORAGE_KEYS = {
    THEME: 'chillchess_theme',
    MUSIC_VOLUME: 'chillchess_music_volume',
    SFX_VOLUME: 'chillchess_sfx_volume',
    LAST_ALBUM: 'chillchess_last_album',
    PLAYER_STATE: 'chillchess_player_state',
    USER_PREFERENCES: 'chillchess_user_preferences',
} as const;

// ============================================================================
// AUDIO SETTINGS
// ============================================================================

export const AUDIO = {
    DEFAULT_VOLUME: 0.5,
    MIN_VOLUME: 0,
    MAX_VOLUME: 1,
    FADE_DURATION: 1000, // ms
    CROSSFADE_DURATION: 2000, // ms
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
    // Proposals
    PROPOSAL_TITLE_MAX: 100,
    PROPOSAL_DESCRIPTION_MAX: 1000,

    // Bug Reports
    BUG_TITLE_MAX: 100,
    BUG_DESCRIPTION_MAX: 500,
    BUG_STEPS_MAX: 300,

    // Music Submissions
    SUBMISSION_TITLE_MAX: 100,
    SUBMISSION_DESCRIPTION_MAX: 500,

    // User Profile
    DISPLAY_NAME_MAX: 50,
    BIO_MAX: 500,

    // File Uploads
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_AUDIO_SIZE: 20 * 1024 * 1024, // 20MB
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
// SUBSCRIPTION TIERS
// ============================================================================

export const SUBSCRIPTION_FEATURES = {
    free: {
        maxPlaylists: 3,
        downloadQuality: 'standard',
        adsEnabled: true,
        offlineMode: false,
    },
    pro: {
        maxPlaylists: 20,
        downloadQuality: 'high',
        adsEnabled: false,
        offlineMode: true,
    },
    premium: {
        maxPlaylists: -1, // unlimited
        downloadQuality: 'lossless',
        adsEnabled: false,
        offlineMode: true,
    },
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
    YOUTUBE_VIDEO: /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
    HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
} as const;

// ============================================================================
// API ENDPOINTS
// ============================================================================

export const API_ENDPOINTS = {
    ADMIN: {
        TRIGGER_BACKUP: '/api/admin/trigger-backup',
        CLEANUP_REJECTED: '/api/admin/cleanup-rejected',
    },
    AUTH: {
        LOGIN: '/api/auth/login',
        LOGOUT: '/api/auth/logout',
        REGISTER: '/api/auth/register',
    },
} as const;

// ============================================================================
// CLOUDFLARE R2 CONFIG
// ============================================================================

export const R2_CONFIG = {
    BUCKETS: {
        MUSIC: 'chillchess-music',
        COVERS: 'chillchess-covers',
        AVATARS: 'chillchess-avatars',
    },
    MAX_RETENTION_DAYS: 30,
} as const;

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const FEATURE_FLAGS = {
    ENABLE_TOURNAMENTS: true,
    ENABLE_SOCIAL_FEATURES: false,
    ENABLE_ACHIEVEMENTS: false,
    ENABLE_CHAT: false,
    ENABLE_AI_ANALYSIS: false,
} as const;

// ============================================================================
// THEME COLORS (Reference)
// ============================================================================

export const THEME_COLORS = {
    background: '#0B1120',
    surface: '#131b2e',
    primary: '#FF7B3D',
    secondary: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    text: {
        primary: '#FFFFFF',
        secondary: '#94A3B8',
        muted: '#64748B',
    },
} as const;
