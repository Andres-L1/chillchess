/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from "firebase/app";
import { type Auth, getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider } from "firebase/auth";
import { type Firestore, getFirestore } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator, type Functions } from "firebase/functions";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDkAPVdrwASXA-O5ajBU7T14qbKSfef5EI",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "chillchess-57365.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "chillchess-57365",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "chillchess-57365.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "676151034372",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:676151034372:web:4124fbdfd7fee5dfee2b51",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-32YHTXR687"
};

// Initialize Firebase safely
let app;
let auth: Auth;
let db: Firestore;
let functions: Functions;

try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    functions = getFunctions(app);

    // Conectar emuladores si estamos en local
    if (typeof window !== 'undefined' && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
        connectFunctionsEmulator(functions, "localhost", 5001);
    }

    // Set persistence
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

export { auth, db, functions, storage };
