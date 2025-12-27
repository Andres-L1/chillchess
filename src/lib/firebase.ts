/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase safely
let app;
let auth;
let db;
let discordProvider;

try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);

    // Configurar Auth de Discord
    discordProvider = new OAuthProvider('discord.com');
    discordProvider.addScope('identify');

    // Set persistence
    setPersistence(auth, browserLocalPersistence).catch((error) => {
        console.warn("Auth Persistence Error:", error);
    });

} catch (e) {
    console.error("Error initializing Firebase (Check .env variables):", e);
}

export { auth, db, discordProvider };
