import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useLang } from '../context/LangContext'
import BgBlobs from '../components/BgBlobs'

export default function ResetPassword() {
  const navigate      = useNavigate()
  const { lang }      = useLang()
  const isFR          = lang === 'fr'
  const [ready,    setReady]    = useState(false)   // session recovery détectée
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [done,     setDone]     = useState(false)

  /* Supabase envoie un lien avec un token dans l'URL.
     onAuthStateChange détecte l'event PASSWORD_RECOVERY et crée une session temporaire. */
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    // Si la session est déjà établie (rechargement de page), on vérifie
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleReset() {
    if (!password || !confirm) return
    if (password !== confirm) {
      setError(isFR ? 'Les mots de passe ne correspondent pas.' : 'Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError(isFR ? 'Le mot de passe doit faire au moins 6 caractères.' : 'Password must be at least 6 characters.')
      return
    }
    setLoading(true); setError('')
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError(error.message); return }
    setDone(true)
    setTimeout(() => navigate('/mood'), 2500)
  }

  /* ── Succès ── */
  if (done) return (
    <div className="bg-app relative overflow-hidden flex flex-col min-h-[100dvh]">
      <BgBlobs />
      <div className="relative z-10 w-full max-w-[420px] mx-auto px-6 flex flex-col flex-1 items-center justify-center fade-in text-center">
        <span className="text-[72px] pop-in inline-block mb-4">🎉</span>
        <h1 className="text-white font-extrabold text-[22px] mb-2">
          {isFR ? 'Mot de passe modifié !' : 'Password updated!'}
        </h1>
        <p className="text-white/75 text-[14px]">
          {isFR ? 'Tu vas être redirigé vers l\'app…' : 'Redirecting you to the app…'}
        </p>
      </div>
    </div>
  )

  /* ── En attente du token ── */
  if (!ready) return (
    <div className="bg-app relative overflow-hidden flex flex-col min-h-[100dvh]">
      <BgBlobs />
      <div className="relative z-10 w-full max-w-[420px] mx-auto px-6 flex flex-col flex-1 items-center justify-center fade-in text-center">
        <span className="text-[56px] inline-block mb-4 animate-pulse">⏳</span>
        <p className="text-white/75 text-[14px]">
          {isFR ? 'Vérification du lien…' : 'Verifying your link…'}
        </p>
      </div>
    </div>
  )

  /* ── Formulaire ── */
  return (
    <div className="bg-app relative overflow-hidden flex flex-col min-h-[100dvh]">
      <BgBlobs />
      <div className="relative z-10 w-full max-w-[420px] mx-auto px-6 flex flex-col flex-1 items-center justify-center fade-in">
        <div className="text-center mb-6">
          <span className="text-[56px] pop-in inline-block mb-3">🔐</span>
          <h1 className="text-white font-extrabold text-[22px] mb-2">
            {isFR ? 'Nouveau mot de passe' : 'New password'}
          </h1>
          <p className="text-white/75 text-[13px]">
            {isFR ? 'Choisis un nouveau mot de passe sécurisé.' : 'Choose a new secure password.'}
          </p>
        </div>

        <input
          className="w-full bg-white/90 rounded-full px-4 py-3 text-[13px] text-[#555] outline-none mb-3 border-none focus:bg-white"
          type="password"
          placeholder={isFR ? 'Nouveau mot de passe' : 'New password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <input
          className="w-full bg-white/90 rounded-full px-4 py-3 text-[13px] text-[#555] outline-none mb-4 border-none focus:bg-white"
          type="password"
          placeholder={isFR ? 'Confirmer le mot de passe' : 'Confirm password'}
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleReset()}
        />

        {error && (
          <p className="text-white text-[12px] text-center mb-3 bg-white/20 rounded-xl px-3 py-2 w-full">{error}</p>
        )}

        <button onClick={handleReset} disabled={loading || !password || !confirm}
          className="w-full py-3 rounded-full bg-white text-[#FF7040] font-bold text-[14px] active:scale-[0.98] transition-transform disabled:opacity-50">
          {loading ? '...' : (isFR ? '✅ Enregistrer le nouveau mot de passe' : '✅ Save new password')}
        </button>
      </div>
    </div>
  )
}
