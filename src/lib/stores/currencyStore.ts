import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'chillchess_preferred_currency';

// Las divisas soportadas en la app.
export type CurrencyPrefix = '€' | '$' | '£';

const getInitialCurrency = (): CurrencyPrefix => {
    if (!browser) return '€';

    // Default to Euro '€', but read from local storage if available
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === '€' || stored === '$' || stored === '£') {
        return stored;
    }

    return '€';
};

export const currencyStore = writable<CurrencyPrefix>(getInitialCurrency());

// Suscribirse a cambios para guardarlo en la memoria local
if (browser) {
    currencyStore.subscribe((value) => {
        localStorage.setItem(STORAGE_KEY, value);
    });
}
