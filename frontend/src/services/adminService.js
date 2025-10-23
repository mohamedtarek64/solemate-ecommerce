import api from './api'

const adminService = {
   // Dashboard stats
  async getDashboardStats() {
    try {
      const response = await api.get('/admin/dashboard')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard stats')
    }
  },

  // Users management
  async getUsers(params = {}) {
    try {
      const response = await api.get('/admin/users', { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users')
    }
  },

  async getUser(id) {
    try {
      const response = await api.get(`/admin/users/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user')
    }
  },

  async updateUser(id, data) {
    try {
      const response = await api.put(`/admin/users/${id}`, data)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user')
    }
  },

  async deleteUser(id) {
    try {
      const response = await api.delete(`/admin/users/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete user')
    }
  },

  // Orders management
  async getOrders(params = {}) {
    try {
      const response = await api.get('/admin/orders', { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch orders')
    }
  },

  async getOrder(id) {
    try {
      const response = await api.get(`/admin/orders/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch order')
    }
  },

  async updateOrderStatus(id, status) {
    try {
      const response = await api.put(`/admin/orders/${id}/status`, { status })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update order status')
    }
  },

  // Products management
  async getProducts(params = {}) {
    try {
      const response = await api.get('/admin/products', { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch products')
    }
  },

  async getProduct(id) {
    try {
      const response = await api.get(`/admin/products/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch product')
    }
  },

  async createProduct(data) {
    try {
      const response = await api.post('/admin/products', data)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create product')
    }
  },

  async updateProduct(id, data) {
    try {
      const response = await api.put(`/admin/products/${id}`, data)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update product')
    }
  },

  async deleteProduct(id) {
    try {
      const response = await api.delete(`/admin/products/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete product')
    }
  },

  // Categories management
  async getCategories() {
    try {
      const response = await api.get('/admin/categories')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch categories')
    }
  },

  async createCategory(data) {
    try {
      const response = await api.post('/admin/categories', data)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create category')
    }
  },

  async updateCategory(id, data) {
    try {
      const response = await api.put(`/admin/categories/${id}`, data)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update category')
    }
  },

  async deleteCategory(id) {
    try {
      const response = await api.delete(`/admin/categories/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete category')
    }
  },

  // Analytics
  async getAnalytics(params = {}) {
    try {
      const response = await api.get('/admin/analytics', { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch analytics')
    }
  },

  // Settings
  async getSettings() {
    try {
      const response = await api.get('/admin/settings')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch settings')
    }
  },

  async updateSettings(settings) {
    try {
      const response = await api.put('/admin/settings', settings)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update settings')
    }
  }
}

export default adminService
