import { ref, reactive } from 'vue'

// LoginNew Composable
export function useLoginNew(router, login, toast) {
  // Form data
  const form = reactive({
    email: '',
    password: '',
    remember: false
  })

  // Loading state
  const loading = ref(false)

  // Handle login
  const handleLogin = async () => {
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields')
      return
    }

    loading.value = true

    try {
      const result = await login({
        email: form.email,
        password: form.password,
        remember: form.remember
      })

      if (result.success) {
        toast.success('Welcome back! You have been logged in successfully.')
        router.push('/')
      } else {
        toast.error(result.message || 'Login failed. Please try again.')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      loading.value = false
    }
  }

  // Handle social login
  const handleSocialLogin = async (provider) => {
    try {
      // Redirect to social login endpoint
      window.location.href = `/api/auth/social/${provider}`
    } catch (error) {
      console.error('Social login error:', error)
      toast.error('Social login failed. Please try again.')
    }
  }

  return {
    form,
    loading,
    handleLogin,
    handleSocialLogin
  }
}
