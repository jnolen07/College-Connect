import { Bookmark, Plus } from 'lucide-react'
import { RATINGS, keyOf } from '../library.js'
import TitleCard, { Grid } from './TitleCard.jsx'
import PageHeader from './PageHeader.jsx'
import { EmptyState, SectionTitle } from './Section.jsx'

export default function MyShows({ library, onRate, onSelect, goSearch }) {
  const all = Object.values(library).sort((a, b) => b.addedAt - a.addedAt)
  const add = (
    <button className="btn-gold btn-sm" onClick={goSearch}>
      <Plus size={16} /> Add more
    </button>
  )
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <PageHeader
        eyebrow="Library"
        title="My shows"
        subtitle={all.length ? `${all.length} title${all.length === 1 ? '' : 's'} rated. Your picks are built from these.` : null}
        actions={all.length ? add : null}
      />
      {all.length === 0 && (
        <EmptyState
          icon={Bookmark}
          title="Nothing here yet"
          body="Add shows and movies you’ve watched so ShowFinder can learn your taste."
          action={add}
        />
      )}
      {Object.entries(RATINGS).map(([k, r]) => {
        const items = all.filter((t) => t.rating === k)
        if (!items.length) return null
        return (
          <section key={k}>
            <SectionTitle title={`${r.emoji} ${r.label}`} count={items.length} />
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
