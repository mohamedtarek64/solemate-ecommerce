import api from './api'

export const visualSearchService = {
  // Upload image for visual search
  async uploadImage(file) {
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const response = await api.post('/search/visual/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload image')
    }
  },

  // Search by image URL
  async searchByUrl(imageUrl) {
    try {
      const response = await api.post('/search/visual/url', { image_url: imageUrl })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to search by image URL')
    }
  },

  // Search by camera capture
  async searchByCamera(imageData) {
    try {
      const response = await api.post('/search/visual/camera', { image_data: imageData })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to search by camera')
    }
  },

  // Get visual search history
  async getSearchHistory() {
    try {
      const response = await api.get('/search/visual/history')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get search history')
    }
  },

  // Save visual search result
  async saveSearchResult(searchId, productId) {
    try {
      const response = await api.post('/search/visual/save', { 
        search_id: searchId, 
        product_id: productId 
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to save search result')
    }
  }
}