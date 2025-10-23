export const API_CONFIG = {
  BASE_URL: '/api',
  TIMEOUT: 30000, // Increased timeout for better reliability
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-API-Version': '1.0',
    'X-Client-Version': import.meta.env.VITE_APP_VERSION || '1.0.0'
  }
}

// Build API URL function
export const buildApiUrl = (endpoint) => {
  const baseUrl = API_CONFIG.BASE_URL
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  return `${baseUrl}/${cleanEndpoint}`
}

// API configuration object
export const apiConfig = {
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS
}

// Get authentication headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token')
  const headers = { ...API_CONFIG.HEADERS }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

// Get basic headers (without auth)
export const getHeaders = () => {
  return { ...API_CONFIG.HEADERS }
}

// Advanced API request with retry logic
export const apiRequest = async (url, options = {}, retryCount = 0) => {
  const defaultOptions = {
    method: 'GET',
    headers: getHeaders(),
    timeout: API_CONFIG.TIMEOUT,
    ...options
  }

  try {
    const response = await fetch(url, defaultOptions)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response
  } catch (error) {
    if (retryCount < API_CONFIG.RETRY_ATTEMPTS) {
      console.warn(`API request failed, retrying... (${retryCount + 1}/${API_CONFIG.RETRY_ATTEMPTS})`)
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY * (retryCount + 1)))
      return apiRequest(url, options, retryCount + 1)
    }

    throw error
  }
}

// API request with authentication
export const authenticatedApiRequest = async (url, options = {}) => {
  const headers = getAuthHeaders()
  return apiRequest(url, { ...options, headers })
}

// API endpoints configuration
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password'
  },

  // Product endpoints
  PRODUCTS: {
    LIST: '/products',
    DETAIL: '/products/:id',
    SEARCH: '/products/search',
    CATEGORIES: '/products/categories',
    FEATURED: '/products/featured',
    RECENT: '/products/recent'
  },

  // Cart endpoints
  CART: {
    LIST: '/cart',
    ADD: '/cart/add',
    UPDATE: '/cart/update',
    REMOVE: '/cart/remove',
    CLEAR: '/cart/clear'
  },

  // Order endpoints
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    DETAIL: '/orders/:id',
    UPDATE_STATUS: '/orders/:id/status'
  },

  // User endpoints
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    CHANGE_PASSWORD: '/user/change-password',
    WISHLIST: '/user/wishlist',
    ADDRESSES: '/user/addresses'
  }
}

// API response interceptor
export const handleApiResponse = async (response) => {
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'API request failed')
  }

  return data
}
