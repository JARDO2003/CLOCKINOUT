// Firebase Messaging Service Worker
// Gestion des notifications en arrière-plan avec la nouvelle API FCM v1

importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js');

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCPGgtXoDUycykLaTSee0S0yY0tkeJpqKI",
  authDomain: "data-com-a94a8.firebaseapp.com",
  projectId: "data-com-a94a8",
  storageBucket: "data-com-a94a8.firebasestorage.app",
  messagingSenderId: "276904640935",
  appId: "1:276904640935:web:9cd805aeba6c34c767f682"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM] Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'Nouvelle notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    tag: payload.data?.notificationId || 'default',
    data: payload.data,
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Ouvrir'
      },
      {
        action: 'close',
        title: 'Fermer'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[FCM] Notification clicked:', event);

  event.notification.close();

  const notificationData = event.notification.data;
  let targetUrl = '/';

  if (notificationData?.targetUrl) {
    targetUrl = notificationData.targetUrl;
  } else if (notificationData?.postId) {
    targetUrl = `/community?post=${notificationData.postId}`;
  }

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // If a window is already open, focus it
          for (const client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              client.focus();
              // Navigate to target URL
              client.navigate(targetUrl);
              return;
            }
          }
          // Otherwise, open a new window
          if (clients.openWindow) {
            clients.openWindow(targetUrl);
          }
        })
    );
  }
});

// Handle push events (for custom push notifications)
self.addEventListener('push', (event) => {
  console.log('[FCM] Push event received:', event);

  let notificationData = {
    title: 'Nouvelle notification',
    body: '',
    icon: '/icon-192x192.png'
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.notification?.title || notificationData.title,
        body: data.notification?.body || notificationData.body,
        icon: data.notification?.icon || notificationData.icon,
        data: data.data
      };
    } catch (e) {
      console.error('[FCM] Error parsing push data:', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      data: notificationData.data,
      badge: '/icon-72x72.png'
    })
  );
});

// Handle service worker install
self.addEventListener('install', (event) => {
  console.log('[FCM] Service Worker installing...');
  self.skipWaiting();
});

// Handle service worker activate
self.addEventListener('activate', (event) => {
  console.log('[FCM] Service Worker activated');
  event.waitUntil(self.clients.claim());
});
