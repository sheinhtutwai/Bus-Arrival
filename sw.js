// sw.js - Basic Service Worker for PWA Installability

const CACHE_NAME = 'bus-arrivals-v1';
const urlsToCache = [
  '/', // Or '/index.html' if that's your explicit start page
  '/index.html', // Include the main HTML file
  // Add other essential assets like CSS, main JS file if separate, icons
  '/manifest.json',
  '/icons/icon-192x192.png' // Example: Add your main icon
  // Add other icons if needed for offline splash screen
];

// Install event: Cache core assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching core assets');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Core assets cached successfully');
        self.skipWaiting(); // Activate the new SW immediately
      })
      .catch(error => {
        console.error('Service Worker: Caching failed', error);
      })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
        console.log('Service Worker: Claiming clients');
        return self.clients.claim(); // Take control of pages immediately
    })
  );
});


// Fetch event: Serve from cache if available, otherwise fetch from network
// This basic version prioritizes network to always get fresh bus times.
// A more advanced strategy could cache API responses briefly or serve stale data while fetching.
self.addEventListener('fetch', event => {
  // We only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // For API calls to arrivelah, always go to the network first.
  if (event.request.url.includes('arrivelah2.busrouter.sg')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // For other requests (HTML, CSS, JS, images), try cache first, then network.
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          // console.log('Service Worker: Serving from cache:', event.request.url);
          return response;
        }

        // Not in cache - fetch from network
        // console.log('Service Worker: Fetching from network:', event.request.url);
        return fetch(event.request).then(
          networkResponse => {
            // Optional: Cache the newly fetched resource for next time
            // Be careful not caching everything, especially large files or things that change often
            // if (urlsToCache.includes(new URL(event.request.url).pathname)) { // Only cache predefined assets
            //   let responseToCache = networkResponse.clone();
            //   caches.open(CACHE_NAME)
            //     .then(cache => {
            //       cache.put(event.request, responseToCache);
            //     });
            // }
            return networkResponse;
          }
        ).catch(error => {
          console.error('Service Worker: Fetch failed:', error);
          // Optional: return an offline fallback page if network fails
          // return caches.match('/offline.html');
        });
      })
  );
});