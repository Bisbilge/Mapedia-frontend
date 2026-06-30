import { useState } from 'react'

const KEY = 'mapedia_favorites'

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch {
    return []
  }
}

function save(items) {
  localStorage.setItem(KEY, JSON.stringify(items))
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(load)

  function toggle(venue) {
    setFavorites(prev => {
      const exists = prev.some(v => v.slug === venue.slug)
      const next = exists
        ? prev.filter(v => v.slug !== venue.slug)
        : [{ slug: venue.slug, name: venue.name, city: venue.city, country: venue.country }, ...prev]
      save(next)
      return next
    })
  }

  function isFavorite(slug) {
    return favorites.some(v => v.slug === slug)
  }

  function clear() {
    localStorage.removeItem(KEY)
    setFavorites([])
  }

  return { favorites, toggle, isFavorite, clear }
}

export function getFavorites() {
  return load()
}
