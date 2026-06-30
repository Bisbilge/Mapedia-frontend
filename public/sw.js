// Mapedia Service Worker — cache-first for static assets, network-first for API
const CACHE = 'mapedia-v2'
const STATIC_ASSETS = ['/', '/manifest.json', '/mapedia.svg']

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  const { request } = e
  const url = new URL(request.url)

  // Skip non-GET and API requests (always network)
  if (request.method !== 'GET' || url.pathname.startsWith('/api/')) return

  // Network-first for HTML (navigation)
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).catch(() => caches.match('/'))
    )
    return
  }

  // Network-first for JS (ensures new deploys take effect immediately)
  if (/\.js$/.test(url.pathname)) {
    e.respondWith(
      fetch(request).then(res => {
        const clone = res.clone()
        caches.open(CACHE).then(cache => cache.put(request, clone))
        return res
      }).catch(() => caches.match(request))
    )
    return
  }

  // Cache-first for other static assets (CSS, images, fonts)
  if (/\.(css|png|svg|jpg|jpeg|webp|woff2?|ttf)$/.test(url.pathname)) {
    e.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached
        return fetch(request).then(res => {
          const clone = res.clone()
          caches.open(CACHE).then(cache => cache.put(request, clone))
          return res
        })
      })
    )
  }
})
