import { Bookmark, Search, Sparkles } from 'lucide-react'
import { serviceById } from '../services.js'
import Logo from './Logo.jsx'
import ResetButton from './ResetButton.jsx'

const TABS = [
  ['home', 'For you', '#/', Sparkles],
  ['search', 'Search', '#/search', Search],
  ['library', 'My shows', '#/library', Bookmark],
]
const go = (hash) => (window.location.hash = hash)

export default function AppHeader({ page, libCount, serviceIds, onEditServices }) {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/[.06] bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
          <Logo onClick={() => go('#/')} />
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {TABS.map(([id, label, hash, Icon]) => (
              <button
                key={id}
                onClick={() => go(hash)}
                aria-current={page === id ? 'page' : undefined}
                className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  page === id ? 'text-white' : 'text-zinc-400 hover:bg-white/[.04] hover:text-zinc-200'
                }`}
              >
                <Icon size={16} className={page === id ? 'text-amber-300' : ''} />
                {label}
                {id === 'library' && libCount > 0 && <Count n={libCount} />}
                {page === id && <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-amber-300" />}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <ResetButton count={libCount} />
            <ServicesPill serviceIds={serviceIds} onClick={onEditServices} />
          </div>
        </div>
      </header>

      {/* Phone tab bar */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-white/[.08] bg-black/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <div className="grid grid-cols-3">
          {TABS.map(([id, label, hash, Icon]) => (
            <button
              key={id}
              onClick={() => go(hash)}
              aria-current={page === id ? 'page' : undefined}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${page === id ? 'text-amber-200' : 'text-zinc-500'}`}
            >
              <span className="relative">
                <Icon size={22} strokeWidth={page === id ? 2.2 : 1.8} />
                {id === 'library' && libCount > 0 && (
                  <span className="absolute -right-3 -top-1.5">
                    <Count n={libCount} />
                  </span>
                )}
              </span>
              {label}
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}

function Count({ n }) {
  return <span className="rounded-full bg-white/10 px-1.5 py-px text-[10px] font-semibold text-zinc-300">{n}</span>
}

function ServicesPill({ serviceIds, onClick }) {
  return (
    <button
      onClick={onClick}
      title="Change your services"
      className="flex items-center gap-2 rounded-full border border-white/10 py-1 pl-1 pr-3 text-sm text-zinc-300 transition hover:border-white/25 hover:text-white"
    >
      <span className="flex -space-x-1.5">
        {serviceIds.slice(0, 3).map((id) => {
          const s = serviceById[id]
          return (
            <span key={id} className="h-6 w-6 overflow-hidden rounded-full ring-2 ring-black" style={{ background: s.bg }}>
              {s.path ? (
                <svg viewBox="0 0 24 24" className="h-full w-full p-1" fill={s.fg}>
                  <path d={s.path} />
                </svg>
              ) : (
                <span className="flex h-full items-center justify-center text-[9px] font-bold text-white">{s.name[0]}</span>
              )}
            </span>
          )
        })}
      </span>
      <span className="hidden sm:inline">My services</span>
      {serviceIds.length > 3 && <span className="text-xs text-zinc-500">+{serviceIds.length - 3}</span>}
    </button>
  )
}
