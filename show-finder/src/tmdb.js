// Thin TMDB client + the recommendation logic.
// Streaming availability comes from TMDB's watch-provider data (powered by JustWatch).

const BASE = 'https://api.themoviedb.org/3'
export const IMG = 'https://image.tmdb.org/t/p'
import { serviceFor, serviceById } from './services.js'

// Key comes from the build (VITE_TMDB_API_KEY) or, if missing, one pasted into the site itself.
const LS_KEY = 'showfinder:tmdbKey'
let KEY = import.meta.env.VITE_TMDB_API_KEY || readStoredKey()
function readStoredKey() {
  try {
    return localStorage.getItem(LS_KEY) || ''
  } catch {
    return ''
  }
}
export const hasKey = () => Boolean(KEY)
export async function setKey(k) {
  const prev = KEY
  KEY = k.trim()
  try {
    await get('/configuration')
  } catch (e) {
    KEY = prev
    throw e
  }
  try {
    localStorage.setItem(LS_KEY, KEY)
  } catch {}
}

// A v4 "Read Access Token" is a JWT (starts with eyJ); a v3 key is a short hex string.
const isBearer = () => KEY.startsWith('eyJ')

const cache = new Map()

async function get(path, params = {}) {
  const url = new URL(BASE + path)
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v)
  }
  if (!isBearer()) url.searchParams.set('api_key', KEY)
  const cacheKey = url.toString()
  if (cache.has(cacheKey)) return cache.get(cacheKey)

  const promise = fetch(url, {
    headers: isBearer() ? { Authorization: `Bearer ${KEY}` } : {},
  }).then(async (res) => {
    if (!res.ok) {
      cache.delete(cacheKey)
      throw new Error(res.status === 401 ? 'Invalid TMDB API key' : `TMDB error ${res.status}`)
    }
    return res.json()
  })
  cache.set(cacheKey, promise)
  return promise
}

// ---------- normalising ----------

export function normalize(item, fallbackType) {
  const type = item.media_type || fallbackType
  const date = item.release_date || item.first_air_date || ''
  return {
    id: item.id,
    type, // 'movie' | 'tv'
    title: item.title || item.name,
    year: date.slice(0, 4),
    overview: item.overview,
    poster: item.poster_path,
    backdrop: item.backdrop_path,
    rating: item.vote_average || 0,
    votes: item.vote_count || 0,
    genreIds: item.genre_ids || (item.genres || []).map((g) => g.id),
    popularity: item.popularity || 0,
  }
}

// ---------- endpoints ----------

export async function searchTitles(query) {
  const data = await get('/search/multi', { query, include_adult: false })
  return data.results
    .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
    .map((r) => normalize(r))
}

export async function trending() {
  const data = await get('/trending/all/week')
  return data.results
    .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
    .map((r) => normalize(r))
}

// Where a single title streams in a region.
// Returns { included: [...providers], rent: [...], buy: [...], link }
export async function whereToWatch(type, id, region) {
  const data = await get(`/${type}/${id}/watch/providers`)
  const r = data.results?.[region] || {}
  const map = (arr = []) => arr.map((p) => ({ id: p.provider_id, name: p.provider_name, logo: p.logo_path }))
  return {
    included: dedupe([...map(r.flatrate), ...map(r.free), ...map(r.ads)]),
    rent: map(r.rent),
    buy: map(r.buy),
    link: r.link,
  }
}

function dedupe(list) {
  const seen = new Set()
  return list.filter((p) => (seen.has(p.id) ? false : seen.add(p.id)))
}

export async function details(type, id) {
  return get(`/${type}/${id}`, { append_to_response: 'keywords' })
}

// ---------- recommendations ----------

const providerIdsFor = (serviceIds) => serviceIds.flatMap((id) => serviceById[id]?.tmdbIds || [])

// Which of the user's services carry this title (from a whereToWatch result).
export function myServicesFor(where, serviceIds) {
  const mine = new Set(serviceIds)
  const found = new Map()
  for (const p of where.included) {
    const s = serviceFor(p)
    if (s && mine.has(s.id)) found.set(s.id, s)
  }
  return [...found.values()]
}

// Score candidates similar to one seed. Returns Map(key -> candidate).
async function candidatesFor(seed, { region, serviceIds }, weight = 1) {
  const { type, id } = seed
  const info = await details(type, id)
  const seedGenres = new Set((info.genres || []).map((g) => g.id))
  const keywordList = info.keywords?.keywords || info.keywords?.results || []
  const topKeywords = keywordList.slice(0, 6).map((k) => k.id)
  const providerIds = providerIdsFor(serviceIds)

  const none = { results: [] }
  const [rec1, rec2, sim] = await Promise.all([
    get(`/${type}/${id}/recommendations`, { page: 1 }).catch(() => none),
    get(`/${type}/${id}/recommendations`, { page: 2 }).catch(() => none),
    get(`/${type}/${id}/similar`, { page: 1 }).catch(() => none),
  ])

  // Discover = same genres / same themes, but ONLY on the user's services.
  const discoverBase = {
    watch_region: region,
    with_watch_providers: providerIds.join('|'),
    with_watch_monetization_types: 'flatrate|free|ads',
    sort_by: 'vote_average.desc',
    'vote_count.gte': type === 'tv' ? 100 : 300,
  }
  const discovered = providerIds.length
    ? await Promise.all([
        get(`/discover/${type}`, { ...discoverBase, with_genres: [...seedGenres].slice(0, 3).join(',') }).catch(() => none),
        topKeywords.length
          ? get(`/discover/${type}`, { ...discoverBase, with_keywords: topKeywords.join('|'), sort_by: 'popularity.desc' }).catch(() => none)
          : none,
      ])
    : []

  const pool = new Map()
  const add = (items, w) => {
    items.forEach((raw, i) => {
      if (raw.id === id) return
      const t = normalize(raw, type)
      const key = `${t.type}:${t.id}`
      const entry = pool.get(key) || { ...t, score: 0, because: new Set() }
      entry.score += weight * w * (1 - i / 40)
      entry.because.add(seed.title || info.title || info.name)
      pool.set(key, entry)
    })
  }
  add([...rec1.results, ...rec2.results], 3)
  add(sim.results, 1.5)
  discovered.forEach((d, i) => add(d.results, i === 0 ? 1.2 : 1.6))

  for (const e of pool.values()) {
    const overlap = e.genreIds.filter((g) => seedGenres.has(g)).length
    e.score += weight * overlap * 0.6
  }
  return { pool, info }
}

async function placeOnServices(ranked, { region, serviceIds }) {
  const withWhere = await Promise.all(
    ranked.map(async (t) => {
      try {
        return { ...t, where: await whereToWatch(t.type, t.id, region) }
      } catch {
        return { ...t, where: { included: [], rent: [], buy: [] } }
      }
    }),
  )
  const onYours = []
  const elsewhere = []
  for (const t of withWhere) {
    t.yourServices = myServicesFor(t.where, serviceIds)
    t.because = [...t.because]
    ;(t.yourServices.length ? onYours : elsewhere).push(t)
  }
  return { onYours, elsewhere }
}

function finalize(pool, exclude) {
  for (const e of pool.values()) {
    e.score += (e.rating / 10) * Math.min(1, e.votes / 500)
    if (e.votes < 30) e.score -= 2 // obscure noise
    if (e.because.size > 1) e.score += e.because.size // similar to several things you love
  }
  return [...pool.values()]
    .filter((e) => !exclude.has(`${e.type}:${e.id}`))
    .sort((a, b) => b.score - a.score)
    .slice(0, 40)
}

/** "Because you liked X" — recommendations from one title. */
export async function recommend(seed, { region, serviceIds, exclude = new Set() }) {
  const { pool, info } = await candidatesFor(seed, { region, serviceIds })
  const placed = await placeOnServices(finalize(pool, exclude), { region, serviceIds })
  return { seed: { ...seed, genres: info.genres || [] }, ...placed }
}

/** "For you" — blends recommendations from several titles you loved/liked. */
export async function recommendForYou(seeds, { region, serviceIds, exclude = new Set() }) {
  const results = await Promise.all(
    seeds.map((s) => candidatesFor(s, { region, serviceIds }, s.weight || 1).catch(() => null)),
  )
  const pool = new Map()
  for (const r of results) {
    if (!r) continue
    for (const [key, c] of r.pool) {
      const prev = pool.get(key)
      if (!prev) pool.set(key, { ...c, because: new Set(c.because) })
      else {
        prev.score += c.score
        c.because.forEach((b) => prev.because.add(b))
      }
    }
  }
  return placeOnServices(finalize(pool, exclude), { region, serviceIds })
}
