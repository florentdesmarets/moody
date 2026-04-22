import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import BgBlobs from '../components/BgBlobs'
import { useLang } from '../context/LangContext'

const HOURS = [0,1,2,3,4,5,6,7,8,9,10,11,12]

export default function Sleep() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t }    = useLang()
  const state    = location.state ?? {}
  const [sommeil, setSommeil] = useState(null)

  function handleNext() {
    navigate('/food', { state: { ...state, sommeil } })
  }

  return (
    <div className="bg-app relative overflow-hidden flex flex-col min-h-[100dvh]">
      <BgBlobs />
      <div className="relative z-10 w-full max-w-[560px] mx-auto px-6 pt-12 pb-8 flex flex-col flex-1">
      <AppHeader />
      <div className="flex flex-col flex-1 items-center justify-center fade-in">
        <span className="text-[64px] mb-4">😴</span>
        <h1 className="text-white font-extrabold text-[21px] text-center mb-1">{t('sleepQuestion')}</h1>
        <p className="text-white/70 text-[13px] text-center mb-8">{t('sleepSub')}</p>

        <div className="flex gap-2 flex-wrap justify-center mb-10">
          {HOURS.map(h => (
            <button key={h} onClick={() => setSommeil(sommeil === h ? null : h)}
              className="w-14 h-14 rounded-2xl text-[15px] font-extrabold border-none cursor-pointer transition-all duration-200"
              style={{
                background: sommeil === h ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.22)',
                color:      sommeil === h ? '#FF8040' : 'white',
                transform:  sommeil === h ? 'scale(1.1)' : 'scale(1)',
              }}>
              {h}h
            </button>
          ))}
        </div>

        <button onClick={handleNext}
          className="px-8 py-3 rounded-full text-white font-bold text-[14px] bg-white/25 border-2 border-white/65 active:scale-[1.03] transition-transform">
          {sommeil !== null ? t('continueBtn') : t('skipBtn')}
        </button>
      </div>
      </div>
    </div>
  )
}
