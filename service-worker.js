const CACHE_NAME = 'mizmor-shir-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/home.html',
    '/script.js',
    '/style.css'
];

// Fandraisana ireo rakitra
self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

// Fampiasana rakitra avy amin'ny cache
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then(response => response || fetch(e.request))
    );
});