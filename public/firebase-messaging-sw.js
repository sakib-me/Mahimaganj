importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
// Note: These values should ideally come from environment but SW is static in public/
// User can manually update these if they need real FCM in production.
firebase.initializeApp({
  apiKey: "AIzaSyChAGeKLygboNEsm-RMEAmi3GDhuTmQRy0",
  authDomain: "gen-lang-client-0261425456.firebaseapp.com",
  projectId: "gen-lang-client-0261425456",
  storageBucket: "gen-lang-client-0261425456.firebasestorage.app",
  messagingSenderId: "610285411879",
  appId: "1:610285411879:web:7e07854bbab70df764b802",
  measurementId: ""
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
