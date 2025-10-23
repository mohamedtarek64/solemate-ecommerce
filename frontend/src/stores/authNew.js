import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '@/services/authServiceNew'
import TokenHelper from '@/utils/tokenHelper'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(TokenHelper.getUser())
  const token = ref(TokenHelper.getToken())
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => TokenHelper.isAuthenticated())
  const isAdmin = computed(() => TokenHelper.isAdmin())
  const currentUser = computed(() => user.value)

  // Actions
  const login = async (credentials) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await authService.login(credentials)
      
      if (response.success) {
        user.value = response.user
        token.value = response.token
        return response
      } else {
        error.value = response.error
        return response
      }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
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
        user.value = response.user
        token.value = response.token
        return response
      } else {
        error.value = response.error
        return response
      }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
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
      loading.value = false
    }
  }

  const getProfile = async () => {
    try {
      loading.value = true
      error.value = null
      
      const response = await authService.getProfile()
      
      if (response.success) {
        user.value = response.user
        return response
      } else {
        error.value = response.error
        return response
      }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (data) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await authService.updateProfile(data)
      
      if (response.success) {
        user.value = response.user
        return response
      } else {
        error.value = response.error
        return response
      }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const changePassword = async (data) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await authService.changePassword(data)
      
      if (!response.success) {
        error.value = response.error
      }
      
      return response
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const refreshToken = async () => {
    try {
      const response = await authService.refreshToken()
      
      if (response.success) {
        token.value = response.token
        return response
      } else {
        // Token refresh failed, logout user
        await logout()
        return response
      }
    } catch (err) {
      // Token refresh failed, logout user
      await logout()
      return { success: false, error: err.message }
    }
  }

  const socialLogin = async (provider, accessToken) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await authService.socialLogin(provider, accessToken)
      
      if (response.success) {
        user.value = response.user
        token.value = response.token
        return response
      } else {
        error.value = response.error
        return response
      }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const forgotPassword = async (email) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await authService.forgotPassword(email)
      
      if (!response.success) {
        error.value = response.error
      }
      
      return response
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const resetPassword = async (data) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await authService.resetPassword(data)
      
      if (!response.success) {
        error.value = response.error
      }
      
      return response
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const initializeAuth = async () => {
    if (TokenHelper.hasToken() && !TokenHelper.isTokenExpired()) {
      user.value = TokenHelper.getUser()
      token.value = TokenHelper.getToken()
      
      // Verify token is still valid by getting user profile
      try {
        await getProfile()
      } catch (err) {
        // Token is invalid, clear auth data
        await logout()
      }
    } else {
      // Token is expired or doesn't exist
      await logout()
    }
  }

  const checkTokenExpiration = () => {
    if (TokenHelper.willExpireSoon()) {
      // Try to refresh token
      refreshToken()
    }
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    user.value = null
    token.value = null
    loading.value = false
    error.value = null
    TokenHelper.clearAuthData()
  }

  return {
    // State
    user,
    token,
    loading,
    error,
    
    // Getters
    isAuthenticated,
    isAdmin,
    currentUser,
    
    // Actions
    login,
    register,
    logout,
    getProfile,
    updateProfile,
    changePassword,
    refreshToken,
    socialLogin,
    forgotPassword,
    resetPassword,
    initializeAuth,
    checkTokenExpiration,
    clearError,
    reset
  }
})
