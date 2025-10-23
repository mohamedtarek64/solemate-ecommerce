// Service Worker for Performance Optimization
const CACHE_NAME = 'ecommerce-v2'
const STATIC_CACHE = 'static-v2'
const DYNAMIC_CACHE = 'dynamic-v2'

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add critical CSS and JS files here
]

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/products/,
  /\/api\/categories/,
  /\/api\/cart/,
]

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static assets...')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Static assets cached successfully')
        return self.skipWaiting()
      })
  )
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName =>
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE
            )
            .map(cacheName => {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      })
      .then(() => {
        console.log('Service Worker activated')
        return self.clients.claim()
      })
  )
})

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip chrome-extension and other non-http(s) requests
  if (!request.url.startsWith('http')) {
    return
  }

  // Skip cross-origin requests (like Google Fonts, external CDNs)
  if (url.origin !== location.origin) {
    event.respondWith(fetch(request))
    return
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Handle static assets
  if (request.destination === 'document' ||
      request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'image') {
    event.respondWith(handleStaticRequest(request))
    return
  }

  // Handle other requests normally
  event.respondWith(fetch(request))
})

// Handle API requests with caching strategy
async function handleApiRequest(request) {
  const url = new URL(request.url)

  // Check if this API should be cached
  const shouldCache = API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))

  if (!shouldCache) {
    return fetch(request)
  }

  try {
    // Try network first for API requests
    const networkResponse = await fetch(request)

    // Only cache GET requests (DELETE, POST, PUT are not cacheable)
    if (networkResponse.ok && request.method === 'GET') {
      try {
        const cache = await caches.open(DYNAMIC_CACHE)
        await cache.put(request, networkResponse.clone())
      } catch (cacheError) {
        console.warn('Failed to cache request:', request.url, cacheError)
      }
    }

    return networkResponse
  } catch (error) {
    console.log('Network failed, trying cache for:', url.pathname)

    // Only try cache for GET requests
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request)
      if (cachedResponse) {
        return cachedResponse
      }
    }

    // Return error response
    return new Response(
      JSON.stringify({
        error: 'Network error and no cached response available',
        offline: true,
        method: request.method
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Handle static requests with cache-first strategy
async function handleStaticRequest(request) {
  try {
    // Skip non-GET requests
    if (request.method !== 'GET') {
      return fetch(request)
    }

    // Try cache first for static assets
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Fetch from network if not in cache
    const networkResponse = await fetch(request)

    // Only cache successful responses
    if (networkResponse.ok && networkResponse.status === 200) {
      try {
        const cache = await caches.open(STATIC_CACHE)
        // Clone the response before caching
        await cache.put(request, networkResponse.clone())
      } catch (cacheError) {
        // Silently fail if caching fails (e.g., storage quota exceeded)
        console.warn('Failed to cache static asset:', request.url, cacheError)
      }
    }

    return networkResponse
  } catch (error) {
    console.error('Failed to fetch static asset:', request.url)

    // Return a fallback response
    if (request.destination === 'document') {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Offline</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body>
            <h1>You're offline</h1>
            <p>Please check your internet connection and try again.</p>
          </body>
        </html>
        `,
        {
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        }
      )
    }

    throw error
  }
}

// Handle background sync
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag)

  if (event.tag === 'cart-sync') {
    event.waitUntil(syncCartData())
  }
})

// Sync cart data when back online
async function syncCartData() {
  try {
    // Get pending cart operations from IndexedDB
    const pendingOperations = await getPendingCartOperations()

    for (const operation of pendingOperations) {
      try {
        await fetch('/api/cart/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(operation)
        })

        // Remove from pending operations
        await removePendingCartOperation(operation.id)
      } catch (error) {
        console.error('Failed to sync cart operation:', error)
      }
    }
  } catch (error) {
    console.error('Cart sync failed:', error)
  }
}

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()

  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: data.data,
    actions: data.actions || []
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    )
  }
})

// Utility functions for IndexedDB operations
async function getPendingCartOperations() {
  // Implementation would depend on your IndexedDB setup
  return []
}

async function removePendingCartOperation(id) {
  // Implementation would depend on your IndexedDB setup
}
