export const THEMES = [
  {
    id: 'sunset',
    label: '🌅 Coucher de soleil',
    labelEn: '🌅 Sunset',
    gradient: 'linear-gradient(160deg, #FFB347 0%, #FF8C5A 60%, #FF6B5A 100%)',
    overlay: 'rgba(0,0,0,0.06)',
    drawer: 'rgba(220,75,30,0.97)',
    blob1: '#FFC870', blob2: '#FF5533', blob3: '#FFB347',
    themeColor: '#FF8C5A',
  },
  {
    id: 'lavender',
    label: '💜 Lavande',
    labelEn: '💜 Lavender',
    gradient: 'linear-gradient(160deg, #c4b5fd 0%, #7c3aed 60%, #5b21b6 100%)',
    overlay: 'rgba(0,0,0,0.05)',
    drawer: 'rgba(90,33,182,0.97)',
    blob1: '#ddd6fe', blob2: '#a78bfa', blob3: '#c4b5fd',
    themeColor: '#7c3aed',
  },
  {
    id: 'ocean',
    label: '🌊 Océan',
    labelEn: '🌊 Ocean',
    // Start darkened: #7dd3fc → #38bdf8
    gradient: 'linear-gradient(160deg, #38bdf8 0%, #0284c7 60%, #0369a1 100%)',
    overlay: 'rgba(0,0,0,0.10)',
    drawer: 'rgba(3,105,161,0.97)',
    blob1: '#7dd3fc', blob2: '#0ea5e9', blob3: '#38bdf8',
    themeColor: '#0284c7',
  },
  {
    id: 'rose',
    // Rose → changed to deep plum/magenta to avoid clash with red mood colors in calendar
    label: '✨ Fuchsia',
    labelEn: '✨ Fuchsia',
    // Start darkened: #f5d0fe → #e879f9
    gradient: 'linear-gradient(160deg, #e879f9 0%, #a21caf 60%, #86198f 100%)',
    overlay: 'rgba(0,0,0,0.10)',
    drawer: 'rgba(134,25,143,0.97)',
    blob1: '#f0abfc', blob2: '#d946ef', blob3: '#e879f9',
    themeColor: '#a21caf',
  },
  {
    id: 'forest',
    // Forest → changed to teal/cyan to avoid clash with green mood colors in calendar
    label: '🪨 Jade',
    labelEn: '🪨 Jade',
    // Start darkened: #99f6e4 → #34d399
    gradient: 'linear-gradient(160deg, #34d399 0%, #0d9488 60%, #0f766e 100%)',
    overlay: 'rgba(0,0,0,0.10)',
    drawer: 'rgba(15,118,110,0.97)',
    blob1: '#5eead4', blob2: '#14b8a6', blob3: '#34d399',
    themeColor: '#0d9488',
  },
  {
    id: 'night',
    label: '🌙 Nuit',
    labelEn: '🌙 Night',
    gradient: 'linear-gradient(160deg, #475569 0%, #1e293b 60%, #0f172a 100%)',
    overlay: 'rgba(0,0,0,0)',
    drawer: 'rgba(15,23,42,0.97)',
    blob1: '#94a3b8', blob2: '#64748b', blob3: '#475569',
    themeColor: '#1e293b',
  },
  {
    id: 'aurora',
    label: '🌌 Aurore boréale',
    labelEn: '🌌 Northern Lights',
    gradient: 'linear-gradient(160deg, #c084fc 0%, #818cf8 50%, #34d399 100%)',
    overlay: 'rgba(0,0,0,0.05)',
    drawer: 'rgba(99,60,180,0.97)',
    blob1: '#e879f9', blob2: '#818cf8', blob3: '#6ee7b7',
    themeColor: '#818cf8',
  },
  {
    id: 'peach',
    label: '🍑 Pêche dorée',
    labelEn: '🍑 Golden Peach',
    // Start darkened: #fde68a → #fbbf24
    gradient: 'linear-gradient(160deg, #fbbf24 0%, #fb923c 60%, #f97316 100%)',
    overlay: 'rgba(0,0,0,0.12)',
    drawer: 'rgba(234,88,12,0.97)',
    blob1: '#fcd34d', blob2: '#fdba74', blob3: '#fbbf24',
    themeColor: '#fb923c',
  },
]

export function getTheme(id) {
  return THEMES.find(t => t.id === id) ?? THEMES[0]
}
