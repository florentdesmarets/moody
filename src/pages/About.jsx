import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import BgBlobs from '../components/BgBlobs'
import AppHeader from '../components/AppHeader'
import { useLang } from '../context/LangContext'

const APP_URL    = 'https://florentdesmarets.github.io/moodtracker/'
const DONATE_URL = 'https://buymeacoffee.com/florent.d'

function AppQRCode({ size = 110 }) {
  const ref = useRef()
  useEffect(() => {
    if (!ref.current) return
    QRCode.toCanvas(ref.current, APP_URL, {
      width:  size * 2,
      margin: 1,
      color:  { dark: '#FF7040', light: '#FFFFFF' },
    }).catch(() => {})
  }, [size])
  return (
    <canvas
      ref={ref}
      width={size * 2}
      height={size * 2}
      style={{ width: size, height: size }}
      className="rounded-xl"
    />
  )
}

export default function About() {
  const navigate = useNavigate()
  const { t, lang } = useLang()

  async function handleShare() {
    const text = lang === 'fr'
      ? `😊 Moody — Journal émotionnel bienveillant\n${APP_URL}`
      : `😊 Moody — Daily emotional journal\n${APP_URL}`
    if (navigator.share) {
      await navigator.share({ title: 'Moody', text, url: APP_URL })
    } else {
      await navigator.clipboard.writeText(APP_URL)
      alert(lang === 'fr' ? 'Lien copié !' : 'Link copied!')
    }
  }

  return (
    <div className="bg-app relative overflow-hidden flex flex-col px-5 pt-12 pb-8 min-h-[100dvh]">
      <BgBlobs />
      <AppHeader />
      <div className="relative z-10 flex flex-col flex-1 fade-in overflow-y-auto no-scrollbar">

        {/* Header */}
        <div className="text-center mb-5">
          <span className="text-[52px] pop-in inline-block mb-2">🩷</span>
          <h1 className="text-white font-extrabold text-[20px]">{t('aboutTitle')}</h1>
        </div>

        {/* Histoire */}
        <div className="bg-white/15 rounded-3xl px-5 py-5 mb-3 slide-in stagger-1">
          {t('aboutBody').split('\n\n').map((para, i) => (
            <p key={i} className="text-white/90 text-[13px] leading-relaxed mb-3 last:mb-0">{para}</p>
          ))}
        </div>

        {/* ⚕️ Avertissement médical */}
        <div className="rounded-3xl px-5 py-4 mb-3 slide-in stagger-2"
          style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <p className="text-white font-bold text-[12px] mb-2">⚕️ {lang === 'fr' ? 'Avertissement médical' : 'Medical disclaimer'}</p>
          <p className="text-white/75 text-[12px] leading-relaxed">{t('aboutDisclaimer')}</p>
        </div>

        {/* 💙 Soutenir */}
        <div className="bg-white/15 rounded-3xl px-5 py-4 mb-3 slide-in stagger-3">
          <p className="text-white font-bold text-[13px] mb-2">💙 {t('aboutDonateTitle')}</p>
          <p className="text-white/80 text-[12px] leading-relaxed mb-3">{t('aboutDonateText')}</p>
          <a href={DONATE_URL} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full text-[13px] font-bold no-underline active:scale-[0.97] transition-transform"
            style={{ background: 'rgba(255,255,255,0.9)', color: '#0070ba' }}>
            {t('aboutDonateBtn')}
          </a>
        </div>

        {/* 📲 Partager l'app */}
        <div className="bg-white/15 rounded-3xl px-5 py-4 mb-3 slide-in stagger-4">
          <p className="text-white font-bold text-[13px] mb-2">📲 {t('aboutShareTitle')}</p>
          <p className="text-white/80 text-[12px] leading-relaxed mb-4">{t('aboutShareText')}</p>
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-2xl p-2 flex-shrink-0">
              <AppQRCode size={100} />
            </div>
            <div className="flex-1">
              <p className="text-white/60 text-[10px] mb-3 leading-relaxed">
                {lang === 'fr'
                  ? 'Scanne le QR code\nou partage directement :'
                  : 'Scan the QR code\nor share directly:'}
              </p>
              <button onClick={handleShare}
                className="w-full py-2.5 rounded-full text-[13px] font-bold text-white border-2 border-white/50 bg-white/20 active:scale-[0.97] transition-transform">
                {t('aboutShareBtn')} ↗
              </button>
            </div>
          </div>
        </div>

        {/* Version */}
        <div className="bg-white/10 rounded-3xl px-5 py-4 mb-4 text-center">
          <p className="text-white font-bold text-[15px] mb-1">{t('aboutMadeWith')}</p>
          <p className="text-white/50 text-[11px]">{t('aboutVersion')}</p>
        </div>

        <button onClick={() => navigate(-1)}
          className="w-full py-2.5 rounded-full text-white font-bold text-[14px] bg-white/20 border-2 border-white/40 active:scale-[1.02] transition-transform">
          ← {lang === 'fr' ? 'Retour' : 'Back'}
        </button>
      </div>
    </div>
  )
}
