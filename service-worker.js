var dataCacheName = 'weatherData-v1';
var cacheName = 'weatherPWA-step-6-1';
var filesToCache = [
  '/',
  '/index.html',
  '/js/creative.js',
  '/css/creative.min.css',
  '/css/creative.css',
  '/img/header.jpg',
  '/img/icon.png',
  '/img/portfolio/thumbnails/1.jpg',
  '/img/portfolio/thumbnails/2.jpg',
  '/img/portfolio/thumbnails/3.jpg',
  '/img/portfolio/thumbnails/4.jpg',
  '/img/portfolio/thumbnails/5.jpg',
  '/img/portfolio/thumbnails/6.jpg',

];

self.addEventListener('install', function(e) {
  console.log('[serviceWorker] install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache){
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key){
        if (key !== cacheName && key !== dataCacheName){
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});
