import { useNavigate } from 'react-router-dom'
import BgBlobs from '../components/BgBlobs'
import AppHeader from '../components/AppHeader'
import { useLang } from '../context/LangContext'

export default function About() {
  const navigate = useNavigate()
  const { t } = useLang()

  return (
    <div className="bg-app relative overflow-hidden flex flex-col px-6 pt-12 pb-8 min-h-[100dvh]">
      <BgBlobs />
      <AppHeader />
      <div className="relative z-10 flex flex-col flex-1 fade-in">
        <div className="text-center mb-6">
          <span className="text-[56px] pop-in inline-block mb-2">🩷</span>
          <h1 className="text-white font-extrabold text-[20px]">{t('aboutTitle')}</h1>
        </div>

        <div className="bg-white/15 rounded-3xl px-5 py-5 mb-4 slide-in stagger-1">
          {t('aboutBody').split('\n\n').map((para, i) => (
            <p key={i} className="text-white/90 text-[13px] leading-relaxed mb-3 last:mb-0">{para}</p>
          ))}
        </div>

        <div className="bg-white/10 rounded-3xl px-5 py-4 mb-4 slide-in stagger-2 text-center">
          <p className="text-white font-bold text-[15px] mb-1">{t('aboutMadeWith')}</p>
          <p className="text-white/60 text-[11px]">{t('aboutVersion')}</p>
        </div>

        <div className="flex-1" />

        <button onClick={() => navigate(-1)}
          className="w-full py-2.5 rounded-full text-white font-bold text-[14px] bg-white/20 border-2 border-white/40 active:scale-[1.02] transition-transform fade-in stagger-3">
          ← Retour
        </button>
      </div>
    </div>
  )
}
