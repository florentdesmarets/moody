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
 * Essaie SW showNotification puis new Notification() en fallback.
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
    tag: 'moody-daily',
    renotify: true,
    data: { url: '/mood' },
  }

  // 1. Service Worker showNotification (plus fiable sur Chromium/Opera)
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      const reg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) => setTimeout(() => reject(new Error('SW timeout')), 3000)),
      ])
      await reg.showNotification(title, options)
      return true
    } catch (_) { /* continue vers fallback */ }
  }

  // 2. Fallback : new Notification() direct
  try {
    const notif = new Notification(title, options)
    notif.onclick = () => { window.focus(); window.location.href = '/mood' }
    return true
  } catch (_) { return false }
}
