import { ref } from 'vue'

// Social Login Buttons Composable
export function useSocialLoginButtons() {
  const loading = ref(false)

  const handleSocialLogin = async (provider) => {
    if (loading.value) return

    loading.value = true

    try {
      // Redirect to OAuth provider
      const response = await fetch(`/api/auth/${provider}/redirect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to initiate ${provider} login`)
      }

      const data = await response.json()

      if (data.redirect_url) {
        window.location.href = data.redirect_url
      } else {
        throw new Error('No redirect URL received')
      }

    } catch (error) {
      console.error(`${provider} login error:`, error)
      // Handle error (show notification, etc.)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    handleSocialLogin
  }
}
