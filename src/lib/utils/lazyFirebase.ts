/**
 * Lazy Firebase Loader
 * Purpose: Load Firebase modules only when needed to reduce initial bundle size
 * Usage: Import from this file instead of direct firebase imports in components
 */

// Lazy loaders for Firebase modules
export const loadAuth = async () => {
    const { auth } = await import('$lib/firebase');
    return auth;
};

export const loadDb = async () => {
    const { db } = await import('$lib/firebase');
    return db;
};

export const loadStorage = async () => {
    const { storage } = await import('$lib/firebase');
    return storage;
};

export const loadFunctions = async () => {
    const { functions } = await import('$lib/firebase');
    return functions;
};

// Combined loader for multiple services
export const loadFirebase = async (services: ('auth' | 'db' | 'storage' | 'functions')[]) => {
    const firebase = await import('$lib/firebase');
    const result: any = {};
    services.forEach(service => {
        result[service] = firebase[service];
    });
    return result;
};

// Preload critical Firebase modules for logged-in users
export const preloadAuthModules = () => {
    // Non-blocking preload
    import('$lib/firebase').catch(() => { });
    import('firebase/auth').catch(() => { });
    import('firebase/firestore').catch(() => { });
};
