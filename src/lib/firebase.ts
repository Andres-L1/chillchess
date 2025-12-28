/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from "firebase/app";
import { type Auth, getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider } from "firebase/auth";
import { type Firestore, getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDkAPVdrwASXA-O5ajBU7T14qbKSfef5EI",
    authDomain: "chillchess-57365.firebaseapp.com",
    projectId: "chillchess-57365",
    storageBucket: "chillchess-57365.firebasestorage.app",
    messagingSenderId: "676151034372",
    appId: "1:676151034372:web:4124fbdfd7fee5dfee2b51",
    measurementId: "G-32YHTXR687"
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
