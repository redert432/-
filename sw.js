
const CACHE_NAME = 'najd-smart-cache-v3';
// Essential files for the app shell to work offline
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/metadata.json',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/services/geminiService.ts',
  '/services/geminiTools.ts',
  '/services/liveService.ts',
  '/utils/audio.ts',
  '/hooks/useParallax.ts',
  '/components/icons/SaduPattern.tsx',
  '/components/AiGen6Page.tsx',
  '/components/AiGen6CreativePage.tsx',
  '/components/BlueWaves.tsx',
  '/components/BrowserFrame.tsx',
  '/components/BusinessPage.tsx',
  '/components/ChatMessage.tsx',
  '/components/ChatBubble.tsx',
  '/components/Clock.tsx',
  '/components/CorporateResearchPage.tsx',
  '/components/DarkWaves.tsx',
  '/components/DashboardWidgets.tsx',
  '/components/DesertNightSky.tsx',
  '/components/DigitalDesert.tsx',
  '/components/FooterContent.tsx',
  '/components/Header.tsx',
  '/components/HomePage.tsx',
  '/components/InteractiveDarkBackground.tsx',
  '/components/LiveConversationPage.tsx',
  '/components/LoadingSpinner.tsx',
  '/components/MeetingPage.tsx',
  '/components/ModernSky.tsx',
  '/components/NajdiAiPage.tsx',
  '/components/NajdiConnectPage.tsx',
  '/components/NajdiEmailPage.tsx',
  '/components/NajdiLogo.tsx',
  '/components/NajdiSpeedTestPage.tsx',
  '/components/PresentationBuilderPage.tsx',
  '/components/ProjectSpacePage.tsx',
  '/components/PulsingStars.tsx',
  '/components/SearchBar.tsx',
  '/components/SearchPage.tsx',
  '/components/SearchResults.tsx',
  '/components/SpreadsheetGrid.tsx',
  '/components/SpreadsheetPage.tsx',
  '/components/ThinkingModeSwitch.tsx',
  '/components/TrendingSearches.tsx',
  '/components/TtsPage.tsx',
  '/components/WebAppBuilderPage.tsx',
  '/components/Weather.tsx',
  '/components/WordProcessorPage.tsx',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
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
            console.log('Deleting old cache:', cacheName);
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
