// Import scripts required for Firebase Messaging
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC8b5pn9BLpT6fcxp4MnnwL0_b019I73N0",
  authDomain: "talentstream-b6d9d.firebaseapp.com",
  projectId: "talentstream-b6d9d",
  storageBucket: "talentstream-b6d9d.firebasestorage.app",
  messagingSenderId: "903449383023",
  appId: "1:903449383023:web:ecbca0fa89e042f84bfd9a",
  measurementId: "G-3S6PKGVXHJ"
};

// Initialize Firebase app in the service worker
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Optional: Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  // Customize notification here
  const notificationTitle = payload.notification?.title || 'Background Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/firebase-logo.png' // Change this to your app icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
