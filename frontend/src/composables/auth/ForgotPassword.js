import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useNotifications } from '@/composables/useNotifications'

// Forgot Password Composable
export function useForgotPassword() {
  const router = useRouter()
  const { success, error } = useNotifications()

  // State
  const loading = ref(false)
  const success = ref(false)

  // Form data
  const form = reactive({
    email: ''
  })

  // Handle forgot password
  const handleForgotPassword = async () => {
    if (loading.value) return

    loading.value = true

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: form.email
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset email')
      }

      success.value = true
      success('Password reset email sent successfully!')

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)

    } catch (err) {
      console.error('Forgot password error:', err)
      error(err.message || 'Failed to send reset email')
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    success,
    form,
    handleForgotPassword
  }
}
