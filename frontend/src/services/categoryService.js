import { categoriesAPI } from './api'

export const categoryService = {
  // Get all categories
  async getCategories(params = {}) {
    try {
      const response = await api.get('/categories', { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch categories')
    }
  },

  // Get single category
  async getCategory(id) {
    try {
      const response = await api.get(`/categories/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch category')
    }
  },

  // Get category products
  async getCategoryProducts(categoryId, params = {}) {
    try {
      const response = await api.get(`/categories/${categoryId}/products`, { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch category products')
    }
  },

  // Get category tree
  async getCategoryTree() {
    try {
      const response = await api.get('/categories/tree')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch category tree')
    }
  }
}