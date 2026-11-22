// Service worker: guarda el juego en el móvil para poder jugar sin conexión.
// Sube el número de versión cada vez que cambie algún archivo del juego.
const VERSION = 'rush-politic-v1';
const FILES = [
  './', './index.html', './css/style.css', './manifest.webmanifest',
  './vendor/three.module.min.js',
  './js/main.js', './js/config.js', './js/geom.js', './js/world.js', './js/enemies.js',
  './js/combat.js', './js/player.js', './js/gates.js', './js/boss.js', './js/audio.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-512-maskable.png', './icons/apple-touch-icon.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// Red primero (para recibir actualizaciones) y caché si no hay conexión.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok && new URL(e.request.url).origin === location.origin) {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
