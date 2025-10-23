/**
 * API Composable
 *
 * Provides centralized API functionality with error handling and loading states
 */
import { ref, computed } from 'vue'
import { useBaseComposable } from './useBaseComposable'
import apiService from '@/services/apiService'

export function useApi() {
  const base = useBaseComposable()

  // API-specific state
  const lastRequest = ref(null)
  const requestHistory = ref([])

  // Computed properties
  const hasRequestHistory = computed(() => requestHistory.value.length > 0)
  const isOnline = computed(() => navigator.onLine)

  // Enhanced API methods with error handling
  const apiGet = async (endpoint, options = {}) => {
    return base.executeAsync(
      () => apiService.get(endpoint, options),
      {
        showErrorMessage: `Failed to fetch data from ${endpoint}`,
        ...options
      }
    )
  }

  const apiPost = async (endpoint, data, options = {}) => {
    return base.executeAsync(
      () => apiService.post(endpoint, data, options),
      {
        showErrorMessage: `Failed to submit data to ${endpoint}`,
        ...options
      }
    )
  }

  const apiPut = async (endpoint, data, options = {}) => {
    return base.executeAsync(
      () => apiService.put(endpoint, data, options),
      {
        showErrorMessage: `Failed to update data at ${endpoint}`,
        ...options
      }
    )
  }

  const apiDelete = async (endpoint, options = {}) => {
    return base.executeAsync(
      () => apiService.delete(endpoint, options),
      {
        showErrorMessage: `Failed to delete data from ${endpoint}`,
        ...options
      }
    )
  }

  // Specialized API methods
  const fetchWithCache = async (endpoint, cacheKey, ttl = 300000) => { // 5 minutes default
    const cache = localStorage.getItem(cacheKey)
    const now = Date.now()

    if (cache) {
      const { data, timestamp } = JSON.parse(cache)
      if (now - timestamp < ttl) {
        return { success: true, data, cached: true }
      }
    }

    const result = await apiGet(endpoint)
    if (result.success) {
      localStorage.setItem(cacheKey, JSON.stringify({
        data: result.data,
        timestamp: now
      }))
    }

    return result
  }

  const batchRequests = async (requests) => {
    return Promise.allSettled(requests.map(request => {
      if (typeof request === 'function') {
        return request()
      }
      return request
    }))
  }

  const paginatedRequest = async (endpoint, page = 1, perPage = 10, params = {}) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      ...params
    })

    return apiGet(`${endpoint}?${queryParams}`)
  }

  // Request tracking
  const trackRequest = (endpoint, method, timestamp = Date.now()) => {
    lastRequest.value = { endpoint, method, timestamp }
    requestHistory.value.unshift({ endpoint, method, timestamp })

    // Keep only last 50 requests
    if (requestHistory.value.length > 50) {
      requestHistory.value = requestHistory.value.slice(0, 50)
    }
  }

  // Clear cache
  const clearCache = (pattern = null) => {
    if (pattern) {
      Object.keys(localStorage).forEach(key => {
        if (key.includes(pattern)) {
          localStorage.removeItem(key)
        }
      })
    } else {
      // Clear all API cache
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('api_cache_')) {
          localStorage.removeItem(key)
        }
      })
    }
  }

  // Health check
  const healthCheck = async () => {
    try {
      const result = await apiService.healthCheck()
      base.showSuccess('API connection is healthy')
      return result
    } catch (err) {
      base.showError('API connection failed')
      throw err
    }
  }

  // Network status monitoring
  const setupNetworkMonitoring = () => {
    const handleOnline = () => {
      base.showSuccess('Connection restored')
    }

    const handleOffline = () => {
      base.showWarning('Connection lost - some features may be limited')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }

  return {
    // Base composable methods
    ...base,

    // API-specific state
    lastRequest,
    requestHistory,

    // Computed
    hasRequestHistory,
    isOnline,

    // API methods
    apiGet,
    apiPost,
    apiPut,
    apiDelete,

    // Enhanced methods
    fetchWithCache,
    batchRequests,
    paginatedRequest,
    trackRequest,
    clearCache,
    healthCheck,
    setupNetworkMonitoring
  }
}
