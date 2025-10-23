/**
 * API Response Cache Utility
 * Implements intelligent caching for API responses
 */

class APICache {
  constructor() {
    this.cache = new Map()
    this.cacheConfig = {
      // Cache duration in milliseconds
      products: 5 * 60 * 1000,      // 5 minutes
      product: 10 * 60 * 1000,       // 10 minutes
      categories: 15 * 60 * 1000,    // 15 minutes
      featured: 3 * 60 * 1000,       // 3 minutes
      search: 2 * 60 * 1000,         // 2 minutes
      user: 5 * 60 * 1000,           // 5 minutes
      cart: 1 * 60 * 1000,           // 1 minute
      default: 5 * 60 * 1000         // 5 minutes
    }
  }

  /**
   * Generate cache key
   */
  generateKey(url, params = {}) {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&')

    return paramString ? `${url}?${paramString}` : url
  }

  /**
   * Get cache duration for a resource type
   */
  getCacheDuration(url) {
    if (url.includes('/products/')) return this.cacheConfig.product
    if (url.includes('/products')) return this.cacheConfig.products
    if (url.includes('/categories')) return this.cacheConfig.categories
    if (url.includes('/featured')) return this.cacheConfig.featured
    if (url.includes('/search')) return this.cacheConfig.search
    if (url.includes('/user')) return this.cacheConfig.user
    if (url.includes('/cart')) return this.cacheConfig.cart

    return this.cacheConfig.default
  }

  /**
   * Set cache entry
   */
  set(key, value, ttl = null) {
    const duration = ttl || this.getCacheDuration(key)
    const expiresAt = Date.now() + duration

    this.cache.set(key, {
      value,
      expiresAt,
      cachedAt: Date.now()
    })

    // Clean up expired entries periodically
    if (this.cache.size % 10 === 0) {
      this.cleanup()
    }
  }

  /**
   * Get cache entry
   */
  get(key) {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.value
  }

  /**
   * Check if key exists and is valid
   */
  has(key) {
    return this.get(key) !== null
  }

  /**
   * Delete cache entry
   */
  delete(key) {
    this.cache.delete(key)
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear()
  }

  /**
   * Clear cache entries matching pattern
   */
  clearPattern(pattern) {
    const regex = new RegExp(pattern)

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Clean up expired entries
   */
  cleanup() {
    const now = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    let validCount = 0
    let expiredCount = 0
    const now = Date.now()

    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expiredCount++
      } else {
        validCount++
      }
    }

    return {
      total: this.cache.size,
      valid: validCount,
      expired: expiredCount,
      hitRate: this.hitRate || 0
    }
  }

  /**
   * Preload cache entries
   */
  async preload(entries) {
    const promises = entries.map(async ({ url, params, fetcher }) => {
      const key = this.generateKey(url, params)

      // Skip if already cached
      if (this.has(key)) {
        return
      }

      try {
        const data = await fetcher()
        this.set(key, data)
      } catch (error) {
        console.error(`Failed to preload ${key}:`, error)
      }
    })

    await Promise.all(promises)
  }
}

// Export singleton instance
export const apiCache = new APICache()

// Export class for testing
export { APICache }

/**
 * Cached fetch wrapper
 */
export async function cachedFetch(url, options = {}, cacheKey = null, ttl = null) {
  const key = cacheKey || url

  // Check cache first
  const cached = apiCache.get(key)
  if (cached) {
    return cached
  }

  // Fetch from API
  const response = await fetch(url, options)

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const data = await response.json()

  // Cache the response
  apiCache.set(key, data, ttl)

  return data
}

/**
 * Batch fetch with caching
 */
export async function batchCachedFetch(requests) {
  const promises = requests.map(({ url, options, cacheKey, ttl }) =>
    cachedFetch(url, options, cacheKey, ttl)
  )

  return Promise.all(promises)
}

/**
 * Prefetch resources
 */
export async function prefetchResources(urls) {
  const promises = urls.map(url => {
    const key = typeof url === 'string' ? url : url.key
    const fetchUrl = typeof url === 'string' ? url : url.url

    // Skip if already cached
    if (apiCache.has(key)) {
      return Promise.resolve()
    }

    return cachedFetch(fetchUrl, {}, key).catch(err => {
      console.warn(`Failed to prefetch ${fetchUrl}:`, err)
    })
  })

  return Promise.all(promises)
}

export default apiCache
