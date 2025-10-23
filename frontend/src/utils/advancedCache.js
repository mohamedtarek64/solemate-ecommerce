/**
 * Advanced Caching System for Frontend
 * Provides multi-layer caching with TTL support
 */

class AdvancedCache {
  constructor() {
    this.memoryCache = new Map()
    this.ttlMap = new Map()
    this.maxMemorySize = 100 // Maximum items in memory cache
    this.defaultTTL = 5 * 60 * 1000 // 5 minutes default TTL
  }

  /**
   * Generate cache key
   */
  generateKey(prefix, params) {
    return `${prefix}:${JSON.stringify(params)}`
  }

  /**
   * Set item in cache with TTL
   */
  set(key, value, ttl = this.defaultTTL) {
    // Remove oldest items if cache is full
    if (this.memoryCache.size >= this.maxMemorySize) {
      const firstKey = this.memoryCache.keys().next().value
      this.memoryCache.delete(firstKey)
      this.ttlMap.delete(firstKey)
    }

    // Store in memory cache
    this.memoryCache.set(key, value)
    
    // Set expiry time
    const expiryTime = Date.now() + ttl
    this.ttlMap.set(key, expiryTime)

    // Also store in localStorage for persistence (with size limit check)
    try {
      const cacheData = {
        value,
        expiryTime
      }
      localStorage.setItem(`cache:${key}`, JSON.stringify(cacheData))
    } catch (e) {
      console.warn('LocalStorage cache full, using memory only:', e)
    }

    return value
  }

  /**
   * Get item from cache
   */
  get(key) {
    // Check memory cache first
    if (this.memoryCache.has(key)) {
      const expiryTime = this.ttlMap.get(key)
      
      // Check if expired
      if (expiryTime && Date.now() > expiryTime) {
        this.delete(key)
        return null
      }
      
      return this.memoryCache.get(key)
    }

    // Check localStorage as fallback
    try {
      const cachedData = localStorage.getItem(`cache:${key}`)
      if (cachedData) {
        const { value, expiryTime } = JSON.parse(cachedData)
        
        // Check if expired
        if (Date.now() > expiryTime) {
          this.delete(key)
          return null
        }
        
        // Restore to memory cache
        this.memoryCache.set(key, value)
        this.ttlMap.set(key, expiryTime)
        
        return value
      }
    } catch (e) {
      console.warn('Error reading from localStorage cache:', e)
    }

    return null
  }

  /**
   * Delete item from cache
   */
  delete(key) {
    this.memoryCache.delete(key)
    this.ttlMap.delete(key)
    localStorage.removeItem(`cache:${key}`)
  }

  /**
   * Clear all cache
   */
  clear() {
    this.memoryCache.clear()
    this.ttlMap.clear()
    
    // Clear localStorage cache
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('cache:')) {
        localStorage.removeItem(key)
      }
    })
  }

  /**
   * Clear expired items
   */
  clearExpired() {
    const now = Date.now()
    
    // Clear from memory cache
    for (const [key, expiryTime] of this.ttlMap.entries()) {
      if (now > expiryTime) {
        this.delete(key)
      }
    }

    // Clear from localStorage
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('cache:')) {
        try {
          const data = JSON.parse(localStorage.getItem(key))
          if (data.expiryTime && now > data.expiryTime) {
            localStorage.removeItem(key)
          }
        } catch (e) {
          // Invalid cache item, remove it
          localStorage.removeItem(key)
        }
      }
    })
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      memorySize: this.memoryCache.size,
      localStorageSize: Object.keys(localStorage).filter(k => k.startsWith('cache:')).length
    }
  }

  /**
   * Cache with automatic fetch
   */
  async remember(key, ttl, fetchFunction) {
    // Try to get from cache
    const cached = this.get(key)
    if (cached !== null) {
      return cached
    }

    // Fetch new data
    try {
      const data = await fetchFunction()
      this.set(key, data, ttl)
      return data
    } catch (error) {
      console.error('Error in cache remember:', error)
      throw error
    }
  }

  /**
   * Invalidate cache by pattern
   */
  invalidatePattern(pattern) {
    // Clear from memory cache
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        this.delete(key)
      }
    }

    // Clear from localStorage
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('cache:') && key.includes(pattern)) {
        localStorage.removeItem(key)
      }
    })
  }
}

// Create singleton instance
const cacheInstance = new AdvancedCache()

// Clear expired items every 5 minutes
setInterval(() => {
  cacheInstance.clearExpired()
}, 5 * 60 * 1000)

export default cacheInstance

