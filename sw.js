const CACHE = 'nyxioagency-v13';

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => Promise.resolve()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      if(res && res.status === 200 && e.request.method === 'GET'){
        var clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request)))
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'NYXIO_NOTIF') {
    const opts = {
      body: e.data.body || '',
      icon: 'https://api.dicebear.com/7.x/initials/svg?seed=NA&backgroundColor=7c3aed&fontSize=40',
      badge: 'https://api.dicebear.com/7.x/initials/svg?seed=NA&backgroundColor=7c3aed&fontSize=40',
      vibrate: [100, 50, 100],
      tag: 'nyxio-notif',
      renotify: true,
      data: { url: self.registration.scope }
    };
    e.waitUntil(self.registration.showNotification('NyxioAgency', opts));
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      if (list.length > 0) return list[0].focus();
      return clients.openWindow('/');
    })
  );
});
