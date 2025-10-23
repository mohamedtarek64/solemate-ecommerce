// Environment configuration
export const ENV_CONFIG = {
  // App info
  APP_NAME: import.meta.env.VITE_APP_NAME || 'SoleMate',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
  APP_URL: import.meta.env.VITE_APP_URL || 'http://localhost:3000',

  // API configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
  API_RETRY_ATTEMPTS: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS) || 3,

  // Authentication
  JWT_SECRET: import.meta.env.VITE_JWT_SECRET || 'your-jwt-secret-key',
  REFRESH_TOKEN_EXPIRES: import.meta.env.VITE_REFRESH_TOKEN_EXPIRES || '7d',
  ACCESS_TOKEN_EXPIRES: import.meta.env.VITE_ACCESS_TOKEN_EXPIRES || '15m',

  // Feature flags
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  ENABLE_HOT_RELOAD: import.meta.env.VITE_ENABLE_HOT_RELOAD === 'true',
  ENABLE_SOURCE_MAPS: import.meta.env.VITE_ENABLE_SOURCE_MAPS === 'true',

  // External services
  GOOGLE_ANALYTICS_ID: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '',
  FACEBOOK_PIXEL_ID: import.meta.env.VITE_FACEBOOK_PIXEL_ID || '',
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  PAYPAL_CLIENT_ID: import.meta.env.VITE_PAYPAL_CLIENT_ID || '',

  // File upload
  MAX_FILE_SIZE: parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 10485760, // 10MB
  ALLOWED_FILE_TYPES: import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ],

  // Cache configuration
  CACHE_TTL: parseInt(import.meta.env.VITE_CACHE_TTL) || 300000, // 5 minutes
  ENABLE_OFFLINE_MODE: import.meta.env.VITE_ENABLE_OFFLINE_MODE === 'true',

  // Performance
  ENABLE_LAZY_LOADING: import.meta.env.VITE_ENABLE_LAZY_LOADING === 'true',
  ENABLE_PRELOADING: import.meta.env.VITE_ENABLE_PRELOADING === 'true',
  ENABLE_COMPRESSION: import.meta.env.VITE_ENABLE_COMPRESSION === 'true',

  // Security
  ENABLE_CSP: import.meta.env.VITE_ENABLE_CSP === 'true',
  ENABLE_HSTS: import.meta.env.VITE_ENABLE_HSTS === 'true',
  ENABLE_XSS_PROTECTION: import.meta.env.VITE_ENABLE_XSS_PROTECTION === 'true'
}

// Development helpers
export const isDevelopment = () => ENV_CONFIG.APP_ENV === 'development'
export const isProduction = () => ENV_CONFIG.APP_ENV === 'production'
export const isDebugMode = () => ENV_CONFIG.ENABLE_DEBUG

// Logging utility
export const log = (message, data = null) => {
  if (isDebugMode()) {
    console.log(`[${ENV_CONFIG.APP_NAME}] ${message}`, data)
  }
}

// Error logging utility
export const logError = (error, context = '') => {
  console.error(`[${ENV_CONFIG.APP_NAME}] Error${context ? ` in ${context}` : ''}:`, error)
}

// Performance monitoring
export const measurePerformance = (name, fn) => {
  if (isDebugMode()) {
    const start = performance.now()
    const result = fn()
    const end = performance.now()
    log(`Performance: ${name} took ${end - start} milliseconds`)
    return result
  }
  return fn()
}
