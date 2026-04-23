import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { getAvatar } from '../lib/badges'

export default function Drawer({ open, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile, signOut } = useAuth()
  const { t } = useLang()

  const navItems = [
    { icon: '😊', label: t('navMood'),     path: '/mood'     },
    { icon: '📅', label: t('navCalendar'), path: '/calendar' },
    { icon: '📊', label: t('navStats'),    path: '/stats'    },
    { icon: '📈', label: t('navChart'),    path: '/chart'    },
    { icon: '💬', label: t('navConseil'),    path: '/conseil'    },
    { icon: '🎧', label: t('navMeditation'),path: '/meditation' },
    { icon: '🆘', label: t('navCrisis'),   path: '/crisis', crisis: true },
    { icon: '👤', label: t('navAccount'),  path: '/account'  },
    { icon: 'ℹ️', label: t('navAbout'),    path: '/about'    },
  ]

  async function handleLogout() {
    onClose()
    await signOut()
    navigate('/')
  }

  function handleNav(path) {
    onClose()
    setTimeout(() => navigate(path), 280)
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${open ? 'bg-black/30 pointer-events-auto' : 'bg-transparent pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-[78%] max-w-[320px] z-50 flex flex-col rounded-tl-[36px] rounded-bl-[36px] transition-transform duration-[350ms] ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ background: 'var(--drawer-bg)' }}
      >
        <div className="flex items-center gap-3 px-5 pt-14 pb-5 border-b border-white/20">
          <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-[26px]">
            {getAvatar(profile?.avatar ?? 'starter')}
          </div>
          <div>
            <p className="text-white font-bold text-[15px]">{profile?.prenom ?? user?.email ?? '...'}</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1 px-4 py-4 flex-1">
          {navItems.map(item => (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={`flex items-center gap-3 px-3 py-3 rounded-2xl text-[13px] font-semibold transition-all duration-200 text-left w-full ${
                item.crisis
                  ? 'bg-white/20 text-white border border-white/30 mt-1'
                  : location.pathname === item.path
                    ? 'bg-white/25 text-white'
                    : 'text-white/80 hover:bg-white/18 hover:text-white'
              }`}
            >
              <span className="w-6 text-center text-[17px]">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-4 pb-8 pt-3 border-t border-white/18">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 rounded-2xl text-[13px] font-semibold text-white/50 hover:bg-white/10 hover:text-white/80 transition-all w-full"
          >
            <span className="w-6 text-center text-[17px]">🚪</span>
            {t('navLogout')}
          </button>
        </div>
      </div>
    </>
  )
}
