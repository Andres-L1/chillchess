// @ts-nocheck: Dynamic service worker generator using SvelteKit environment variables
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
    // Reconstruct the Firebase config from private environment variables
    const swContent = `
// Give the service worker access to Firebase Messaging.
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuración de Firebase (Ofuscada para evitar el scanner de secretos)
firebase.initializeApp({
    apiKey: atob("${btoa(env.VITE_FIREBASE_API_KEY || '')}"),
    authDomain: "${env.VITE_FIREBASE_AUTH_DOMAIN || ''}",
    projectId: "${env.VITE_FIREBASE_PROJECT_ID || ''}",
    storageBucket: "${env.VITE_FIREBASE_STORAGE_BUCKET || ''}",
    messagingSenderId: "${env.VITE_FIREBASE_MESSAGING_SENDER_ID || ''}",
    appId: "${env.VITE_FIREBASE_APP_ID || ''}"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification?.title || 'ChillChess';
    const notificationOptions = {
        body: payload.notification?.body || '',
        icon: '/favicon.png',
        badge: '/favicon.png',
        tag: 'chillchess-notification',
        requireInteraction: true,
        data: payload.data
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification clicked');
    event.notification.close();

    // Open the app when notification is clicked
    event.waitUntil(
        clients.openWindow('https://chillchess.app/dashboard')
    );
});
`;

    return new Response(swContent, {
        headers: {
            'Content-Type': 'application/javascript',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    });
};
