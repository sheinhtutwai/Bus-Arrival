// sw.js - Basic Service Worker for PWA Installability

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // Optional: Skip waiting phase to activate immediately after install
  // self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  // Optional: Take control of clients immediately
  // event.waitUntil(clients.claim());
});

// A simple fetch listener is often needed to meet installability criteria
self.addEventListener('fetch', (event) => {
  // We don't need to do anything complex here for basic installability.
  // The browser just needs to know a fetch handler exists.
  // For a real offline experience, you'd add caching logic here.
   // console.log('Service Worker: Fetching', event.request.url);
   // event.respondWith(fetch(event.request)); // Basic pass-through
});