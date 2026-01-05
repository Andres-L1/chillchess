// Service Worker para notificaciones locales de hábitos
// ChillChess - Habit Tracker

const DB_NAME = 'chillchess-habits';
const STORE_NAME = 'scheduled-notifications';

// Abrir IndexedDB
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'habitId' });
            }
        };
    });
}

// Program notification for habit
self.addEventListener('message', async (event) => {
    if (event.data.type === 'SCHEDULE_NOTIFICATION') {
        const { habitId, habitTitle, time } = event.data;

        try {
            const db = await openDB();
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);

            await store.put({
                habitId,
                habitTitle,
                time,
                lastNotified: null
            });

            event.ports[0].postMessage({ success: true });
        } catch (error) {
            console.error('Error scheduling notification:', error);
            event.ports[0].postMessage({ success: false, error: error.message });
        }
    }

    if (event.data.type === 'CANCEL_NOTIFICATION') {
        const { habitId } = event.data;

        try {
            const db = await openDB();
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);

            await store.delete(habitId);

            event.ports[0].postMessage({ success: true });
        } catch (error) {
            console.error('Error canceling notification:', error);
            event.ports[0].postMessage({ success: false, error: error.message });
        }
    }
});

// Check every minute for pending notifications
setInterval(async () => {
    try {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const today = now.toISOString().split('T')[0];

        const db = await openDB();

        // Wrap getAll in a promise that waits for transaction completion
        const allNotifications = await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });

        // Only iterate if we have valid data
        if (Array.isArray(allNotifications)) {
            for (const notif of allNotifications) {
                if (notif.time === currentTime) {
                    if (notif.lastNotified !== today) {
                        await self.registration.showNotification('🔥 Recordatorio de hábito', {
                            body: `No olvides: ${notif.habitTitle}`,
                            icon: '/favicon.png',
                            badge: '/favicon.png',
                            tag: `habit-${notif.habitId}`,
                            requireInteraction: true,
                            data: {
                                habitId: notif.habitId,
                                url: '/app'
                            }
                        });

                        // Update lastNotified in a new transaction
                        const updateDb = await openDB();
                        const updateTx = updateDb.transaction(STORE_NAME, 'readwrite');
                        const updateStore = updateTx.objectStore(STORE_NAME);
                        notif.lastNotified = today;
                        await updateStore.put(notif);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error checking notifications:', error);
    }
}, 60000); // Every minute

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/app')
    );
});
