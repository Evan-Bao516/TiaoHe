/* ──────────────────────────────────────────────────────────────────
   TiaoHe · 调和  Service Worker — offline-first cache strategy
   ───────────────────────────────────────────────────────────────── */

const CACHE = 'tiaohe-v1'

const PRE_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.png',
]

/* Install: pre-cache static assets */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRE_CACHE)).then(() => self.skipWaiting())
  )
})

/* Activate: clean old caches */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

/* Fetch: cache-first, falling back to network */
self.addEventListener('fetch', (event) => {
  /* Skip non-GET and chrome-extension requests */
  if (event.request.method !== 'GET') return
  if (event.request.url.startsWith('chrome-extension://')) return

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached

      return fetch(event.request).then((response) => {
        /* Cache only successful same-origin responses */
        if (response.ok && response.type === 'basic') {
          const clone = response.clone()
          caches.open(CACHE).then((cache) => cache.put(event.request, clone))
        }
        return response
      }).catch(() => {
        /* Offline fallback for HTML navigation */
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html')
        }
        /* Images / other — silent fail */
        return new Response('', { status: 408 })
      })
    })
  )
})
