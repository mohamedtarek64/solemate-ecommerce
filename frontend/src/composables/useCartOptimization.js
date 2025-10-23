/**
 * Cart Page Optimization
 * Optimizes cart operations with optimistic updates and batching
 */

import { ref, computed, watch } from 'vue'
import cartOptimizer from '@/utils/cartOptimizer'
import performanceMonitor from '@/utils/performanceMonitorEnhanced'

export function useCartOptimization() {
  const cartItems = ref([])
  const isUpdating = ref(false)
  const pendingUpdates = ref(new Map())

  /**
   * Load cart with caching
   */
  const loadCart = async (userId, fetchFn) => {
    const measurement = performanceMonitor.startMeasure('cart-load', 'api-call')

    try {
      // Try cached cart first
      const cached = cartOptimizer.getCachedCartState(userId)
      if (cached) {
        cartItems.value = cached
        performanceMonitor.endMeasure(measurement)
        return cached
      }

      // Fetch from server
      const data = await fetchFn()
      cartItems.value = data

      // Cache cart state
      cartOptimizer.cacheCartState(userId, data)

      performanceMonitor.endMeasure(measurement)
      return data
    } catch (err) {
      performanceMonitor.endMeasure(measurement)
      throw err
    }
  }

  /**
   * Optimistic add to cart
   */
  const addToCart = async (item, addFn) => {
    const measurement = performanceMonitor.startMeasure('cart-add', 'interaction')

    // Optimistic update
    const newState = cartOptimizer.optimisticUpdate(cartItems.value, 'add', item)
    const previousState = [...cartItems.value]
    cartItems.value = newState

    try {
      // Batch the operation
      await cartOptimizer.batchOperation('add', () => addFn(item))

      performanceMonitor.endMeasure(measurement)
      return { success: true }
    } catch (err) {
      // Rollback on error
      cartItems.value = previousState
      performanceMonitor.endMeasure(measurement)
      throw err
    }
  }

  /**
   * Optimistic update quantity
   */
  const updateQuantity = async (itemId, quantity, updateFn) => {
    const measurement = performanceMonitor.startMeasure('cart-update', 'interaction')

    // Find item
    const item = cartItems.value.find(i => i.id === itemId)
    if (!item) return

    // Optimistic update
    const previousState = [...cartItems.value]
    item.quantity = quantity

    // Mark as pending
    pendingUpdates.value.set(itemId, true)

    try {
      // Debounced batch operation
      const debouncedUpdate = cartOptimizer.debounceSync(updateFn)
      await debouncedUpdate(itemId, quantity)

      performanceMonitor.endMeasure(measurement)
      pendingUpdates.value.delete(itemId)
      return { success: true }
    } catch (err) {
      // Rollback on error
      cartItems.value = previousState
      pendingUpdates.value.delete(itemId)
      performanceMonitor.endMeasure(measurement)
      throw err
    }
  }

  /**
   * Optimistic remove item
   */
  const removeItem = async (itemId, removeFn) => {
    const measurement = performanceMonitor.startMeasure('cart-remove', 'interaction')

    // Optimistic update
    const previousState = [...cartItems.value]
    cartItems.value = cartOptimizer.optimisticUpdate(
      cartItems.value,
      'remove',
      { id: itemId }
    )

    try {
      await cartOptimizer.batchOperation('remove', () => removeFn(itemId))

      performanceMonitor.endMeasure(measurement)
      return { success: true }
    } catch (err) {
      // Rollback on error
      cartItems.value = previousState
      performanceMonitor.endMeasure(measurement)
      throw err
    }
  }

  /**
   * Clear cart
   */
  const clearCart = async (userId, clearFn) => {
    const measurement = performanceMonitor.startMeasure('cart-clear', 'interaction')

    const previousState = [...cartItems.value]
    cartItems.value = []

    try {
      await clearFn()
      cartOptimizer.clearCartCache(userId)

      performanceMonitor.endMeasure(measurement)
      return { success: true }
    } catch (err) {
      cartItems.value = previousState
      performanceMonitor.endMeasure(measurement)
      throw err
    }
  }

  /**
   * Apply discount code
   */
  const applyDiscount = async (code, applyFn) => {
    const measurement = performanceMonitor.startMeasure('cart-discount', 'interaction')

    try {
      const result = await applyFn(code)
      performanceMonitor.endMeasure(measurement)
      return result
    } catch (err) {
      performanceMonitor.endMeasure(measurement)
      throw err
    }
  }

  /**
   * Batch update multiple items
   */
  const batchUpdate = async (updates, updateFn) => {
    const measurement = performanceMonitor.startMeasure('cart-batch-update', 'interaction')

    const previousState = [...cartItems.value]

    try {
      // Apply all updates optimistically
      updates.forEach(({ itemId, quantity }) => {
        const item = cartItems.value.find(i => i.id === itemId)
        if (item) item.quantity = quantity
      })

      // Batch API calls
      const operations = updates.map(({ itemId, quantity }) =>
        () => updateFn(itemId, quantity)
      )

      await Promise.all(operations.map(op => cartOptimizer.batchOperation('update', op)))

      performanceMonitor.endMeasure(measurement)
      return { success: true }
    } catch (err) {
      cartItems.value = previousState
      performanceMonitor.endMeasure(measurement)
      throw err
    }
  }

  /**
   * Sync cart after login
   */
  const syncCart = async (userId, localItems, syncFn) => {
    const measurement = performanceMonitor.startMeasure('cart-sync', 'api-call')

    try {
      // Merge local and server cart
      const serverItems = await syncFn()
      const merged = cartOptimizer.mergeCartItems(localItems, serverItems)

      cartItems.value = merged
      cartOptimizer.cacheCartState(userId, merged)

      performanceMonitor.endMeasure(measurement)
      return merged
    } catch (err) {
      performanceMonitor.endMeasure(measurement)
      throw err
    }
  }

  // Computed properties
  const cartMetrics = computed(() => {
    return cartOptimizer.calculateMetrics(cartItems.value)
  })

  const totalItems = computed(() => cartMetrics.value.totalItems)
  const totalPrice = computed(() => cartMetrics.value.totalPrice)
  const totalSavings = computed(() => cartMetrics.value.totalSavings)
  const itemCount = computed(() => cartMetrics.value.itemCount)

  const hasPendingUpdates = computed(() => {
    return pendingUpdates.value.size > 0
  })

  return {
    cartItems,
    isUpdating,
    hasPendingUpdates,
    totalItems,
    totalPrice,
    totalSavings,
    itemCount,
    loadCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    applyDiscount,
    batchUpdate,
    syncCart
  }
}

