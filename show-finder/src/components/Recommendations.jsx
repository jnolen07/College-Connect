import { useEffect, useState } from 'react'
import { IMG, recommend, whereToWatch } from '../tmdb.js'
import TitleCard, { ProviderLogos } from './TitleCard.jsx'

export default function Recommendations({ seed, region, providerIds, seen, onSeen, onSelect, onBack }) {
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
    recommend(seed, { region, providerIds })
      .then((r) => alive && setState({ loading: false, ...r }))
      .catch((e) => alive && setState({ loading: false, error: e.message }))
    whereToWatch(seed.type, seed.id, region)
      .then((w) => alive && setSeedWhere(w))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [seed.type, seed.id, region, providerIds.join(',')])

  const mine = new Set(providerIds)
  const keep = (t) => !seen.has(`${t.type}:${t.id}`) && (kind === 'all' || t.type === kind)
  const onYours = (state.onYours || []).filter(keep)
  const elsewhere = (state.elsewhere || []).filter(keep)
  const seedOnYours = seedWhere?.included.filter((p) => mine.has(p.id)) || []

  return (
    <div>
      {/* Seed header */}
      <div className="relative overflow-hidden">
        {seed.backdrop && (
          <img src={`${IMG}/w1280${seed.backdrop}`} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70" />
        <div className="relative mx-auto flex max-w-6xl gap-5 px-4 py-6">
          {seed.poster && (
            <img src={`${IMG}/w185${seed.poster}`} alt="" className="hidden w-28 shrink-0 rounded-xl shadow-lg sm:block" />
          )}
          <div className="min-w-0">
            <button onClick={onBack} className="text-sm text-zinc-400 hover:text-zinc-200">← Back to search</button>
            <p className="mt-3 text-sm uppercase tracking-wide text-violet-400">Because you liked</p>
            <h1 className="text-2xl font-bold sm:text-3xl">
              {seed.title} {seed.year && <span className="font-normal text-zinc-400">({seed.year})</span>}
            </h1>
            {state.seed?.genres?.length > 0 && (
              <p className="mt-1 text-sm text-zinc-400">{state.seed.genres.map((g) => g.name).join(' · ')}</p>
            )}
            {seedWhere && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-300">
                {seedOnYours.length ? (
                  <>
                    <span>Watch it on</span>
                    <ProviderLogos providers={seedOnYours} />
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
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-4 flex gap-2">
          {[
            ['all', 'Everything'],
            ['tv', 'TV shows'],
            ['movie', 'Movies'],
          ].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={`rounded-full px-3 py-1 text-sm ${kind === k ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {state.loading && <Skeleton />}
        {state.error && <p className="rounded-lg bg-red-950 p-4 text-red-200">{state.error}</p>}

        {!state.loading && !state.error && (
          <>
            <h2 className="text-lg font-semibold">
              On your services <span className="text-zinc-500">({onYours.length})</span>
            </h2>
            {onYours.length === 0 ? (
              <p className="mt-2 text-zinc-400">
                Nothing similar is on your services right now. Check below for where else they stream, or add a service.
              </p>
            ) : (
              <Grid>
                {onYours.map((t) => (
                  <TitleCard key={`${t.type}:${t.id}`} title={t} providers={t.yourServices} onSelect={onSelect} onSeen={onSeen} />
                ))}
              </Grid>
            )}

            {elsewhere.length > 0 && (
              <div className="mt-10">
                <button onClick={() => setShowElsewhere((s) => !s)} className="text-lg font-semibold hover:text-violet-300">
                  {showElsewhere ? '▾' : '▸'} Not on your services{' '}
                  <span className="text-zinc-500">({elsewhere.length})</span>
                </button>
                {showElsewhere && (
                  <Grid>
                    {elsewhere.map((t) => (
                      <TitleCard
                        key={`${t.type}:${t.id}`}
                        title={t}
                        providers={t.where.included}
                        onSelect={onSelect}
                        onSeen={onSeen}
                        dim
                      />
                    ))}
                  </Grid>
                )}
              </div>
            )}
          </>
        )}
        <p className="mt-12 text-xs text-zinc-600">
          Tip: tap any result to get recommendations based on that one instead.
        </p>
      </div>
    </div>
  )
}

function Grid({ children }) {
  return <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{children}</div>
}

function Skeleton() {
  return (
    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="aspect-[2/3] animate-pulse rounded-xl bg-zinc-800" />
      ))}
    </div>
  )
}
