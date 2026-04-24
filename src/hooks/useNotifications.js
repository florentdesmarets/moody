export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false
  const perm = await Notification.requestPermission()
  return perm === 'granted'
}

export function isNotificationGranted() {
  return 'Notification' in window && Notification.permission === 'granted'
}

export function scheduleNotification(time, lang = 'fr') {
  if (!isNotificationGranted()) return
  if (!('serviceWorker' in navigator)) return
  const body = lang === 'en'
    ? 'How are you feeling today? 😊'
    : "Comment tu te sens aujourd'hui ? 😊"
  navigator.serviceWorker.ready.then(reg => {
    reg.active?.postMessage({
      type: 'SCHEDULE_NOTIFICATION',
      time,
      title: 'Moody',
      body,
    })
  })
}

export function cancelNotification() {
  if (!('serviceWorker' in navigator)) return
  navigator.serviceWorker.ready.then(reg => {
    reg.active?.postMessage({ type: 'CANCEL_NOTIFICATION' })
  })
}

/**
 * Affiche une notification native.
 * Essaie d'abord new Notification() (immédiat, fiable onglet ouvert),
 * puis fallback Service Worker si ça échoue.
 * Retourne une Promise<boolean>.
 */
export async function fireInAppNotification(lang = 'fr', force = false) {
  if (!isNotificationGranted()) return false
  const today = new Date().toISOString().slice(0, 10)
  if (!force && localStorage.getItem('lastNotifDate') === today) return false
  localStorage.setItem('lastNotifDate', today)

  const title = 'Moody 🩷'
  const body  = lang === 'en'
    ? 'How are you feeling today? 😊'
    : "Comment tu te sens aujourd'hui ? 😊"

  const options = {
    body,
    icon: '/icons/web-app-manifest-192x192.png',
    badge: '/icons/favicon-96x96.png',
    tag: 'moody-daily',
    renotify: true,
    data: { url: '/mood' },
  }

  // 1. Essai direct new Notification() — le plus simple et immédiat
  try {
    const notif = new Notification(title, options)
    notif.onclick = () => { window.focus(); window.location.href = '/mood' }
    return true
  } catch (_) { /* continue vers SW */ }

  // 2. Fallback Service Worker
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready
      await reg.showNotification(title, options)
      return true
    } catch (_) { return false }
  }

  return false
}
