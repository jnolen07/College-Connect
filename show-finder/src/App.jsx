import { useEffect, useState } from 'react'
import { details, hasKey, normalize, searchTitles, trending } from './tmdb.js'
import { guessRegion, load, save } from './storage.js'
import PlatformPicker from './components/PlatformPicker.jsx'
import Recommendations from './components/Recommendations.jsx'
import TitleCard from './components/TitleCard.jsx'

// Routes live in the URL hash so recommendation pages are shareable and Back works:
//   #/            search
//   #/tv/1396     "more like Breaking Bad"
const parseHash = () => {
  const m = window.location.hash.match(/^#\/(tv|movie)\/(\d+)/)
  return m ? { type: m[1], id: Number(m[2]) } : null
}

export default function App() {
  const [region, setRegion] = useState(() => load('region', guessRegion()))
  const [providerIds, setProviderIds] = useState(() => load('providers', []))
  const [seen, setSeen] = useState(() => new Set(load('seen', [])))
  const [editingServices, setEditingServices] = useState(false)
  const [seed, setSeed] = useState(null)

  // Keep seed in sync with the URL hash.
  useEffect(() => {
    const sync = () => {
      const route = parseHash()
      if (!route) return setSeed(null)
      setSeed((cur) => {
        if (cur && cur.type === route.type && cur.id === route.id) return cur
        // Arrived via shared link / back button: fetch the title's basics.
        details(route.type, route.id)
          .then((d) => setSeed(normalize(d, route.type)))
          .catch(() => (window.location.hash = '#/'))
        return { ...route, title: '…' }
      })
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  const select = (t) => {
    setSeed(t)
    window.location.hash = `#/${t.type}/${t.id}`
  }

  const markSeen = (t) => {
    const next = new Set(seen).add(`${t.type}:${t.id}`)
    setSeen(next)
    save('seen', [...next])
  }

  if (!hasKey()) return <MissingKey />

  if (providerIds.length === 0 || editingServices) {
    return (
      <PlatformPicker
        firstRun={providerIds.length === 0}
        region={region}
        selected={providerIds}
        onCancel={() => setEditingServices(false)}
        onSave={({ region: r, providers }) => {
          setRegion(r)
          setProviderIds(providers)
          save('region', r)
          save('providers', providers)
          setEditingServices(false)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <button onClick={() => (window.location.hash = '#/')} className="text-lg font-bold">
            Show<span className="text-violet-400">Finder</span>
          </button>
          <div className="flex-1" />
          {seen.size > 0 && (
            <button
              onClick={() => {
                setSeen(new Set())
                save('seen', [])
              }}
              className="hidden text-xs text-zinc-500 hover:text-zinc-300 sm:block"
              title="Show titles you marked as seen again"
            >
              Reset {seen.size} seen
            </button>
          )}
          <button
            onClick={() => setEditingServices(true)}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm hover:bg-zinc-800"
          >
            My services ({providerIds.length})
          </button>
        </div>
      </header>

      {seed ? (
        seed.title === '…' ? (
          <p className="p-8 text-zinc-400">Loading…</p>
        ) : (
          <Recommendations
            seed={seed}
            region={region}
            providerIds={providerIds}
            seen={seen}
            onSeen={markSeen}
            onSelect={select}
            onBack={() => (window.location.hash = '#/')}
          />
        )
      ) : (
        <Search onSelect={select} />
      )}
    </div>
  )
}

function Search({ onSelect }) {
  const [query, setQuery] = useState(() => load('lastQuery', ''))
  const [results, setResults] = useState([])
  const [popular, setPopular] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    trending().then(setPopular).catch((e) => setError(e.message))
  }, [])

  // Debounced search-as-you-type.
  useEffect(() => {
    save('lastQuery', query)
    const q = query.trim()
    if (q.length < 2) return setResults([])
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

  const showing = query.trim().length >= 2 ? results : popular

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16">
      <section className="py-10 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">Just finished something great?</h1>
        <p className="mt-2 text-zinc-400">Search a show or movie you loved — we'll find what to watch next on services you already have.</p>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Severance, The Bear, Interstellar…"
          className="mx-auto mt-6 block w-full max-w-xl rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-lg outline-none focus:border-violet-500"
        />
      </section>

      {error && <p className="mb-4 rounded-lg bg-red-950 p-3 text-red-200">{error}</p>}

      <h2 className="mb-4 text-lg font-semibold">
        {query.trim().length >= 2 ? (loading ? 'Searching…' : `Results for “${query.trim()}”`) : 'Trending this week'}
      </h2>
      {query.trim().length >= 2 && !loading && results.length === 0 && (
        <p className="text-zinc-400">No movies or shows found. Try a different spelling?</p>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {showing.map((t) => (
          <TitleCard key={`${t.type}:${t.id}`} title={t} onSelect={onSelect} />
        ))}
      </div>
    </main>
  )
}

function MissingKey() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-2xl font-bold">One setup step left</h1>
      <p className="mt-3 text-zinc-300">
        Show Finder uses The Movie Database (TMDB) for titles, recommendations and where-to-stream info. It's free:
      </p>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-zinc-300">
        <li>Create an account at themoviedb.org and request an API key (Settings → API).</li>
        <li>
          Add it as <code className="rounded bg-zinc-800 px-1">VITE_TMDB_API_KEY</code> in a <code className="rounded bg-zinc-800 px-1">.env</code> file
          (or in Vercel → Environment Variables).
        </li>
        <li>Restart / redeploy.</li>
      </ol>
    </div>
  )
}
