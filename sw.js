// V-Genesis Service Worker — PWA オフラインキャッシュ
const CACHE_NAME = 'v-genesis-v5';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(c) {
      // アセットを個別にキャッシュ（1つ失敗しても続行）
      return Promise.allSettled(ASSETS.map(function(url) {
        return c.add(url).catch(function(err) {
          console.warn('[SW] Failed to cache:', url, err);
        });
      }));
    }).then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; }).map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  var req = e.request;
  // APIリクエスト・外部URLはキャッシュしない
  if (req.url.includes('/api/') || !req.url.startsWith(self.location.origin)) {
    return; // ネットワークのみ
  }
  // ナビゲーションリクエスト: Network-first、失敗時はキャッシュ
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(function() {
        return caches.match('./index.html');
      })
    );
    return;
  }
  // 静的アセット: Cache-first
  e.respondWith(
    caches.match(req).then(function(cached) {
      return cached || fetch(req);
    })
  );
});
