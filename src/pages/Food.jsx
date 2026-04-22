import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import BgBlobs from '../components/BgBlobs'
import { useLang } from '../context/LangContext'

export default function Food() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { t }     = useLang()
  const state     = location.state ?? {}
  const [food, setFood] = useState(null)

  function handleNext() {
    navigate('/fatigue', { state: { ...state, nourriture: food } })
  }

  const options = t('foodOptions') // [{value, label, emoji}]

  return (
    <div className="bg-app relative overflow-hidden flex flex-col min-h-[100dvh]">
      <BgBlobs />
      <div className="relative z-10 w-full max-w-[560px] mx-auto px-6 pt-12 pb-8 flex flex-col flex-1">
      <AppHeader />
      <div className="flex flex-col flex-1 items-center justify-center fade-in">
        <span className="text-[64px] mb-4">🍽️</span>
        <h1 className="text-white font-extrabold text-[21px] text-center mb-1">{t('foodQuestion')}</h1>
        <p className="text-white/70 text-[13px] text-center mb-8">{t('foodSub')}</p>

        <div className="flex flex-col gap-3 w-full max-w-[300px] mb-10">
          {options.map(opt => (
            <button key={opt.value} onClick={() => setFood(food === opt.value ? null : opt.value)}
              className="w-full py-4 rounded-2xl text-[16px] font-bold border-2 cursor-pointer transition-all duration-200"
              style={{
                background: food === opt.value ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.22)',
                color:      food === opt.value ? '#FF8040' : 'white',
                borderColor: food === opt.value ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
                transform:  food === opt.value ? 'scale(1.04)' : 'scale(1)',
              }}>
              {opt.emoji} {opt.label}
            </button>
          ))}
        </div>

        <button onClick={handleNext}
          className="px-8 py-3 rounded-full text-white font-bold text-[14px] bg-white/25 border-2 border-white/65 active:scale-[1.03] transition-transform">
          {food !== null ? t('continueBtn') : t('skipBtn')}
        </button>
      </div>
      </div>
    </div>
  )
}
