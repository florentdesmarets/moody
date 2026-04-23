import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import BgBlobs from '../components/BgBlobs'
import { useLang } from '../context/LangContext'
import { MEDITATIONS } from '../lib/meditations'

// ─── Cercle respiratoire animé ────────────────────────────────────────────────
function BreathingCircle({ breatheState, isPlaying }) {
  // scale selon l'état
  const scale = breatheState === 'in'  ? 1.38
              : breatheState === 'out' ? 0.72
              : isPlaying              ? 1.08
              : 1

  const dur = breatheState ? '5.2s' : '2.5s'

  const label = breatheState === 'in'  ? '↑'
              : breatheState === 'out' ? '↓'
              : isPlaying              ? '···'
              : '▶'

  return (
    <div className="relative flex items-center justify-center my-5 select-none">
      {/* Halo extérieur */}
      <div className="absolute w-48 h-48 rounded-full bg-white/10"
        style={{ transform: `scale(${scale})`, transition: `transform ${dur} ease-in-out` }} />
      {/* Anneau intermédiaire */}
      <div className="absolute w-40 h-40 rounded-full bg-white/10"
        style={{ transform: `scale(${scale})`, transition: `transform ${dur} ease-in-out` }} />
      {/* Cercle principal */}
      <div className="w-28 h-28 rounded-full bg-white/25 border-2 border-white/60 flex items-center justify-center backdrop-blur-sm shadow-lg"
        style={{ transform: `scale(${scale})`, transition: `transform ${dur} ease-in-out` }}>
        <span className="text-white font-bold text-[26px] leading-none">{label}</span>
      </div>
    </div>
  )
}

// ─── Carte méditation dans la liste ───────────────────────────────────────────
function MeditationCard({ med, lang, isSelected, onSelect }) {
  const title = med.title[lang] ?? med.title.fr
  const desc  = med.desc[lang]  ?? med.desc.fr
  return (
    <button onClick={onSelect}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl border-2 transition-all duration-200 text-left ${
        isSelected ? 'bg-white/25 border-white/70 shadow-sm' : 'bg-white/10 border-white/20'
      }`}>
      <span className="text-[28px] flex-shrink-0">{med.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-[13px] leading-tight">{title}</p>
        <p className="text-white/60 text-[10px] leading-tight mt-0.5 line-clamp-2">{desc}</p>
      </div>
      <span className="text-white/50 text-[10px] font-bold flex-shrink-0">{med.duration}</span>
    </button>
  )
}

// ─── Page principale ───────────────────────────────────────────────────────────
export default function Meditation() {
  const { lang } = useLang()
  const navigate  = useNavigate()
  const [searchParams] = useSearchParams()

  // Présélection via ?id=coherence
  const [selected,    setSelected]    = useState(() => {
    const id = searchParams.get('id')
    return id ? MEDITATIONS.find(m => m.id === id) ?? MEDITATIONS[0] : MEDITATIONS[0]
  })
  const [isPlaying,   setIsPlaying]   = useState(false)
  const [isPaused,    setIsPaused]    = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [breatheState,setBreatheState]= useState(null)
  const [progress,    setProgress]    = useState(0)
  const [noVoice,     setNoVoice]     = useState(false)

  const stoppedRef = useRef(true)
  const pausedRef  = useRef(false)
  const timerRef   = useRef(null)

  // Vérifie si des voix sont disponibles
  useEffect(() => {
    function check() {
      const voices = window.speechSynthesis.getVoices()
      const code   = lang === 'fr' ? 'fr' : 'en'
      setNoVoice(voices.length > 0 && !voices.some(v => v.lang.startsWith(code)))
    }
    check()
    window.speechSynthesis.addEventListener?.('voiceschanged', check)
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', check)
  }, [lang])

  // Nettoyage au démontage
  useEffect(() => () => {
    stoppedRef.current = true
    window.speechSynthesis.cancel()
    clearTimeout(timerRef.current)
  }, [])

  // ─ Helpers ─────────────────────────────────────────────────────────────────
  function getBestVoice(code) {
    const voices = window.speechSynthesis.getVoices()
    return voices.find(v => v.lang.startsWith(code) && v.localService)
        ?? voices.find(v => v.lang.startsWith(code))
        ?? null
  }

  function speakText(text) {
    return new Promise(resolve => {
      window.speechSynthesis.cancel()
      const utt   = new SpeechSynthesisUtterance(text)
      utt.lang    = lang === 'fr' ? 'fr-FR' : 'en-US'
      utt.rate    = 0.80
      utt.pitch   = 0.92
      utt.volume  = 1
      const voice = getBestVoice(lang === 'fr' ? 'fr' : 'en')
      if (voice) utt.voice = voice
      utt.onend   = resolve
      utt.onerror = resolve
      window.speechSynthesis.speak(utt)
    })
  }

  function sleep(ms) {
    return new Promise(resolve => { timerRef.current = setTimeout(resolve, ms) })
  }

  // ─ Lecture séquentielle ────────────────────────────────────────────────────
  async function runMeditation(med) {
    const script = med.script[lang] ?? med.script.fr
    stoppedRef.current = false
    pausedRef.current  = false
    setIsPlaying(true)
    setIsPaused(false)
    setProgress(0)

    for (let i = 0; i < script.length; i++) {
      if (stoppedRef.current) break

      // Attendre si en pause
      while (pausedRef.current && !stoppedRef.current) await sleep(150)
      if (stoppedRef.current) break

      const step = script[i]
      setCurrentStep(i)
      setBreatheState(step.breathe ?? null)
      setProgress(Math.round((i / script.length) * 100))

      await speakText(step.text)
      if (stoppedRef.current) break
      await sleep(step.pause)
    }

    stoppedRef.current = true
    setIsPlaying(false)
    setIsPaused(false)
    setCurrentStep(-1)
    setBreatheState(null)
    setProgress(stoppedRef.current ? 0 : 100)
  }

  // ─ Contrôles ───────────────────────────────────────────────────────────────
  function handlePlay() {
    if (!selected) return
    setProgress(0)
    runMeditation(selected)
  }

  function handlePause() {
    if (isPaused) {
      pausedRef.current = false
      window.speechSynthesis.resume()
      setIsPaused(false)
    } else {
      pausedRef.current = true
      window.speechSynthesis.pause()
      setIsPaused(true)
    }
  }

  function handleStop() {
    stoppedRef.current = true
    pausedRef.current  = false
    window.speechSynthesis.cancel()
    clearTimeout(timerRef.current)
    setIsPlaying(false)
    setIsPaused(false)
    setCurrentStep(-1)
    setProgress(0)
    setBreatheState(null)
  }

  function handleSelect(med) {
    if (isPlaying) handleStop()
    setSelected(med)
  }

  // ─ Données courantes ────────────────────────────────────────────────────────
  const script      = selected ? (selected.script[lang] ?? selected.script.fr) : []
  const currentText = currentStep >= 0 ? script[currentStep]?.text : null

  // ─ Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="bg-app relative overflow-hidden flex flex-col min-h-[100dvh]">
      <BgBlobs />
      <div className="relative z-10 w-full max-w-[560px] mx-auto px-4 pt-12 pb-8 flex flex-col flex-1">
        <AppHeader />

        {/* Titre */}
        <div className="text-center mb-4 fade-in">
          <h1 className="text-white font-extrabold text-[18px]">
            🎧 {lang === 'fr' ? 'Méditations guidées' : 'Guided meditations'}
          </h1>
          <p className="text-white/55 text-[10px] mt-0.5">
            {lang === 'fr'
              ? 'Voix de ton appareil · Sans internet · 2–5 min'
              : 'Device voice · No internet needed · 2–5 min'}
          </p>
        </div>

        {/* Avertissement voix manquante */}
        {noVoice && (
          <div className="bg-white/15 rounded-2xl px-4 py-2.5 mb-3 border border-white/30">
            <p className="text-white text-[11px] leading-relaxed">
              ⚠️ {lang === 'fr'
                ? 'Aucune voix française trouvée sur cet appareil. La voix par défaut sera utilisée.'
                : 'No English voice found on this device. The default voice will be used.'}
            </p>
          </div>
        )}

        {/* Liste */}
        <div className="flex flex-col gap-2 mb-4">
          {MEDITATIONS.map(med => (
            <MeditationCard
              key={med.id}
              med={med}
              lang={lang}
              isSelected={selected?.id === med.id}
              onSelect={() => handleSelect(med)}
            />
          ))}
        </div>

        {/* ─── Player ─────────────────────────────────────────────────────── */}
        {selected && (
          <div className="bg-white/10 rounded-3xl px-5 py-4 border border-white/20 flex flex-col items-center">

            {/* Cercle */}
            <BreathingCircle breatheState={breatheState} isPlaying={isPlaying && !isPaused} />

            {/* Indication inspire / expire */}
            {breatheState && (
              <p className="text-white/80 text-[11px] font-semibold uppercase tracking-widest mb-1 -mt-2">
                {breatheState === 'in'
                  ? (lang === 'fr' ? 'Inspire' : 'Inhale')
                  : (lang === 'fr' ? 'Expire'  : 'Exhale')}
              </p>
            )}

            {/* Texte courant */}
            <div className="min-h-[52px] flex items-center justify-center w-full mb-3 px-2">
              {currentText ? (
                <p className="text-white text-[13px] font-medium text-center leading-relaxed">
                  {currentText}
                </p>
              ) : (
                <p className="text-white/40 text-[12px] text-center italic">
                  {lang === 'fr'
                    ? `${selected.title.fr} · ${selected.duration}`
                    : `${selected.title.en ?? selected.title.fr} · ${selected.duration}`}
                </p>
              )}
            </div>

            {/* Barre de progression */}
            <div className="w-full h-1 bg-white/15 rounded-full mb-4 overflow-hidden">
              <div className="h-full bg-white/60 rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }} />
            </div>

            {/* Contrôles */}
            <div className="flex items-center justify-center gap-5">
              {!isPlaying ? (
                <button onClick={handlePlay}
                  className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[24px] shadow-xl active:scale-95 transition-transform"
                  style={{ color: selected.color ?? '#FF7040' }}>
                  ▶
                </button>
              ) : (
                <>
                  <button onClick={handlePause}
                    className="w-13 h-13 w-12 h-12 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center text-[20px] text-white active:scale-95 transition-transform">
                    {isPaused ? '▶' : '⏸'}
                  </button>
                  <button onClick={handleStop}
                    className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center text-[20px] text-white active:scale-95 transition-transform">
                    ⏹
                  </button>
                </>
              )}
            </div>

            {/* Note iOS */}
            <p className="text-white/30 text-[9px] text-center mt-3 leading-relaxed">
              {lang === 'fr'
                ? 'Garde l\'écran allumé pendant la méditation · La qualité de la voix dépend de ton appareil'
                : 'Keep the screen on during meditation · Voice quality depends on your device'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
