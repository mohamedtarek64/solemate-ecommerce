/**
 * Global Error Handler
 * Handles all errors across the application
 */

import performanceMonitorEnhanced from './performanceMonitorEnhanced'

class GlobalErrorHandler {
  constructor() {
    this.errors = []
    this.maxErrors = 100
    this.errorCallbacks = []
  }

  /**
   * Handle error
   */
  handleError(error, context = {}) {
    const errorInfo = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      context,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    }

    // Store error
    this.errors.push(errorInfo)
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors)
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('❌ Global Error:', errorInfo)
    }

    // Record in performance monitor
    performanceMonitorEnhanced.recordError(context.component || 'unknown', error)

    // Call registered callbacks
    this.errorCallbacks.forEach(callback => {
      try {
        callback(errorInfo)
      } catch (e) {
        console.error('Error in error callback:', e)
      }
    })

    // Send to backend (optional)
    this.reportToBackend(errorInfo)
  }

  /**
   * Handle API error
   */
  handleApiError(error, config) {
    const apiError = {
      type: 'api_error',
      endpoint: config?.url || 'unknown',
      method: config?.method || 'unknown',
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    }

    this.handleError(error, apiError)

    // Show user-friendly message
    return this.getUserFriendlyMessage(apiError)
  }

  /**
   * Handle Vue error
   */
  handleVueError(error, vm, info) {
    const vueError = {
      type: 'vue_error',
      component: vm?.$options?.name || vm?.$options?.__name || 'UnknownComponent',
      info,
      props: vm?.$props,
      route: vm?.$route?.path
    }

    this.handleError(error, vueError)
  }

  /**
   * Handle promise rejection
   */
  handleUnhandledRejection(event) {
    const error = new Error(event.reason || 'Unhandled Promise Rejection')
    this.handleError(error, {
      type: 'unhandled_rejection',
      reason: event.reason
    })
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(errorInfo) {
    const statusMessages = {
      400: 'Invalid request. Please check your input.',
      401: 'Please login to continue.',
      403: 'You don\'t have permission to perform this action.',
      404: 'Resource not found.',
      422: 'Validation failed. Please check your input.',
      429: 'Too many requests. Please try again later.',
      500: 'Server error. Please try again later.',
      503: 'Service temporarily unavailable.'
    }

    return statusMessages[errorInfo.status] || 'An error occurred. Please try again.'
  }

  /**
   * Register error callback
   */
  onError(callback) {
    this.errorCallbacks.push(callback)
  }

  /**
   * Get errors
   */
  getErrors() {
    return this.errors
  }

  /**
   * Get recent errors
   */
  getRecentErrors(count = 10) {
    return this.errors.slice(-count)
  }

  /**
   * Clear errors
   */
  clearErrors() {
    this.errors = []
  }

  /**
   * Get error stats
   */
  getStats() {
    const errorsByType = {}
    const errorsByStatus = {}

    this.errors.forEach(error => {
      // By type
      const type = error.context?.type || 'unknown'
      errorsByType[type] = (errorsByType[type] || 0) + 1

      // By status
      const status = error.context?.status || 'unknown'
      errorsByStatus[status] = (errorsByStatus[status] || 0) + 1
    })

    return {
      total: this.errors.length,
      byType: errorsByType,
      byStatus: errorsByStatus,
      recent: this.getRecentErrors(5)
    }
  }

  /**
   * Report error to backend (optional)
   */
  async reportToBackend(errorInfo) {
    // Only report in production
    if (import.meta.env.DEV) return

    try {
      // Send to backend error logging endpoint
      await fetch('/api/errors/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          error: errorInfo.message,
          context: errorInfo.context,
          timestamp: errorInfo.timestamp,
          url: errorInfo.url
        })
      })
    } catch (e) {
      // Silently fail
      console.warn('Failed to report error to backend:', e)
    }
  }

  /**
   * Setup global error handlers
   */
  setupGlobalHandlers() {
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleUnhandledRejection(event)
    })

    // Global errors
    window.addEventListener('error', (event) => {
      if (event.error) {
        this.handleError(event.error, {
          type: 'window_error',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        })
      }
    })

    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window && event.target.tagName) {
        // Skip logging for common image loading issues
        if (event.target.tagName === 'IMG') {
          // Only log if it's not a placeholder or common missing image
          const src = event.target.src || ''
          if (src.includes('placeholder') || src.includes('default') || src.includes('no-image')) {
            return // Skip logging placeholder images
          }
        }

        this.handleError(new Error(`Failed to load ${event.target.tagName}`), {
          type: 'resource_error',
          tagName: event.target.tagName,
          src: event.target.src || event.target.href,
          alt: event.target.alt || '',
          className: event.target.className || ''
        })
      }
    }, true)
  }
}

// Create singleton instance
const globalErrorHandler = new GlobalErrorHandler()

// Setup global handlers
globalErrorHandler.setupGlobalHandlers()

// Expose to window for debugging
if (typeof window !== 'undefined') {
  window.__errorHandler__ = globalErrorHandler
}

export default globalErrorHandler

