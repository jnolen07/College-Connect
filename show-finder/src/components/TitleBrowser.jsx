import { useEffect, useState } from 'react'
import { searchTitles, trending } from '../tmdb.js'
import { keyOf } from '../library.js'
import TitleCard, { Grid, Skeleton } from './TitleCard.jsx'
import { Search } from 'lucide-react'
import { ErrorNote } from './Section.jsx'

// Search box + results (or trending when empty). Used by onboarding and the Search tab.
export default function TitleBrowser({ library, onRate, onSelect, placeholder, autoFocus = true }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [popular, setPopular] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    trending()
      .then(setPopular)
      .catch((e) => setError(e.message))
  }, [])

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    const t = setTimeout(() => {
      searchTitles(q)
        .then((r) => {
          setResults(r)
          setError('')
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  const searching = query.trim().length >= 2
  const list = searching ? results : popular || []

  return (
    <div>
      <div className="relative">
        <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="search"
          aria-label="Search shows and movies"
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || 'Search any show or movie…'}
          className="block w-full rounded-2xl border border-white/10 bg-[var(--surface)] py-4 pl-12 pr-5 text-lg outline-none transition placeholder:text-zinc-500 focus:border-amber-300/60 focus:shadow-[0_0_0_4px_rgba(227,183,74,.12)]"
        />
      </div>
      {error && <ErrorNote>{error}</ErrorNote>}
      <h2 className="mt-10 text-xl font-semibold tracking-tight">
        {searching ? (loading ? 'Searching…' : `Results for “${query.trim()}”`) : 'Popular this week'}
      </h2>
      {searching && !loading && results.length === 0 && <p className="mt-2 text-zinc-400">Nothing found — try another spelling?</p>}
      {!searching && !popular && !error && <Skeleton />}
      <Grid>
        {list.map((t) => (
          <TitleCard key={keyOf(t)} title={t} rating={library[keyOf(t)]?.rating} onRate={onRate} onSelect={onSelect} />
        ))}
      </Grid>
    </div>
  )
}
