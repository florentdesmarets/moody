import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import BgBlobs from '../components/BgBlobs'
import EmojiPicker from '../components/EmojiPicker'
import { useLang } from '../context/LangContext'
import { useMoods } from '../hooks/useMoods'

/* ── Son de sélection (si effets sonores activés) ────────────── */
function playSelectSound() {
  if (localStorage.getItem('soundFx') !== 'true') return
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator(); const g = ctx.createGain()
    osc.connect(g); g.connect(ctx.destination)
    osc.type = 'sine'; osc.frequency.value = 528
    g.gain.setValueAtTime(0, ctx.currentTime)
    g.gain.linearRampToValueAtTime(0.10, ctx.currentTime + 0.04)
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.28)
    osc.start(); osc.stop(ctx.currentTime + 0.3)
    osc.onended = () => ctx.close()
  } catch(_) {}
}

/* ── Couleur selon niveau ─────────────────────────────────────── */
function moodColor(niveau) {
  if (!niveau) return 'rgba(255,255,255,0.15)'
  if (niveau <= 2) return '#ef4444'
  if (niveau <= 4) return '#f97316'
  if (niveau === 5) return '#facc15'
  return '#22c55e'
}

/* ── 7 dernières dates YYYY-MM-DD ─────────────────────────────── */
function getLast7Days() {
  const days = []
  const pad = n => String(n).padStart(2, '0')
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`)
  }
  return days
}

export default function Mood() {
  const navigate = useNavigate()
  const { t, lang } = useLang()
  const { fetchMonth, fetchGlobalStats } = useMoods()

  const [selectedLevel, setSelectedLevel] = useState(null)
  const [feedback,      setFeedback]      = useState(null)
  const [weekMoods,     setWeekMoods]     = useState({})
  const [streak,        setStreak]        = useState(0)
  const [loadedWeek,    setLoadedWeek]    = useState(false)

  /* ── Chargement des 7 derniers jours + streak ─────────────────── */
  useEffect(() => {
    const today = new Date()
    const yr = today.getFullYear()
    const mo = today.getMonth()

    const load = async () => {
      const map = await fetchMonth(yr, mo)
      if (today.getDate() <= 6) {
        const prevYr = mo === 0 ? yr - 1 : yr
        const prevMo = mo === 0 ? 11 : mo - 1
        const prevMap = await fetchMonth(prevYr, prevMo)
        setWeekMoods({ ...prevMap, ...map })
      } else {
        setWeekMoods(map)
      }
      setLoadedWeek(true)
    }
    load()
    fetchGlobalStats().then(s => setStreak(s.streak ?? 0))
  }, []) // eslint-disable-line

  /* ── Sélection de l'humeur ────────────────────────────────────── */
  function handleSelect(level, emoji) {
    playSelectSound()
    setSelectedLevel(level)
    if (level >= 6) {
      setFeedback({ msg: t('moodHappy'), btn: t('continueBtn'),  action: () => navigate('/mood-positive', { state: { level, emoji } }) })
    } else if (level >= 4) {
      setFeedback({ msg: t('moodOk'),    btn: t('moreTellBtn'),  action: () => navigate('/journal',       { state: { level, emoji } }) })
    } else {
      setFeedback({ msg: t('moodSad'),   btn: t('confideBtn'),   action: () => navigate('/journal',       { state: { level, emoji } }) })
    }
  }

  /* ── Données semaine ──────────────────────────────────────────── */
  const last7   = getLast7Days()
  const dShort  = t('daysShort')
  const todayStr = last7[6]

  function getDayLabel(dateStr) {
    const d = new Date(dateStr + 'T00:00:00')
    const moddyDay = (d.getDay() + 6) % 7
    return dShort[moddyDay]
  }

  return (
    <div className="bg-app relative overflow-hidden flex flex-col min-h-[100dvh]">
      <BgBlobs />
      <div className="relative z-10 w-full max-w-[560px] mx-auto px-5 pt-12 pb-6 flex flex-col flex-1">
        <AppHeader />

        <div className="flex flex-col flex-1">

          {/* ── Titre ────────────────────────────────────────────────── */}
          <h1 className="text-white font-extrabold text-[20px] text-center leading-snug mb-2">
            {t('moodQuestion').split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </h1>

          {/* ── Sélecteur d'humeur ───────────────────────────────────── */}
          <div className="mt-8">
            <EmojiPicker selected={selectedLevel} onSelect={handleSelect} />
          </div>

          {/* ── Hint / feedback ──────────────────────────────────────── */}
          <div className="flex items-center justify-center min-h-[80px]">
            {feedback ? (
              <div className="text-center fade-in">
                <p className="text-white font-bold text-[14px] mb-3">{feedback.msg}</p>
                <button
                  onClick={feedback.action}
                  className="px-7 py-2.5 rounded-full text-white font-bold text-[14px] bg-white/25 border-2 border-white/65 active:scale-[1.03] transition-transform"
                >
                  {feedback.btn}
                </button>
              </div>
            ) : (
              <p className="text-white/50 text-[13px]">{t('moodHint')}</p>
            )}
          </div>

          {/* ── Spacer ───────────────────────────────────────────────── */}
          <div className="flex-1" />

          {/* ── 7 derniers jours ─────────────────────────────────────── */}
          <div className="bg-white/12 rounded-2xl px-4 py-3 mb-3">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-white/70 text-[11px] font-bold uppercase tracking-wide">
                {lang === 'fr' ? '7 derniers jours' : 'Last 7 days'}
              </p>
              {streak > 1 && (
                <span className="text-[11px] font-bold bg-white/20 text-white rounded-full px-2.5 py-0.5">
                  🔥 {streak} {lang === 'fr' ? 'j.' : 'd.'}
                </span>
              )}
            </div>

            {loadedWeek ? (
              <div className="flex justify-between">
                {last7.map(date => {
                  const entry   = weekMoods[date]
                  const isToday = date === todayStr
                  return (
                    <div key={date} className="flex flex-col items-center gap-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[17px] transition-all duration-300 ${isToday ? 'ring-2 ring-white/60 ring-offset-1 ring-offset-transparent' : ''}`}
                        style={{ background: moodColor(entry?.niveau) }}
                      >
                        {entry?.emoji ?? ''}
                      </div>
                      <span className={`text-[9px] font-semibold ${isToday ? 'text-white' : 'text-white/45'}`}>
                        {getDayLabel(date)}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex justify-between">
                {last7.map(date => (
                  <div key={date} className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.1)' }} />
                    <span className="text-[9px] text-white/30">{getDayLabel(date)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Citation du jour ─────────────────────────────────────── */}
          <div className="bg-white/12 rounded-2xl px-4 py-3">
            <p className="text-white/85 text-[12px] italic text-center leading-relaxed">
              "{t('dailyQuotes')[new Date().getDay()]}"
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
