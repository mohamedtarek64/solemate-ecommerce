// Performance optimization utilities

/**
 * Debounce function to limit API calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute immediately on first call
 * @returns {Function} Debounced function
 */
export function debounce(func, wait, immediate = false) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func(...args)
  }
}

/**
 * Throttle function to limit API calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Simple in-memory cache
 */
export class SimpleCache {
  constructor(ttl = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map()
    this.ttl = ttl
  }

  set(key, value, customTtl = null) {
    const expiry = Date.now() + (customTtl || this.ttl)
    this.cache.set(key, { value, expiry })
  }

  get(key) {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  clear() {
    this.cache.clear()
  }

  delete(key) {
    this.cache.delete(key)
  }

  has(key) {
    const item = this.cache.get(key)
    if (!item) return false

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return false
    }

    return true
  }
}

/**
 * API request cache with automatic invalidation
 */
export class ApiCache extends SimpleCache {
  constructor(ttl = 2 * 60 * 1000) { // 2 minutes for API calls
    super(ttl)
    this.invalidationKeys = new Map() // Track related cache keys
  }

  set(key, value, customTtl = null, relatedKeys = []) {
    super.set(key, value, customTtl)

    // Track related keys for invalidation
    relatedKeys.forEach(relatedKey => {
      if (!this.invalidationKeys.has(relatedKey)) {
        this.invalidationKeys.set(relatedKey, new Set())
      }
      this.invalidationKeys.get(relatedKey).add(key)
    })
  }

  invalidate(pattern) {
    if (typeof pattern === 'string') {
      // Invalidate specific key
      this.delete(pattern)

      // Invalidate related keys
      const relatedKeys = this.invalidationKeys.get(pattern)
      if (relatedKeys) {
        relatedKeys.forEach(key => this.delete(key))
        this.invalidationKeys.delete(pattern)
      }
    } else if (pattern instanceof RegExp) {
      // Invalidate keys matching pattern
      for (const key of this.cache.keys()) {
        if (pattern.test(key)) {
          this.delete(key)
        }
      }
    }
  }

  invalidateRelated(baseKey) {
    const relatedKeys = this.invalidationKeys.get(baseKey)
    if (relatedKeys) {
      relatedKeys.forEach(key => this.delete(key))
    }
  }
}

/**
 * Loading state manager
 */
export class LoadingManager {
  constructor() {
    this.loadingStates = new Map()
    this.listeners = new Set()
  }

  setLoading(key, isLoading) {
    const wasLoading = this.loadingStates.get(key) || false
    this.loadingStates.set(key, isLoading)

    if (wasLoading !== isLoading) {
      this.notifyListeners(key, isLoading)
    }
  }

  isLoading(key) {
    return this.loadingStates.get(key) || false
  }

  isAnyLoading() {
    return Array.from(this.loadingStates.values()).some(loading => loading)
  }

  addListener(callback) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  notifyListeners(key, isLoading) {
    this.listeners.forEach(callback => callback(key, isLoading))
  }

  clear() {
    this.loadingStates.clear()
    this.notifyListeners('*', false)
  }
}

/**
 * Request queue for API calls
 */
export class RequestQueue {
  constructor(maxConcurrent = 3) {
    this.queue = []
    this.running = 0
    this.maxConcurrent = maxConcurrent
  }

  async add(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        requestFn,
        resolve,
        reject
      })
      this.process()
    })
  }

  async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return
    }

    this.running++
    const { requestFn, resolve, reject } = this.queue.shift()

    try {
      const result = await requestFn()
      resolve(result)
    } catch (error) {
      reject(error)
    } finally {
      this.running--
      this.process()
    }
  }
}

/**
 * Image lazy loading utility
 */
export class LazyImageLoader {
  constructor() {
    this.observer = null
    this.init()
  }

  init() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target
            this.loadImage(img)
            this.observer.unobserve(img)
          }
        })
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      })
    }
  }

  observe(img) {
    if (this.observer) {
      this.observer.observe(img)
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage(img)
    }
  }

  loadImage(img) {
    const src = img.dataset.src
    if (src) {
      img.src = src
      img.classList.add('loaded')
    }
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect()
    }
  }
}

/**
 * Performance monitoring
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
  }

  start(name) {
    this.metrics.set(name, {
      start: performance.now(),
      end: null,
      duration: null
    })
  }

  end(name) {
    const metric = this.metrics.get(name)
    if (metric) {
      metric.end = performance.now()
      metric.duration = metric.end - metric.start

      // Log slow operations
      if (metric.duration > 1000) {
        console.warn(`Slow operation detected: ${name} took ${metric.duration.toFixed(2)}ms`)
      }
    }
  }

  getDuration(name) {
    const metric = this.metrics.get(name)
    return metric ? metric.duration : null
  }

  getAllMetrics() {
    return Object.fromEntries(this.metrics)
  }

  clear() {
    this.metrics.clear()
  }
}

// Global instances
export const apiCache = new ApiCache()
export const loadingManager = new LoadingManager()
export const requestQueue = new RequestQueue()
export const lazyImageLoader = new LazyImageLoader()
export const performanceMonitor = new PerformanceMonitor()

/**
 * Optimized API call wrapper
 */
export async function optimizedApiCall(url, options = {}, cacheKey = null, cacheTtl = null) {
  const key = cacheKey || url

  // Check cache first
  if (options.method === 'GET' && apiCache.has(key)) {
    return apiCache.get(key)
  }

  // Add to request queue
  return requestQueue.add(async () => {
    try {
      performanceMonitor.start(`api_${key}`)

      // Ensure URL is absolute and is a string
      const urlString = String(url || '')
      const fullUrl = urlString.startsWith('http') ? urlString : `http://127.0.0.1:8000${urlString}`

      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Cache successful GET requests
      if (options.method === 'GET' || !options.method) {
        apiCache.set(key, data, cacheTtl)
      }

      performanceMonitor.end(`api_${key}`)
      return data
    } catch (error) {
      performanceMonitor.end(`api_${key}`)
      throw error
    }
  })
}

/**
 * Optimized component loading
 */
export function withLoadingState(component, loadingKey) {
  return {
    ...component,
    setup(props, context) {
      const loading = ref(false)

      const originalSetup = component.setup
      if (originalSetup) {
        const result = originalSetup(props, context)

        // Add loading state management
        const unsubscribe = loadingManager.addListener((key, isLoading) => {
          if (key === loadingKey || key === '*') {
            loading.value = isLoading
          }
        })

        onUnmounted(unsubscribe)

        return {
          ...result,
          loading: readonly(loading)
        }
      }

      return { loading: readonly(loading) }
    }
  }
}
