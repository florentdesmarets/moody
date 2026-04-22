import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useMoods() {
  const { user }   = useAuth()
  const [loading, setLoading] = useState(false)

  const fetchMonth = useCallback(async (year, month) => {
    if (!user) return {}
    setLoading(true)
    const pad = (n) => String(n).padStart(2, '0')
    const from = `${year}-${pad(month + 1)}-01`
    const lastDay = new Date(year, month + 1, 0).getDate()
    const to = `${year}-${pad(month + 1)}-${lastDay}`

    const { data, error } = await supabase
      .from('moods')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', from)
      .lte('date', to)

    setLoading(false)
    if (error) { console.error(error); return {} }
    const map = {}
    data.forEach(row => { map[row.date] = row })
    return map
  }, [user])

  const saveMood = useCallback(async ({ date, niveau, emoji, commentaire, sommeil, nourriture, fatigue }) => {
    if (!user) return { error: 'Non connecté' }
    const { data, error } = await supabase
      .from('moods')
      .upsert({
        user_id: user.id,
        date,
        niveau,
        emoji,
        commentaire: commentaire || '',
        sommeil:     sommeil     ?? null,
        nourriture:  nourriture  ?? null,
        fatigue:     fatigue     ?? null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,date' })
      .select()
      .single()
    return { data, error }
  }, [user])

  const deleteMood = useCallback(async (date) => {
    if (!user) return { error: 'Non connecté' }
    const { error } = await supabase
      .from('moods')
      .delete()
      .eq('user_id', user.id)
      .eq('date', date)
    return { error }
  }, [user])

  const getStats = useCallback((moodsMap) => {
    const entries = Object.values(moodsMap)
    if (entries.length === 0) return { count: 0, avg: 0, positive: 0, topEmoji: '😐', avgSommeil: null, avgNourriture: null, avgFatigue: null }
    const values = entries.map(m => m.niveau)
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const positive = values.filter(v => v >= 5).length
    const positivePercent = Math.round((positive / values.length) * 100)
    const freq = {}
    entries.forEach(m => { freq[m.emoji] = (freq[m.emoji] || 0) + 1 })
    const topEmoji = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '😐'
    const sleepValues = entries.map(m => m.sommeil).filter(v => v != null)
    const avgSommeil = sleepValues.length ? Math.round(sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length * 10) / 10 : null
    const foodValues = entries.map(m => m.nourriture).filter(v => v != null)
    const avgNourriture = foodValues.length ? Math.round(foodValues.reduce((a, b) => a + b, 0) / foodValues.length * 10) / 10 : null
    const fatigueValues = entries.map(m => m.fatigue).filter(v => v != null)
    const avgFatigue = fatigueValues.length ? Math.round(fatigueValues.reduce((a, b) => a + b, 0) / fatigueValues.length * 10) / 10 : null
    return { count: values.length, avg, positive: positivePercent, topEmoji, avgSommeil, avgNourriture, avgFatigue }
  }, [])

  const fetchGlobalStats = useCallback(async () => {
    if (!user) return { count: 0, streak: 0, positiveStreak: 0, positiveDaysCount: 0, commentCount: 0, longCommentCount: 0, goodSleepCount: 0, wellFedCount: 0, notTiredCount: 0 }
    const { data } = await supabase
      .from('moods')
      .select('date, niveau, commentaire, sommeil, nourriture, fatigue')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
    if (!data || data.length === 0) return { count: 0, streak: 0, positiveStreak: 0, positiveDaysCount: 0, commentCount: 0, longCommentCount: 0, goodSleepCount: 0, wellFedCount: 0, notTiredCount: 0 }

    const count = data.length
    const pad = (n) => String(n).padStart(2, '0')
    const today = new Date()

    // Streak actuel (jours consécutifs depuis aujourd'hui)
    const dateSet = new Set(data.map(m => m.date))
    let streak = 0
    for (let i = 0; i < 400; i++) {
      const d = new Date(today); d.setDate(today.getDate() - i)
      const dateStr = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
      if (dateSet.has(dateStr)) streak++; else break
    }

    // Données triées par date croissante pour les streaks positifs
    const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date))

    // Streak positif le plus long (humeur >= 5 jours consécutifs)
    let positiveStreak = 0, curPositive = 0
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].niveau >= 5) {
        // Vérifier que c'est le jour suivant
        if (i === 0) { curPositive = 1 }
        else {
          const prev = new Date(sorted[i-1].date)
          const curr = new Date(sorted[i].date)
          const diff = (curr - prev) / 86400000
          curPositive = diff === 1 ? curPositive + 1 : 1
        }
        positiveStreak = Math.max(positiveStreak, curPositive)
      } else {
        curPositive = 0
      }
    }

    const commentCount     = data.filter(m => m.commentaire && m.commentaire.trim().length > 0).length
    const longCommentCount = data.filter(m => m.commentaire && m.commentaire.trim().length >= 50).length
    const goodSleepCount   = data.filter(m => m.sommeil != null && m.sommeil >= 7).length
    const wellFedCount     = data.filter(m => m.nourriture === 3).length
    const notTiredCount    = data.filter(m => m.fatigue === 3).length
    // Courageux : a tracké même lors de jours difficiles (humeur ≤ 2)
    const hardDaysCount    = data.filter(m => m.niveau <= 2).length
    // Minutieux : entrée complète (humeur + sommeil + nourriture + fatigue)
    const thoroughCount    = data.filter(m => m.niveau && m.sommeil != null && m.nourriture != null && m.fatigue != null).length

    return { count, streak, commentCount, longCommentCount, goodSleepCount, wellFedCount, notTiredCount, hardDaysCount, thoroughCount }
  }, [user])

  return { fetchMonth, saveMood, deleteMood, getStats, fetchGlobalStats, loading }
}
