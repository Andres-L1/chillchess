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
    // ignore external API requests (auth, payments, currency rates, etc.)
    const url = event.request.url;
    if (url.includes('firebase')) return;
    if (url.includes('googleapis')) return;
    if (url.includes('google.com')) return;
    if (url.includes('gstatic.com')) return;
    if (url.includes('stripe.com')) return;
    if (url.includes('googleusercontent.com')) return;
    if (url.includes('open.er-api.com')) return; // currency converter API


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

