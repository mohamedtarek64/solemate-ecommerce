/**
 * Wishlist Optimizer
 * Optimizes wishlist operations with caching and batching
 */

import advancedCache from './advancedCache'
import performanceMonitor from './performanceMonitorEnhanced'

class WishlistOptimizer {
  constructor() {
    this.cache = advancedCache
    this.pendingOperations = new Map()
    this.cacheTTL = 15 * 60 * 1000 // 15 minutes
  }

  /**
   * Get wishlist with caching
   */
  async getWishlist(userId, fetchFn) {
    const cacheKey = `wishlist:${userId}`
    
    // Try cache first
    const cached = this.cache.get(cacheKey)
    if (cached) {
      return cached
    }

    // Check if request is already pending
    if (this.pendingOperations.has(cacheKey)) {
      return this.pendingOperations.get(cacheKey)
    }

    // Create new request
    const measurement = performanceMonitor.startMeasure('wishlist-fetch', 'api-call')
    const promise = fetchFn()
      .then(result => {
        this.cache.set(cacheKey, result, this.cacheTTL)
        performanceMonitor.endMeasure(measurement)
        return result
      })
      .finally(() => {
        this.pendingOperations.delete(cacheKey)
      })

    this.pendingOperations.set(cacheKey, promise)
    return promise
  }

  /**
   * Optimistic add to wishlist
   */
  optimisticAdd(currentItems, newItem) {
    // Check if item already exists
    const exists = currentItems.some(
      item => item.product_id === newItem.product_id &&
              item.source_table === newItem.source_table
    )

    if (exists) {
      return currentItems
    }

    return [...currentItems, newItem]
  }

  /**
   * Optimistic remove from wishlist
   */
  optimisticRemove(currentItems, itemId) {
    return currentItems.filter(item => item.id !== itemId)
  }

  /**
   * Check if item is in wishlist (cached)
   */
  isInWishlist(userId, productId, sourceTable) {
    const cacheKey = `wishlist:${userId}`
    const cached = this.cache.get(cacheKey)
    
    if (!cached || !cached.success || !cached.data) {
      return false
    }

    return cached.data.some(
      item => item.product_id === productId && 
              item.source_table === sourceTable
    )
  }

  /**
   * Toggle wishlist item
   */
  async toggleWishlistItem(userId, product, isInWishlist, addFn, removeFn) {
    const measurement = performanceMonitor.startMeasure('wishlist-toggle', 'interaction')

    try {
      if (isInWishlist) {
        await removeFn(product.id)
      } else {
        await addFn(product)
      }

      // Invalidate cache
      this.invalidateCache(userId)
      
      performanceMonitor.endMeasure(measurement)
      return !isInWishlist
    } catch (error) {
      performanceMonitor.endMeasure(measurement)
      throw error
    }
  }

  /**
   * Batch toggle multiple items
   */
  async batchToggle(userId, products, operations) {
    const measurement = performanceMonitor.startMeasure('wishlist-batch-toggle', 'interaction')

    try {
      const results = await Promise.allSettled(
        operations.map(op => op())
      )

      // Invalidate cache
      this.invalidateCache(userId)
      
      performanceMonitor.endMeasure(measurement)
      
      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length
      
      return { successful, failed, total: results.length }
    } catch (error) {
      performanceMonitor.endMeasure(measurement)
      throw error
    }
  }

  /**
   * Move items from wishlist to cart
   */
  async moveToCart(userId, items, moveFn) {
    const measurement = performanceMonitor.startMeasure('wishlist-move-to-cart', 'interaction')

    try {
      const results = await Promise.allSettled(
        items.map(item => moveFn(item))
      )

      // Invalidate both wishlist and cart cache
      this.invalidateCache(userId)
      advancedCache.invalidatePattern('cart')
      
      performanceMonitor.endMeasure(measurement)
      
      return {
        successful: results.filter(r => r.status === 'fulfilled').length,
        failed: results.filter(r => r.status === 'rejected').length
      }
    } catch (error) {
      performanceMonitor.endMeasure(measurement)
      throw error
    }
  }

  /**
   * Sync wishlist with server
   */
  async syncWithServer(userId, localItems, serverFetchFn, serverSyncFn) {
    const measurement = performanceMonitor.startMeasure('wishlist-sync', 'api-call')

    try {
      // Get server wishlist
      const serverResult = await serverFetchFn()
      const serverItems = serverResult.data || []

      // Find items only in local
      const localOnly = localItems.filter(localItem =>
        !serverItems.some(serverItem =>
          serverItem.product_id === localItem.product_id &&
          serverItem.source_table === localItem.source_table
        )
      )

      // Sync local-only items to server
      if (localOnly.length > 0) {
        await Promise.allSettled(
          localOnly.map(item => serverSyncFn(item))
        )
      }

      // Merge and cache
      const merged = this.mergeWishlists(localItems, serverItems)
      const cacheKey = `wishlist:${userId}`
      this.cache.set(cacheKey, { success: true, data: merged }, this.cacheTTL)

      performanceMonitor.endMeasure(measurement)
      return merged
    } catch (error) {
      performanceMonitor.endMeasure(measurement)
      throw error
    }
  }

  /**
   * Merge local and server wishlists
   */
  mergeWishlists(localItems, serverItems) {
    const merged = new Map()

    // Add server items (they are the source of truth)
    serverItems.forEach(item => {
      const key = `${item.product_id}_${item.source_table}`
      merged.set(key, item)
    })

    // Add local items that don't exist on server
    localItems.forEach(item => {
      const key = `${item.product_id}_${item.source_table}`
      if (!merged.has(key)) {
        merged.set(key, item)
      }
    })

    return Array.from(merged.values())
  }

  /**
   * Get wishlist stats
   */
  getStats(items) {
    return {
      totalItems: items.length,
      totalValue: items.reduce((sum, item) => sum + (item.price || 0), 0),
      avgPrice: items.length > 0 
        ? items.reduce((sum, item) => sum + (item.price || 0), 0) / items.length
        : 0,
      categories: [...new Set(items.map(item => item.category).filter(Boolean))]
    }
  }

  /**
   * Filter wishlist items
   */
  filterItems(items, filters) {
    let filtered = items

    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category)
    }

    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(item => item.price >= filters.minPrice)
    }

    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(item => item.price <= filters.maxPrice)
    }

    if (filters.inStock !== undefined) {
      filtered = filtered.filter(item => 
        filters.inStock ? item.stock_quantity > 0 : item.stock_quantity === 0
      )
    }

    return filtered
  }

  /**
   * Sort wishlist items
   */
  sortItems(items, sortBy = 'date', order = 'desc') {
    const sorted = [...items]

    const comparators = {
      date: (a, b) => {
        const dateA = new Date(a.created_at || 0)
        const dateB = new Date(b.created_at || 0)
        return order === 'desc' ? dateB - dateA : dateA - dateB
      },
      price: (a, b) => {
        const priceA = a.price || 0
        const priceB = b.price || 0
        return order === 'desc' ? priceB - priceA : priceA - priceB
      },
      name: (a, b) => {
        const nameA = (a.name || '').toLowerCase()
        const nameB = (b.name || '').toLowerCase()
        return order === 'desc' 
          ? nameB.localeCompare(nameA)
          : nameA.localeCompare(nameB)
      }
    }

    return sorted.sort(comparators[sortBy] || comparators.date)
  }

  /**
   * Invalidate cache
   */
  invalidateCache(userId) {
    const cacheKey = `wishlist:${userId}`
    this.cache.delete(cacheKey)
    this.cache.invalidatePattern('wishlist')
  }

  /**
   * Clear all cache
   */
  clearCache() {
    this.cache.invalidatePattern('wishlist')
    this.pendingOperations.clear()
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return this.cache.getStats()
  }
}

// Create singleton instance
const wishlistOptimizer = new WishlistOptimizer()

export default wishlistOptimizer

