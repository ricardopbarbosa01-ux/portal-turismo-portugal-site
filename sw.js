// Portugal Travel Hub — Service Worker
// Cache strategy: network-first for HTML, cache-first for static assets
const CACHE_NAME = 'ptb-v1';

// Assets to pre-cache on install (the app shell)
const SHELL = [
  '/',
  '/index.html',
  '/offline.html',
  '/beaches.html',
  '/about.html',
  '/contact.html',
  '/css/style.css',
  '/js/config.js',
];

// ── Install: cache the shell ──────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

// ── Activate: remove old caches ──────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: routing logic ──────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) return;

  // Skip non-GET requests (POST forms, Supabase writes, etc.)
  if (request.method !== 'GET') return;

  const isHTML = request.headers.get('accept')?.includes('text/html');

  if (isHTML) {
    // Network-first for HTML pages: always try to get fresh content.
    // On failure (offline), serve the offline page.
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache a fresh copy on success
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) => cached || caches.match('/offline.html')
          )
        )
    );
  } else {
    // Cache-first for CSS, JS, fonts, images.
    // Falls back to network, then to nothing (let it fail naturally).
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            // Only cache successful, opaque-safe responses
            if (response && response.status === 200 && response.type === 'basic') {
              caches.open(CACHE_NAME).then((cache) =>
                cache.put(request, response.clone())
              );
            }
            return response;
          })
      )
    );
  }
});
