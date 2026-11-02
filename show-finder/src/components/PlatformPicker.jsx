import { useEffect, useMemo, useState } from 'react'
import { IMG, listProviders, listRegions } from '../tmdb.js'

// Lets the user pick their country + the streaming services they already pay for.
export default function PlatformPicker({ region, selected, onSave, onCancel, firstRun }) {
  const [regionDraft, setRegionDraft] = useState(region)
  const [picked, setPicked] = useState(new Set(selected))
  const [regions, setRegions] = useState([])
  const [providers, setProviders] = useState([])
  const [filter, setFilter] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listRegions().then(setRegions).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    setError('')
    listProviders(regionDraft)
      .then(setProviders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [regionDraft])

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase()
    let list = q ? providers.filter((p) => p.name.toLowerCase().includes(q)) : providers
    if (!q && !showAll) {
      // Always keep already-picked ones visible, plus the most popular services.
      list = list.filter((p, i) => i < 24 || picked.has(p.id))
    }
    return list
  }, [providers, filter, showAll, picked])

  const toggle = (id) => {
    const next = new Set(picked)
    next.has(id) ? next.delete(id) : next.add(id)
    setPicked(next)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">{firstRun ? 'Which services do you have?' : 'Your streaming services'}</h1>
      <p className="mt-1 text-zinc-400">
        We'll put shows you can already watch first, so you don't have to sign up for anything new.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          Country
          <select
            value={regionDraft}
            onChange={(e) => {
              setRegionDraft(e.target.value)
              setPicked(new Set()) // provider IDs/catalogs differ by country
            }}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
          >
            {(regions.length ? regions : [{ code: regionDraft, name: regionDraft }]).map((r) => (
              <option key={r.code} value={r.code}>{r.name}</option>
            ))}
          </select>
        </label>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search services…"
          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-950 p-3 text-red-200">{error}</p>}
      {loading && <p className="mt-6 text-zinc-400">Loading services…</p>}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {visible.map((p) => {
          const on = picked.has(p.id)
          return (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              aria-pressed={on}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left text-sm transition ${
                on ? 'border-violet-500 bg-violet-500/15' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'
              }`}
            >
              {p.logo && <img src={`${IMG}/w92${p.logo}`} alt="" className="h-9 w-9 rounded-lg" />}
              <span className="flex-1 leading-tight">{p.name}</span>
              {on && <span className="text-violet-400">✓</span>}
            </button>
          )
        })}
      </div>

      {!filter && providers.length > 24 && (
        <button onClick={() => setShowAll((s) => !s)} className="mt-4 text-sm text-violet-400 hover:underline">
          {showAll ? 'Show fewer' : `Show all ${providers.length} services`}
        </button>
      )}

      <div className="sticky bottom-0 mt-8 flex items-center gap-3 border-t border-zinc-800 bg-zinc-950/95 py-4">
        <span className="flex-1 text-sm text-zinc-400">{picked.size} selected</span>
        {!firstRun && (
          <button onClick={onCancel} className="rounded-lg px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800">
            Cancel
          </button>
        )}
        <button
          disabled={picked.size === 0}
          onClick={() => onSave({ region: regionDraft, providers: [...picked] })}
          className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold hover:bg-violet-500 disabled:opacity-40"
        >
          {firstRun ? 'Start finding shows' : 'Save'}
        </button>
      </div>
    </div>
  )
}
