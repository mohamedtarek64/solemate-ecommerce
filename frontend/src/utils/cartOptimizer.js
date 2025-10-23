/**
 * Cart Optimizer
 * Optimizes cart operations with batching and caching
 */

import advancedCache from './advancedCache'
import performanceMonitor from './performanceMonitorEnhanced'

class CartOptimizer {
  constructor() {
    this.pendingOperations = []
    this.batchDelay = 100 // ms
    this.batchTimer = null
    this.cache = advancedCache
  }

  /**
   * Batch multiple cart operations
   */
  async batchOperation(operation, operationFn) {
    return new Promise((resolve, reject) => {
      this.pendingOperations.push({
        operation,
        operationFn,
        resolve,
        reject
      })

      // Clear existing timer
      if (this.batchTimer) {
        clearTimeout(this.batchTimer)
      }

      // Set new timer
      this.batchTimer = setTimeout(() => {
        this.executeBatch()
      }, this.batchDelay)
    })
  }

  /**
   * Execute batched operations
   */
  async executeBatch() {
    const operations = [...this.pendingOperations]
    this.pendingOperations = []
    this.batchTimer = null

    const measurement = performanceMonitor.startMeasure('cart-batch-operations', 'interaction')

    try {
      // Group operations by type
      const grouped = operations.reduce((acc, op) => {
        if (!acc[op.operation]) acc[op.operation] = []
        acc[op.operation].push(op)
        return acc
      }, {})

      // Execute each group
      for (const [type, ops] of Object.entries(grouped)) {
        try {
          if (ops.length === 1) {
            // Single operation
            const result = await ops[0].operationFn()
            ops[0].resolve(result)
          } else {
            // Multiple operations - execute in parallel
            const results = await Promise.allSettled(
              ops.map(op => op.operationFn())
            )

            results.forEach((result, index) => {
              if (result.status === 'fulfilled') {
                ops[index].resolve(result.value)
              } else {
                ops[index].reject(result.reason)
              }
            })
          }
        } catch (error) {
          ops.forEach(op => op.reject(error))
        }
      }
    } finally {
      performanceMonitor.endMeasure(measurement)
    }
  }

  /**
   * Optimistic update for cart
   */
  optimisticUpdate(currentState, operation, item) {
    const newState = [...currentState]

    switch (operation) {
      case 'add':
        const existingIndex = newState.findIndex(
          i => i.product_id === item.product_id && 
               i.color === item.color && 
               i.size === item.size
        )

        if (existingIndex !== -1) {
          newState[existingIndex].quantity += item.quantity
        } else {
          newState.push(item)
        }
        break

      case 'update':
        const updateIndex = newState.findIndex(i => i.id === item.id)
        if (updateIndex !== -1) {
          newState[updateIndex] = { ...newState[updateIndex], ...item }
        }
        break

      case 'remove':
        return newState.filter(i => i.id !== item.id)

      case 'clear':
        return []

      default:
        return newState
    }

    return newState
  }

  /**
   * Cache cart state
   */
  cacheCartState(userId, items) {
    const cacheKey = `cart_state:${userId}`
    this.cache.set(cacheKey, items, 5 * 60 * 1000) // 5 minutes
  }

  /**
   * Get cached cart state
   */
  getCachedCartState(userId) {
    const cacheKey = `cart_state:${userId}`
    return this.cache.get(cacheKey)
  }

  /**
   * Clear cart cache
   */
  clearCartCache(userId) {
    const cacheKey = `cart_state:${userId}`
    this.cache.delete(cacheKey)
    this.cache.invalidatePattern('cart')
  }

  /**
   * Debounce cart sync
   */
  debounceSync(syncFn, delay = 500) {
    let timeout
    return (...args) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => syncFn(...args), delay)
    }
  }

  /**
   * Calculate cart metrics
   */
  calculateMetrics(items) {
    const measurement = performanceMonitor.startMeasure('cart-calculate-metrics', 'interaction')

    const metrics = items.reduce((acc, item) => {
      const itemTotal = item.price * item.quantity
      const itemSavings = item.originalPrice 
        ? (item.originalPrice - item.price) * item.quantity 
        : 0

      return {
        totalItems: acc.totalItems + item.quantity,
        totalPrice: acc.totalPrice + itemTotal,
        totalSavings: acc.totalSavings + itemSavings,
        itemCount: acc.itemCount + 1
      }
    }, {
      totalItems: 0,
      totalPrice: 0,
      totalSavings: 0,
      itemCount: 0
    })

    performanceMonitor.endMeasure(measurement)
    return metrics
  }

  /**
   * Validate cart item
   */
  validateCartItem(item) {
    const required = ['product_id', 'name', 'price', 'quantity']
    const missing = required.filter(field => !item[field])

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`)
    }

    if (item.quantity < 1) {
      throw new Error('Quantity must be at least 1')
    }

    if (item.price < 0) {
      throw new Error('Price cannot be negative')
    }

    return true
  }

  /**
   * Merge cart items (e.g., after login)
   */
  mergeCartItems(localItems, serverItems) {
    const merged = new Map()

    // Add server items first
    serverItems.forEach(item => {
      const key = `${item.product_id}_${item.color}_${item.size}`
      merged.set(key, item)
    })

    // Merge local items
    localItems.forEach(item => {
      const key = `${item.product_id}_${item.color}_${item.size}`
      const existing = merged.get(key)

      if (existing) {
        // Merge quantities
        merged.set(key, {
          ...existing,
          quantity: existing.quantity + item.quantity
        })
      } else {
        merged.set(key, item)
      }
    })

    return Array.from(merged.values())
  }

  /**
   * Compress cart data for storage
   */
  compressCartData(items) {
    return items.map(item => ({
      pid: item.product_id,
      n: item.name,
      p: item.price,
      q: item.quantity,
      c: item.color,
      s: item.size,
      img: item.image
    }))
  }

  /**
   * Decompress cart data
   */
  decompressCartData(compressedItems) {
    return compressedItems.map(item => ({
      product_id: item.pid,
      name: item.n,
      price: item.p,
      quantity: item.q,
      color: item.c,
      size: item.s,
      image: item.img
    }))
  }
}

// Create singleton instance
const cartOptimizer = new CartOptimizer()

export default cartOptimizer

