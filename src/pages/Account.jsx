import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import BgBlobs from '../components/BgBlobs'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { supabase } from '../lib/supabase'
import { useMoods } from '../hooks/useMoods'
import { translations } from '../context/LangContext'
import { BADGES, computeBadges, getAvatar } from '../lib/badges'
import { useTheme } from '../context/ThemeContext'
import { requestNotificationPermission, isNotificationGranted, scheduleNotification, cancelNotification, fireInAppNotification } from '../hooks/useNotifications'
import { shareBadge } from '../lib/shareBadge'

function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={`relative w-10 h-6 rounded-full transition-colors duration-300 border-none cursor-pointer flex-shrink-0 ${checked ? 'bg-[#5DC98A]' : 'bg-[#ccc]'}`}>
      <span className="absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-transform duration-300"
        style={{ transform: checked ? 'translateX(-19px)' : 'translateX(1px)' }} />
    </button>
  )
}

function EditField({ placeholder, onSave, onCancel, t }) {
  const [val, setVal] = useState('')
  return (
    <div className="py-2">
      <input type="text" placeholder={placeholder} value={val} onChange={e => setVal(e.target.value)}
        className="w-full bg-[#fff3ee] rounded-full px-4 py-2 text-[13px] text-[#555] outline-none border-none mb-2" />
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-2 rounded-full text-[12px] font-bold text-[#FF7040] bg-[#fff3ee] border-none cursor-pointer">{t('cancel')}</button>
        <button onClick={() => val && onSave(val)} className="flex-1 py-2 rounded-full text-[12px] font-bold text-white bg-[#FF8040] border-none cursor-pointer">{t('save')}</button>
      </div>
    </div>
  )
}

function CardRow({ label, value, editContent }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <div className="flex justify-between items-center py-2.5 border-b border-[#f5ede5]">
        <div>
          <p className="text-[11px] text-[#aaa] font-semibold uppercase tracking-wide">{label}</p>
          <p className="text-[14px] text-[#444] font-semibold">{value}</p>
        </div>
        <button onClick={() => setOpen(v => !v)} className="text-[12px] text-[#FF8040] font-bold bg-transparent border-none cursor-pointer">
          {open ? '✕' : 'Modifier'}
        </button>
      </div>
      {open && editContent(() => setOpen(false))}
    </div>
  )
}

export default function Account() {
  const navigate = useNavigate()
  const { user, profile, signOut, updateProfile } = useAuth()
  const { t, lang, setLang } = useLang()
  const { themeId, changeTheme, themes } = useTheme()
  const { fetchGlobalStats, fetchMonth, getStats } = useMoods()
  const [showDelete,        setShowDelete]        = useState(false)
  const [showClearHistory,  setShowClearHistory]  = useState(false)
  const [notifActive,       setNotifActive]       = useState(profile?.notif_active ?? false)
  const [reminderTime,      setReminderTime]      = useState(profile?.reminder_time ?? '20:00')
  const [soundActive,       setSoundActive]       = useState(() => localStorage.getItem('soundFx') === 'true')
  const [notifBlocked,      setNotifBlocked]      = useState(false)
  const [showPermHelp,      setShowPermHelp]      = useState(false)
  const [testState,         setTestState]         = useState(null) // null | 'sending' | 'ok' | 'fail'
  const [toast,             setToast]             = useState(null)
  const [textSize,          setTextSize]          = useState(() => localStorage.getItem('textSize') ?? 'md')
  const [badges,            setBadges]            = useState([])
  const [globalStats,       setGlobalStats]       = useState({ count: 0, streak: 0 })

  // Sync depuis le profil dès qu'il est chargé (profile = null au premier render)
  useEffect(() => {
    if (!profile) return
    setNotifActive(profile.notif_active ?? false)
    setReminderTime(profile.reminder_time ?? '20:00')
    // Reschedule la notification si active (timer SW perdu après rechargement)
    if (profile.notif_active && profile.reminder_time && isNotificationGranted()) {
      scheduleNotification(profile.reminder_time, lang)
    }
  }, [profile?.notif_active, profile?.reminder_time]) // eslint-disable-line

  useEffect(() => {
    fetchGlobalStats().then(stats => {
      setGlobalStats(stats)
      setBadges(computeBadges(stats))
    })
  }, []) // eslint-disable-line

  async function handleToggleNotif(v) {
    if (v) {
      const granted = isNotificationGranted() || await requestNotificationPermission()
      if (!granted) { setNotifBlocked(true); return }
      setNotifBlocked(false)
      setNotifActive(true)
      handleSave('notif_active', true)
      scheduleNotification(reminderTime, lang)
    } else {
      setNotifActive(false)
      handleSave('notif_active', false)
      cancelNotification()
    }
  }

  async function handleTimeChange(t) {
    setReminderTime(t)
    handleSave('reminder_time', t)
    localStorage.removeItem('lastNotifDate') // reset pour que la nouvelle heure puisse se déclencher aujourd'hui
    if (notifActive && isNotificationGranted()) scheduleNotification(t, lang)
  }

  async function handleSetAvatar(id) {
    await updateProfile({ avatar: id })
  }

  async function handleShare(badge) {
    await shareBadge({
      emoji:     badge.emoji,
      labelFull: t(badge.labelKey),
      desc:      t(badge.descKey),
      lang,
    })
  }

  async function handleLogout() { await signOut(); navigate('/') }

  async function handleDeleteAccount() {
    // 1. Supprimer toutes les entrées d'humeur de l'utilisateur
    const { error: moodsError } = await supabase
      .from('moods').delete().eq('user_id', user.id)
    if (moodsError) { alert(moodsError.message); return }

    // 2. Supprimer le profil
    const { error: profileError } = await supabase
      .from('profiles').delete().eq('id', user.id)
    if (profileError) { alert(profileError.message); return }

    // 3. Supprimer le compte auth (les FK sont maintenant libres)
    const { error } = await supabase.rpc('delete_user')
    if (error) { alert(error.message); return }

    await signOut()
    navigate('/')
  }
  async function handleSave(field, value) { await updateProfile({ [field]: value }) }

  function handleTextSize(size) {
    setTextSize(size)
    localStorage.setItem('textSize', size)
    const zoomMap = { sm: '92%', md: '100%', lg: '108%', xl: '115%' }
    document.documentElement.style.zoom = zoomMap[size] ?? '100%'
  }

  async function handleExportPDF() {
    // Ouvrir la fenêtre en premier (synchrone) — les navigateurs bloquent window.open après un await
    const w = window.open('', '_blank')
    if (!w) {
      alert(lang === 'fr'
        ? 'Autorise les popups dans ton navigateur pour générer le PDF.'
        : 'Allow popups in your browser to generate the PDF.')
      return
    }

    const today = new Date()
    const year  = today.getFullYear()
    const month = today.getMonth()
    const data    = await fetchMonth(year, month)
    const entries = Object.values(data).sort((a, b) => a.date.localeCompare(b.date))
    const stats = getStats(data)

    // ── months doit être défini avant tagCorrelHTML ────────────────────────
    const months = t('months')

    // ── Calcul corrélation tags (mois sélectionné uniquement) ──────────────
    const tagsFR = translations.fr.tags
    const tagsEN = translations.en.tags
    const tagList = lang === 'en' ? tagsEN : tagsFR

    function hasTag(commentaire, idx) {
      if (!commentaire) return false
      const parts = commentaire.split(/,\s*/).map(p => p.trim())
      return parts.includes(tagsFR[idx]) || parts.includes(tagsEN[idx])
    }

    const tagAnalysis = entries.length >= 3
      ? tagsFR.map((_, idx) => {
          const withTag    = entries.filter(m => hasTag(m.commentaire, idx))
          const withoutTag = entries.filter(m => !hasTag(m.commentaire, idx))
          if (withTag.length < 2 || withoutTag.length < 1) return null
          const avgWith    = withTag.reduce((s, m) => s + m.niveau, 0) / withTag.length
          const avgWithout = withoutTag.reduce((s, m) => s + m.niveau, 0) / withoutTag.length
          const impact     = avgWith - avgWithout
          const conf       = withTag.length >= 8 ? (lang === 'en' ? 'Reliable' : 'Fiable')
                           : withTag.length >= 4 ? (lang === 'en' ? 'Indicative' : 'Indicatif')
                           : (lang === 'en' ? 'Unconfirmed' : 'À confirmer')
          return { label: tagList[idx], impact, avgWith, avgWithout, count: withTag.length, conf }
        }).filter(Boolean).sort((a, b) => b.impact - a.impact)
      : []

    const tagHelps  = tagAnalysis.filter(t => t.impact >=  0.3)
    const tagDrains = tagAnalysis.filter(t => t.impact <= -0.3)

    const tagCorrelHTML = (tagHelps.length > 0 || tagDrains.length > 0) ? `
<h2>${lang === 'en' ? 'Activity impact on mood' : 'Impact des activités sur l\'humeur'} — ${months[month]} ${year}</h2>
<table style="font-size:11px;">
  <thead><tr style="background:#fff8f5;">
    <th style="text-align:left;padding:6px;color:#bbb;font-weight:600;">${lang === 'en' ? 'Activity' : 'Activité'}</th>
    <th style="text-align:center;padding:6px;color:#bbb;font-weight:600;">${lang === 'en' ? 'Impact' : 'Impact'}</th>
    <th style="text-align:center;padding:6px;color:#bbb;font-weight:600;">${lang === 'en' ? 'With' : 'Avec'}</th>
    <th style="text-align:center;padding:6px;color:#bbb;font-weight:600;">${lang === 'en' ? 'Without' : 'Sans'}</th>
    <th style="text-align:center;padding:6px;color:#bbb;font-weight:600;">N</th>
    <th style="text-align:center;padding:6px;color:#bbb;font-weight:600;">${lang === 'en' ? 'Reliability' : 'Fiabilité'}</th>
  </tr></thead>
  <tbody>
    ${tagHelps.length > 0 ? `<tr><td colspan="6" style="background:#f0fdf4;color:#16a34a;font-weight:700;font-size:10px;padding:6px 6px 4px;text-transform:uppercase;letter-spacing:1px;">✨ ${lang === 'en' ? 'What helps' : 'Ce qui aide'}</td></tr>` : ''}
    ${tagHelps.map(t => `<tr>
      <td style="padding:5px 6px;border-bottom:1px solid #f5ede5;">${t.label}</td>
      <td style="padding:5px 6px;border-bottom:1px solid #f5ede5;color:#16a34a;font-weight:700;text-align:center;">+${t.impact.toFixed(1)}</td>
      <td style="padding:5px 6px;border-bottom:1px solid #f5ede5;text-align:center;">${t.avgWith.toFixed(1)}/7</td>
      <td style="padding:5px 6px;border-bottom:1px solid #f5ede5;text-align:center;">${t.avgWithout.toFixed(1)}/7</td>
      <td style="padding:5px 6px;border-bottom:1px solid #f5ede5;text-align:center;">${t.count}×</td>
      <td style="padding:5px 6px;border-bottom:1px solid #f5ede5;text-align:center;font-size:10px;color:#64748b;">${t.conf}</td>
    </tr>`).join('')}
    ${tagDrains.length > 0 ? `<tr><td colspan="6" style="background:#fff1f2;color:#dc2626;font-weight:700;font-size:10px;padding:6px 6px 4px;text-transform:uppercase;letter-spacing:1px;">😔 ${lang === 'en' ? 'What affects' : 'Ce qui affecte'}</td></tr>` : ''}
    ${[...tagDrains].reverse().map(t => `<tr>
      <td style="padding:5px 6px;border-bottom:1px solid #f5ede5;">${t.label}</td>
      <td style="padding:5px 6px;border-bottom:1px solid #f5ede5;color:#dc2626;font-weight:700;text-align:center;">${t.impact.toFixed(1)}</td>
      <td style="padding:5px 6px;border-bottom:1px solid #f5ede5;text-align:center;">${t.avgWith.toFixed(1)}/7</td>
      <td style="padding:5px 6px;border-bottom:1px solid #f5ede5;text-align:center;">${t.avgWithout.toFixed(1)}/7</td>
      <td style="padding:5px 6px;border-bottom:1px solid #f5ede5;text-align:center;">${t.count}×</td>
      <td style="padding:5px 6px;border-bottom:1px solid #f5ede5;text-align:center;font-size:10px;color:#64748b;">${t.conf}</td>
    </tr>`).join('')}
  </tbody>
</table>` : ''

    const MOOD_COLORS = ['#ddd','#FF4F4F','#FF7A4F','#FFB347','#FFD700','#9ACD32','#4CAF50','#3DBF7F']
    const pad = n => String(n).padStart(2, '0')

    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const CHART_H = 110
    const BAR_W = 9, BAR_STEP = 11
    const CHART_W = daysInMonth * BAR_STEP

    // Lignes de grille horizontales
    const gridLines = [0.25, 0.5, 0.75, 1].map(r =>
      `<line x1="0" y1="${CHART_H - r * CHART_H}" x2="${CHART_W}" y2="${CHART_H - r * CHART_H}" stroke="#e5e7eb" stroke-width="0.5"/>`
    ).join('')

    const bars = Array.from({ length: daysInMonth }, (_, i) => {
      const dateStr = `${year}-${pad(month+1)}-${pad(i+1)}`
      const e = data[dateStr]
      const h = e ? Math.max((e.niveau / 7) * CHART_H, 5) : 0
      return h ? `<rect x="${i * BAR_STEP}" y="${CHART_H - h}" width="${BAR_W}" height="${h}" fill="${MOOD_COLORS[e.niveau]}" rx="2" opacity="0.75"/>` : ''
    }).join('')

    // Courbe sommeil — 0h→12h normalisé
    const sleepPoints = []
    for (let i = 0; i < daysInMonth; i++) {
      const dateStr = `${year}-${pad(month+1)}-${pad(i+1)}`
      const e = data[dateStr]
      if (e?.sommeil != null) {
        sleepPoints.push({
          x: i * BAR_STEP + BAR_W / 2,
          y: CHART_H - (Math.min(Math.max(e.sommeil, 0), 12) / 12) * CHART_H,
          h: e.sommeil,
        })
      }
    }

    const sleepPath = sleepPoints.length > 1
      ? `<polyline points="${sleepPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}" fill="none" stroke="#6366f1" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>`
      : ''
    const sleepDots = sleepPoints.map(p =>
      `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2.5" fill="white" stroke="#6366f1" stroke-width="1.5"/>`
    ).join('')

    // Courbe fatigue — 1-3 normalisé
    const fatiguePoints = []
    for (let i = 0; i < daysInMonth; i++) {
      const dateStr = `${year}-${pad(month+1)}-${pad(i+1)}`
      const e = data[dateStr]
      if (e?.fatigue != null) {
        fatiguePoints.push({
          x: i * BAR_STEP + BAR_W / 2,
          y: CHART_H - ((e.fatigue - 1) / 2) * CHART_H,
        })
      }
    }
    const fatiguePath = fatiguePoints.length > 1
      ? `<polyline points="${fatiguePoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}" fill="none" stroke="#f59e0b" stroke-width="1.8" stroke-dasharray="4 2" stroke-linejoin="round" stroke-linecap="round"/>`
      : ''

    const isEn = lang === 'en'
    const MOOD_LABELS_LOC = isEn
      ? ['—','Very hard','Hard','Below avg','Neutral','Pretty good','Good','Excellent']
      : ['—','Très difficile','Difficile','Moyen bas','Neutre','Plutôt bien','Bien','Excellent']

    const tagCounts = {}
    entries.forEach(e => {
      if (e.commentaire) e.commentaire.split(', ').forEach(tag => { tagCounts[tag] = (tagCounts[tag] || 0) + 1 })
    })
    const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 10)

    const FOOD_LABELS = isEn
      ? { 3: '🍽️ Ate well', 2: '🥗 Ate a little', 1: "😔 Didn't eat" }
      : { 3: '🍽️ Bien mangé', 2: '🥗 Peu mangé', 1: '😔 Pas mangé' }
    const FAT_LABELS = isEn
      ? { 3: '⚡ Not tired', 2: '😌 A little tired', 1: '😓 Very tired' }
      : { 3: '⚡ Pas fatigué·e', 2: '😌 Un peu fatigué·e', 1: '😓 Très fatigué·e' }

    const html = `<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8"/>
<title>Moody — ${months[month]} ${year}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; padding: 36px; max-width: 780px; margin: auto; }
  h1 { color: #FF7040; font-size: 24px; margin: 0 0 4px; }
  .sub { color: #999; font-size: 13px; margin-bottom: 28px; }
  h2 { font-size: 11px; text-transform: uppercase; color: #bbb; letter-spacing: 1.5px; border-bottom: 1px solid #f0e8e0; padding-bottom: 6px; margin: 24px 0 12px; }
  .stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }
  .stat { background: #fff8f5; border-radius: 12px; padding: 14px; text-align: center; }
  .stat-val { font-size: 24px; font-weight: 800; color: #FF7040; }
  .stat-lbl { font-size: 10px; color: #bbb; text-transform: uppercase; margin-top: 3px; }
  .chart-wrap { background: #fff8f5; border-radius: 12px; padding: 16px 16px 10px; }
  svg { width: 100%; height: auto; display: block; }
  .axis { display: flex; justify-content: space-between; font-size: 10px; color: #ccc; margin-top: 4px; }
  .leg-row { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 10px; align-items: center; }
  .leg { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #777; }
  .dot { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }
  .tags { display: flex; flex-wrap: wrap; gap: 8px; }
  .tag { background: #fff0e8; border-radius: 20px; padding: 4px 12px; font-size: 12px; color: #FF7040; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  td { padding: 8px 6px; border-bottom: 1px solid #f5ede5; vertical-align: top; }
  td:first-child { color: #bbb; white-space: nowrap; width: 100px; }
  td:nth-child(2) { font-size: 18px; width: 30px; }
  .meta { color: #bbb; font-size: 11px; }
  footer { text-align: center; color: #ddd; font-size: 11px; margin-top: 40px; }
  @media print { body { padding: 20px; } }
</style></head><body>
<h1>🩷 Moody</h1>
<p class="sub">${isEn ? 'Monthly report' : 'Rapport mensuel'} — <strong>${months[month]} ${year}</strong> &nbsp;·&nbsp; ${isEn ? 'Patient' : 'Patient·e'} : <strong>${profile?.prenom ?? ''}</strong> &nbsp;·&nbsp; ${isEn ? 'Generated on' : 'Généré le'} ${today.toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR')}</p>

<h2>${isEn ? 'Monthly summary' : 'Résumé du mois'}</h2>
<div class="stats">
  <div class="stat"><div class="stat-val">${stats.count}</div><div class="stat-lbl">${isEn ? 'Days tracked' : 'Jours suivis'}</div></div>
  <div class="stat"><div class="stat-val">${Math.round(stats.avg * 10) / 10}/7</div><div class="stat-lbl">${isEn ? 'Avg mood' : 'Humeur moy.'}</div></div>
  <div class="stat"><div class="stat-val">${stats.positive}%</div><div class="stat-lbl">${isEn ? 'Positive days' : 'Jours positifs'}</div></div>
  <div class="stat"><div class="stat-val">${stats.avgSommeil != null ? stats.avgSommeil + 'h' : '—'}</div><div class="stat-lbl">${isEn ? 'Avg sleep' : 'Sommeil moy.'}</div></div>
</div>

<h2>${isEn ? 'Mood & sleep — ' : 'Humeur &amp; sommeil — '}${months[month]} ${year}</h2>
<div class="chart-wrap">
  <svg viewBox="0 0 ${CHART_W} ${CHART_H}" style="width:100%;height:auto;display:block;">${gridLines}${bars}${sleepPath}${sleepDots}${fatiguePath}</svg>
  <div class="axis"><span>${isEn ? '1st' : '1er'}</span><span>${Math.round(daysInMonth/2)}</span><span>${daysInMonth}</span></div>
  <div class="leg-row">
    <div class="leg"><svg width="20" height="10"><line x1="0" y1="5" x2="20" y2="5" stroke="#6366f1" stroke-width="1.8"/><circle cx="10" cy="5" r="2.5" fill="white" stroke="#6366f1" stroke-width="1.5"/></svg>${isEn ? 'Sleep (0–12h)' : 'Sommeil (0–12h)'}</div>
    <div class="leg"><svg width="20" height="10"><line x1="0" y1="5" x2="20" y2="5" stroke="#f59e0b" stroke-width="1.8" stroke-dasharray="4 2"/></svg>${isEn ? 'Energy' : 'Énergie'}</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;">
      ${MOOD_LABELS_LOC.slice(1).map((l,i) => `<div class="leg"><div class="dot" style="background:${MOOD_COLORS[i+1]}"></div>${l}</div>`).join('')}
    </div>
  </div>
</div>

${topTags.length ? `<h2>${isEn ? 'Frequent activities &amp; feelings' : 'Activités &amp; ressentis fréquents'}</h2><div class="tags">${topTags.map(([tag,c]) => `<span class="tag">${tag} <strong>(${c})</strong></span>`).join('')}</div>` : ''}

${tagCorrelHTML}

<h2>${isEn ? 'Detailed log' : 'Historique détaillé'}</h2>
<table>${entries.map(e => `<tr>
  <td>${e.date}</td>
  <td>${e.emoji}</td>
  <td><strong>${MOOD_LABELS_LOC[e.niveau]}</strong>${e.commentaire ? ' — ' + e.commentaire : ''}<br/>
  <span class="meta">${e.sommeil != null ? `😴 ${e.sommeil}h` : ''}${e.nourriture != null ? ` · ${FOOD_LABELS[e.nourriture]}` : ''}${e.fatigue != null ? ` · ${FAT_LABELS[e.fatigue]}` : ''}</span></td>
</tr>`).join('')}</table>

<footer>${isEn ? 'Generated by Moody · Emotional tracking app · Made with ❤️ by Florent' : 'Généré par Moody · Application de suivi émotionnel · Fait avec ❤️ par Florent'}</footer>
</body></html>`

    w.document.write(html)
    w.document.close()
    setTimeout(() => w.print(), 600)
  }

  async function handleClearHistory() {
    const { error } = await supabase.from('moods').delete().eq('user_id', user.id)
    if (error) { alert(error.message); return }
    setShowClearHistory(false)
    navigate('/mood')
  }

  return (
    <div className="bg-app relative overflow-hidden flex flex-col min-h-[100dvh]">
      <BgBlobs />
      <div className="relative z-10 w-full max-w-[560px] mx-auto px-6 pt-12 pb-8 flex flex-col flex-1">
      <AppHeader />
      <div className="overflow-y-auto no-scrollbar flex-1 fade-in">
        <h1 className="text-white font-extrabold text-[18px] text-center mb-4">{t('accountTitle')}</h1>
        <div className="flex flex-col items-center mb-4">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[32px] mb-2">
            {getAvatar(profile?.avatar ?? 'starter')}
          </div>
          <p className="text-white font-extrabold text-[15px]">{profile?.prenom ?? user?.email}</p>
        </div>

        <p className="text-white/72 text-[11px] font-bold uppercase tracking-widest mb-1.5">{t('personalInfo')}</p>
        <div className="bg-white/95 rounded-2xl px-4 mb-3">
          <CardRow label={t('firstname')} value={profile?.prenom ?? user?.email ?? ''}
            editContent={(close) => <EditField placeholder={t('firstname')} onSave={v => { handleSave('prenom', v); close() }} onCancel={close} t={t} />} />
          <CardRow label={t('pwdLabel')} value="••••••••"
            editContent={(close) => (
              <div className="py-2">
                {t('pwdPlaceholders').map((ph, i) => (
                  <input key={i} type="password" placeholder={ph}
                    className="w-full bg-[#fff3ee] rounded-full px-4 py-2 text-[13px] text-[#555] outline-none border-none mb-2" />
                ))}
                <div className="flex gap-2">
                  <button onClick={close} className="flex-1 py-2 rounded-full text-[12px] font-bold text-[#FF7040] bg-[#fff3ee] border-none cursor-pointer">{t('cancel')}</button>
                  <button onClick={close} className="flex-1 py-2 rounded-full text-[12px] font-bold text-white bg-[#FF8040] border-none cursor-pointer">{t('save')}</button>
                </div>
              </div>
            )} />
        </div>

        <p className="text-white/72 text-[11px] font-bold uppercase tracking-widest mb-1.5">{t('preferences')}</p>
        <div className="bg-white/95 rounded-2xl px-4 mb-3 overflow-hidden">
          <div className="flex justify-between items-center py-2.5 border-b border-[#f5ede5]">
            <div>
              <p className="text-[11px] text-[#aaa] font-semibold uppercase tracking-wide">{t('notifLabel')}</p>
              <p className="text-[14px] text-[#444] font-semibold">{t('dailyReminder')}</p>
              {notifBlocked && <p className="text-[10px] text-[#FF5050] mt-0.5">{t('notifBlocked')}</p>}
            </div>
            <Toggle checked={notifActive} onChange={handleToggleNotif} />
          </div>
          {notifActive && (
            <div className="py-2.5 border-b border-[#f5ede5]">
              <div className="flex justify-between items-center">
                <p className="text-[11px] text-[#aaa] font-semibold uppercase tracking-wide">{t('reminderTime')}</p>
                <input type="time" value={reminderTime} onChange={e => handleTimeChange(e.target.value)}
                  className="text-[14px] text-[#FF8040] font-bold bg-transparent border-none outline-none cursor-pointer" />
              </div>
              {/* Statut permission + bouton test */}
              <div className="flex items-center justify-between mt-1.5">
                {isNotificationGranted() ? (
                  <p className="text-[10px]" style={{ color: testState === 'ok' ? '#22c55e' : testState === 'fail' ? '#ef4444' : '#22c55e' }}>
                    {testState === 'ok'   ? (lang === 'fr' ? '✓ Notification envoyée !' : '✓ Notification sent!')
                   : testState === 'fail' ? (lang === 'fr' ? '✗ Échec — vérifie Windows (Ne pas déranger)' : '✗ Failed — check Windows (Do Not Disturb)')
                   : (lang === 'fr' ? '✓ Permission accordée' : '✓ Permission granted')}
                  </p>
                ) : (
                  <button
                    onClick={() => setShowPermHelp(v => !v)}
                    className="text-[10px] text-[#ef4444] font-semibold bg-transparent border-none cursor-pointer text-left flex items-center gap-1">
                    {lang === 'fr' ? '✗ Notifications bloquées' : '✗ Notifications blocked'}
                    <span className="text-[9px] text-[#aaa]">{showPermHelp ? '▲' : '▼'}</span>
                  </button>
                )}
                <button
                  disabled={testState === 'sending'}
                  onClick={async () => {
                    if (!isNotificationGranted()) {
                      const granted = await requestNotificationPermission()
                      if (granted) { setNotifBlocked(false); setShowPermHelp(false) }
                      else setShowPermHelp(true)
                      return
                    }
                    setTestState('sending')
                    localStorage.removeItem('lastNotifDate')
                    const ok = await fireInAppNotification(lang, true)
                    setTestState(ok ? 'ok' : 'fail')
                    // Toast visible dans la page dans tous les cas
                    setToast(ok
                      ? (lang === 'fr' ? '🔔 Notification envoyée ! Vérifie le centre de notifs Windows.' : '🔔 Notification sent! Check Windows notification center.')
                      : (lang === 'fr' ? '❌ Échec — vérifie Paramètres Windows → Notifications → Opera GX' : '❌ Failed — check Windows Settings → Notifications → Opera GX'))
                    setTimeout(() => { setTestState(null); setToast(null) }, 5000)
                  }}
                  className="text-[10px] text-[#FF8040] font-bold bg-transparent border-none cursor-pointer underline disabled:opacity-50">
                  {testState === 'sending'
                    ? '…'
                    : isNotificationGranted()
                      ? (lang === 'fr' ? 'Tester →' : 'Test →')
                      : (lang === 'fr' ? 'Débloquer →' : 'Unblock →')}
                </button>
              </div>
              {/* Guide de déblocage */}
              {showPermHelp && !isNotificationGranted() && (
                <div className="mt-2 bg-[#fff8f5] rounded-xl p-3 text-[10px] text-[#666] leading-relaxed border border-[#ffe0cc]">
                  <p className="font-bold text-[#FF7040] mb-1.5">
                    {lang === 'fr' ? '🔒 Comment autoriser les notifications :' : '🔒 How to allow notifications:'}
                  </p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>{lang === 'fr' ? 'Clique sur l\'icône 🔒 (ou ⓘ) dans la barre d\'adresse' : 'Click the 🔒 (or ⓘ) icon in the address bar'}</li>
                    <li>{lang === 'fr' ? 'Sélectionne « Paramètres du site »' : 'Select "Site settings"'}</li>
                    <li>{lang === 'fr' ? 'Trouve « Notifications » et choisis « Autoriser »' : 'Find "Notifications" and choose "Allow"'}</li>
                    <li>{lang === 'fr' ? 'Recharge la page puis réessaie' : 'Reload the page and try again'}</li>
                  </ol>
                  <p className="mt-1.5 text-[#aaa]">
                    {lang === 'fr'
                      ? '💡 Sur Opera GX : Menu → Sites web → Notifications'
                      : '💡 On Opera GX: Menu → Websites → Notifications'}
                  </p>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-between items-center py-2.5 border-b border-[#f5ede5]">
            <div>
              <p className="text-[11px] text-[#aaa] font-semibold uppercase tracking-wide">{t('soundLabel')}</p>
              <p className="text-[14px] text-[#444] font-semibold">{t('soundEffects')}</p>
            </div>
            <Toggle checked={soundActive} onChange={v => {
              setSoundActive(v)
              localStorage.setItem('soundFx', v ? 'true' : 'false')
              // Son de confirmation
              if (v) {
                try {
                  const ctx = new (window.AudioContext || window.webkitAudioContext)()
                  const osc = ctx.createOscillator(); const g = ctx.createGain()
                  osc.connect(g); g.connect(ctx.destination)
                  osc.type = 'sine'; osc.frequency.value = 660
                  g.gain.setValueAtTime(0, ctx.currentTime)
                  g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.05)
                  g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.35)
                  osc.start(); osc.stop(ctx.currentTime + 0.4)
                  osc.onended = () => ctx.close()
                } catch(_) {}
              }
            }} />
          </div>
          <div className="py-2.5 border-b border-[#f5ede5]">
            <p className="text-[11px] text-[#aaa] font-semibold uppercase tracking-wide mb-1.5">
              {lang === 'fr' ? 'Taille du texte' : 'Text size'}
            </p>
            <div className="flex gap-1.5">
              {[
                { key: 'sm', label: lang === 'fr' ? 'Petit' : 'Small',   icon: 'A',  sz: 'text-[10px]' },
                { key: 'md', label: lang === 'fr' ? 'Normal' : 'Normal',  icon: 'A',  sz: 'text-[12px]' },
                { key: 'lg', label: lang === 'fr' ? 'Grand' : 'Large',   icon: 'A',  sz: 'text-[14px]' },
                { key: 'xl', label: lang === 'fr' ? 'Très grand' : 'X-Large', icon: 'A', sz: 'text-[16px]' },
              ].map(opt => (
                <button key={opt.key} onClick={() => handleTextSize(opt.key)}
                  className={`flex-1 py-1.5 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-0.5 ${textSize === opt.key ? 'border-[#FF8040] bg-[#fff0e8]' : 'border-[#f0e8e0] bg-transparent'}`}>
                  <span className={`font-bold text-[#FF8040] ${opt.sz}`}>{opt.icon}</span>
                  <span className="text-[9px] text-[#888] font-semibold leading-tight text-center">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <div>
              <p className="text-[11px] text-[#aaa] font-semibold uppercase tracking-wide">{t('langLabel')}</p>
              <p className="text-[14px] text-[#444] font-semibold">{t('langValue')}</p>
            </div>
            <button onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
              className="text-[12px] text-[#FF8040] font-bold bg-transparent border-none cursor-pointer">
              {lang === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR'}
            </button>
          </div>
        </div>

        <p className="text-white/72 text-[11px] font-bold uppercase tracking-widest mb-1.5">{t('themeTitle')}</p>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {themes.map(th => {
            const themeLabel = lang === 'en' ? (th.labelEn ?? th.label) : th.label
            return (
              <button key={th.id} onClick={() => changeTheme(th.id, id => handleSave('theme', id))}
                className="rounded-2xl h-14 flex items-end pb-1.5 px-1.5 relative overflow-hidden border-2 transition-all"
                style={{
                  background: th.gradient,
                  borderColor: themeId === th.id ? 'white' : 'transparent',
                  transform: themeId === th.id ? 'scale(1.06)' : 'scale(1)',
                }}>
                <span className="text-[9px] text-white font-bold leading-tight drop-shadow">
                  {themeLabel.split(' ').slice(1).join(' ')}
                </span>
                {themeId === th.id && (
                  <span className="absolute top-1 right-1 text-[10px]">✓</span>
                )}
              </button>
            )
          })}
        </div>

        <p className="text-white/72 text-[11px] font-bold uppercase tracking-widest mb-1.5">{t('badgesTitle')}</p>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {badges.map(badge => (
            <div key={badge.id}
              onClick={() => badge.unlocked && handleSetAvatar(badge.id)}
              className="flex flex-col items-center bg-white/95 rounded-2xl py-3 px-1 relative"
              style={{ opacity: badge.unlocked ? 1 : 0.4, cursor: badge.unlocked ? 'pointer' : 'default' }}>
              <span className="text-[28px] mb-1">{badge.emoji}</span>
              <span className="text-[9px] font-bold text-[#FF8040] text-center leading-tight">{t(badge.labelKey).replace(/[^a-zA-ZÀ-ÿ\s·]/g, '').trim()}</span>
              {!badge.unlocked && <span className="text-[8px] text-[#bbb]">{t('badgeLocked')}</span>}
              {badge.unlocked && profile?.avatar === badge.id && (
                <span className="absolute -top-1 -right-1 text-[12px]">✓</span>
              )}
              {badge.unlocked && (
                <button onClick={e => { e.stopPropagation(); handleShare(badge) }}
                  className="mt-1 text-[8px] text-[#aaa] bg-transparent border-none cursor-pointer">
                  {t('shareBtn')} ↗
                </button>
              )}
            </div>
          ))}
        </div>

        <p className="text-white/72 text-[11px] font-bold uppercase tracking-widest mb-1.5">🆘 {t('crisisEmergencyContact')}</p>
        <div className="bg-white/95 rounded-2xl px-4 mb-3">
          <CardRow label={t('crisisContactName')} value={profile?.contact_urgence_nom || t('crisisNoContact')}
            editContent={(close) => <EditField placeholder={t('crisisContactName')} onSave={v => { handleSave('contact_urgence_nom', v); close() }} onCancel={close} t={t} />} />
          <CardRow label={t('crisisContactPhone')} value={profile?.contact_urgence_tel || '—'}
            editContent={(close) => <EditField placeholder={t('crisisContactPhone')} onSave={v => { handleSave('contact_urgence_tel', v); close() }} onCancel={close} t={t} />} />
        </div>

        <p className="text-white/72 text-[11px] font-bold uppercase tracking-widest mb-1.5">{t('privacy')}</p>
        <div className="bg-white/95 rounded-2xl px-4 mb-4">
          <div className="flex justify-between items-center py-2.5 border-b border-[#f5ede5]">
            <div>
              <p className="text-[11px] text-[#aaa] font-semibold uppercase tracking-wide">{t('dataLabel')}</p>
              <p className="text-[14px] text-[#444] font-semibold">{t('exportPDF')}</p>
            </div>
            <span onClick={handleExportPDF} className="text-[12px] text-[#FF8040] font-bold cursor-pointer">↓ PDF</span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <div>
              <p className="text-[11px] text-[#aaa] font-semibold uppercase tracking-wide">{t('historyLabel')}</p>
              <p className="text-[14px] text-[#444] font-semibold">{t('deleteHistory')}</p>
            </div>
            <span onClick={() => setShowClearHistory(true)} className="text-[12px] text-[#FF5050] font-bold cursor-pointer">{t('clearLabel')}</span>
          </div>
        </div>

        <button onClick={() => setShowDelete(true)}
          className="w-full py-2.5 rounded-full text-[13px] font-bold text-white bg-[rgba(255,80,80,0.25)] border-2 border-[rgba(255,120,120,0.6)] active:bg-[rgba(255,80,80,0.45)] transition-colors mb-4">
          {t('deleteAccount')}
        </button>
      </div>
      </div>

      {showClearHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="rounded-3xl p-6 w-72 text-center shadow-2xl mx-4" style={{ background: 'linear-gradient(150deg,#FFD07A,#FF8C5A)' }}>
            <p className="text-[40px] mb-2">🗂️</p>
            <p className="text-white font-extrabold text-[16px] mb-2">{lang === 'fr' ? 'Supprimer l\'historique ?' : 'Delete history?'}</p>
            <p className="text-white/85 text-[12px] mb-5 leading-relaxed">{lang === 'fr' ? 'Toutes tes humeurs seront supprimées définitivement.' : 'All your moods will be permanently deleted.'}</p>
            <div className="flex gap-2">
              <button onClick={() => setShowClearHistory(false)} className="flex-1 py-2.5 rounded-full text-[13px] font-bold text-white bg-white/20 border border-white/50 cursor-pointer">{t('cancel')}</button>
              <button onClick={handleClearHistory} className="flex-1 py-2.5 rounded-full text-[13px] font-bold text-white bg-[rgba(255,60,60,0.85)] border-none cursor-pointer">{t('clearLabel')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast de confirmation test notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl shadow-xl text-white text-[12px] font-semibold text-center max-w-[300px] fade-in"
          style={{ background: toast.startsWith('🔔') ? 'rgba(34,197,94,0.92)' : 'rgba(239,68,68,0.92)', backdropFilter: 'blur(8px)' }}>
          {toast}
        </div>
      )}

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="rounded-3xl p-6 w-72 text-center shadow-2xl mx-4" style={{ background: 'linear-gradient(150deg,#FFD07A,#FF8C5A)' }}>
            <p className="text-[40px] mb-2">⚠️</p>
            <p className="text-white font-extrabold text-[16px] mb-2">{t('deleteTitle')}</p>
            <p className="text-white/85 text-[12px] mb-5 leading-relaxed">{t('deleteBody')}</p>
            <div className="flex gap-2">
              <button onClick={() => setShowDelete(false)} className="flex-1 py-2.5 rounded-full text-[13px] font-bold text-white bg-white/20 border border-white/50 cursor-pointer">{t('cancel')}</button>
              <button onClick={handleDeleteAccount} className="flex-1 py-2.5 rounded-full text-[13px] font-bold text-white bg-[rgba(255,60,60,0.85)] border-none cursor-pointer">{t('deleteConfirm')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
