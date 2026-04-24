import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import BgBlobs from '../components/BgBlobs'

const SLIDES = {
  fr: [
    {
      emoji:    '🩷',
      title:    'Bienvenue sur Moody',
      desc:     'Ton journal émotionnel bienveillant.\nQuelques secondes par jour pour mieux te comprendre et prendre soin de toi.',
      hint:     null,
    },
    {
      emoji:    '😊',
      title:    'Note ton humeur chaque jour',
      desc:     'Choisis un emoji, ajoute ton sommeil, tes activités et ton énergie.\nTout s\'enregistre en moins de 30 secondes.',
      hint:     '7 niveaux · journal · suivi du sommeil',
    },
    {
      emoji:    '📊',
      title:    'Découvre ce qui t\'influence',
      desc:     'Le calendrier et les graphiques révèlent les tendances de ton humeur au fil du temps.',
      hint:     'Calendrier · stats · corrélations activités',
    },
    {
      emoji:    '💙',
      title:    'Tu n\'es jamais seul·e',
      desc:     'Chatbot bienveillant, méditations guidées et mode crise disponibles à tout moment si tu en as besoin.',
      hint:     'Chatbot · méditations · numéros d\'urgence',
    },
  ],
  en: [
    {
      emoji:    '🩷',
      title:    'Welcome to Moody',
      desc:     'Your compassionate emotional journal.\nA few seconds a day to better understand and take care of yourself.',
      hint:     null,
    },
    {
      emoji:    '😊',
      title:    'Log your mood every day',
      desc:     'Pick an emoji, add your sleep, activities and energy level.\nAll saved in under 30 seconds.',
      hint:     '7 levels · journal · sleep tracking',
    },
    {
      emoji:    '📊',
      title:    'Discover what influences you',
      desc:     'The calendar and charts reveal your mood patterns over time.',
      hint:     'Calendar · stats · activity correlations',
    },
    {
      emoji:    '💙',
      title:    'You\'re never alone',
      desc:     'Supportive chatbot, guided meditations and crisis mode are always available when you need them.',
      hint:     'Chatbot · meditations · emergency numbers',
    },
  ],
}

function finish(navigate) {
  localStorage.setItem('moody_onboarded', 'true')
  navigate('/mood', { replace: true })
}

export default function Onboarding() {
  const navigate     = useNavigate()
  const { lang }     = useLang()
  const [step, setStep] = useState(0)
  const [dir,  setDir]  = useState(1)   // 1 = forward, -1 = backward
  const [anim, setAnim] = useState(true)
  const touchStart   = useRef(null)

  // Si déjà onboardé, passe directement
  useEffect(() => {
    if (localStorage.getItem('moody_onboarded')) navigate('/mood', { replace: true })
  }, [navigate])

  const slides = SLIDES[lang] ?? SLIDES.fr
  const slide  = slides[step]
  const isLast = step === slides.length - 1

  function goTo(next) {
    setDir(next > step ? 1 : -1)
    setAnim(false)
    setTimeout(() => { setStep(next); setAnim(true) }, 20)
  }

  function next() { isLast ? finish(navigate) : goTo(step + 1) }
  function prev() { if (step > 0) goTo(step - 1) }

  // Swipe tactile
  function onTouchStart(e) { touchStart.current = e.touches[0].clientX }
  function onTouchEnd(e) {
    if (touchStart.current === null) return
    const diff = touchStart.current - e.changedTouches[0].clientX
    if      (diff >  50) next()
    else if (diff < -50) prev()
    touchStart.current = null
  }

  return (
    <div
      className="bg-app relative overflow-hidden flex flex-col min-h-[100dvh]"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <BgBlobs />
      <div className="relative z-10 flex flex-col flex-1 w-full max-w-[480px] mx-auto px-6 pt-10 pb-8 select-none">

        {/* Barre supérieure : numéro + skip */}
        <div className="flex items-center justify-between mb-8">
          <span className="text-white/30 text-[12px] font-semibold">
            {step + 1} / {slides.length}
          </span>
          <button
            onClick={() => finish(navigate)}
            className="text-white/50 text-[13px] font-semibold bg-transparent border-none cursor-pointer active:text-white/80 transition-colors"
          >
            {lang === 'fr' ? 'Passer' : 'Skip'} ›
          </button>
        </div>

        {/* Contenu de la slide */}
        <div
          className="flex flex-col flex-1 items-center justify-center text-center gap-8"
          style={{
            opacity:   anim ? 1 : 0,
            transform: anim ? 'translateX(0)' : `translateX(${dir * 24}px)`,
            transition: 'opacity 280ms ease, transform 280ms ease',
          }}
        >
          {/* Emoji illustratif */}
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 120, height: 120,
              background: 'rgba(255,255,255,0.18)',
              fontSize: 62,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            }}
          >
            {slide.emoji}
          </div>

          {/* Texte */}
          <div className="max-w-[340px]">
            <h1 className="text-white font-extrabold text-[24px] leading-tight mb-4">
              {slide.title}
            </h1>
            <p className="text-white/75 text-[14px] leading-relaxed whitespace-pre-line">
              {slide.desc}
            </p>
          </div>

          {/* Chips de features */}
          {slide.hint && (
            <div className="flex flex-wrap justify-center gap-2">
              {slide.hint.split(' · ').map(h => (
                <span key={h}
                  className="text-[10px] font-semibold text-white/60 bg-white/12 rounded-full px-3 py-1 border border-white/15">
                  {h}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Dots de progression */}
        <div className="flex justify-center items-center gap-2 mb-6">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="rounded-full transition-all duration-300 border-none cursor-pointer p-0"
              style={{
                width:      i === step ? 24 : 8,
                height:     8,
                background: i === step ? 'white' : 'rgba(255,255,255,0.28)',
              }}
            />
          ))}
        </div>

        {/* Bouton principal */}
        <button
          onClick={next}
          className="w-full py-4 rounded-full text-[15px] font-extrabold bg-white active:scale-[0.98] transition-transform"
          style={{ color: '#FF7040' }}
        >
          {isLast
            ? (lang === 'fr' ? "C'est parti ! 🚀" : "Let's go! 🚀")
            : (lang === 'fr' ? 'Suivant →' : 'Next →')
          }
        </button>

        {/* Bouton retour (slides 2+) */}
        {step > 0 && (
          <button
            onClick={prev}
            className="w-full mt-2 py-2.5 text-[13px] font-semibold text-white/45 bg-transparent border-none cursor-pointer active:text-white/70 transition-colors"
          >
            ← {lang === 'fr' ? 'Retour' : 'Back'}
          </button>
        )}
      </div>
    </div>
  )
}
