import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
    id: number;
    message: string;
    type: ToastType;
}

export const toasts = writable<ToastMessage[]>([]);

let nextId = 1;

export function addToast(message: string, type: ToastType = 'success') {
    const id = nextId++;
    toasts.update(all => [...all, { id, message, type }]);

    setTimeout(() => {
        removeToast(id);
    }, 3000);
}

export function removeToast(id: number) {
    toasts.update(all => all.filter(t => t.id !== id));
}
