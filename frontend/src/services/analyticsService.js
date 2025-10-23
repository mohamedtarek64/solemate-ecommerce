import { analyticsAPI } from './api'

const analyticsService = {
  // Track page view
  async trackPageView(data) {
    try {
      const response = await api.post('/analytics/page-view', data)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to track page view')
    }
  },

  // Track product view
  async trackProductView(productId) {
    try {
      const response = await api.post('/analytics/product-view', { product_id: productId })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to track product view')
    }
  },

  // Track search
  async trackSearch(query) {
    try {
      const response = await api.post('/analytics/search', { query })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to track search')
    }
  },

  // Track cart action
  async trackCartAction(action, data) {
    try {
      const response = await api.post('/analytics/cart-action', { action, ...data })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to track cart action')
    }
  },

  // Track purchase
  async trackPurchase(orderData) {
    try {
      const response = await api.post('/analytics/purchase', orderData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to track purchase')
    }
  },

  // Get analytics data
  async getAnalytics(params = {}) {
    try {
      const response = await api.get('/analytics', { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch analytics')
    }
  },

  // Get dashboard data
  async getDashboardData() {
    try {
      const response = await api.get('/analytics/dashboard')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard data')
    }
  },

  // Get reports
  async getReports(params = {}) {
    try {
      const response = await api.get('/analytics/reports', { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch reports')
    }
  }
}

export default analyticsService
