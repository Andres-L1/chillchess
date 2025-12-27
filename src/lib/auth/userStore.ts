import { writable } from 'svelte/store';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';

interface UserState {
    user: User | null;
    loading: boolean;
    isLoggedIn: boolean;
}

const initialState: UserState = {
    user: null,
    loading: true,
    isLoggedIn: false
};

export const userStore = writable<UserState>(initialState);

// Listener global de Firebase Auth (Solo en cliente y si auth existe)
if (typeof window !== 'undefined' && auth) {
    onAuthStateChanged(auth, (user) => {
        userStore.set({
            user: user,
            loading: false,
            isLoggedIn: !!user
        });
    });
} else {
    // Si estamos en server o no hay auth, paramos loading
    userStore.update(s => ({ ...s, loading: false }));
}

export const logout = async () => {
    if (auth) {
        await signOut(auth);
    }
};
