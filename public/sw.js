/* Shopeek service worker: offline-capable app shell, never-stale API data.
 *
 * Strategy:
 * - Precache the app shell (document, manifest, icons) on install.
 * - `/api/*` always bypasses the worker cache (network-only): sales and
 *   billing data must never be served stale.
 * - Navigations are network-first with the cached shell as offline fallback,
 *   so installed-app launches work without connectivity.
 * - Other same-origin GETs (hashed build assets) are stale-while-revalidate.
 */

const SHELL_CACHE = 'shopeek-shell-v1';
const ASSET_CACHE = 'shopeek-assets-v1';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== ASSET_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

function isApiRequest(url) {
  return url.pathname.startsWith('/api/');
}

async function networkFirstWithShellFallback(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    const cached = await caches.match('/index.html');
    if (cached) {
      return cached;
    }
    throw error;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);
  const networkPromise = fetch(request).then((response) => {
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  });
  return cached || networkPromise;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // API traffic must always hit the network; never serve cached business data.
  if (isApiRequest(url)) {
    return;
  }

  // Cross-origin subresources (fonts, analytics, turnstile) stay unmanaged.
  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithShellFallback(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});
