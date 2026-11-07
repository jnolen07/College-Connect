import { serviceFor } from './services.js'

// TMDB lists every subscription tier ("Paramount Plus Premium", "Paramount Plus Essential") and every
// add-on channel ("Paramount+ Amazon Channel", "Paramount Plus Apple TV Channel") as separate
// providers. People just want "Paramount+", so collapse them into one brand per service.

const CHANNEL = /\s+(amazon channel|apple tv channel|roku premium channel)$/i
const TIER = /\s+(premium plus|premium|essential|standard with ads|basic with ads|with ads|ad[- ]free)$/i

export function brandOf(provider) {
  const name = provider.name.trim()
  const base = name.replace(CHANNEL, '').replace(TIER, '').trim()
  const service = serviceFor({ ...provider, name }) || serviceFor({ id: -1, name: base })
  if (service) return { key: service.id, name: service.name, service }
  return { key: base.toLowerCase().replace(/[^a-z0-9]+/g, ''), name: base }
}

/** Collapse a provider list into one entry per brand, keeping the first-seen order. */
export function groupBrands(providers) {
  const brands = new Map()
  for (const p of providers) {
    const b = brandOf(p)
    const cur = brands.get(b.key)
    if (cur) {
      cur.members.push(p)
      // Prefer the logo of the plainest listing (the one whose name is the brand name itself).
      if (p.logo && p.name.trim() === b.name && !cur.exactLogo) {
        cur.logo = p.logo
        cur.exactLogo = true
      }
    } else {
      brands.set(b.key, { ...b, id: b.key, logo: p.logo, exactLogo: p.name.trim() === b.name, members: [p] })
    }
  }
  return [...brands.values()]
}
