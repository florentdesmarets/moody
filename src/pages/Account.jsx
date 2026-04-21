import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import BgBlobs from '../components/BgBlobs'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { supabase } from '../lib/supabase'
import { useMoods } from '../hooks/useMoods'
import { BADGES, computeBadges, getAvatar } from '../lib/badges'
import { useTheme } from '../context/ThemeContext'
import { requestNotificationPermission, isNotificationGranted, scheduleNotification, cancelNotification } from '../hooks/useNotifications'

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
  const [soundActive,       setSoundActive]       = useState(false)
  const [notifBlocked,      setNotifBlocked]      = useState(false)
  const [badges,            setBadges]            = useState([])
  const [globalStats,       setGlobalStats]       = useState({ count: 0, streak: 0 })

  useEffect(() => {
    fetchGlobalStats().then(stats => {
      setGlobalStats(stats)
      setBadges(computeBadges(stats))
    })
  }, [])

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
    if (notifActive && isNotificationGranted()) scheduleNotification(t, lang)
  }

  async function handleSetAvatar(id) {
    await updateProfile({ avatar: id })
  }

  async function handleShare(badge) {
    const text = t('shareBadgeText')(t(badge.labelKey), 'MoodTracker')
    if (navigator.share) {
      await navigator.share({ title: 'MoodTracker', text })
    } else {
      await navigator.clipboard.writeText(text)
      alert('Copié dans le presse-papier !')
    }
  }

  async function handleLogout() { await signOut(); navigate('/') }

  async function handleDeleteAccount() {
    const { error } = await supabase.rpc('delete_user')
    if (error) { alert(error.message); return }
    await signOut()
    navigate('/')
  }
  async function handleSave(field, value) { await updateProfile({ [field]: value }) }

  async function handleExportPDF() {
    const today = new Date()
    const year  = today.getFullYear()
    const month = today.getMonth()
    const data  = await fetchMonth(year, month)
    const entries = Object.values(data).sort((a, b) => a.date.localeCompare(b.date))
    const stats = getStats(data)

    const MONTH_NAMES = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
    const MOOD_LABELS = ['—','Très difficile','Difficile','Moyen bas','Neutre','Plutôt bien','Bien','Excellent']
    const MOOD_COLORS = ['#ddd','#FF4F4F','#FF7A4F','#FFB347','#FFD700','#9ACD32','#4CAF50','#3DBF7F']
    const monthName   = MONTH_NAMES[month]
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

    // Courbe sommeil — 4h→10h normalisé
    const sleepPoints = []
    for (let i = 0; i < daysInMonth; i++) {
      const dateStr = `${year}-${pad(month+1)}-${pad(i+1)}`
      const e = data[dateStr]
      if (e?.sommeil != null) {
        sleepPoints.push({
          x: i * BAR_STEP + BAR_W / 2,
          y: CHART_H - ((Math.min(Math.max(e.sommeil, 4), 10) - 4) / 6) * CHART_H,
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

    const tagCounts = {}
    entries.forEach(e => {
      if (e.commentaire) e.commentaire.split(', ').forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1 })
    })
    const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 10)

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
<title>Rapport MoodTracker — ${monthName} ${year}</title>
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
  .legend { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
  .leg { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #777; }
  .dot { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }
  .tags { display: flex; flex-wrap: wrap; gap: 8px; }
  .tag { background: #fff0e8; border-radius: 20px; padding: 4px 12px; font-size: 12px; color: #FF7040; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  td { padding: 8px 6px; border-bottom: 1px solid #f5ede5; vertical-align: top; }
  td:first-child { color: #bbb; white-space: nowrap; width: 100px; }
  td:nth-child(2) { font-size: 18px; width: 30px; }
  .sleep { color: #bbb; font-size: 11px; }
  footer { text-align: center; color: #ddd; font-size: 11px; margin-top: 40px; }
  @media print { body { padding: 20px; } }
</style></head><body>
<h1>🩷 MoodTracker</h1>
<p class="sub">Rapport mensuel — <strong>${monthName} ${year}</strong> &nbsp;·&nbsp; Patient·e : <strong>${profile?.prenom ?? ''}</strong> &nbsp;·&nbsp; Généré le ${today.toLocaleDateString('fr-FR')}</p>

<h2>Résumé du mois</h2>
<div class="stats">
  <div class="stat"><div class="stat-val">${stats.count}</div><div class="stat-lbl">Jours suivis</div></div>
  <div class="stat"><div class="stat-val">${Math.round(stats.avg * 10) / 10}/7</div><div class="stat-lbl">Humeur moy.</div></div>
  <div class="stat"><div class="stat-val">${stats.positive}%</div><div class="stat-lbl">Jours positifs</div></div>
  <div class="stat"><div class="stat-val">${stats.avgSommeil != null ? stats.avgSommeil + 'h' : '—'}</div><div class="stat-lbl">Sommeil moy.</div></div>
</div>

<h2>Humeur &amp; sommeil croisés — ${monthName} ${year}</h2>
<div class="chart-wrap">
  <svg viewBox="0 0 ${CHART_W} ${CHART_H}" style="width:100%;height:auto;display:block;">${gridLines}${bars}${sleepPath}${sleepDots}</svg>
  <div class="axis"><span>1er</span><span>${Math.round(daysInMonth/2)}</span><span>${daysInMonth}</span></div>
  <div style="display:flex;gap:20px;align-items:center;margin-top:10px;flex-wrap:wrap;">
    <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#777;">
      <svg width="20" height="10"><line x1="0" y1="5" x2="20" y2="5" stroke="#6366f1" stroke-width="1.8"/><circle cx="10" cy="5" r="2.5" fill="white" stroke="#6366f1" stroke-width="1.5"/></svg>
      Sommeil (4h → 10h)
    </div>
    <div class="legend">${MOOD_LABELS.slice(1).map((l,i) => `<div class="leg"><div class="dot" style="background:${MOOD_COLORS[i+1]}"></div>${l}</div>`).join('')}</div>
  </div>
</div>

${topTags.length ? `<h2>Activités &amp; ressentis fréquents</h2><div class="tags">${topTags.map(([t,c]) => `<span class="tag">${t} <strong>(${c})</strong></span>`).join('')}</div>` : ''}

<h2>Historique détaillé</h2>
<table>${entries.map(e => `<tr>
  <td>${e.date}</td>
  <td>${e.emoji}</td>
  <td><strong>${MOOD_LABELS[e.niveau]}</strong>${e.commentaire ? ' — ' + e.commentaire : ''}<br/>${e.sommeil != null ? `<span class="sleep">😴 ${e.sommeil}h de sommeil</span>` : ''}</td>
</tr>`).join('')}</table>

<footer>Généré par MoodTracker · Application de suivi émotionnel · Fait avec ❤️ par Florent</footer>
</body></html>`

    const w = window.open('', '_blank')
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
    <div className="bg-app relative overflow-hidden flex flex-col px-6 pt-12 pb-8 min-h-[100dvh]">
      <BgBlobs />
      <AppHeader />
      <div className="relative z-10 overflow-y-auto no-scrollbar flex-1 fade-in">
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
            <div className="flex justify-between items-center py-2.5 border-b border-[#f5ede5]">
              <div>
                <p className="text-[11px] text-[#aaa] font-semibold uppercase tracking-wide">{t('reminderTime')}</p>
              </div>
              <input type="time" value={reminderTime} onChange={e => handleTimeChange(e.target.value)}
                className="text-[14px] text-[#FF8040] font-bold bg-transparent border-none outline-none cursor-pointer" />
            </div>
          )}
          <div className="flex justify-between items-center py-2.5 border-b border-[#f5ede5]">
            <div>
              <p className="text-[11px] text-[#aaa] font-semibold uppercase tracking-wide">{t('soundLabel')}</p>
              <p className="text-[14px] text-[#444] font-semibold">{t('soundEffects')}</p>
            </div>
            <Toggle checked={soundActive} onChange={setSoundActive} />
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
          {themes.map(th => (
            <button key={th.id} onClick={() => changeTheme(th.id, id => handleSave('theme', id))}
              className="rounded-2xl h-14 flex items-end pb-1.5 px-1.5 relative overflow-hidden border-2 transition-all"
              style={{
                background: th.gradient,
                borderColor: themeId === th.id ? 'white' : 'transparent',
                transform: themeId === th.id ? 'scale(1.06)' : 'scale(1)',
              }}>
              <span className="text-[9px] text-white font-bold leading-tight drop-shadow">
                {th.label.split(' ').slice(1).join(' ')}
              </span>
              {themeId === th.id && (
                <span className="absolute top-1 right-1 text-[10px]">✓</span>
              )}
            </button>
          ))}
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

      {showClearHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(180,60,10,0.6)] max-w-[430px] mx-auto">
          <div className="rounded-3xl p-6 w-64 text-center shadow-2xl" style={{ background: 'linear-gradient(150deg,#FFD07A,#FF8C5A)' }}>
            <p className="text-[36px] mb-2">🗂️</p>
            <p className="text-white font-extrabold text-[15px] mb-2">{lang === 'fr' ? 'Supprimer l\'historique ?' : 'Delete history?'}</p>
            <p className="text-white/85 text-[12px] mb-4 leading-relaxed">{lang === 'fr' ? 'Toutes tes humeurs seront supprimées définitivement.' : 'All your moods will be permanently deleted.'}</p>
            <div className="flex gap-2">
              <button onClick={() => setShowClearHistory(false)} className="flex-1 py-2.5 rounded-full text-[13px] font-bold text-white bg-white/22 border border-white/50">{t('cancel')}</button>
              <button onClick={handleClearHistory} className="flex-1 py-2.5 rounded-full text-[13px] font-bold text-white bg-[rgba(255,80,80,0.75)] border-none">{t('clearLabel')}</button>
            </div>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(180,60,10,0.6)] max-w-[430px] mx-auto">
          <div className="rounded-3xl p-6 w-64 text-center shadow-2xl" style={{ background: 'linear-gradient(150deg,#FFD07A,#FF8C5A)' }}>
            <p className="text-[36px] mb-2">⚠️</p>
            <p className="text-white font-extrabold text-[15px] mb-2">{t('deleteTitle')}</p>
            <p className="text-white/85 text-[12px] mb-4 leading-relaxed">{t('deleteBody')}</p>
            <div className="flex gap-2">
              <button onClick={() => setShowDelete(false)} className="flex-1 py-2.5 rounded-full text-[13px] font-bold text-white bg-white/22 border border-white/50">{t('cancel')}</button>
              <button onClick={handleDeleteAccount} className="flex-1 py-2.5 rounded-full text-[13px] font-bold text-white bg-[rgba(255,80,80,0.75)] border-none">{t('deleteConfirm')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
