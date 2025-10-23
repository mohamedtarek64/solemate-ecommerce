import api from './api'

export const reviewService = {
  // Get product reviews
  async getProductReviews(productId, params = {}) {
    try {
      const response = await api.get(`/products/${productId}/reviews`, { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch product reviews')
    }
  },

  // Add product review
  async addProductReview(productId, reviewData) {
    try {
      const response = await api.post(`/products/${productId}/reviews`, reviewData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add product review')
    }
  },

  // Update review
  async updateReview(reviewId, reviewData) {
    try {
      const response = await api.put(`/reviews/${reviewId}`, reviewData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update review')
    }
  },

  // Delete review
  async deleteReview(reviewId) {
    try {
      const response = await api.delete(`/reviews/${reviewId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete review')
    }
  },

  // Get user reviews
  async getUserReviews(params = {}) {
    try {
      const response = await api.get('/reviews/user', { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user reviews')
    }
  },

  // Like review
  async likeReview(reviewId) {
    try {
      const response = await api.post(`/reviews/${reviewId}/like`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to like review')
    }
  },

  // Unlike review
  async unlikeReview(reviewId) {
    try {
      const response = await api.delete(`/reviews/${reviewId}/like`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to unlike review')
    }
  },

  // Report review
  async reportReview(reviewId, reason) {
    try {
      const response = await api.post(`/reviews/${reviewId}/report`, { reason })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to report review')
    }
  }
}