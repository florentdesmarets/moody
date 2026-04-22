import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Drawer from './Drawer'

export default function AppHeader() {
  const { profile } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      {/* Le div parent n'a PAS de z-index → pas de stacking context partagé */}
      <div className="flex justify-between items-center mb-5">
        {/* Texte à z-10 → sera recouvert par le backdrop (z-40) ✅ */}
        <span className="relative z-10 text-white text-[14px] font-bold">
          Hello {profile?.prenom ?? ''}
        </span>

        {/* Bouton à z-[60] → au-dessus du backdrop (z-40) ET du drawer (z-50) ✅ */}
        <button
          onClick={() => setDrawerOpen(v => !v)}
          className="relative z-[60] flex flex-col gap-1 p-1 bg-transparent border-none cursor-pointer"
          aria-label="Menu"
        >
          <span className={`block w-5 h-0.5 bg-white rounded transition-all duration-300 ${drawerOpen ? 'translate-y-1.5 rotate-45' : ''}`} />
          <span className={`block w-5 h-0.5 bg-white rounded transition-all duration-300 ${drawerOpen ? 'opacity-0 scale-x-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-white rounded transition-all duration-300 ${drawerOpen ? '-translate-y-1.5 -rotate-45' : ''}`} />
        </button>
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
