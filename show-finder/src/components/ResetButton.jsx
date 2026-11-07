import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { RotateCcw } from 'lucide-react'
import { resetAll } from '../storage.js'

// "Start over" button + confirmation. Clears services and ratings, then replays the intro.
// variant="intro": the "New here? Start fresh" link on the intro screen, for handing the site to someone new.
export default function ResetButton({ count, variant }) {
  const forNewPerson = variant === 'intro'
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const reset = () => {
    resetAll()
    window.location.hash = ''
    window.location.reload()
  }

  return (
    <>
      {forNewPerson ? (
        <button onClick={() => setOpen(true)} className="fresh text-sm text-amber-100/70 underline-offset-4 hover:text-amber-100 hover:underline">
          New here? Start fresh
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex h-8 items-center gap-1.5 rounded-full border border-white/10 px-2.5 text-sm text-zinc-400 transition hover:border-white/25 hover:text-white"
          title="Start over"
          aria-label="Reset"
        >
          <RotateCcw size={15} />
          <span className="hidden lg:inline">Reset</span>
        </button>
      )}

      {open &&
        createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[var(--surface)] p-6 text-center shadow-2xl"
          >
            <h2 id="reset-title" className="text-xl font-semibold">
              {forNewPerson ? 'Start fresh?' : 'Start over?'}
            </h2>
            <p className="mt-3 text-sm text-zinc-300">
              {forNewPerson
                ? `This clears the last person's streaming services${count ? ` and the ${count} show${count === 1 ? '' : 's'} they rated` : ''}, so you can set up your own.`
                : `This clears your streaming services${count ? ` and the ${count} show${count === 1 ? '' : 's'} you've rated` : ''}, then takes you back to the beginning.`}
            </p>
            <p className="mt-1 text-xs text-zinc-500">Your TMDB key stays saved.</p>
            <div className="mt-6 flex justify-center gap-3">
              <button autoFocus onClick={() => setOpen(false)} className="btn-outline btn-sm">
                Cancel
              </button>
              <button onClick={reset} className="btn-gold btn-sm">
                {forNewPerson ? 'Start fresh' : 'Reset everything'}
              </button>
            </div>
          </div>
        </div>,
          document.body, // outside the header: its backdrop blur would trap a fixed overlay
        )}
    </>
  )
}
