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
  if (!navigator.serviceWorker.controller) return
  const body = lang === 'fr'
    ? 'Comment tu te sens aujourd\'hui ? 😊'
    : 'How are you feeling today? 😊'
  navigator.serviceWorker.controller.postMessage({
    type: 'SCHEDULE_NOTIFICATION',
    time,
    title: 'MoodTracker',
    body,
  })
}

export function cancelNotification() {
  if (!navigator.serviceWorker.controller) return
  navigator.serviceWorker.controller.postMessage({ type: 'CANCEL_NOTIFICATION' })
}
