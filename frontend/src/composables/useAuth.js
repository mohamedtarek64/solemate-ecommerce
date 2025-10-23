import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export function useAuth() {
  const router = useRouter()
  const authStore = useAuthStore()

  // Create reactive state for auth
  const authState = reactive({
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false
  })

  // Form data
  const loginForm = reactive({
    email: '',
    password: ''
  })

  const registerForm = reactive({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  })

  // Computed properties
  const isAuthenticated = computed(() => {
    return authStore.isAuthenticated || !!localStorage.getItem('auth_token')
  })

  const user = computed(() => {
    return authStore.user || JSON.parse(localStorage.getItem('user_data') || 'null')
  })

  const loading = computed(() => {
    return authState.loading || authStore.loading
  })

  const error = computed(() => {
    return authState.error || authStore.error
  })

  const isAdmin = computed(() => {
    const currentUser = user.value
    return currentUser?.role === 'admin' || currentUser?.is_admin === true
  })

  // Helper functions
  const getToken = () => {
    return localStorage.getItem('auth_token')
  }

  const getApiHeaders = () => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  })

  // JWT Refresh Token functionality
  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refresh_token')
      if (!refreshTokenValue) {
        throw new Error('No refresh token available')
      }

      const response = await fetch('http://127.0.0.1:8000/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          refresh_token: refreshTokenValue
        })
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const data = await response.json()

      if (data.success) {
        // Update tokens
        localStorage.setItem('auth_token', data.access_token)
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token)
        }

        return data.access_token
      } else {
        throw new Error(data.message || 'Token refresh failed')
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      // Clear auth data and redirect to login
      // clearAuthData() // Temporarily disabled to prevent logout issues
      router.push('/login')
      throw error
    }
  }

  // Enhanced API request with automatic token refresh
  const apiRequest = async (url, options = {}) => {
    const makeRequest = async (token) => {
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
    }

    try {
      const token = getToken()
      let response = await makeRequest(token)

      // If token expired, try to refresh
      if (response.status === 401) {
        const newToken = await refreshToken()
        response = await makeRequest(newToken)
      }

      return response
    } catch (error) {
      console.error('API request error:', error)
      throw error
    }
  }

  // Initialize auth state from localStorage
  const initializeAuthState = () => {
    const token = localStorage.getItem('auth_token')
    const userData = localStorage.getItem('user_data') || localStorage.getItem('user')

    if (token && userData) {
      try {
        authState.user = JSON.parse(userData)
        authState.isAuthenticated = true
        authStore.setAuth({
          user: authState.user,
          token: token
        })
        } catch (error) {
        console.error('Error parsing user data:', error)
        // clearAuthData() // Temporarily disabled to prevent logout issues
      }
    } else {
      }
  }

  // Clear auth data
  const clearAuthData = async () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    localStorage.removeItem('user') // For TokenManager compatibility
    localStorage.removeItem('refresh_token')

    // Also use TokenManager methods for consistency
    try {
      const TokenManager = (await import('@/utils/tokenManager')).TokenManager
      TokenManager.clearToken()
      TokenManager.clearUser()
      TokenManager.clearRefreshToken()
    } catch (error) {
      console.warn('TokenManager not available:', error)
    }

    authState.user = null
    authState.isAuthenticated = false
    authStore.logout()
  }

  // Login function
  const login = async (credentials) => {
    authState.loading = true
    authState.error = null

    try {
      // Try Laravel API first, fallback to direct login
      let response
      try {
        response = await fetch('http://127.0.0.1:8000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(credentials)
        })
      } catch (error) {
        console.warn('Laravel API failed, trying direct login:', error)
        // Fallback to direct login
        response = await fetch('http://127.0.0.1:8000/test-login.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(credentials)
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Login API Error:', errorData)
        throw new Error(errorData.message || 'Login failed')
      }

      const data = await response.json()

      if (data.success && data.data) {
        const { user, token, refresh_token } = data.data

        // Store in localStorage
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user_data', JSON.stringify(user))
        localStorage.setItem('user', JSON.stringify(user)) // For TokenManager compatibility
        if (refresh_token) {
          localStorage.setItem('refresh_token', refresh_token)
        }

        console.log('Auth data stored:', {
          'auth_token': !!localStorage.getItem('auth_token'),
          'user_data': !!localStorage.getItem('user_data'),
          'user': !!localStorage.getItem('user'),
          'refresh_token': !!localStorage.getItem('refresh_token'),
          'user_role': user.role
        })

        // Also use TokenManager methods for consistency
        try {
          const TokenManager = (await import('@/utils/tokenManager')).TokenManager
          TokenManager.setToken(token)
          TokenManager.setUser(user)
          if (refresh_token) {
            TokenManager.setRefreshToken(refresh_token)
          }
        } catch (error) {
          console.warn('⚠️ TokenManager update failed:', error)
        }

        // Update reactive state
        authState.user = user
        authState.isAuthenticated = true

        // Update Pinia store
        authStore.setAuth({
          user: user,
          token: token
        })

        return data
      } else {
        throw new Error(data.message || 'Login failed')
      }
    } catch (err) {
      authState.error = err.message
      throw err
    } finally {
      authState.loading = false
    }
  }

  // Register function
  const register = async (userData) => {
    authState.loading = true
    authState.error = null

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Registration failed')
      }

      const data = await response.json()

      if (data.success && data.data) {
        const { user, token } = data.data

        // Store in localStorage
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user_data', JSON.stringify(user))

        // Update reactive state
        authState.user = user
        authState.isAuthenticated = true

        // Update Pinia store
        authStore.setAuth({
          user: user,
          token: token
        })

        return data
      } else {
        throw new Error(data.message || 'Registration failed')
      }
    } catch (err) {
      authState.error = err.message
      throw err
    } finally {
      authState.loading = false
    }
  }

  // Logout function
  const logout = async () => {
    authState.loading = true
    authState.error = null

    try {
      const token = getToken()
      if (token) {
        await fetch('http://127.0.0.1:8000/api/auth/logout', {
          method: 'POST',
          headers: getApiHeaders()
        })
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // Clear data regardless of API call success
      await clearAuthData()
      authState.loading = false

      // Redirect to home
      window.location.href = '/'
    }
  }

  // Check if user is authenticated
  const checkAuth = async () => {
    const token = getToken()
    if (!token) {
      return false
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/profile', {
        headers: getApiHeaders()
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          authState.user = data.data
          authState.isAuthenticated = true
          authStore.setAuth({
            user: data.data,
            token: getToken()
          })
          return true
        }
      }
    } catch (err) {
      console.error('Auth check error:', err)
    }

    // If check fails, clear auth data
    // clearAuthData() // Temporarily disabled to prevent logout issues
    return false
  }

  // Handle login with form data and role-based redirection
  const handleLogin = async () => {
    try {
      const result = await login(loginForm)

      if (result.success) {
        // Role-based redirection
        const userRole = result.data.user.role
        console.log('Login successful, redirecting user with role:', userRole)

        switch (userRole) {
          case 'admin':
            window.location.href = '/admin/dashboard'
            break
          case 'vendor':
            window.location.href = '/vendor/dashboard'
            break
          case 'customer':
          default:
            window.location.href = '/'
            break
        }

        return result
      } else {
        return result
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: error.message }
    }
  }

  // Handle register with form data
  const handleRegister = async () => {
    try {
      const result = await register(registerForm)

      if (result.success) {
        // Redirect to profile after successful registration
        router.push('/profile')
        return result
      } else {
        return result
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, message: error.message }
    }
  }

  // Clear error and loading messages
  const clearMessages = () => {
    authState.error = null
    authState.loading = false
    authStore.clearError()
  }

  // Initialize auth on composable creation
  // initializeAuthState() // Temporarily disabled to prevent logout issues

  return {
    // State
    authState,
    loginForm,
    registerForm,

    // Computed
    isAuthenticated,
    user,
    isAdmin,
    loading,
    error,

    // Methods
    login,
    register,
    logout,
    checkAuth,
    clearAuthData,
    getToken,
    getApiHeaders,
    initializeAuthState,
    refreshToken,
    apiRequest,
    handleLogin,
    handleRegister,
    clearMessages
  }
}
