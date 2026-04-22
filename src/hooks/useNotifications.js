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
      title: 'MoodTracker',
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
