import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useNotifications } from '@/composables/useNotifications'

// ResetPassword Composable
export function useResetPassword() {
  const router = useRouter()
  const route = useRoute()
  const { success, error } = useNotifications()

  // State
  const loading = ref(false)

  // Form data
  const form = reactive({
    password: '',
    password_confirmation: '',
    token: '',
    email: ''
  })

  // Get token and email from URL
  const getTokenFromUrl = () => {
    const { token, email } = route.query
    if (!token || !email) {
      error('Invalid reset link')
      router.push('/forgot-password')
      return false
    }
    form.token = token
    form.email = email
    return true
  }

  // Handle reset password
  const handleResetPassword = async () => {
    if (loading.value) return

    // Validate passwords
    if (form.password !== form.password_confirmation) {
      error('Passwords do not match')
      return
    }

    if (form.password.length < 8) {
      error('Password must be at least 8 characters long')
      return
    }

    loading.value = true

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          token: form.token,
          email: form.email,
          password: form.password,
          password_confirmation: form.password_confirmation
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password')
      }

      success('Password reset successfully! You can now log in with your new password.')

      // Redirect to login
      setTimeout(() => {
        router.push('/login')
      }, 2000)

    } catch (err) {
      console.error('Reset password error:', err)
      error(err.message || 'Failed to reset password')
    } finally {
      loading.value = false
    }
  }

  // Initialize
  onMounted(() => {
    getTokenFromUrl()
  })

  return {
    loading,
    form,
    handleResetPassword
  }
}
