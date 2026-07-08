// public/firebase-messaging-sw.js
// ✅ Updated to firebase-compat 10.x for consistency + safe fallback handling
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyC75GkUogpq7NA2JYKmnFcBPvhtqSNdWqI",
  authDomain: "saathigro-ea378.firebaseapp.com",
  databaseURL: "https://saathigro-ea378-default-rtdb.firebaseio.com",
  projectId: "saathigro-ea378",
  storageBucket: "saathigro-ea378.firebasestorage.app",
  messagingSenderId: "730414099137",
  appId: "1:730414099137:web:93d03d9d73ed01f25b4240",
  measurementId: "G-WHGN82T3LV"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);

  // ✅ Safe fallbacks — handles both notification + data-only payloads
  const title =
    payload.notification?.title ||
    payload.data?.title ||
    'SaathiGro';

  const options = {
    body: payload.notification?.body || payload.data?.body || '',
    icon: '/favicon.png',
    badge: '/favicon.png',
    data: payload.data || {},
  };

  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification?.data || {};
  const origin = self.location.origin;
  const fallbackUrl = `${origin}/notifications`;

  let targetUrl = data.link || data.url || '';
  if (!targetUrl && data.orderId) {
    targetUrl = `${origin}/orders/${data.orderId}`;
  }
  if (!targetUrl) targetUrl = fallbackUrl;

  event.waitUntil((async () => {
    const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    const sameOriginClient = allClients.find((c) => c.url.startsWith(origin));

    if (sameOriginClient) {
      await sameOriginClient.focus();
      if ('navigate' in sameOriginClient) {
        return sameOriginClient.navigate(targetUrl);
      }
      return;
    }

    await clients.openWindow(targetUrl);
  })());
});
