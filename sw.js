// CMM SMS Store - Progressive Web App Service Worker
// Bug #2 & #3 fix: bumped version to force SW re-install with corrected fetch handler
const CACHE_NAME = 'cmm-sms-store-v1.1.0';
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './anim.js',
  './boot.js',
  './manifest.json',
  './icon.svg'
];

// Install: precache core app shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-caching partial failure:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up older cache versions
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

// Fetch: Strategy for offline support without disrupting live Firebase sync
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Never cache Firebase RTDB, Firestore, Cloud Storage, or Auth API calls
  // Bug #3 fix: added firebasestorage.app to prevent photo download URLs being cached stale
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
  // Bug #2 fix: use ignoreSearch:true so versioned URLs like style.css?v=13 match
  // the cached 'style.css' entry — preventing a cache miss on every request.
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache for next time (stale-while-revalidate for local scripts)
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
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
          // Cache external fonts / CDN stylesheets
          if (url.origin.includes('fonts.googleapis.com') || url.origin.includes('fonts.gstatic.com') || url.origin === location.origin) {
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
