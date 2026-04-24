import { createContext, useContext, useEffect, useState } from 'react'
import { THEMES, getTheme } from '../lib/themes'

const ThemeContext = createContext(null)

function applyTheme(theme) {
  const root = document.documentElement
  root.style.setProperty('--bg-gradient', theme.gradient)
  root.style.setProperty('--bg-overlay', theme.overlay ?? 'rgba(0,0,0,0)')
  root.style.setProperty('--drawer-bg', theme.drawer)
  root.style.setProperty('--blob1', theme.blob1)
  root.style.setProperty('--blob2', theme.blob2)
  root.style.setProperty('--blob3', theme.blob3)
  // Met à jour la couleur de la barre de statut PWA
  const metaTC = document.querySelector('meta[name="theme-color"]')
  if (metaTC) metaTC.setAttribute('content', theme.themeColor ?? '#FF8C5A')
}

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => {
    const saved = localStorage.getItem('theme') ?? 'sunset'
    applyTheme(getTheme(saved))
    return saved
  })

  function applyFromProfile(profileTheme) {
    if (profileTheme && profileTheme !== themeId) {
      setThemeId(profileTheme)
      localStorage.setItem('theme', profileTheme)
      applyTheme(getTheme(profileTheme))
    }
  }

  function changeTheme(id, saveToProfile) {
    setThemeId(id)
    localStorage.setItem('theme', id)
    applyTheme(getTheme(id))
    saveToProfile?.(id)
  }

  return (
    <ThemeContext.Provider value={{ themeId, changeTheme, applyFromProfile, themes: THEMES, currentTheme: getTheme(themeId) }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
