/* SIM Tool service worker: resilient app-shell caching for offline use. */
'use strict';

const CACHE_NAME = 'simtool-pwa-v11';
const OFFLINE_URL = new URL('./offline.html', self.location.href).href;
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './offline.html',
  './mpesa-card.js',
  './icons/icon-192.svg',
  './icons/icon-512.svg'
].map(path => new URL(path, self.location.href).href);

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Cache each item independently so one optional asset cannot prevent the
    // service worker from installing and make the app impossible to install.
    await Promise.all(APP_SHELL.map(async url => {
      try {
        const response = await fetch(url, { cache: 'no-cache' });
        if (response.ok) await cache.put(url, response);
      } catch (_) {
        // The next navigation can populate this item when the network returns.
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key !== CACHE_NAME)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  event.respondWith((async () => {
    try {
      const response = await fetch(event.request);
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(event.request, response.clone());
      }
      return response;
    } catch (_) {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      if (event.request.mode === 'navigate') {
        const offline = await caches.match(OFFLINE_URL);
        if (offline) return offline;
      }
      return new Response('', { status: 503, statusText: 'Offline' });
    }
  })());
});
