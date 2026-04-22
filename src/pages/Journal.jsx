import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import BgBlobs from '../components/BgBlobs'
import { useLang } from '../context/LangContext'

export default function Journal() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t }    = useLang()
  const { level, emoji } = location.state ?? { level: 4, emoji: '😐' }
  const [text, setText]       = useState('')
  const [selected, setSelected] = useState([])

  return (
    <div className="bg-app relative overflow-hidden flex flex-col min-h-[100dvh]">
      <BgBlobs />
      <div className="relative z-10 w-full max-w-[560px] mx-auto px-6 pt-12 pb-8">
      <AppHeader />
      <div className="fade-in">
        <h1 className="text-white font-extrabold text-[21px] text-center mb-2">{t('listeningTitle')}</h1>
        <p className="text-[36px] text-center mb-3">{emoji}</p>
        <div className="flex items-center gap-2 mt-3">
          <button onClick={() => navigate('/mood')} className="text-white/70 text-[18px] bg-transparent border-none">✕</button>
          <input
            className="flex-1 bg-white/90 rounded-full px-4 py-2.5 text-[13px] text-[#555] outline-none border-none focus:bg-white"
            type="text" placeholder={t('journalPH')} value={text} onChange={e => setText(e.target.value)}
          />
          <button onClick={() => navigate('/sleep', { state: { level, emoji, commentaire: text } })} className="text-white/90 text-[18px] bg-transparent border-none">➤</button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {t('tags').map((tag, i) => {
            const on = selected.includes(i)
            return (
              <button key={i}
                onClick={() => {
                  const next = on ? selected.filter(x => x !== i) : [...selected, i]
                  setSelected(next)
                  setText(next.map(x => t('tags')[x]).join(', '))
                }}
                className="text-[11px] font-semibold rounded-full px-3 py-1 border transition-colors"
                style={{
                  background: on ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.22)',
                  color: on ? '#FF7040' : 'white',
                  borderColor: on ? 'white' : 'rgba(255,255,255,0.35)',
                }}>
                {tag}
              </button>
            )
          })}
        </div>
      </div>
      </div>
    </div>
  )
}
