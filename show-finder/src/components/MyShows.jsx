import { RATINGS, keyOf } from '../library.js'
import TitleCard, { Grid } from './TitleCard.jsx'

export default function MyShows({ library, onRate, onSelect, goSearch }) {
  const all = Object.values(library).sort((a, b) => b.addedAt - a.addedAt)
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-8">
      <div className="flex items-end gap-3">
        <h1 className="flex-1 font-display text-3xl font-semibold sm:text-4xl">
          <span className="gold-text">My shows</span>
        </h1>
        <button className="btn-gold !px-5 !py-2" onClick={goSearch}>
          + Add more
        </button>
      </div>
      {all.length === 0 && <p className="mt-4 text-zinc-400">Nothing here yet. Add shows and movies you've watched.</p>}
      {Object.entries(RATINGS).map(([k, r]) => {
        const items = all.filter((t) => t.rating === k)
        if (!items.length) return null
        return (
          <section key={k} className="mt-8">
            <h2 className="text-lg font-semibold">
              {r.emoji} {r.label} <span className="text-zinc-500">({items.length})</span>
            </h2>
            <Grid>
              {items.map((t) => (
                <TitleCard key={keyOf(t)} title={t} rating={t.rating} onRate={onRate} onSelect={onSelect} />
              ))}
            </Grid>
          </section>
        )
      })}
    </div>
  )
}
