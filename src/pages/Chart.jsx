import { useState, useEffect, useCallback } from 'react'
import AppHeader from '../components/AppHeader'
import BgBlobs from '../components/BgBlobs'
import ChartLine        from '../components/ChartLine'
import ChartCorrelation from '../components/ChartCorrelation'
import ChartTags        from '../components/ChartTags'
import { useLang } from '../context/LangContext'
import { useMoods } from '../hooks/useMoods'

export default function Chart() {
  const { t }                      = useLang()
  const { fetchMonth }             = useMoods()
  const today = new Date()
  const [year,     setYear]     = useState(today.getFullYear())
  const [month,    setMonth]    = useState(today.getMonth())
  const [moodsMap, setMoodsMap] = useState({})

  const load = useCallback(async () => {
    const data = await fetchMonth(year, month); setMoodsMap(data)
  }, [year, month, fetchMonth])

  useEffect(() => { load() }, [load])

  function prev() { if (month===0){setMonth(11);setYear(y=>y-1)} else setMonth(m=>m-1) }
  function next() { if (month===11){setMonth(0);setYear(y=>y+1)} else setMonth(m=>m+1) }

  const vals = Object.values(moodsMap).map(m => m.niveau)
  let insight = t('noData')
  if (vals.length >= 2) {
    const avg  = vals.reduce((a,b)=>a+b,0)/vals.length
    const diff = vals[vals.length-1] - vals[0]
    if      (avg >= 5.5) insight = t('trendHigh')
    else if (avg >= 4)   insight = t('trendMid')
    else if (avg >= 2.5) insight = t('trendLow')
    else                 insight = t('trendHard')
    if      (diff > 2)   insight += ' ' + t('trendUp')
    else if (diff < -2)  insight += ' ' + t('trendDown')
  }

  // Entrées du mois sous forme de tableau pour ChartTags
  const monthEntries = Object.values(moodsMap)

  return (
    <div className="bg-app relative overflow-hidden flex flex-col px-6 pt-12 pb-8 min-h-[100dvh]">
      <BgBlobs />
      <AppHeader />
      <div className="relative z-10 fade-in">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-white font-extrabold text-[18px]">{t('chartTitle')}</h1>
          <div className="flex gap-1">
            <button onClick={prev} className="text-white text-[15px] px-2 py-1 rounded-lg bg-transparent border-none active:bg-white/20">‹</button>
            <button onClick={next} className="text-white text-[15px] px-2 py-1 rounded-lg bg-transparent border-none active:bg-white/20">›</button>
          </div>
        </div>
        <p className="text-white/80 text-[12px] text-center mb-3">{t('months')[month]} {year}</p>
        <div className="bg-white/12 rounded-2xl p-4">
          {vals.length >= 2
            ? <ChartLine year={year} month={month} moodsMap={moodsMap} />
            : <p className="text-white/60 text-[12px] text-center py-6">{t('noData')}</p>
          }
        </div>
        <div className="bg-white/14 rounded-2xl p-3 mt-3">
          <p className="text-white text-[12px]">{insight}</p>
        </div>
        <ChartCorrelation year={year} month={month} moodsMap={moodsMap} t={t} />
        <ChartTags monthEntries={monthEntries} t={t} month={month} year={year} />
      </div>
    </div>
  )
}
