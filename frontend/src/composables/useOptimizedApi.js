import { ref, computed, readonly } from 'vue'
import {
  optimizedApiCall,
  apiCache,
  loadingManager,
  debounce,
  throttle,
  performanceMonitor
} from '@/utils/performance.js'

/**
 * Optimized API composable with caching and loading states
 */
export function useOptimizedApi() {
  const loading = ref(false)
  const error = ref(null)
  const data = ref(null)

  /**
   * Make an optimized API call with caching
   */
  const call = async (url, options = {}, cacheKey = null, cacheTtl = null) => {
    const loadingKey = cacheKey || url

    try {
      loadingManager.setLoading(loadingKey, true)
      error.value = null

      const result = await optimizedApiCall(url, options, cacheKey, cacheTtl)
      data.value = result

      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loadingManager.setLoading(loadingKey, false)
    }
  }

  /**
   * GET request with caching
   */
  const get = async (url, cacheKey = null, cacheTtl = null) => {
    return call(url, { method: 'GET' }, cacheKey, cacheTtl)
  }

  /**
   * POST request
   */
  const post = async (url, body = {}, cacheKey = null) => {
    const result = await call(url, {
      method: 'POST',
      body: JSON.stringify(body)
    }, cacheKey)

    // Invalidate related cache entries
    if (cacheKey) {
      apiCache.invalidateRelated(cacheKey)
    }

    return result
  }

  /**
   * PUT request
   */
  const put = async (url, body = {}, cacheKey = null) => {
    const result = await call(url, {
      method: 'PUT',
      body: JSON.stringify(body)
    }, cacheKey)

    // Invalidate related cache entries
    if (cacheKey) {
      apiCache.invalidateRelated(cacheKey)
    }

    return result
  }

  /**
   * DELETE request
   */
  const del = async (url, cacheKey = null) => {
    const result = await call(url, {
      method: 'DELETE'
    }, cacheKey)

    // Invalidate related cache entries
    if (cacheKey) {
      apiCache.invalidateRelated(cacheKey)
    }

    return result
  }

  const deleteMethod = del

  /**
   * Clear cache for specific key or pattern
   */
  const clearCache = (pattern) => {
    apiCache.invalidate(pattern)
  }

  /**
   * Check if data is cached
   */
  const isCached = (key) => {
    return apiCache.has(key)
  }

  /**
   * Get cached data
   */
  const getCached = (key) => {
    return apiCache.get(key)
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    data,
    call,
    get,
    post,
    put,
    delete: del,
    del,
    deleteMethod,
    clearCache,
    isCached,
    getCached
  }
}

/**
 * Debounced API composable for search and filters
 */
export function useDebouncedApi(delay = 300) {
  const { loading, error, data, call } = useOptimizedApi()

  const debouncedCall = debounce(async (url, options = {}, cacheKey = null, cacheTtl = null) => {
    return call(url, options, cacheKey, cacheTtl)
  }, delay)

  return {
    loading: readonly(loading),
    error: readonly(error),
    data,
    call: debouncedCall
  }
}

/**
 * Throttled API composable for frequent updates
 */
export function useThrottledApi(limit = 1000) {
  const { loading, error, data, call } = useOptimizedApi()

  const throttledCall = throttle(async (url, options = {}, cacheKey = null, cacheTtl = null) => {
    return call(url, options, cacheKey, cacheTtl)
  }, limit)

  return {
    loading: readonly(loading),
    error: readonly(error),
    data,
    call: throttledCall
  }
}

/**
 * Paginated API composable
 */
export function usePaginatedApi(baseUrl, options = {}) {
  const { loading, error, data, get } = useOptimizedApi()
  const page = ref(options.initialPage || 1)
  const perPage = ref(options.perPage || 10)
  const total = ref(0)
  const totalPages = computed(() => Math.ceil(total.value / perPage.value))

  const loadPage = async (pageNum = page.value) => {
    const url = `${baseUrl}?page=${pageNum}&per_page=${perPage.value}`
    const cacheKey = `${baseUrl}_page_${pageNum}_${perPage.value}`

    try {
      const result = await get(url, cacheKey)

      if (result.data) {
        data.value = result.data
        total.value = result.total || result.data.length
      } else {
        data.value = result
        total.value = result.length
      }

      page.value = pageNum
      return result
    } catch (err) {
      throw err
    }
  }

  const nextPage = () => {
    if (page.value < totalPages.value) {
      return loadPage(page.value + 1)
    }
  }

  const prevPage = () => {
    if (page.value > 1) {
      return loadPage(page.value - 1)
    }
  }

  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages.value) {
      return loadPage(pageNum)
    }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    data,
    page: readonly(page),
    perPage: readonly(perPage),
    total: readonly(total),
    totalPages,
    loadPage,
    nextPage,
    prevPage,
    goToPage
  }
}

/**
 * Optimized wishlist API composable
 */
export function useOptimizedWishlist() {
  const { loading, error, data, get, post, deleteMethod: del, clearCache } = useOptimizedApi()

  const loadWishlist = async (userId, forceRefresh = false) => {
    const cacheKey = `wishlist_${userId}`

    if (!forceRefresh && apiCache.has(cacheKey)) {
      data.value = apiCache.get(cacheKey)
      return data.value
    }

    return get(`/api/wishlist?user_id=${userId}`, cacheKey, 2 * 60 * 1000) // 2 minutes cache
  }

  const addToWishlist = async (item) => {
    const result = await post('/api/wishlist/add', item, 'wishlist')

    // Clear wishlist cache
    clearCache(/^wishlist_/)

    return result
  }

  const removeFromWishlist = async (itemId) => {
    const result = await del(`/api/wishlist/items/${itemId}`, 'wishlist')

    // Clear wishlist cache
    clearCache(/^wishlist_/)

    return result
  }

  const clearWishlist = async () => {
    const result = await del('/api/wishlist/clear', 'wishlist')

    // Clear wishlist cache
    clearCache(/^wishlist_/)

    return result
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    data,
    loadWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist
  }
}

/**
 * Optimized cart API composable
 */
export function useOptimizedCart() {
  const { loading, error, data, get, post, put, deleteMethod: del, clearCache } = useOptimizedApi()

  const loadCart = async (userId, forceRefresh = false) => {
    const cacheKey = `cart_${userId}`

    if (!forceRefresh && apiCache.has(cacheKey)) {
      data.value = apiCache.get(cacheKey)
      return data.value
    }

    return get(`/api/cart?user_id=${userId}`, cacheKey, 1 * 60 * 1000) // 1 minute cache
  }

  const addToCart = async (item) => {
    const result = await post('/api/cart/add', item, 'cart')

    // Clear cart cache
    clearCache(/^cart_/)

    return result
  }

  const updateCartItem = async (itemId, quantity) => {
    const result = await put(`/api/cart/items/${itemId}`, { quantity }, 'cart')

    // Clear cart cache
    clearCache(/^cart_/)

    return result
  }

  const removeFromCart = async (itemId) => {
    const userId = parseInt(localStorage.getItem('user_id')) || 18
    const result = await del(`/api/cart/items/${itemId}?user_id=${userId}`, 'cart')

    // Clear cart cache
    clearCache(/^cart_/)

    return result
  }

  const clearCart = async () => {
    const result = await del('/api/cart/clear', 'cart')

    // Clear cart cache
    clearCache(/^cart_/)

    return result
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    data,
    loadCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
  }
}

/**
 * Optimized products API composable
 */
export function useOptimizedProducts() {
  const { loading, error, data, get, clearCache } = useOptimizedApi()

  const loadProducts = async (filters = {}, forceRefresh = false) => {
    const params = new URLSearchParams(filters).toString()
    const cacheKey = `products_${params}`

    if (!forceRefresh && apiCache.has(cacheKey)) {
      data.value = apiCache.get(cacheKey)
      return data.value
    }

    return get(`/api/products?${params}`, cacheKey, 5 * 60 * 1000) // 5 minutes cache
  }

  const loadProduct = async (productId, forceRefresh = false) => {
    const cacheKey = `product_${productId}`

    if (!forceRefresh && apiCache.has(cacheKey)) {
      data.value = apiCache.get(cacheKey)
      return data.value
    }

    return get(`/api/products/${productId}`, cacheKey, 10 * 60 * 1000) // 10 minutes cache
  }

  const searchProducts = async (query, filters = {}) => {
    const params = new URLSearchParams({ q: query, ...filters }).toString()
    const cacheKey = `search_${params}`

    return get(`/api/products/search?${params}`, cacheKey, 2 * 60 * 1000) // 2 minutes cache
  }

  const clearProductsCache = () => {
    clearCache(/^(products_|product_|search_)/)
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    data,
    loadProducts,
    loadProduct,
    searchProducts,
    clearProductsCache
  }
}
