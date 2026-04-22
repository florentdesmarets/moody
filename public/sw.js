const CACHE = 'moody-1.2.0'
const PRECACHE = ['/moodtracker/', '/moodtracker/index.html']

let notifTimer = null

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)))
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
  e.respondWith(
    caches.match(e.request).then(cached => cached ?? fetch(e.request).catch(() => caches.match('/index.html')))
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
      icon: '/moodtracker/icons/web-app-manifest-192x192.png',
      badge: '/moodtracker/icons/favicon-96x96.png',
      vibrate: [200, 100, 200],
    })
    scheduleNext(time, title, body)
  }, delay)
}
