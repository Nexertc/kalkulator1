
const VERSION = Date.now(); 
const CACHE_PREFIX = 'pwa-kalkulator';
const CACHE_NAME = `${CACHE_PREFIX}-v${VERSION}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}-runtime-v${VERSION}`;


const CORE_ASSETS = [
  '/', 
  '/index.html',
  '/styles.css',
  '/app.js',
  '/register-sw.js',
  '/manifest.json',
  '/icons/kalku.png',
  '/icons/kalku.png',
  '/offline.html'
];


const MAX_AGE_IMAGES = 30 * 24 * 60 * 60 * 1000; 

self.addEventListener('install', event => {
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
 
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME && !k.includes(VERSION))
          .map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
   
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    throw err;
  }
}


async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  const cache = await caches.open(RUNTIME_CACHE);
  cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;


  if (url.pathname.startsWith('/api/') || url.search.includes('api=')) {
    event.respondWith(networkFirst(request));
    return;
  }

  
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request).catch(() => caches.match('/offline.html')));
    return;
  }

  
  if (request.destination === 'image' || /\.(png|jpg|jpeg|gif|webp|svg)$/.test(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(request);
      const networkPromise = fetch(request).then(networkResponse => {
        cache.put(request, networkResponse.clone());
        return networkResponse;
      }).catch(() => null);
      return cached || networkPromise || fetch(request).catch(() => caches.match('/icons/icon-192.png'));
    })());
    return;
  }

  
  if (request.destination === 'style' || request.destination === 'script' || request.destination === 'font' ||
      /\.(css|js|woff2?|ttf|eot)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }


  event.respondWith(
    caches.match(request).then(res => res || fetch(request).catch(() => {
      if (request.mode === 'navigate') return caches.match('/offline.html');
    }))
  );
});


self.addEventListener('message', event => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});