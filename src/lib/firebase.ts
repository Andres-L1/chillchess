/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from "firebase/app";
import { type Auth, getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider } from "firebase/auth";
import { type Firestore, getFirestore } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator, type Functions } from "firebase/functions";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase safely
import type { FirebaseApp } from 'firebase/app';

let app: FirebaseApp | undefined;
let auth: Auth;
let db: Firestore;
let functions: Functions;

try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

    // Initialize Auth, Firestore, and Functions
    auth = getAuth(app);
    db = getFirestore(app);
    functions = getFunctions(app);

    // Conectar emuladores si estamos en local
    if (typeof window !== 'undefined' && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
        connectFunctionsEmulator(functions, "localhost", 5001);
    }

    // Set persistence
    setPersistence(auth, browserLocalPersistence).catch((error) => {
        console.warn("Auth Persistence Error:", error);
    });


} catch (e) {
    console.error("Error initializing Firebase (Check .env variables):", e);
}

// Initializing Storage explicitly
import { getStorage, type FirebaseStorage } from "firebase/storage";
let storage: FirebaseStorage;
try {
    if (app) {
        storage = getStorage(app);
    }
} catch (e) {
    console.warn("Storage init failed:", e);
}

export { app, auth, db, functions, storage };
