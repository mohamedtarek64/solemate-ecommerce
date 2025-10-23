import { orderAPI } from './api'

export const orderService = {
  // Get user orders
  async getUserOrders(params = {}) {
    try {
      const response = await orderAPI.getAll(params)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch orders')
    }
  },

  // Get single order
  async getOrder(orderId) {
    try {
      const response = await orderAPI.getById(orderId)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch order')
    }
  },

  // Create order
  async createOrder(orderData) {
    try {
      const response = await orderAPI.create(orderData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create order')
    }
  },

  // Update order status
  async updateOrderStatus(orderId, status) {
    try {
      const response = await orderAPI.updateStatus(orderId, status)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update order status')
    }
  },

  // Cancel order
  async cancelOrder(orderId) {
    try {
      const response = await orderAPI.cancel(orderId)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to cancel order')
    }
  },

  // Get order tracking
  async getOrderTracking(orderId) {
    try {
      const response = await orderAPI.getTracking(orderId)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get order tracking')
    }
  }
}
  // Get order history
  async getOrderHistory(params = {}) {
    try {
      const response = await ordersAPI.getOrderHistory(params)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch order history')
    }
  }
}