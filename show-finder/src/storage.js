// Small localStorage helpers. Everything is per-browser; no account needed.
export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(`showfinder:${key}`)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(`showfinder:${key}`, JSON.stringify(value))
  } catch {
    /* private mode / storage full — app still works for this visit */
  }
}

export function guessRegion() {
  try {
    const lang = navigator.language || 'en-US'
    const region = lang.split('-')[1]
    return region && region.length === 2 ? region.toUpperCase() : 'US'
  } catch {
    return 'US'
  }
}
