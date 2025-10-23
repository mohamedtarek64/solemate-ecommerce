/**
 * Enhanced API Service
 *
 * Provides type-safe API interactions with comprehensive error handling
 */
import errorHandler from './errorHandler'

class EnhancedApiService {
  constructor() {
    this.baseURL = 'http://127.0.0.1:8000/api'
    this.timeout = 10000 // 10 seconds
    this.retryAttempts = 3
    this.retryDelay = 1000 // 1 second
    this.requestInterceptors = []
    this.responseInterceptors = []
    this.setupInterceptors()
  }

  /**
   * Setup request and response interceptors
   */
  setupInterceptors() {
    // Request interceptor
    this.addRequestInterceptor((config) => {
      // Add authentication token
      const token = this.getAuthToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      // Add user ID
      const userId = this.getCurrentUserId()
      if (userId) {
        if (config.method === 'GET' || config.method === 'DELETE') {
          const url = new URL(config.url, this.baseURL)
          url.searchParams.set('user_id', userId)
          config.url = url.pathname + url.search
        } else {
          if (!config.body) config.body = {}
          if (typeof config.body === 'string') {
            const bodyData = JSON.parse(config.body)
            bodyData.user_id = userId
            config.body = JSON.stringify(bodyData)
          } else {
            config.body.user_id = userId
          }
        }
      }

      // Add request timestamp
      config.metadata = {
        ...config.metadata,
        timestamp: Date.now(),
        requestId: this.generateRequestId()
      }

      return config
    })

    // Response interceptor
    this.addResponseInterceptor((response) => {
      // Log successful requests in development
      if (process.env.NODE_ENV === 'development') {
        }
      return response
    }, (error) => {
      // Handle errors
      errorHandler.handleApiError(error, error.config?.url)
      return Promise.reject(error)
    })
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor)
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(successHandler, errorHandler = null) {
    this.responseInterceptors.push({ successHandler, errorHandler })
  }

  /**
   * Generate unique request ID
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get current user ID
   */
  getCurrentUserId() {
    // Method 1: From URL params (for testing different users)
    const urlParams = new URLSearchParams(window.location.search)
    const userIdFromUrl = urlParams.get('user_id')
    if (userIdFromUrl) {
      return parseInt(userIdFromUrl)
    }

    // Method 2: From localStorage (if user is logged in)
    const storedUserId = localStorage.getItem('user_id')
    if (storedUserId) {
      return parseInt(storedUserId)
    }

    // Method 3: From auth store (if available)
    const authUser = localStorage.getItem('auth_user')
    if (authUser) {
      try {
        const user = JSON.parse(authUser)
        if (user && user.id) {
          return parseInt(user.id)
        }
      } catch (e) {
        console.warn('Failed to parse auth_user from localStorage')
      }
    }

    // Method 4: Default to 18 for testing
    return 18
  }

  /**
   * Get authentication token
   */
  getAuthToken() {
    return localStorage.getItem('auth_token') || localStorage.getItem('access_token')
  }

  /**
   * Set authentication token
   */
  setAuthToken(token) {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('access_token', token) // For compatibility
  }

  /**
   * Clear authentication token
   */
  clearAuthToken() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('access_token')
    localStorage.removeItem('auth_user')
  }

  /**
   * Apply request interceptors
   */
  applyRequestInterceptors(config) {
    return this.requestInterceptors.reduce((config, interceptor) => {
      return interceptor(config)
    }, config)
  }

  /**
   * Apply response interceptors
   */
  applyResponseInterceptors(response) {
    return this.responseInterceptors.reduce((response, interceptor) => {
      if (interceptor.successHandler) {
        return interceptor.successHandler(response)
      }
      return response
    }, response)
  }

  /**
   * Apply error interceptors
   */
  applyErrorInterceptors(error) {
    this.responseInterceptors.forEach(interceptor => {
      if (interceptor.errorHandler) {
        interceptor.errorHandler(error)
      }
    })
    return error
  }

  /**
   * Enhanced request method with retry logic
   */
  async request(endpoint, options = {}) {
    const config = this.prepareConfig(endpoint, options)

    // Apply request interceptors
    const interceptedConfig = this.applyRequestInterceptors(config)

    let lastError

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await this.executeRequest(interceptedConfig)
        return this.applyResponseInterceptors(response)
      } catch (error) {
        lastError = error

        // Don't retry on certain errors
        if (this.shouldNotRetry(error)) {
          break
        }

        // Wait before retry (exponential backoff)
        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay * Math.pow(2, attempt - 1))
        }
      }
    }

    // Apply error interceptors
    this.applyErrorInterceptors(lastError)
    throw lastError
  }

  /**
   * Prepare request configuration
   */
  prepareConfig(endpoint, options) {
    const url = `${this.baseURL}${endpoint}`

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: this.timeout,
    }

    return {
      url,
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      }
    }
  }

  /**
   * Execute the actual request
   */
  async executeRequest(config) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), config.timeout)

    try {
      const response = await fetch(config.url, {
        ...config,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok) {
        const error = new Error(data.message || 'Request failed')
        error.status = response.status
        error.data = data
        error.config = config
        throw error
      }

      return {
        data,
        status: response.status,
        config
      }
    } catch (error) {
      clearTimeout(timeoutId)

      if (error.name === 'AbortError') {
        const timeoutError = new Error('Request timed out')
        timeoutError.code = 'TIMEOUT_ERROR'
        timeoutError.config = config
        throw timeoutError
      }

      error.config = config
      throw error
    }
  }

  /**
   * Check if error should not be retried
   */
  shouldNotRetry(error) {
    // Don't retry on client errors (4xx) except 429 (rate limit)
    if (error.status >= 400 && error.status < 500 && error.status !== 429) {
      return true
    }

    // Don't retry on validation errors
    if (error.status === 422) {
      return true
    }

    return false
  }

  /**
   * Delay utility for retry logic
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * HTTP method helpers
   */
  get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options })
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options
    })
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options
    })
  }

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
      ...options
    })
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options })
  }

  /**
   * Specialized API methods with type safety
   */

  // Cart API methods
  async getCartItems() {
    const response = await this.get('/cart')
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    }
  }

  async addToCart(productId, quantity, color, size, productTable) {
    const response = await this.post('/cart/add', {
      product_id: productId,
      quantity,
      color,
      size,
      product_table: productTable
    })
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    }
  }

  async updateCartItem(itemId, quantity) {
    const response = await this.put(`/cart/items/${itemId}`, { quantity })
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    }
  }

  async removeCartItem(itemId) {
    const response = await this.delete(`/cart/items/${itemId}`)
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    }
  }

  async clearCart() {
    const response = await this.post('/cart/clear')
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    }
  }

  async getCartCount() {
    const response = await this.get('/cart/count')
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    }
  }

  // Wishlist API methods
  async getWishlistItems() {
    const response = await this.get('/wishlist')
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    }
  }

  async addToWishlist(productId, color, size, productTable) {
    const response = await this.post('/wishlist/add', {
      product_id: productId,
      color,
      size,
      product_table: productTable
    })
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    }
  }

  async removeFromWishlist(productId) {
    const response = await this.delete(`/wishlist/remove/${productId}`)
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    }
  }

  async clearWishlist() {
    const response = await this.post('/wishlist/clear')
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    }
  }

  async getWishlistCount() {
    const response = await this.get('/wishlist/count')
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    }
  }

  async checkWishlistStatus(productId) {
    const response = await this.get(`/wishlist/check/${productId}`)
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    }
  }

  // Product API methods
  async getProduct(productId) {
    const response = await this.get(`/products/${productId}`)
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    }
  }

  // Authentication API methods
  async login(email, password) {
    const response = await this.post('/auth/login', { email, password })
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    }
  }

  async register(name, email, password, password_confirmation) {
    const response = await this.post('/auth/register', {
      name,
      email,
      password,
      password_confirmation
    })
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    }
  }

  async logout() {
    const response = await this.post('/auth/logout')
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    }
  }

  async refreshToken() {
    const response = await this.post('/auth/refresh')
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    }
  }

  async getCurrentUser() {
    const response = await this.get('/auth/me')
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    }
  }

  // Health check
  async healthCheck() {
    const response = await this.get('/health')
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    }
  }
}

// Create singleton instance
const enhancedApiService = new EnhancedApiService()

export default enhancedApiService
