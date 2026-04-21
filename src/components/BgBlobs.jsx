export default function BgBlobs() {
  return (
    <>
      <div className="blob w-44 h-44 -top-10 -right-10"
        style={{ background: 'var(--blob1)', animationDuration: '9s', animationDelay: '0s' }} />
      <div className="blob w-36 h-36 top-20 -left-14"
        style={{ background: 'var(--blob2)', animationDuration: '12s', animationDelay: '-4s' }} />
      <div className="blob w-32 h-32 bottom-4 -right-6"
        style={{ background: 'var(--blob3)', animationDuration: '15s', animationDelay: '-8s' }} />
    </>
  )
}
