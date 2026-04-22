import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import BgBlobs from '../components/BgBlobs'
import Confetti from '../components/Confetti'
import { useLang } from '../context/LangContext'
import { useMoods } from '../hooks/useMoods'

const MILESTONES = [3, 7, 14, 21, 30, 60, 90, 100, 180, 365]

export default function Thanks() {
  const navigate    = useNavigate()
  const location    = useLocation()
  const { t }       = useLang()
  const { saveMood, fetchGlobalStats } = useMoods()
  const { level, emoji, commentaire, sommeil, nourriture, fatigue } = location.state ?? {}

  const [confetti,  setConfetti]  = useState(false)
  const [milestone, setMilestone] = useState(null)

  useEffect(() => {
    if (!level) return
    const d = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const date = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`

    saveMood({ date, niveau: level, emoji, commentaire: commentaire ?? '', sommeil: sommeil ?? null, nourriture: nourriture ?? null, fatigue: fatigue ?? null })
      .then(() => fetchGlobalStats())
      .then(({ streak }) => {
        if (MILESTONES.includes(streak)) {
          setMilestone(streak)
          setConfetti(true)
        }
      })
  }, [])

  return (
    <div className="bg-app relative overflow-hidden flex flex-col min-h-[100dvh]">
      <BgBlobs />
      <Confetti active={confetti} />
      <div className="relative z-10 w-full max-w-[560px] mx-auto px-6 pt-12 pb-8 flex flex-col flex-1">
      <AppHeader />
      <div className="flex flex-col flex-1 items-center justify-center text-center fade-in">
        <h1 className="text-white font-extrabold text-[21px] mb-2">{t('thanksTitle')}</h1>

        {milestone ? (
          <>
            <span className="text-[72px] inline-block my-4" style={{ animation: 'popIn 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>
              🔥
            </span>
            <p className="text-white font-extrabold text-[22px] mb-1">{typeof t('streakMilestone') === 'function' ? t('streakMilestone')(milestone) : `${milestone} ${t('streakDays')}`}</p>
            <p className="text-white/80 text-[14px] mb-6">{t('streakMilestoneSub')}</p>
          </>
        ) : (
          <>
            <span className="text-[64px] heartbeat inline-block my-5">🩷</span>
            <p className="text-white/80 text-[13px] mb-6">{t('thanksSub')}</p>
          </>
        )}

        <button onClick={() => navigate('/calendar')}
          className="px-6 py-2.5 rounded-full text-white font-bold text-[14px] bg-white/25 border-2 border-white/65 active:scale-[1.03] transition-transform">
          {t('seeCalendar')}
        </button>
      </div>
      </div>
    </div>
  )
}
