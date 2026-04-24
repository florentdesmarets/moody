import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import BgBlobs from '../components/BgBlobs'
import { useLang } from '../context/LangContext'
import { MEDITATIONS } from '../lib/meditations'

// ─── Musique ambiante (Web Audio) ─────────────────────────────────────────────
// Accord de quinte pur (A1 + E2 + A2 + E3) → bol tibétain stylisé, très doux
function createAmbient() {
  try {
    const ctx     = new (window.AudioContext || window.webkitAudioContext)()
    const master  = ctx.createGain()
    master.gain.setValueAtTime(0, ctx.currentTime)
    master.connect(ctx.destination)

    const freqs  = [55, 82.41, 110, 164.81, 220] // A1 E2 A2 E3 A3
    const vols   = [0.04, 0.025, 0.018, 0.012, 0.007]
    const oscs   = freqs.map((f, i) => {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      // léger vibrato pour l'humaniser
      const lfo  = ctx.createOscillator()
      const lfoG = ctx.createGain()
      lfo.frequency.value = 0.18 + i * 0.04
      lfoG.gain.value = 0.35
      lfo.connect(lfoG)
      lfoG.connect(osc.frequency)
      lfo.start()
      osc.type = 'sine'
      osc.frequency.value = f
      gain.gain.value = vols[i]
      osc.connect(gain)
      gain.connect(master)
      osc.start()
      return osc
    })

    // Fondu entrant sur 4s
    master.gain.linearRampToValueAtTime(1, ctx.currentTime + 4)

    return {
      fadeOut: () => {
        const t = ctx.currentTime
        master.gain.setValueAtTime(master.gain.value, t)
        master.gain.linearRampToValueAtTime(0, t + 3)
        setTimeout(() => { try { ctx.close() } catch(_) {} }, 3500)
      }
    }
  } catch (_) {
    return { fadeOut: () => {} }
  }
}

// ─── Ton doux de respiration (Web Audio) ──────────────────────────────────────
function playBreathTone(direction) {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)()
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    const [f0, f1] = direction === 'in' ? [396, 528] : [528, 396]
    osc.type = 'sine'
    osc.frequency.setValueAtTime(f0, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(f1, ctx.currentTime + 0.9)
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.12)
    gain.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.70)
    gain.gain.linearRampToValueAtTime(0,    ctx.currentTime + 1.0)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 1.0)
    osc.onended = () => ctx.close()
  } catch (_) {}
}

// ─── Cercle respiratoire animé (purement décoratif) ───────────────────────────
function BreathingCircle({ breatheState, isPlaying }) {
  const scale = breatheState === 'in'  ? 1.40
              : breatheState === 'out' ? 0.70
              : isPlaying              ? 1.08
              : 1
  const dur = breatheState ? '5.2s' : '2.5s'

  // Label uniquement pendant les phases de respiration
  const label = breatheState === 'in'  ? '↑'
              : breatheState === 'out' ? '↓'
              : null

  return (
    <div className="relative flex items-center justify-center my-5 select-none pointer-events-none">
      <div className="absolute w-52 h-52 rounded-full bg-white/8"
        style={{ transform: `scale(${scale})`, transition: `transform ${dur} ease-in-out` }} />
      <div className="absolute w-40 h-40 rounded-full bg-white/10"
        style={{ transform: `scale(${scale})`, transition: `transform ${dur} ease-in-out` }} />
      <div className="w-28 h-28 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center backdrop-blur-sm shadow-lg"
        style={{ transform: `scale(${scale})`, transition: `transform ${dur} ease-in-out` }}>
        {label
          ? <span className="text-white font-bold text-[28px] leading-none">{label}</span>
          : isPlaying
            ? <span className="text-white/60 text-[13px] tracking-widest">···</span>
            : null
        }
      </div>
    </div>
  )
}

// ─── Carte de sélection ────────────────────────────────────────────────────────
function MeditationCard({ med, lang, isSelected, onSelect }) {
  const title = med.title[lang] ?? med.title.fr
  const desc  = med.desc[lang]  ?? med.desc.fr
  return (
    <button onClick={onSelect}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl border-2 transition-all duration-200 text-left ${
        isSelected ? 'bg-white/25 border-white/70 shadow-sm' : 'bg-white/10 border-white/20'
      }`}>
      <span className="text-[26px] flex-shrink-0">{med.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-[13px] leading-tight">{title}</p>
        <p className="text-white/60 text-[10px] leading-tight mt-0.5 line-clamp-1">{desc}</p>
      </div>
      <span className="text-white/50 text-[10px] font-bold flex-shrink-0">{med.duration}</span>
    </button>
  )
}

// ─── Page principale ───────────────────────────────────────────────────────────
export default function Meditation() {
  const { lang } = useLang()
  const [searchParams] = useSearchParams()

  const [selected,     setSelected]     = useState(() => {
    const id = searchParams.get('id')
    return id ? (MEDITATIONS.find(m => m.id === id) ?? MEDITATIONS[0]) : MEDITATIONS[0]
  })
  const [isPlaying,    setIsPlaying]    = useState(false)
  const [isPaused,     setIsPaused]     = useState(false)
  const [currentStep,  setCurrentStep]  = useState(-1)
  const [breatheState, setBreatheState] = useState(null)
  const [progress,     setProgress]     = useState(0)

  const stoppedRef = useRef(true)
  const pausedRef  = useRef(false)
  const timerRef   = useRef(null)
  const audioRef   = useRef(null)
  const ambientRef = useRef(null) // musique de fond

  // Nettoyage au démontage
  useEffect(() => () => {
    stoppedRef.current = true
    stopAudio()
    stopAmbient()
    clearTimeout(timerRef.current)
  }, [])

  // ─── Ambient ────────────────────────────────────────────────────────────────
  function startAmbient() {
    stopAmbient()
    ambientRef.current = createAmbient()
  }
  function stopAmbient() {
    ambientRef.current?.fadeOut()
    ambientRef.current = null
  }

  // ─── Audio MP3 ──────────────────────────────────────────────────────────────
  function stopAudio() {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
  }

  function playStep(medId, stepLang, idx) {
    return new Promise(resolve => {
      stopAudio()
      const url   = `/audio/meditations/${medId}_${stepLang}_${String(idx).padStart(2, '0')}.mp3`
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = resolve
      audio.onerror = resolve
      audio.play().catch(resolve)
    })
  }

  function sleep(ms) {
    return new Promise(resolve => { timerRef.current = setTimeout(resolve, ms) })
  }

  // ─── Lecture séquentielle ────────────────────────────────────────────────────
  async function runMeditation(med) {
    const script   = med.script[lang] ?? med.script.fr
    const stepLang = med.script[lang] ? lang : 'fr'

    stoppedRef.current = false
    pausedRef.current  = false
    setIsPlaying(true)
    setIsPaused(false)
    setProgress(0)
    startAmbient()

    for (let i = 0; i < script.length; i++) {
      if (stoppedRef.current) break
      while (pausedRef.current && !stoppedRef.current) await sleep(100)
      if (stoppedRef.current) break

      const step = script[i]
      setCurrentStep(i)
      setBreatheState(step.breathe ?? null)
      setProgress(Math.round((i / script.length) * 100))

      if (step.breathe) playBreathTone(step.breathe)

      await playStep(med.id, stepLang, i)
      if (stoppedRef.current) break
      await sleep(step.pause)
    }

    if (!stoppedRef.current) setProgress(100)
    stoppedRef.current = true
    stopAmbient()
    setIsPlaying(false)
    setIsPaused(false)
    setCurrentStep(-1)
    setBreatheState(null)
    setTimeout(() => setProgress(0), 600)
  }

  // ─── Contrôles ───────────────────────────────────────────────────────────────
  function handlePlay() { if (selected) runMeditation(selected) }

  function handlePause() {
    if (isPaused) {
      pausedRef.current = false
      audioRef.current?.play().catch(() => {})
      setIsPaused(false)
    } else {
      pausedRef.current = true
      audioRef.current?.pause()
      setIsPaused(true)
    }
  }

  function handleStop() {
    stoppedRef.current = true
    pausedRef.current  = false
    stopAudio()
    stopAmbient()
    clearTimeout(timerRef.current)
    setIsPlaying(false)
    setIsPaused(false)
    setCurrentStep(-1)
    setProgress(0)
    setBreatheState(null)
  }

  function handleSelect(med) { if (isPlaying) handleStop(); setSelected(med) }

  const script      = selected ? (selected.script[lang] ?? selected.script.fr) : []
  const currentText = currentStep >= 0 ? script[currentStep]?.text : null

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="bg-app relative overflow-hidden flex flex-col min-h-[100dvh]">
      <BgBlobs />
      <div className="relative z-10 w-full max-w-[560px] mx-auto px-4 pt-12 pb-8 flex flex-col flex-1 overflow-y-auto no-scrollbar">
        <AppHeader />

        {/* Titre */}
        <div className="text-center mb-4 fade-in">
          <h1 className="text-white font-extrabold text-[18px]">
            🎧 {lang === 'fr' ? 'Méditations guidées' : 'Guided meditations'}
          </h1>
          <p className="text-white/55 text-[10px] mt-0.5">
            {lang === 'fr' ? 'Voix neurales · Musique douce · 2–5 min'
                           : 'Neural voices · Soft music · 2–5 min'}
          </p>
        </div>

        {/* Liste */}
        <div className="flex flex-col gap-2 mb-4">
          {MEDITATIONS.map(med => (
            <MeditationCard key={med.id} med={med} lang={lang}
              isSelected={selected?.id === med.id}
              onSelect={() => handleSelect(med)} />
          ))}
        </div>

        {/* ─── Player ──────────────────────────────────────────────────────── */}
        {selected && (
          <div className="bg-white/10 rounded-3xl px-5 py-4 border border-white/20 flex flex-col items-center">

            {/* Cercle décoratif (pas un bouton) */}
            <BreathingCircle breatheState={breatheState} isPlaying={isPlaying && !isPaused} />

            {/* Label inspire / expire */}
            {breatheState && (
              <p className="text-white/85 text-[11px] font-bold uppercase tracking-widest -mt-2 mb-1">
                {breatheState === 'in'
                  ? (lang === 'fr' ? '↑ Inspire' : '↑ Inhale')
                  : (lang === 'fr' ? '↓ Expire'  : '↓ Exhale')}
              </p>
            )}

            {/* Texte courant */}
            <div className="min-h-[52px] flex items-center justify-center w-full mb-3 px-2">
              {currentText
                ? <p className="text-white text-[13px] font-medium text-center leading-relaxed fade-in">{currentText}</p>
                : <p className="text-white/40 text-[12px] text-center italic">
                    {lang === 'fr'
                      ? `${selected.title.fr} · ${selected.duration}`
                      : `${selected.title.en ?? selected.title.fr} · ${selected.duration}`}
                  </p>
              }
            </div>

            {/* Barre de progression */}
            <div className="w-full h-1 bg-white/15 rounded-full mb-5 overflow-hidden">
              <div className="h-full bg-white/60 rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }} />
            </div>

            {/* ─── Contrôles — un seul bouton Play, ou Pause + Stop ──────── */}
            <div className="flex items-center justify-center gap-4">
              {!isPlaying ? (
                /* État inactif : un seul grand bouton Play */
                <button onClick={handlePlay}
                  className="flex items-center gap-2.5 px-8 py-3 rounded-full bg-white font-bold text-[15px] shadow-xl active:scale-95 transition-transform"
                  style={{ color: selected.color ?? '#FF7040' }}>
                  <span>▶</span>
                  <span>{lang === 'fr' ? 'Commencer' : 'Start'}</span>
                </button>
              ) : (
                /* État en lecture : Pause + Stop côte à côte */
                <>
                  <button onClick={handlePause}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 border-2 border-white/50 text-white font-bold text-[13px] active:scale-95 transition-transform">
                    <span>{isPaused ? '▶' : '⏸'}</span>
                    <span>{isPaused
                      ? (lang === 'fr' ? 'Reprendre' : 'Resume')
                      : (lang === 'fr' ? 'Pause'     : 'Pause')}</span>
                  </button>
                  <button onClick={handleStop}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 border-2 border-white/50 text-white font-bold text-[13px] active:scale-95 transition-transform">
                    <span>⏹</span>
                    <span>{lang === 'fr' ? 'Arrêter' : 'Stop'}</span>
                  </button>
                </>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
