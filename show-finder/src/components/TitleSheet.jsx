import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { IMG, titleInfo } from '../tmdb.js'
import { RATINGS, keyOf } from '../library.js'
import WhereToWatch from './WhereToWatch.jsx'
import { ArrowRight, X } from 'lucide-react'

// Details for one title: what it is, every place to watch it, rate it, or find more like it.
export default function TitleSheet({ item, region, serviceIds, library, onRate, onClose, onMoreLike }) {
  const [info, setInfo] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    titleInfo(item.type, item.id, region)
      .then((d) => alive && setInfo(d))
      .catch((e) => alive && setError(e.message))
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      alive = false
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [item.type, item.id, region]) // eslint-disable-line react-hooks/exhaustive-deps

  const t = info || item
  const rating = library[keyOf(item)]?.rating
  const meta = [
    t.year,
    t.type === 'tv' ? 'TV show' : 'Movie',
    info?.seasons ? `${info.seasons} season${info.seasons === 1 ? '' : 's'}` : null,
    info?.runtime && t.type === 'movie' ? `${Math.floor(info.runtime / 60)}h ${info.runtime % 60}m` : null,
    t.rating > 0 ? `★ ${t.rating.toFixed(1)}` : null,
  ].filter(Boolean)

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.title}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-[var(--surface)] shadow-2xl sm:max-w-2xl sm:rounded-3xl"
      >
        <div className="relative h-40 overflow-hidden sm:h-52">
          {t.backdrop && <img src={`${IMG}/w780${t.backdrop}`} alt="" className="h-full w-full object-cover opacity-60" />}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-[var(--surface)]/40" />
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-lg hover:bg-black"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative -mt-20 px-5 pb-6 sm:px-7">
          <div className="flex gap-4">
            {t.poster && <img src={`${IMG}/w185${t.poster}`} alt="" className="w-24 shrink-0 rounded-xl shadow-xl ring-1 ring-white/10 sm:w-28" />}
            <div className="min-w-0 self-end">
              <h2 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">{t.title}</h2>
              <p className="mt-1 text-sm text-zinc-400">{meta.join(' · ')}</p>
              {info?.genres?.length > 0 && <p className="mt-0.5 text-xs text-zinc-500">{info.genres.map((g) => g.name).join(' · ')}</p>}
            </div>
          </div>

          {t.overview && <p className="mt-4 text-sm leading-relaxed text-zinc-300">{t.overview}</p>}

          <h3 className="mt-7 text-lg font-semibold">Where to watch</h3>
          <div className="mt-3">
            {error && <p className="text-sm text-red-300">{error}</p>}
            {!info && !error && <div className="h-28 animate-pulse rounded-xl bg-zinc-900" />}
            {info && <WhereToWatch title={info} where={info.where} serviceIds={serviceIds} />}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-2 border-t border-white/10 pt-5">
            <span className="mr-1 text-sm text-zinc-400">Seen it?</span>
            {Object.entries(RATINGS).map(([k, r]) => (
              <button
                key={k}
                onClick={() => onRate(t, rating === k ? null : k)}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${rating === k ? 'border-amber-300 bg-amber-300 text-black' : 'border-white/10 bg-white/[.03] hover:border-white/25'}`}
              >
                {r.emoji} {r.label}
              </button>
            ))}
          </div>
          <button className="btn-gold mt-5 w-full sm:w-auto" onClick={() => onMoreLike(t)}>
            More like this <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
