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
  return parseProviders(data, region)
}

function parseProviders(data, region) {
  const r = data?.results?.[region] || {}
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
//
// How a title earns its place:
//  1. "People who liked this also liked" (TMDB recommendations, 3 pages) — the strongest signal.
//  2. Second hop: what's recommended for the top recommendations. Titles that keep showing up
//     across those lists are very likely the same kind of show.
//  3. A theme search on YOUR services (same specific keywords), so there's something to watch now.
//  Then every finalist is checked against the shows you loved for shared themes (keywords) and
//  genres, mismatches (cartoon vs. live-action, kids/reality/talk shows, different language) are
//  pushed down, and anything that looks like what you rated "Not for me" is penalised.

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

// Genres that change what kind of thing a title *is*. Mismatch here = not a real match.
const FORMAT_GENRES = new Set([16, 10762, 10751, 10763, 10764, 10766, 10767, 99, 10770])
// Keywords that say nothing about a show's feel.
const GENERIC_KEYWORD = /stinger|woman director|based on (novel|book)|^(sequel|prequel|remake|reboot|miniseries|tv series|series|season|episode)$|^\d{4}s?$|^(male|female) protagonist$|^duringcreditsstinger$/i

const none = { results: [] }
const keyOfT = (t) => `${t.type}:${t.id}`
const keywordsOf = (d) => (d.keywords?.keywords || d.keywords?.results || []).filter((k) => !GENERIC_KEYWORD.test(k.name))
const genresOf = (d) => new Set(d.genre_ids || (d.genres || []).map((g) => g.id))

// Full info for one title: keywords + where it streams, in a single request.
const enriched = (type, id) => get(`/${type}/${id}`, { append_to_response: 'keywords,watch/providers' })

// A taste profile from one or more titles: weighted keywords, genres, languages.
async function buildProfile(seeds) {
  const infos = await Promise.all(seeds.map((s) => enriched(s.type, s.id).catch(() => null)))
  const kw = new Map()
  const genres = new Map()
  const langs = new Map()
  let kwTotal = 0
  infos.forEach((info, i) => {
    if (!info) return
    const w = seeds[i].weight || 1
    for (const k of keywordsOf(info)) {
      kw.set(k.id, (kw.get(k.id) || 0) + w)
      kwTotal += w
    }
    for (const g of genresOf(info)) genres.set(g, (genres.get(g) || 0) + w)
    langs.set(info.original_language, (langs.get(info.original_language) || 0) + w)
  })
  return { kw, kwTotal, genres, langs, infos }
}

// Gather candidates for one seed. Collaborative score only; content scoring happens later.
async function gather(seed, info, { region, providerIds }, pool, weight, label) {
  const { type, id } = seed
  const [r1, r2, r3, sim] = await Promise.all([
    get(`/${type}/${id}/recommendations`, { page: 1 }).catch(() => none),
    get(`/${type}/${id}/recommendations`, { page: 2 }).catch(() => none),
    get(`/${type}/${id}/recommendations`, { page: 3 }).catch(() => none),
    get(`/${type}/${id}/similar`, { page: 1 }).catch(() => none),
  ])
  const recs = [...r1.results, ...r2.results, ...r3.results]

  const add = (items, w, source) =>
    items.forEach((raw, i) => {
      if (raw.id === id) return
      const t = normalize(raw, type)
      const key = keyOfT(t)
      const e = pool.get(key) || { ...t, lang: raw.original_language, collab: 0, hits: 0, because: new Set(), sources: new Set() }
      e.collab += weight * w * (1 - i / (items.length + 10))
      e.hits += 1
      e.because.add(label)
      e.sources.add(source)
      pool.set(key, e)
    })

  add(recs, 3, 'rec')
  add(sim.results, 0.8, 'similar')

  // Second hop: recommendations of the top recommendations.
  const hop = await Promise.all(
    recs.slice(0, 6).map((r) => get(`/${type}/${r.id}/recommendations`, { page: 1 }).catch(() => none)),
  )
  hop.forEach((h) => add(h.results, 0.6, 'hop'))

  // Theme search restricted to the user's services (specific keywords only).
  const kws = keywordsOf(info).slice(0, 8).map((k) => k.id)
  if (providerIds.length && kws.length) {
    const d = await get(`/discover/${type}`, {
      watch_region: region,
      with_watch_providers: providerIds.join('|'),
      with_watch_monetization_types: 'flatrate|free|ads',
      with_keywords: kws.join('|'),
      sort_by: 'vote_count.desc',
      'vote_count.gte': type === 'tv' ? 50 : 200,
    }).catch(() => none)
    add(d.results, 0, 'theme') // no collaborative credit — must earn its place on content
  }
}

// Content similarity of an enriched candidate against the profile.
function contentScore(cand, info, profile) {
  const ckw = keywordsOf(info)
  let shared = 0
  let sharedW = 0
  for (const k of ckw) {
    const w = profile.kw.get(k.id)
    if (w) {
      shared += 1
      sharedW += w
    }
  }
  const kwSim = ckw.length && profile.kwTotal ? sharedW / Math.sqrt(ckw.length * profile.kwTotal) : 0

  const cg = genresOf(info)
  const pg = [...profile.genres.keys()]
  const union = new Set([...cg, ...pg]).size || 1
  const genreSim = [...cg].filter((g) => profile.genres.has(g)).length / union

  // Multipliers (not fixed deductions) so they bite equally hard however many shows feed in.
  let factor = 1
  // Format mismatch: e.g. an animated or kids show for a live-action drama, or a reality/talk show.
  for (const g of cg) if (FORMAT_GENRES.has(g) && !profile.genres.has(g)) factor *= 0.3
  if (profile.genres.has(16) && !cg.has(16)) factor *= 0.6 // anime/cartoon fans: prefer animation
  if (cg.size && ![...cg].some((g) => profile.genres.has(g))) factor *= 0.4 // no genre in common at all
  if (!profile.langs.has(info.original_language)) factor *= 0.85
  if (shared === 0) factor *= 0.6 // "people also watched" but nothing thematically alike

  return { kwSim, genreSim, shared, factor }
}

async function rank(profile, pool, { region, serviceIds, exclude, dislikedPool }) {
  // Pre-rank on collaborative signal, keep a healthy number of on-theme service matches too.
  const all = [...pool.values()].filter((e) => !exclude.has(keyOfT(e)) && e.votes >= 25)
  const byCollab = all.filter((e) => e.collab > 0).sort((a, b) => b.collab - a.collab).slice(0, 60)
  const themeOnly = all.filter((e) => e.collab === 0).slice(0, 20)
  const finalists = [...byCollab, ...themeOnly]

  const scored = await Promise.all(
    finalists.map(async (e) => {
      let info
      try {
        info = await enriched(e.type, e.id)
      } catch {
        return null
      }
      const c = contentScore(e, info, profile)
      // Theme-search finds must share real themes, not just one tag.
      if (e.collab === 0 && c.shared < 3) return null
      const quality = ((info.vote_average || 0) / 10) * Math.min(1, (info.vote_count || 0) / 400)
      let score =
        e.collab + // people who liked yours liked this
        12 * c.kwSim + // shared specific themes
        3 * c.genreSim +
        1.5 * quality +
        Math.min(3, (e.hits - 1) * 0.4) + // keeps showing up across lists
        (e.because.size > 1 ? e.because.size : 0) // similar to several things you love
      score *= c.factor
      if (dislikedPool?.has(keyOfT(e))) score *= Math.pow(0.5, dislikedPool.get(keyOfT(e)))
      const where = parseProviders(info['watch/providers'], region)
      return {
        ...e,
        rating: info.vote_average || e.rating,
        votes: info.vote_count || e.votes,
        score,
        where,
        yourServices: myServicesFor(where, serviceIds),
        because: [...e.because],
        sources: [...e.sources],
      }
    }),
  )

  const ranked = scored.filter(Boolean).sort((a, b) => b.score - a.score)
  // Drop the tail that isn't really similar.
  const best = ranked[0]?.score || 0
  const good = ranked.filter((t, i) => i < 6 || t.score >= Math.max(2, best * 0.35))
  return {
    onYours: good.filter((t) => t.yourServices.length).slice(0, 30),
    elsewhere: good.filter((t) => !t.yourServices.length).slice(0, 20),
  }
}

// Titles TMDB would recommend off your "Not for me" picks — used as a negative signal.
async function dislikedSignal(disliked) {
  const map = new Map()
  const lists = await Promise.all(
    disliked.slice(0, 4).map((d) => get(`/${d.type}/${d.id}/recommendations`, { page: 1 }).catch(() => none)),
  )
  lists.forEach((l, li) =>
    l.results.slice(0, 20).forEach((r) => {
      const key = `${disliked[li].type}:${r.id}`
      map.set(key, (map.get(key) || 0) + 1)
    }),
  )
  return map
}

/** "Because you liked X" — recommendations from one title. */
export async function recommend(seed, { region, serviceIds, exclude = new Set(), disliked = [] }) {
  const profile = await buildProfile([seed])
  const info = profile.infos[0]
  if (!info) throw new Error("Couldn't load that title — try again.")
  const pool = new Map()
  const providerIds = providerIdsFor(serviceIds)
  const label = seed.title || info.title || info.name
  const [, dislikedPool] = await Promise.all([
    gather(seed, info, { region, providerIds }, pool, 1, label),
    dislikedSignal(disliked),
  ])
  const placed = await rank(profile, pool, { region, serviceIds, exclude, dislikedPool })
  return { seed: { ...seed, genres: info.genres || [] }, ...placed }
}

/** "For you" — blends recommendations from several titles you loved/liked. */
export async function recommendForYou(seeds, { region, serviceIds, exclude = new Set(), disliked = [] }) {
  const profile = await buildProfile(seeds)
  const pool = new Map()
  const providerIds = providerIdsFor(serviceIds)
  const [, dislikedPool] = await Promise.all([
    Promise.all(
      seeds.map((s, i) =>
        profile.infos[i] ? gather(s, profile.infos[i], { region, providerIds }, pool, s.weight || 1, s.title).catch(() => {}) : null,
      ),
    ),
    dislikedSignal(disliked),
  ])
  return rank(profile, pool, { region, serviceIds, exclude, dislikedPool })
}
