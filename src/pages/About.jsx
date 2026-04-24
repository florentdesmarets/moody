import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import BgBlobs from '../components/BgBlobs'
import AppHeader from '../components/AppHeader'
import { useLang } from '../context/LangContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const APP_URL    = 'https://www.moodyapp.fr/'
const DONATE_URL = 'https://buymeacoffee.com/florent.d'

function AppQRCode({ size = 110 }) {
  const ref = useRef()
  useEffect(() => {
    if (!ref.current) return
    QRCode.toCanvas(ref.current, APP_URL, {
      width:  size * 2,
      margin: 1,
      color:  { dark: '#FF7040', light: '#FFFFFF' },
    }).catch(() => {})
  }, [size])
  return (
    <canvas
      ref={ref}
      width={size * 2}
      height={size * 2}
      style={{ width: size, height: size }}
      className="rounded-xl"
    />
  )
}

export default function About() {
  const navigate = useNavigate()
  const { t, lang } = useLang()
  const { user } = useAuth()
  const [feedbackType, setFeedbackType] = useState('support')
  const [feedbackMsg,  setFeedbackMsg]  = useState('')
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [sendError,    setSendError]    = useState(false)

  async function handleSendFeedback() {
    if (!feedbackMsg.trim()) return
    setSendError(false)
    const { error } = await supabase.from('messages').insert({
      user_id:    user?.id   ?? null,
      user_email: user?.email ?? null,
      type:       feedbackType,
      body:       feedbackMsg.trim(),
    })
    if (error) {
      console.error('Message send error:', error)
      setSendError(true)
      return
    }
    setFeedbackSent(true)
    setFeedbackMsg('')
    setTimeout(() => setFeedbackSent(false), 4000)
  }

  async function handleShare() {
    const text = lang === 'fr'
      ? `😊 Moody — Journal émotionnel bienveillant\n${APP_URL}`
      : `😊 Moody — Daily emotional journal\n${APP_URL}`
    if (navigator.share) {
      await navigator.share({ title: 'Moody', text, url: APP_URL })
    } else {
      await navigator.clipboard.writeText(APP_URL)
      alert(lang === 'fr' ? 'Lien copié !' : 'Link copied!')
    }
  }

  return (
    <div className="bg-app relative overflow-hidden flex flex-col min-h-[100dvh]">
      <BgBlobs />
      <div className="relative z-10 w-full max-w-[560px] mx-auto px-5 pt-12 pb-8 flex flex-col flex-1">
      <AppHeader />
      <div className="flex flex-col flex-1 fade-in overflow-y-auto no-scrollbar">

        {/* Header */}
        <div className="text-center mb-5">
          <span className="text-[52px] pop-in inline-block mb-2">🩷</span>
          <h1 className="text-white font-extrabold text-[20px]">{t('aboutTitle')}</h1>
        </div>

        {/* Histoire */}
        <div className="bg-white/15 rounded-3xl px-5 py-5 mb-3 slide-in stagger-1">
          {t('aboutBody').split('\n\n').map((para, i) => (
            <p key={i} className="text-white/90 text-[13px] leading-relaxed mb-3 last:mb-0">{para}</p>
          ))}
        </div>

        {/* ⚕️ Avertissement médical */}
        <div className="rounded-3xl px-5 py-4 mb-3 slide-in stagger-2"
          style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <p className="text-white font-bold text-[12px] mb-2">⚕️ {lang === 'fr' ? 'Avertissement médical' : 'Medical disclaimer'}</p>
          <p className="text-white/75 text-[12px] leading-relaxed">{t('aboutDisclaimer')}</p>
        </div>

        {/* 💙 Soutenir */}
        <div className="bg-white/15 rounded-3xl px-5 py-4 mb-3 slide-in stagger-3">
          <p className="text-white font-bold text-[13px] mb-2">💙 {t('aboutDonateTitle')}</p>
          <p className="text-white/80 text-[12px] leading-relaxed mb-3">{t('aboutDonateText')}</p>
          <a href={DONATE_URL} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full text-[13px] font-bold no-underline active:scale-[0.97] transition-transform"
            style={{ background: '#FFDD00', color: '#1a1a1a' }}>
            {t('aboutDonateBtn')}
          </a>
        </div>

        {/* 📲 Partager l'app */}
        <div className="bg-white/15 rounded-3xl px-5 py-4 mb-3 slide-in stagger-4">
          <p className="text-white font-bold text-[13px] mb-2">📲 {t('aboutShareTitle')}</p>
          <p className="text-white/80 text-[12px] leading-relaxed mb-4">{t('aboutShareText')}</p>
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-2xl p-2 flex-shrink-0">
              <AppQRCode size={100} />
            </div>
            <div className="flex-1">
              <p className="text-white/60 text-[10px] mb-3 leading-relaxed">
                {lang === 'fr'
                  ? 'Scanne le QR code\nou partage directement :'
                  : 'Scan the QR code\nor share directly:'}
              </p>
              <button onClick={handleShare}
                className="w-full py-2.5 rounded-full text-[13px] font-bold text-white border-2 border-white/50 bg-white/20 active:scale-[0.97] transition-transform">
                {t('aboutShareBtn')} ↗
              </button>
            </div>
          </div>
        </div>

        {/* 💌 Écris-moi un mot */}
        <div className="bg-white/15 rounded-3xl px-5 py-4 mb-3 slide-in">
          <p className="text-white font-bold text-[13px] mb-1">
            💌 {lang === 'fr' ? 'Écris-moi un mot' : 'Send me a message'}
          </p>
          <p className="text-white/70 text-[11px] leading-relaxed mb-3">
            {lang === 'fr'
              ? 'Un mot de soutien, une idée, un bug à signaler — je lis tout !'
              : 'A kind word, an idea, a bug report — I read everything!'}
          </p>
          {/* Sélecteur de type */}
          <div className="flex gap-2 mb-3">
            {[
              { key: 'support', icon: '💙', label: lang === 'fr' ? 'Soutien' : 'Support' },
              { key: 'suggest', icon: '💡', label: lang === 'fr' ? 'Suggestion' : 'Suggestion' },
              { key: 'bug',     icon: '🐛', label: lang === 'fr' ? 'Bug' : 'Bug' },
            ].map(opt => (
              <button key={opt.key} onClick={() => setFeedbackType(opt.key)}
                className={`flex-1 py-2 rounded-2xl text-[11px] font-bold transition-all duration-200 border ${feedbackType === opt.key ? 'bg-white text-[#FF7040] border-white' : 'bg-white/10 text-white/70 border-white/25'}`}>
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
          <textarea
            value={feedbackMsg}
            onChange={e => setFeedbackMsg(e.target.value)}
            placeholder={lang === 'fr' ? 'Ton message…' : 'Your message…'}
            rows={3}
            className="w-full bg-white/90 rounded-2xl px-4 py-3 text-[13px] text-[#555] outline-none border-none resize-none mb-3"
          />
          {feedbackSent ? (
            <p className="text-center text-white font-bold text-[13px] py-2">
              {lang === 'fr' ? '✅ Merci beaucoup !' : '✅ Thank you so much!'}
            </p>
          ) : sendError ? (
            <p className="text-center text-red-300 text-[12px] py-2">
              {lang === 'fr' ? '❌ Erreur d\'envoi, réessaie.' : '❌ Send failed, please retry.'}
            </p>
          ) : (
            <button onClick={handleSendFeedback}
              className="w-full py-2.5 rounded-full text-[13px] font-bold text-[#FF7040] bg-white active:scale-[0.97] transition-transform">
              {lang === 'fr' ? 'Envoyer ✉️' : 'Send ✉️'}
            </button>
          )}
        </div>

        {/* Version */}
        <div className="bg-white/10 rounded-3xl px-5 py-4 mb-4 text-center">
          <p className="text-white font-bold text-[15px] mb-1">{t('aboutMadeWith')}</p>
          <p className="text-white/50 text-[11px]">{t('aboutVersion')}</p>
        </div>

        <button onClick={() => navigate(-1)}
          className="w-full py-2.5 rounded-full text-white font-bold text-[14px] bg-white/20 border-2 border-white/40 active:scale-[1.02] transition-transform">
          ← {lang === 'fr' ? 'Retour' : 'Back'}
        </button>
      </div>
      </div>
    </div>
  )
}
