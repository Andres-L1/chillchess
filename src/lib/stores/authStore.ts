import { writable } from 'svelte/store';
import { auth, db } from '$lib/firebase';
import { onAuthStateChanged, getRedirectResult, type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

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
        console.log("Auth Store: Initializing...");

        // Separate function to handle firestore sync
        const syncUser = (firebaseUser: User) => {
            if (unsubscribeDoc) unsubscribeDoc();

            const isAdmin = firebaseUser.email?.toLowerCase() === 'andreslgumuzio@gmail.com';
            const baseUserData: UserData = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                isPro: false,
                isAdmin: isAdmin
            };

            // For admin, we want to unlock the UI immediately
            update(state => ({
                ...state,
                user: baseUserData,
                loading: !isAdmin,
                error: null
            }));

            const userRef = doc(db, 'users', firebaseUser.uid);
            unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
                const data = docSnap.data();
                const isPro = data?.isPro === true;
                console.log("Auth Store: Firestore Sync (isPro:", isPro, ")");

                update(state => ({
                    ...state,
                    user: { ...baseUserData, isPro },
                    loading: false
                }));
            }, (error) => {
                console.warn("Auth Store: Firestore restricted:", error.message);
                update(state => ({ ...state, loading: false }));
            });
        };

        // 1. listener for state changes
        onAuthStateChanged(auth, (user) => {
            console.log("Auth Store: onAuthStateChanged ->", user?.email || 'null');
            if (user) {
                syncUser(user);
            } else {
                update(state => ({ ...state, user: null, loading: false }));
            }
        });

        // 2. handle redirect result
        getRedirectResult(auth).then((result) => {
            if (result) {
                console.log("Auth Store: Redirect Result found for", result.user.email);
                syncUser(result.user);
            }
        }).catch((error) => {
            console.error("Auth Store: Redirect Result Error:", error);
            update(state => ({ ...state, error: error.message, loading: false }));
        });
    }

    return { subscribe };
}

export const authStore = createAuthStore();
