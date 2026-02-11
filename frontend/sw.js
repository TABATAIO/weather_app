// Service Worker for Weather App PWA
// バージョン管理
const CACHE_NAME = 'weather-app-v1.0.0';
const OFFLINE_URL = '/index.html';

// キャッシュするリソース
const urlsToCache = [
  '/',
  '/index.html',
  '/css/main.css',
  '/css/components.css',
  '/css/variables.css',
  '/css/responsive.css',
  '/css/animations.css',
  '/css/accessibility.css',
  '/js/app.js',
  '/js/services/weather-service.js',
  '/js/services/mascot-manager.js',
  '/js/services/notification-service.js',
  '/js/services/background-controller.js',
  '/js/services/performance-monitor.js',
  '/js/modules/api-client.js',
  '/js/modules/ui-state-manager.js',
  '/js/modules/error-boundary.js',
  '/js/modules/chat-interface.js',
  '/img/icon.svg',
  '/img/favicon.svg',
  '/manifest.json'
];

// Service Worker インストール
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('Service Worker: Cache failed:', error);
      })
  );
});

// Service Worker アクティベート
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch イベントハンドラ
self.addEventListener('fetch', (event) => {
  // APIリクエストの処理
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // 成功時はネットワークレスポンスを返す
          return response.clone();
        })
        .catch(() => {
          // オフライン時のフォールバック
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // 静的ファイルの処理（Cache First 戦略）
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュにあればそれを返す
        if (response) {
          return response;
        }

        // ネットワークから取得を試す
        return fetch(event.request)
          .then((response) => {
            // レスポンスが有効でない場合
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // レスポンスをキャッシュに保存
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // オフライン時は基本HTMLを返す
            return caches.match(OFFLINE_URL);
          });
      })
  );
});

// プッシュ通知の処理
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  
  const options = {
    body: data.body || '天気情報が更新されました',
    icon: '/img/icon.svg',
    badge: '/img/favicon.svg',
    tag: 'weather-update',
    renotify: true,
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: '確認する'
      },
      {
        action: 'close',
        title: '閉じる'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '天気アプリ', options)
  );
});

// 通知クリックの処理
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// バックグラウンド同期（将来の拡張用）
self.addEventListener('sync', (event) => {
  if (event.tag === 'weather-data-sync') {
    event.waitUntil(
      // 天気データの同期処理
      self.registration.sync.register('weather-data-sync')
    );
  }
});

// エラー処理
self.addEventListener('error', (event) => {
  console.error('Service Worker: Error', event.error);
});

// 未処理のPromise拒否
self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker: Unhandled promise rejection', event.reason);
});