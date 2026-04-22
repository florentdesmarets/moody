import { useState, useEffect, useCallback } from 'react'
import AppHeader from '../components/AppHeader'
import BgBlobs from '../components/BgBlobs'
import CalendarGrid from '../components/CalendarGrid'
import MoodModal from '../components/MoodModal'
import { useLang } from '../context/LangContext'
import { useMoods } from '../hooks/useMoods'

export default function Calendar() {
  const { t }                    = useLang()
  const { fetchMonth, saveMood } = useMoods()
  const today = new Date()
  const [year,      setYear]      = useState(today.getFullYear())
  const [month,     setMonth]     = useState(today.getMonth())
  const [moodsMap,  setMoodsMap]  = useState({})
  const [showYears, setShowYears] = useState(false)
  const [yearStart, setYearStart] = useState(today.getFullYear() - 4)
  const [editDay,   setEditDay]   = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const load = useCallback(async () => {
    const data = await fetchMonth(year, month)
    setMoodsMap(data)
  }, [year, month, fetchMonth])

  useEffect(() => { load() }, [load])

  function prev() { if (month === 0) { setMonth(11); setYear(y => y-1) } else setMonth(m => m-1) }
  function next() { if (month === 11) { setMonth(0); setYear(y => y+1) } else setMonth(m => m+1) }

  function handleDayClick(d, dateStr, mood) { setEditDay({ d, dateStr, mood }); setModalOpen(true) }

  async function handleSave({ niveau, emoji, commentaire, sommeil, nourriture, fatigue }) {
    await saveMood({ date: editDay.dateStr, niveau, emoji, commentaire, sommeil, nourriture, fatigue })
    setModalOpen(false)
    const fresh = await fetchMonth(year, month)
    setMoodsMap(fresh)
    setEditDay(prev => ({ ...prev, mood: fresh[prev.dateStr] ?? null }))
  }

  const months   = t('months')
  const foodOpts = t('foodOptions')
  const fatOpts  = t('fatigueOptions')
  const dayLabel = editDay ? `${months[month]} ${editDay.d} ${year}` : ''

  function getFoodLabel(v) { return foodOpts.find(o => o.value === v) }
  function getFatLabel(v)  { return fatOpts.find(o => o.value === v) }

  return (
    <div className="bg-app relative overflow-hidden flex flex-col min-h-[100dvh]">
      <BgBlobs />
      <div className="relative z-10 w-full max-w-[560px] mx-auto px-6 pt-12 pb-8 flex flex-col flex-1">
      <AppHeader />
      <div className="flex flex-col flex-1 fade-in">
        <h1 className="text-white font-extrabold text-[18px] text-center mb-3">{t('calendarTitle')}</h1>
        <div className="flex items-center justify-between mb-3">
          <button onClick={prev} className="text-white text-[20px] px-3 py-1 rounded-lg bg-transparent border-none active:bg-white/20">‹</button>
          <button onClick={() => setShowYears(v => !v)} className="text-white font-extrabold text-[14px] px-3 py-1 rounded-lg bg-transparent border-none active:bg-white/15">
            {months[month]} {year}
          </button>
          <button onClick={next} className="text-white text-[20px] px-3 py-1 rounded-lg bg-transparent border-none active:bg-white/20">›</button>
        </div>
        {showYears && (
          <div className="mb-3 fade-in">
            <div className="flex justify-between items-center mb-2">
              <button onClick={() => setYearStart(y => y-9)} className="text-white text-[18px] px-3 bg-transparent border-none">‹</button>
              <span className="text-white text-[12px] font-bold">{yearStart} – {yearStart+8}</span>
              <button onClick={() => setYearStart(y => y+9)} className="text-white text-[18px] px-3 bg-transparent border-none">›</button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {Array.from({ length: 9 }, (_, i) => yearStart+i).map(y => (
                <button key={y} onClick={() => { setYear(y); setShowYears(false) }}
                  className={`py-2 rounded-xl text-[12px] font-bold border-none transition-all ${y === year ? 'bg-white text-[#1a1a1a]' : 'bg-white/18 text-white active:bg-white/32'}`}>
                  {y}
                </button>
              ))}
            </div>
            <p onClick={() => setShowYears(false)} className="text-white/60 text-[11px] text-center mt-2 cursor-pointer">{t('close')}</p>
          </div>
        )}
        {!showYears && (
          <>
            <CalendarGrid year={year} month={month} moodsMap={moodsMap} onDayClick={handleDayClick} />
            <div className="flex items-center gap-2 justify-center mt-2 mb-3">
              <span className="text-[10px] text-white/70">😭</span>
              <div className="h-2 w-32 rounded-full" style={{ background: 'linear-gradient(to right, #FF4F4F, #FFD07A, #3DBF7F)' }} />
              <span className="text-[10px] text-white/70">😄</span>
            </div>
            {editDay && (
              <div className="bg-white/95 rounded-2xl p-4 mt-1 fade-in">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[13px] font-bold text-[#FF7040]">{months[month]} {editDay.d}</span>
                  <button onClick={() => setModalOpen(true)} className="text-[12px] text-[#FF8040] font-bold bg-transparent border-none cursor-pointer">
                    {editDay.mood ? t('editEntry') : t('addEntry')}
                  </button>
                </div>
                {editDay.mood ? (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[20px]">{editDay.mood.emoji}</span>
                      <span className="text-[12px] text-[#666]">{editDay.mood.commentaire || <em className="text-[#bbb]">{t('noComment')}</em>}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                      {editDay.mood.sommeil != null && (
                        <span className="text-[11px] text-[#aaa]">😴 {editDay.mood.sommeil}h</span>
                      )}
                      {editDay.mood.nourriture != null && (() => { const f = getFoodLabel(editDay.mood.nourriture); return f ? <span className="text-[11px] text-[#aaa]">{f.emoji} {f.label}</span> : null })()}
                      {editDay.mood.fatigue != null && (() => { const f = getFatLabel(editDay.mood.fatigue); return f ? <span className="text-[11px] text-[#aaa]">{f.emoji} {f.label}</span> : null })()}
                    </div>
                  </div>
                ) : (
                  <p className="text-[12px] text-[#bbb] italic">{months[month]} {editDay.d} — {t('notLogged')}</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <MoodModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        dayLabel={dayLabel}
        initialMood={editDay?.mood?.niveau}
        initialComment={editDay?.mood?.commentaire}
        initialSommeil={editDay?.mood?.sommeil}
        initialNourriture={editDay?.mood?.nourriture}
        initialFatigue={editDay?.mood?.fatigue}
      />
      </div>
    </div>
  )
}
