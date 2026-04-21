import { createContext, useContext, useEffect, useState } from 'react'
import { THEMES, getTheme } from '../lib/themes'

const ThemeContext = createContext(null)

function applyTheme(theme) {
  const root = document.documentElement
  root.style.setProperty('--bg-gradient', theme.gradient)
  root.style.setProperty('--drawer-bg', theme.drawer)
  root.style.setProperty('--blob1', theme.blob1)
  root.style.setProperty('--blob2', theme.blob2)
  root.style.setProperty('--blob3', theme.blob3)
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
