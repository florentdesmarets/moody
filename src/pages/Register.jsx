import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import BgBlobs from '../components/BgBlobs'

export default function Register() {
  const navigate   = useNavigate()
  const { signUp } = useAuth()
  const { t, lang, setLang } = useLang()
  const [prenom,   setPrenom]   = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit() {
    if (!prenom || !email || !password) { setError('Tous les champs sont requis'); return }
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return }
    setLoading(true); setError(''); setSuccess('')
    const { error, emailConfirmation } = await signUp({ email, password, prenom, langue: lang })
    setLoading(false)
    if (error) { setError(error.message); return }
    if (emailConfirmation) {
      setSuccess(lang === 'fr'
        ? `Un email de confirmation a été envoyé à ${email}. Vérifie ta boîte mail !`
        : `A confirmation email has been sent to ${email}. Check your inbox!`)
      return
    }
    navigate('/mood')
  }

  return (
    <div className="bg-app relative overflow-hidden flex flex-col px-6 pt-12 pb-10 min-h-[100dvh]">
      <BgBlobs />
      <div className="relative z-10 overflow-y-auto no-scrollbar fade-in">
        <h1 className="text-white font-extrabold text-[22px] text-center mb-4">{t('register')}</h1>
        <input className="w-full bg-white/90 rounded-full px-4 py-2.5 text-[13px] text-[#555] outline-none mb-2 border-none"
          type="text" placeholder={t('firstname')} value={prenom} onChange={e => setPrenom(e.target.value)} />
        <input className="w-full bg-white/90 rounded-full px-4 py-2.5 text-[13px] text-[#555] outline-none mb-2 border-none"
          type="email" placeholder={t('email')} value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full bg-white/90 rounded-full px-4 py-2.5 text-[13px] text-[#555] outline-none mb-2 border-none"
          type="password" placeholder={t('password')} value={password} onChange={e => setPassword(e.target.value)} />
        <input className="w-full bg-white/90 rounded-full px-4 py-2.5 text-[13px] text-[#555] outline-none mb-3 border-none"
          type="password" placeholder={t('confirmPwd')} value={confirm} onChange={e => setConfirm(e.target.value)} />
        <div className="mt-1 mb-4">
          <p className="text-white/80 text-[12px] font-bold text-center mb-2">{t('chooseLanguage')}</p>
          <div className="flex gap-3">
            {['fr', 'en'].map(l => (
              <button key={l} onClick={() => setLang(l)}
                className={`flex-1 py-2.5 px-2 rounded-2xl text-[13px] font-bold text-center border-2 transition-all duration-200 ${lang === l ? 'bg-white border-white text-[#1a1a1a] scale-[1.04] shadow-md' : 'bg-white/15 border-white/35 text-white/75'}`}>
                <span className="block text-[22px] mb-1">{l === 'fr' ? '🇫🇷' : '🇬🇧'}</span>
                {l === 'fr' ? 'Français' : 'English'}
              </button>
            ))}
          </div>
        </div>
        {error   && <p className="text-white text-[12px] text-center mb-3 bg-white/20 rounded-xl px-3 py-2">{error}</p>}
        {success && <p className="text-white text-[12px] text-center mb-3 bg-white/30 rounded-xl px-3 py-2">{success}</p>}
        <div className="flex justify-center">
          <button onClick={handleSubmit} disabled={loading}
            className="bg-white text-[#FF7040] font-bold text-[14px] rounded-full px-6 py-2.5 active:scale-[1.03] transition-transform disabled:opacity-60">
            {loading ? '...' : t('loginBtn')}
          </button>
        </div>
        <p onClick={() => navigate('/')} className="text-white/75 text-[12px] text-center mt-4 cursor-pointer">{t('back')}</p>
      </div>
    </div>
  )
}
