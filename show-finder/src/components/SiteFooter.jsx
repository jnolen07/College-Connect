import Logo from './Logo.jsx'

export default function SiteFooter({ compact }) {
  const year = new Date().getFullYear()
  const links = [
    ['How it works', '#/welcome/how'],
    ['FAQ', '#/welcome/faq'],
    ['About', '#/about'],
    ['Privacy', '#/privacy'],
  ]
  return (
    <footer className="border-t border-white/[.06] bg-[var(--bg)]">
      <div className={`mx-auto max-w-6xl px-4 ${compact ? 'py-8' : 'py-12'}`}>
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <Logo onClick={() => (window.location.hash = '#/')} />
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Find shows and movies like the ones you love — on the streaming services you already pay for.
            </p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
            {links.map(([label, href]) => (
              <a key={href} href={href} className="text-zinc-400 transition hover:text-white">
                {label}
              </a>
            ))}
          </nav>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-white/[.06] pt-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} ShowFinder. Free to use, no account needed.</p>
          <p>
            Data from{' '}
            <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:text-zinc-300 hover:underline">
              TMDB
            </a>{' '}
            · Streaming availability by JustWatch. This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>
      </div>
    </footer>
  )
}
