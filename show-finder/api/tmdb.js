// Server-side TMDB proxy (a Vercel Function at /api/tmdb).
//
// The TMDB key lives only here, in the TMDB_API_KEY environment variable, so it never ships to
// visitors' browsers. Only the specific requests ShowFinder makes are allowed, so this can't be
// used as an open door to TMDB. Responses are cached on Vercel's CDN, so popular lookups are
// answered without calling TMDB again.
//
//   GET /api/tmdb?path=/tv/1396/recommendations&page=1

const TMDB = 'https://api.themoviedb.org/3'

const ALLOWED_PATHS = [
  /^\/configuration$/,
  /^\/search\/multi$/,
  /^\/trending\/all\/week$/,
  /^\/discover\/(tv|movie)$/,
  /^\/(tv|movie)\/\d{1,9}$/,
  /^\/(tv|movie)\/\d{1,9}\/(recommendations|similar|watch\/providers)$/,
]

const ALLOWED_PARAMS = new Set([
  'query',
  'page',
  'include_adult',
  'append_to_response',
  'language',
  'region',
  'watch_region',
  'with_watch_providers',
  'with_watch_monetization_types',
  'with_keywords',
  'with_genres',
  'sort_by',
  'vote_count.gte',
])
const ALLOWED_APPENDS = new Set(['keywords', 'watch/providers'])

function cacheFor(path) {
  if (path === '/search/multi') return 'public, s-maxage=3600, stale-while-revalidate=86400'
  if (path === '/trending/all/week') return 'public, s-maxage=3600, stale-while-revalidate=21600'
  // Titles, recommendations and streaming availability change slowly.
  return 'public, s-maxage=21600, stale-while-revalidate=86400'
}

const fail = (res, status, error) => {
  res.setHeader('Cache-Control', 'no-store')
  return res.status(status).json({ error })
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return fail(res, 405, 'method_not_allowed')

  const key = process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY
  if (!key) return fail(res, 503, 'not_configured')

  const query = req.query || {}
  const path = String(query.path || '')
  if (!ALLOWED_PATHS.some((re) => re.test(path))) return fail(res, 400, 'path_not_allowed')

  const url = new URL(TMDB + path)
  for (const [name, raw] of Object.entries(query)) {
    if (name === 'path') continue
    if (!ALLOWED_PARAMS.has(name)) return fail(res, 400, `param_not_allowed:${name}`)
    const value = String(Array.isArray(raw) ? raw[0] : raw)
    if (value.length > 300) return fail(res, 400, `param_too_long:${name}`)
    if (name === 'append_to_response' && !value.split(',').every((v) => ALLOWED_APPENDS.has(v))) {
      return fail(res, 400, 'append_not_allowed')
    }
    url.searchParams.set(name, value)
  }

  // A v4 "Read Access Token" is a JWT (starts with eyJ) sent as a header; a v3 key goes in the URL.
  const bearer = key.startsWith('eyJ')
  if (!bearer) url.searchParams.set('api_key', key)

  let upstream
  try {
    upstream = await fetch(url, {
      headers: { Accept: 'application/json', ...(bearer ? { Authorization: `Bearer ${key}` } : {}) },
    })
  } catch {
    return fail(res, 502, 'tmdb_unreachable')
  }

  if (upstream.status === 401) return fail(res, 502, 'tmdb_key_rejected')
  if (!upstream.ok) return fail(res, upstream.status === 404 ? 404 : 502, `tmdb_error_${upstream.status}`)

  const body = await upstream.text()
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', cacheFor(path))
  return res.status(200).send(body)
}
