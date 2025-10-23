/**
 * Cart Service
 * Handles all cart-related API calls
 */

import api from './api'

class CartService {
  constructor() {
    this.token = localStorage.getItem('auth_token')
  }

  /**
   * Get cart items
   */
  async getCartItems() {
    try {
      const userId = localStorage.getItem('user_id') || this.getCurrentUserId()
      const response = await api.get(`/cart?user_id=${userId}`)

      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error) {
      console.error('Cart service error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get cart items'
      }
    }
  }

  /**
   * Get current user ID
   */
  getCurrentUserId() {
    const user = localStorage.getItem('user')
    if (user) {
      try {
        const userData = JSON.parse(user)
        return userData.id
      } catch (e) {
        console.error('Error parsing user data:', e)
        return null
      }
    }
    return null
  }

  /**
   * Add item to cart
   */
  async addToCart(productId, quantity = 1, color = null, size = null) {
    try {
      const response = await api.post('/cart/add', {
        product_id: productId,
        quantity,
        color,
        size
      })

      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add to cart'
      }
    }
  }

  /**
   * Update cart item quantity
   */
  async updateQuantity(itemId, quantity) {
    try {
      const userId = parseInt(localStorage.getItem('user_id')) || 18
      const response = await api.put(`/cart/items/${itemId}`, {
        quantity,
        user_id: userId
      })
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update quantity'
      }
    }
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(itemId) {
    try {
      const userId = parseInt(localStorage.getItem('user_id')) || 18
      const response = await api.delete(`/cart/items/${itemId}?user_id=${userId}`)
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to remove from cart'
      }
    }
  }

  /**
   * Clear cart
   */
  async clearCart() {
    try {
      const response = await api.delete('/cart/clear')
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to clear cart'
      }
    }
  }

  /**
   * Get cart count
   */
  async getCartCount() {
    try {
      const response = await api.get('/cart/count')
      return {
        success: true,
        count: response.data.data?.count || response.data.count || 0
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get cart count'
      }
    }
  }

  /**
   * Apply coupon
   */
  async applyCoupon(couponCode) {
    try {
      const response = await api.post('/cart/coupon/apply', { coupon_code: couponCode })
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to apply coupon'
      }
    }
  }

  /**
   * Remove coupon
   */
  async removeCoupon() {
    try {
      const response = await api.delete('/cart/coupon/remove')
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to remove coupon'
      }
    }
  }

  /**
   * Calculate shipping
   */
  async calculateShipping(shippingData) {
    try {
      const response = await api.post('/cart/shipping/calculate', shippingData)
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to calculate shipping'
      }
    }
  }

  /**
   * Get cart summary
   */
  async getCartSummary() {
    try {
      const response = await api.get('/cart/summary')
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get cart summary'
      }
    }
  }

  /**
   * Track cart action for analytics
   */
  async trackCartAction(action, data = {}) {
    try {
      await api.post('/analytics/cart-action', { action, ...data })
    } catch (error) {
      console.warn('Failed to track cart action:', error)
    }
  }
}

// Export singleton instance
export default new CartService()
