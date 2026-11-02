import { useCallback, useState } from 'react'
import { load, save } from './storage.js'

// What you've watched and how you felt about it. Saved in this browser.
export const RATINGS = {
  loved: { label: 'Loved it', emoji: '❤️', weight: 2 },
  liked: { label: 'Liked it', emoji: '👍', weight: 1 },
  disliked: { label: 'Not for me', emoji: '👎', weight: 0 },
}

export const keyOf = (t) => `${t.type}:${t.id}`

export function useLibrary() {
  const [library, setLibrary] = useState(() => load('library', {}))

  const rate = useCallback((t, rating) => {
    setLibrary((cur) => {
      const next = { ...cur }
      if (!rating) delete next[keyOf(t)]
      else
        next[keyOf(t)] = {
          id: t.id,
          type: t.type,
          title: t.title,
          year: t.year,
          poster: t.poster,
          backdrop: t.backdrop,
          rating,
          addedAt: cur[keyOf(t)]?.addedAt || Date.now(),
        }
      save('library', next)
      return next
    })
  }, [])

  return { library, rate }
}

// Pick the titles to base "For you" on: loved first, then liked, most recent first.
export function pickSeeds(library, max = 6) {
  return Object.values(library)
    .filter((t) => RATINGS[t.rating]?.weight > 0)
    .sort((a, b) => RATINGS[b.rating].weight - RATINGS[a.rating].weight || b.addedAt - a.addedAt)
    .slice(0, max)
    .map((t) => ({ ...t, weight: RATINGS[t.rating].weight }))
}

// Titles rated "Not for me" — steer recommendations away from things like these.
export function pickDisliked(library, max = 4) {
  return Object.values(library)
    .filter((t) => t.rating === 'disliked')
    .sort((a, b) => b.addedAt - a.addedAt)
    .slice(0, max)
}
