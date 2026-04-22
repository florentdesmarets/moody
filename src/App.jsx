import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LangProvider } from './context/LangContext'
import { ThemeProvider } from './context/ThemeContext'
import PWAInstallBanner from './components/PWAInstallBanner'
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
import Crisis         from './pages/Crisis'
import About          from './pages/About'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword  from './pages/ResetPassword'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? children : <Navigate to="/" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/mood" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LangProvider>
          <div className="w-full min-h-screen">
            <BrowserRouter basename="/moody">
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
                <Route path="/crisis"        element={<PrivateRoute><Crisis /></PrivateRoute>} />
                <Route path="/about"           element={<About />} />
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
