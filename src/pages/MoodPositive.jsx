import { useNavigate, useLocation } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import BgBlobs from '../components/BgBlobs'
import { useLang } from '../context/LangContext'

export default function MoodPositive() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t }    = useLang()
  const { level, emoji } = location.state ?? { level: 7, emoji: '😄' }

  return (
    <div className="bg-app relative overflow-hidden flex flex-col min-h-[100dvh]">
      <BgBlobs />
      <div className="relative z-10 w-full max-w-[560px] mx-auto px-6 pt-12 pb-8 flex flex-col flex-1">
      <AppHeader />
      <div className="flex flex-col flex-1 items-center justify-center text-center fade-in">
        <h1 className="text-white font-extrabold text-[21px] leading-snug mb-3">{t('tooDayHappy')}</h1>
        <span className="text-[52px] my-3">{emoji}</span>
        <p className="text-white/80 text-[13px] mb-1">{t('alwaysCase')}</p>
        <p className="text-white/80 text-[13px] mb-6">{t('wantMoreInfo')}</p>
        <div className="flex gap-3">
          <button onClick={() => navigate('/journal', { state: { level, emoji } })}
            className="px-6 py-2.5 rounded-full text-white font-bold text-[14px] bg-white/25 border-2 border-white/65 active:scale-[1.03] transition-transform">
            {t('yes')}
          </button>
          <button onClick={() => navigate('/thanks', { state: { level, emoji, commentaire: '' } })}
            className="px-6 py-2.5 rounded-full text-white font-bold text-[14px] bg-white/25 border-2 border-white/65 active:scale-[1.03] transition-transform">
            {t('no')}
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}
