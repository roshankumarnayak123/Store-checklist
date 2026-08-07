// CMM SMS Store - Progressive Web App Service Worker
// v2.1.0: Overdue Tools/Materials Mobile Notifications & Follow-up
const CACHE_NAME = 'cmm-sms-store-v2.1.0';
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './anim.js',
  './boot.js',
  './manifest.json',
  './icon.svg',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png'
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
    (url.hostname.includes('googleapis.com') && !url.hostname.includes('fonts.googleapis.com') && !url.hostname.includes('fonts.gstatic.com')) ||
    url.hostname.includes('identitytoolkit') ||
    url.hostname.includes('securetoken') ||
    url.hostname.includes('firebasestorage.app') ||
    url.hostname.includes('firebasestorage.googleapis.com') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  // 2. App Shell & Code (HTML, CSS, JS, Manifest): Network-First with Cache fallback
  // Ensures updates in PWA are seen immediately when online
  const isAppShell = url.origin === location.origin && (
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.json') ||
    url.pathname === '/' ||
    url.pathname.endsWith('/') ||
    event.request.mode === 'navigate'
  );

  if (isAppShell) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const resClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline or fetch failed, serve from cache
          return caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html') || caches.match('./');
            }
          });
        })
    );
    return;
  }

  // 3. Static Media, Fonts, CDNs: Stale-While-Revalidate / Cache-First
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        // Update in background
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

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) return networkResponse;
        if (
          url.origin.includes('fonts.googleapis.com') ||
          url.origin.includes('fonts.gstatic.com') ||
          url.origin.includes('cdn.jsdelivr.net') ||
          url.origin === location.origin
        ) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        }
        return networkResponse;
      });
    })
  );
});

// Notification Click: bring app window to focus and navigate to overdue/register view
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || './#overdue';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(location.origin) && 'focus' in client) {
          if (event.notification.data?.action === 'open-overdue') {
            client.postMessage({ type: 'NAVIGATE_VIEW', action: 'open-overdue', view: 'register', filter: 'overdue' });
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

