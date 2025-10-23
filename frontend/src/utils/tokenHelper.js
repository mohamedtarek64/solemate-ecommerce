// Token management utilities
export const TokenHelper = {
  // Get token from localStorage
  getToken() {
    return localStorage.getItem('auth_token')
  },

  // Set token in localStorage
  setToken(token) {
    localStorage.setItem('auth_token', token)
  },

  // Remove token from localStorage
  removeToken() {
    localStorage.removeItem('auth_token')
  },

  // Check if token exists
  hasToken() {
    return !!this.getToken()
  },

  // Decode JWT token (basic decoding without verification)
  decodeToken(token = null) {
    const tokenToUse = token || this.getToken()
    if (!tokenToUse) return null

    try {
      const base64Url = tokenToUse.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error('Error decoding token:', error)
      return null
    }
  },

  // Check if token is expired
  isTokenExpired(token = null) {
    const decoded = this.decodeToken(token)
    if (!decoded || !decoded.exp) return true

    const currentTime = Date.now() / 1000
    return decoded.exp < currentTime
  },

  // Get token expiration time
  getTokenExpiration(token = null) {
    const decoded = this.decodeToken(token)
    if (!decoded || !decoded.exp) return null

    return new Date(decoded.exp * 1000)
  },

  // Check if token will expire soon (within 5 minutes)
  willExpireSoon(token = null, minutesThreshold = 5) {
    const decoded = this.decodeToken(token)
    if (!decoded || !decoded.exp) return true

    const currentTime = Date.now() / 1000
    const threshold = minutesThreshold * 60
    return decoded.exp - currentTime < threshold
  },

  // Get user info from token
  getUserFromToken(token = null) {
    const decoded = this.decodeToken(token)
    if (!decoded) return null

    return {
      id: decoded.sub || decoded.user_id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      is_admin: decoded.is_admin || false
    }
  },

  // Format token for Authorization header
  formatAuthHeader(token = null) {
    const tokenToUse = token || this.getToken()
    return tokenToUse ? `Bearer ${tokenToUse}` : null
  },

  // Clear all auth data
  clearAuthData() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    localStorage.removeItem('refresh_token')
  },

  // Set complete auth data
  setAuthData(token, user, refreshToken = null) {
    this.setToken(token)
    localStorage.setItem('user', JSON.stringify(user))
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken)
    }
  },

  // Get user from localStorage
  getUser() {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  // Check if user is authenticated
  isAuthenticated() {
    return this.hasToken() && !this.isTokenExpired() && !!this.getUser()
  },

  // Check if user is admin
  isAdmin() {
    const user = this.getUser()
    return user?.is_admin === true || user?.role === 'admin'
  },

  // Get refresh token
  getRefreshToken() {
    return localStorage.getItem('refresh_token')
  },

  // Set refresh token
  setRefreshToken(refreshToken) {
    localStorage.setItem('refresh_token', refreshToken)
  },

  // Remove refresh token
  removeRefreshToken() {
    localStorage.removeItem('refresh_token')
  }
}

export default TokenHelper
