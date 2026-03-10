import { writable } from 'svelte/store';

// Dashboard mode: 'tools' or 'streamer'
const initialMode = (typeof window !== 'undefined' && (localStorage.getItem('dashboardMode') as 'tools' | 'streamer')) || 'tools';
export const dashboardMode = writable<'tools' | 'streamer'>(initialMode);

if (typeof window !== 'undefined') {
    dashboardMode.subscribe(value => {
        localStorage.setItem('dashboardMode', value);
    });
}

export const pageHeader = writable({
    title: 'ChillChess',
    description: 'Selecciona una herramienta',
    category: 'Dashboard',
});

// Mobile menu state
export const mobileMenuOpen = writable(false);
