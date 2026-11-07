import { useEffect, useState } from 'react'
import { ArrowRight, ChevronDown, Clapperboard, Lock, MousePointerClick, Sparkles, Tv, Wand2 } from 'lucide-react'
import { SERVICES, serviceById } from '../services.js'
import Logo from './Logo.jsx'
import ServiceLogo from './ServiceLogo.jsx'
import ResetButton from './ResetButton.jsx'
import SiteFooter from './SiteFooter.jsx'

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

// The public front page: spotlight hero, how it works, features, FAQ.
export default function Landing({ onStart, returning, savedCount, section }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (section) setTimeout(() => scrollTo(section), 50)
    else window.scrollTo({ top: 0 })
  }, [section])

  const cta = returning ? 'Continue to my picks' : 'Get started — it’s free'

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Nav */}
      <header
        className={`fixed inset-x-0 top-0 z-30 transition-colors duration-300 ${
          scrolled ? 'border-b border-white/[.06] bg-black/80 backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3.5">
          <Logo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
          <nav className="ml-auto hidden items-center gap-6 text-sm text-zinc-300 md:flex">
            <button onClick={() => scrollTo('how')} className="transition hover:text-white">How it works</button>
            <button onClick={() => scrollTo('features')} className="transition hover:text-white">Features</button>
            <button onClick={() => scrollTo('faq')} className="transition hover:text-white">FAQ</button>
          </nav>
          <button onClick={onStart} className="btn-gold btn-sm ml-auto md:ml-0">
            {returning ? 'Open app' : 'Get started'}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="beam" />
        <div className="spot" />
        <div className="floor" />
        <p className="rise rise-1 eyebrow mb-5">Your streaming, sorted</p>
        <h1 className="word gold-text font-display">ShowFinder</h1>
        <p className="rise rise-1 mt-5 max-w-xl text-lg text-zinc-300 sm:text-xl">
          Finished a show you loved? Find what to watch next — on the services you already pay for.
        </p>
        <div className="rise rise-2 mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <button className="btn-gold px-7 py-3.5 text-base" onClick={onStart} autoFocus>
            {cta} <ArrowRight size={18} />
          </button>
          {!returning && (
            <button className="btn-outline px-7 py-3.5 text-base" onClick={() => scrollTo('how')}>
              See how it works
            </button>
          )}
        </div>
        {savedCount !== null && (
          <div className="rise rise-3 mt-5 text-sm">
            <ResetButton variant="intro" count={savedCount} />
          </div>
        )}
        <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
          <button onClick={() => scrollTo('services')} aria-label="Scroll down" className="rise rise-3 p-2 text-zinc-500 hover:text-zinc-300">
            <ChevronDown className="bob" />
          </button>
        </div>
      </section>

      {/* Services strip */}
      <section id="services" className="border-y border-white/[.06] bg-[var(--surface)] py-10">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-center text-sm text-zinc-400">Works with the services you already have</p>
          <div className="no-scrollbar mt-6 flex justify-start gap-4 overflow-x-auto pb-1 sm:justify-center">
            {SERVICES.map((s) => (
              <div key={s.id} className="flex w-16 shrink-0 flex-col items-center gap-2 sm:w-20">
                <div className="aspect-square w-14 opacity-90 transition hover:opacity-100 sm:w-16">
                  <ServiceLogo service={s} />
                </div>
                <span className="text-center text-[11px] leading-tight text-zinc-500">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-20 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading eyebrow="How it works" title="Three steps to your next favorite show" />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              [Tv, 'Pick your services', 'Tell us which of the top streaming services you use — Netflix, Max, Hulu and more.'],
              [Clapperboard, 'Rate what you’ve watched', 'Search shows and movies you’ve seen and mark them Loved, Liked or Not for me.'],
              [Sparkles, 'Get picks you can watch tonight', 'We match your taste and put what’s already on your services first.'],
            ].map(([Icon, title, body], i) => (
              <div key={title} className="card relative p-6 sm:p-7">
                <span className="absolute right-6 top-6 font-display text-4xl font-bold text-white/[.06]">{i + 1}</span>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-300/30 bg-amber-300/10 text-amber-200">
                  <Icon size={20} />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features + product preview */}
      <section id="features" className="scroll-mt-20 overflow-hidden border-t border-white/[.06] bg-[var(--surface)] py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2">
          <div>
            <SectionHeading align="left" eyebrow="Why ShowFinder" title="Recommendations that actually fit" />
            <ul className="mt-8 space-y-6">
              {[
                [Wand2, 'Picks that match your taste', 'Built from what fans of your favorites also loved, plus shared themes — not just “it’s also a drama.”'],
                [Tv, 'Only what you can watch', 'Titles on your services come first, so you never sign up for something new to watch one show.'],
                [MousePointerClick, 'Every place to watch, one tap away', 'See where a title streams, where it’s free, and where to rent it — then jump straight there.'],
                [Lock, 'Private by default', 'No account, no sign-up. Your services and ratings stay in your browser.'],
              ].map(([Icon, title, body]) => (
                <li key={title} className="flex gap-4">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[.05] text-amber-200">
                    <Icon size={18} />
                  </span>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-400">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <ProductPreview />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4">
          <SectionHeading eyebrow="FAQ" title="Questions, answered" />
          <div className="mt-10 divide-y divide-white/[.06] rounded-2xl border border-white/[.08] bg-[var(--surface)]">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group px-5 py-1 sm:px-6">
                <summary className="flex cursor-pointer items-center justify-between gap-4 py-4 font-medium">
                  {q}
                  <ChevronDown size={18} className="shrink-0 text-zinc-500 transition group-open:rotate-180" />
                </summary>
                <p className="pb-5 text-sm leading-relaxed text-zinc-400">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 pb-24">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-amber-300/20 bg-gradient-to-b from-[#1a1508] to-[var(--surface)] px-6 py-14 text-center">
          <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-[36rem] -translate-x-1/2 rounded-full bg-amber-300/10 blur-3xl" />
          <h2 className="relative text-3xl font-semibold tracking-tight sm:text-4xl">Ready for your next binge?</h2>
          <p className="relative mx-auto mt-3 max-w-md text-zinc-400">It takes about a minute to set up. No account, no credit card.</p>
          <button className="btn-gold relative mt-8 px-7 py-3.5 text-base" onClick={onStart}>
            {cta} <ArrowRight size={18} />
          </button>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}

export function SectionHeading({ eyebrow, title, align = 'center' }) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : ''}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
    </div>
  )
}

// A static mock of the app (no network) to show what you get.
function ProductPreview() {
  const netflix = serviceById.netflix
  const rows = [
    [serviceById.netflix, 'On your services', 'Included', true],
    [serviceById.prime, 'Rent or buy', 'Rent · Buy', false],
    [serviceById.appletv, 'Rent or buy', 'Buy', false],
  ]
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-amber-300/[.07] blur-2xl" />
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[var(--bg)] shadow-2xl">
        <div className="flex gap-4 p-5">
          <div className="flex aspect-[2/3] w-24 shrink-0 items-end rounded-xl bg-gradient-to-br from-amber-700/60 via-zinc-800 to-zinc-950 p-2 ring-1 ring-white/10">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-100/80">Better Call Saul</span>
          </div>
          <div className="min-w-0">
            <p className="eyebrow !text-[10px]">Because you liked Breaking Bad</p>
            <h4 className="mt-1.5 text-xl font-semibold">Better Call Saul</h4>
            <p className="mt-1 text-xs text-zinc-400">2015 · TV show · 6 seasons · ★ 8.7</p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-300/15 px-2.5 py-1 text-xs text-amber-100">
              <span className="h-4 w-4 overflow-hidden rounded">
                <ServiceLogo service={netflix} size="sm" className="!h-4 !w-4 !p-0.5" />
              </span>
              On your Netflix
            </span>
          </div>
        </div>
        <div className="space-y-2 border-t border-white/[.06] p-5">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-zinc-400">Where to watch</p>
          {rows.map(([s, , note, mine]) => (
            <div
              key={s.id}
              className={`flex items-center gap-3 rounded-xl border p-2.5 pr-3 ${mine ? 'border-amber-300/50 bg-amber-300/10' : 'border-white/[.08] bg-white/[.02]'}`}
            >
              <span className="h-9 w-9 overflow-hidden rounded-lg">
                <ServiceLogo service={s} className="!rounded-lg !p-1.5" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-medium">{s.name}</span>
                <span className="block text-xs text-zinc-500">{note}</span>
              </span>
              <span className={`text-xs font-semibold ${mine ? 'text-amber-200' : 'text-zinc-400'}`}>Watch ↗</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const FAQ = [
  ['Is ShowFinder free?', 'Yes. There’s no subscription, no ads and nothing to buy.'],
  [
    'Do I need an account?',
    'No. Your streaming services and the shows you rate are saved privately in your browser on this device. Nothing is stored on our side.',
  ],
  [
    'How are recommendations picked?',
    'We look at what fans of the shows you loved also watched, then keep the ones that share real themes and genres with your taste. Cartoons, reality shows and anything like what you marked “Not for me” get pushed down.',
  ],
  [
    'How do you know what’s on my services?',
    'Streaming availability comes from JustWatch via The Movie Database (TMDB). Services add and remove titles all the time, so it can occasionally be a little behind.',
  ],
  [
    'Can I hand my phone to a friend to try it?',
    'Yes — tap “New here? Start fresh” on the home page. It clears the last person’s services and ratings so the next person can set up their own.',
  ],
  ['Which countries does it work in?', 'ShowFinder is built for the US streaming services. Availability data follows your device’s region.'],
]
