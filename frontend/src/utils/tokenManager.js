/**
 * Token Manager
 * Handles authentication token management for the frontend
 */

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'user'
const TOKEN_EXPIRES_KEY = 'token_expires_at'
const REFRESH_TOKEN_KEY = 'refresh_token'

export class TokenManager {
  // Cache for reducing redundant calls
  static _userCache = null
  static _tokenCache = null
  static _authCache = null
  /**
   * Set authentication token
   */
  static setToken(token, expiresAt = null) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)

      if (expiresAt) {
        localStorage.setItem(TOKEN_EXPIRES_KEY, expiresAt)
      }

      console.log('Token stored - setToken called:', {
        token: token.substring(0, 20) + '...',
        expiresAt: expiresAt,
        TOKEN_KEY: TOKEN_KEY
      })
    }
  }

  /**
   * Get authentication token
   */
  static getToken() {
    const token = localStorage.getItem(TOKEN_KEY)
    // Only log in development and reduce frequency
    if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) {
      console.log('Token retrieved - getToken called:', {
        TOKEN_KEY: TOKEN_KEY,
        token: token ? token.substring(0, 20) + '...' : null,
        exists: !!token
      })
    }
    return token
  }

  /**
   * Set refresh token
   */
  static setRefreshToken(refreshToken) {
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    }
  }

  /**
   * Get refresh token
   */
  static getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  }

  /**
   * Set user data
   */
  static setUser(user) {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
      console.log('User stored - setUser called:', user.role)
    }
  }

  /**
   * Get user data
   */
  static getUser() {
    const currentToken = this.getToken()

    // Use cache if token hasn't changed
    if (this._tokenCache === currentToken && this._userCache) {
      return this._userCache
    }

    const userStr = localStorage.getItem(USER_KEY)
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr)
        this._userCache = {
          raw: userStr,
          parsed: parsed,
          role: parsed.role
        }
        this._tokenCache = currentToken
        return this._userCache
      } catch (error) {
        console.error('Failed to parse user data:', error)
        this._userCache = null
        this._tokenCache = null
      }
    }
    return null
  }

  /**
   * Check if token exists
   */
  static hasToken() {
    return !!this.getToken()
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired() {
    const expiresAt = localStorage.getItem(TOKEN_EXPIRES_KEY)

    if (!expiresAt) {
      return false // If no expiration is set, assume token is valid
    }

    const now = new Date()
    const expiration = new Date(expiresAt)
    const isExpired = now >= expiration

    console.log('Token expiration check:', {
      expiresAt,
      now: now.toISOString(),
      expiration: expiration.toISOString(),
      isExpired
    })

    return isExpired
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated() {
    const currentToken = this.getToken()

    // Use cache if token hasn't changed
    if (this._tokenCache === currentToken && this._authCache !== null) {
      return this._authCache
    }

    const hasToken = this.hasToken()
    const isExpired = this.isTokenExpired()
    const result = hasToken && !isExpired

    // Cache the result
    this._authCache = result
    this._tokenCache = currentToken

    // Only log in development and reduce frequency
    if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) {
      console.log('Authentication check:', {
        hasToken,
        isExpired,
        result,
        token: currentToken?.substring(0, 20) + '...'
      })
    }

    return result
  }

  /**
   * Clear all authentication data
   */
  static clearAuth() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(TOKEN_EXPIRES_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)

    // Clear cache
    this._userCache = null
    this._tokenCache = null
    this._authCache = null
  }

  /**
   * Get token expiration time
   */
  static getTokenExpiration() {
    return localStorage.getItem(TOKEN_EXPIRES_KEY)
  }

  /**
   * Check if token needs refresh (expires in next 5 minutes)
   */
  static needsRefresh() {
    const expiresAt = localStorage.getItem(TOKEN_EXPIRES_KEY)

    if (!expiresAt) {
      return false
    }

    const now = new Date()
    const expiration = new Date(expiresAt)
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000)

    return expiration <= fiveMinutesFromNow
  }

  /**
   * Get authorization header
   */
  static getAuthHeader() {
    const token = this.getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  /**
   * Store complete auth response
   */
  static storeAuthResponse(authData) {
    const { token, user, expires_at, refresh_token } = authData

    this.setToken(token, expires_at)
    this.setUser(user)

    if (refresh_token) {
      this.setRefreshToken(refresh_token)
    }
  }

  /**
   * Get token payload (decode JWT without verification)
   */
  static getTokenPayload() {
    const token = this.getToken()

    if (!token) {
      return null
    }

    try {
      // Handle both JWT and simple tokens
      const parts = token.split('.')
      if (parts.length === 3) {
        // JWT token - decode the payload (middle part)
        const payload = parts[1]
        // Add padding if needed for base64 decoding
        const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4)
        return JSON.parse(atob(paddedPayload))
      } else {
        // Simple token - check if it's a test token
        if (token.startsWith('test-token-')) {
          // For test tokens, return mock payload
          return {
            id: 1,
            role: 'admin',
            name: 'Admin User',
            email: 'admin@example.com',
            exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
          }
        }
        // For other simple tokens, return null
        return null
      }
    } catch (error) {
      console.warn('Token payload decode failed, treating as simple token:', error.message)
      return null
    }
  }

  /**
   * Get user ID from token
   */
  static getUserId() {
    const payload = this.getTokenPayload()
    return payload?.sub || payload?.user_id || null
  }

  /**
   * Get user role from token or user data
   */
  static getUserRole() {
    const user = this.getUser()
    const payload = this.getTokenPayload()
    const role = user?.role || payload?.role || 'user'

    // Only log in development and reduce frequency
    if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) {
      console.log('User role check:', {
        user: user,
        payload: payload,
        role: role
      })
    }

    return role
  }

  /**
   * Check if user has specific role
   */
  static hasRole(role) {
    const userRole = this.getUserRole()
    return userRole === role
  }

  /**
   * Check if user is admin
   */
  static isAdmin() {
    const result = this.hasRole('admin')
    // Only log in development and reduce frequency
    if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) {
      console.log('Admin role check called:', result)
    }
    return result
  }

  /**
   * Get token time remaining (in minutes)
   */
  static getTokenTimeRemaining() {
    const expiresAt = localStorage.getItem(TOKEN_EXPIRES_KEY)

    if (!expiresAt) {
      return null
    }

    const now = new Date()
    const expiration = new Date(expiresAt)
    const remaining = expiration - now

    return Math.max(0, Math.floor(remaining / (1000 * 60)))
  }

  /**
   * Clear authentication token
   */
  static clearToken() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(TOKEN_EXPIRES_KEY)
  }

  /**
   * Clear user data
   */
  static clearUser() {
    localStorage.removeItem(USER_KEY)
  }

  /**
   * Clear refresh token
   */
  static clearRefreshToken() {
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }

  /**
   * Clear all authentication data
   */
  static clearAll() {
    this.clearToken()
    this.clearUser()
    this.clearRefreshToken()
  }
}

export default TokenManager
