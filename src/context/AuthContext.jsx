import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getTheme } from '../lib/themes'

function applyThemeCSSVars(theme) {
  const r = document.documentElement
  r.style.setProperty('--bg-gradient', theme.gradient)
  r.style.setProperty('--drawer-bg',   theme.drawer)
  r.style.setProperty('--blob1',       theme.blob1)
  r.style.setProperty('--blob2',       theme.blob2)
  r.style.setProperty('--blob3',       theme.blob3)
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data ?? null)
    if (data?.theme) {
      applyThemeCSSVars(getTheme(data.theme))
      localStorage.setItem('theme', data.theme)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function signUp({ email, password, prenom, langue }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { prenom, langue } },
    })
    if (error) return { error }
    if (!data.session) return { error: null, emailConfirmation: true }
    await loadProfile(data.user.id)
    return { error: null }
  }

  async function signIn({ email, password }) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function updateProfile(updates) {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
    if (!error) setProfile(prev => ({ ...prev, ...updates }))
    return { error }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
