import { useState } from 'react'
import { setKey } from '../tmdb.js'

// Shown when the site has no TMDB key yet. Paste one once; it's saved in this browser.
export default function KeySetup({ onDone }) {
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await setKey(value)
      onDone()
    } catch (err) {
      setError(err.message === 'Invalid TMDB API key' ? "That key didn't work — double-check you copied all of it." : err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="card mx-auto max-w-xl p-6 sm:p-8">
      <p className="eyebrow">One-time setup</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">Connect the movie database</h2>
      <p className="mt-2 text-sm text-zinc-300">
        ShowFinder gets shows, movies and where-to-stream info from TMDB (free). Paste your TMDB key to turn on search
        and recommendations:
      </p>
      <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-zinc-400">
        <li>
          Make a free account at{' '}
          <a className="text-amber-200 underline" href="https://www.themoviedb.org/signup" target="_blank" rel="noreferrer">
            themoviedb.org
          </a>
        </li>
        <li>
          Go to{' '}
          <a className="text-amber-200 underline" href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer">
            Settings → API
          </a>{' '}
          and request a key (personal use)
        </li>
        <li>Copy the <b>API Key</b> (or the long Read Access Token) and paste it here</li>
      </ol>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Paste your TMDB key"
        className="mt-5 w-full rounded-xl border border-white/10 bg-black px-4 py-3 font-mono text-sm outline-none transition focus:border-amber-300/70"
      />
      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
      <button className="btn-gold mt-4 w-full sm:w-auto" disabled={!value.trim() || busy}>
        {busy ? 'Checking…' : 'Save key'}
      </button>
    </form>
  )
}
