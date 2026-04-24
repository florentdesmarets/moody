// supabase/functions/send-daily-push/index.ts
// Appelée chaque minute par pg_cron → envoie les notifications push
// aux utilisateurs dont l'heure de rappel correspond à l'heure UTC courante.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// @deno-types="npm:@types/web-push"
import webpush from 'npm:web-push@3'

const SUPABASE_URL   = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const VAPID_PUBLIC   = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE  = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_EMAIL    = Deno.env.get('VAPID_EMAIL')!

webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE)

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE)

Deno.serve(async (_req) => {
  const now = new Date()
  const nowUTCMinutes = now.getUTCHours() * 60 + now.getUTCMinutes()

  // Récupère toutes les subscriptions actives avec le profil associé
  const { data: rows, error } = await supabase
    .from('push_subscriptions')
    .select(`
      endpoint, p256dh, auth, utc_offset,
      profiles!inner (
        notif_active,
        reminder_time
      )
    `)
    .eq('profiles.notif_active', true)

  if (error) {
    console.error('DB error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  const results = await Promise.allSettled(
    (rows ?? [])
      .filter((row: Record<string, unknown>) => {
        const profile = row.profiles as { notif_active: boolean; reminder_time: string }
        if (!profile?.reminder_time) return false

        const [h, m] = profile.reminder_time.split(':').map(Number)
        const localMinutes = h * 60 + m
        // utc_offset stocké en minutes positives-est (UTC+2 → 120)
        const reminderUTCMinutes = ((localMinutes - (row.utc_offset as number)) + 1440) % 1440

        return reminderUTCMinutes === nowUTCMinutes
      })
      .map(async (row: Record<string, unknown>) => {
        const title = 'Moody 🩷'
        const body  = "Comment tu te sens aujourd'hui ? 😊"

        const pushSubscription = {
          endpoint: row.endpoint as string,
          keys: { p256dh: row.p256dh as string, auth: row.auth as string },
        }

        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify({
            title,
            body,
            icon:     '/icons/web-app-manifest-192x192.png',
            data:     { url: '/mood' },
            tag:      'moody-daily',
            renotify: true,
          })
        ).catch(async (err: { statusCode?: number }) => {
          // Supprime les subscriptions expirées (410 Gone / 404)
          if (err.statusCode === 410 || err.statusCode === 404) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', row.endpoint)
          }
          throw err
        })
      })
  )

  const sent   = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length
  console.log(`[send-daily-push] Sent: ${sent}, Failed: ${failed}`)

  return new Response(JSON.stringify({ sent, failed, utcMinute: nowUTCMinutes }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
