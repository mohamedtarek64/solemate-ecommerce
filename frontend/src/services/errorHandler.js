/**
 * Centralized Error Handler Service
 *
 * Provides comprehensive error handling for the frontend application
 */
import { useToast } from 'vue-toastification'

class ErrorHandlerService {
  constructor() {
    this.toast = useToast()
    this.errorLog = []
    this.maxLogSize = 100
    this.setupGlobalErrorHandling()
  }

  /**
   * Setup global error handling
   */
  setupGlobalErrorHandling() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, 'Unhandled Promise Rejection')
    })

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error, 'Global JavaScript Error')
    })

    // Handle Vue errors (if available)
    if (window.Vue && window.Vue.config) {
      window.Vue.config.errorHandler = (err, vm, info) => {
        this.handleError(err, `Vue Error: ${info}`)
      }
    }
  }

  /**
   * Handle different types of errors
   */
  handleError(error, context = 'Unknown') {
    const errorInfo = this.parseError(error)

    // Log error
    this.logError({
      ...errorInfo,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    })

    // Show user-friendly message
    this.showErrorToUser(errorInfo)

    // Report to external service if configured
    this.reportError(errorInfo, context)
  }

  /**
   * Parse error into standardized format
   */
  parseError(error) {
    if (typeof error === 'string') {
      return {
        message: error,
        type: 'String Error',
        stack: null
      }
    }

    if (error instanceof Error) {
      return {
        message: error.message,
        type: error.constructor.name,
        stack: error.stack,
        name: error.name
      }
    }

    if (error && typeof error === 'object') {
      return {
        message: error.message || 'Unknown error occurred',
        type: error.type || 'Object Error',
        stack: error.stack,
        code: error.code,
        status: error.status,
        data: error.data
      }
    }

    return {
      message: 'Unknown error occurred',
      type: 'Unknown Error',
      stack: null
    }
  }

  /**
   * Log error to internal log
   */
  logError(errorInfo) {
    this.errorLog.unshift(errorInfo)

    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize)
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorInfo)
    }
  }

  /**
   * Show error to user
   */
  showErrorToUser(errorInfo) {
    const userMessage = this.getUserFriendlyMessage(errorInfo)

    this.toast.error(userMessage, {
      timeout: 5000,
      closeOnClick: true,
      pauseOnFocusLoss: true,
      pauseOnHover: true
    })
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(errorInfo) {
    const { message, type, code, status } = errorInfo

    // Network errors
    if (type === 'TypeError' && message.includes('fetch')) {
      return 'Network connection error. Please check your internet connection.'
    }

    // API errors
    if (status) {
      switch (status) {
        case 400:
          return 'Invalid request. Please check your input and try again.'
        case 401:
          return 'Authentication required. Please log in again.'
        case 403:
          return 'Access denied. You do not have permission to perform this action.'
        case 404:
          return 'The requested resource was not found.'
        case 422:
          return 'Validation error. Please check your input.'
        case 429:
          return 'Too many requests. Please wait a moment and try again.'
        case 500:
          return 'Server error. Please try again later.'
        case 503:
          return 'Service temporarily unavailable. Please try again later.'
        default:
          return `Server error (${status}). Please try again later.`
      }
    }

    // Specific error codes
    if (code) {
      switch (code) {
        case 'NETWORK_ERROR':
          return 'Network error. Please check your connection.'
        case 'TIMEOUT_ERROR':
          return 'Request timed out. Please try again.'
        case 'VALIDATION_ERROR':
          return 'Please check your input and try again.'
        case 'AUTHENTICATION_ERROR':
          return 'Authentication failed. Please log in again.'
        case 'AUTHORIZATION_ERROR':
          return 'You do not have permission to perform this action.'
        default:
          return message || 'An unexpected error occurred.'
      }
    }

    // Fallback to original message or generic message
    return message || 'An unexpected error occurred. Please try again.'
  }

  /**
   * Report error to external service
   */
  reportError(errorInfo, context) {
    // Only report in production
    if (process.env.NODE_ENV !== 'production') {
      return
    }

    // Example: Report to external error tracking service
    // You can integrate with services like Sentry, Bugsnag, etc.
    try {
      // Example implementation:
      // Sentry.captureException(error, {
      //   tags: { context },
      //   extra: errorInfo
      // })

      } catch (reportingError) {
      console.error('Failed to report error:', reportingError)
    }
  }

  /**
   * Handle API errors specifically
   */
  handleApiError(error, endpoint) {
    const apiError = this.parseError(error)
    apiError.endpoint = endpoint

    this.logError({
      ...apiError,
      context: 'API Error',
      timestamp: new Date().toISOString()
    })

    this.showErrorToUser(apiError)
    return apiError
  }

  /**
   * Handle validation errors
   */
  handleValidationError(errors) {
    const errorMessages = []

    if (Array.isArray(errors)) {
      errorMessages.push(...errors)
    } else if (typeof errors === 'object') {
      Object.values(errors).forEach(error => {
        if (Array.isArray(error)) {
          errorMessages.push(...error)
        } else {
          errorMessages.push(error)
        }
      })
    }

    const message = errorMessages.length > 0
      ? errorMessages.join(', ')
      : 'Validation failed. Please check your input.'

    this.toast.error(message)
  }

  /**
   * Handle network errors
   */
  handleNetworkError(error) {
    const networkError = {
      message: 'Network error occurred',
      type: 'Network Error',
      code: 'NETWORK_ERROR',
      originalError: error
    }

    this.logError({
      ...networkError,
      context: 'Network Error',
      timestamp: new Date().toISOString()
    })

    this.toast.error('Network connection error. Please check your internet connection.')
  }

  /**
   * Handle timeout errors
   */
  handleTimeoutError(endpoint) {
    const timeoutError = {
      message: `Request to ${endpoint} timed out`,
      type: 'Timeout Error',
      code: 'TIMEOUT_ERROR',
      endpoint
    }

    this.logError({
      ...timeoutError,
      context: 'Timeout Error',
      timestamp: new Date().toISOString()
    })

    this.toast.error('Request timed out. Please try again.')
  }

  /**
   * Get error log
   */
  getErrorLog() {
    return [...this.errorLog]
  }

  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = []
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const stats = {
      totalErrors: this.errorLog.length,
      errorsByType: {},
      errorsByContext: {},
      recentErrors: this.errorLog.slice(0, 10)
    }

    this.errorLog.forEach(error => {
      // Count by type
      stats.errorsByType[error.type] = (stats.errorsByType[error.type] || 0) + 1

      // Count by context
      stats.errorsByContext[error.context] = (stats.errorsByContext[error.context] || 0) + 1
    })

    return stats
  }

  /**
   * Create error boundary for Vue components
   */
  createErrorBoundary() {
    return {
      error: null,
      hasError: false,

      onError(error, info) {
        this.error = error
        this.hasError = true
        this.handleError(error, `Component Error: ${info}`)
      },

      reset() {
        this.error = null
        this.hasError = false
      }
    }
  }
}

// Create singleton instance
const errorHandler = new ErrorHandlerService()

export default errorHandler
