/* Mobile Gallery v2.0 - High-Performance PWA Edge Service Worker */
const CACHE_NAME = 'mobile-gallery-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/categories.html',
  '/assets/recent.html',
  '/assets/orders.html',
  '/assets/checkout.html',
  '/assets/admin.html',
  '/assets/404.html',
  '/assets/css/style.css',
  '/assets/js/sheet-endpoint.js',
  '/assets/js/data.js',
  '/assets/js/ui.js',
  '/assets/js/cart.js',
  '/assets/js/app.js',
  '/assets/js/recent.js',
  '/assets/js/optimization.js',
  '/assets/js/admin.js',
  '/assets/js/checkout.js',
  '/assets/js/orders.js',
  'https://unpkg.com/lenis@1.1.18/dist/lenis.css',
  'https://unpkg.com/lenis@1.1.18/dist/lenis.min.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Exclude API requests from static caching so D1 DB queries remain live
  if (url.pathname.startsWith('/api')) return;

  // Stale-While-Revalidate Strategy for HTML, CSS, JS, Fonts & Images
  event.respondWith(
    caches.open(CACHE_NAME).then(async cache => {
      const cachedResponse = await cache.match(req);
      const fetchPromise = fetch(req).then(networkResponse => {
        if (networkResponse.ok) {
          cache.put(req, networkResponse.clone());
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
