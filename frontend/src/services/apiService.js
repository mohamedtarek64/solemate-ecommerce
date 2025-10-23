// Import performance monitoring
import { performanceMonitor } from '../utils/performanceMonitor.js'
import { apiCache } from '../utils/apiCache.js'
import { requestDeduplicator } from '../utils/requestDeduplication.js'

// API Service for Backend Integration
class ApiService {
  constructor() {
    this.baseURL = 'http://127.0.0.1:8000/api'
    this.timeout = 5000 // Reduced timeout for faster response
    this.cache = apiCache // Use centralized cache
    this.requestQueue = new Map()
    this.retryCount = 2 // Reduced retry count
    this.retryDelay = 500 // Reduced retry delay
    this.batchRequests = new Map()
    this.batchTimeout = 50 // Batch requests within 50ms
    this.deduplicator = requestDeduplicator // Request deduplication
  }

  // Get current user ID (dynamic support) - Optimized with caching
  getCurrentUserId() {
    const cacheKey = 'current_user_id'

    // Disable cache for now to ensure fresh user ID
    // if (this.cache.has(cacheKey)) {
    //   const cached = this.cache.get(cacheKey)
    //   if (Date.now() - cached.timestamp < 30000) { // 30 seconds cache
    //     return cached.value
    //   }
    // }

    let userId = null

    // Method 1: From URL params (for testing different users)
    const urlParams = new URLSearchParams(window.location.search)
    const userIdFromUrl = urlParams.get('user_id')
    if (userIdFromUrl) {
      userId = parseInt(userIdFromUrl)
      }

    // Method 2: From localStorage (if user is logged in)
    if (!userId) {
      const storedUserId = localStorage.getItem('user_id')
      if (storedUserId) {
        userId = parseInt(storedUserId)
        }
    }

    // Method 3: From auth store (if available)
    if (!userId) {
      const authUser = localStorage.getItem('auth_user')
      if (authUser) {
        try {
          const user = JSON.parse(authUser)
          if (user && user.id) {
            userId = parseInt(user.id)
          }
        } catch (e) {
          console.warn('Failed to parse auth_user from localStorage')
        }
      }
    }

    // Method 4: From user_data (common key used by auth store)
    if (!userId) {
      const userData = localStorage.getItem('user_data')
      if (userData) {
        try {
          const user = JSON.parse(userData)
          if (user && (user.id || user.user?.id)) {
            userId = parseInt(user.id || user.user.id)
            }
        } catch (e) {
          console.warn('Failed to parse user_data from localStorage')
        }
      }
    }

    // Method 5: Check if user is authenticated from token
    if (!userId) {
      const token = localStorage.getItem('auth_token')
      if (token) {
        try {
          // Decode JWT token to get user ID (simple base64 decode)
          const payload = JSON.parse(atob(token.split('.')[1]))
          if (payload && payload.user_id) {
            userId = parseInt(payload.user_id)
            }
        } catch (e) {
          console.warn('Failed to decode token for user ID')
        }
      }
    }

    // Method 6: Check URL for user_id parameter (for testing)
    if (!userId) {
      const urlParams = new URLSearchParams(window.location.search)
      const userIdFromUrl = urlParams.get('user_id')
      if (userIdFromUrl) {
        userId = parseInt(userIdFromUrl)
        }
    }

    // Method 7: Default to 35 for testing (instead of 18)
    if (!userId) {
      userId = 35
    }

    // Cache the result
    this.cache.set(cacheKey, {
      value: userId,
      timestamp: Date.now()
    })

    return userId
  }

  // Get authentication token - Optimized with caching
  getAuthToken() {
    const cacheKey = 'auth_token'

    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (Date.now() - cached.timestamp < 60000) { // 1 minute cache
        return cached.value
      }
    }

    const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token')

    // Cache the result
    this.cache.set(cacheKey, {
      value: token,
      timestamp: Date.now()
    })

    return token
  }

  // Request deduplication
  async deduplicateRequest(url, options) {
    const requestKey = `${url}:${JSON.stringify(options)}`

    if (this.requestQueue.has(requestKey)) {
      return this.requestQueue.get(requestKey)
    }

    const promise = this.makeRequest(url, options)
    this.requestQueue.set(requestKey, promise)

    try {
      const result = await promise
      return result
    } finally {
      this.requestQueue.delete(requestKey)
    }
  }

  // Enhanced request method with retry logic
  async makeRequest(url, options = {}) {
    const token = this.getAuthToken()

    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      ...options
    }

    for (let attempt = 1; attempt <= this.retryCount; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.timeout)

        const response = await fetch(url, {
          ...config,
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        return { success: true, data }
      } catch (error) {
        if (attempt === this.retryCount) {
          throw error
        }

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt))
      }
    }
  }

  // Set authentication token
  setAuthToken(token) {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('access_token', token) // For compatibility
  }

  // Clear authentication token
  clearAuthToken() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('access_token')
    localStorage.removeItem('auth_user')
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const userId = this.getCurrentUserId()

    // Start performance monitoring
    performanceMonitor.startTiming(`api_request_${endpoint}`)

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
      },
      timeout: this.timeout,
    }

    // Add authentication token if available
    const token = this.getAuthToken()
    if (token) {
      defaultOptions.headers['Authorization'] = `Bearer ${token}`
    }

    // Add user_id to request if not already present
    if (options.body && typeof options.body === 'string') {
      try {
        const bodyData = JSON.parse(options.body)
        if (!bodyData.user_id) {
          bodyData.user_id = userId
          options.body = JSON.stringify(bodyData)
        }
      } catch (e) {
        // If body is not JSON, add user_id as query parameter
        const separator = endpoint.includes('?') ? '&' : '?'
        endpoint += `${separator}user_id=${userId}`
      }
    } else if (options.body && typeof options.body === 'object') {
      if (!options.body.user_id) {
        options.body.user_id = userId
      }
    }

    const finalOptions = { ...defaultOptions, ...options }
    const method = (finalOptions.method || 'GET').toUpperCase()

    // Ensure user_id is present for GET/DELETE requests
    let finalUrl = url
    if ((method === 'GET' || method === 'DELETE') && !finalUrl.includes('user_id=')) {
      const sep = finalUrl.includes('?') ? '&' : '?'
      finalUrl = `${finalUrl}${sep}user_id=${userId}`
    }

    // Fallback: if body is string without user_id, append as query param
    if (finalOptions.body && typeof finalOptions.body === 'string' && !finalOptions.body.includes('user_id') && !finalUrl.includes('user_id=')) {
      const sep = finalUrl.includes('?') ? '&' : '?'
      finalUrl = `${finalUrl}${sep}user_id=${userId}`
    }

    try {
      if (options.body) {
        }

      const response = await fetch(finalUrl, finalOptions)

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorData = await response.json()
          if (errorData.message) {
            errorMessage = errorData.message
          }
          if (errorData.errors) {
            errorMessage += ` - Errors: ${JSON.stringify(errorData.errors)}`
          }
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = `${response.status} ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      // End performance monitoring
      const duration = performanceMonitor.endTiming(`api_request_${endpoint}`)
      if (duration) {
        performanceMonitor.recordMetric(`api_success_${endpoint}`, duration, {
          endpoint,
          status: response.status
        })
      }

      return data
    } catch (error) {
      console.error(`❌ API Error for ${endpoint}:`, error)

      // End performance monitoring for errors
      const duration = performanceMonitor.endTiming(`api_request_${endpoint}`)
      if (duration) {
        performanceMonitor.recordMetric(`api_error_${endpoint}`, duration, {
          endpoint,
          error: error.message
        })
      }

      throw error
    }
  }

  // GET request with caching and deduplication
  async get(endpoint, params = {}, options = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint
    const fullUrl = `${this.baseURL}${url}`

    // Check cache first (if not disabled)
    if (!options.skipCache) {
      const cacheKey = options.cacheKey || url
      const cached = this.cache.get(cacheKey)

      if (cached) {
        return cached
      }
    }

    // Use request deduplication for GET requests
    return this.deduplicator.request(fullUrl, { method: 'GET' }, async () => {
      const result = await this.request(url, { method: 'GET' })

      // Cache successful GET requests
      if (result && !options.skipCache) {
        const cacheKey = options.cacheKey || url
        const cacheTTL = options.cacheTTL || this.cache.getCacheDuration(url)
        this.cache.set(cacheKey, result, cacheTTL)
      }

      return result
    })
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // DELETE request
  async delete(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint

    return this.request(url, { method: 'DELETE' })
  }

  // Cart API methods
  async getCartItems() {
    return this.get('/cart/')
  }

  async addToCart(productId, quantity = 1, color = '', size = '', productTable = 'products_women', userId = null) {
    // Get user ID from parameter or localStorage
    if (!userId) {
      userId = parseInt(localStorage.getItem('user_id'))
    }
    if (!userId) {
      userId = parseInt(localStorage.getItem('auth_user_id'))
    }
    if (!userId) {
      userId = 18 // Default for testing
    }

    console.log('User ID debug:', {
      userId,
      localStorage_user_id: localStorage.getItem('user_id'),
      localStorage_auth_user_id: localStorage.getItem('auth_user_id')
    })

    // Validate productId before creating request body
    if (!productId || productId === null || productId === undefined) {
      console.error('❌ API Service: Product ID is invalid!', {
        productId,
        type: typeof productId,
        isNull: productId === null,
        isUndefined: productId === undefined
      })
      throw new Error('Product ID is required for cart add operation')
    }

    const requestBody = {
      product_id: productId,
      quantity,
      color,
      size,
      product_table: productTable,
      user_id: userId
    }

    return this.post('/cart/add', requestBody)
  }

  async updateCartItem(itemId, quantity) {
    const userId = parseInt(localStorage.getItem('user_id')) || 18
    return this.put(`/cart/items/${itemId}`, {
      quantity,
      user_id: userId
    })
  }

  async removeCartItem(itemId) {
    const userId = parseInt(localStorage.getItem('user_id')) || 18
    return this.delete(`/cart/items/${itemId}?user_id=${userId}`)
  }

  async clearCart() {
    return this.delete('/cart/clear')
  }

  async getCartCount() {
    return this.get('/cart/count')
  }

  // Wishlist API methods
  async getWishlistItems() {
    return this.get('/wishlist/')
  }

  async addToWishlist(productId, color = '', size = '', productTable = 'products_women') {
    return this.post('/wishlist/add', {
      product_id: productId,
      color,
      size,
      product_table: productTable
    })
  }

  async removeFromWishlist(productId) {
    return this.delete('/wishlist/remove', { product_id: productId })
  }

  async clearWishlist() {
    return this.delete('/wishlist/clear')
  }

  async getWishlistCount() {
    return this.get('/wishlist/count')
  }

  async checkWishlistStatus(productId) {
    return this.get(`/wishlist/check/${productId}`)
  }

  // Product API methods
  async getProduct(productId) {
    return this.get(`/products/${productId}`)
  }

  // Authentication API methods
  async login(email, password) {
    return this.post('/auth/login', { email, password })
  }

  async register(name, email, password, password_confirmation) {
    return this.post('/auth/register', { name, email, password, password_confirmation })
  }

  async logout() {
    return this.post('/auth/logout')
  }

  async refreshToken() {
    return this.post('/auth/refresh')
  }

  async getCurrentUser() {
    return this.get('/auth/me')
  }

  // Health check
  async healthCheck() {
    return this.get('/health')
  }
}

// Create singleton instance
const apiService = new ApiService()

export default apiService
