// Thin TMDB client + the recommendation logic.
// Streaming availability comes from TMDB's watch-provider data (powered by JustWatch).

const BASE = 'https://api.themoviedb.org/3'
export const IMG = 'https://image.tmdb.org/t/p'
const KEY = import.meta.env.VITE_TMDB_API_KEY || ''

export const hasKey = () => Boolean(KEY)

// A v4 "Read Access Token" is a JWT (starts with eyJ); a v3 key is a short hex string.
const isBearer = KEY.startsWith('eyJ')

const cache = new Map()

async function get(path, params = {}) {
  const url = new URL(BASE + path)
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v)
  }
  if (!isBearer) url.searchParams.set('api_key', KEY)
  const cacheKey = url.toString()
  if (cache.has(cacheKey)) return cache.get(cacheKey)

  const promise = fetch(url, {
    headers: isBearer ? { Authorization: `Bearer ${KEY}` } : {},
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

// All streaming services TMDB knows about in a region (movie + tv lists merged).
export async function listProviders(region) {
  const [m, t] = await Promise.all([
    get('/watch/providers/movie', { watch_region: region }),
    get('/watch/providers/tv', { watch_region: region }),
  ])
  const byId = new Map()
  for (const p of [...m.results, ...t.results]) {
    const prio = p.display_priorities?.[region] ?? p.display_priority ?? 999
    const prev = byId.get(p.provider_id)
    if (!prev || prio < prev.priority) {
      byId.set(p.provider_id, { id: p.provider_id, name: p.provider_name, logo: p.logo_path, priority: prio })
    }
  }
  return [...byId.values()].sort((a, b) => a.priority - b.priority)
}

export async function listRegions() {
  const data = await get('/watch/providers/regions')
  return data.results
    .map((r) => ({ code: r.iso_3166_1, name: r.english_name }))
    .sort((a, b) => a.name.localeCompare(b.name))
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

/**
 * Find titles similar to `seed`, ranked, with availability on the user's services.
 *
 * Strategy:
 *  1. Pull TMDB's own "recommendations" + "similar" lists (what people who liked X also liked).
 *  2. Back-fill with a Discover query: same genres + keywords, restricted to the user's
 *     services, so there's always something they can actually watch without paying more.
 *  3. Score everything, look up where each streams, and split into
 *     "on your services" vs. "elsewhere".
 */
export async function recommend(seed, { region, providerIds }) {
  const { type, id } = seed
  const info = await details(type, id)
  const seedGenres = new Set((info.genres || []).map((g) => g.id))
  const keywordList = info.keywords?.keywords || info.keywords?.results || []
  const topKeywords = keywordList.slice(0, 6).map((k) => k.id)

  const [rec1, rec2, sim] = await Promise.all([
    get(`/${type}/${id}/recommendations`, { page: 1 }),
    get(`/${type}/${id}/recommendations`, { page: 2 }).catch(() => ({ results: [] })),
    get(`/${type}/${id}/similar`, { page: 1 }).catch(() => ({ results: [] })),
  ])

  const discoverBase = {
    watch_region: region,
    with_watch_providers: providerIds.join('|'),
    with_watch_monetization_types: 'flatrate|free|ads',
    sort_by: 'vote_average.desc',
    'vote_count.gte': type === 'tv' ? 100 : 300,
  }
  const discoverCalls = providerIds.length
    ? [
        // genre match (TMDB treats comma as AND, so this is "all the same genres")
        get(`/discover/${type}`, { ...discoverBase, with_genres: [...seedGenres].slice(0, 3).join(',') }),
        // keyword/theme match (pipe = OR)
        topKeywords.length
          ? get(`/discover/${type}`, { ...discoverBase, with_keywords: topKeywords.join('|'), sort_by: 'popularity.desc' })
          : Promise.resolve({ results: [] }),
      ].map((p) => p.catch(() => ({ results: [] })))
    : []
  const discovered = await Promise.all(discoverCalls)

  // Score: being in TMDB's recommendation list counts most; genre overlap and quality break ties.
  const pool = new Map()
  const add = (items, weight, source) => {
    items.forEach((raw, i) => {
      if (raw.id === id) return
      const t = normalize(raw, type)
      const entry = pool.get(t.id) || { ...t, score: 0, sources: new Set() }
      entry.score += weight * (1 - i / 40)
      entry.sources.add(source)
      pool.set(t.id, entry)
    })
  }
  add([...rec1.results, ...rec2.results], 3, 'rec')
  add(sim.results, 1.5, 'similar')
  discovered.forEach((d, i) => add(d.results, i === 0 ? 1.2 : 1.6, 'discover'))

  for (const e of pool.values()) {
    const overlap = e.genreIds.filter((g) => seedGenres.has(g)).length
    e.score += overlap * 0.6
    e.score += (e.rating / 10) * Math.min(1, e.votes / 500)
    if (e.votes < 30) e.score -= 2 // filter out obscure noise
  }

  const ranked = [...pool.values()].sort((a, b) => b.score - a.score).slice(0, 40)

  // Look up availability for each candidate (cached; TMDB rate limits are generous).
  const withProviders = await Promise.all(
    ranked.map(async (t) => {
      try {
        const where = await whereToWatch(t.type, t.id, region)
        return { ...t, where }
      } catch {
        return { ...t, where: { included: [], rent: [], buy: [] } }
      }
    }),
  )

  const mine = new Set(providerIds)
  const onYours = []
  const elsewhere = []
  for (const t of withProviders) {
    t.yourServices = t.where.included.filter((p) => mine.has(p.id))
    t.sources = [...t.sources]
    if (t.yourServices.length) onYours.push(t)
    else elsewhere.push(t)
  }
  return { seed: { ...seed, genres: info.genres || [] }, onYours, elsewhere }
}
