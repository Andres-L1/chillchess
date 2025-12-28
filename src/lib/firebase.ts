/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from "firebase/app";
import { type Auth, getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider } from "firebase/auth";
import { type Firestore, getFirestore } from "firebase/firestore";

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
let app;
let auth: Auth;
let db: Firestore;
// Auth Provider Removed (Email/Pass only)

try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);

    // Configurar Auth de Google
    // googleProvider = new GoogleAuthProvider();

    // Set persistence
    setPersistence(auth, browserLocalPersistence).catch((error) => {
        console.warn("Auth Persistence Error:", error);
    });

} catch (e) {
    console.error("Error initializing Firebase (Check .env variables):", e);
}

export { auth, db };
