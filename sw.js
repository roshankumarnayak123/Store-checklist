// CMM SMS Store - Progressive Web App Service Worker
// v1.5.0: Enhanced PWA offline shell, PNG icons precaching, asset update synchronization
const CACHE_NAME = 'cmm-sms-store-v1.5.0';
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './anim.js',
  './boot.js',
  './manifest.json',
  './icon.svg',
  './apple-touch-icon.png'
];

// Install: precache core app shell assets immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-caching partial failure:', err);
      });
    })
  );
});

// Activate: clean up older cache versions immediately and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Purging outdated cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Allow clients to trigger immediate update
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch: Strategy for offline support without disrupting live Firebase sync
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Never cache Firebase RTDB, Firestore, Cloud Storage, or Auth API calls
  if (
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('identitytoolkit') ||
    url.hostname.includes('securetoken') ||
    url.hostname.includes('firebasestorage.app') ||
    url.hostname.includes('firebasestorage.googleapis.com') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  // 2. Cache-first strategy for local static assets and fonts
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache for next time
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
              const resClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      // Network fallback
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          // Cache external fonts / CDN stylesheets / scripts
          if (
            url.origin.includes('fonts.googleapis.com') ||
            url.origin.includes('fonts.gstatic.com') ||
            url.origin.includes('cdn.jsdelivr.net') ||
            url.origin === location.origin
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and requesting navigation, return cached index.html
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html') || caches.match('./');
          }
        });
    })
  );
});
