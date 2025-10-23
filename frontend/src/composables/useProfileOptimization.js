/**
 * Profile Page Optimization
 * Optimizes profile operations with data prefetching and caching
 */

import { ref, computed, watch } from 'vue'
import advancedCache from '@/utils/advancedCache'
import performanceMonitor from '@/utils/performanceMonitorEnhanced'

export function useProfileOptimization(userId) {
  const profileData = ref({
    user: null,
    orders: [],
    wishlist: [],
    addresses: [],
    paymentMethods: []
  })

  const isLoading = ref(true)
  const loadingStates = ref({
    user: true,
    orders: true,
    wishlist: true,
    addresses: true,
    paymentMethods: true
  })

  /**
   * Load user profile (priority)
   */
  const loadUserProfile = async (fetchFn) => {
    const cacheKey = `profile_user_${userId.value}`
    const measurement = performanceMonitor.startMeasure('profile-user', 'api-call')

    try {
      // Try cache first (5 minutes TTL)
      const cached = advancedCache.get(cacheKey)
      if (cached) {
        profileData.value.user = cached
        loadingStates.value.user = false
        performanceMonitor.endMeasure(measurement)
        return cached
      }

      const data = await fetchFn()
      profileData.value.user = data
      loadingStates.value.user = false

      // Cache for 5 minutes
      advancedCache.set(cacheKey, data, 5 * 60 * 1000)

      performanceMonitor.endMeasure(measurement)
      return data
    } catch (err) {
      loadingStates.value.user = false
      throw err
    }
  }

  /**
   * Load user orders (lazy)
   */
  const loadOrders = async (fetchFn, page = 1, limit = 10) => {
    const cacheKey = `profile_orders_${userId.value}_${page}`
    const measurement = performanceMonitor.startMeasure('profile-orders', 'api-call')

    try {
      // Try cache first (2 minutes TTL)
      const cached = advancedCache.get(cacheKey)
      if (cached) {
        profileData.value.orders = cached
        loadingStates.value.orders = false
        performanceMonitor.endMeasure(measurement)
        return cached
      }

      // Delay to prioritize user profile
      await new Promise(resolve => setTimeout(resolve, 200))

      const data = await fetchFn(page, limit)
      profileData.value.orders = data
      loadingStates.value.orders = false

      // Cache for 2 minutes
      advancedCache.set(cacheKey, data, 2 * 60 * 1000)

      performanceMonitor.endMeasure(measurement)
      return data
    } catch (err) {
      loadingStates.value.orders = false
      throw err
    }
  }

  /**
   * Load wishlist (lazy)
   */
  const loadWishlist = async (fetchFn) => {
    const cacheKey = `profile_wishlist_${userId.value}`
    const measurement = performanceMonitor.startMeasure('profile-wishlist', 'api-call')

    try {
      // Try cache first (5 minutes TTL)
      const cached = advancedCache.get(cacheKey)
      if (cached) {
        profileData.value.wishlist = cached
        loadingStates.value.wishlist = false
        performanceMonitor.endMeasure(measurement)
        return cached
      }

      // Delay to prioritize user profile
      await new Promise(resolve => setTimeout(resolve, 300))

      const data = await fetchFn()
      profileData.value.wishlist = data
      loadingStates.value.wishlist = false

      // Cache for 5 minutes
      advancedCache.set(cacheKey, data, 5 * 60 * 1000)

      performanceMonitor.endMeasure(measurement)
      return data
    } catch (err) {
      loadingStates.value.wishlist = false
      throw err
    }
  }

  /**
   * Load addresses
   */
  const loadAddresses = async (fetchFn) => {
    const cacheKey = `profile_addresses_${userId.value}`
    const measurement = performanceMonitor.startMeasure('profile-addresses', 'api-call')

    try {
      // Try cache first (10 minutes TTL)
      const cached = advancedCache.get(cacheKey)
      if (cached) {
        profileData.value.addresses = cached
        loadingStates.value.addresses = false
        performanceMonitor.endMeasure(measurement)
        return cached
      }

      const data = await fetchFn()
      profileData.value.addresses = data
      loadingStates.value.addresses = false

      // Cache for 10 minutes
      advancedCache.set(cacheKey, data, 10 * 60 * 1000)

      performanceMonitor.endMeasure(measurement)
      return data
    } catch (err) {
      loadingStates.value.addresses = false
      throw err
    }
  }

  /**
   * Load payment methods
   */
  const loadPaymentMethods = async (fetchFn) => {
    const cacheKey = `profile_payments_${userId.value}`
    const measurement = performanceMonitor.startMeasure('profile-payments', 'api-call')

    try {
      // Try cache first (10 minutes TTL)
      const cached = advancedCache.get(cacheKey)
      if (cached) {
        profileData.value.paymentMethods = cached
        loadingStates.value.paymentMethods = false
        performanceMonitor.endMeasure(measurement)
        return cached
      }

      const data = await fetchFn()
      profileData.value.paymentMethods = data
      loadingStates.value.paymentMethods = false

      // Cache for 10 minutes
      advancedCache.set(cacheKey, data, 10 * 60 * 1000)

      performanceMonitor.endMeasure(measurement)
      return data
    } catch (err) {
      loadingStates.value.paymentMethods = false
      throw err
    }
  }

  /**
   * Optimistic profile update
   */
  const updateProfile = async (updates, updateFn) => {
    const measurement = performanceMonitor.startMeasure('profile-update', 'interaction')

    // Save previous state
    const previousState = { ...profileData.value.user }

    // Optimistic update
    profileData.value.user = {
      ...profileData.value.user,
      ...updates
    }

    try {
      const result = await updateFn(updates)

      // Invalidate cache
      advancedCache.delete(`profile_user_${userId.value}`)

      performanceMonitor.endMeasure(measurement)
      return result
    } catch (err) {
      // Rollback on error
      profileData.value.user = previousState
      performanceMonitor.endMeasure(measurement)
      throw err
    }
  }

  /**
   * Upload avatar with progress
   */
  const uploadAvatar = async (file, uploadFn, onProgress) => {
    const measurement = performanceMonitor.startMeasure('profile-avatar-upload', 'interaction')

    try {
      // Compress image before upload
      const compressed = await compressImage(file)

      // Upload with progress tracking
      const result = await uploadFn(compressed, onProgress)

      // Update profile optimistically
      if (result.url) {
        profileData.value.user.avatar = result.url
      }

      // Invalidate cache
      advancedCache.delete(`profile_user_${userId.value}`)

      performanceMonitor.endMeasure(measurement)
      return result
    } catch (err) {
      performanceMonitor.endMeasure(measurement)
      throw err
    }
  }

  /**
   * Compress image before upload
   */
  const compressImage = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          // Max dimensions
          const MAX_WIDTH = 800
          const MAX_HEIGHT = 800

          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height
              height = MAX_HEIGHT
            }
          }

          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob(resolve, 'image/jpeg', 0.85)
        }
        img.onerror = reject
        img.src = e.target.result
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  /**
   * Optimistic address operations
   */
  const addAddress = async (address, addFn) => {
    const measurement = performanceMonitor.startMeasure('profile-add-address', 'interaction')

    // Optimistic update
    const tempId = Date.now()
    const newAddress = { id: tempId, ...address }
    profileData.value.addresses.push(newAddress)

    try {
      const result = await addFn(address)

      // Replace temp with real data
      const index = profileData.value.addresses.findIndex(a => a.id === tempId)
      if (index !== -1) {
        profileData.value.addresses[index] = result
      }

      // Invalidate cache
      advancedCache.delete(`profile_addresses_${userId.value}`)

      performanceMonitor.endMeasure(measurement)
      return result
    } catch (err) {
      // Remove on error
      profileData.value.addresses = profileData.value.addresses.filter(a => a.id !== tempId)
      performanceMonitor.endMeasure(measurement)
      throw err
    }
  }

  /**
   * Delete address
   */
  const deleteAddress = async (addressId, deleteFn) => {
    const measurement = performanceMonitor.startMeasure('profile-delete-address', 'interaction')

    // Save for rollback
    const index = profileData.value.addresses.findIndex(a => a.id === addressId)
    const deletedAddress = profileData.value.addresses[index]

    // Optimistic update
    profileData.value.addresses = profileData.value.addresses.filter(a => a.id !== addressId)

    try {
      await deleteFn(addressId)

      // Invalidate cache
      advancedCache.delete(`profile_addresses_${userId.value}`)

      performanceMonitor.endMeasure(measurement)
      return { success: true }
    } catch (err) {
      // Restore on error
      profileData.value.addresses.splice(index, 0, deletedAddress)
      performanceMonitor.endMeasure(measurement)
      throw err
    }
  }

  /**
   * Prefetch related data
   */
  const prefetchRelatedData = (fetchFunctions) => {
    setTimeout(async () => {
      // Prefetch orders and wishlist
      await Promise.all([
        loadOrders(fetchFunctions.orders),
        loadWishlist(fetchFunctions.wishlist)
      ])
    }, 1000)
  }

  /**
   * Clear profile cache
   */
  const clearCache = () => {
    advancedCache.invalidatePattern(`profile_`)
  }

  // Computed
  const isFullyLoaded = computed(() => {
    return !Object.values(loadingStates.value).some(state => state === true)
  })

  const totalOrders = computed(() => {
    return profileData.value.orders?.length || 0
  })

  const totalWishlistItems = computed(() => {
    return profileData.value.wishlist?.length || 0
  })

  // Watch userId changes
  watch(userId, () => {
    clearCache()
    isLoading.value = true
  })

  return {
    profileData,
    isLoading,
    loadingStates,
    isFullyLoaded,
    totalOrders,
    totalWishlistItems,
    loadUserProfile,
    loadOrders,
    loadWishlist,
    loadAddresses,
    loadPaymentMethods,
    updateProfile,
    uploadAvatar,
    addAddress,
    deleteAddress,
    prefetchRelatedData,
    clearCache
  }
}

