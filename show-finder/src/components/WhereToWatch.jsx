import { useState } from 'react'
import { Smartphone, Tv } from 'lucide-react'
import { IMG } from '../tmdb.js'
import { serviceFor } from '../services.js'
import { watchUrl } from '../watchLinks.js'
import { load, save } from '../storage.js'
import SendToTv from './SendToTv.jsx'

// Every way to watch a title, grouped. "This device" opens the service here; "TV" shows the
// quickest way to get it playing on the viewer's TV.
export default function WhereToWatch({ title, where, serviceIds }) {
  const [watchOn, setWatchOn] = useState(() => load('watchOn', 'device'))
  const [tvFor, setTvFor] = useState(null) // provider being sent to the TV
  if (!where) return null
  const mine = new Set(serviceIds)
  const isMine = (p) => mine.has(serviceFor(p)?.id)

  const included = [...where.stream, ...where.free]
  const yours = included.filter(isMine)
  const otherStream = where.stream.filter((p) => !isMine(p))
  const free = where.free.filter((p) => !isMine(p))

  // Merge rent + buy into one list so each store appears once.
  const stores = new Map()
  for (const p of where.rent) stores.set(p.id, { ...p, rent: true })
  for (const p of where.buy) stores.set(p.id, { ...(stores.get(p.id) || p), buy: true })
  const rentBuy = [...stores.values()]

  const nothing = !included.length && !rentBuy.length
  const link = (p) => watchUrl(p, title.title, title.type, where.link)
  const pick = (mode) => {
    setWatchOn(mode)
    save('watchOn', mode)
  }
  const onTv = watchOn === 'tv'
  const act = { onTv, link, sendToTv: setTvFor }

  return (
    <div className="space-y-5">
      {!nothing && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-zinc-400">Watch on</span>
          <div role="radiogroup" aria-label="Watch on" className="inline-flex rounded-full border border-white/10 bg-white/[.03] p-1">
            {[
              ['device', 'This device', Smartphone],
              ['tv', 'TV', Tv],
            ].map(([k, label, Icon]) => (
              <button
                key={k}
                role="radio"
                aria-checked={watchOn === k}
                onClick={() => pick(k)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  watchOn === k ? 'bg-white text-black shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
        </div>
      )}
      {nothing && (
        <p className="rounded-xl bg-zinc-900 p-4 text-sm text-zinc-400">
          Not available to stream, rent or buy in your country right now.
        </p>
      )}
      <Section {...act} label="On your services" hint="Included with what you already have" items={yours} highlight />
      <Section {...act} label="Stream" hint="With a subscription" items={otherStream} />
      <Section {...act} label="Free" hint="Free or with ads" items={free} />
      <Section
        {...act}
        label="Rent or buy"
        items={rentBuy}
        note={(p) => (p.rent && p.buy ? 'Rent · Buy' : p.rent ? 'Rent' : 'Buy')}
      />
      {where.link && (
        <a href={where.link} target="_blank" rel="noopener noreferrer" className="inline-block text-xs text-zinc-500 underline-offset-4 hover:text-zinc-300 hover:underline">
          Prices and every option on TMDB ↗
        </a>
      )}
      {tvFor && (
        <SendToTv
          provider={tvFor}
          serviceName={serviceFor(tvFor)?.name}
          title={title}
          phoneLink={link(tvFor)}
          onClose={() => setTvFor(null)}
        />
      )}
    </div>
  )
}

function Section({ label, hint, items, link, note, highlight, onTv, sendToTv }) {
  if (!items.length) return null
  return (
    <section>
      <h3 className={`text-xs font-semibold uppercase tracking-[.18em] ${highlight ? 'text-amber-200' : 'text-zinc-400'}`}>
        {label}
        {hint && <span className="ml-2 font-normal normal-case tracking-normal text-zinc-500">{hint}</span>}
      </h3>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map((p) => (
          <Row
            key={p.id}
            onTv={onTv}
            href={link(p)}
            onSendToTv={() => sendToTv(p)}
            className={`group flex items-center gap-3 rounded-xl border p-2.5 pr-3 transition ${
              highlight
                ? 'border-amber-300/50 bg-amber-300/10 hover:border-amber-300 hover:bg-amber-300/15'
                : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-600 hover:bg-zinc-900'
            }`}
          >
            {p.logo ? (
              <img src={`${IMG}/w92${p.logo}`} alt="" className="h-10 w-10 shrink-0 rounded-lg" />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-sm font-bold">{p.name[0]}</span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{p.name}</span>
              {note && <span className="block text-xs text-zinc-500">{note(p)}</span>}
            </span>
            <span className={`whitespace-nowrap text-xs font-semibold ${highlight ? 'text-amber-200' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
              {onTv ? 'Send to TV' : 'Watch ↗'}
            </span>
          </Row>
        ))}
      </div>
    </section>
  )
}

// A row is a link on this device, or a button that opens the Send to TV steps.
function Row({ onTv, href, onSendToTv, className, children }) {
  if (onTv) {
    return (
      <button type="button" onClick={onSendToTv} className={`w-full text-left ${className}`}>
        {children}
      </button>
    )
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  )
}
