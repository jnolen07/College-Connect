import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Airplay, ArrowLeft, Cast, Check, Copy, Mic, Search, Smartphone, Tv, X } from 'lucide-react'
import { IMG } from '../tmdb.js'
import { load, save } from '../storage.js'
import ServiceLogo from './ServiceLogo.jsx'

// A website can't control a TV (browsers block talking to devices on your network, and streaming
// services don't let other apps start playback). So "Send to TV" gives the fastest real way for the
// viewer's kind of TV: voice remote, casting from the service's phone app, or searching on the TV.

export const TV_TYPES = [
  { id: 'googletv', name: 'Google TV / Chromecast', hint: 'Includes Android TV and TVs with Chromecast built-in', voice: 'Google Assistant', cast: 'cast' },
  { id: 'appletv', name: 'Apple TV', hint: 'Apple TV box with a Siri remote', voice: 'Siri', cast: 'airplay' },
  { id: 'roku', name: 'Roku', hint: 'Roku stick, box or Roku TV', voice: 'voice', cast: null },
  { id: 'firetv', name: 'Amazon Fire TV', hint: 'Fire TV stick or Fire TV', voice: 'Alexa', cast: null },
  { id: 'smart', name: 'Smart TV', hint: 'Samsung, LG, Vizio, Sony and others — including TVs with AirPlay', voice: null, cast: 'either' },
]

// "Peacock Premium" -> "Peacock", "Amazon Prime Video with Ads" -> "Amazon Prime Video".
const spokenName = (name) => name.replace(/\s+(premium( plus)?|with ads|standard with ads|basic with ads|amazon channel|apple tv channel)$/i, '').trim()

export default function SendToTv({ provider, serviceName, title, phoneLink, onClose }) {
  const [tvType, setTvType] = useState(() => load('tvType', null))
  const [picking, setPicking] = useState(!tvType)
  const [copied, setCopied] = useState(false)
  const tv = TV_TYPES.find((t) => t.id === tvType)
  const app = serviceName || spokenName(provider.name)
  const phrase = `${title.title} on ${app}`

  useEffect(() => {
    // Capture so Escape closes only this panel, not the details sheet underneath.
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onClose])

  const choose = (id) => {
    setTvType(id)
    save('tvType', id)
    setPicking(false)
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(title.title)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable — the title is on screen anyway */
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Send to TV"
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-[var(--surface)] p-5 shadow-2xl sm:max-w-lg sm:rounded-3xl sm:p-7"
      >
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/[.06] hover:bg-white/10">
          <X size={18} />
        </button>

        {picking ? (
          <>
            <p className="eyebrow">Send to TV</p>
            <h2 className="mt-2 pr-10 text-2xl font-semibold tracking-tight">What do you watch on?</h2>
            <p className="mt-1.5 text-sm text-zinc-400">We’ll remember this and show the quickest way for your TV.</p>
            <div className="mt-5 space-y-2">
              {TV_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => choose(t.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition ${
                    t.id === tvType ? 'border-amber-300/60 bg-amber-300/10' : 'border-white/[.08] bg-white/[.02] hover:border-white/25'
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[.06] text-amber-200">
                    <Tv size={20} />
                  </span>
                  <span className="flex-1">
                    <span className="block font-medium">{t.name}</span>
                    <span className="block text-xs text-zinc-500">{t.hint}</span>
                  </span>
                  {t.id === tvType && <Check size={18} className="text-amber-300" />}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="eyebrow">Send to TV</p>
            <div className="mt-3 flex items-center gap-3 pr-10">
              {provider.service ? (
                <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                  <ServiceLogo service={provider.service} className="!rounded-xl !p-2" />
                </span>
              ) : provider.logo ? (
                <img src={`${IMG}/w92${provider.logo}`} alt="" className="h-12 w-12 shrink-0 rounded-xl" />
              ) : (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/[.06] font-bold">{app[0]}</span>
              )}
              <div className="min-w-0">
                <h2 className="truncate text-xl font-semibold tracking-tight">{title.title}</h2>
                <p className="text-sm text-zinc-400">on {app}</p>
              </div>
            </div>

            <ol className="mt-6 space-y-3">
              {tv.voice && (
                <Way icon={Mic} label="Fastest" title={`Ask your remote`}>
                  Hold the {tv.voice === 'voice' ? 'microphone' : tv.voice} button on your {tv.name.split(' /')[0]} remote and say:
                  <span className="mt-2 block rounded-lg border border-amber-300/30 bg-amber-300/[.08] px-3 py-2 text-base font-semibold text-amber-100">
                    “{phrase}”
                  </span>
                </Way>
              )}
              {tv.cast && (
                <Way
                  icon={tv.cast === 'airplay' ? Airplay : Cast}
                  label={tv.voice ? null : 'Fastest'}
                  title={tv.cast === 'airplay' ? 'AirPlay from your phone' : tv.cast === 'cast' ? 'Cast from your phone' : 'Cast or AirPlay from your phone'}
                >
                  Open it in the {app} app, start playing, then tap the{' '}
                  {tv.cast === 'airplay' ? 'AirPlay' : tv.cast === 'cast' ? 'Cast' : 'Cast or AirPlay'} icon and pick your TV. Your phone and TV
                  need to be on the same Wi-Fi.
                  <a href={phoneLink} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm mt-3 w-full sm:w-auto">
                    <Smartphone size={15} /> Open in {app}
                  </a>
                </Way>
              )}
              <Way icon={Search} label={!tv.voice && !tv.cast ? 'Fastest' : null} title="Search on your TV">
                Open the {app} app on your TV, go to Search and type <b className="text-zinc-200">{title.title}</b>.
                <button onClick={copy} className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300">
                  {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied' : 'Copy title'}
                </button>
              </Way>
            </ol>

            <a
              href={phoneLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="btn-outline mt-5 w-full"
            >
              <Smartphone size={16} /> Watch on this device instead
            </a>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/[.06] pt-4 text-sm">
              <button onClick={() => setPicking(true)} className="flex items-center gap-1.5 text-zinc-400 hover:text-white">
                <Tv size={15} /> {tv.name} · Change
              </button>
              <button onClick={onClose} className="flex items-center gap-1.5 text-zinc-400 hover:text-white">
                <ArrowLeft size={15} /> Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}

function Way({ icon: Icon, label, title, children }) {
  return (
    <li className="rounded-2xl border border-white/[.08] bg-white/[.02] p-4">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[.06] text-amber-200">
          <Icon size={17} />
        </span>
        <span className="font-semibold">{title}</span>
        {label && <span className="ml-auto rounded-full bg-amber-300/15 px-2 py-0.5 text-[11px] font-semibold text-amber-200">{label}</span>}
      </div>
      <div className="mt-2.5 text-sm leading-relaxed text-zinc-400">{children}</div>
    </li>
  )
}
