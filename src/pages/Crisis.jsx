import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import BgBlobs from '../components/BgBlobs'
import { useLang } from '../context/LangContext'
import { useAuth } from '../context/AuthContext'

// ─── Respiration guidée ───────────────────────────────────────────────────────
const PHASE_MS = 5000  // 5 sec par phase — cohérence cardiaque

function BreathingExercise({ lang }) {
  const [active,  setActive]  = useState(false)
  const [phase,   setPhase]   = useState('in')   // 'in' | 'out'
  const [cycles,  setCycles]  = useState(0)
  const timer = useRef(null)

  function start() {
    setActive(true); setPhase('in'); setCycles(0)
    timer.current = setInterval(() => {
      setPhase(p => {
        if (p === 'out') setCycles(c => c + 1)
        return p === 'in' ? 'out' : 'in'
      })
    }, PHASE_MS)
  }
  function stop() { setActive(false); clearInterval(timer.current) }
  useEffect(() => () => clearInterval(timer.current), [])

  const isIn     = phase === 'in'
  const scale    = !active ? 0.72 : isIn ? 1 : 0.58
  const glow     = active ? (isIn ? 'rgba(255,210,100,0.35)' : 'rgba(160,200,255,0.25)') : 'transparent'
  const ripple   = !active ? 0.72 : isIn ? 1.22 : 0.68
  const phaseLabel = isIn
    ? (lang === 'fr' ? 'Inspire...' : 'Inhale...')
    : (lang === 'fr' ? 'Expire...' : 'Exhale...')

  return (
    <div className="flex flex-col items-center py-6">
      <p className="text-white font-bold text-[14px] mb-1">
        {lang === 'fr' ? '🌬️ Respiration guidée' : '🌬️ Guided breathing'}
      </p>
      <p className="text-white/45 text-[11px] mb-8 text-center">
        {lang === 'fr'
          ? 'Cohérence cardiaque · 5 sec inspire, 5 sec expire'
          : 'Heart coherence · 5s inhale, 5s exhale'}
      </p>

      {/* Cercle animé */}
      <div className="relative flex items-center justify-center mb-8" style={{ width: 190, height: 190 }}>
        {/* Ondulation extérieure */}
        <div className="absolute rounded-full" style={{
          width: 190, height: 190,
          background: 'rgba(255,255,255,0.05)',
          transform: `scale(${ripple})`,
          transition: `transform ${PHASE_MS}ms ease-in-out`,
        }} />
        {/* Cercle principal */}
        <div className="absolute rounded-full" style={{
          width: 160, height: 160,
          background: active
            ? isIn
              ? 'radial-gradient(circle, rgba(255,210,100,0.55), rgba(255,130,60,0.35))'
              : 'radial-gradient(circle, rgba(170,210,255,0.45), rgba(100,150,255,0.25))'
            : 'rgba(255,255,255,0.12)',
          transform: `scale(${scale})`,
          transition: `transform ${PHASE_MS}ms ease-in-out, background 0.6s ease`,
          boxShadow: `0 0 50px ${glow}`,
        }} />
        {/* Texte centré */}
        <p className="relative z-10 text-white text-[14px] font-bold select-none">
          {active ? phaseLabel : ''}
        </p>
      </div>

      {active && (
        <p className="text-white/40 text-[11px] mb-5">
          {cycles} {lang === 'fr' ? 'cycles' : 'cycles'}
        </p>
      )}

      <button onClick={active ? stop : start}
        className="px-10 py-3 rounded-full text-[14px] font-bold transition-all active:scale-95"
        style={{
          background: active ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.92)',
          color:      active ? 'white' : '#C0392B',
          border:     active ? '1px solid rgba(255,255,255,0.3)' : 'none',
        }}>
        {active
          ? (lang === 'fr' ? '⏹ Arrêter'   : '⏹ Stop')
          : (lang === 'fr' ? '▶ Commencer' : '▶ Start')}
      </button>
    </div>
  )
}

// ─── Exercice 5-4-3-2-1 ──────────────────────────────────────────────────────
const STEPS = {
  fr: [
    { n: 5, verb: 'VOIS',    emoji: '👀', hint: 'Regarde autour de toi et nomme 5 choses que tu vois.' },
    { n: 4, verb: 'TOUCHES', emoji: '🤲', hint: 'Touche 4 surfaces différentes et remarque leur texture.' },
    { n: 3, verb: 'ENTENDS', emoji: '👂', hint: 'Écoute attentivement et identifie 3 sons.' },
    { n: 2, verb: 'SENS',    emoji: '👃', hint: 'Prends une grande inspiration et nomme 2 odeurs.' },
    { n: 1, verb: 'GOÛTES',  emoji: '👅', hint: 'Prête attention à ta bouche et nomme 1 saveur.' },
  ],
  en: [
    { n: 5, verb: 'SEE',   emoji: '👀', hint: 'Look around and name 5 things you can see.' },
    { n: 4, verb: 'TOUCH', emoji: '🤲', hint: 'Touch 4 different surfaces and notice their texture.' },
    { n: 3, verb: 'HEAR',  emoji: '👂', hint: 'Listen carefully and identify 3 sounds.' },
    { n: 2, verb: 'SMELL', emoji: '👃', hint: 'Take a deep breath and name 2 scents.' },
    { n: 1, verb: 'TASTE', emoji: '👅', hint: 'Pay attention to your mouth and name 1 taste.' },
  ],
}

function GroundingExercise({ lang }) {
  const [stepIdx, setStepIdx] = useState(0)
  const [checked, setChecked] = useState([])
  const [done,    setDone]    = useState(false)

  const steps = STEPS[lang] ?? STEPS.fr
  const step  = steps[stepIdx]

  function toggle(i) {
    setChecked(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])
  }
  function nextStep() {
    if (stepIdx < steps.length - 1) { setStepIdx(s => s + 1); setChecked([]) }
    else setDone(true)
  }
  function restart() { setStepIdx(0); setChecked([]); setDone(false) }

  const allChecked = checked.length === step?.n

  if (done) return (
    <div className="flex flex-col items-center py-10 text-center">
      <span className="text-[52px] mb-3">🎉</span>
      <p className="text-white font-extrabold text-[17px] mb-2">
        {lang === 'fr' ? 'Exercice terminé !' : 'Exercise complete!'}
      </p>
      <p className="text-white/55 text-[12px] leading-relaxed px-4 mb-6">
        {lang === 'fr'
          ? 'Tu es ancrée dans le présent.\nPrend le temps de souffler.'
          : 'You are grounded in the present.\nTake a moment to breathe.'}
      </p>
      <button onClick={restart}
        className="px-6 py-2.5 rounded-full text-[13px] font-bold text-white bg-white/20 border border-white/30">
        {lang === 'fr' ? '↩ Recommencer' : '↩ Restart'}
      </button>
    </div>
  )

  return (
    <div className="py-4">
      <p className="text-white font-bold text-[14px] mb-1">
        {lang === 'fr' ? '🖐️ Exercice 5-4-3-2-1' : '🖐️ 5-4-3-2-1 Exercise'}
      </p>
      <p className="text-white/45 text-[11px] mb-5">
        {lang === 'fr' ? 'Ancre-toi dans le présent, une étape à la fois' : 'Ground yourself in the present, one step at a time'}
      </p>

      {/* Indicateur de progression */}
      <div className="flex gap-1.5 mb-5 justify-center">
        {steps.map((s, i) => (
          <div key={i} className="rounded-full transition-all duration-300" style={{
            width:      i === stepIdx ? 22 : 8,
            height:     8,
            background: i < stepIdx  ? 'rgba(255,255,255,0.8)'
                      : i === stepIdx ? 'white'
                      : 'rgba(255,255,255,0.2)',
          }} />
        ))}
      </div>

      {/* Carte étape */}
      <div className="bg-white/10 rounded-2xl px-4 py-5 mb-4">
        <div className="text-center mb-5">
          <span className="text-[38px]">{step.emoji}</span>
          <p className="text-white/40 text-[9px] font-extrabold uppercase tracking-widest mt-1">
            {lang === 'fr' ? `Étape ${stepIdx + 1} sur 5` : `Step ${stepIdx + 1} of 5`}
          </p>
          <p className="text-white font-extrabold text-[19px] mt-1.5 leading-tight">
            {step.n} {lang === 'fr' ? 'choses que tu' : 'things you'}{' '}
            <span style={{ color: '#FFD07A' }}>{step.verb}</span>
          </p>
          <p className="text-white/50 text-[12px] mt-2 leading-relaxed">{step.hint}</p>
        </div>

        <div className="flex flex-col gap-2">
          {Array.from({ length: step.n }, (_, i) => {
            const on = checked.includes(i)
            return (
              <button key={i} onClick={() => toggle(i)}
                className="flex items-center gap-3 w-full py-2.5 px-3 rounded-xl transition-all active:scale-[0.98]"
                style={{ background: on ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.07)' }}>
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    borderColor: on ? 'white' : 'rgba(255,255,255,0.3)',
                    background:  on ? 'white' : 'transparent',
                  }}>
                  {on && <span className="text-[10px] font-extrabold" style={{ color: '#C0392B' }}>✓</span>}
                </div>
                <span className="text-white/65 text-[12px]">
                  {lang === 'fr' ? `Élément n°${i + 1}` : `Item #${i + 1}`}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <button onClick={nextStep} disabled={!allChecked}
        className="w-full py-3 rounded-full text-[14px] font-bold transition-all active:scale-[0.97]"
        style={{
          background: allChecked ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.12)',
          color:      allChecked ? '#C0392B' : 'rgba(255,255,255,0.3)',
        }}>
        {stepIdx < steps.length - 1
          ? (lang === 'fr' ? 'Étape suivante →' : 'Next step →')
          : (lang === 'fr' ? 'Terminer ✓' : 'Finish ✓')}
      </button>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function Crisis() {
  const navigate = useNavigate()
  const { t, lang } = useLang()
  const { profile, updateProfile } = useAuth()

  const [tab,          setTab]         = useState('call')
  const [editContact,  setEditContact] = useState(false)
  const [contactName,  setContactName] = useState(profile?.contact_urgence_nom ?? '')
  const [contactPhone, setContactPhone] = useState(profile?.contact_urgence_tel ?? '')

  // Phrases d'ancrage — stockées en localStorage (personnelles, pas de migration DB)
  const [anchors,       setAnchors]      = useState(() => {
    try { return JSON.parse(localStorage.getItem('crisisAnchors') ?? '[]') }
    catch { return [] }
  })
  const [newAnchor,     setNewAnchor]    = useState('')
  const [showAddAnchor, setShowAddAnchor] = useState(false)

  async function handleSaveContact() {
    await updateProfile({ contact_urgence_nom: contactName, contact_urgence_tel: contactPhone })
    setEditContact(false)
  }

  function addAnchor() {
    if (!newAnchor.trim()) return
    const next = [...anchors, newAnchor.trim()]
    setAnchors(next)
    localStorage.setItem('crisisAnchors', JSON.stringify(next))
    setNewAnchor(''); setShowAddAnchor(false)
  }
  function removeAnchor(i) {
    const next = anchors.filter((_, idx) => idx !== i)
    setAnchors(next)
    localStorage.setItem('crisisAnchors', JSON.stringify(next))
  }

  const TABS = [
    { id: 'call',    label: lang === 'fr' ? '📞 Appeler'  : '📞 Call'    },
    { id: 'breathe', label: lang === 'fr' ? '🌬️ Respirer' : '🌬️ Breathe' },
    { id: 'ground',  label: lang === 'fr' ? '🖐️ M\'ancrer' : '🖐️ Ground'  },
  ]

  return (
    <div className="relative overflow-hidden flex flex-col min-h-[100dvh]"
      style={{ background: 'linear-gradient(160deg, #1a0a0a 0%, #8B1A1A 50%, #C0392B 100%)' }}>
      <BgBlobs />
      <div className="relative z-10 w-full max-w-[560px] mx-auto px-6 pt-12 pb-8 flex flex-col flex-1">
      <AppHeader />
      <div className="overflow-y-auto no-scrollbar flex-1">

        {/* En-tête */}
        <div className="text-center mb-4 fade-in">
          <span className="text-[46px] pop-in inline-block mb-1">🆘</span>
          <h1 className="text-white font-extrabold text-[20px]">{t('crisisTitle')}</h1>
          <p className="text-white/70 text-[12px] mt-1">{t('crisisSub')}</p>
        </div>

        {/* Phrases d'ancrage */}
        {anchors.length > 0 && (
          <div className="bg-white/10 rounded-2xl px-4 py-3 mb-3 fade-in">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/70 text-[10px] font-extrabold uppercase tracking-widest">
                💬 {lang === 'fr' ? 'Mes phrases d\'ancrage' : 'My anchor phrases'}
              </p>
              <button onClick={() => setShowAddAnchor(v => !v)}
                className="text-white/40 text-[10px] bg-transparent border-none cursor-pointer">
                {showAddAnchor ? '✕' : lang === 'fr' ? '+ Ajouter' : '+ Add'}
              </button>
            </div>
            {anchors.map((a, i) => (
              <div key={i} className="flex items-start gap-2 mb-1.5">
                <p className="text-white text-[13px] italic leading-snug flex-1">"{a}"</p>
                <button onClick={() => removeAnchor(i)}
                  className="text-white/25 text-[10px] bg-transparent border-none cursor-pointer shrink-0 pt-0.5">✕</button>
              </div>
            ))}
            {showAddAnchor && (
              <div className="flex gap-2 mt-2">
                <input autoFocus value={newAnchor} onChange={e => setNewAnchor(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addAnchor()}
                  placeholder={lang === 'fr' ? 'Une phrase qui t\'aide...' : 'A phrase that helps you...'}
                  className="flex-1 bg-white/15 rounded-full px-3 py-2 text-[12px] text-white placeholder-white/40 outline-none border border-white/25" />
                <button onClick={addAnchor}
                  className="px-3 py-2 rounded-full text-[12px] font-bold text-white bg-white/25 border border-white/40 cursor-pointer">✓</button>
              </div>
            )}
          </div>
        )}

        {/* Bouton ajouter si aucune phrase */}
        {anchors.length === 0 && (
          <button onClick={() => setShowAddAnchor(v => !v)}
            className="w-full mb-3 py-2 rounded-full text-white/40 text-[12px] font-semibold border border-white/15 cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            💬 {lang === 'fr' ? 'Ajouter une phrase d\'ancrage personnelle' : 'Add a personal anchor phrase'}
          </button>
        )}
        {anchors.length === 0 && showAddAnchor && (
          <div className="bg-white/10 rounded-2xl px-4 py-3 mb-3 flex gap-2">
            <input autoFocus value={newAnchor} onChange={e => setNewAnchor(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addAnchor()}
              placeholder={lang === 'fr' ? 'Une phrase qui t\'aide...' : 'A phrase that helps you...'}
              className="flex-1 bg-white/15 rounded-full px-3 py-2 text-[12px] text-white placeholder-white/40 outline-none border border-white/25" />
            <button onClick={addAnchor}
              className="px-3 py-2 rounded-full text-[12px] font-bold text-white bg-white/25 border border-white/40 cursor-pointer">✓</button>
          </div>
        )}

        {/* Onglets */}
        <div className="flex gap-1 rounded-2xl p-1 mb-4" style={{ background: 'rgba(255,255,255,0.08)' }}>
          {TABS.map(({ id, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className="flex-1 py-2 rounded-xl text-[10.5px] font-bold transition-all border-none cursor-pointer"
              style={{
                background: tab === id ? 'rgba(255,255,255,0.2)' : 'transparent',
                color:      tab === id ? 'white' : 'rgba(255,255,255,0.4)',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Tab : Appeler ── */}
        {tab === 'call' && (
          <div className="fade-in">
            <div className="flex flex-col gap-2 mb-4">
              {t('crisisNumbers').map((item, i) => (
                <a key={i} href={`tel:${item.number}`}
                  className="flex items-center justify-between bg-white/15 rounded-2xl px-4 py-3 no-underline active:scale-[0.98] transition-transform">
                  <div>
                    <p className="text-white font-bold text-[14px]">{item.label}</p>
                    <p className="text-white/60 text-[11px]">{item.desc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-extrabold text-[18px]">{item.number}</span>
                    <span className="bg-white/25 rounded-full px-3 py-1 text-white text-[12px] font-bold border border-white/40">{t('crisisCallBtn')}</span>
                  </div>
                </a>
              ))}
            </div>

            <div className="bg-white/12 rounded-2xl px-4 py-4 mb-4">
              <p className="text-white font-bold text-[13px] mb-3">💙 {t('crisisEmergencyContact')}</p>
              {!editContact ? (
                profile?.contact_urgence_tel ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold text-[14px]">{profile.contact_urgence_nom || '—'}</p>
                      <p className="text-white/70 text-[13px]">{profile.contact_urgence_tel}</p>
                    </div>
                    <div className="flex gap-2">
                      <a href={`tel:${profile.contact_urgence_tel}`}
                        className="bg-white/25 rounded-full px-4 py-2 text-white text-[12px] font-bold border border-white/40 no-underline">
                        {t('crisisCallBtn')} 📞
                      </a>
                      <button onClick={() => setEditContact(true)}
                        className="text-white/60 text-[11px] bg-transparent border-none cursor-pointer">✏️</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setEditContact(true)}
                    className="w-full py-2.5 rounded-full text-white/80 text-[13px] font-bold bg-white/15 border border-white/25 cursor-pointer">
                    + {t('crisisAddContact')}
                  </button>
                )
              ) : (
                <div className="flex flex-col gap-2">
                  <input type="text" placeholder={t('crisisContactName')} value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    className="w-full bg-white/20 rounded-full px-4 py-2 text-[13px] text-white placeholder-white/50 outline-none border border-white/30" />
                  <input type="tel" placeholder={t('crisisContactPhone')} value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    className="w-full bg-white/20 rounded-full px-4 py-2 text-[13px] text-white placeholder-white/50 outline-none border border-white/30" />
                  <div className="flex gap-2">
                    <button onClick={() => setEditContact(false)}
                      className="flex-1 py-2 rounded-full text-[12px] font-bold text-white/70 bg-white/10 border border-white/20 cursor-pointer">{t('cancel')}</button>
                    <button onClick={handleSaveContact}
                      className="flex-1 py-2 rounded-full text-[12px] font-bold text-white bg-white/30 border border-white/50 cursor-pointer">{t('save')}</button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white/12 rounded-2xl px-4 py-4 mb-4">
              <p className="text-white font-bold text-[13px] mb-1">📚 {t('crisisResourcesTitle')}</p>
              <p className="text-white/55 text-[11px] mb-3">{t('crisisResourcesSub')}</p>
              {t('crisisResources').map((r, i) => (
                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between py-2.5 border-b border-white/10 last:border-0 no-underline">
                  <p className="text-white/85 text-[13px]">{r.label}</p>
                  <span className="text-white/50 text-[11px]">↗</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab : Respirer ── */}
        {tab === 'breathe' && (
          <div className="bg-white/10 rounded-2xl px-4 py-2 mb-4 fade-in">
            <BreathingExercise lang={lang} />
          </div>
        )}

        {/* ── Tab : M'ancrer ── */}
        {tab === 'ground' && (
          <div className="bg-white/10 rounded-2xl px-4 py-2 mb-4 fade-in">
            <GroundingExercise lang={lang} />
          </div>
        )}

        <button onClick={() => navigate(-1)}
          className="w-full py-2.5 rounded-full text-white/60 text-[13px] font-bold border border-white/15 fade-in"
          style={{ background: 'rgba(255,255,255,0.07)' }}>
          ← {lang === 'fr' ? 'Retour' : 'Back'}
        </button>
      </div>
      </div>
    </div>
  )
}
