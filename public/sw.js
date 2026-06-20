/* ──────────────────────────────────────────────────────────────────
   TiaoHe · 调和  Service Worker — offline-first cache strategy
   ───────────────────────────────────────────────────────────────── */

const CACHE = 'tiaohe-v2'

const PRE_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-v2.png',
]

/* Install: pre-cache static assets */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRE_CACHE)).then(() => self.skipWaiting())
  )
})

/* Activate: wipe ALL old caches, claim all clients immediately */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

/* Fetch: cache-first, falling back to network */
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  if (event.request.url.startsWith('chrome-extension://')) return

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached

      return fetch(event.request).then((response) => {
        if (response.ok && response.type === 'basic') {
          const clone = response.clone()
          caches.open(CACHE).then((cache) => cache.put(event.request, clone))
        }
        return response
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html')
        }
        return new Response('', { status: 408 })
      })
    })
  )
})
