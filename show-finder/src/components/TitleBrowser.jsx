import { useEffect, useState } from 'react'
import { searchTitles, trending } from '../tmdb.js'
import { keyOf } from '../library.js'
import TitleCard, { Grid, Skeleton } from './TitleCard.jsx'

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
      <input
        autoFocus={autoFocus}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder || 'Search any show or movie…'}
        className="block w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 text-lg outline-none transition focus:border-amber-300/70 focus:shadow-[0_0_24px_rgba(241,210,127,.15)]"
      />
      {error && <p className="mt-4 rounded-lg bg-red-950 p-3 text-red-200">{error}</p>}
      <h2 className="mt-8 text-lg font-semibold">
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
