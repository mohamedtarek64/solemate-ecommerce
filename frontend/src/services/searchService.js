import api from './api'

const searchService = {
  // Global search
  async search(query, params = {}) {
    try {
      const response = await api.get('/search', {
        params: { q: query, ...params }
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Search failed')
    }
  },

  // Search products
  async searchProducts(query, params = {}) {
    try {
      const response = await api.get('/search/products', {
        params: { q: query, ...params }
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Product search failed')
    }
  },

  // Get search suggestions
  async getSuggestions(query) {
    try {
      const response = await api.get('/search/suggestions', {
        params: { q: query }
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch suggestions')
    }
  },

  // Get trending searches
  async getTrending() {
    try {
      const response = await api.get('/search/trending')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch trending searches')
    }
  },

  // Get popular searches
  async getPopular() {
    try {
      const response = await api.get('/search/popular')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch popular searches')
    }
  },

  // Visual search
  async visualSearch(imageFile, options = {}) {
    try {
      const formData = new FormData()
      formData.append('image', imageFile)

      Object.keys(options).forEach(key => {
        formData.append(key, options[key])
      })

      const response = await api.post('/search/visual', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Visual search failed')
    }
  },

  // Advanced search with filters
  async advancedSearch(params = {}) {
    try {
      const response = await api.get('/search/advanced', { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Advanced search failed')
    }
  },

  // Save search query
  async saveSearch(query, filters = {}) {
    try {
      const response = await api.post('/search/save', {
        query,
        filters
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to save search')
    }
  },

  // Get saved searches
  async getSavedSearches() {
    try {
      const response = await api.get('/search/saved')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch saved searches')
    }
  },

  // Delete saved search
  async deleteSavedSearch(id) {
    try {
      const response = await api.delete(`/search/saved/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete saved search')
    }
  },

  // Track search
  async trackSearch(query, filters = {}, results = 0) {
    try {
      const response = await api.post('/analytics/search', {
        query,
        filters,
        results_count: results
      })
      return response.data
    } catch (error) {
      // Don't throw error for tracking failures
      console.warn('Failed to track search:', error)
    }
  }
}

export default searchService
