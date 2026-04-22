import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import BgBlobs from '../components/BgBlobs'

export default function Login() {
  const navigate   = useNavigate()
  const { signIn } = useAuth()
  const { t }      = useLang()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit() {
    if (!email || !password) return
    setLoading(true); setError('')
    const { error } = await signIn({ email, password })
    setLoading(false)
    if (error) { setError(error.message); return }
    navigate('/mood')
  }

  return (
    <div className="bg-app relative overflow-hidden flex flex-col min-h-[100dvh]">
      <BgBlobs />
      <div className="relative z-10 w-full max-w-[420px] mx-auto px-6 pt-14 pb-10 fade-in">
        <h1 className="text-white font-extrabold text-[22px] text-center mb-6">{t('login')}</h1>
        <input className="w-full bg-white/90 rounded-full px-4 py-2.5 text-[13px] text-[#555] outline-none mb-2 border-none focus:bg-white"
          type="email" placeholder={t('email')} value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full bg-white/90 rounded-full px-4 py-2.5 text-[13px] text-[#555] outline-none mb-4 border-none focus:bg-white"
          type="password" placeholder={t('password')} value={password} onChange={e => setPassword(e.target.value)} />
        {error && <p className="text-white text-[12px] text-center mb-3 bg-white/20 rounded-xl px-3 py-2">{error}</p>}
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
