import { useState } from 'react'
import { IMG } from '../tmdb.js'
import { RATINGS } from '../library.js'
import { ServiceBadges } from './ServiceLogo.jsx'
import { Film, Star } from 'lucide-react'
import { groupBrands } from '../brands.js'

export function ProviderLogos({ providers: raw, max = 4 }) {
  if (!raw?.length) return null
  const providers = groupBrands(raw) // one logo per service, not one per tier/channel
  return (
    <div className="flex items-center gap-1">
      {providers.slice(0, max).map((p) => (
        <img key={p.id} src={`${IMG}/w45${p.logo}`} alt={p.name} title={p.name} className="h-6 w-6 rounded-md" />
      ))}
      {providers.length > max && <span className="text-xs text-zinc-400">+{providers.length - max}</span>}
    </div>
  )
}

/**
 * Poster card. Tap the poster -> onSelect (or open rating menu if no onSelect).
 * "Seen it?" opens a quick rating menu: Loved / Liked / Not for me.
 */
export default function TitleCard({ title, onSelect, services, providers, rating, onRate, because, dim }) {
  const [menu, setMenu] = useState(false)
  const r = rating && RATINGS[rating]

  const choose = (value) => {
    onRate(title, value)
    setMenu(false)
  }

  return (
    <div className={`group relative flex flex-col transition ${dim ? 'opacity-75 hover:opacity-100' : ''}`}>
      <div className="relative transition duration-300 group-hover:-translate-y-1">
        <button
          onClick={() => (onSelect ? onSelect(title) : setMenu(true))}
          className="block w-full text-left"
          title={onSelect ? `${title.title}: details & where to watch` : `Rate ${title.title}`}
        >
          <div
            className={`relative aspect-[2/3] overflow-hidden rounded-xl bg-[var(--surface-2)] shadow-lg shadow-black/40 ring-1 transition duration-300 group-hover:shadow-xl group-hover:shadow-black/60 ${
              r ? 'ring-2 ring-amber-300/70' : 'ring-white/[.08] group-hover:ring-white/20'
            }`}
          >
            {title.poster ? (
              <img src={`${IMG}/w342${title.poster}`} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-zinc-800 to-zinc-950 p-4 text-center">
                <Film size={22} className="text-zinc-600" />
                <span className="text-sm font-medium text-zinc-400">{title.title}</span>
              </div>
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />
            {title.rating > 0 && !r && (
              <span className="pointer-events-none absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/75 px-1.5 py-0.5 text-[11px] font-semibold backdrop-blur">
                <Star size={11} className="fill-amber-300 text-amber-300" /> {title.rating.toFixed(1)}
              </span>
            )}
          </div>
        </button>

        {r && !menu && (
          <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-black/80 px-2 py-0.5 text-xs">
            {r.emoji} {r.label}
          </span>
        )}

        {onRate && !menu && (
          <button
            onClick={() => setMenu(true)}
            className={`absolute bottom-2 right-2 rounded-full bg-black/80 px-2.5 py-1 text-xs font-medium backdrop-blur transition hover:bg-black ${
              r ? 'sm:opacity-0 sm:group-hover:opacity-100' : ''
            }`}
          >
            {r ? 'Change' : 'Seen it?'}
          </button>
        )}

        {menu && (
          <div className="absolute inset-0 flex flex-col justify-center gap-2 rounded-xl bg-black/85 p-3 backdrop-blur-sm">
            <p className="mb-1 text-center text-xs text-zinc-300">How was it?</p>
            {Object.entries(RATINGS).map(([k, v]) => (
              <button
                key={k}
                onClick={() => choose(k)}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  rating === k ? 'bg-amber-300 text-black' : 'bg-zinc-800 hover:bg-zinc-700'
                }`}
              >
                {v.emoji} {v.label}
              </button>
            ))}
            <div className="mt-1 flex justify-center gap-3 text-xs text-zinc-400">
              {rating && (
                <button onClick={() => choose(null)} className="hover:text-white">
                  Remove
                </button>
              )}
              <button onClick={() => setMenu(false)} className="hover:text-white">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2.5 line-clamp-2 text-sm font-medium leading-snug">{title.title}</div>
      <div className="mt-0.5 text-xs text-zinc-500">
        {[title.year, title.type === 'tv' ? 'TV show' : 'Movie'].filter(Boolean).join(' · ')}
      </div>
      {services?.length > 0 && (
        <div className="mt-1.5">
          <ServiceBadges services={services} />
        </div>
      )}
      {!services?.length && providers?.length > 0 && (
        <div className="mt-1.5">
          <ProviderLogos providers={providers} />
        </div>
      )}
      {because?.length > 0 && (
        <p className="mt-1.5 line-clamp-1 text-[11px] text-zinc-500" title={`Because you liked ${because.join(', ')}`}>
          Because you liked {because.slice(0, 2).join(' & ')}
        </p>
      )}
    </div>
  )
}

export function Grid({ children }) {
  return <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{children}</div>
}

export function Skeleton({ n = 12 }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="aspect-[2/3] animate-pulse rounded-xl bg-zinc-900" />
      ))}
    </div>
  )
}
