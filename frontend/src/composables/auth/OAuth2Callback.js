import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotifications } from '@/composables/useNotifications'

// OAuth2Callback Composable
export function useOAuth2Callback() {
  const router = useRouter()
  const route = useRoute()
  const authStore = useAuthStore()
  const { success, error } = useNotifications()

  // State
  const loading = ref(true)
  const error = ref(null)

  // Handle OAuth2 callback
  const handleCallback = async () => {
    try {
      const { code, state, error: urlError } = route.query

      if (urlError) {
        throw new Error(`OAuth error: ${urlError}`)
      }

      if (!code) {
        throw new Error('No authorization code received')
      }

      // Exchange code for token
      const response = await fetch('/api/auth/oauth2/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          code,
          state
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to complete OAuth authentication')
      }

      // Store auth data
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('user_data', JSON.stringify(data.user))

      // Update auth store
      authStore.setAuth({
        token: data.token,
        user: data.user,
        isAuthenticated: true
      })

      // Show success message
      const displayName = data.user.name || data.user.email?.split('@')[0] || 'User'
      success(`Welcome back, ${displayName}!`)

      // Redirect to dashboard
      setTimeout(() => {
        if (data.user.role === 'admin') {
          router.push('/admin/dashboard')
        } else {
          router.push('/profile')
        }
      }, 2000)

    } catch (err) {
      console.error('OAuth2 callback error:', err)
      error.value = err.message || 'Authentication failed'
      error(error.value)
    } finally {
      loading.value = false
    }
  }

  // Retry authentication
  const retryAuth = () => {
    error.value = null
    loading.value = true
    handleCallback()
  }

  // Initialize
  onMounted(() => {
    handleCallback()
  })

  return {
    loading,
    error,
    retryAuth
  }
}
