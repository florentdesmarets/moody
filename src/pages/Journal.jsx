import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import BgBlobs from '../components/BgBlobs'
import { useLang } from '../context/LangContext'
import { useAuth } from '../context/AuthContext'

export default function Journal() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t, lang }                  = useLang()
  const { profile, updateProfile }   = useAuth()
  const { level, emoji } = location.state ?? { level: 4, emoji: '😐' }

  const [selectedTags, setSelectedTags] = useState([])
  const [text,         setText]         = useState('')
  const [addingTag,    setAddingTag]    = useState(false)
  const [newTagName,   setNewTagName]   = useState('')

  // Tags personnalisés stockés dans le profil
  const customTags = (() => {
    try { return JSON.parse(profile?.custom_tags ?? '[]') } catch { return [] }
  })()

  function toggleTag(tagName) {
    const next = selectedTags.includes(tagName)
      ? selectedTags.filter(n => n !== tagName)
      : [...selectedTags, tagName]
    setSelectedTags(next)
    setText(next.join(', '))
  }

  async function addCustomTag() {
    const name = newTagName.trim()
    if (!name) return
    // Évite les doublons avec les tags existants
    const allExisting = [...t('tags'), ...customTags].map(s => s.toLowerCase())
    if (allExisting.includes(name.toLowerCase())) { setNewTagName(''); setAddingTag(false); return }
    const newList = [...customTags, name]
    await updateProfile({ custom_tags: JSON.stringify(newList) })
    setNewTagName('')
    setAddingTag(false)
    // Sélectionne automatiquement le nouveau tag
    const next = [...selectedTags, name]
    setSelectedTags(next)
    setText(next.join(', '))
  }

  async function removeCustomTag(tagName, e) {
    e.stopPropagation()
    const newList = customTags.filter(t => t !== tagName)
    await updateProfile({ custom_tags: JSON.stringify(newList) })
    if (selectedTags.includes(tagName)) {
      const next = selectedTags.filter(n => n !== tagName)
      setSelectedTags(next)
      setText(next.join(', '))
    }
  }

  return (
    <div className="bg-app relative overflow-hidden flex flex-col min-h-[100dvh]">
      <BgBlobs />
      <div className="relative z-10 w-full max-w-[560px] mx-auto px-6 pt-12 pb-10 overflow-y-auto no-scrollbar">
        <AppHeader />
        <div className="fade-in">
          <h1 className="text-white font-extrabold text-[21px] text-center mb-2">{t('listeningTitle')}</h1>
          <p className="text-[36px] text-center mb-3">{emoji}</p>

          {/* Champ texte libre */}
          <div className="flex items-center gap-2 mt-3">
            <button onClick={() => navigate('/mood')}
              className="text-white/70 text-[18px] bg-transparent border-none cursor-pointer">✕</button>
            <input
              className="flex-1 bg-white/90 rounded-full px-4 py-2.5 text-[13px] text-[#555] outline-none border-none focus:bg-white"
              type="text"
              placeholder={t('journalPH')}
              value={text}
              onChange={e => setText(e.target.value)}
            />
            <button onClick={() => navigate('/sleep', { state: { level, emoji, commentaire: text } })}
              className="text-white/90 text-[18px] bg-transparent border-none cursor-pointer">➤</button>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">

            {/* Tags prédéfinis */}
            {t('tags').map((tag, i) => {
              const on = selectedTags.includes(tag)
              return (
                <button key={i} onClick={() => toggleTag(tag)}
                  className="text-[11px] font-semibold rounded-full px-3 py-1 border transition-all"
                  style={{
                    background:  on ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.22)',
                    color:       on ? '#FF7040' : 'white',
                    borderColor: on ? 'white'   : 'rgba(255,255,255,0.35)',
                  }}>
                  {tag}
                </button>
              )
            })}

            {/* Tags personnalisés */}
            {customTags.map((tag, i) => {
              const on = selectedTags.includes(tag)
              return (
                <button key={`c${i}`} onClick={() => toggleTag(tag)}
                  className="text-[11px] font-semibold rounded-full pl-2.5 pr-1.5 py-1 border transition-all flex items-center gap-1"
                  style={{
                    background:  on ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.28)',
                    color:       on ? '#FF7040' : 'white',
                    borderColor: on ? 'white'   : 'rgba(255,255,255,0.55)',
                    borderStyle: 'solid',
                  }}>
                  <span className="text-[9px] opacity-70">✦</span> {tag}
                  <span
                    onClick={e => removeCustomTag(tag, e)}
                    className="ml-0.5 text-[11px] opacity-50 hover:opacity-100 leading-none cursor-pointer">
                    ×
                  </span>
                </button>
              )
            })}

            {/* Ajout tag perso */}
            {addingTag ? (
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  className="bg-white/90 rounded-full px-3 py-1 text-[11px] text-[#555] outline-none border-none w-28"
                  placeholder={lang === 'fr' ? 'Nom du tag…' : 'Tag name…'}
                  value={newTagName}
                  maxLength={22}
                  onChange={e => setNewTagName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') addCustomTag()
                    if (e.key === 'Escape') { setAddingTag(false); setNewTagName('') }
                  }}
                />
                <button onClick={addCustomTag}
                  className="text-white text-[13px] bg-white/30 rounded-full w-6 h-6 flex items-center justify-center border-none cursor-pointer leading-none">
                  ✓
                </button>
                <button onClick={() => { setAddingTag(false); setNewTagName('') }}
                  className="text-white/60 text-[13px] bg-transparent border-none cursor-pointer leading-none">
                  ✕
                </button>
              </div>
            ) : (
              <button onClick={() => setAddingTag(true)}
                className="text-[11px] font-semibold rounded-full px-3 py-1 transition-all cursor-pointer"
                style={{
                  background:  'rgba(255,255,255,0.10)',
                  color:       'rgba(255,255,255,0.65)',
                  border:      '1.5px dashed rgba(255,255,255,0.35)',
                }}>
                + {lang === 'fr' ? 'Tag perso' : 'Custom tag'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
