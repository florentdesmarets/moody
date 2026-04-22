import { useState, useEffect } from 'react'
import { useLang } from '../context/LangContext'

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}
function isInStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}

export default function PWAInstallBanner() {
  const { t } = useLang()
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
    const handler = (e) => {
      e.preventDefault()
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
    if (outcome === 'accepted') dismiss()
    else setDeferredPrompt(null)
    setShowAndroid(false)
  }

  if (dismissed || (!showAndroid && !showIOS)) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 max-w-[430px] mx-auto px-4 pb-5 fade-in">
      <div className="bg-white rounded-2xl shadow-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-[32px]">📲</span>
          <div className="flex-1">
            <p className="text-[14px] font-extrabold text-[#FF7040] mb-0.5">{t('installTitle')}</p>
            {showAndroid && (
              <p className="text-[12px] text-[#888] leading-snug">{t('installSub')}</p>
            )}
            {showIOS && (
              <p className="text-[12px] text-[#888] leading-snug">
                {t('installIOSSub')} <strong>⎙</strong> → <strong>{t('installIOSAdd')}</strong>
              </p>
            )}
          </div>
          <button onClick={dismiss} className="text-[#ccc] text-[18px] font-bold bg-transparent border-none cursor-pointer leading-none">×</button>
        </div>
        {showAndroid && (
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
        )}
      </div>
    </div>
  )
}
