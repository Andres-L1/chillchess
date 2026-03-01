import { writable } from 'svelte/store';

export const pageHeader = writable({
    title: 'MultiTool',
    description: 'Selecciona una herramienta',
    category: 'Dashboard',
});

// Mobile menu state
export const mobileMenuOpen = writable(false);
