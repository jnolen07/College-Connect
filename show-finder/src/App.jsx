import { useEffect, useState } from 'react'
import { details, hasKey, normalize } from './tmdb.js'
import { guessRegion, load, save } from './storage.js'
import { useLibrary } from './library.js'
import Intro from './components/Intro.jsx'
import ServicePicker from './components/ServicePicker.jsx'
import SeenStep from './components/SeenStep.jsx'
import ForYou from './components/ForYou.jsx'
import MyShows from './components/MyShows.jsx'
import TitleBrowser from './components/TitleBrowser.jsx'
import Recommendations from './components/Recommendations.jsx'
import KeySetup from './components/KeySetup.jsx'
import ResetButton from './components/ResetButton.jsx'
import { SERVICES } from './services.js'

// Routes live in the URL hash so Back works and pages are shareable:
//   #/          picks for you        #/search    search
//   #/library   my shows             #/tv/1396   more like a title
function parseHash() {
  const h = window.location.hash
  const m = h.match(/^#\/(tv|movie)\/(\d+)/)
  if (m) return { page: 'title', type: m[1], id: Number(m[2]) }
  if (h.startsWith('#/search')) return { page: 'search' }
  if (h.startsWith('#/library')) return { page: 'library' }
  return { page: 'home' }
}
const go = (hash) => {
  window.location.hash = hash
}

export default function App() {
  const [showIntro, setShowIntro] = useState(true)
  const [serviceIds, setServiceIds] = useState(() => load('services', []).filter((id) => SERVICES.some((s) => s.id === id)))
  const [onboarded, setOnboarded] = useState(() => load('onboarded', false))
  const [editingServices, setEditingServices] = useState(false)
  const [keyOk, setKeyOk] = useState(hasKey())
  const [region] = useState(() => load('region', guessRegion()))
  const [route, setRoute] = useState(parseHash)
  const [seed, setSeed] = useState(null)
  const { library, rate } = useLibrary()

  useEffect(() => {
    const onHash = () => setRoute(parseHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // Load the title for #/tv/123 if we didn't arrive by clicking it.
  useEffect(() => {
    if (route.page !== 'title' || !keyOk) return
    if (seed && seed.type === route.type && seed.id === route.id) return
    const known = library[`${route.type}:${route.id}`]
    if (known) return setSeed(known)
    setSeed(null)
    details(route.type, route.id)
      .then((d) => setSeed(normalize(d, route.type)))
      .catch(() => go('#/'))
  }, [route, keyOk]) // eslint-disable-line react-hooks/exhaustive-deps

  const select = (t) => {
    setSeed(t)
    go(`#/${t.type}/${t.id}`)
  }

  // ---------- onboarding ----------
  if (showIntro) {
    // null = nobody has set this device up yet, so no "Start fresh" link.
    const savedCount = serviceIds.length || Object.keys(library).length ? Object.keys(library).length : null
    return <Intro onNext={() => setShowIntro(false)} savedCount={savedCount} />
  }

  if (serviceIds.length === 0 || editingServices) {
    return (
      <ServicePicker
        firstRun={serviceIds.length === 0}
        selected={serviceIds}
        onCancel={() => setEditingServices(false)}
        onSave={(ids) => {
          setServiceIds(ids)
          save('services', ids)
          save('region', region)
          setEditingServices(false)
        }}
      />
    )
  }

  if (!keyOk) {
    return (
      <div className="min-h-screen bg-black px-4 py-16">
        <KeySetup onDone={() => setKeyOk(true)} />
      </div>
    )
  }

  if (!onboarded) {
    return (
      <SeenStep
        library={library}
        onRate={rate}
        onDone={() => {
          setOnboarded(true)
          save('onboarded', true)
          go('#/')
        }}
      />
    )
  }

  // ---------- main app ----------
  const libCount = Object.keys(library).length
  const tab = (page, label, hash) => (
    <button
      onClick={() => go(hash)}
      className={`rounded-full px-3 py-1.5 text-sm transition ${route.page === page ? 'bg-amber-200 text-black' : 'text-zinc-300 hover:bg-zinc-900'}`}
    >
      {label}
    </button>
  )

  return (
    <div className="min-h-screen bg-black">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <button onClick={() => go('#/')} className="font-display text-xl font-extrabold">
            <span className="gold-text">ShowFinder</span>
          </button>
          <nav className="order-last flex w-full gap-1 overflow-x-auto sm:order-none sm:w-auto">
            {tab('home', 'For you', '#/')}
            {tab('search', 'Search', '#/search')}
            {tab('library', `My shows${libCount ? ` (${libCount})` : ''}`, '#/library')}
          </nav>
          <div className="flex-1" />
          <ResetButton count={libCount} />
          <button
            onClick={() => setEditingServices(true)}
            className="flex items-center gap-2 rounded-full border border-zinc-800 py-1 pl-1 pr-3 text-sm hover:bg-zinc-900"
            title="Change your services"
          >
            <span className="flex -space-x-1.5">
              {serviceIds.slice(0, 4).map((id) => {
                const s = SERVICES.find((x) => x.id === id)
                return (
                  <span key={id} className="h-6 w-6 overflow-hidden rounded-full ring-2 ring-black" style={{ background: s.bg }}>
                    {s.path ? (
                      <svg viewBox="0 0 24 24" className="h-full w-full p-1" fill={s.fg}>
                        <path d={s.path} />
                      </svg>
                    ) : (
                      <span className="flex h-full items-center justify-center text-[9px] font-bold text-white">{s.name[0]}</span>
                    )}
                  </span>
                )
              })}
            </span>
            My services
          </button>
        </div>
      </header>

      {route.page === 'home' && (
        <ForYou library={library} onRate={rate} region={region} serviceIds={serviceIds} onSelect={select} goSearch={() => go('#/search')} />
      )}
      {route.page === 'search' && (
        <main className="mx-auto max-w-6xl px-4 pb-16 pt-8">
          <h1 className="mb-1 font-display text-3xl font-semibold sm:text-4xl">
            <span className="gold-text">Find something like…</span>
          </h1>
          <p className="mb-5 text-zinc-400">Tap a poster for similar shows, or “Seen it?” to add it to your shows.</p>
          <TitleBrowser library={library} onRate={rate} onSelect={select} />
        </main>
      )}
      {route.page === 'library' && <MyShows library={library} onRate={rate} onSelect={select} goSearch={() => go('#/search')} />}
      {route.page === 'title' &&
        (seed && seed.id === route.id ? (
          <Recommendations
            seed={seed}
            region={region}
            serviceIds={serviceIds}
            library={library}
            onRate={rate}
            onSelect={select}
            onBack={() => window.history.back()}
          />
        ) : (
          <p className="p-8 text-zinc-400">Loading…</p>
        ))}

      <footer className="border-t border-white/5 px-4 py-6 text-center text-xs text-zinc-600">
        Data from TMDB · Streaming availability by JustWatch. This product uses the TMDB API but is not endorsed or certified by TMDB.
      </footer>
    </div>
  )
}
