import { useEffect, useState } from 'react'
import { IMG, recommend, whereToWatch } from '../tmdb.js'
import { RATINGS, keyOf, pickDisliked } from '../library.js'
import TitleCard, { Grid, Skeleton } from './TitleCard.jsx'
import WhereToWatch from './WhereToWatch.jsx'
import KindFilter from './KindFilter.jsx'
import { Collapsible, ErrorNote, SectionTitle } from './Section.jsx'
import { ArrowLeft, ChevronDown } from 'lucide-react'

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
  const seedRating = library[keyOf(seed)]?.rating

  return (
    <div>
      <div className="relative overflow-hidden">
        {seed.backdrop && <img src={`${IMG}/w1280${seed.backdrop}`} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/80 to-[var(--bg)]/40" />
        <div className="relative mx-auto flex max-w-6xl gap-6 px-4 pb-8 pt-6 sm:pt-8">
          {seed.poster && <img src={`${IMG}/w342${seed.poster}`} alt="" className="hidden w-36 shrink-0 self-end rounded-xl shadow-2xl ring-1 ring-white/10 sm:block" />}
          <div className="min-w-0 self-end">
            <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white">
              <ArrowLeft size={16} /> Back
            </button>
            <p className="eyebrow mt-6">More like this</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              {seed.title} {seed.year && <span className="text-2xl font-normal text-zinc-500">({seed.year})</span>}
            </h1>
            {state.seed?.genres?.length > 0 && <p className="mt-1 text-sm text-zinc-400">{state.seed.genres.map((g) => g.name).join(' · ')}</p>}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-zinc-400">Seen it?</span>
              {Object.entries(RATINGS).map(([k, r]) => (
                <button
                  key={k}
                  onClick={() => onRate(seed, seedRating === k ? null : k)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${seedRating === k ? 'border-amber-300 bg-amber-300 text-black' : 'border-white/10 bg-white/[.03] hover:border-white/25'}`}
                >
                  {r.emoji} {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-16">
        {seedWhere && (
          <details open className="card group mb-2 p-5 sm:p-6">
            <summary className="flex cursor-pointer items-center justify-between gap-3 text-lg font-semibold">
              Where to watch {seed.title}
              <ChevronDown size={20} className="text-zinc-500 transition group-open:rotate-180" />
            </summary>
            <div className="mt-4">
              <WhereToWatch title={seed} where={seedWhere} serviceIds={serviceIds} />
            </div>
          </details>
        )}
        <KindFilter kind={kind} setKind={setKind} />
        {state.loading && <Skeleton />}
        {state.error && <ErrorNote>{state.error}</ErrorNote>}

        {!state.loading && !state.error && (
          <>
            <SectionTitle title="On your services" count={onYours.length} hint="Watch now — no new subscriptions" />
            {onYours.length === 0 ? (
              <p className="mt-3 text-zinc-400">Nothing similar is on your services right now. Check below, or add a service.</p>
            ) : (
              <Grid>
                {onYours.map((t) => (
                  <TitleCard key={keyOf(t)} title={t} services={t.yourServices} onSelect={onSelect} onRate={onRate} />
                ))}
              </Grid>
            )}
            {elsewhere.length > 0 && (
              <Collapsible
                title="Not on your services"
                count={elsewhere.length}
                hint="Worth knowing about"
                open={showElsewhere}
                onToggle={() => setShowElsewhere((s) => !s)}
              >
                <Grid>
                  {elsewhere.map((t) => (
                    <TitleCard key={keyOf(t)} title={t} providers={t.where.included} onSelect={onSelect} onRate={onRate} dim />
                  ))}
                </Grid>
              </Collapsible>
            )}
          </>
        )}
        <p className="mt-12 text-sm text-zinc-500">Tip: tap any poster to see where to watch it, or “More like this” to keep going.</p>
      </div>
    </div>
  )
}
