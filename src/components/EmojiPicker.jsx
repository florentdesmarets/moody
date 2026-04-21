const EMOJIS = ['😭', '😔', '😕', '😐', '🙂', '😊', '😄']

export default function EmojiPicker({ selected, onSelect }) {
  return (
    <div className="flex justify-center items-end gap-1 py-6">
      {EMOJIS.map((emoji, i) => {
        const isSelected = selected === i + 1
        return (
          <button key={i} onClick={() => onSelect(i + 1, emoji)}
            className="border-none bg-transparent cursor-pointer leading-none w-[13%]"
            style={{
              fontSize: isSelected ? '40px' : '26px',
              transform: isSelected ? 'translateY(-8px)' : 'translateY(0)',
              filter: isSelected ? 'drop-shadow(0 8px 20px rgba(255,200,60,0.6))' : 'drop-shadow(0 3px 8px rgba(0,0,0,0.15))',
              transition: 'font-size 0.2s ease, transform 0.2s ease, filter 0.2s ease',
            }}>
            {emoji}
          </button>
        )
      })}
    </div>
  )
}
