function daysInMonth(year, month) { return new Date(year, month + 1, 0).getDate() }

function buildPath(pts) {
  if (pts.length < 2) return null
  let path = `M${pts[0].x},${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const c1x = pts[i-1].x + (pts[i].x - pts[i-1].x) / 3
    const c2x = pts[i].x   - (pts[i].x - pts[i-1].x) / 3
    path += ` C${c1x},${pts[i-1].y} ${c2x},${pts[i].y} ${pts[i].x},${pts[i].y}`
  }
  return path
}

export default function ChartCorrelation({ year, month, moodsMap, t }) {
  const days = daysInMonth(year, month)
  const W = 260, H = 120
  const CHART_H = 100   // hauteur utile des courbes
  const pad = (n) => String(n).padStart(2, '0')

  const moodPts    = []
  const sleepPts   = []
  const foodPts    = []
  const fatiguePts = []
  const paired     = []

  for (let d = 1; d <= days; d++) {
    const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`
    const mood = moodsMap[dateStr]
    const x = Math.round((d - 1) / (days - 1) * W)

    if (mood?.niveau) {
      moodPts.push({ x, y: Math.round(CHART_H - (mood.niveau - 1) / 6 * CHART_H) })
    }
    if (mood?.sommeil != null) {
      const normalized = Math.max(0, Math.min(1, mood.sommeil / 12))
      sleepPts.push({ x, y: Math.round(CHART_H - normalized * CHART_H) })
    }
    if (mood?.nourriture != null) {
      const normalized = (mood.nourriture - 1) / 2
      foodPts.push({ x, y: Math.round(CHART_H - normalized * CHART_H) })
    }
    if (mood?.fatigue != null) {
      const normalized = (mood.fatigue - 1) / 2
      fatiguePts.push({ x, y: Math.round(CHART_H - normalized * CHART_H) })
    }
    if (mood?.niveau && mood?.sommeil != null) {
      paired.push({ mood: mood.niveau, sleep: mood.sommeil, food: mood.nourriture, fatigue: mood.fatigue })
    }
  }

  const moodPath    = buildPath(moodPts)
  const sleepPath   = buildPath(sleepPts)
  const foodPath    = buildPath(foodPts)
  const fatiguePath = buildPath(fatiguePts)

  // Insight sommeil
  let sleepInsight = null
  if (paired.length >= 3) {
    const goodSleep = paired.filter(p => p.sleep >= 7)
    const badSleep  = paired.filter(p => p.sleep < 7)
    if (goodSleep.length > 0 && badSleep.length > 0) {
      const avgGood = goodSleep.reduce((a, b) => a + b.mood, 0) / goodSleep.length
      const avgBad  = badSleep.reduce((a,  b) => a + b.mood, 0) / badSleep.length
      const diff = avgGood - avgBad
      if      (diff > 0.5)  sleepInsight = { text: t('sleepCorrelationPos'),     color: '#C4A8FF' }
      else if (diff < -0.5) sleepInsight = { text: t('sleepCorrelationNeg'),     color: '#C4A8FF' }
      else                  sleepInsight = { text: t('sleepCorrelationNeutral'), color: '#C4A8FF' }
    }
  }

  // Insight nourriture
  let foodInsight = null
  const foodPaired = paired.filter(p => p.food != null)
  if (foodPaired.length >= 3) {
    const wellFed  = foodPaired.filter(p => p.food === 3)
    const poorFed  = foodPaired.filter(p => p.food <= 2)
    if (wellFed.length > 0 && poorFed.length > 0) {
      const avgWell = wellFed.reduce((a, b) => a + b.mood, 0) / wellFed.length
      const avgPoor = poorFed.reduce((a, b) => a + b.mood, 0) / poorFed.length
      const diff = avgWell - avgPoor
      if      (diff > 0.5)  foodInsight = { text: t('foodCorrelationPos'),     color: '#86efac' }
      else if (diff < -0.5) foodInsight = { text: t('foodCorrelationNeg'),     color: '#86efac' }
      else                  foodInsight = { text: t('foodCorrelationNeutral'), color: '#86efac' }
    }
  }

  // Insight fatigue
  let fatigueInsight = null
  const fatiguePaired = paired.filter(p => p.fatigue != null)
  if (fatiguePaired.length >= 3) {
    const notTired = fatiguePaired.filter(p => p.fatigue === 3)
    const tired    = fatiguePaired.filter(p => p.fatigue <= 2)
    if (notTired.length > 0 && tired.length > 0) {
      const avgFresh = notTired.reduce((a, b) => a + b.mood, 0) / notTired.length
      const avgTired = tired.reduce((a, b) => a + b.mood, 0) / tired.length
      const diff = avgFresh - avgTired
      if      (diff > 0.5)  fatigueInsight = { text: t('fatigueCorrelationPos'),     color: '#fde68a' }
      else if (diff < -0.5) fatigueInsight = { text: t('fatigueCorrelationNeg'),     color: '#fde68a' }
      else                  fatigueInsight = { text: t('fatigueCorrelationNeutral'), color: '#fde68a' }
    }
  }

  if (!moodPath && !sleepPath && !foodPath && !fatiguePath) return null

  const insights = [sleepInsight, foodInsight, fatigueInsight].filter(Boolean)

  // Grilles horizontales à 25%, 50%, 75%
  const gridLines = [0.25, 0.5, 0.75].map(p => Math.round(CHART_H * p))

  return (
    <div className="bg-white/12 rounded-2xl p-4 mt-3">
      <p className="text-white text-[12px] font-bold mb-3">{t('correlationChart')}</p>

      {/* Légende en 2 colonnes */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-3">
        <span className="flex items-center gap-1.5 text-[10px] text-white/80">
          <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" strokeLinecap="round"/></svg>
          {t('moodLabel')}
        </span>
        {sleepPath && (
          <span className="flex items-center gap-1.5 text-[10px] text-white/70">
            <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke="#C4A8FF" strokeWidth="2" strokeDasharray="5,3" strokeLinecap="round"/></svg>
            {t('sleepLabel')}
          </span>
        )}
        {foodPath && (
          <span className="flex items-center gap-1.5 text-[10px] text-white/70">
            <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke="#86efac" strokeWidth="2" strokeDasharray="4,2" strokeLinecap="round"/></svg>
            🍽️ {t('foodLabel')}
          </span>
        )}
        {fatiguePath && (
          <span className="flex items-center gap-1.5 text-[10px] text-white/70">
            <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke="#fde68a" strokeWidth="2" strokeDasharray="4,2" strokeLinecap="round"/></svg>
            ⚡ {t('fatigueLabel')}
          </span>
        )}
      </div>

      {/* Graphique avec axes Y */}
      <div className="flex gap-1">
        {/* Labels axe Y */}
        <div className="flex flex-col justify-between pb-[14px]" style={{ height: H + 14 }}>
          <span className="text-white/30 text-[7px] leading-none">+</span>
          <span className="text-white/30 text-[7px] leading-none">–</span>
        </div>

        {/* SVG */}
        <svg viewBox={`0 0 ${W} ${H + 14}`} width="100%" style={{ overflow: 'visible' }}>
          {/* Grilles */}
          {gridLines.map(y => (
            <line key={y} x1="0" y1={y} x2={W} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
          ))}
          {/* Ligne de base */}
          <line x1="0" y1={CHART_H} x2={W} y2={CHART_H} stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />

          {/* Courbes secondaires d'abord (en dessous) */}
          {sleepPath   && <path d={sleepPath}   fill="none" stroke="#C4A8FF" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="5,3" strokeOpacity="0.8" />}
          {foodPath    && <path d={foodPath}    fill="none" stroke="#86efac" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4,2" strokeOpacity="0.8" />}
          {fatiguePath && <path d={fatiguePath} fill="none" stroke="#fde68a" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4,2" strokeOpacity="0.8" />}

          {/* Courbe humeur par-dessus, plus épaisse */}
          {moodPath && (
            <>
              {/* Halo doux */}
              <path d={moodPath} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" strokeLinecap="round" />
              <path d={moodPath} fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="2.5" strokeLinecap="round" />
            </>
          )}

          {/* Points humeur uniquement (plus propre) */}
          {moodPts.map((p, i) => (
            <circle key={`m${i}`} cx={p.x} cy={p.y} r="2.5" fill="white" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          ))}

          {/* Labels axe X */}
          {[1, 8, 15, 22, days].map(d => (
            <text key={d} x={Math.round((d-1)/(days-1)*W)} y={CHART_H + 13} fill="rgba(255,255,255,0.35)" fontSize="7" fontFamily="Nunito">{d}</text>
          ))}
        </svg>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
          {insights.map((ins, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-[2px] shrink-0 w-2 h-2 rounded-full" style={{ background: ins.color }} />
              <p className="text-white/80 text-[11px] leading-relaxed">{ins.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
