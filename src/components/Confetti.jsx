import { useMemo } from 'react'

const COLORS = ['#FF6B6B', '#FFE66D', '#C4A8FF', '#86efac', '#fde68a', '#fff', '#FF8C5A', '#4ECDC4']
const SHAPES = ['50%', '2px', '0']   // cercle, carré, triangle simulé

export default function Confetti({ active }) {
  const pieces = useMemo(() => (
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left:     Math.random() * 100,
      color:    COLORS[Math.floor(Math.random() * COLORS.length)],
      shape:    SHAPES[Math.floor(Math.random() * SHAPES.length)],
      delay:    Math.random() * 1.2,
      duration: 2 + Math.random() * 1.5,
      size:     6 + Math.random() * 7,
      rot:      Math.random() * 360,
      wiggle:   Math.random() * 0.8 + 0.5,
    }))
  ), [])

  if (!active) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
      {pieces.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: '-16px',
            width:  p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.shape,
            animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards,
                        confettiWiggle ${p.wiggle}s ease-in-out ${p.delay}s infinite`,
            transform: `rotate(${p.rot}deg)`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  )
}
