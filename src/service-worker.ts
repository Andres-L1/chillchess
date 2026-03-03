/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;
const CACHE = `cache-${version}`;

const ASSETS = [
    ...build, // the app itself
    ...files  // everything in static
];

// Install: Cache all critical assets
sw.addEventListener('install', (event) => {
    // Create a new cache and add all files to it
    async function addFilesToCache() {
        const cache = await caches.open(CACHE);
        await cache.addAll(ASSETS);
    }

    event.waitUntil(addFilesToCache());
});

// Activate: Clean up old caches
sw.addEventListener('activate', (event) => {
    async function deleteOldCaches() {
        for (const key of await caches.keys()) {
            if (key !== CACHE) await caches.delete(key);
        }
    }

    event.waitUntil(deleteOldCaches());
});

// Fetch: Network first for HTML/Data, Cache first for static assets
sw.addEventListener('fetch', (event) => {
    // ignore POST requests etc
    if (event.request.method !== 'GET') return;
    // ignore firebase requests
    if (event.request.url.includes('firebase')) return;
    if (event.request.url.includes('googleapis')) return;

    async function respond() {
        const url = new URL(event.request.url);
        const cache = await caches.open(CACHE);

        // Serve build assets from cache first
        if (ASSETS.includes(url.pathname)) {
            const cachedResponse = await cache.match(url.pathname);
            if (cachedResponse) return cachedResponse;
        }

        // Try network
        try {
            const response = await fetch(event.request);

            // if we're offline, fetch can return a value that is not a Response
            // instead of throwing - and we can't check this until we try it
            if (!(response instanceof Response)) {
                throw new Error('invalid response from fetch');
            }

            if (response.status === 200) {
                // Cache successful responses for next time
                // But only if they are http/https (skip chrome-extension://)
                if (url.protocol.startsWith('http')) {
                    cache.put(event.request, response.clone());
                }
            }

            return response;
        } catch (err) {
            // Fallback to cache if network fails
            const cachedResponse = await cache.match(event.request);
            if (cachedResponse) {
                return cachedResponse;
            }

            // Fallback for navigation requests
            if (event.request.mode === 'navigate') {
                // Return index page if cached
                // (SvelteKit usually handles this, but good as backup)
                const index = await cache.match('/');
                return index || new Response('Offline', { status: 408 });
            }

            throw err;
        }
    }

    event.respondWith(respond());
});

/**
 * NOTIFICATION LOGIC (Migrated from static/service-worker.js)
 */
const DB_NAME = 'multitool-habits';
const STORE_NAME = 'scheduled-notifications';

function openDB() {
    return new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            // @ts-ignore
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'habitId' });
            }
        };
    });
}

sw.addEventListener('message', async (event) => {
    if (event.data?.type === 'SCHEDULE_NOTIFICATION') {
        const { habitId, habitTitle, time } = event.data;
        try {
            const db = await openDB();
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);

            // @ts-ignore
            await store.put({ habitId, habitTitle, time, lastNotified: null });
            event.ports[0].postMessage({ success: true });
        } catch (error: any) {
            console.error('[SW] Schedule Error:', error);
            event.ports[0].postMessage({ success: false, error: error.message });
        }
    }

    if (event.data?.type === 'CANCEL_NOTIFICATION') {
        // ... (similar logic as original)
        const { habitId } = event.data;
        try {
            const db = await openDB();
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            // @ts-ignore
            await store.delete(habitId);
            event.ports[0].postMessage({ success: true });
        } catch (e) {
            console.error(e);
        }
    }
});

// Periodic Sync (or simple interval if browser allows in SW context - rare background)
// Note: setInterval in SW is not reliable when browser kills worker.
// The previous implementation used setInterval in SW which only works if SW is kept alive.
// We'll keep it for now as a "best effort" when the app is open/backgrounded briefly.
setInterval(async () => {
    try {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const today = now.toISOString().split('T')[0];

        const db = await openDB();

        const allNotifications: any[] = await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            // @ts-ignore
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });

        if (Array.isArray(allNotifications)) {
            for (const notif of allNotifications) {
                if (notif.time === currentTime && notif.lastNotified !== today) {
                    await sw.registration.showNotification('🔥 Recordatorio de hábito', {
                        body: `No olvides: ${notif.habitTitle}`,
                        icon: '/favicon.png',
                        badge: '/favicon.png',
                        tag: `habit-${notif.habitId}`,
                        requireInteraction: true,
                        data: { habitId: notif.habitId, url: '/app' }
                    });

                    // Update
                    const updateDb = await openDB();
                    const updateTx = updateDb.transaction(STORE_NAME, 'readwrite');
                    const updateStore = updateTx.objectStore(STORE_NAME);
                    notif.lastNotified = today;
                    // @ts-ignore
                    await updateStore.put(notif);
                }
            }
        }
    } catch (e) {
        // silent fail
    }
}, 60000);

sw.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        sw.clients.openWindow(event.notification.data.url || '/app')
    );
});
