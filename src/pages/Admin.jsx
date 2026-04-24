import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import BgBlobs from '../components/BgBlobs'
import AppHeader from '../components/AppHeader'

const ADMIN_EMAIL = 'florent.desmarets@gmail.com'

const TYPE_CFG = {
  support: { icon: '💙', label: 'Soutien',    color: '#60a5fa' },
  suggest: { icon: '💡', label: 'Suggestion', color: '#fbbf24' },
  bug:     { icon: '🐛', label: 'Bug',        color: '#f87171' },
}

function formatDate(iso) {
  const d = new Date(iso)
  return `${d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })} à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
}

function pad(n) { return String(n).padStart(2, '0') }
function dateStr(daysAgo = 0) {
  const d = new Date(Date.now() - daysAgo * 86400000)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/* ─── Carte stat ───────────────────────────────────────────── */
function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className="bg-white/12 rounded-2xl px-4 py-3.5 flex flex-col gap-1 border border-white/10">
      <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest">{icon} {label}</p>
      <p className="text-white font-extrabold text-[22px] leading-none" style={accent ? { color: accent } : {}}>
        {value ?? '—'}
      </p>
      {sub && <p className="text-white/40 text-[10px]">{sub}</p>}
    </div>
  )
}

/* ─── Mini graphique en barres (DAU 7j) ───────────────────── */
function DauChart({ data }) {
  const max = Math.max(...data.map(d => d.count), 1)
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
  return (
    <div className="bg-white/12 rounded-2xl px-4 py-4 border border-white/10">
      <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mb-3">
        📈 Utilisateurs actifs — 7 derniers jours
      </p>
      <div className="flex items-end gap-1.5 h-20">
        {data.map((d, i) => {
          const pct    = (d.count / max) * 100
          const jsDay  = (new Date(d.date + 'T00:00:00').getDay() + 6) % 7
          const isToday = i === 6
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
              {/* Valeur au-dessus */}
              <span className="text-white/50 text-[9px] font-bold">
                {d.count > 0 ? d.count : ''}
              </span>
              {/* Barre */}
              <div className="w-full rounded-t-md transition-all"
                style={{
                  height:     `${Math.max(pct, d.count > 0 ? 6 : 2)}%`,
                  minHeight:  d.count > 0 ? 4 : 2,
                  background: isToday ? '#FF7040' : 'rgba(255,255,255,0.3)',
                  maxHeight:  '100%',
                }} />
              {/* Jour */}
              <span className={`text-[8px] font-semibold ${isToday ? 'text-white' : 'text-white/35'}`}>
                {isToday ? 'Auj.' : days[jsDay]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Onglet Stats ─────────────────────────────────────────── */
function StatsPanel({ messageCount }) {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    const today    = dateStr(0)
    const ago7     = dateStr(6)
    const ago30    = dateStr(29)

    const [
      profilesRes,
      moodsRecentRes,
      totalMoodsRes,
      pushRes,
    ] = await Promise.all([
      supabase.from('profiles').select('id, created_at, langue'),
      supabase.from('moods').select('user_id, date, niveau').gte('date', ago30),
      supabase.from('moods').select('*', { count: 'exact', head: true }),
      supabase.from('push_subscriptions').select('*', { count: 'exact', head: true }),
    ])

    const profiles    = profilesRes.data     ?? []
    const recentMoods = moodsRecentRes.data  ?? []
    const totalMoods  = totalMoodsRes.count  ?? 0
    const pushSubs    = pushRes.count         ?? 0

    // Utilisateurs
    const totalUsers  = profiles.length
    const newToday    = profiles.filter(p => p.created_at?.slice(0, 10) === today).length
    const newWeek     = profiles.filter(p => p.created_at?.slice(0, 10) >= ago7).length
    const langFR      = profiles.filter(p => !p.langue || p.langue === 'fr').length
    const langEN      = profiles.filter(p => p.langue === 'en').length

    // Activité
    const moodsWeek   = recentMoods.filter(m => m.date >= ago7)
    const activeToday = new Set(recentMoods.filter(m => m.date === today).map(m => m.user_id)).size
    const activeWeek  = new Set(moodsWeek.map(m => m.user_id)).size

    // Humeur moyenne 30j
    const avgMood = recentMoods.length > 0
      ? (recentMoods.reduce((s, m) => s + m.niveau, 0) / recentMoods.length).toFixed(2)
      : null

    // Rétention : % d'inscrits il y a > 7j qui ont été actifs cette semaine
    const oldUsers      = profiles.filter(p => p.created_at?.slice(0, 10) < ago7)
    const oldActiveIds  = new Set(moodsWeek.map(m => m.user_id))
    const retention     = oldUsers.length > 0
      ? Math.round((oldUsers.filter(p => oldActiveIds.has(p.id)).length / oldUsers.length) * 100)
      : null

    // DAU 7 derniers jours
    const dailyActive = Array.from({ length: 7 }, (_, i) => {
      const d = dateStr(6 - i)
      return {
        date:  d,
        count: new Set(recentMoods.filter(m => m.date === d).map(m => m.user_id)).size,
      }
    })

    setStats({ totalUsers, newToday, newWeek, langFR, langEN, activeToday, activeWeek, totalMoods, avgMood, pushSubs, retention, dailyActive })
    setLoading(false)
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  if (loading) return (
    <div className="flex items-center justify-center flex-1 py-16">
      <span className="text-white/40 text-[13px]">Chargement…</span>
    </div>
  )

  const pctFR = stats.totalUsers > 0 ? Math.round((stats.langFR / stats.totalUsers) * 100) : 0

  return (
    <div className="flex flex-col gap-3">
      {/* Grille stats */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard icon="👥" label="Utilisateurs" value={stats.totalUsers}
          sub={`+${stats.newWeek} cette semaine`} />
        <StatCard icon="🆕" label="Nouveaux auj." value={stats.newToday}
          sub={`+${stats.newWeek} sur 7j`} accent={stats.newToday > 0 ? '#4ade80' : undefined} />
        <StatCard icon="📅" label="Actifs auj." value={stats.activeToday}
          sub={`${stats.totalUsers > 0 ? Math.round((stats.activeToday / stats.totalUsers) * 100) : 0}% des users`}
          accent={stats.activeToday > 0 ? '#fb923c' : undefined} />
        <StatCard icon="📆" label="Actifs 7j" value={stats.activeWeek}
          sub={`sur ${stats.totalUsers} inscrits`} />
        <StatCard icon="📝" label="Humeurs totales" value={stats.totalMoods.toLocaleString('fr-FR')}
          sub="depuis le début" />
        <StatCard icon="😊" label="Humeur moy. 30j" value={stats.avgMood ? `${stats.avgMood}/7` : '—'}
          accent={stats.avgMood >= 5 ? '#4ade80' : stats.avgMood >= 3.5 ? '#fb923c' : '#f87171'} />
        <StatCard icon="🔔" label="Abonnés push" value={stats.pushSubs}
          sub={`${stats.totalUsers > 0 ? Math.round((stats.pushSubs / stats.totalUsers) * 100) : 0}% des users`} />
        <StatCard icon="💌" label="Messages reçus" value={messageCount}
          sub="dans la boîte" />
      </div>

      {/* DAU chart */}
      <DauChart data={stats.dailyActive} />

      {/* Rétention + langues */}
      <div className="grid grid-cols-2 gap-2">
        {stats.retention !== null && (
          <div className="bg-white/12 rounded-2xl px-4 py-3.5 border border-white/10">
            <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mb-1">🔄 Rétention 7j</p>
            <p className="text-white font-extrabold text-[22px] leading-none"
              style={{ color: stats.retention >= 50 ? '#4ade80' : stats.retention >= 25 ? '#fb923c' : '#f87171' }}>
              {stats.retention}%
            </p>
            <p className="text-white/40 text-[10px]">users actifs avant J-7</p>
          </div>
        )}
        <div className="bg-white/12 rounded-2xl px-4 py-3.5 border border-white/10">
          <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mb-2">🌍 Langues</p>
          {/* Barre de progression FR/EN */}
          <div className="h-2 rounded-full overflow-hidden bg-white/15 mb-2">
            <div className="h-full rounded-full" style={{ width: `${pctFR}%`, background: '#60a5fa' }} />
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-[#60a5fa] font-bold">🇫🇷 FR {stats.langFR}</span>
            <span className="text-[#fbbf24] font-bold">{stats.langEN} EN 🇬🇧</span>
          </div>
        </div>
      </div>

      {/* Rafraîchir */}
      <button onClick={fetchStats}
        className="w-full py-2.5 rounded-full text-white/50 font-semibold text-[12px] bg-white/8 border border-white/15 active:scale-[0.98] transition-transform">
        ↻ Rafraîchir les stats
      </button>
    </div>
  )
}

/* ─── Onglet Messages ──────────────────────────────────────── */
function MessagesPanel() {
  const [messages, setMessages] = useState([])
  const [fetching, setFetching] = useState(true)
  const [filter,   setFilter]   = useState('all')
  const [expanded, setExpanded] = useState(null)

  const fetchMessages = useCallback(async () => {
    setFetching(true)
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false })
    setMessages(data ?? [])
    setFetching(false)
  }, [])

  useEffect(() => { fetchMessages() }, [fetchMessages])

  async function markRead(id, read) {
    await supabase.from('messages').update({ read }).eq('id', id)
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read } : m))
  }

  async function markAllRead() {
    const ids = messages.filter(m => !m.read).map(m => m.id)
    if (!ids.length) return
    await supabase.from('messages').update({ read: true }).in('id', ids)
    setMessages(prev => prev.map(m => ({ ...m, read: true })))
  }

  async function deleteMessage(id) {
    await supabase.from('messages').delete().eq('id', id)
    setMessages(prev => prev.filter(m => m.id !== id))
    if (expanded === id) setExpanded(null)
  }

  const unread   = messages.filter(m => !m.read).length
  const filtered = messages.filter(m => {
    if (filter === 'unread') return !m.read
    if (filter in TYPE_CFG)  return m.type === filter
    return true
  })

  const FILTERS = [
    { key: 'all',     label: `Tous (${messages.length})` },
    { key: 'unread',  label: `Non lus${unread ? ` (${unread})` : ''}` },
    { key: 'support', label: '💙 Soutien' },
    { key: 'suggest', label: '💡 Idées' },
    { key: 'bug',     label: '🐛 Bugs' },
  ]

  return (
    <div className="flex flex-col gap-3">
      {/* Sous-titre + marquer tout lu */}
      <div className="flex items-center justify-between">
        <p className="text-white/40 text-[11px]">
          {messages.length} message{messages.length !== 1 ? 's' : ''} · {unread} non lu{unread !== 1 ? 's' : ''}
        </p>
        {unread > 0 && (
          <button onClick={markAllRead}
            className="text-[11px] font-bold text-white/70 bg-white/15 rounded-full px-3 py-1.5 border border-white/20 active:scale-[0.97] transition-transform">
            Tout lu ✓
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
              filter === f.key ? 'bg-white text-[#FF7040] border-white' : 'bg-white/10 text-white/60 border-white/20'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {fetching ? (
        <div className="flex items-center justify-center py-16">
          <span className="text-white/40 text-[13px]">Chargement…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <span className="text-[40px]">🕊️</span>
          <span className="text-white/40 text-[13px]">Aucun message</span>
        </div>
      ) : filtered.map(msg => {
        const cfg    = TYPE_CFG[msg.type] ?? TYPE_CFG.support
        const isOpen = expanded === msg.id
        return (
          <div key={msg.id}
            className={`rounded-2xl border transition-all ${
              msg.read ? 'bg-white/8 border-white/10' : 'bg-white/15 border-white/30'
            }`}>

            <div className="flex items-center gap-2 px-4 pt-3.5 pb-2 cursor-pointer"
              onClick={() => { setExpanded(isOpen ? null : msg.id); if (!msg.read) markRead(msg.id, true) }}>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                style={{ background: cfg.color + '28', color: cfg.color }}>
                {cfg.icon} {cfg.label}
              </span>
              {!msg.read && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: '#FF7040' }} />}
              <p className="text-white/70 text-[12px] truncate flex-1 min-w-0">{msg.body}</p>
              <span className="text-white/30 text-[12px] shrink-0 ml-1">{isOpen ? '▾' : '▸'}</span>
            </div>

            {isOpen && (
              <div className="px-4 pb-4">
                <p className="text-white/90 text-[13px] leading-relaxed whitespace-pre-wrap mb-3 pt-1 border-t border-white/10">
                  {msg.body}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-white/40 mb-3 flex-wrap">
                  {msg.user_email && <><span>👤 {msg.user_email}</span><span>·</span></>}
                  <span>🕐 {formatDate(msg.created_at)}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => markRead(msg.id, !msg.read)}
                    className="flex-1 py-1.5 rounded-full text-[11px] font-semibold bg-white/10 text-white/60 border border-white/20 active:scale-[0.97] transition-transform">
                    {msg.read ? '↩ Marquer non lu' : '✓ Marquer lu'}
                  </button>
                  <button onClick={() => deleteMessage(msg.id)}
                    className="px-4 py-1.5 rounded-full text-[11px] font-semibold text-red-300 bg-red-400/10 border border-red-400/20 active:scale-[0.97] transition-transform">
                    🗑 Supprimer
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}

      <button onClick={fetchMessages}
        className="w-full py-2.5 rounded-full text-white/50 font-semibold text-[12px] bg-white/8 border border-white/15 active:scale-[0.98] transition-transform">
        ↻ Rafraîchir
      </button>
    </div>
  )
}

/* ─── Page principale ──────────────────────────────────────── */
export default function Admin() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [tab, setTab] = useState('messages')
  const [msgCount, setMsgCount] = useState(0)

  useEffect(() => {
    if (!loading && (!user || user.email !== ADMIN_EMAIL)) navigate('/', { replace: true })
  }, [user, loading, navigate])

  // Récupère le total messages pour l'afficher dans la carte stats
  useEffect(() => {
    if (user?.email !== ADMIN_EMAIL) return
    supabase.from('messages').select('*', { count: 'exact', head: true })
      .then(({ count }) => setMsgCount(count ?? 0))
  }, [user])

  if (loading || !user) return null

  const TABS = [
    { key: 'messages', label: '💌 Messages' },
    { key: 'stats',    label: '📊 Stats' },
  ]

  return (
    <div className="bg-app relative overflow-hidden flex flex-col min-h-[100dvh]">
      <BgBlobs />
      <div className="relative z-10 w-full max-w-[560px] mx-auto px-5 pt-12 pb-8 flex flex-col flex-1">
        <AppHeader />

        <h1 className="text-white font-extrabold text-[22px] mb-4">⚙️ Admin</h1>

        {/* Onglets */}
        <div className="flex gap-2 mb-5">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 rounded-full text-[13px] font-bold transition-all border ${
                tab === t.key ? 'bg-white text-[#FF7040] border-white' : 'bg-white/12 text-white/60 border-white/20'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'messages'
          ? <MessagesPanel />
          : <StatsPanel messageCount={msgCount} />
        }
      </div>
    </div>
  )
}
