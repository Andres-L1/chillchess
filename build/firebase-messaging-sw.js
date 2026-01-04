// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
firebase.initializeApp({
    apiKey: "AIzaSyBWDaK4iV_cUl85RoOXRwNb3npIy2sXyLo",
    authDomain: "chillchess-faa7e.firebaseapp.com",
    projectId: "chillchess-faa7e",
    storageBucket: "chillchess-faa7e.firebasestorage.app",
    messagingSenderId: "1034612088896",
    appId: "1:1034612088896:web:b1b2f0fd2cdbe58f0bc7bc",
    measurementId: "G-JRMK8TFJE9"
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
        clients.openWindow('https://chillchess.app/app')
    );
});
