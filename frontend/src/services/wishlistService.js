/**
 * Simple Wishlist Service
 */
class WishlistService {
  constructor() {
    this.baseURL = 'http://127.0.0.1:8000/api'
  }

  /**
   * Get current user ID
   */
  getCurrentUserId() {
    console.log('getCurrentUserId called')

    // Method 1: From URL params (for testing)
    const urlParams = new URLSearchParams(window.location.search)
    const userIdFromUrl = urlParams.get('user_id')
    if (userIdFromUrl) {
      return parseInt(userIdFromUrl)
    }

    // Method 2: From localStorage
    const storedUserId = localStorage.getItem('user_id')
    if (storedUserId) {
      return parseInt(storedUserId)
    }

    // Method 3: From auth token
    const token = localStorage.getItem('auth_token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (payload && payload.user_id) {
          return parseInt(payload.user_id)
        }
      } catch (e) {
        console.warn('Failed to decode token')
      }
    }

    // Method 4: Default user for testing
    return 35 // Default user for testing
  }

  /**
   * Make API request
   */
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }

    const response = await fetch(url, { ...defaultOptions, ...options })
    return response.json()
  }

  /**
   * Get all wishlist items
   */
  async getWishlistItems() {
    const userId = this.getCurrentUserId()
    return this.makeRequest(`/wishlist?user_id=${userId}`)
  }

  /**
   * Add item to wishlist
   */
  async addToWishlist(productData) {
    const userId = this.getCurrentUserId()

    const data = {
      product_id: productData.product_id,
      user_id: userId,
      product_table: productData.product_table || 'products_men',
      color: productData.color || '',
      size: productData.size || ''
    }

    return this.makeRequest('/wishlist/add', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  /**
   * Remove item from wishlist
   */
  async removeFromWishlist(wishlistId) {
    const userId = this.getCurrentUserId()
    return this.makeRequest(`/wishlist/remove/${wishlistId}?user_id=${userId}`, {
      method: 'DELETE'
    })
  }

  /**
   * Check if product is in wishlist
   */
  async checkWishlistStatus(productId) {
    const userId = this.getCurrentUserId()
    return this.makeRequest(`/wishlist/check/${productId}?user_id=${userId}`)
  }

  /**
   * Get wishlist count
   */
  async getWishlistCount() {
    const userId = this.getCurrentUserId()
    return this.makeRequest(`/wishlist/count?user_id=${userId}`)
  }

  /**
   * Clear all wishlist items
   */
  async clearWishlist() {
    const userId = this.getCurrentUserId()
    return this.makeRequest(`/wishlist/clear?user_id=${userId}`, {
      method: 'DELETE'
    })
  }
}

// Export singleton instance
export default new WishlistService()
