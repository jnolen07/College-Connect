import { useEffect, useState } from 'react'
import { recommendForYou } from '../tmdb.js'
import { keyOf, pickDisliked, pickSeeds } from '../library.js'
import TitleCard, { Grid, Skeleton } from './TitleCard.jsx'
import KindFilter from './KindFilter.jsx'
import PageHeader from './PageHeader.jsx'
import { Collapsible, EmptyState, ErrorNote, SectionTitle } from './Section.jsx'
import { RefreshCw, Sparkles } from 'lucide-react'

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
      <div className="mx-auto max-w-6xl px-4 pb-16">
        <PageHeader eyebrow="For you" title="Picks for you" />
        <EmptyState
          icon={Sparkles}
          title="Tell us what you love"
          body="Rate a few shows or movies you loved and your personal picks will show up here."
          action={
            <button className="btn-gold" onClick={goSearch}>
              Add what I’ve watched
            </button>
          }
        />
      </div>
    )
  }

  const basedOn = seeds.slice(0, 3).map((s) => s.title).join(', ') + (seeds.length > 3 ? ` and ${seeds.length - 3} more` : '')

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <PageHeader
        eyebrow="For you"
        title="Picks for you"
        subtitle={`Based on ${basedOn}`}
        actions={
          <button onClick={refresh} className="btn-outline btn-sm">
            <RefreshCw size={15} /> Refresh
          </button>
        }
      />

      <KindFilter kind={kind} setKind={setKind} />

      {state.loading && <Skeleton />}
      {state.error && <ErrorNote>{state.error}</ErrorNote>}

      {!state.loading && !state.error && (
        <>
          <SectionTitle title="On your services" count={onYours.length} hint="Watch now — no new subscriptions" />
          {onYours.length === 0 ? (
            <p className="mt-3 text-zinc-400">Nothing new on your services yet — rate a few more shows or add a service.</p>
          ) : (
            <Grid>
              {onYours.map((t) => (
                <TitleCard key={keyOf(t)} title={t} services={t.yourServices} because={t.because} onSelect={onSelect} onRate={onRate} />
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
                  <TitleCard key={keyOf(t)} title={t} providers={t.where.included} because={t.because} onSelect={onSelect} onRate={onRate} dim />
                ))}
              </Grid>
            </Collapsible>
          )}
        </>
      )}
    </div>
  )
}
