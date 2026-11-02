import { useEffect, useState } from 'react'
import { IMG, myServicesFor, recommend, whereToWatch } from '../tmdb.js'
import { RATINGS, keyOf, pickDisliked } from '../library.js'
import TitleCard, { Grid, ProviderLogos, Skeleton } from './TitleCard.jsx'
import { ServiceBadges } from './ServiceLogo.jsx'
import KindFilter from './KindFilter.jsx'

// "Because you liked X" page for a single title.
export default function Recommendations({ seed, region, serviceIds, library, onRate, onSelect, onBack }) {
  const [state, setState] = useState({ loading: true })
  const [seedWhere, setSeedWhere] = useState(null)
  const [showElsewhere, setShowElsewhere] = useState(false)
  const [kind, setKind] = useState('all')

  useEffect(() => {
    let alive = true
    setState({ loading: true })
    setSeedWhere(null)
    setShowElsewhere(false)
    window.scrollTo({ top: 0 })
    recommend(seed, { region, serviceIds, exclude: new Set(Object.keys(library)), disliked: pickDisliked(library) })
      .then((r) => alive && setState({ loading: false, ...r }))
      .catch((e) => alive && setState({ loading: false, error: e.message }))
    whereToWatch(seed.type, seed.id, region)
      .then((w) => alive && setSeedWhere(w))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [seed.type, seed.id, region, serviceIds.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps

  const keep = (t) => !library[keyOf(t)] && (kind === 'all' || t.type === kind)
  const onYours = (state.onYours || []).filter(keep)
  const elsewhere = (state.elsewhere || []).filter(keep)
  const seedOnYours = seedWhere ? myServicesFor(seedWhere, serviceIds) : []
  const seedRating = library[keyOf(seed)]?.rating

  return (
    <div>
      <div className="relative overflow-hidden">
        {seed.backdrop && <img src={`${IMG}/w1280${seed.backdrop}`} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75" />
        <div className="relative mx-auto flex max-w-6xl gap-5 px-4 py-6">
          {seed.poster && <img src={`${IMG}/w185${seed.poster}`} alt="" className="hidden w-28 shrink-0 rounded-xl shadow-lg sm:block" />}
          <div className="min-w-0">
            <button onClick={onBack} className="text-sm text-zinc-400 hover:text-zinc-200">
              ← Back
            </button>
            <p className="mt-3 text-xs uppercase tracking-[.25em] text-amber-200/70">Because you liked</p>
            <h1 className="font-display text-2xl font-semibold sm:text-3xl">
              {seed.title} {seed.year && <span className="font-sans text-xl font-normal text-zinc-400">({seed.year})</span>}
            </h1>
            {state.seed?.genres?.length > 0 && <p className="mt-1 text-sm text-zinc-400">{state.seed.genres.map((g) => g.name).join(' · ')}</p>}
            {seedWhere && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-300">
                {seedOnYours.length ? (
                  <>
                    <span>Watch it on</span>
                    <ServiceBadges services={seedOnYours} />
                  </>
                ) : seedWhere.included.length ? (
                  <>
                    <span className="text-zinc-400">Not on your services — streams on</span>
                    <ProviderLogos providers={seedWhere.included} />
                  </>
                ) : (
                  <span className="text-zinc-400">Not streaming in your country right now</span>
                )}
              </div>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-zinc-400">Seen it?</span>
              {Object.entries(RATINGS).map(([k, r]) => (
                <button
                  key={k}
                  onClick={() => onRate(seed, seedRating === k ? null : k)}
                  className={`rounded-full px-3 py-1 text-sm transition ${seedRating === k ? 'bg-amber-300 text-black' : 'bg-zinc-900 hover:bg-zinc-800'}`}
                >
                  {r.emoji} {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-16">
        <KindFilter kind={kind} setKind={setKind} />
        {state.loading && <Skeleton />}
        {state.error && <p className="mt-4 rounded-lg bg-red-950 p-4 text-red-200">{state.error}</p>}

        {!state.loading && !state.error && (
          <>
            <h2 className="mt-6 text-lg font-semibold">
              On your services <span className="text-zinc-500">({onYours.length})</span>
            </h2>
            {onYours.length === 0 ? (
              <p className="mt-2 text-zinc-400">Nothing similar is on your services right now. Check below, or add a service.</p>
            ) : (
              <Grid>
                {onYours.map((t) => (
                  <TitleCard key={keyOf(t)} title={t} services={t.yourServices} onSelect={onSelect} onRate={onRate} />
                ))}
              </Grid>
            )}
            {elsewhere.length > 0 && (
              <div className="mt-12">
                <button onClick={() => setShowElsewhere((s) => !s)} className="text-lg font-semibold hover:text-amber-200">
                  {showElsewhere ? '▾' : '▸'} Not on your services <span className="text-zinc-500">({elsewhere.length})</span>
                </button>
                {showElsewhere && (
                  <Grid>
                    {elsewhere.map((t) => (
                      <TitleCard key={keyOf(t)} title={t} providers={t.where.included} onSelect={onSelect} onRate={onRate} dim />
                    ))}
                  </Grid>
                )}
              </div>
            )}
          </>
        )}
        <p className="mt-12 text-xs text-zinc-600">Tip: tap any poster to get recommendations based on that one instead.</p>
      </div>
    </div>
  )
}
