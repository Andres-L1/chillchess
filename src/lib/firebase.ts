/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from "firebase/app";
import { type Auth, getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider } from "firebase/auth";
import { type Firestore, getFirestore } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator, type Functions } from "firebase/functions";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { devLogger } from '$lib/utils/devLogger';

// Using import.meta.env for better IDE support and Vite integration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || (import.meta.env.VITE_FIREBASE_API_KEY_B64 ? atob(import.meta.env.VITE_FIREBASE_API_KEY_B64) : undefined),
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate required Firebase configuration
const isConfigValid = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

if (!isConfigValid && typeof window !== 'undefined') {
    devLogger.error("❌ [FIREBASE] Configuration is missing! Check your .env file.");
    devLogger.info("Required: VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID");
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);
const storage = getStorage(app);

// Configure emulators in local development
if (typeof window !== 'undefined' &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") &&
    import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
    connectFunctionsEmulator(functions, "localhost", 5001);
    devLogger.info("🚀 [FIREBASE] Connected to Functions Emulator");
}

// Set persistence (Browser only)
if (typeof window !== 'undefined') {
    setPersistence(auth, browserLocalPersistence).catch((error) => {
        devLogger.error("Auth Persistence Error:", error);
    });
}

const googleProvider = new GoogleAuthProvider();

export { app, auth, db, functions, storage, googleProvider };
