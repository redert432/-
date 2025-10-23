const CACHE_NAME = 'najd-smart-cache-v2';
// Essential files for the app shell to work offline
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/metadata.json',
  '/types.ts',
  '/components/SearchPage.tsx',
  '/components/HomePage.tsx',
  '/components/Header.tsx',
  '/services/geminiService.ts'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(APP_SHELL_URLS);
      })
      .catch(err => {
        console.error('Failed to cache app shell:', err);
      })
  );
});

// Clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // Always go to the network for external APIs
  if (requestUrl.hostname !== self.location.hostname) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Use a cache-first strategy for all other local assets
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).then(networkResponse => {
          // If we get a valid response, clone it and cache it for future use
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
          return networkResponse;
        }).catch(error => {
            console.error('Fetch failed; a cached response was not found.', error);
            // Optional: return a fallback offline page if one was cached
            // return caches.match('/offline.html');
        });
      })
  );
});