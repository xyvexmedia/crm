const CACHE_NAME = 'xyvex-crm-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Always fetch live from network first, so user immediately sees updates
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
