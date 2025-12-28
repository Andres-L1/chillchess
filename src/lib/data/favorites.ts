import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Store para guardar IDs de canciones favoritas
// Persiste en localStorage para simplicidad

const stored = browser ? JSON.parse(localStorage.getItem('chill_favorites') || '[]') : [];

export const favoritesStore = writable<string[]>(stored);

if (browser) {
    favoritesStore.subscribe((value) => {
        localStorage.setItem('chill_favorites', JSON.stringify(value));
    });
}

export function toggleFavorite(trackId: string) {
    favoritesStore.update(current => {
        if (current.includes(trackId)) {
            return current.filter(id => id !== trackId);
        }
        return [...current, trackId];
    });
}

export function isFavorite(trackId: string, favorites: string[]): boolean {
    return favorites.includes(trackId);
}
