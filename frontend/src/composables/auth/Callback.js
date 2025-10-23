import { ref } from 'vue'

// Callback Composable
export function useCallback(router, route, authStore, notifications) {
  const { success, error } = notifications

  // State
  const isLoading = ref(true)
  const isSuccess = ref(false)
  const isError = ref(false)
  const errorMessage = ref('')

  // Handle OAuth callback
  const handleCallback = async () => {
    try {
      const { token, user } = route.query

      if (!token) {
        throw new Error('No authentication token received')
      }

      // Parse user data
      const userData = user ? JSON.parse(decodeURIComponent(user)) : null

      if (!userData) {
        throw new Error('No user data received')
      }

      // Store auth data
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user_data', JSON.stringify(userData))

      // Update auth store
      authStore.setAuth({
        token,
        user: userData,
        isAuthenticated: true
      })

      // Show success message
      const displayName = userData.name || userData.email?.split('@')[0] || 'User'
      success(`Welcome back, ${displayName}!`)

      // Update state
      isLoading.value = false
      isSuccess.value = true

      // Auto redirect after 3 seconds
      setTimeout(() => {
        redirectToDashboard()
      }, 3000)

    } catch (err) {
      console.error('OAuth callback error:', err)
      errorMessage.value = err.message || 'An unexpected error occurred during authentication'
      isLoading.value = false
      isError.value = true
      error(errorMessage.value)
    }
  }

  // Redirect functions
  const redirectToDashboard = () => {
    const user = authStore.user
    if (user?.role === 'admin') {
      router.push('/admin/dashboard')
    } else {
      router.push('/profile')
    }
  }

  const redirectToHome = () => {
    router.push('/')
  }

  const redirectToLogin = () => {
    router.push('/login')
  }

  const retryLogin = () => {
    // Clear any stored auth data
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    authStore.logout()

    // Redirect to login
    router.push('/login')
  }

  // Check for error in URL params
  const checkForErrors = () => {
    const { error: urlError } = route.query

    if (urlError) {
      switch (urlError) {
        case 'oauth_failed':
          errorMessage.value = 'OAuth authentication failed. Please try again.'
          break
        case 'invalid_provider':
          errorMessage.value = 'Invalid authentication provider.'
          break
        case 'access_denied':
          errorMessage.value = 'Authentication was cancelled. Please try again.'
          break
        default:
          errorMessage.value = 'Authentication failed. Please try again.'
      }

      isLoading.value = false
      isError.value = true
      error(errorMessage.value)
      return true
    }

    return false
  }

  return {
    isLoading,
    isSuccess,
    isError,
    errorMessage,
    handleCallback,
    redirectToDashboard,
    redirectToHome,
    redirectToLogin,
    retryLogin,
    checkForErrors
  }
}
