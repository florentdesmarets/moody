import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import BgBlobs from '../components/BgBlobs'
import { useLang } from '../context/LangContext'
import { useAuth } from '../context/AuthContext'

export default function Crisis() {
  const navigate = useNavigate()
  const { t } = useLang()
  const { profile, updateProfile } = useAuth()
  const [editContact, setEditContact] = useState(false)
  const [contactName, setContactName] = useState(profile?.contact_urgence_nom ?? '')
  const [contactPhone, setContactPhone] = useState(profile?.contact_urgence_tel ?? '')

  async function handleSaveContact() {
    await updateProfile({ contact_urgence_nom: contactName, contact_urgence_tel: contactPhone })
    setEditContact(false)
  }

  const hasContact = profile?.contact_urgence_tel

  return (
    <div className="relative overflow-hidden flex flex-col px-6 pt-12 pb-8 min-h-[100dvh]"
      style={{ background: 'linear-gradient(160deg, #1a0a0a 0%, #8B1A1A 50%, #C0392B 100%)' }}>
      <BgBlobs />
      <AppHeader />
      <div className="relative z-10 overflow-y-auto no-scrollbar flex-1">
        <div className="text-center mb-5 fade-in">
          <span className="text-[52px] pop-in inline-block mb-2">🆘</span>
          <h1 className="text-white font-extrabold text-[20px]">{t('crisisTitle')}</h1>
          <p className="text-white/75 text-[13px] mt-1">{t('crisisSub')}</p>
        </div>

        <div className="flex flex-col gap-2 mb-4 fade-in stagger-1">
          {t('crisisNumbers').map((item, i) => (
            <a key={i} href={`tel:${item.number}`}
              className="flex items-center justify-between bg-white/15 rounded-2xl px-4 py-3 no-underline active:scale-[0.98] transition-transform"
              style={{ animationDelay: `${i * 0.06}s` }}>
              <div>
                <p className="text-white font-bold text-[14px]">{item.label}</p>
                <p className="text-white/60 text-[11px]">{item.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-extrabold text-[18px]">{item.number}</span>
                <span className="bg-white/25 rounded-full px-3 py-1 text-white text-[12px] font-bold border border-white/40">
                  {t('crisisCallBtn')}
                </span>
              </div>
            </a>
          ))}
        </div>

        <div className="bg-white/12 rounded-2xl px-4 py-4 mb-4 fade-in stagger-2">
          <p className="text-white font-bold text-[13px] mb-3">💙 {t('crisisEmergencyContact')}</p>
          {!editContact ? (
            hasContact ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold text-[14px]">{profile.contact_urgence_nom || '—'}</p>
                  <p className="text-white/70 text-[13px]">{profile.contact_urgence_tel}</p>
                </div>
                <div className="flex gap-2">
                  <a href={`tel:${profile.contact_urgence_tel}`}
                    className="bg-white/25 rounded-full px-4 py-2 text-white text-[12px] font-bold border border-white/40 no-underline">
                    {t('crisisCallBtn')} 📞
                  </a>
                  <button onClick={() => setEditContact(true)}
                    className="text-white/60 text-[11px] bg-transparent border-none cursor-pointer">
                    ✏️
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setEditContact(true)}
                className="w-full py-2.5 rounded-full text-white/80 text-[13px] font-bold bg-white/15 border border-white/25 cursor-pointer">
                + {t('crisisAddContact')}
              </button>
            )
          ) : (
            <div className="flex flex-col gap-2">
              <input type="text" placeholder={t('crisisContactName')} value={contactName}
                onChange={e => setContactName(e.target.value)}
                className="w-full bg-white/20 rounded-full px-4 py-2 text-[13px] text-white placeholder-white/50 outline-none border border-white/30" />
              <input type="tel" placeholder={t('crisisContactPhone')} value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                className="w-full bg-white/20 rounded-full px-4 py-2 text-[13px] text-white placeholder-white/50 outline-none border border-white/30" />
              <div className="flex gap-2">
                <button onClick={() => setEditContact(false)}
                  className="flex-1 py-2 rounded-full text-[12px] font-bold text-white/70 bg-white/10 border border-white/20 cursor-pointer">
                  Annuler
                </button>
                <button onClick={handleSaveContact}
                  className="flex-1 py-2 rounded-full text-[12px] font-bold text-white bg-white/30 border border-white/50 cursor-pointer">
                  Enregistrer
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white/12 rounded-2xl px-4 py-4 mb-4 fade-in stagger-3">
          <p className="text-white font-bold text-[13px] mb-1">📚 {t('crisisResourcesTitle')}</p>
          <p className="text-white/55 text-[11px] mb-3">{t('crisisResourcesSub')}</p>
          {t('crisisResources').map((r, i) => (
            <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between py-2.5 border-b border-white/10 last:border-0 no-underline">
              <p className="text-white/85 text-[13px]">{r.label}</p>
              <span className="text-white/50 text-[11px]">↗</span>
            </a>
          ))}
        </div>

        <button onClick={() => navigate(-1)}
          className="w-full py-2.5 rounded-full text-white/70 text-[13px] font-bold bg-white/10 border border-white/20 fade-in stagger-4">
          ← Retour
        </button>
      </div>
    </div>
  )
}
