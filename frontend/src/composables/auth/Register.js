import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useNotifications } from '@/composables/useNotifications'

// Form data
export const useRegisterForm = () => {
  const fullName = ref('')
  const email = ref('')
  const password = ref('')
  const confirmPassword = ref('')
  const agreeToTerms = ref(false)
  const isLoading = ref(false)
  const errors = ref({})

  return {
    fullName,
    email,
    password,
    confirmPassword,
    agreeToTerms,
    isLoading,
    errors
  }
}

// Handle form submission
export const handleRegisterSubmit = async (
  fullName,
  email,
  password,
  confirmPassword,
  agreeToTerms,
  isLoading,
  errors,
  register,
  success,
  error,
  router
) => {
  if (isLoading.value) return

  // Clear previous errors
  errors.value = {}

  // Basic validation
  if (!fullName.value) {
    errors.value.fullName = 'Full name is required'
  }

  if (!email.value) {
    errors.value.email = 'Email is required'
  } else if (!/\S+@\S+\.\S+/.test(email.value)) {
    errors.value.email = 'Email is invalid'
  }

  if (!password.value) {
    errors.value.password = 'Password is required'
  } else if (password.value.length < 8) {
    errors.value.password = 'Password must be at least 8 characters'
  }

  if (!confirmPassword.value) {
    errors.value.confirmPassword = 'Please confirm your password'
  } else if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = 'Passwords do not match'
  }

  if (!agreeToTerms.value) {
    errors.value.agreeToTerms = 'You must agree to the terms and conditions'
  }

  // If there are validation errors, don't submit
  if (Object.keys(errors.value).length > 0) {
    return
  }

  isLoading.value = true

  try {
    const result = await register({
      name: fullName.value,
      email: email.value,
      password: password.value,
      password_confirmation: confirmPassword.value
    })

    if (result.success) {
      success('Registration successful! Welcome to SoleMate!')
      router.push('/login')
    } else {
      error(result.message || 'Registration failed. Please try again.')
    }
  } catch (err) {
    console.error('Registration error:', err)
    error('An unexpected error occurred. Please try again.')
  } finally {
    isLoading.value = false
  }
}

// Handle social login
export const handleSocialLogin = async (provider, showError) => {
  try {
    // Redirect to social login endpoint
    window.location.href = `http://127.0.0.1:8000/api/auth/social/${provider}`
  } catch (error) {
    console.error('Social login error:', error)
    showError('Social login failed. Please try again.')
  }
}

// Clear form messages
export const clearMessages = (errors) => {
  errors.value = {}
}

// Initialize component
export const initializeRegister = (clearMessages, errors) => {
  onMounted(() => {
    clearMessages(errors)
  })
}
