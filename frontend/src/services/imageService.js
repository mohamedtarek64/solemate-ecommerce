import api from './api'

export const imageService = {
  // Upload image
  async uploadImage(imageFile, type = 'product') {
    try {
      const formData = new FormData()
      formData.append('image', imageFile)
      formData.append('type', type)

      const response = await api.post('/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload image')
    }
  },

  // Upload multiple images
  async uploadMultipleImages(imageFiles, type = 'product') {
    try {
      const formData = new FormData()
      imageFiles.forEach((file, index) => {
        formData.append(`images[${index}]`, file)
      })
      formData.append('type', type)

      const response = await api.post('/images/upload-multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload images')
    }
  },

  // Delete image
  async deleteImage(imageId) {
    try {
      const response = await api.delete(`/images/${imageId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete image')
    }
  },

  // Get image URL
  getImageUrl(imagePath, size = 'original') {
    if (!imagePath) return null

    if (imagePath.startsWith('http')) {
      return imagePath
    }

    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
    return `${baseUrl}/storage/${imagePath}`
  },

  // Get thumbnail URL
  getThumbnailUrl(imagePath, size = 'medium') {
    if (!imagePath) return null

    if (imagePath.startsWith('http')) {
      return imagePath
    }

    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
    const pathParts = imagePath.split('.')
    const extension = pathParts.pop()
    const nameWithoutExt = pathParts.join('.')

    return `${baseUrl}/storage/${nameWithoutExt}_${size}.${extension}`
  },

  // Resize image
  async resizeImage(imageId, width, height) {
    try {
      const response = await api.post(`/images/${imageId}/resize`, {
        width,
        height
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to resize image')
    }
  },

  // Get image info
  async getImageInfo(imageId) {
    try {
      const response = await api.get(`/images/${imageId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch image info')
    }
  },

  // Get user images
  async getUserImages(params = {}) {
    try {
      const response = await api.get('/images/user', { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user images')
    }
  }
}
