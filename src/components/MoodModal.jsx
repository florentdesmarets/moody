import { useState, useEffect } from 'react'
import { useLang } from '../context/LangContext'
import { translations } from '../context/LangContext'

const EMOJIS     = ['😭', '😔', '😕', '😐', '🙂', '😊', '😄']
const SLEEP_HOURS = [0,1,2,3,4,5,6,7,8,9,10,11,12]
const tagsFR = translations.fr.tags
const tagsEN = translations.en.tags

// Détecte les tags sélectionnés et le texte libre depuis le commentaire sauvegardé
function parseComment(commentaire) {
  if (!commentaire) return { tagIdxs: [], freeText: '' }
  const parts = commentaire.split(/,\s*/).map(p => p.trim()).filter(Boolean)
  const tagIdxs  = []
  const textParts = []
  parts.forEach(part => {
    const idxFR = tagsFR.indexOf(part)
    const idxEN = tagsEN.indexOf(part)
    if      (idxFR >= 0) tagIdxs.push(idxFR)
    else if (idxEN >= 0) tagIdxs.push(idxEN)
    else                  textParts.push(part)
  })
  return { tagIdxs, freeText: textParts.join(', ') }
}

export default function MoodModal({ open, onClose, onSave, dayLabel, initialMood, initialComment, initialSommeil, initialNourriture, initialFatigue }) {
  const { t } = useLang()
  const [selectedLevel,  setSelectedLevel]  = useState(null)
  const [selectedEmoji,  setSelectedEmoji]  = useState(null)
  const [selectedTags,   setSelectedTags]   = useState([])
  const [freeText,       setFreeText]       = useState('')
  const [sommeil,        setSommeil]        = useState(null)
  const [nourriture,     setNourriture]     = useState(null)
  const [fatigue,        setFatigue]        = useState(null)

  useEffect(() => {
    if (open) {
      setSelectedLevel(initialMood ?? null)
      setSelectedEmoji(initialMood ? EMOJIS[initialMood - 1] : null)
      setSommeil(initialSommeil ?? null)
      setNourriture(initialNourriture ?? null)
      setFatigue(initialFatigue ?? null)
      const { tagIdxs, freeText: ft } = parseComment(initialComment)
      setSelectedTags(tagIdxs)
      setFreeText(ft)
    }
  }, [open, initialMood, initialComment, initialSommeil, initialNourriture, initialFatigue])

  function toggleTag(idx) {
    setSelectedTags(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    )
  }

  function handleSave() {
    if (!selectedLevel) return
    const tagStr = selectedTags.map(i => t('tags')[i]).join(', ')
    const commentaire = [tagStr, freeText.trim()].filter(Boolean).join(', ')
    onSave({ niveau: selectedLevel, emoji: selectedEmoji, commentaire, sommeil: sommeil ?? null, nourriture: nourriture ?? null, fatigue: fatigue ?? null })
  }

  const foodOptions    = t('foodOptions')
  const fatigueOptions = t('fatigueOptions')
  const tags           = t('tags')

  return (
    <>
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${open ? 'bg-black/50 pointer-events-auto' : 'bg-transparent pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 max-w-[430px] mx-auto rounded-t-3xl transition-transform duration-300 ${open ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ background: 'var(--bg-gradient)' }}
      >
        {/* Poignée */}
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/30" />
        </div>

        <div className="overflow-y-auto px-4 pt-2 pb-6" style={{ maxHeight: '88dvh', scrollbarWidth: 'none' }}>
          <p className="text-white text-[14px] font-extrabold text-center mb-2.5">{dayLabel}</p>

          {/* Emoji mood picker */}
          <div className="flex justify-around mb-2.5 px-1">
            {EMOJIS.map((emoji, i) => (
              <button key={i}
                onClick={() => { setSelectedLevel(i + 1); setSelectedEmoji(emoji) }}
                className="text-[24px] rounded-full border-none bg-transparent cursor-pointer transition-all duration-200 leading-none flex items-center justify-center"
                style={{
                  width: '34px', height: '34px',
                  background: selectedLevel === i + 1 ? 'rgba(255,255,255,0.38)' : 'transparent',
                  boxShadow:  selectedLevel === i + 1 ? '0 0 0 3px rgba(255,255,255,0.5)' : 'none',
                }}>
                {emoji}
              </button>
            ))}
          </div>

          {/* Sleep — ligne scrollable */}
          <div className="bg-white/20 rounded-2xl px-3 py-2.5 mb-1.5">
            <p className="text-white text-[12px] font-bold mb-1.5">😴 {t('sleepQuestion')}</p>
            <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
              {SLEEP_HOURS.map(h => (
                <button key={h} onClick={() => setSommeil(sommeil === h ? null : h)}
                  className="shrink-0 py-1 px-2 rounded-full text-[11px] font-bold border-none cursor-pointer transition-all"
                  style={{
                    background: sommeil === h ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)',
                    color:      sommeil === h ? '#FF8040' : 'white',
                  }}>
                  {h}h
                </button>
              ))}
            </div>
          </div>

          {/* Food + Fatigue */}
          <div className="bg-white/20 rounded-2xl px-3 py-2.5 mb-1.5 flex flex-col gap-2">
            <div>
              <p className="text-white text-[12px] font-bold mb-1.5">🍽️ {t('foodQuestion')}</p>
              <div className="flex gap-1.5">
                {foodOptions.map(opt => (
                  <button key={opt.value} onClick={() => setNourriture(nourriture === opt.value ? null : opt.value)}
                    className="flex-1 py-1.5 rounded-xl text-[10px] font-bold border-none cursor-pointer transition-all text-center leading-tight"
                    style={{
                      background: nourriture === opt.value ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)',
                      color:      nourriture === opt.value ? '#FF8040' : 'white',
                    }}>
                    <span className="block text-[16px] leading-none mb-0.5">{opt.emoji}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="border-t border-white/20" />
            <div>
              <p className="text-white text-[12px] font-bold mb-1.5">⚡ {t('fatigueQuestion')}</p>
              <div className="flex gap-1.5">
                {fatigueOptions.map(opt => (
                  <button key={opt.value} onClick={() => setFatigue(fatigue === opt.value ? null : opt.value)}
                    className="flex-1 py-1.5 rounded-xl text-[10px] font-bold border-none cursor-pointer transition-all text-center leading-tight"
                    style={{
                      background: fatigue === opt.value ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)',
                      color:      fatigue === opt.value ? '#FF8040' : 'white',
                    }}>
                    <span className="block text-[16px] leading-none mb-0.5">{opt.emoji}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tags / Activités */}
          <div className="bg-white/20 rounded-2xl px-3 py-2.5 mb-1.5">
            <p className="text-white text-[12px] font-bold mb-2">🏷️ {t('tagsLabel')}</p>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag, i) => {
                const on = selectedTags.includes(i)
                return (
                  <button key={i} onClick={() => toggleTag(i)}
                    className="text-[10px] font-semibold rounded-full px-2.5 py-1 border-none cursor-pointer transition-all"
                    style={{
                      background: on ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.22)',
                      color:      on ? '#FF7040' : 'white',
                    }}>
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Commentaire libre */}
          <textarea
            className="w-full rounded-2xl px-3 py-2 text-[12px] text-[#555] outline-none resize-none mb-2.5 border-none"
            style={{ background: 'rgba(255,255,255,0.92)', height: '48px' }}
            placeholder={t('addComment')}
            value={freeText}
            onChange={e => setFreeText(e.target.value)}
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
