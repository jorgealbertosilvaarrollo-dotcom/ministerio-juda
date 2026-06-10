self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || '',
      icon: 'https://img.icons8.com/fluency/96/church.png',
      badge: 'https://img.icons8.com/fluency/96/church.png',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || './index.html'
      }
    };
    event.waitUntil(
      self.registration.showNotification(data.title || 'Ministerio Jóvenes', options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || './index.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
      for (const client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
