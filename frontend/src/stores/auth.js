import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(localStorage.getItem('auth_token'))
  const refreshToken = ref(localStorage.getItem('refresh_token'))
  const loading = ref(false)
  const error = ref(null)
  const cache = new Map()
  const lastAuthCheck = ref(0)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isVendor = computed(() => user.value?.role === 'vendor')
  const isCustomer = computed(() => user.value?.role === 'customer')

  // Optimized authentication check with caching
  const checkAuthStatus = () => {
    const cacheKey = 'auth_status'
    const cacheTimeout = 60000 // 1 minute

    // Check cache first
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey)
      if (Date.now() - cached.timestamp < cacheTimeout) {
        return cached.value
      }
    }

    const authStatus = {
      isAuthenticated: !!token.value && !!user.value,
      isAdmin: user.value?.role === 'admin',
      isVendor: user.value?.role === 'vendor',
      isCustomer: user.value?.role === 'customer'
    }

    // Cache the result
    cache.set(cacheKey, {
      value: authStatus,
      timestamp: Date.now()
    })

    lastAuthCheck.value = Date.now()
    return authStatus
  }

  // Clear auth cache
  const clearAuthCache = () => {
    cache.clear()
    lastAuthCheck.value = 0
  }

  // Actions
  const login = async (credentials) => {
    try {
      loading.value = true
      error.value = null

      const response = await authService.login(credentials)

      if (response.success) {
        user.value = response.data.user
        token.value = response.data.token
        refreshToken.value = response.data.refresh_token
        localStorage.setItem('auth_token', response.data.token)
        localStorage.setItem('refresh_token', response.data.refresh_token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        localStorage.setItem('user_id', response.data.user.id) // Add user_id for easy access
        return response
      } else {
        error.value = response.message
        return response
      }
    } catch (err) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  const register = async (userData) => {
    try {
      loading.value = true
      error.value = null

      const response = await authService.register(userData)
      if (response.success) {
        user.value = response.data.user
        token.value = response.data.token
        refreshToken.value = response.data.refresh_token
        localStorage.setItem('auth_token', response.data.token)
        localStorage.setItem('refresh_token', response.data.refresh_token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        return response
      } else {
        error.value = response.message
        return response
      }
    } catch (err) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      loading.value = true
      await authService.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      user.value = null
      token.value = null
      refreshToken.value = null
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      loading.value = false
    }
  }

  const getCurrentUser = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await authService.getCurrentUser()

      if (response.success) {
        user.value = response.data
        return response
      } else {
        // If user account is deleted, clear auth data
        if (response.message?.includes('deleted')) {
          await logout()
        }
        error.value = response.message
        return response
      }
    } catch (err) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  const refreshTokenFunction = async () => {
    try {
      const response = await authService.refreshToken()

      if (response.success) {
        token.value = response.data.token
        refreshToken.value = response.data.refresh_token
        localStorage.setItem('auth_token', response.data.token)
        localStorage.setItem('refresh_token', response.data.refresh_token)
        return response
      } else {
        // Token refresh failed, logout user
        await logout()
        return response
      }
    } catch (err) {
      // Token refresh failed, logout user
      await logout()
      return { success: false, message: err.message }
    }
  }

  const initializeAuth = async () => {
    const storedUser = authService.getStoredUser()
    const storedToken = localStorage.getItem('auth_token')

    if (storedUser && storedToken) {
      user.value = storedUser
      token.value = storedToken
      refreshToken.value = localStorage.getItem('refresh_token')

      // Verify token is still valid
      try {
        await getCurrentUser()
      } catch (err) {
        // Token is invalid, clear auth data
        await logout()
      }
    }
  }

  const setAuth = (authData) => {
    user.value = authData.user
    token.value = authData.token
    localStorage.setItem('auth_token', authData.token)
    localStorage.setItem('user_data', JSON.stringify(authData.user))
  }

  const setUser = (userData) => {
    user.value = userData
    localStorage.setItem('user_data', JSON.stringify(userData))
  }

  const setToken = (tokenValue) => {
    token.value = tokenValue
    localStorage.setItem('auth_token', tokenValue)
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    user.value = null
    token.value = null
    refreshToken.value = null
    loading.value = false
    error.value = null
    clearAuthCache()
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    localStorage.removeItem('user_data')
  }

  return {
    // State
    user,
    token,
    refreshToken,
    loading,
    error,
    lastAuthCheck,

    // Getters
    isAuthenticated,
    isAdmin,
    isVendor,
    isCustomer,

    // Actions
    login,
    register,
    logout,
    getCurrentUser,
    refreshToken: refreshTokenFunction,
    initializeAuth,
    setAuth,
    setUser,
    setToken,
    clearError,
    reset,
    checkAuthStatus,
    clearAuthCache
  }
})
