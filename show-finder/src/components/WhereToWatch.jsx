import { IMG } from '../tmdb.js'
import { serviceFor } from '../services.js'
import { watchUrl } from '../watchLinks.js'

// Every way to watch a title, grouped; each service is a link that opens it on that platform.
export default function WhereToWatch({ title, where, serviceIds }) {
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

  return (
    <div className="space-y-5">
      {nothing && (
        <p className="rounded-xl bg-zinc-900 p-4 text-sm text-zinc-400">
          Not available to stream, rent or buy in your country right now.
        </p>
      )}
      <Section label="On your services" hint="Included with what you already have" items={yours} link={link} highlight />
      <Section label="Stream" hint="With a subscription" items={otherStream} link={link} />
      <Section label="Free" hint="Free or with ads" items={free} link={link} />
      <Section
        label="Rent or buy"
        items={rentBuy}
        link={link}
        note={(p) => (p.rent && p.buy ? 'Rent · Buy' : p.rent ? 'Rent' : 'Buy')}
      />
      {where.link && (
        <a href={where.link} target="_blank" rel="noopener noreferrer" className="inline-block text-xs text-zinc-500 underline-offset-4 hover:text-zinc-300 hover:underline">
          Prices and every option on TMDB ↗
        </a>
      )}
    </div>
  )
}

function Section({ label, hint, items, link, note, highlight }) {
  if (!items.length) return null
  return (
    <section>
      <h3 className={`text-xs font-semibold uppercase tracking-[.18em] ${highlight ? 'text-amber-200' : 'text-zinc-400'}`}>
        {label}
        {hint && <span className="ml-2 font-normal normal-case tracking-normal text-zinc-500">{hint}</span>}
      </h3>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map((p) => (
          <a
            key={p.id}
            href={link(p)}
            target="_blank"
            rel="noopener noreferrer"
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
              Watch ↗
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}
