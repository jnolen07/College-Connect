import { ArrowLeft } from 'lucide-react'
import Logo from './Logo.jsx'
import SiteFooter from './SiteFooter.jsx'

// Simple content page (About, Privacy) with the site header and footer.
export default function StaticPage({ page }) {
  const content = PAGES[page]
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)]">
      <header className="border-b border-white/[.06]">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3.5">
          <Logo onClick={() => (window.location.hash = '#/')} />
          <button onClick={() => window.history.back()} className="ml-auto flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white">
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-14 sm:py-20">
        <p className="eyebrow">{content.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">{content.title}</h1>
        <p className="mt-2 text-sm text-zinc-500">{content.updated}</p>
        <div className="mt-10 space-y-8">
          {content.sections.map(([h, body]) => (
            <section key={h}>
              <h2 className="text-lg font-semibold">{h}</h2>
              <div className="mt-2 space-y-3 leading-relaxed text-zinc-400">{body}</div>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter compact />
    </div>
  )
}

const ext = (href, label) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-amber-200 underline-offset-4 hover:underline">
    {label}
  </a>
)

const PAGES = {
  about: {
    eyebrow: 'About',
    title: 'About ShowFinder',
    updated: 'An independent project',
    sections: [
      [
        'Why it exists',
        <p key="a">
          Finishing a great show and having no idea what to watch next is a real problem — and most “recommended for you” rows
          just push whatever that one service wants you to watch. ShowFinder looks across the services you already pay for and
          finds titles that genuinely match what you loved.
        </p>,
      ],
      [
        'How it works',
        <>
          <p>
            You pick your streaming services and rate a few shows or movies. ShowFinder then looks at what fans of those titles
            also watched, keeps the ones that share real themes and genres with your taste, and puts what’s on your services first.
          </p>
          <p>Tap any title to see every place it’s streaming, free, or available to rent — and jump straight there.</p>
        </>,
      ],
      [
        'Credits',
        <p key="c">
          Title information, images and recommendations come from {ext('https://www.themoviedb.org/', 'The Movie Database (TMDB)')}.
          Streaming availability is provided by {ext('https://www.justwatch.com/', 'JustWatch')}. This product uses the TMDB API
          but is not endorsed or certified by TMDB. Streaming service names and logos belong to their owners.
        </p>,
      ],
    ],
  },
  privacy: {
    eyebrow: 'Privacy',
    title: 'Privacy',
    updated: 'Short version: your data stays on your device.',
    sections: [
      [
        'No accounts',
        <p key="a">ShowFinder has no sign-up and no user database. We don’t collect your name, email or anything else about you.</p>,
      ],
      [
        'What’s stored, and where',
        <>
          <p>
            The streaming services you pick and the titles you rate are saved in your browser’s local storage on this device. They
            never leave your device except as part of the requests described below.
          </p>
          <p>To erase them, use Reset in the app (or “Start fresh” on the home page), or clear this site’s data in your browser.</p>
        </>,
      ],
      [
        'Services ShowFinder talks to',
        <>
          <p>
            To show titles, recommendations and streaming availability, the app asks ShowFinder’s server (hosted on Vercel), which
            looks them up from TMDB (themoviedb.org). Search terms and the titles you look at pass through it to TMDB, and the
            answers are cached so popular lookups are faster — they aren’t linked to you. Posters and logos load directly from TMDB.
          </p>
          <p>
            Fonts load from Google Fonts, and two service logos load from Google’s icon service. The site is hosted on Vercel,
            which keeps standard server logs. When you tap “Watch” you leave ShowFinder for that streaming service’s own site or app.
          </p>
        </>,
      ],
      [
        'Visitor statistics',
        <>
          <p>
            ShowFinder counts visits with Vercel Web Analytics so we can see how many people use it and which pages they visit.
            It doesn’t use cookies and doesn’t identify you: it records things like the page viewed, the referring site, your
            country, and your browser and device type, and it can’t follow you across days or other websites.
          </p>
          <p>ShowFinder has no advertising and no tracking cookies.</p>
        </>,
      ],
    ],
  },
}
