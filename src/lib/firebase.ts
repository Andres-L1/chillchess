/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from "firebase/app";
import { type Auth, getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider } from "firebase/auth";
import { type Firestore, getFirestore } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator, type Functions } from "firebase/functions";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { devLogger } from '$lib/utils/devLogger';

import { env } from '$env/dynamic/public';

const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY || (env.VITE_FIREBASE_API_KEY_B64 ? atob(env.VITE_FIREBASE_API_KEY_B64) : undefined),
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
    measurementId: env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate required Firebase configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error("❌ Firebase configuration is missing. Please check your .env file.");
    console.error("Required variables: VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID");
}

devLogger.debug("Firebase Config Loaded", {
    apiKeyPresent: !!firebaseConfig.apiKey,
    projectId: firebaseConfig.projectId
});

// Initialize Firebase safely
import type { FirebaseApp } from 'firebase/app';

let app: FirebaseApp | undefined;
let auth: Auth;
let db: Firestore;
let functions: Functions;
let storage: FirebaseStorage;

try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

    // Initialize Auth, Firestore, Functions, and Storage
    auth = getAuth(app);
    db = getFirestore(app);
    functions = getFunctions(app);
    storage = getStorage(app);

    // Conectar emuladores si estamos en local
    if (typeof window !== 'undefined' && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
        connectFunctionsEmulator(functions, "localhost", 5001);
    }

    // Set persistence (Browser only)
    if (typeof window !== 'undefined') {
        setPersistence(auth, browserLocalPersistence).catch((error) => {
            console.error("Auth Persistence Error:", error);
        });
    }


} catch (e) {
    console.error("Error initializing Firebase (Check .env variables):", e);
}


export { app, auth, db, functions, storage };
