const EMOJIS = ['😭', '😔', '😕', '😐', '🙂', '😊', '😄']

export default function EmojiPicker({ selected, onSelect }) {
  return (
    <div className="flex justify-center items-end gap-1 py-4">
      {EMOJIS.map((emoji, i) => {
        const level     = i + 1
        const isSelected = selected === level
        const isNear     = selected && Math.abs(selected - level) === 1

        return (
          <button
            key={i}
            onClick={() => onSelect(level, emoji)}
            className="border-none bg-transparent cursor-pointer leading-none flex-1 flex items-end justify-center"
            style={{
              fontSize:   isSelected ? '46px' : isNear ? '28px' : '26px',
              transform:  isSelected
                ? 'translateY(-10px) scale(1.08)'
                : isNear
                  ? 'translateY(-3px)'
                  : 'translateY(0)',
              filter: isSelected
                ? 'drop-shadow(0 10px 24px rgba(255,200,60,0.65))'
                : 'drop-shadow(0 2px 6px rgba(0,0,0,0.12))',
              opacity:     (!selected || isSelected) ? 1 : 0.55,
              transition:  'font-size 0.2s ease, transform 0.2s ease, filter 0.2s ease, opacity 0.2s ease',
              minHeight:   '56px',
            }}
          >
            {emoji}
          </button>
        )
      })}
    </div>
  )
}
