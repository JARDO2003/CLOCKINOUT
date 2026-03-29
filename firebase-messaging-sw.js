// NEXUS Enterprise — Firebase Messaging Service Worker
// Déployer ce fichier à la racine de votre domaine (même niveau que dashboard.html)

importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCPGgtXoDUycykLaTSee0S0yY0tkeJpqKI",
  authDomain: "data-com-a94a8.firebaseapp.com",
  projectId: "data-com-a94a8",
  storageBucket: "data-com-a94a8.firebasestorage.app",
  messagingSenderId: "276904640935",
  appId: "1:276904640935:web:9cd805aeba6c34c767f682"
});

const messaging = firebase.messaging();

// Afficher la notification quand l'app est en arrière-plan
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  const notifTitle = title || 'NEXUS';
  const notifOptions = {
    body: body || '',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: 'nexus-notification',
    data: payload.data || {},
    actions: [
      { action: 'open', title: 'Voir' },
      { action: 'dismiss', title: 'Ignorer' }
    ],
    vibrate: [200, 100, 200]
  };
  self.registration.showNotification(notifTitle, notifOptions);
});

// Clic sur la notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('dashboard') && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/dashboard.html');
    })
  );
});
