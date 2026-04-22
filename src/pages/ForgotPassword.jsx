import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useLang } from '../context/LangContext'
import BgBlobs from '../components/BgBlobs'

const APP_URL = 'https://florentdesmarets.github.io/moody'

export default function ForgotPassword() {
  const navigate      = useNavigate()
  const { lang }      = useLang()
  const isFR          = lang === 'fr'
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  async function handleSend() {
    if (!email) return
    setLoading(true); setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${APP_URL}/reset-password`,
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setSent(true)
  }

  /* ── Écran de succès ── */
  if (sent) return (
    <div className="bg-app relative overflow-hidden flex flex-col min-h-[100dvh]">
      <BgBlobs />
      <div className="relative z-10 w-full max-w-[420px] mx-auto px-6 flex flex-col flex-1 items-center justify-center fade-in">
        <div className="text-center mb-6">
          <span className="text-[72px] pop-in inline-block mb-3">📨</span>
          <h1 className="text-white font-extrabold text-[22px] mb-2">
            {isFR ? 'Email envoyé !' : 'Email sent!'}
          </h1>
          <p className="text-white/80 text-[14px] leading-relaxed">
            {isFR
              ? <>Un lien de réinitialisation a été envoyé à<br /><span className="font-bold text-white">{email}</span></>
              : <>A reset link has been sent to<br /><span className="font-bold text-white">{email}</span></>}
          </p>
        </div>

        <div className="w-full bg-white/15 rounded-3xl px-5 py-5 mb-6 border border-white/20">
          <p className="text-white font-bold text-[13px] mb-3">
            {isFR ? '👇 Comment faire ?' : '👇 What to do?'}
          </p>
          {(isFR
            ? ['1️⃣  Ouvre l\'email de Moody dans ta boîte de réception', '2️⃣  Clique sur « Réinitialiser mon mot de passe »', '3️⃣  Choisis un nouveau mot de passe et connecte-toi !']
            : ['1️⃣  Open the Moody email in your inbox', '2️⃣  Click "Reset my password"', '3️⃣  Choose a new password and log in!']
          ).map((step, i) => (
            <p key={i} className="text-white/80 text-[12px] leading-relaxed mb-2 last:mb-0">{step}</p>
          ))}
          <p className="text-white/50 text-[11px] mt-4 leading-relaxed">
            {isFR
              ? '💡 L\'email peut mettre quelques minutes. Pense à vérifier les spams !'
              : '💡 The email may take a few minutes. Check your spam folder!'}
          </p>
        </div>

        <button onClick={() => navigate('/login')}
          className="w-full py-3 rounded-full bg-white text-[#FF7040] font-bold text-[14px] active:scale-[0.98] transition-transform mb-3">
          {isFR ? '→ Retour à la connexion' : '→ Back to login'}
        </button>
      </div>
    </div>
  )

  /* ── Formulaire ── */
  return (
    <div className="bg-app relative overflow-hidden flex flex-col min-h-[100dvh]">
      <BgBlobs />
      <div className="relative z-10 w-full max-w-[420px] mx-auto px-6 flex flex-col flex-1 items-center justify-center fade-in">
        <div className="text-center mb-6">
          <span className="text-[56px] pop-in inline-block mb-3">🔑</span>
          <h1 className="text-white font-extrabold text-[22px] mb-2">
            {isFR ? 'Mot de passe oublié ?' : 'Forgot your password?'}
          </h1>
          <p className="text-white/75 text-[13px] leading-relaxed">
            {isFR
              ? 'Saisis ton adresse email, on t\'envoie un lien pour en choisir un nouveau.'
              : 'Enter your email address and we\'ll send you a reset link.'}
          </p>
        </div>

        <input
          className="w-full bg-white/90 rounded-full px-4 py-3 text-[13px] text-[#555] outline-none mb-3 border-none focus:bg-white"
          type="email"
          placeholder={isFR ? 'Ton adresse email' : 'Your email address'}
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />

        {error && (
          <p className="text-white text-[12px] text-center mb-3 bg-white/20 rounded-xl px-3 py-2 w-full">{error}</p>
        )}

        <button onClick={handleSend} disabled={loading || !email}
          className="w-full py-3 rounded-full bg-white text-[#FF7040] font-bold text-[14px] active:scale-[0.98] transition-transform disabled:opacity-50 mb-4">
          {loading ? '...' : (isFR ? '📨 Envoyer le lien' : '📨 Send reset link')}
        </button>

        <p onClick={() => navigate('/login')}
          className="text-white/60 text-[12px] cursor-pointer">
          {isFR ? '← Retour à la connexion' : '← Back to login'}
        </p>
      </div>
    </div>
  )
}
