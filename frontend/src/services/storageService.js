/**
 * Storage Service
 * Centralized localStorage management with error handling
 */

/**
 * Storage keys constants
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  CART: 'cart',
  USER_PREFERENCES: 'user_preferences',
  WISHLIST: 'wishlist',
  RECENT_SEARCHES: 'recent_searches',
  THEME: 'theme',
  LANGUAGE: 'language'
}

/**
 * Storage Service class
 */
export class StorageService {
  /**
   * Get item from localStorage
   */
  static get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error getting item from localStorage (${key}):`, error)
      return defaultValue
    }
  }

  /**
   * Set item in localStorage
   */
  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Error setting item in localStorage (${key}):`, error)
      return false
    }
  }

  /**
   * Remove item from localStorage
   */
  static remove(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Error removing item from localStorage (${key}):`, error)
      return false
    }
  }

  /**
   * Clear all localStorage
   */
  static clear() {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Error clearing localStorage:', error)
      return false
    }
  }

  /**
   * Check if key exists in localStorage
   */
  static has(key) {
    return localStorage.getItem(key) !== null
  }

  /**
   * Get all keys from localStorage
   */
  static keys() {
    try {
      return Object.keys(localStorage)
    } catch (error) {
      console.error('Error getting localStorage keys:', error)
      return []
    }
  }

  /**
   * Get storage size in bytes
   */
  static size() {
    try {
      let total = 0
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length
        }
      }
      return total
    } catch (error) {
      console.error('Error calculating localStorage size:', error)
      return 0
    }
  }
}

/**
 * Auth-specific storage methods
 */
export const authStorage = {
  getToken: () => StorageService.get(STORAGE_KEYS.AUTH_TOKEN),
  setToken: (token) => StorageService.set(STORAGE_KEYS.AUTH_TOKEN, token),
  removeToken: () => StorageService.remove(STORAGE_KEYS.AUTH_TOKEN),
  hasToken: () => StorageService.has(STORAGE_KEYS.AUTH_TOKEN)
}

/**
 * Cart-specific storage methods
 */
export const cartStorage = {
  get: () => StorageService.get(STORAGE_KEYS.CART, []),
  set: (cart) => StorageService.set(STORAGE_KEYS.CART, cart),
  clear: () => StorageService.remove(STORAGE_KEYS.CART),
  hasItems: () => {
    const cart = StorageService.get(STORAGE_KEYS.CART, [])
    return Array.isArray(cart) && cart.length > 0
  }
}

/**
 * User preferences storage methods
 */
export const preferencesStorage = {
  get: () => StorageService.get(STORAGE_KEYS.USER_PREFERENCES, {}),
  set: (preferences) => StorageService.set(STORAGE_KEYS.USER_PREFERENCES, preferences),
  getTheme: () => StorageService.get(STORAGE_KEYS.THEME, 'light'),
  setTheme: (theme) => StorageService.set(STORAGE_KEYS.THEME, theme),
  getLanguage: () => StorageService.get(STORAGE_KEYS.LANGUAGE, 'en'),
  setLanguage: (language) => StorageService.set(STORAGE_KEYS.LANGUAGE, language)
}

// Export default instance
export default StorageService
