import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useNotifications } from '@/composables/useNotifications'

// Form data
export const useLoginForm = () => {
  const email = ref('')
  const password = ref('')
  const rememberMe = ref(false)
  const isLoading = ref(false)
  const errors = ref({})

  return {
    email,
    password,
    rememberMe,
    isLoading,
    errors
  }
}

// Handle form submission
export const handleLoginSubmit = async (
  email,
  password,
  rememberMe,
  isLoading,
  errors,
  login,
  success,
  error,
  router
) => {
  if (isLoading.value) return

  // Clear previous errors
  errors.value = {}

  // Basic validation
  if (!email.value) {
    errors.value.email = 'Email is required'
  } else if (!/\S+@\S+\.\S+/.test(email.value)) {
    errors.value.email = 'Email is invalid'
  }

  if (!password.value) {
    errors.value.password = 'Password is required'
  } else if (password.value.length < 6) {
    errors.value.password = 'Password must be at least 6 characters'
  }

  // If there are validation errors, don't submit
  if (Object.keys(errors.value).length > 0) {
    return
  }

  isLoading.value = true

  try {
    const result = await login({
      email: email.value,
      password: password.value,
      remember: rememberMe.value
    })

    if (result.success) {
      success('Login successful! Welcome back!')

      // Redirect based on user role
      if (result.user?.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/')
      }
    } else {
      error(result.message || 'Login failed. Please try again.')
    }
  } catch (err) {
    console.error('Login error:', err)
    error('An unexpected error occurred. Please try again.')
  } finally {
    isLoading.value = false
  }
}

// Clear form messages
export const clearMessages = (errors) => {
  errors.value = {}
}

// Initialize component
export const initializeLogin = (clearMessages, errors) => {
  onMounted(() => {
    clearMessages(errors)
  })
}
