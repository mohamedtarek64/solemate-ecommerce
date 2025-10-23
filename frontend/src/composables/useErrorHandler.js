import { ref, reactive } from 'vue'
import { useToast } from 'vue-toastification'

export function useErrorHandler() {
  const toast = useToast()
  
  const errorState = reactive({
    errors: {},
    globalError: null,
    isLoading: false
  })

  /**
   * Handle API errors
   */
  const handleApiError = (error, context = '') => {
    console.error(`API Error ${context}:`, error)
    
    let errorMessage = 'An unexpected error occurred'
    let errorDetails = null
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          errorMessage = 'Bad request. Please check your input.'
          errorDetails = data.errors || data.message
          break
        case 401:
          errorMessage = 'Authentication required. Please log in.'
          // Redirect to login
          window.location.href = '/login'
          break
        case 403:
          errorMessage = 'Access denied. You do not have permission.'
          break
        case 404:
          errorMessage = 'Resource not found.'
          break
        case 422:
          errorMessage = 'Validation failed. Please check your input.'
          errorDetails = data.errors || data.message
          break
        case 429:
          errorMessage = 'Too many requests. Please try again later.'
          break
        case 500:
          errorMessage = 'Server error. Please try again later.'
          break
        case 503:
          errorMessage = 'Service unavailable. Please try again later.'
          break
        default:
          errorMessage = data.message || `Server error (${status})`
      }
    } else if (error.request) {
      // Network error
      errorMessage = 'Network error. Please check your connection.'
    } else {
      // Other error
      errorMessage = error.message || 'An unexpected error occurred'
    }
    
    // Show error toast
    toast.error(errorMessage, {
      timeout: 5000,
      position: 'top-right'
    })
    
    // Set global error
    errorState.globalError = {
      message: errorMessage,
      details: errorDetails,
      timestamp: new Date().toISOString(),
      context: context
    }
    
    return {
      message: errorMessage,
      details: errorDetails,
      status: error.response?.status
    }
  }

  /**
   * Handle validation errors
   */
  const handleValidationErrors = (errors) => {
    errorState.errors = errors
    
    // Show first validation error
    const firstError = Object.values(errors)[0]
    if (firstError && firstError.length > 0) {
      toast.error(firstError[0], {
        timeout: 4000,
        position: 'top-right'
      })
    }
    
    return errors
  }

  /**
   * Handle form submission errors
   */
  const handleFormError = (error, formName = '') => {
    const context = formName ? ` (${formName})` : ''
    return handleApiError(error, `Form submission${context}`)
  }

  /**
   * Handle network errors
   */
  const handleNetworkError = (error) => {
    const errorMessage = 'Network error. Please check your internet connection.'
    
    toast.error(errorMessage, {
      timeout: 6000,
      position: 'top-right'
    })
    
    errorState.globalError = {
      message: errorMessage,
      details: 'Please check your internet connection and try again.',
      timestamp: new Date().toISOString(),
      context: 'network'
    }
    
    return {
      message: errorMessage,
      type: 'network'
    }
  }

  /**
   * Handle authentication errors
   */
  const handleAuthError = (error) => {
    const errorMessage = 'Authentication failed. Please log in again.'
    
    toast.error(errorMessage, {
      timeout: 4000,
      position: 'top-right'
    })
    
    // Clear auth data
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_data')
    
    // Redirect to login
    setTimeout(() => {
      window.location.href = '/login'
    }, 2000)
    
    return {
      message: errorMessage,
      type: 'auth',
      redirect: true
    }
  }

  /**
   * Handle rate limit errors
   */
  const handleRateLimitError = (error) => {
    const retryAfter = error.response?.headers?.['retry-after'] || 60
    const errorMessage = `Too many requests. Please wait ${retryAfter} seconds before trying again.`
    
    toast.error(errorMessage, {
      timeout: 8000,
      position: 'top-right'
    })
    
    return {
      message: errorMessage,
      retryAfter: parseInt(retryAfter),
      type: 'rate_limit'
    }
  }

  /**
   * Clear all errors
   */
  const clearErrors = () => {
    errorState.errors = {}
    errorState.globalError = null
  }

  /**
   * Clear specific field error
   */
  const clearFieldError = (field) => {
    if (errorState.errors[field]) {
      delete errorState.errors[field]
    }
  }

  /**
   * Set loading state
   */
  const setLoading = (loading) => {
    errorState.isLoading = loading
  }

  /**
   * Show success message
   */
  const showSuccess = (message, options = {}) => {
    toast.success(message, {
      timeout: 3000,
      position: 'top-right',
      ...options
    })
  }

  /**
   * Show info message
   */
  const showInfo = (message, options = {}) => {
    toast.info(message, {
      timeout: 4000,
      position: 'top-right',
      ...options
    })
  }

  /**
   * Show warning message
   */
  const showWarning = (message, options = {}) => {
    toast.warning(message, {
      timeout: 4000,
      position: 'top-right',
      ...options
    })
  }

  /**
   * Generic error handler
   */
  const handleError = (error, context = '') => {
    if (error.response?.status === 401) {
      return handleAuthError(error)
    } else if (error.response?.status === 429) {
      return handleRateLimitError(error)
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      return handleNetworkError(error)
    } else {
      return handleApiError(error, context)
    }
  }

  return {
    // State
    errorState,
    
    // Methods
    handleError,
    handleApiError,
    handleValidationErrors,
    handleFormError,
    handleNetworkError,
    handleAuthError,
    handleRateLimitError,
    clearErrors,
    clearFieldError,
    setLoading,
    showSuccess,
    showInfo,
    showWarning
  }
}
import { useToast } from 'vue-toastification'

export function useErrorHandler() {
  const toast = useToast()
  
  const errorState = reactive({
    errors: {},
    globalError: null,
    isLoading: false
  })

  /**
   * Handle API errors
   */
  const handleApiError = (error, context = '') => {
    console.error(`API Error ${context}:`, error)
    
    let errorMessage = 'An unexpected error occurred'
    let errorDetails = null
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          errorMessage = 'Bad request. Please check your input.'
          errorDetails = data.errors || data.message
          break
        case 401:
          errorMessage = 'Authentication required. Please log in.'
          // Redirect to login
          window.location.href = '/login'
          break
        case 403:
          errorMessage = 'Access denied. You do not have permission.'
          break
        case 404:
          errorMessage = 'Resource not found.'
          break
        case 422:
          errorMessage = 'Validation failed. Please check your input.'
          errorDetails = data.errors || data.message
          break
        case 429:
          errorMessage = 'Too many requests. Please try again later.'
          break
        case 500:
          errorMessage = 'Server error. Please try again later.'
          break
        case 503:
          errorMessage = 'Service unavailable. Please try again later.'
          break
        default:
          errorMessage = data.message || `Server error (${status})`
      }
    } else if (error.request) {
      // Network error
      errorMessage = 'Network error. Please check your connection.'
    } else {
      // Other error
      errorMessage = error.message || 'An unexpected error occurred'
    }
    
    // Show error toast
    toast.error(errorMessage, {
      timeout: 5000,
      position: 'top-right'
    })
    
    // Set global error
    errorState.globalError = {
      message: errorMessage,
      details: errorDetails,
      timestamp: new Date().toISOString(),
      context: context
    }
    
    return {
      message: errorMessage,
      details: errorDetails,
      status: error.response?.status
    }
  }

  /**
   * Handle validation errors
   */
  const handleValidationErrors = (errors) => {
    errorState.errors = errors
    
    // Show first validation error
    const firstError = Object.values(errors)[0]
    if (firstError && firstError.length > 0) {
      toast.error(firstError[0], {
        timeout: 4000,
        position: 'top-right'
      })
    }
    
    return errors
  }

  /**
   * Handle form submission errors
   */
  const handleFormError = (error, formName = '') => {
    const context = formName ? ` (${formName})` : ''
    return handleApiError(error, `Form submission${context}`)
  }

  /**
   * Handle network errors
   */
  const handleNetworkError = (error) => {
    const errorMessage = 'Network error. Please check your internet connection.'
    
    toast.error(errorMessage, {
      timeout: 6000,
      position: 'top-right'
    })
    
    errorState.globalError = {
      message: errorMessage,
      details: 'Please check your internet connection and try again.',
      timestamp: new Date().toISOString(),
      context: 'network'
    }
    
    return {
      message: errorMessage,
      type: 'network'
    }
  }

  /**
   * Handle authentication errors
   */
  const handleAuthError = (error) => {
    const errorMessage = 'Authentication failed. Please log in again.'
    
    toast.error(errorMessage, {
      timeout: 4000,
      position: 'top-right'
    })
    
    // Clear auth data
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_data')
    
    // Redirect to login
    setTimeout(() => {
      window.location.href = '/login'
    }, 2000)
    
    return {
      message: errorMessage,
      type: 'auth',
      redirect: true
    }
  }

  /**
   * Handle rate limit errors
   */
  const handleRateLimitError = (error) => {
    const retryAfter = error.response?.headers?.['retry-after'] || 60
    const errorMessage = `Too many requests. Please wait ${retryAfter} seconds before trying again.`
    
    toast.error(errorMessage, {
      timeout: 8000,
      position: 'top-right'
    })
    
    return {
      message: errorMessage,
      retryAfter: parseInt(retryAfter),
      type: 'rate_limit'
    }
  }

  /**
   * Clear all errors
   */
  const clearErrors = () => {
    errorState.errors = {}
    errorState.globalError = null
  }

  /**
   * Clear specific field error
   */
  const clearFieldError = (field) => {
    if (errorState.errors[field]) {
      delete errorState.errors[field]
    }
  }

  /**
   * Set loading state
   */
  const setLoading = (loading) => {
    errorState.isLoading = loading
  }

  /**
   * Show success message
   */
  const showSuccess = (message, options = {}) => {
    toast.success(message, {
      timeout: 3000,
      position: 'top-right',
      ...options
    })
  }

  /**
   * Show info message
   */
  const showInfo = (message, options = {}) => {
    toast.info(message, {
      timeout: 4000,
      position: 'top-right',
      ...options
    })
  }

  /**
   * Show warning message
   */
  const showWarning = (message, options = {}) => {
    toast.warning(message, {
      timeout: 4000,
      position: 'top-right',
      ...options
    })
  }

  /**
   * Generic error handler
   */
  const handleError = (error, context = '') => {
    if (error.response?.status === 401) {
      return handleAuthError(error)
    } else if (error.response?.status === 429) {
      return handleRateLimitError(error)
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      return handleNetworkError(error)
    } else {
      return handleApiError(error, context)
    }
  }

  return {
    // State
    errorState,
    
    // Methods
    handleError,
    handleApiError,
    handleValidationErrors,
    handleFormError,
    handleNetworkError,
    handleAuthError,
    handleRateLimitError,
    clearErrors,
    clearFieldError,
    setLoading,
    showSuccess,
    showInfo,
    showWarning
  }
}
import { useToast } from 'vue-toastification'

export function useErrorHandler() {
  const toast = useToast()
  
  const errorState = reactive({
    errors: {},
    globalError: null,
    isLoading: false
  })

  /**
   * Handle API errors
   */
  const handleApiError = (error, context = '') => {
    console.error(`API Error ${context}:`, error)
    
    let errorMessage = 'An unexpected error occurred'
    let errorDetails = null
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          errorMessage = 'Bad request. Please check your input.'
          errorDetails = data.errors || data.message
          break
        case 401:
          errorMessage = 'Authentication required. Please log in.'
          // Redirect to login
          window.location.href = '/login'
          break
        case 403:
          errorMessage = 'Access denied. You do not have permission.'
          break
        case 404:
          errorMessage = 'Resource not found.'
          break
        case 422:
          errorMessage = 'Validation failed. Please check your input.'
          errorDetails = data.errors || data.message
          break
        case 429:
          errorMessage = 'Too many requests. Please try again later.'
          break
        case 500:
          errorMessage = 'Server error. Please try again later.'
          break
        case 503:
          errorMessage = 'Service unavailable. Please try again later.'
          break
        default:
          errorMessage = data.message || `Server error (${status})`
      }
    } else if (error.request) {
      // Network error
      errorMessage = 'Network error. Please check your connection.'
    } else {
      // Other error
      errorMessage = error.message || 'An unexpected error occurred'
    }
    
    // Show error toast
    toast.error(errorMessage, {
      timeout: 5000,
      position: 'top-right'
    })
    
    // Set global error
    errorState.globalError = {
      message: errorMessage,
      details: errorDetails,
      timestamp: new Date().toISOString(),
      context: context
    }
    
    return {
      message: errorMessage,
      details: errorDetails,
      status: error.response?.status
    }
  }

  /**
   * Handle validation errors
   */
  const handleValidationErrors = (errors) => {
    errorState.errors = errors
    
    // Show first validation error
    const firstError = Object.values(errors)[0]
    if (firstError && firstError.length > 0) {
      toast.error(firstError[0], {
        timeout: 4000,
        position: 'top-right'
      })
    }
    
    return errors
  }

  /**
   * Handle form submission errors
   */
  const handleFormError = (error, formName = '') => {
    const context = formName ? ` (${formName})` : ''
    return handleApiError(error, `Form submission${context}`)
  }

  /**
   * Handle network errors
   */
  const handleNetworkError = (error) => {
    const errorMessage = 'Network error. Please check your internet connection.'
    
    toast.error(errorMessage, {
      timeout: 6000,
      position: 'top-right'
    })
    
    errorState.globalError = {
      message: errorMessage,
      details: 'Please check your internet connection and try again.',
      timestamp: new Date().toISOString(),
      context: 'network'
    }
    
    return {
      message: errorMessage,
      type: 'network'
    }
  }

  /**
   * Handle authentication errors
   */
  const handleAuthError = (error) => {
    const errorMessage = 'Authentication failed. Please log in again.'
    
    toast.error(errorMessage, {
      timeout: 4000,
      position: 'top-right'
    })
    
    // Clear auth data
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_data')
    
    // Redirect to login
    setTimeout(() => {
      window.location.href = '/login'
    }, 2000)
    
    return {
      message: errorMessage,
      type: 'auth',
      redirect: true
    }
  }

  /**
   * Handle rate limit errors
   */
  const handleRateLimitError = (error) => {
    const retryAfter = error.response?.headers?.['retry-after'] || 60
    const errorMessage = `Too many requests. Please wait ${retryAfter} seconds before trying again.`
    
    toast.error(errorMessage, {
      timeout: 8000,
      position: 'top-right'
    })
    
    return {
      message: errorMessage,
      retryAfter: parseInt(retryAfter),
      type: 'rate_limit'
    }
  }

  /**
   * Clear all errors
   */
  const clearErrors = () => {
    errorState.errors = {}
    errorState.globalError = null
  }

  /**
   * Clear specific field error
   */
  const clearFieldError = (field) => {
    if (errorState.errors[field]) {
      delete errorState.errors[field]
    }
  }

  /**
   * Set loading state
   */
  const setLoading = (loading) => {
    errorState.isLoading = loading
  }

  /**
   * Show success message
   */
  const showSuccess = (message, options = {}) => {
    toast.success(message, {
      timeout: 3000,
      position: 'top-right',
      ...options
    })
  }

  /**
   * Show info message
   */
  const showInfo = (message, options = {}) => {
    toast.info(message, {
      timeout: 4000,
      position: 'top-right',
      ...options
    })
  }

  /**
   * Show warning message
   */
  const showWarning = (message, options = {}) => {
    toast.warning(message, {
      timeout: 4000,
      position: 'top-right',
      ...options
    })
  }

  /**
   * Generic error handler
   */
  const handleError = (error, context = '') => {
    if (error.response?.status === 401) {
      return handleAuthError(error)
    } else if (error.response?.status === 429) {
      return handleRateLimitError(error)
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      return handleNetworkError(error)
    } else {
      return handleApiError(error, context)
    }
  }

  return {
    // State
    errorState,
    
    // Methods
    handleError,
    handleApiError,
    handleValidationErrors,
    handleFormError,
    handleNetworkError,
    handleAuthError,
    handleRateLimitError,
    clearErrors,
    clearFieldError,
    setLoading,
    showSuccess,
    showInfo,
    showWarning
  }
}
import { useToast } from 'vue-toastification'

export function useErrorHandler() {
  const toast = useToast()
  
  const errorState = reactive({
    errors: {},
    globalError: null,
    isLoading: false
  })

  /**
   * Handle API errors
   */
  const handleApiError = (error, context = '') => {
    console.error(`API Error ${context}:`, error)
    
    let errorMessage = 'An unexpected error occurred'
    let errorDetails = null
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          errorMessage = 'Bad request. Please check your input.'
          errorDetails = data.errors || data.message
          break
        case 401:
          errorMessage = 'Authentication required. Please log in.'
          // Redirect to login
          window.location.href = '/login'
          break
        case 403:
          errorMessage = 'Access denied. You do not have permission.'
          break
        case 404:
          errorMessage = 'Resource not found.'
          break
        case 422:
          errorMessage = 'Validation failed. Please check your input.'
          errorDetails = data.errors || data.message
          break
        case 429:
          errorMessage = 'Too many requests. Please try again later.'
          break
        case 500:
          errorMessage = 'Server error. Please try again later.'
          break
        case 503:
          errorMessage = 'Service unavailable. Please try again later.'
          break
        default:
          errorMessage = data.message || `Server error (${status})`
      }
    } else if (error.request) {
      // Network error
      errorMessage = 'Network error. Please check your connection.'
    } else {
      // Other error
      errorMessage = error.message || 'An unexpected error occurred'
    }
    
    // Show error toast
    toast.error(errorMessage, {
      timeout: 5000,
      position: 'top-right'
    })
    
    // Set global error
    errorState.globalError = {
      message: errorMessage,
      details: errorDetails,
      timestamp: new Date().toISOString(),
      context: context
    }
    
    return {
      message: errorMessage,
      details: errorDetails,
      status: error.response?.status
    }
  }

  /**
   * Handle validation errors
   */
  const handleValidationErrors = (errors) => {
    errorState.errors = errors
    
    // Show first validation error
    const firstError = Object.values(errors)[0]
    if (firstError && firstError.length > 0) {
      toast.error(firstError[0], {
        timeout: 4000,
        position: 'top-right'
      })
    }
    
    return errors
  }

  /**
   * Handle form submission errors
   */
  const handleFormError = (error, formName = '') => {
    const context = formName ? ` (${formName})` : ''
    return handleApiError(error, `Form submission${context}`)
  }

  /**
   * Handle network errors
   */
  const handleNetworkError = (error) => {
    const errorMessage = 'Network error. Please check your internet connection.'
    
    toast.error(errorMessage, {
      timeout: 6000,
      position: 'top-right'
    })
    
    errorState.globalError = {
      message: errorMessage,
      details: 'Please check your internet connection and try again.',
      timestamp: new Date().toISOString(),
      context: 'network'
    }
    
    return {
      message: errorMessage,
      type: 'network'
    }
  }

  /**
   * Handle authentication errors
   */
  const handleAuthError = (error) => {
    const errorMessage = 'Authentication failed. Please log in again.'
    
    toast.error(errorMessage, {
      timeout: 4000,
      position: 'top-right'
    })
    
    // Clear auth data
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_data')
    
    // Redirect to login
    setTimeout(() => {
      window.location.href = '/login'
    }, 2000)
    
    return {
      message: errorMessage,
      type: 'auth',
      redirect: true
    }
  }

  /**
   * Handle rate limit errors
   */
  const handleRateLimitError = (error) => {
    const retryAfter = error.response?.headers?.['retry-after'] || 60
    const errorMessage = `Too many requests. Please wait ${retryAfter} seconds before trying again.`
    
    toast.error(errorMessage, {
      timeout: 8000,
      position: 'top-right'
    })
    
    return {
      message: errorMessage,
      retryAfter: parseInt(retryAfter),
      type: 'rate_limit'
    }
  }

  /**
   * Clear all errors
   */
  const clearErrors = () => {
    errorState.errors = {}
    errorState.globalError = null
  }

  /**
   * Clear specific field error
   */
  const clearFieldError = (field) => {
    if (errorState.errors[field]) {
      delete errorState.errors[field]
    }
  }

  /**
   * Set loading state
   */
  const setLoading = (loading) => {
    errorState.isLoading = loading
  }

  /**
   * Show success message
   */
  const showSuccess = (message, options = {}) => {
    toast.success(message, {
      timeout: 3000,
      position: 'top-right',
      ...options
    })
  }

  /**
   * Show info message
   */
  const showInfo = (message, options = {}) => {
    toast.info(message, {
      timeout: 4000,
      position: 'top-right',
      ...options
    })
  }

  /**
   * Show warning message
   */
  const showWarning = (message, options = {}) => {
    toast.warning(message, {
      timeout: 4000,
      position: 'top-right',
      ...options
    })
  }

  /**
   * Generic error handler
   */
  const handleError = (error, context = '') => {
    if (error.response?.status === 401) {
      return handleAuthError(error)
    } else if (error.response?.status === 429) {
      return handleRateLimitError(error)
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      return handleNetworkError(error)
    } else {
      return handleApiError(error, context)
    }
  }

  return {
    // State
    errorState,
    
    // Methods
    handleError,
    handleApiError,
    handleValidationErrors,
    handleFormError,
    handleNetworkError,
    handleAuthError,
    handleRateLimitError,
    clearErrors,
    clearFieldError,
    setLoading,
    showSuccess,
    showInfo,
    showWarning
  }
}
import { useToast } from 'vue-toastification'

export function useErrorHandler() {
  const toast = useToast()
  
  const errorState = reactive({
    errors: {},
    globalError: null,
    isLoading: false
  })

  /**
   * Handle API errors
   */
  const handleApiError = (error, context = '') => {
    console.error(`API Error ${context}:`, error)
    
    let errorMessage = 'An unexpected error occurred'
    let errorDetails = null
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          errorMessage = 'Bad request. Please check your input.'
          errorDetails = data.errors || data.message
          break
        case 401:
          errorMessage = 'Authentication required. Please log in.'
          // Redirect to login
          window.location.href = '/login'
          break
        case 403:
          errorMessage = 'Access denied. You do not have permission.'
          break
        case 404:
          errorMessage = 'Resource not found.'
          break
        case 422:
          errorMessage = 'Validation failed. Please check your input.'
          errorDetails = data.errors || data.message
          break
        case 429:
          errorMessage = 'Too many requests. Please try again later.'
          break
        case 500:
          errorMessage = 'Server error. Please try again later.'
          break
        case 503:
          errorMessage = 'Service unavailable. Please try again later.'
          break
        default:
          errorMessage = data.message || `Server error (${status})`
      }
    } else if (error.request) {
      // Network error
      errorMessage = 'Network error. Please check your connection.'
    } else {
      // Other error
      errorMessage = error.message || 'An unexpected error occurred'
    }
    
    // Show error toast
    toast.error(errorMessage, {
      timeout: 5000,
      position: 'top-right'
    })
    
    // Set global error
    errorState.globalError = {
      message: errorMessage,
      details: errorDetails,
      timestamp: new Date().toISOString(),
      context: context
    }
    
    return {
      message: errorMessage,
      details: errorDetails,
      status: error.response?.status
    }
  }

  /**
   * Handle validation errors
   */
  const handleValidationErrors = (errors) => {
    errorState.errors = errors
    
    // Show first validation error
    const firstError = Object.values(errors)[0]
    if (firstError && firstError.length > 0) {
      toast.error(firstError[0], {
        timeout: 4000,
        position: 'top-right'
      })
    }
    
    return errors
  }

  /**
   * Handle form submission errors
   */
  const handleFormError = (error, formName = '') => {
    const context = formName ? ` (${formName})` : ''
    return handleApiError(error, `Form submission${context}`)
  }

  /**
   * Handle network errors
   */
  const handleNetworkError = (error) => {
    const errorMessage = 'Network error. Please check your internet connection.'
    
    toast.error(errorMessage, {
      timeout: 6000,
      position: 'top-right'
    })
    
    errorState.globalError = {
      message: errorMessage,
      details: 'Please check your internet connection and try again.',
      timestamp: new Date().toISOString(),
      context: 'network'
    }
    
    return {
      message: errorMessage,
      type: 'network'
    }
  }

  /**
   * Handle authentication errors
   */
  const handleAuthError = (error) => {
    const errorMessage = 'Authentication failed. Please log in again.'
    
    toast.error(errorMessage, {
      timeout: 4000,
      position: 'top-right'
    })
    
    // Clear auth data
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_data')
    
    // Redirect to login
    setTimeout(() => {
      window.location.href = '/login'
    }, 2000)
    
    return {
      message: errorMessage,
      type: 'auth',
      redirect: true
    }
  }

  /**
   * Handle rate limit errors
   */
  const handleRateLimitError = (error) => {
    const retryAfter = error.response?.headers?.['retry-after'] || 60
    const errorMessage = `Too many requests. Please wait ${retryAfter} seconds before trying again.`
    
    toast.error(errorMessage, {
      timeout: 8000,
      position: 'top-right'
    })
    
    return {
      message: errorMessage,
      retryAfter: parseInt(retryAfter),
      type: 'rate_limit'
    }
  }

  /**
   * Clear all errors
   */
  const clearErrors = () => {
    errorState.errors = {}
    errorState.globalError = null
  }

  /**
   * Clear specific field error
   */
  const clearFieldError = (field) => {
    if (errorState.errors[field]) {
      delete errorState.errors[field]
    }
  }

  /**
   * Set loading state
   */
  const setLoading = (loading) => {
    errorState.isLoading = loading
  }

  /**
   * Show success message
   */
  const showSuccess = (message, options = {}) => {
    toast.success(message, {
      timeout: 3000,
      position: 'top-right',
      ...options
    })
  }

  /**
   * Show info message
   */
  const showInfo = (message, options = {}) => {
    toast.info(message, {
      timeout: 4000,
      position: 'top-right',
      ...options
    })
  }

  /**
   * Show warning message
   */
  const showWarning = (message, options = {}) => {
    toast.warning(message, {
      timeout: 4000,
      position: 'top-right',
      ...options
    })
  }

  /**
   * Generic error handler
   */
  const handleError = (error, context = '') => {
    if (error.response?.status === 401) {
      return handleAuthError(error)
    } else if (error.response?.status === 429) {
      return handleRateLimitError(error)
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      return handleNetworkError(error)
    } else {
      return handleApiError(error, context)
    }
  }

  return {
    // State
    errorState,
    
    // Methods
    handleError,
    handleApiError,
    handleValidationErrors,
    handleFormError,
    handleNetworkError,
    handleAuthError,
    handleRateLimitError,
    clearErrors,
    clearFieldError,
    setLoading,
    showSuccess,
    showInfo,
    showWarning
  }
}
