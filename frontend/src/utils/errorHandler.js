/**
 * Error handling utility for the frontend application
 */

/**
 * Handle API errors and return user-friendly messages
 * @param {Error} error - The error object
 * @param {string} defaultMessage - Default message if no specific error is found
 * @returns {string} User-friendly error message
 */
export function handleApiError(error, defaultMessage = 'An unexpected error occurred') {
  // Network error
  if (!error.response) {
    return 'Network error. Please check your connection and try again.'
  }

  // Server error with specific message
  if (error.response.data?.message) {
    return error.response.data.message
  }

  // Validation errors
  if (error.response.data?.errors) {
    const errors = error.response.data.errors
    if (typeof errors === 'object') {
      return Object.values(errors).flat().join(', ')
    }
    return errors
  }

  // HTTP status code based messages
  switch (error.response.status) {
    case 400:
      return 'Bad request. Please check your input and try again.'
    case 401:
      return 'You are not authorized. Please log in and try again.'
    case 403:
      return 'Access forbidden. You do not have permission to perform this action.'
    case 404:
      return 'The requested resource was not found.'
    case 422:
      return 'Validation error. Please check your input and try again.'
    case 429:
      return 'Too many requests. Please wait a moment and try again.'
    case 500:
      return 'Server error. Please try again later.'
    case 502:
      return 'Bad gateway. The server is temporarily unavailable.'
    case 503:
      return 'Service unavailable. Please try again later.'
    case 504:
      return 'Gateway timeout. Please try again later.'
    default:
      return defaultMessage
  }
}

/**
 * Log error to console with additional context
 * @param {Error} error - The error object
 * @param {string} context - Additional context about where the error occurred
 * @param {Object} additionalData - Additional data to log
 */
export function logError(error, context = '', additionalData = {}) {
  console.error(`[${context}] Error:`, {
    message: error.message,
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
    ...additionalData
  })
}

/**
 * Show error notification to user
 * @param {string} message - Error message to show
 * @param {string} type - Type of notification (error, warning, info)
 */
export function showErrorNotification(message, type = 'error') {
  // This would integrate with your notification system
  // For now, we'll use console.warn
  console.warn(`[${type.toUpperCase()}] ${message}`)
  
  // You can integrate with toast notifications, alerts, etc.
  // Example: toast.error(message) or this.$toast.error(message)
}

/**
 * Handle async operations with error catching
 * @param {Function} asyncFn - Async function to execute
 * @param {string} context - Context for error logging
 * @param {string} defaultErrorMessage - Default error message
 * @returns {Promise<{data: any, error: string|null}>}
 */
export async function safeAsync(asyncFn, context = '', defaultErrorMessage = 'Operation failed') {
  try {
    const data = await asyncFn()
    return { data, error: null }
  } catch (error) {
    const errorMessage = handleApiError(error, defaultErrorMessage)
    logError(error, context)
    return { data: null, error: errorMessage }
  }
}

/**
 * Retry an async operation with exponential backoff
 * @param {Function} asyncFn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise<any>}
 */
export async function retryWithBackoff(asyncFn, maxRetries = 3, baseDelay = 1000) {
  let lastError
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await asyncFn()
    } catch (error) {
      lastError = error
      
      // Don't retry on client errors (4xx)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error
      }
      
      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

/**
 * Validate API response structure
 * @param {Object} response - API response object
 * @param {string} expectedDataKey - Expected key for data in response
 * @returns {boolean}
 */
export function validateApiResponse(response, expectedDataKey = 'data') {
  if (!response || typeof response !== 'object') {
    return false
  }
  
  if (expectedDataKey && !response[expectedDataKey]) {
    return false
  }
  
  return true
}

/**
 * Create a standardized error object
 * @param {string} message - Error message
 * @param {number} code - Error code
 * @param {Object} details - Additional error details
 * @returns {Object}
 */
export function createError(message, code = 500, details = {}) {
  return {
    message,
    code,
    details,
    timestamp: new Date().toISOString()
  }
}
