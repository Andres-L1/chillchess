import { writable } from 'svelte/store';
import type { SubscriptionTier } from '$lib/types/subscription';

// Store para guardar IDs de canciones favoritas
// Persiste en localStorage para simplicidad

const isBrowser = typeof window !== 'undefined';
const stored = isBrowser ? JSON.parse(localStorage.getItem('chill_favorites') || '[]') : [];

export const favoritesStore = writable<string[]>(stored);

if (isBrowser) {
    favoritesStore.subscribe((value) => {
        localStorage.setItem('chill_favorites', JSON.stringify(value));
    });
}

const FREE_FAVORITES_LIMIT = 20;

export function toggleFavorite(trackId: string, tier: SubscriptionTier = 'free'): { success: boolean; error?: string } {
    let result = { success: true, error: undefined as string | undefined };

    favoritesStore.update(current => {
        if (current.includes(trackId)) {
            // Removing is always allowed
            return current.filter(id => id !== trackId);
        }

        // Adding: check limit for free users
        if (tier === 'free' && current.length >= FREE_FAVORITES_LIMIT) {
            result = { success: false, error: `Límite alcanzado: Los usuarios Free pueden tener hasta ${FREE_FAVORITES_LIMIT} favoritos. Actualiza a Pro para favoritos ilimitados.` };
            return current; // Don't add
        }

        return [...current, trackId];
    });

    return result;
}

export function isFavorite(trackId: string, favorites: string[]): boolean {
    return favorites.includes(trackId);
}

export function canAddMoreFavorites(currentCount: number, tier: SubscriptionTier): boolean {
    if (tier === 'pro') return true;
    return currentCount < FREE_FAVORITES_LIMIT;
}
