import { useLang } from '../context/LangContext'

const MOOD_COLORS = [
  null,
  '#FF4F4F', // 1 😭
  '#FF7A4F', // 2 😔
  '#FFA54F', // 3 😕
  '#FFD07A', // 4 😐
  '#BFDD6A', // 5 🙂
  '#7DCE72', // 6 😊
  '#3DBF7F', // 7 😄
]

function moodColor(niveau) {
  if (!niveau) return null
  return MOOD_COLORS[niveau] ?? null
}

function daysInMonth(year, month)  { return new Date(year, month + 1, 0).getDate() }
function firstDayOfMonth(year, month) { const d = new Date(year, month, 1).getDay(); return d === 0 ? 6 : d - 1 }

export default function CalendarGrid({ year, month, moodsMap, onDayClick }) {
  const { t }  = useLang()
  const total  = daysInMonth(year, month)
  const offset = firstDayOfMonth(year, month)
  const today  = new Date()
  const days   = t('days')
  const pad    = (n) => String(n).padStart(2, '0')
  const cells  = []

  // Normalize today to midnight for accurate comparison
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  for (let i = 0; i < offset; i++) cells.push(<div key={`e${i}`} />)

  for (let d = 1; d <= total; d++) {
    const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`
    const mood    = moodsMap[dateStr]
    const cellDate = new Date(year, month, d)
    const isToday  = cellDate.getTime() === todayMidnight.getTime()
    const isFuture = cellDate > todayMidnight

    cells.push(
      isFuture ? (
        // Future days: non-interactive, greyed out
        <div
          key={d}
          className="aspect-square rounded-lg text-[10px] font-bold flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)' }}
        >
          {d}
        </div>
      ) : (
        <button
          key={d}
          onClick={() => onDayClick(d, dateStr, mood)}
          style={{
            background: moodColor(mood?.niveau) ?? 'rgba(255,255,255,0.15)',
            boxShadow: '0 0 0 1.5px rgba(255,255,255,0.18)',
          }}
          className={`aspect-square rounded-lg text-[10px] font-bold flex items-center justify-center text-white cursor-pointer transition-all duration-150 active:scale-110 border-none ${isToday ? 'outline outline-2 outline-white' : ''}`}
        >
          {d}
        </button>
      )
    )
  }

  return (
    <div>
      <div className="grid grid-cols-7 gap-[3px] mb-[3px]">
        {days.map((day, i) => <div key={i} className="text-[9px] font-bold text-white/60 text-center py-0.5">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-[3px]">{cells}</div>
    </div>
  )
}
