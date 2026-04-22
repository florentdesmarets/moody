export const THEMES = [
  {
    id: 'sunset',
    label: '🌅 Coucher de soleil',
    labelEn: '🌅 Sunset',
    gradient: 'linear-gradient(160deg, #FFD07A 0%, #FF8C5A 60%, #FF6B5A 100%)',
    drawer: 'rgba(220,75,30,0.97)',
    blob1: '#FFE08A', blob2: '#FF5533', blob3: '#FFD07A',
  },
  {
    id: 'lavender',
    label: '💜 Lavande',
    labelEn: '💜 Lavender',
    gradient: 'linear-gradient(160deg, #c4b5fd 0%, #7c3aed 60%, #5b21b6 100%)',
    drawer: 'rgba(90,33,182,0.97)',
    blob1: '#ddd6fe', blob2: '#a78bfa', blob3: '#c4b5fd',
  },
  {
    id: 'ocean',
    label: '🌊 Océan',
    labelEn: '🌊 Ocean',
    gradient: 'linear-gradient(160deg, #7dd3fc 0%, #0284c7 60%, #0369a1 100%)',
    drawer: 'rgba(3,105,161,0.97)',
    blob1: '#bae6fd', blob2: '#38bdf8', blob3: '#7dd3fc',
  },
  {
    id: 'rose',
    // Rose → changed to deep plum/magenta to avoid clash with red mood colors in calendar
    label: '🌸 Rose',
    labelEn: '🌸 Rose',
    gradient: 'linear-gradient(160deg, #f5d0fe 0%, #a21caf 60%, #86198f 100%)',
    drawer: 'rgba(134,25,143,0.97)',
    blob1: '#f0abfc', blob2: '#d946ef', blob3: '#f5d0fe',
  },
  {
    id: 'forest',
    // Forest → changed to teal/cyan to avoid clash with green mood colors in calendar
    label: '🌿 Forêt',
    labelEn: '🌿 Forest',
    gradient: 'linear-gradient(160deg, #99f6e4 0%, #0d9488 60%, #0f766e 100%)',
    drawer: 'rgba(15,118,110,0.97)',
    blob1: '#5eead4', blob2: '#14b8a6', blob3: '#99f6e4',
  },
  {
    id: 'night',
    label: '🌙 Nuit',
    labelEn: '🌙 Night',
    gradient: 'linear-gradient(160deg, #475569 0%, #1e293b 60%, #0f172a 100%)',
    drawer: 'rgba(15,23,42,0.97)',
    blob1: '#94a3b8', blob2: '#64748b', blob3: '#475569',
  },
  {
    id: 'aurora',
    label: '🌌 Aurore boréale',
    labelEn: '🌌 Northern Lights',
    gradient: 'linear-gradient(160deg, #c084fc 0%, #818cf8 50%, #34d399 100%)',
    drawer: 'rgba(99,60,180,0.97)',
    blob1: '#e879f9', blob2: '#818cf8', blob3: '#6ee7b7',
  },
  {
    id: 'peach',
    label: '🍑 Pêche dorée',
    labelEn: '🍑 Golden Peach',
    gradient: 'linear-gradient(160deg, #fde68a 0%, #fb923c 60%, #f97316 100%)',
    drawer: 'rgba(234,88,12,0.97)',
    blob1: '#fef08a', blob2: '#fdba74', blob3: '#fde68a',
  },
]

export function getTheme(id) {
  return THEMES.find(t => t.id === id) ?? THEMES[0]
}
