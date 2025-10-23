import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import advancedCache from './advancedCache'
// ✅ Import Global Error Handler
import globalErrorHandler from './globalErrorHandler'

// Temporary toast function until vue-toastification is properly set up
const showToast = (message, type = 'error') => {
  console.log(`[${type.toUpperCase()}]: ${message}`)
}

// Cache configuration for different endpoints
const cacheConfig = {
  '/products': { ttl: 10 * 60 * 1000, enabled: true }, // 10 minutes
  '/categories': { ttl: 30 * 60 * 1000, enabled: true }, // 30 minutes
  '/product/': { ttl: 15 * 60 * 1000, enabled: true }, // 15 minutes
  '/cart': { ttl: 0, enabled: false }, // No cache for cart
  '/orders': { ttl: 2 * 60 * 1000, enabled: true }, // 2 minutes
  '/user/profile': { ttl: 5 * 60 * 1000, enabled: true } // 5 minutes
}

// Create axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
})

/**
 * Get cache config for endpoint
 */
const getCacheConfig = (url) => {
  for (const [endpoint, config] of Object.entries(cacheConfig)) {
    if (url.includes(endpoint)) {
      return config
    }
  }
  return { ttl: 0, enabled: false }
}

/**
 * Generate cache key from request config
 */
const generateCacheKey = (config) => {
  const { url, params, data } = config
  return advancedCache.generateKey(url, { params, data })
}

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    // Add API version header
    config.headers['API-Version'] = 'v1'

    // Add authentication token
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Check cache for GET requests
    if (config.method === 'get') {
      const cacheConf = getCacheConfig(config.url)
      
      if (cacheConf.enabled && !config.skipCache) {
        const cacheKey = generateCacheKey(config)
        const cached = advancedCache.get(cacheKey)
        
        if (cached) {
          // Return cached response immediately
          config.adapter = () => {
            return Promise.resolve({
              data: cached,
              status: 200,
              statusText: 'OK (Cached)',
              headers: { 'x-cache': 'HIT' },
              config,
              request: {}
            })
          }
        }
      }
      
      // Remove timestamp for cache busting (we handle cache internally now)
      // Only add if explicitly requested
      if (config.bustCache) {
        config.params = {
          ...config.params,
          _t: Date.now()
        }
      }
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data || config.params)
    }

    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      const cacheStatus = response.headers['x-cache'] || 'MISS'
      console.log(`API Response: ${response.config.url} [${cacheStatus}]`, response.data)
    }

    // Cache GET responses
    if (response.config.method === 'get' && !response.headers['x-cache']) {
      const cacheConf = getCacheConfig(response.config.url)
      
      if (cacheConf.enabled && !response.config.skipCache) {
        const cacheKey = generateCacheKey(response.config)
        advancedCache.set(cacheKey, response.data, cacheConf.ttl)
      }
    }

    // Invalidate cache on mutations
    if (['post', 'put', 'patch', 'delete'].includes(response.config.method)) {
      // Invalidate related cache patterns
      const url = response.config.url
      if (url.includes('/products')) {
        advancedCache.invalidatePattern('/products')
      }
      if (url.includes('/cart')) {
        advancedCache.invalidatePattern('/cart')
      }
      if (url.includes('/wishlist')) {
        advancedCache.invalidatePattern('/wishlist')
      }
      if (url.includes('/orders')) {
        advancedCache.invalidatePattern('/orders')
      }
    }

    return response
  },
  async (error) => {
    const originalRequest = error.config

    // ✅ Use Global Error Handler
    const userMessage = globalErrorHandler.handleApiError(error, originalRequest)

    // Log error in development
    if (import.meta.env.DEV) {
      console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data || error.message)
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // Try to refresh token
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const refreshResponse = await apiClient.post('/auth/refresh', {
            refresh_token: refreshToken
          })

          if (refreshResponse.data.success) {
            const { token } = refreshResponse.data.data
            localStorage.setItem('auth_token', token)

            // Update the original request with new token
            originalRequest.headers.Authorization = `Bearer ${token}`

            // Retry original request with new token
            return apiClient(originalRequest)
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
        }
      }

      // If refresh fails or no refresh token, clear auth and redirect
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      showToast('You do not have permission to perform this action', 'error')
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      showToast('Resource not found', 'error')
    }

    // Handle 422 Validation Error
    if (error.response?.status === 422) {
      const errors = error.response.data.errors
      if (errors) {
        // Show first validation error
        const firstError = Object.values(errors)[0]
        if (Array.isArray(firstError)) {
          showToast(firstError[0], 'error')
        } else {
          showToast(firstError, 'error')
        }
      }
    }

    // Handle 429 Too Many Requests
    if (error.response?.status === 429) {
      showToast('Too many requests. Please try again later.', 'error')
    }

    // Handle 500 Server Error
    if (error.response?.status >= 500) {
      showToast('Server error. Please try again later.', 'error')
    }

    // Handle network errors
    if (!error.response) {
      // Don't show network error toast for now since backend is not running
      console.warn('Network error - Backend not available:', error.message)
    }

    return Promise.reject(error)
  }
)

// API helper functions
export const apiHelpers = {
  // GET request
  get: (url, config = {}) => apiClient.get(url, config),

  // POST request
  post: (url, data = {}, config = {}) => apiClient.post(url, data, config),

  // PUT request
  put: (url, data = {}, config = {}) => apiClient.put(url, data, config),

  // PATCH request
  patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),

  // DELETE request
  delete: (url, config = {}) => apiClient.delete(url, config),

  // Upload file
  upload: (url, formData, onProgress = null) => {
    return apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: onProgress
    })
  },

  // Download file
  download: (url, filename = 'download') => {
    return apiClient.get(url, {
      responseType: 'blob'
    }).then(response => {
      const blob = new Blob([response.data])
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = filename
      link.click()
      window.URL.revokeObjectURL(link.href)
    })
  }
}

// Export the configured axios instance
export default apiClient
