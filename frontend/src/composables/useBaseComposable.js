/**
 * Base Composable
 *
 * Provides common functionality for all composables
 */
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'

export function useBaseComposable() {
  // Common reactive state
  const loading = ref(false)
  const error = ref(null)

  // Toast instance
  const toast = useToast()

  // Common computed properties
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => !!error.value)

  // Common methods
  const setLoading = (value) => {
    loading.value = value
  }

  const setError = (message, details = null) => {
    error.value = { message, details }
    console.error('Composable Error:', message, details)
  }

  const clearError = () => {
    error.value = null
  }

  const showSuccess = (message) => {
    toast.success(message)
  }

  const showError = (message) => {
    toast.error(message)
  }

  const showWarning = (message) => {
    toast.warning(message)
  }

  const showInfo = (message) => {
    toast.info(message)
  }

  // Execute async operation with loading and error handling
  const executeAsync = async (operation, options = {}) => {
    const {
      showLoading = true,
      clearErrorOnStart = true,
      showSuccessMessage = null,
      showErrorMessage = null
    } = options

    try {
      if (showLoading) setLoading(true)
      if (clearErrorOnStart) clearError()

      const result = await operation()

      if (showSuccessMessage) {
        showSuccess(showSuccessMessage)
      }

      return result
    } catch (err) {
      const errorMessage = showErrorMessage || err.message || 'An error occurred'
      setError(errorMessage, err)
      showError(errorMessage)
      throw err
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  // Retry mechanism
  const retry = async (operation, maxRetries = 3, delay = 1000) => {
    let lastError

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation()
      } catch (err) {
        lastError = err
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
        }
      }
    }

    throw lastError
  }

  return {
    // State
    loading,
    error,

    // Computed
    isLoading,
    hasError,

    // Methods
    setLoading,
    setError,
    clearError,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    executeAsync,
    retry
  }
}
