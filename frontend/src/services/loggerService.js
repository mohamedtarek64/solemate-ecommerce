/**
 * Logger Service
 * Centralized logging with environment-based filtering
 */

/**
 * Log levels
 */
export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
}

/**
 * Check if we're in development mode
 */
const isDevelopment = import.meta.env.DEV
const isDebugMode = import.meta.env.VITE_DEBUG_MODE === 'true'

/**
 * Logger Service class
 */
export class LoggerService {
  /**
   * Log error message
   */
  static error(message, error = null, context = null) {
    if (isDevelopment || isDebugMode) {
      console.error(`[ERROR] ${message}`, error || '', context || '')
    }

    // In production, you might want to send errors to a logging service
    if (!isDevelopment) {
      // Example: Send to external logging service
      // this.sendToLoggingService(LOG_LEVELS.ERROR, message, error, context)
    }
  }

  /**
   * Log warning message
   */
  static warn(message, data = null, context = null) {
    if (isDevelopment || isDebugMode) {
      console.warn(`[WARN] ${message}`, data || '', context || '')
    }
  }

  /**
   * Log info message
   */
  static info(message, data = null, context = null) {
    if (isDevelopment || isDebugMode) {
      console.info(`[INFO] ${message}`, data || '', context || '')
    }
  }

  /**
   * Log debug message
   */
  static debug(message, data = null, context = null) {
    if (isDebugMode) {
      }
  }

  /**
   * Log API request
   */
  static apiRequest(method, endpoint, data = null) {
    if (isDebugMode) {
      } ${endpoint}`, data || '')
    }
  }

  /**
   * Log API response
   */
  static apiResponse(method, endpoint, response, duration = null) {
    if (isDebugMode) {
      const durationText = duration ? ` (${duration}ms)` : ''
      } ${endpoint}${durationText}`, response)
    }
  }

  /**
   * Log API error
   */
  static apiError(method, endpoint, error, duration = null) {
    const durationText = duration ? ` (${duration}ms)` : ''
    console.error(`[API ERROR] ${method.toUpperCase()} ${endpoint}${durationText}`, error)
  }

  /**
   * Log user action
   */
  static userAction(action, data = null) {
    if (isDebugMode) {
      }
  }

  /**
   * Log performance metric
   */
  static performance(metric, value, unit = 'ms') {
    if (isDebugMode) {
      }
  }

  /**
   * Log component lifecycle
   */
  static componentLifecycle(componentName, lifecycle, data = null) {
    if (isDebugMode) {
      }
  }

  /**
   * Log navigation
   */
  static navigation(from, to, data = null) {
    if (isDebugMode) {
      }
  }

  /**
   * Log authentication events
   */
  static auth(event, data = null) {
    if (isDebugMode) {
      }
  }

  /**
   * Log cart operations
   */
  static cart(operation, data = null) {
    if (isDebugMode) {
      }
  }

  /**
   * Log wishlist operations
   */
  static wishlist(operation, data = null) {
    if (isDebugMode) {
      }
  }

  /**
   * Log order operations
   */
  static order(operation, data = null) {
    if (isDebugMode) {
      }
  }

  /**
   * Log admin operations
   */
  static admin(operation, data = null) {
    if (isDebugMode) {
      }
  }

  /**
   * Send to external logging service (example implementation)
   */
  static sendToLoggingService(level, message, error, context) {
    // Example implementation for external logging service
    // This would typically send data to services like Sentry, LogRocket, etc.

    const logData = {
      level,
      message,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : null,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    // Example: Send to external service
    // fetch('/api/logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(logData)
    // }).catch(err => {
    //   console.error('Failed to send log to external service:', err)
    // })
  }
}

// Export default instance
export default LoggerService
