export default function BgBlobs() {
  return (
    <>
      {/* Overlay sombre pour les thèmes clairs — améliore le contraste du texte blanc */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'var(--bg-overlay)', zIndex: 0 }} />

      {/* Bulles mobiles — dans le contenu centré */}
      <div className="blob w-44 h-44 -top-10 -right-10"
        style={{ background: 'var(--blob1)', animationDuration: '9s', animationDelay: '0s' }} />
      <div className="blob w-36 h-36 top-20 -left-14"
        style={{ background: 'var(--blob2)', animationDuration: '12s', animationDelay: '-4s' }} />
      <div className="blob w-32 h-32 bottom-4 -right-6"
        style={{ background: 'var(--blob3)', animationDuration: '15s', animationDelay: '-8s' }} />

      {/* Bulles desktop uniquement — zones latérales gauche */}
      <div className="blob hidden lg:block" style={{
        width: 380, height: 380, top: '6%', left: '-3%',
        background: 'var(--blob1)', opacity: 0.16,
        animationDuration: '14s', animationDelay: '-3s',
      }} />
      <div className="blob hidden lg:block" style={{
        width: 220, height: 220, top: '52%', left: '6%',
        background: 'var(--blob3)', opacity: 0.13,
        animationDuration: '11s', animationDelay: '-7s',
      }} />
      <div className="blob hidden lg:block" style={{
        width: 130, height: 130, bottom: '12%', left: '14%',
        background: 'var(--blob2)', opacity: 0.14,
        animationDuration: '18s', animationDelay: '-5s',
      }} />
      <div className="blob hidden lg:block" style={{
        width: 70, height: 70, top: '38%', left: '2%',
        background: 'var(--blob1)', opacity: 0.18,
        animationDuration: '8s', animationDelay: '-11s',
      }} />

      {/* Bulles desktop uniquement — zones latérales droite */}
      <div className="blob hidden lg:block" style={{
        width: 340, height: 340, top: '22%', right: '-2%',
        background: 'var(--blob2)', opacity: 0.14,
        animationDuration: '13s', animationDelay: '-9s',
      }} />
      <div className="blob hidden lg:block" style={{
        width: 200, height: 200, bottom: '18%', right: '7%',
        background: 'var(--blob1)', opacity: 0.12,
        animationDuration: '10s', animationDelay: '-2s',
      }} />
      <div className="blob hidden lg:block" style={{
        width: 110, height: 110, top: '7%', right: '15%',
        background: 'var(--blob3)', opacity: 0.15,
        animationDuration: '16s', animationDelay: '-6s',
      }} />
      <div className="blob hidden lg:block" style={{
        width: 60, height: 60, top: '65%', right: '3%',
        background: 'var(--blob2)', opacity: 0.20,
        animationDuration: '9s', animationDelay: '-13s',
      }} />
    </>
  )
}
