const CACHE = 'moody-3.3.0'

let notifTimer = null

self.addEventListener('install', e => {
  // On ne précache RIEN — index.html doit toujours venir du réseau
  // pour que les nouveaux assets (JS/CSS avec hash) soient toujours à jour
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  const url = new URL(e.request.url)

  // index.html et racine : toujours réseau en premier
  // → garantit qu'on charge toujours les derniers assets hachés
  if (url.pathname === '/' || url.pathname === '/index.html' || url.pathname === '') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/index.html') ?? new Response('', { status: 503 }))
    )
    return
  }

  // Autres ressources : cache first, réseau en fallback
  e.respondWith(
    caches.match(e.request).then(cached => cached ?? fetch(e.request))
  )
})

self.addEventListener('message', e => {
  if (e.data.type === 'SCHEDULE_NOTIFICATION') {
    const { time, title, body } = e.data
    scheduleNext(time, title, body)
  }
  if (e.data.type === 'CANCEL_NOTIFICATION') {
    if (notifTimer) { clearTimeout(notifTimer); notifTimer = null }
  }
})

function scheduleNext(time, title, body) {
  if (notifTimer) clearTimeout(notifTimer)
  const [h, m] = time.split(':').map(Number)
  const now = new Date()
  const next = new Date(now)
  next.setHours(h, m, 0, 0)
  if (next <= now) next.setDate(next.getDate() + 1)
  const delay = next - now
  notifTimer = setTimeout(() => {
    self.registration.showNotification(title, {
      body,
      icon: '/icons/web-app-manifest-192x192.png',
      badge: '/icons/favicon-96x96.png',
      vibrate: [200, 100, 200],
    })
    scheduleNext(time, title, body)
  }, delay)
}
