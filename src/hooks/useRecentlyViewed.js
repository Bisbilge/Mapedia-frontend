import { useState, useEffect } from 'react'

const KEY = 'mapedia_recently_viewed'
const MAX = 8

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch {
    return []
  }
}

export function useRecentlyViewed() {
  const [items, setItems] = useState(load)

  function add(venue) {
    setItems(prev => {
      const filtered = prev.filter(v => v.slug !== venue.slug)
      const next = [{ slug: venue.slug, name: venue.name, city: venue.city, country: venue.country }, ...filtered].slice(0, MAX)
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }

  function clear() {
    localStorage.removeItem(KEY)
    setItems([])
  }

  return { items, add, clear }
}

export function getRecentlyViewed() {
  return load()
}
