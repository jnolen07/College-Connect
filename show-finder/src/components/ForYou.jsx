import { useEffect, useState } from 'react'
import { recommendForYou } from '../tmdb.js'
import { keyOf, pickDisliked, pickSeeds } from '../library.js'
import TitleCard, { Grid, Skeleton } from './TitleCard.jsx'
import KindFilter from './KindFilter.jsx'

export default function ForYou({ library, onRate, region, serviceIds, onSelect, goSearch }) {
  // Freeze seeds when the page opens so rating a card doesn't reshuffle everything.
  const [version, setVersion] = useState(0)
  const [seeds, setSeeds] = useState(() => pickSeeds(library))
  const [state, setState] = useState({ loading: true })
  const [kind, setKind] = useState('all')
  const [showElsewhere, setShowElsewhere] = useState(false)

  useEffect(() => {
    if (!seeds.length) return setState({ loading: false, onYours: [], elsewhere: [] })
    let alive = true
    setState({ loading: true })
    recommendForYou(seeds, {
      region,
      serviceIds,
      exclude: new Set(Object.keys(library)),
      disliked: pickDisliked(library),
    })
      .then((r) => alive && setState({ loading: false, ...r }))
      .catch((e) => alive && setState({ loading: false, error: e.message }))
    return () => {
      alive = false
    }
  }, [version, serviceIds.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = () => {
    setSeeds(pickSeeds(library))
    setVersion((v) => v + 1)
  }

  const keep = (t) => !library[keyOf(t)] && (kind === 'all' || t.type === kind)
  const onYours = (state.onYours || []).filter(keep)
  const elsewhere = (state.elsewhere || []).filter(keep)

  if (!seeds.length) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl gold-text">Picks for you</h1>
        <p className="mt-3 text-zinc-400">Rate a few shows or movies you loved and your picks will show up here.</p>
        <button className="btn-gold mt-6" onClick={goSearch}>
          Add what I've watched
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-8">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1">
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">
            <span className="gold-text">Picks for you</span>
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Based on {seeds.slice(0, 3).map((s) => s.title).join(', ')}
            {seeds.length > 3 ? ` and ${seeds.length - 3} more` : ''}
          </p>
        </div>
        <button onClick={refresh} className="rounded-full border border-zinc-700 px-4 py-1.5 text-sm hover:bg-zinc-900">
          ↻ Refresh picks
        </button>
      </div>

      <KindFilter kind={kind} setKind={setKind} />

      {state.loading && <Skeleton />}
      {state.error && <p className="mt-4 rounded-lg bg-red-950 p-4 text-red-200">{state.error}</p>}

      {!state.loading && !state.error && (
        <>
          <h2 className="mt-6 text-lg font-semibold">
            On your services <span className="text-zinc-500">({onYours.length})</span>
          </h2>
          {onYours.length === 0 ? (
            <p className="mt-2 text-zinc-400">Nothing new on your services yet — rate a few more shows or add a service.</p>
          ) : (
            <Grid>
              {onYours.map((t) => (
                <TitleCard key={keyOf(t)} title={t} services={t.yourServices} because={t.because} onSelect={onSelect} onRate={onRate} />
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
                    <TitleCard key={keyOf(t)} title={t} providers={t.where.included} because={t.because} onSelect={onSelect} onRate={onRate} dim />
                  ))}
                </Grid>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
