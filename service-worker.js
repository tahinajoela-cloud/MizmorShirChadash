const CACHE_NAME = 'mizmor-shir-v1';
const ASSETS = ['/', '/index.html', '/home.html', '/script.js', '/style.css', '/papaparse.min.js', '/icon-512_100527.png'];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
    e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
