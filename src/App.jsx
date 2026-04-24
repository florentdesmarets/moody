import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LangProvider, useLang } from './context/LangContext'
import { ThemeProvider } from './context/ThemeContext'
import PWAInstallBanner from './components/PWAInstallBanner'
import { fireInAppNotification, isNotificationGranted } from './hooks/useNotifications'
import Welcome      from './pages/Welcome'
import Login        from './pages/Login'
import Register     from './pages/Register'
import Mood         from './pages/Mood'
import MoodPositive from './pages/MoodPositive'
import Journal      from './pages/Journal'
import Sleep        from './pages/Sleep'
import Food         from './pages/Food'
import Fatigue      from './pages/Fatigue'
import Thanks       from './pages/Thanks'
import Calendar     from './pages/Calendar'
import Stats        from './pages/Stats'
import Chart        from './pages/Chart'
import Account      from './pages/Account'
import Conseil        from './pages/Conseil'
import Meditation     from './pages/Meditation'
import Crisis         from './pages/Crisis'
import About          from './pages/About'
import Admin          from './pages/Admin'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword  from './pages/ResetPassword'

// ─── Vérification du rappel quotidien ─────────────────────────────────────────
// Toutes les 60s, compare l'heure actuelle à reminder_time du profil.
// Plus fiable que le timer SW sur desktop (onglet ouvert).
function ReminderChecker() {
  const { profile } = useAuth()
  const { lang }    = useLang()

  useEffect(() => {
    if (!profile?.notif_active || !profile?.reminder_time) return

    const check = () => {
      if (!isNotificationGranted()) return
      const now  = new Date()
      const hhmm = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
      if (hhmm === profile.reminder_time) fireInAppNotification(lang)
    }

    check() // vérif immédiate au montage
    const id = setInterval(check, 30_000) // 30s pour ne pas rater la fenêtre d'1 min
    return () => clearInterval(id)
  }, [profile?.notif_active, profile?.reminder_time, lang])

  return null
}

function LoadingScreen() {
  return (
    <div className="bg-app flex flex-col min-h-[100dvh] items-center justify-center gap-3">
      <span className="text-[64px] animate-bounce" style={{ animationDuration: '1.2s' }}>🩷</span>
      <p className="text-white/70 text-[13px] font-medium tracking-wide">Chargement…</p>
    </div>
  )
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return user ? children : <Navigate to="/" replace />
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user || user.email !== 'florent.desmarets@gmail.com') return <Navigate to="/" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  // Capturé une seule fois au montage : si l'URL contient un access_token
  // (retour confirmation email / reset), on attend que Supabase traite le hash.
  const [hasAuthToken] = useState(
    () => typeof window !== 'undefined' && window.location.hash.includes('access_token')
  )
  // Timeout de sécurité : si le token est invalide/périmé (>120s pour Supabase,
  // ou token déjà consommé → 403), on sort du loading après 5s pour ne pas boucler.
  const [tokenExpired, setTokenExpired] = useState(false)
  useEffect(() => {
    if (!hasAuthToken || user) return
    const t = setTimeout(() => {
      // Nettoie le hash de l'URL avant de laisser l'app reprendre normalement
      window.history.replaceState(null, '', window.location.pathname)
      setTokenExpired(true)
    }, 5000)
    return () => clearTimeout(t)
  }, [hasAuthToken, user])

  if (loading || (hasAuthToken && !user && !tokenExpired)) return <LoadingScreen />
  return user ? <Navigate to="/mood" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LangProvider>
          <div className="w-full min-h-screen">
            <ReminderChecker />
            <BrowserRouter basename="">
              <PWAInstallBanner />
              <Routes>
                <Route path="/"         element={<PublicRoute><Welcome /></PublicRoute>} />
                <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                <Route path="/mood"          element={<PrivateRoute><Mood /></PrivateRoute>} />
                <Route path="/mood-positive" element={<PrivateRoute><MoodPositive /></PrivateRoute>} />
                <Route path="/journal"       element={<PrivateRoute><Journal /></PrivateRoute>} />
                <Route path="/sleep"         element={<PrivateRoute><Sleep /></PrivateRoute>} />
                <Route path="/food"          element={<PrivateRoute><Food /></PrivateRoute>} />
                <Route path="/fatigue"       element={<PrivateRoute><Fatigue /></PrivateRoute>} />
                <Route path="/thanks"        element={<PrivateRoute><Thanks /></PrivateRoute>} />
                <Route path="/calendar"      element={<PrivateRoute><Calendar /></PrivateRoute>} />
                <Route path="/stats"         element={<PrivateRoute><Stats /></PrivateRoute>} />
                <Route path="/chart"         element={<PrivateRoute><Chart /></PrivateRoute>} />
                <Route path="/account"       element={<PrivateRoute><Account /></PrivateRoute>} />
                <Route path="/conseil"       element={<PrivateRoute><Conseil /></PrivateRoute>} />
                <Route path="/meditation"    element={<PrivateRoute><Meditation /></PrivateRoute>} />
                <Route path="/crisis"        element={<PrivateRoute><Crisis /></PrivateRoute>} />
                <Route path="/about"           element={<About />} />
                <Route path="/admin"           element={<AdminRoute><Admin /></AdminRoute>} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password"  element={<ResetPassword />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </div>
        </LangProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
