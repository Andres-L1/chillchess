import { writable } from 'svelte/store';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
    id: string;
    message: string;
    type: NotificationType;
    duration?: number;
}

function createNotificationStore() {
    const { subscribe, update } = writable<Notification[]>([]);

    return {
        subscribe,
        add: (message: string, type: NotificationType = 'info', duration: number = 3000) => {
            const id = crypto.randomUUID();
            const notification = { id, message, type, duration };

            update(notifications => [...notifications, notification]);

            if (duration > 0) {
                setTimeout(() => {
                    update(notifications => notifications.filter(n => n.id !== id));
                }, duration);
            }
        },
        remove: (id: string) => {
            update(notifications => notifications.filter(n => n.id !== id));
        }
    };
}

export const notifications = createNotificationStore();

// Funciones helper para uso rápido
export const toast = {
    success: (msg: string, duration = 3000) => notifications.add(msg, 'success', duration),
    error: (msg: string, duration = 4000) => notifications.add(msg, 'error', duration),
    info: (msg: string, duration = 3000) => notifications.add(msg, 'info', duration),
    warning: (msg: string, duration = 3000) => notifications.add(msg, 'warning', duration),
};
