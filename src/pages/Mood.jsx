import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import BgBlobs from '../components/BgBlobs'
import EmojiPicker from '../components/EmojiPicker'
import { useLang } from '../context/LangContext'

export default function Mood() {
  const navigate = useNavigate()
  const { t }    = useLang()
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [feedback,      setFeedback]      = useState(null)

  function handleSelect(level, emoji) {
    setSelectedLevel(level)
    if (level >= 6) {
      setFeedback({ msg: t('moodHappy'), btn: t('continueBtn'), action: () => navigate('/mood-positive', { state: { level, emoji } }) })
    } else if (level >= 4) {
      setFeedback({ msg: t('moodOk'),    btn: t('moreTellBtn'), action: () => navigate('/journal',       { state: { level, emoji } }) })
    } else {
      setFeedback({ msg: t('moodSad'),   btn: t('confideBtn'),  action: () => navigate('/journal',       { state: { level, emoji } }) })
    }
  }

  return (
    <div className="bg-app relative overflow-hidden flex flex-col min-h-[100dvh]">
      <BgBlobs />
      <div className="relative z-10 w-full max-w-[560px] mx-auto px-6 pt-12 pb-8 flex flex-col flex-1">
      <AppHeader />
      <div className="flex flex-col flex-1">
        <h1 className="text-white font-extrabold text-[21px] text-center leading-snug">
          {t('moodQuestion').split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
        </h1>
        <EmojiPicker selected={selectedLevel} onSelect={handleSelect} />
        <div className="flex-1 flex items-center justify-center mt-2 min-h-[90px]">
          {feedback ? (
            <div className="text-center fade-in">
              <p className="text-white font-bold text-[14px] mb-3">{feedback.msg}</p>
              <button onClick={feedback.action}
                className="px-6 py-2.5 rounded-full text-white font-bold text-[14px] bg-white/25 border-2 border-white/65 active:scale-[1.03] transition-transform">
                {feedback.btn}
              </button>
            </div>
          ) : (
            <p className="text-white/60 text-[13px]">{t('moodHint')}</p>
          )}
        </div>
        <div className="bg-white/15 rounded-2xl px-4 py-3 mt-2">
          <p className="text-white/90 text-[12px] italic text-center">
            "{t('dailyQuotes')[new Date().getDay()]}"
          </p>
        </div>
      </div>
      </div>
    </div>
  )
}
