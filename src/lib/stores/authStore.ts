import { writable } from 'svelte/store';
import { auth, db } from '$lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export interface UserData {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    isPro: boolean;
    isAdmin: boolean;
}

interface AuthState {
    user: UserData | null;
    loading: boolean;
    error: string | null;
}

function createAuthStore() {
    const { subscribe, set, update } = writable<AuthState>({
        user: null,
        loading: true,
        error: null
    });

    let unsubscribeDoc: () => void;

    if (typeof window !== 'undefined') {
        if (import.meta.env.DEV) console.log("Auth Store: Initializing...");

        // Separate function to handle firestore sync
        const syncUser = (firebaseUser: User) => {
            if (unsubscribeDoc) unsubscribeDoc();
            const baseUserData: UserData = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                isPro: false,
                isAdmin: false
            };

            update(state => ({
                ...state,
                user: baseUserData,
                loading: true,
                error: null
            }));

            const userRef = doc(db, 'users', firebaseUser.uid);

            // On first login only: write createdAt if not already set
            getDoc(userRef).then((snap) => {
                const existing = snap.data();
                const updates: Record<string, unknown> = {
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                };
                if (!existing?.createdAt) {
                    updates.createdAt = serverTimestamp();
                }
                setDoc(userRef, updates, { merge: true }).catch(() => { });
            }).catch(() => { });

            unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
                const data = docSnap.data();
                const isPro = data?.isPro === true;
                const isAdmin = data?.isAdmin === true || firebaseUser.email === 'andreslgumuzio@gmail.com';

                if (import.meta.env.DEV) console.log("Auth Store: Firestore Sync (isPro:", isPro, ", isAdmin:", isAdmin, ")");

                update(state => ({
                    ...state,
                    user: { ...baseUserData, isPro, isAdmin },
                    loading: false
                }));
            }, (error) => {
                if (import.meta.env.DEV) console.warn("Auth Store: Firestore restricted:", error.message);
                update(state => ({ ...state, loading: false }));
            });
        };

        // 1. listener for state changes
        onAuthStateChanged(auth, (user) => {
            if (import.meta.env.DEV) console.log("Auth Store: onAuthStateChanged ->", user?.email || 'null');
            if (user) {
                syncUser(user);
            } else {
                update(state => ({ ...state, user: null, loading: false }));
            }
        });


    }

    return { subscribe };
}

export const authStore = createAuthStore();
