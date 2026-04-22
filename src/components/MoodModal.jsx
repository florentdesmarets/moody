import { useState, useEffect } from 'react'
import { useLang } from '../context/LangContext'

const EMOJIS = ['😭', '😔', '😕', '😐', '🙂', '😊', '😄']
const SLEEP_HOURS = [0,1,2,3,4,5,6,7,8,9,10,11,12]

export default function MoodModal({ open, onClose, onSave, dayLabel, initialMood, initialComment, initialSommeil, initialNourriture, initialFatigue }) {
  const { t } = useLang()
  const [selectedLevel,  setSelectedLevel]  = useState(null)
  const [selectedEmoji,  setSelectedEmoji]  = useState(null)
  const [comment,        setComment]        = useState('')
  const [sommeil,        setSommeil]        = useState(null)
  const [nourriture,     setNourriture]     = useState(null)
  const [fatigue,        setFatigue]        = useState(null)

  useEffect(() => {
    if (open) {
      setSelectedLevel(initialMood ?? null)
      setSelectedEmoji(initialMood ? EMOJIS[initialMood - 1] : null)
      setComment(initialComment ?? '')
      setSommeil(initialSommeil ?? null)
      setNourriture(initialNourriture ?? null)
      setFatigue(initialFatigue ?? null)
    }
  }, [open, initialMood, initialComment, initialSommeil, initialNourriture, initialFatigue])

  function handleSave() {
    if (!selectedLevel) return
    onSave({ niveau: selectedLevel, emoji: selectedEmoji, commentaire: comment, sommeil: sommeil ?? null, nourriture: nourriture ?? null, fatigue: fatigue ?? null })
  }

  const foodOptions    = t('foodOptions')
  const fatigueOptions = t('fatigueOptions')

  return (
    <>
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${open ? 'bg-[rgba(180,60,10,0.6)] pointer-events-auto' : 'bg-transparent pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 max-w-[430px] mx-auto rounded-t-3xl transition-transform duration-300 ${open ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ background: 'linear-gradient(150deg, #FFD07A, #FF8C5A)' }}
      >
        <div className="px-4 pt-4 pb-6">
          <p className="text-white text-[14px] font-extrabold text-center mb-2.5">{dayLabel}</p>

          {/* Emoji mood picker */}
          <div className="flex justify-around mb-2.5 px-1">
            {EMOJIS.map((emoji, i) => (
              <button
                key={i}
                onClick={() => { setSelectedLevel(i + 1); setSelectedEmoji(emoji) }}
                className="text-[24px] rounded-full border-none bg-transparent cursor-pointer transition-all duration-200 leading-none flex items-center justify-center"
                style={{
                  width: '34px',
                  height: '34px',
                  background: selectedLevel === i + 1 ? 'rgba(255,255,255,0.38)' : 'transparent',
                  boxShadow: selectedLevel === i + 1 ? '0 0 0 3px rgba(255,255,255,0.5)' : 'none',
                }}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Sleep — ligne scrollable unique */}
          <div className="bg-white/20 rounded-2xl px-3 py-2.5 mb-1.5">
            <p className="text-white text-[12px] font-bold mb-1.5">😴 {t('sleepQuestion')}</p>
            <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
              {SLEEP_HOURS.map(h => (
                <button key={h} onClick={() => setSommeil(sommeil === h ? null : h)}
                  className="shrink-0 py-1 px-2 rounded-full text-[11px] font-bold border-none cursor-pointer transition-all"
                  style={{
                    background: sommeil === h ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)',
                    color: sommeil === h ? '#FF8040' : 'white',
                  }}>
                  {h}h
                </button>
              ))}
            </div>
          </div>

          {/* Food + Fatigue — section unique compacte */}
          <div className="bg-white/20 rounded-2xl px-3 py-2.5 mb-1.5 flex flex-col gap-2">
            {/* Food */}
            <div>
              <p className="text-white text-[12px] font-bold mb-1.5">🍽️ {t('foodQuestion')}</p>
              <div className="flex gap-1.5">
                {foodOptions.map(opt => (
                  <button key={opt.value} onClick={() => setNourriture(nourriture === opt.value ? null : opt.value)}
                    className="flex-1 py-1.5 rounded-xl text-[10px] font-bold border-none cursor-pointer transition-all text-center leading-tight"
                    style={{
                      background: nourriture === opt.value ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)',
                      color: nourriture === opt.value ? '#FF8040' : 'white',
                    }}>
                    <span className="block text-[16px] leading-none mb-0.5">{opt.emoji}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Séparateur */}
            <div className="border-t border-white/20" />

            {/* Fatigue */}
            <div>
              <p className="text-white text-[12px] font-bold mb-1.5">⚡ {t('fatigueQuestion')}</p>
              <div className="flex gap-1.5">
                {fatigueOptions.map(opt => (
                  <button key={opt.value} onClick={() => setFatigue(fatigue === opt.value ? null : opt.value)}
                    className="flex-1 py-1.5 rounded-xl text-[10px] font-bold border-none cursor-pointer transition-all text-center leading-tight"
                    style={{
                      background: fatigue === opt.value ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)',
                      color: fatigue === opt.value ? '#FF8040' : 'white',
                    }}>
                    <span className="block text-[16px] leading-none mb-0.5">{opt.emoji}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Comment */}
          <textarea
            className="w-full rounded-2xl px-3 py-2 text-[12px] text-[#555] outline-none resize-none mb-2.5 border-none"
            style={{ background: 'rgba(255,255,255,0.92)', height: '52px' }}
            placeholder={t('addComment')}
            value={comment}
            onChange={e => setComment(e.target.value)}
          />

          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-full text-[13px] font-bold text-white border border-white/50 bg-white/20 active:scale-[0.97] transition-transform">
              {t('cancel')}
            </button>
            <button onClick={handleSave} className="flex-1 py-2.5 rounded-full text-[13px] font-bold text-[#FF7040] bg-white border-none active:scale-[0.97] transition-transform">
              {t('save')}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
