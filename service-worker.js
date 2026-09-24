const CACHE_NAME = 'simtool-pwa-v8';
const OFFLINE_URL = './offline.html';
const APP_SHELL = ['./','./index.html','./manifest.json','./offline.html','./mpesa-card.js','./icons/icon-192.svg','./icons/icon-512.svg'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  event.respondWith(
    fetch(request).then(response => {
      if (!response.ok) return response;
      if (new URL(request.url).origin !== self.location.origin) return response;
      if (request.mode === 'navigate' || request.url.endsWith('/index.html')) {
        return response.clone().text().then(html => {
          const injected = html.replace('</body>', '<script src="./mpesa-card.js"></script></body>');
          const transformed = new Response(injected, { status: response.status, statusText: response.statusText, headers: response.headers });
          caches.open(CACHE_NAME).then(cache => cache.put(request, transformed.clone()));
          return transformed;
        });
      }
      caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
      return response;
    }).catch(() => caches.match(request).then(cached => cached || (request.mode === 'navigate' ? caches.match(OFFLINE_URL) : Response.error())))
  );
});
