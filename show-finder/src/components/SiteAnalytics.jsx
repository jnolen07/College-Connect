import { useEffect, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'

// Visitor counts via Vercel Web Analytics (cookie-free, aggregated). ShowFinder's pages live in the
// URL hash (#/search, #/tv/1396), which the script doesn't see on its own, so report them as paths.
// Title pages are grouped under one route so the dashboard shows "title pages", not thousands of rows.
function current() {
  const path = (window.location.hash.replace(/^#/, '') || '/').split('?')[0] || '/'
  const route = /^\/(tv|movie)\/\d+/.test(path) ? '/[type]/[id]' : path.startsWith('/welcome') ? '/welcome' : path
  return { path, route }
}

export default function SiteAnalytics() {
  const [loc, setLoc] = useState(current)
  useEffect(() => {
    const onHash = () => setLoc(current())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return <Analytics route={loc.route} path={loc.path} />
}
