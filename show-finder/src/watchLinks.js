// Where a provider button goes. TMDB doesn't give per-service deep links, so each one opens that
// service's own search for the title (on phones this usually opens the app if it's installed).
// Anything we don't know falls back to TMDB's full where-to-watch page for the title.
const q = (s) => encodeURIComponent(s)

const SEARCH = [
  [/netflix/i, (t) => `https://www.netflix.com/search?q=${q(t)}`],
  [/amazon prime|prime video|amazon video/i, (t) => `https://www.amazon.com/s?k=${q(t)}&i=instant-video`],
  [/disney/i, (t) => `https://www.disneyplus.com/search?q=${q(t)}`],
  [/^max\b|hbo max/i, (t) => `https://play.hbomax.com/search?q=${q(t)}`],
  [/hulu/i, (t) => `https://www.hulu.com/search?q=${q(t)}`],
  [/peacock/i, (t) => `https://www.peacocktv.com/search?q=${q(t)}`],
  [/paramount/i, (t) => `https://www.paramountplus.com/search/?q=${q(t)}`],
  [/apple tv/i, (t) => `https://tv.apple.com/search?term=${q(t)}`],
  [/crunchyroll/i, (t) => `https://www.crunchyroll.com/search?q=${q(t)}`],
  [/tubi/i, (t) => `https://tubitv.com/search/${q(t)}`],
  [/pluto/i, (t) => `https://pluto.tv/search/details?query=${q(t)}`],
  [/the roku channel/i, (t) => `https://therokuchannel.roku.com/search/${q(t)}`],
  [/youtube/i, (t, type) => `https://www.youtube.com/results?search_query=${q(`${t} ${type === 'movie' ? 'full movie' : 'tv'}`)}`],
  [/google play/i, (t) => `https://play.google.com/store/search?q=${q(t)}&c=movies`],
  [/fandango|vudu/i, (t) => `https://athome.fandango.com/content/browse/search?searchString=${q(t)}`],
  [/microsoft/i, (t) => `https://www.microsoft.com/en-us/search/shop/movies?q=${q(t)}`],
  [/starz/i, (t) => `https://www.starz.com/us/en/search?q=${q(t)}`],
  [/mgm\+|mgm plus/i, (t) => `https://www.mgmplus.com/search?q=${q(t)}`],
  [/amc\+|amc plus/i, (t) => `https://www.amcplus.com/search?q=${q(t)}`],
  [/fubo/i, (t) => `https://www.fubo.tv/search?q=${q(t)}`],
  [/sling/i, (t) => `https://watch.sling.com/search?query=${q(t)}`],
]

// Add-on channels ("Paramount+ Amazon Channel") are watched inside the store they're named after.
const CHANNEL_HOST = { amazon: 'Amazon Video', 'apple tv': 'Apple TV', 'roku premium': 'The Roku Channel' }

export function watchUrl(provider, title, type, fallback) {
  const channel = provider.name.match(/(amazon|apple tv|roku premium) channel$/i)
  const lookup = channel ? CHANNEL_HOST[channel[1].toLowerCase()] : provider.name
  const hit = SEARCH.find(([re]) => re.test(lookup))
  return hit ? hit[1](title, type) : fallback || `https://www.themoviedb.org/search?query=${q(title)}`
}
