import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { env } from '$env/dynamic/public';
import { writable } from 'svelte/store';

// Firebase config from environment variables
const firebaseConfig = {
    apiKey: env.PUBLIC_FIREBASE_API_KEY,
    authDomain: env.PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase (only if config is present)
let app: any = null;
let auth: any = null;
let db: any = null;

if (firebaseConfig.apiKey) {
    console.log('[ChillChess] Firebase config detected, initializing...');
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        console.log('[ChillChess] Firebase initialized successfully ✅');
        console.log('[ChillChess] Project ID:', firebaseConfig.projectId);
    } catch (error) {
        console.error('[ChillChess] Firebase initialization failed:', error);
    }
} else {
    console.error('[ChillChess] Firebase API key not found in environment variables');
}

export { app, auth, db };

// User store
export const user = writable<User | null>(null);

// Auto sign-in anonymously
if (auth) {
    console.log('[ChillChess] Setting up auth state listener...');
    onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
            console.log('[ChillChess] User authenticated:', firebaseUser.uid);
            user.set(firebaseUser);
        } else {
            console.log('[ChillChess] No user authenticated, signing in anonymously...');
            // Sign in anonymously if not logged in
            signInAnonymously(auth)
                .then(() => {
                    console.log('[ChillChess] Anonymous sign-in successful ✅');
                })
                .catch((error) => {
                    console.error('[ChillChess] Anonymous sign-in failed:', error);
                    console.error('[ChillChess] Error code:', error.code);
                    console.error('[ChillChess] Error message:', error.message);
                });
        }
    });
}

// ===== TERRITORY FUNCTIONS =====

export interface Territory {
    h3Index: string;
    ownerId: string;
    ownerName: string;
    conqueredAt: Timestamp;
    color: string;
}

/**
 * Claim a territory (save to Firestore)
 */
export async function claimTerritory(h3Index: string, userId: string, userName: string): Promise<boolean> {
    if (!db) {
        console.warn('Firebase not initialized, cannot claim territory');
        return false;
    }

    try {
        const territoryRef = doc(db, 'territories', h3Index);
        const territory: Territory = {
            h3Index,
            ownerId: userId,
            ownerName: userName,
            conqueredAt: Timestamp.now(),
            color: '#00D9FF' // Default color (can be randomized or user-specific)
        };

        await setDoc(territoryRef, territory);
        console.log(`Territory ${h3Index} claimed by ${userName}`);
        return true;
    } catch (error) {
        console.error('Error claiming territory:', error);
        return false;
    }
}

/**
 * Get a single territory by H3 index
 */
export async function getTerritory(h3Index: string): Promise<Territory | null> {
    if (!db) return null;

    try {
        const territoryRef = doc(db, 'territories', h3Index);
        const docSnap = await getDoc(territoryRef);

        if (docSnap.exists()) {
            return docSnap.data() as Territory;
        }
        return null;
    } catch (error) {
        console.error('Error fetching territory:', error);
        return null;
    }
}

/**
 * Get all territories owned by a user
 */
export async function getUserTerritories(userId: string): Promise<Territory[]> {
    if (!db) return [];

    try {
        const territoriesRef = collection(db, 'territories');
        const q = query(territoriesRef, where('ownerId', '==', userId));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => doc.data() as Territory);
    } catch (error) {
        console.error('Error fetching user territories:', error);
        return [];
    }
}

/**
 * Get all territories in the database (for rendering on map)
 */
export async function getAllTerritories(): Promise<Territory[]> {
    if (!db) return [];

    try {
        const territoriesRef = collection(db, 'territories');
        const querySnapshot = await getDocs(territoriesRef);

        return querySnapshot.docs.map(doc => doc.data() as Territory);
    } catch (error) {
        console.error('Error fetching all territories:', error);
        return [];
    }
}
