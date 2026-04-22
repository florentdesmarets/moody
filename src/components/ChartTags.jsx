import { useMemo } from 'react'
import { translations } from '../context/LangContext'

const tagsFR = translations.fr.tags
const tagsEN = translations.en.tags
const EMOJIS = ['😭','😔','😕','😐','🙂','😊','😄']

function moodEmoji(avg) {
  return EMOJIS[Math.max(0, Math.min(6, Math.round(avg) - 1))]
}

// Détecte si une entrée contient le tag à l'index idx
// Vérifie les deux versions (FR + EN) pour gérer les changements de langue
function hasTag(commentaire, idx) {
  if (!commentaire) return false
  const parts = commentaire.split(/,\s*/).map(p => p.trim())
  return parts.includes(tagsFR[idx]) || parts.includes(tagsEN[idx])
}

// Confiance basée sur le nombre d'occurrences
function getConfidence(count) {
  if (count >= 8) return 'high'
  if (count >= 4) return 'medium'
  return 'low'
}

function TagRow({ item, maxImpact, lang }) {
  const barPct   = Math.min(100, (Math.abs(item.impact) / maxImpact) * 100)
  const isPos    = item.impact >= 0
  const barColor = isPos ? '#86efac' : '#fca5a5'

  const confLabel = {
    high:   lang === 'fr' ? 'Fiable'      : 'Reliable',
    medium: lang === 'fr' ? 'Indicatif'   : 'Indicative',
    low:    lang === 'fr' ? 'À confirmer' : 'Unconfirmed',
  }[item.conf]

  const confColor = {
    high:   '#22c55e',
    medium: '#f59e0b',
    low:    '#94a3b8',
  }[item.conf]

  // Phrase d'explication naturelle
  const withWord    = lang === 'fr' ? 'avec' : 'with'
  const withoutWord = lang === 'fr' ? 'sans' : 'without'
  const timesWord   = lang === 'fr' ? `fois ce mois` : `times this month`

  return (
    <div className="mb-4">
      {/* En-tête : label + impact */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-white text-[11px] font-bold leading-tight">{item.label}</span>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <span className="text-[12px] font-extrabold" style={{ color: barColor }}>
            {isPos ? '+' : ''}{item.impact.toFixed(1)}
          </span>
          <span
            className="text-[8px] px-1.5 py-0.5 rounded-full font-bold"
            style={{ background: confColor + '28', color: confColor }}>
            {confLabel}
          </span>
        </div>
      </div>

      {/* Barre d'impact */}
      <div className="h-2 bg-white/12 rounded-full mb-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${barPct}%`, background: barColor }}
        />
      </div>

      {/* Phrase explicative claire */}
      <div className="flex items-center gap-1.5 text-[10px] text-white/60">
        <span>{moodEmoji(item.avgWith)} <strong className="text-white/80">{item.avgWith.toFixed(1)}</strong> {withWord}</span>
        <span className="text-white/25">→</span>
        <span>{moodEmoji(item.avgWithout)} <strong className="text-white/80">{item.avgWithout.toFixed(1)}</strong> {withoutWord}</span>
        <span className="text-white/25">·</span>
        <span className="text-white/45">{item.count} {timesWord}</span>
      </div>
    </div>
  )
}

export default function ChartTags({ monthEntries, t, month, year }) {
  const lang = t('langValue').startsWith('F') ? 'fr' : 'en'

  const analysis = useMemo(() => {
    if (!monthEntries || monthEntries.length < 3) return null

    const results = tagsFR.map((_, idx) => {
      const withTag    = monthEntries.filter(m => hasTag(m.commentaire, idx))
      const withoutTag = monthEntries.filter(m => !hasTag(m.commentaire, idx))

      // Seuils abaissés pour être utile sur un mois
      if (withTag.length < 2 || withoutTag.length < 1) return null

      const avgWith    = withTag.reduce((s, m) => s + m.niveau, 0) / withTag.length
      const avgWithout = withoutTag.reduce((s, m) => s + m.niveau, 0) / withoutTag.length
      const impact     = avgWith - avgWithout

      return {
        idx,
        label:      t('tags')[idx],
        count:      withTag.length,
        avgWith,
        avgWithout,
        impact,
        conf:       getConfidence(withTag.length),
        pct:        Math.round((withTag.length / monthEntries.length) * 100),
      }
    }).filter(Boolean)

    return results.sort((a, b) => b.impact - a.impact)
  }, [monthEntries, t])

  const months = t('months')
  const monthLabel = months ? `${months[month]} ${year}` : ''

  // Pas assez de données
  if (!analysis || analysis.length === 0) {
    return (
      <div className="bg-white/12 rounded-2xl p-4 mt-3">
        <p className="text-white text-[12px] font-bold mb-1">{t('tagCorrelationTitle')}</p>
        <p className="text-white/45 text-[10px] mb-3">{monthLabel}</p>
        <p className="text-white/40 text-[11px] text-center py-3">
          {lang === 'fr'
            ? '🏷️ Sélectionne des activités dans le journal pour voir leur impact sur ton humeur.'
            : '🏷️ Select activities in your journal to see their impact on your mood.'}
        </p>
      </div>
    )
  }

  const helps   = analysis.filter(s => s.impact >=  0.3)
  const drains  = analysis.filter(s => s.impact <= -0.3)
  const neutral = analysis.filter(s => Math.abs(s.impact) < 0.3)
  const maxImpact = Math.max(...analysis.map(s => Math.abs(s.impact)), 0.5)

  if (helps.length === 0 && drains.length === 0) return null

  return (
    <div className="bg-white/12 rounded-2xl p-4 mt-3">
      <div className="flex items-start justify-between mb-0.5">
        <p className="text-white text-[12px] font-bold">{t('tagCorrelationTitle')}</p>
      </div>
      <p className="text-white/45 text-[10px] mb-4">{monthLabel} · {lang === 'fr' ? 'min. 2 occurrences par activité' : 'min. 2 occurrences per activity'}</p>

      {/* Section positive */}
      {helps.length > 0 && (
        <div className="mb-4">
          <p className="text-[9px] font-extrabold uppercase tracking-widest mb-3" style={{ color: '#86efac' }}>
            ✨ {t('tagCorrelationHelps')}
          </p>
          {helps.map(item => (
            <TagRow key={item.idx} item={item} maxImpact={maxImpact} lang={lang} />
          ))}
        </div>
      )}

      {helps.length > 0 && drains.length > 0 && (
        <div className="border-t border-white/10 mb-4" />
      )}

      {/* Section négative */}
      {drains.length > 0 && (
        <div className="mb-3">
          <p className="text-[9px] font-extrabold uppercase tracking-widest mb-3" style={{ color: '#fca5a5' }}>
            😔 {t('tagCorrelationDrains')}
          </p>
          {[...drains].reverse().map(item => (
            <TagRow key={item.idx} item={item} maxImpact={maxImpact} lang={lang} />
          ))}
        </div>
      )}

      {/* Activités neutres — repliées */}
      {neutral.length > 0 && (
        <details className="group mt-1">
          <summary className="cursor-pointer list-none flex items-center gap-1.5 text-[9px] text-white/35 font-semibold select-none">
            <span className="group-open:hidden">▸</span>
            <span className="hidden group-open:inline">▾</span>
            {neutral.length} {t('tagCorrelationNeutral')}
          </summary>
          <div className="mt-3">
            {neutral.map(item => (
              <TagRow key={item.idx} item={item} maxImpact={Math.max(maxImpact, 0.3)} lang={lang} />
            ))}
          </div>
        </details>
      )}

      {/* Légende simplifiée */}
      <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap gap-x-3 gap-y-1">
        {[
          { color: '#22c55e', label: lang === 'fr' ? 'Fiable (8+ entrées)' : 'Reliable (8+ entries)' },
          { color: '#f59e0b', label: lang === 'fr' ? 'Indicatif (4–7 entrées)' : 'Indicative (4–7 entries)' },
          { color: '#94a3b8', label: lang === 'fr' ? 'À confirmer (2–3 entrées)' : 'Unconfirmed (2–3 entries)' },
        ].map(({ color, label }) => (
          <span key={color} className="flex items-center gap-1 text-[8.5px] text-white/40">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
