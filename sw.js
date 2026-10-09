// Portal Turismo Portugal — Service Worker
// v12 (Lote H2, 09/10/2026): app instalavel em todo o site (js/pwa.js regista este SW em todas as paginas).
// - HTML: rede primeiro; sem rede -> copia guardada -> /offline.
// - CSS/JS com ?v= , imagens e fontes: cache primeiro (o ?v= muda a cada alteracao).
// - JSON e JS/CSS sem ?v= (ex.: /data/*.json, /js/config.js): rede primeiro, cache so como reserva sem rede
//   (antes era cache primeiro -> dados como marés e celulas Open-Meteo podiam ficar velhos para sempre).
// - Pre-cache tolerante (um ficheiro em falta ja nao impede a instalacao) e sem URLs .html (fazem 308 no Cloudflare).
// - Cache de execucao limitada a 180 entradas.
const SHELL_CACHE = 'ptb-shell-v12';
const RT_CACHE = 'ptb-rt-v12';
const RT_MAX = 180;
const SHELL = ['/', '/en/', '/offline', '/manifest.webmanifest', '/en/manifest.webmanifest', '/favicon.svg', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      Promise.all(SHELL.map((u) => cache.add(new Request(u, { cache: 'reload' })).catch(() => null)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== SHELL_CACHE && k !== RT_CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function trim() {
  return caches.open(RT_CACHE).then((cache) =>
    cache.keys().then((keys) => {
      if (keys.length <= RT_MAX) return null;
      return Promise.all(keys.slice(0, keys.length - RT_MAX).map((k) => cache.delete(k)));
    })
  ).catch(() => null);
}
function save(request, response) {
  if (!response || response.status !== 200 || response.type !== 'basic' || response.redirected) return;
  const copy = response.clone();
  caches.open(RT_CACHE).then((cache) => cache.put(request, copy)).then(trim).catch(() => null);
}
function networkFirst(request, fallbackUrl) {
  return fetch(request).then((response) => { save(request, response); return response; }).catch(() =>
    caches.match(request).then((hit) => hit || (fallbackUrl ? caches.match(fallbackUrl) : undefined)).then((hit) => hit || Response.error())
  );
}
function cacheFirst(request) {
  return caches.match(request).then((hit) => hit || fetch(request).then((response) => { save(request, response); return response; }));
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname === '/sw.js') return;

  const accept = request.headers.get('accept') || '';
  if (request.mode === 'navigate' || accept.includes('text/html')) {
    event.respondWith(networkFirst(request, '/offline'));
    return;
  }
  const p = url.pathname;
  const versioned = url.searchParams.has('v');
  const isAsset = /\.(?:png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|otf)$/i.test(p);
  if (versioned || isAsset) { event.respondWith(cacheFirst(request)); return; }
  if (/\.(?:js|css|json|webmanifest)$/i.test(p)) { event.respondWith(networkFirst(request)); return; }
  // Resto (ex.: endpoints, ficheiros sem extensao conhecida): deixa o browser tratar.
});
