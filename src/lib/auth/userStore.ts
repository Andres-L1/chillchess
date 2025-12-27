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

// Listener global de Firebase Auth
onAuthStateChanged(auth, (user) => {
    userStore.set({
        user: user,
        loading: false,
        isLoggedIn: !!user
    });
});

export const logout = async () => {
    await signOut(auth);
};
