import { writable, derived, type Readable } from 'svelte/store';
import { userStore } from '$lib/auth/userStore';
import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '$lib/firebase';
import type { UserProfile, SubscriptionTier } from '$lib/types/subscription';
import { SUBSCRIPTION_TIERS, canAccessVibe, canPlayGame } from './tiers';

interface SubscriptionState {
    profile: UserProfile | null;
    loading: boolean;
    tier: SubscriptionTier;
    canAccessVibe: (vibeId: string) => boolean;
    canPlayGame: () => boolean;
}

const initialState: SubscriptionState = {
    profile: null,
    loading: true,
    tier: 'free',
    canAccessVibe: () => false,
    canPlayGame: () => false,
};

function createUserSubscriptionStore() {
    const { subscribe, set } = writable<SubscriptionState>(initialState);
    let unsubscribeFirestore: (() => void) | null = null;

    // Subscribe to auth changes
    userStore.subscribe(($user) => {
        // Cleanup previous listener
        if (unsubscribeFirestore) {
            unsubscribeFirestore();
            unsubscribeFirestore = null;
        }

        // No user, reset to initial state
        if (!$user.user) {
            set(initialState);
            return;
        }

        // Setup Firestore listener for this user
        const userDocRef = doc(db, 'users', $user.user.uid);

        unsubscribeFirestore = onSnapshot(
            userDocRef,
            async (docSnap) => {
                if (!docSnap.exists()) {
                    // Create new user profile
                    const newProfile: UserProfile = {
                        uid: $user.user!.uid,
                        email: $user.user!.email || '',
                        displayName: $user.user!.displayName || 'Usuario',
                        photoURL: $user.user!.photoURL || '',
                        subscriptionTier: 'free',
                        subscriptionStatus: 'active',
                        gamesPlayedToday: 0,
                        lastGamePlayed: Date.now(),
                        lastResetDate: new Date().toISOString().split('T')[0],
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                    };

                    await setDoc(userDocRef, newProfile);

                    set({
                        profile: newProfile,
                        loading: false,
                        tier: 'free',
                        canAccessVibe: (vibeId: string) => canAccessVibe('free', vibeId),
                        canPlayGame: () => canPlayGame('free', 0),
                    });
                    return;
                }

                const profile = docSnap.data() as UserProfile;
                const tier = profile.subscriptionTier || 'free';

                // Check if we need to reset daily counter
                const today = new Date().toISOString().split('T')[0];
                if (profile.lastResetDate !== today) {
                    await updateDoc(userDocRef, {
                        gamesPlayedToday: 0,
                        lastResetDate: today,
                        updatedAt: Date.now(),
                    });
                    profile.gamesPlayedToday = 0;
                    profile.lastResetDate = today;
                }

                set({
                    profile,
                    loading: false,
                    tier,
                    canAccessVibe: (vibeId: string) => canAccessVibe(tier, vibeId),
                    canPlayGame: () => canPlayGame(tier, profile.gamesPlayedToday),
                });
            },
            (error) => {
                console.error('Error listening to user profile:', error);
                set({ ...initialState, loading: false });
            }
        );
    });

    return {
        subscribe,
    };
}

export const userSubscription = createUserSubscriptionStore();

// Helper to increment games played
export async function incrementGamesPlayed(userId: string) {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
        gamesPlayedToday: (await import('firebase/firestore')).increment(1),
        lastGamePlayed: Date.now(),
        updatedAt: Date.now(),
    });
}
