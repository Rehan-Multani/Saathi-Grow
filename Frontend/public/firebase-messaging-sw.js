// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

// These values are hardcoded for SaathiGro. In production, these should match the Firebase project.
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
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg', // Update with actual icon
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
