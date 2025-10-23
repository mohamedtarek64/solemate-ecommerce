// Utils Index - Centralized utility exports
// This file provides a clean way to import utilities throughout the application

// API Utilities
export { default as apiClient } from './apiClient'
export * from './apiTest'

// Authentication Utilities
export * from './authHelpers'
export * from './oauthHelpers'

// Cart Utilities
export * from './cartHelpers'

// Currency Utilities
export * from './currency'

// Error Handling
export * from './errorHandler'

// Image Utilities
export * from './imageHelpers'

// Performance Utilities
export * from './performance'

// Product Utilities
export * from './productHelpers'

// Search Utilities
export * from './searchHelpers'

// Validation Utilities
export * from './validation'

// Wishlist Utilities
export * from './wishlistHelpers'

// Common utility functions
export const formatPrice = (price, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(price)
}

export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(new Date(date))
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const throttle = (func, limit) => {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

export const truncateText = (text, length = 100) => {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

export const capitalize = (text) => {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
