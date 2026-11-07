import { useEffect, useState } from 'react'
import { details, hasKey, normalize } from './tmdb.js'
import { guessRegion, load, save } from './storage.js'
import { useLibrary } from './library.js'
import Landing from './components/Landing.jsx'
import StaticPage from './components/StaticPage.jsx'
import AppHeader from './components/AppHeader.jsx'
import PageHeader from './components/PageHeader.jsx'
import SiteFooter from './components/SiteFooter.jsx'
import OnboardingBar from './components/OnboardingBar.jsx'
import ServicePicker from './components/ServicePicker.jsx'
import SeenStep from './components/SeenStep.jsx'
import ForYou from './components/ForYou.jsx'
import MyShows from './components/MyShows.jsx'
import TitleBrowser from './components/TitleBrowser.jsx'
import Recommendations from './components/Recommendations.jsx'
import KeySetup from './components/KeySetup.jsx'
import TitleSheet from './components/TitleSheet.jsx'
import { SERVICES } from './services.js'

// Routes live in the URL hash so Back works and pages are shareable:
//   #/          picks for you        #/search    search
//   #/library   my shows             #/tv/1396   more like a title
//   #/welcome   landing page (#/welcome/faq jumps to a section)
//   #/about, #/privacy               static pages
function parseHash() {
  const h = window.location.hash
  const m = h.match(/^#\/(tv|movie)\/(\d+)/)
  if (m) return { page: 'title', type: m[1], id: Number(m[2]) }
  const w = h.match(/^#\/welcome(?:\/(\w+))?/)
  if (w) return { page: 'welcome', section: w[1] }
  if (h.startsWith('#/about')) return { page: 'about' }
  if (h.startsWith('#/privacy')) return { page: 'privacy' }
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
  const [sheet, setSheet] = useState(null) // title whose details + where-to-watch are open
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
    setSheet(null)
    setSeed(t)
    go(`#/${t.type}/${t.id}`)
  }
  const openSheet = (t) => setSheet(t)

  // ---------- public pages ----------
  if (route.page === 'about' || route.page === 'privacy') return <StaticPage page={route.page} />

  const setUp = serviceIds.length > 0 && onboarded
  if (showIntro || route.page === 'welcome') {
    // null = nobody has set this device up yet, so no "Start fresh" link.
    const savedCount = serviceIds.length || Object.keys(library).length ? Object.keys(library).length : null
    return (
      <Landing
        returning={setUp}
        savedCount={savedCount}
        section={route.page === 'welcome' ? route.section : null}
        onStart={() => {
          setShowIntro(false)
          if (route.page === 'welcome') go('#/')
          window.scrollTo({ top: 0 })
        }}
      />
    )
  }

  // ---------- onboarding ----------

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
      <div className="min-h-screen bg-[var(--bg)]">
        <OnboardingBar />
        <div className="px-4 py-12 sm:py-20">
          <KeySetup onDone={() => setKeyOk(true)} />
        </div>
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

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)]">
      <AppHeader page={route.page} libCount={libCount} serviceIds={serviceIds} onEditServices={() => setEditingServices(true)} />

      <div className="flex-1">
      {route.page === 'home' && (
        <ForYou library={library} onRate={rate} region={region} serviceIds={serviceIds} onSelect={openSheet} goSearch={() => go('#/search')} />
      )}
      {route.page === 'search' && (
        <main className="mx-auto max-w-6xl px-4 pb-16">
          <PageHeader
            eyebrow="Search"
            title="Find something like…"
            subtitle="Search any show or movie. Tap a poster to see where to watch it and find more like it."
          />
          <div className="mt-6">
            <TitleBrowser library={library} onRate={rate} onSelect={openSheet} />
          </div>
        </main>
      )}
      {route.page === 'library' && <MyShows library={library} onRate={rate} onSelect={openSheet} goSearch={() => go('#/search')} />}
      {route.page === 'title' &&
        (seed && seed.id === route.id ? (
          <Recommendations
            seed={seed}
            region={region}
            serviceIds={serviceIds}
            library={library}
            onRate={rate}
            onSelect={openSheet}
            onBack={() => window.history.back()}
          />
        ) : (
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="h-8 w-64 animate-pulse rounded-lg bg-white/[.06]" />
          </div>
        ))}
      </div>

      {sheet && (
        <TitleSheet
          key={`${sheet.type}:${sheet.id}`}
          item={sheet}
          region={region}
          serviceIds={serviceIds}
          library={library}
          onRate={rate}
          onClose={() => setSheet(null)}
          onMoreLike={select}
        />
      )}

      <div className="pb-16 md:pb-0">
        <SiteFooter compact />
      </div>
    </div>
  )
}
