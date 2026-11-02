import { useState } from 'react'
import { SERVICES } from '../services.js'
import ServiceLogo from './ServiceLogo.jsx'

export default function ServicePicker({ selected, onSave, onCancel, firstRun }) {
  const [picked, setPicked] = useState(new Set(selected))
  const toggle = (id) => {
    const next = new Set(picked)
    next.has(id) ? next.delete(id) : next.add(id)
    setPicked(next)
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-4xl px-4 pb-32 pt-12">
        {firstRun && <p className="text-xs uppercase tracking-[.3em] text-amber-200/60">Step 1 of 2</p>}
        <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
          <span className="gold-text">Which services do you use?</span>
        </h1>
        <p className="mt-2 text-zinc-400">Pick as many as you have. We'll show you what you can watch without paying for anything new.</p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {SERVICES.map((s) => {
            const on = picked.has(s.id)
            return (
              <button
                key={s.id}
                onClick={() => toggle(s.id)}
                aria-pressed={on}
                className="group flex flex-col items-center gap-2 rounded-3xl p-1 text-center outline-none"
              >
                <div
                  className={`relative aspect-square w-full rounded-2xl transition duration-200 ${
                    on
                      ? 'scale-[1.03] ring-2 ring-amber-300 shadow-[0_0_28px_rgba(241,210,127,.45)]'
                      : 'ring-1 ring-white/10 opacity-80 group-hover:opacity-100 group-hover:ring-white/30 group-focus-visible:ring-white/50'
                  }`}
                >
                  <ServiceLogo service={s} />
                  {on && (
                    <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-300 text-sm font-bold text-black shadow">
                      ✓
                    </span>
                  )}
                </div>
                <span className={`text-sm ${on ? 'text-amber-100' : 'text-zinc-400'}`}>{s.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-white/10 bg-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-4">
          <span className="flex-1 text-sm text-zinc-400">{picked.size} selected</span>
          {!firstRun && (
            <button onClick={onCancel} className="rounded-full px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-900">
              Cancel
            </button>
          )}
          <button className="btn-gold" disabled={picked.size === 0} onClick={() => onSave([...picked])}>
            {firstRun ? 'Next' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
