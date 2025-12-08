// Service Worker Cache Strategy: Cache-First with Offline Fallback

const CACHE_NAME = 'sr-pwa-full-offline-v4'; // INCREMENTED VERSION for a fresh cache
const OFFLINE_URL = 'offline.html'; // Fallback page for navigation requests

// List ALL files required for the application to function
const urlsToCache = [
  './', // Caches the main index.html (when accessed via root URL)
  'index.html',
  'manifest.json',
  'app.js', // ⬅️ CRITICAL: Cache your main application logic
  'offline.html', // ⬅️ CRITICAL: Cache the fallback page
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
  // Note: Your HTML uses a <style> block, so no separate CSS file is needed.
  // If you were using an external stylesheet (e.g., 'styles.css'), you would add it here.
];

// --- Install Event: Caches all necessary files ---
self.addEventListener('install', event => {
    console.log('Service Worker: Installing and Caching App Shell (v4)');
    self.skipWaiting(); // Force the new SW to activate immediately
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            // Attempt to cache all critical assets. If any fail, the SW install fails.
            return cache.addAll(urlsToCache);
        })
  );
});

// --- Activate Event: Cleans up old caches ---
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Delete any cache that is NOT the current CACHE_NAME
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// --- Fetch Event: Cache-First strategy with Offline Fallback ---
self.addEventListener('fetch', event => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 1. Cache hit - return response
                if (response) {
                    return response;
                }

                // 2. Not in cache - try network
                return fetch(event.request)
                    .catch(() => {
                        // 3. Network fetch failed!
                        
                        // If it was a navigation request (i.e., trying to load a new page/URL), 
                        // serve the generic offline fallback page.
                        if (event.request.mode === 'navigate') {
                            console.log('Network failed for navigation request. Serving offline page.');
                            return caches.match(OFFLINE_URL);
                        }
                        
                        // For other requests (images, etc.), let the browser fail gracefully
                    });
            })
    );
});