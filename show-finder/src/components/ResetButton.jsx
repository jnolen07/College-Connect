import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { resetAll } from '../storage.js'

// "Start over" button + confirmation. Clears services and ratings, then replays the intro.
export default function ResetButton({ count }) {
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
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full border border-zinc-800 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-900"
        title="Start over"
        aria-label="Reset"
      >
        <span aria-hidden>↺</span>
        <span className="hidden sm:inline">Reset</span>
      </button>

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
            className="w-full max-w-sm rounded-2xl border border-amber-300/25 bg-zinc-950 p-6 text-center shadow-[0_0_40px_rgba(241,210,127,.12)]"
          >
            <h2 id="reset-title" className="font-display text-2xl">
              <span className="gold-text">Start over?</span>
            </h2>
            <p className="mt-3 text-sm text-zinc-300">
              This clears your streaming services{count ? ` and the ${count} show${count === 1 ? '' : 's'} you've rated` : ''},
              then takes you back to the beginning.
            </p>
            <p className="mt-1 text-xs text-zinc-500">Your TMDB key stays saved.</p>
            <div className="mt-6 flex justify-center gap-3">
              <button autoFocus onClick={() => setOpen(false)} className="rounded-full px-5 py-2 text-sm text-zinc-300 hover:bg-zinc-900">
                Cancel
              </button>
              <button onClick={reset} className="btn-gold whitespace-nowrap !px-5 !py-2 !tracking-[.12em]">
                Reset everything
              </button>
            </div>
          </div>
        </div>,
          document.body, // outside the header: its backdrop blur would trap a fixed overlay
        )}
    </>
  )
}
