// Brand mark: a gold spotlight beam falling on a play button, plus the ShowFinder wordmark.
export function LogoMark({ className = 'h-8 w-8' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="sf-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6dc92" />
          <stop offset=".5" stopColor="#d4a73c" />
          <stop offset="1" stopColor="#8a6420" />
        </linearGradient>
        <linearGradient id="sf-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe7a8" stopOpacity=".55" />
          <stop offset="1" stopColor="#ffe7a8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill="#0b0b0e" />
      <path d="M27 6h10l15 44H12z" fill="url(#sf-beam)" />
      <circle cx="32" cy="40" r="15" fill="none" stroke="url(#sf-gold)" strokeWidth="3.5" />
      <path d="M28 33.5v13l11-6.5z" fill="url(#sf-gold)" />
    </svg>
  )
}

export default function Logo({ onClick, size = 'md' }) {
  const big = size === 'lg'
  return (
    <button onClick={onClick} className="group flex items-center gap-2.5" aria-label="ShowFinder home">
      <LogoMark className={big ? 'h-10 w-10' : 'h-8 w-8'} />
      <span className={`font-display font-extrabold tracking-wide ${big ? 'text-2xl' : 'text-xl'}`}>
        <span className="gold-text">ShowFinder</span>
      </span>
    </button>
  )
}
