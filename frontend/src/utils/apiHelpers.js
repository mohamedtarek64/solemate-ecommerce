// API Response helpers
export const handleApiResponse = (response) => {
  if (response.data) {
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message,
      meta: response.data.meta
    }
  }
  return response
}

export const handleApiError = (error) => {
  const errorResponse = {
    success: false,
    message: 'An error occurred',
    errors: {},
    status: error.response?.status || 500
  }

  if (error.response?.data) {
    const data = error.response.data

    errorResponse.message = data.message || errorResponse.message
    errorResponse.errors = data.errors || {}
    errorResponse.error_code = data.error_code

    // Handle validation errors
    if (data.errors && typeof data.errors === 'object') {
      errorResponse.validation_errors = data.errors
    }
  }

  return errorResponse
}

// Token helpers
export const getAuthToken = () => {
  return localStorage.getItem('auth_token')
}

export const setAuthToken = (token) => {
  localStorage.setItem('auth_token', token)
}

export const removeAuthToken = () => {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user')
}

export const isTokenExpired = (token) => {
  if (!token) return true

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp < Date.now() / 1000
  } catch (error) {
    return true
  }
}

// User helpers
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

export const setCurrentUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user))
}

export const isUserAuthenticated = () => {
  const token = getAuthToken()
  const user = getCurrentUser()
  return !!(token && user && !isTokenExpired(token))
}

export const isUserAdmin = () => {
  const user = getCurrentUser()
  return user?.is_admin || false
}

// API URL helpers
export const buildApiUrl = (endpoint, params = {}) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
  let url = `${baseUrl}${endpoint}`

  if (Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams(params)
    url += `?${searchParams.toString()}`
  }

  return url
}

// Pagination helpers
export const buildPaginationParams = (page = 1, limit = 12, filters = {}) => {
  return {
    page,
    limit,
    ...filters
  }
}

export const extractPaginationMeta = (response) => {
  return response.meta || {
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 0,
    from: 0,
    to: 0
  }
}

// Error handling helpers
export const getFirstError = (errors) => {
  if (!errors || typeof errors !== 'object') return null

  const firstKey = Object.keys(errors)[0]
  const firstError = errors[firstKey]

  return Array.isArray(firstError) ? firstError[0] : firstError
}

export const formatValidationErrors = (errors) => {
  const formatted = {}

  if (errors && typeof errors === 'object') {
    Object.keys(errors).forEach(field => {
      const fieldErrors = errors[field]
      formatted[field] = Array.isArray(fieldErrors) ? fieldErrors[0] : fieldErrors
    })
  }

  return formatted
}

// Request helpers
export const createFormData = (data) => {
  const formData = new FormData()

  Object.keys(data).forEach(key => {
    const value = data[key]

    if (value instanceof File) {
      formData.append(key, value)
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item instanceof File) {
          formData.append(`${key}[${index}]`, item)
        } else {
          formData.append(`${key}[]`, item)
        }
      })
    } else if (value !== null && value !== undefined) {
      formData.append(key, value)
    }
  })

  return formData
}

// Cache helpers
export const getCachedData = (key) => {
  try {
    const cached = localStorage.getItem(key)
    return cached ? JSON.parse(cached) : null
  } catch (error) {
    console.error('Error parsing cached data:', error)
    return null
  }
}

export const setCachedData = (key, data, expiryMinutes = 60) => {
  try {
    const expiryTime = Date.now() + (expiryMinutes * 60 * 1000)
    const cacheData = {
      data,
      expiry: expiryTime
    }
    localStorage.setItem(key, JSON.stringify(cacheData))
  } catch (error) {
    console.error('Error caching data:', error)
  }
}

export const isCacheExpired = (key) => {
  const cached = getCachedData(key)
  return !cached || Date.now() > cached.expiry
}

export const clearExpiredCache = () => {
  const keys = Object.keys(localStorage)
  keys.forEach(key => {
    if (key.startsWith('cache_') && isCacheExpired(key)) {
      localStorage.removeItem(key)
    }
  })
}
