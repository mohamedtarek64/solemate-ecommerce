import api from '@/services/api'
import TokenHelper from '@/utils/tokenHelper'
import router from '@/router'

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token to headers
    const token = TokenHelper.getToken()
    if (token) {
      config.headers.Authorization = TokenHelper.formatAuthHeader(token)
    }

    // Add CSRF token if available
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
    if (csrfToken) {
      config.headers['X-CSRF-TOKEN'] = csrfToken
    }

    // Log request in debug mode
    if (import.meta.env.VITE_DEBUG_MODE === 'true') {
      console.log('API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        params: config.params
      })
    }

    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response in debug mode
    if (import.meta.env.VITE_DEBUG_MODE === 'true') {
      console.log('API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      })
    }

    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Log error in debug mode
    if (import.meta.env.VITE_DEBUG_MODE === 'true') {
      console.error('API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.response?.data?.message || error.message
      })
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh token
        const authStore = await import('@/stores/authNew').then(m => m.useAuthStore())
        const refreshResponse = await authStore().refreshToken()

        if (refreshResponse.success) {
          // Retry original request with new token
          const newToken = TokenHelper.getToken()
          originalRequest.headers.Authorization = TokenHelper.formatAuthHeader(newToken)
          return api(originalRequest)
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
      }

      // Refresh failed, redirect to login
      TokenHelper.clearAuthData()
      
      // Only redirect if not already on login page
      if (router.currentRoute.value.name !== 'login') {
        router.push({ 
          name: 'login', 
          query: { redirect: router.currentRoute.value.fullPath } 
        })
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      // Redirect to unauthorized page or show message
      router.push({ name: 'unauthorized' })
    }

    // Handle 422 Validation Errors
    if (error.response?.status === 422) {
      const validationErrors = error.response.data?.errors || {}
      error.validationErrors = validationErrors
    }

    // Handle 500 Server Errors
    if (error.response?.status >= 500) {
      // Show global error message
      console.error('Server error:', error.response.data?.message || 'Internal server error')
    }

    return Promise.reject(error)
  }
)

export default api
