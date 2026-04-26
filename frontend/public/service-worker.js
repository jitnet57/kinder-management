/**
 * Service Worker for AKMS Push Notifications
 * Handles push events and notification display
 */

const CACHE_NAME = 'akms-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache opened');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Service Worker: Cache add error', error);
      })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        return fetch(event.request).then((response) => {
          // Clone the response
          const responseClone = response.clone();

          // Cache the response for offline use
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });

          return response;
        });
      })
      .catch(() => {
        // Return a custom offline page or response
        console.log('Service Worker: Fetch failed, returning offline response');
      })
  );
});

// Push event
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push event received', event);

  let notificationData = {
    title: '새로운 알림',
    body: '새로운 알림이 도착했습니다.',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'akms-notification',
  };

  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (error) {
      notificationData.body = event.data.text();
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon || '/icon-192x192.png',
    badge: notificationData.badge || '/badge-72x72.png',
    tag: notificationData.tag || 'akms-notification',
    requireInteraction: notificationData.requireInteraction || false,
    actions: notificationData.actions || [
      {
        action: 'open',
        title: '열기',
      },
      {
        action: 'close',
        title: '닫기',
      },
    ],
    data: {
      url: notificationData.url || '/',
      ...notificationData,
    },
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event);

  event.notification.close();

  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    }).then((clientList) => {
      // Check if the app is already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If app is not open, open it
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('Service Worker: Notification closed', event);
  // Track user dismissal if needed
});

// Background sync event (for offline notifications)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notifications') {
    event.waitUntil(
      // Sync pending notifications when back online
      new Promise((resolve, reject) => {
        console.log('Service Worker: Syncing notifications');
        resolve();
      })
    );
  }
});

// Message event (communication from clients)
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: 'v1.0.0',
    });
  }
});
