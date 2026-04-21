import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import BgBlobs from '../components/BgBlobs'

export default function Welcome() {
  const navigate = useNavigate()
  const { t, lang, setLang } = useLang()
  const [showAbout, setShowAbout] = useState(false)

  return (
    <div className="bg-app relative overflow-hidden flex flex-col items-center justify-center px-6 py-12 min-h-[100dvh]">
      <BgBlobs />

      <div className="absolute top-5 right-5 z-10 flex gap-2">
        {['fr', 'en'].map(l => (
          <button key={l} onClick={() => setLang(l)}
            className={`text-[12px] font-bold px-2.5 py-1 rounded-full border transition-all ${lang === l ? 'bg-white text-[#FF7040] border-white' : 'bg-transparent text-white/70 border-white/40'}`}>
            {l === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
          </button>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center text-center fade-in">
        <h1 className="text-white font-extrabold text-[22px] leading-snug mb-3">
          {t('welcome')}<br />{t('appName')}
        </h1>
        <div className="text-[56px] mb-4">😊</div>
        <p className="text-white/80 text-[13px] mb-8">{t('welcomeSub')}</p>
        <div className="flex gap-3 mb-6">
          <button onClick={() => navigate('/login')}
            className="px-6 py-2.5 rounded-full text-white font-bold text-[14px] bg-white/25 border-2 border-white/65 active:scale-[1.03] transition-transform">
            {t('login')}
          </button>
          <button onClick={() => navigate('/register')}
            className="px-6 py-2.5 rounded-full text-white font-bold text-[14px] bg-white/25 border-2 border-white/65 active:scale-[1.03] transition-transform">
            {t('register')}
          </button>
        </div>
        <button onClick={() => setShowAbout(true)}
          className="text-white/60 text-[12px] font-semibold underline underline-offset-2 bg-transparent border-none cursor-pointer">
          {t('navAbout')}
        </button>
      </div>

      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => setShowAbout(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-full max-w-[430px] rounded-t-3xl px-6 pt-6 pb-10 fade-in"
            style={{ background: 'linear-gradient(160deg, #FFD07A 0%, #FF8C5A 100%)' }}
            onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-white/40 rounded-full mx-auto mb-5" />
            <div className="text-center mb-4">
              <span className="text-[44px]">🩷</span>
              <h2 className="text-white font-extrabold text-[18px] mt-1">{t('aboutTitle')}</h2>
            </div>
            <div className="bg-white/15 rounded-2xl px-4 py-4 mb-4">
              {t('aboutBody').split('\n\n').map((para, i) => (
                <p key={i} className="text-white/90 text-[13px] leading-relaxed mb-3 last:mb-0">{para}</p>
              ))}
            </div>
            <p className="text-white/60 text-[11px] text-center">{t('aboutMadeWith')} · {t('aboutVersion')}</p>
            <button onClick={() => setShowAbout(false)}
              className="mt-4 w-full py-2.5 rounded-full text-white font-bold text-[13px] bg-white/20 border border-white/35">
              {t('close')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
