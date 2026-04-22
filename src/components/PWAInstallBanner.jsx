import { useState, useEffect } from 'react'
import { useLang } from '../context/LangContext'

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}
function isInStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}

export default function PWAInstallBanner() {
  const { t, lang } = useLang()
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showAndroid,    setShowAndroid]    = useState(false)
  const [showIOS,        setShowIOS]        = useState(false)
  const [dismissed,      setDismissed]      = useState(
    () => localStorage.getItem('pwa_banner_dismissed') === '1'
  )

  useEffect(() => {
    if (dismissed || isInStandalone()) return

    if (isIOS()) {
      setShowIOS(true)
      return
    }

    // L'event a peut-être déjà été capturé avant que React monte (dans index.html)
    if (window.__pwaInstallPrompt) {
      setDeferredPrompt(window.__pwaInstallPrompt)
      setShowAndroid(true)
      return
    }

    // Sinon on écoute s'il arrive plus tard
    const handler = (e) => {
      e.preventDefault()
      window.__pwaInstallPrompt = e
      setDeferredPrompt(e)
      setShowAndroid(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [dismissed])

  function dismiss() {
    localStorage.setItem('pwa_banner_dismissed', '1')
    setDismissed(true)
    setShowAndroid(false)
    setShowIOS(false)
  }

  async function handleInstall() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    window.__pwaInstallPrompt = null
    if (outcome === 'accepted') dismiss()
    else setDeferredPrompt(null)
    setShowAndroid(false)
  }

  if (dismissed || (!showAndroid && !showIOS)) return null

  /* ── Bannière Android ── */
  if (showAndroid) return (
    <div className="fixed bottom-0 left-0 right-0 z-[70] max-w-[560px] mx-auto px-4 pb-5 fade-in">
      <div className="bg-white rounded-2xl shadow-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-[32px]">📲</span>
          <div className="flex-1">
            <p className="text-[14px] font-extrabold text-[#FF7040] mb-0.5">{t('installTitle')}</p>
            <p className="text-[12px] text-[#888] leading-snug">{t('installSub')}</p>
          </div>
          <button onClick={dismiss} className="text-[#ccc] text-[20px] font-bold bg-transparent border-none cursor-pointer leading-none">×</button>
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={dismiss}
            className="flex-1 py-2 rounded-full text-[12px] font-bold text-[#aaa] bg-[#f5f5f5] border-none cursor-pointer">
            {t('installDismiss')}
          </button>
          <button onClick={handleInstall}
            className="flex-1 py-2 rounded-full text-[12px] font-bold text-white border-none cursor-pointer"
            style={{ background: 'linear-gradient(135deg,#FF8C5A,#FF6B5A)' }}>
            {t('installBtn')}
          </button>
        </div>
      </div>
    </div>
  )

  /* ── Bannière iOS ── */
  const isFR = lang === 'fr'
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[70] max-w-[560px] mx-auto px-4 pb-5 fade-in">
      <div className="rounded-2xl shadow-2xl overflow-hidden" style={{ background: '#fff' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3"
          style={{ background: 'linear-gradient(135deg,#FF8C5A,#FF6B5A)' }}>
          <div className="flex items-center gap-2">
            <span className="text-[26px]">📲</span>
            <div>
              <p className="text-white font-extrabold text-[14px] leading-tight">
                {isFR ? 'Installer Moody' : 'Install Moody'}
              </p>
              <p className="text-white/75 text-[11px]">
                {isFR ? 'Sur ton écran d\'accueil' : 'On your home screen'}
              </p>
            </div>
          </div>
          <button onClick={dismiss}
            className="text-white/60 text-[22px] font-bold bg-transparent border-none cursor-pointer leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20">
            ×
          </button>
        </div>

        {/* Étapes */}
        <div className="px-4 pt-3 pb-2">
          <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-wide mb-3">
            {isFR ? '3 étapes simples — uniquement dans Safari' : '3 easy steps — Safari only'}
          </p>

          {/* Étape 1 */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[12px] font-bold"
              style={{ background: 'linear-gradient(135deg,#FF8C5A,#FF6B5A)' }}>1</div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-[#1a1a1a]">
                {isFR ? 'Appuie sur le bouton Partager' : 'Tap the Share button'}
              </p>
              <p className="text-[12px] text-[#888] leading-snug">
                {isFR
                  ? 'C\'est l\'icône ⎙ en bas au centre de Safari'
                  : 'It\'s the ⎙ icon at the bottom center of Safari'}
              </p>
            </div>
            <span className="text-[24px]">⎙</span>
          </div>

          {/* Séparateur */}
          <div className="ml-3.5 w-px h-3 bg-[#eee] mb-1" />

          {/* Étape 2 */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[12px] font-bold"
              style={{ background: 'linear-gradient(135deg,#FF8C5A,#FF6B5A)' }}>2</div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-[#1a1a1a]">
                {isFR ? 'Choisis « Sur l\'écran d\'accueil »' : 'Tap "Add to Home Screen"'}
              </p>
              <p className="text-[12px] text-[#888] leading-snug">
                {isFR
                  ? 'Fais défiler le menu vers le bas pour trouver cette option'
                  : 'Scroll down in the share menu to find this option'}
              </p>
            </div>
            <span className="text-[24px]">🏠</span>
          </div>

          {/* Séparateur */}
          <div className="ml-3.5 w-px h-3 bg-[#eee] mb-1" />

          {/* Étape 3 */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[12px] font-bold"
              style={{ background: 'linear-gradient(135deg,#FF8C5A,#FF6B5A)' }}>3</div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-[#1a1a1a]">
                {isFR ? 'Appuie sur « Ajouter »' : 'Tap "Add"'}
              </p>
              <p className="text-[12px] text-[#888] leading-snug">
                {isFR
                  ? 'L\'icône Moody apparaît sur ton écran d\'accueil 🎉'
                  : 'The Moody icon appears on your home screen 🎉'}
              </p>
            </div>
            <span className="text-[24px]">✅</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4">
          <button onClick={dismiss}
            className="w-full py-2.5 rounded-full text-[13px] font-bold text-[#aaa] bg-[#f5f5f5] border-none cursor-pointer">
            {isFR ? 'Plus tard' : 'Later'}
          </button>
        </div>

      </div>
    </div>
  )
}
