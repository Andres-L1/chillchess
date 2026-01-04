/**
 * Sistema de notificaciones locales sin Cloud Functions
 * Usa Service Worker + IndexedDB para programar recordatorios
 */

let swRegistration: ServiceWorkerRegistration | null = null;

/**
 * Registrar el Service Worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if ('serviceWorker' in navigator) {
        try {
            swRegistration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('Service Worker registered:', swRegistration);
            return swRegistration;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            return null;
        }
    }
    return null;
}

/**
 * Solicitar permiso de notificaciones
 */
export async function requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
        console.warn('Este navegador no soporta notificaciones');
        return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
}

/**
 * Programar recordatorio para un hábito
 */
export async function scheduleHabitNotification(
    habitId: string,
    habitTitle: string,
    time: string // HH:mm
): Promise<boolean> {
    if (!swRegistration) {
        await registerServiceWorker();
    }

    if (!swRegistration) {
        console.error('Service Worker not registered');
        return false;
    }

    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
        console.error('Notification permission denied');
        return false;
    }

    try {
        const messageChannel = new MessageChannel();

        const promise = new Promise<any>((resolve) => {
            messageChannel.port1.onmessage = (event) => {
                resolve(event.data);
            };
        });

        swRegistration.active?.postMessage(
            {
                type: 'SCHEDULE_NOTIFICATION',
                habitId,
                habitTitle,
                time
            },
            [messageChannel.port2]
        );

        const result = await promise;
        return result.success;
    } catch (error) {
        console.error('Error scheduling notification:', error);
        return false;
    }
}

/**
 * Cancelar recordatorio de un hábito
 */
export async function cancelHabitNotification(habitId: string): Promise<boolean> {
    if (!swRegistration) {
        console.error('Service Worker not registered');
        return false;
    }

    try {
        const messageChannel = new MessageChannel();

        const promise = new Promise<any>((resolve) => {
            messageChannel.port1.onmessage = (event) => {
                resolve(event.data);
            };
        });

        swRegistration.active?.postMessage(
            {
                type: 'CANCEL_NOTIFICATION',
                habitId
            },
            [messageChannel.port2]
        );

        const result = await promise;
        return result.success;
    } catch (error) {
        console.error('Error canceling notification:', error);
        return false;
    }
}

/**
 * Mostrar notificación de prueba inmediatamente
 */
export async function showTestNotification(): Promise<void> {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return;

    if (!swRegistration) {
        await registerServiceWorker();
    }

    if (swRegistration) {
        await swRegistration.showNotification('🎯 Test de notificación', {
            body: 'Si ves esto, ¡las notificaciones funcionan!',
            icon: '/favicon.png',
            badge: '/favicon.png',
            requireInteraction: false
        });
    }
}
