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
  const date = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return `${date} à ${time}`
}

export default function Admin() {
  const navigate    = useNavigate()
  const { user, loading } = useAuth()

  const [messages,    setMessages]    = useState([])
  const [fetching,    setFetching]    = useState(true)
  const [filter,      setFilter]      = useState('all')
  const [expanded,    setExpanded]    = useState(null)

  // Garde admin
  useEffect(() => {
    if (!loading && (!user || user.email !== ADMIN_EMAIL)) {
      navigate('/', { replace: true })
    }
  }, [user, loading, navigate])

  const fetchMessages = useCallback(async () => {
    setFetching(true)
    const { data } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
    setMessages(data ?? [])
    setFetching(false)
  }, [])

  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) fetchMessages()
  }, [user, fetchMessages])

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

  if (loading || !user) return null

  const unread   = messages.filter(m => !m.read).length
  const filtered = messages.filter(m => {
    if (filter === 'unread')  return !m.read
    if (filter in TYPE_CFG)   return m.type === filter
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
    <div className="bg-app relative overflow-hidden flex flex-col min-h-[100dvh]">
      <BgBlobs />
      <div className="relative z-10 w-full max-w-[560px] mx-auto px-5 pt-12 pb-8 flex flex-col flex-1">
        <AppHeader />

        {/* Titre */}
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-white font-extrabold text-[22px]">💌 Messages</h1>
          {unread > 0 && (
            <button onClick={markAllRead}
              className="text-[11px] font-bold text-white/70 bg-white/15 rounded-full px-3 py-1.5 border border-white/20 active:scale-[0.97] transition-transform">
              Tout marquer lu ✓
            </button>
          )}
        </div>
        <p className="text-white/40 text-[11px] mb-4">
          {messages.length} message{messages.length !== 1 ? 's' : ''} · {unread} non lu{unread !== 1 ? 's' : ''}
        </p>

        {/* Filtres */}
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
                filter === f.key
                  ? 'bg-white text-[#FF7040] border-white'
                  : 'bg-white/10 text-white/60 border-white/20'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Liste */}
        <div className="flex flex-col gap-3 flex-1">
          {fetching ? (
            <div className="flex items-center justify-center flex-1 py-16">
              <span className="text-white/40 text-[13px]">Chargement…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 py-16 gap-2">
              <span className="text-[40px]">🕊️</span>
              <span className="text-white/40 text-[13px]">Aucun message</span>
            </div>
          ) : filtered.map(msg => {
            const cfg = TYPE_CFG[msg.type] ?? TYPE_CFG.support
            const isOpen = expanded === msg.id

            return (
              <div key={msg.id}
                className={`rounded-2xl border transition-all ${
                  msg.read ? 'bg-white/8 border-white/10' : 'bg-white/15 border-white/30'
                }`}>

                {/* En-tête — toujours visible */}
                <div className="flex items-center gap-2 px-4 pt-3.5 pb-2 cursor-pointer"
                  onClick={() => {
                    setExpanded(isOpen ? null : msg.id)
                    if (!msg.read) markRead(msg.id, true)
                  }}>

                  {/* Badge type */}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: cfg.color + '28', color: cfg.color }}>
                    {cfg.icon} {cfg.label}
                  </span>

                  {/* Indicateur non lu */}
                  {!msg.read && (
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: '#FF7040' }} />
                  )}

                  {/* Aperçu du message */}
                  <p className="text-white/70 text-[12px] truncate flex-1 min-w-0">
                    {msg.body}
                  </p>

                  {/* Chevron */}
                  <span className="text-white/30 text-[12px] shrink-0 ml-1">
                    {isOpen ? '▾' : '▸'}
                  </span>
                </div>

                {/* Corps étendu */}
                {isOpen && (
                  <div className="px-4 pb-4">
                    <p className="text-white/90 text-[13px] leading-relaxed whitespace-pre-wrap mb-3 pt-1 border-t border-white/10">
                      {msg.body}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-1.5 text-[10px] text-white/40 mb-3 flex-wrap">
                      {msg.user_email && (
                        <>
                          <span>👤 {msg.user_email}</span>
                          <span>·</span>
                        </>
                      )}
                      <span>🕐 {formatDate(msg.created_at)}</span>
                    </div>

                    {/* Actions */}
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
        </div>

        {/* Rafraîchir */}
        <button onClick={fetchMessages}
          className="mt-4 w-full py-2.5 rounded-full text-white/50 font-semibold text-[12px] bg-white/8 border border-white/15 active:scale-[0.98] transition-transform">
          ↻ Rafraîchir
        </button>
      </div>
    </div>
  )
}
