import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import imageService from '../services/imageService'
import { handleApiError, logError, safeAsync } from '../utils/errorHandler'

export const useImageStore = defineStore('image', () => {
  // State
  const images = ref({})
  const loading = ref(false)
  const error = ref(null)
  const uploadProgress = ref(0)

  // Getters
  const getImagesByCategory = (category) => {
    return images.value[category] || []
  }

  const getImageById = (id) => {
    for (const categoryImages of Object.values(images.value)) {
      const image = categoryImages.find(img => img.id === id)
      if (image) return image
    }
    return null
  }

  const getPrimaryImage = (category) => {
    const categoryImages = images.value[category] || []
    return categoryImages.find(img => img.is_primary) || categoryImages[0] || null
  }

  // Actions
  const fetchImagesByCategory = async (category, params = {}) => {
    loading.value = true
    error.value = null

    const { data, error: fetchError } = await safeAsync(
      () => imageService.getImagesByCategory(category, params),
      `fetchImagesByCategory-${category}`,
      `Failed to fetch ${category} images`
    )

    if (fetchError) {
      error.value = fetchError
      console.error(`Failed to fetch ${category} images:`, fetchError)
      
      // Use mock data when API fails
      const mockImages = getMockImagesForCategory(category)
      images.value[category] = mockImages
      } else {
      // Handle different response formats
      let imageData = null
      if (data.data && Array.isArray(data.data)) {
        imageData = data.data
      } else if (Array.isArray(data)) {
        imageData = data
      } else if (data.data && Array.isArray(data.data.data)) {
        imageData = data.data.data
      }
      
      if (imageData && Array.isArray(imageData)) {
        images.value[category] = imageData
        } else {
        console.error(`Invalid image data format for ${category}:`, data)
        // Use mock data when response format is invalid
        const mockImages = getMockImagesForCategory(category)
        images.value[category] = mockImages
        }
    }

    loading.value = false
  }

  const uploadImage = async (file, options = {}) => {
    loading.value = true
    error.value = null
    uploadProgress.value = 0

    try {
      // Validate file
      const validation = imageService.validateImageFile(file)
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }

      const result = await imageService.uploadImage(file, options)
      
      // Add to local state
      const category = options.category || 'general'
      if (!images.value[category]) {
        images.value[category] = []
      }
      images.value[category].push(result.data)

      uploadProgress.value = 100
      return result.data
    } catch (err) {
      const errorMessage = handleApiError(err, 'Failed to upload image')
      error.value = errorMessage
      logError(err, 'uploadImage')
      throw err
    } finally {
      loading.value = false
    }
  }

  const bulkUploadImages = async (files, options = {}) => {
    loading.value = true
    error.value = null
    uploadProgress.value = 0

    try {
      // Validate all files
      const validationErrors = []
      files.forEach((file, index) => {
        const validation = imageService.validateImageFile(file)
        if (!validation.isValid) {
          validationErrors.push(`File ${index + 1}: ${validation.errors.join(', ')}`)
        }
      })

      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join('; '))
      }

      const result = await imageService.bulkUploadImages(files, options)
      
      // Add to local state
      const category = options.category || 'general'
      if (!images.value[category]) {
        images.value[category] = []
      }
      images.value[category].push(...result.data)

      uploadProgress.value = 100
      return result.data
    } catch (err) {
      const errorMessage = handleApiError(err, 'Failed to upload images')
      error.value = errorMessage
      logError(err, 'bulkUploadImages')
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateImage = async (id, data) => {
    loading.value = true
    error.value = null

    const { data: result, error: updateError } = await safeAsync(
      () => imageService.updateImage(id, data),
      `updateImage-${id}`,
      'Failed to update image'
    )

    if (updateError) {
      error.value = updateError
      logError(new Error(updateError), `updateImage-${id}`)
    } else {
      // Update local state
      for (const categoryImages of Object.values(images.value)) {
        const index = categoryImages.findIndex(img => img.id === id)
        if (index !== -1) {
          categoryImages[index] = { ...categoryImages[index], ...result.data }
          break
        }
      }
    }

    loading.value = false
  }

  const deleteImage = async (id) => {
    loading.value = true
    error.value = null

    const { data, error: deleteError } = await safeAsync(
      () => imageService.deleteImage(id),
      `deleteImage-${id}`,
      'Failed to delete image'
    )

    if (deleteError) {
      error.value = deleteError
      logError(new Error(deleteError), `deleteImage-${id}`)
    } else {
      // Remove from local state
      for (const categoryImages of Object.values(images.value)) {
        const index = categoryImages.findIndex(img => img.id === id)
        if (index !== -1) {
          categoryImages.splice(index, 1)
          break
        }
      }
    }

    loading.value = false
  }

  const getOptimizedImageUrl = (imageUrl, options = {}) => {
    return imageService.getOptimizedImageUrl(imageUrl, options)
  }

  const getResponsiveImageUrls = (imageUrl, breakpoints = {}) => {
    return imageService.getResponsiveImageUrls(imageUrl, breakpoints)
  }

  const generateSrcset = (imageUrl, widths = [400, 800, 1200, 1600]) => {
    return imageService.generateSrcset(imageUrl, widths)
  }

  const preloadImages = async (imageUrls) => {
    try {
      await imageService.preloadImages(imageUrls)
    } catch (error) {
      console.warn('Failed to preload images:', error)
    }
  }

  const getPlaceholderUrl = (type = 'product') => {
    return imageService.getPlaceholderUrl(type)
  }

  const clearImages = (category = null) => {
    if (category) {
      delete images.value[category]
    } else {
      images.value = {}
    }
  }

  const clearError = () => {
    error.value = null
  }

  const setUploadProgress = (progress) => {
    uploadProgress.value = progress
  }

  return {
    // State
    images,
    loading,
    error,
    uploadProgress,

    // Getters
    getImagesByCategory,
    getImageById,
    getPrimaryImage,

    // Actions
    fetchImagesByCategory,
    uploadImage,
    bulkUploadImages,
    updateImage,
    deleteImage,
    getOptimizedImageUrl,
    getResponsiveImageUrls,
    generateSrcset,
    preloadImages,
    getPlaceholderUrl,
    clearImages,
    clearError,
    setUploadProgress
  }
})

// Mock data function
function getMockImagesForCategory(category) {
  const mockImages = {
    hero: [
      {
        id: 1,
        url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop',
        alt: 'Hero Image 1',
        title: 'Welcome to Our Store',
        description: 'Discover amazing products',
        is_primary: true,
        category: 'hero'
      },
      {
        id: 2,
        url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=600&fit=crop',
        alt: 'Hero Image 2',
        title: 'Quality Products',
        description: 'Best quality guaranteed',
        is_primary: false,
        category: 'hero'
      },
      {
        id: 3,
        url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=600&fit=crop',
        alt: 'Hero Image 3',
        title: 'Fast Delivery',
        description: 'Quick and reliable shipping',
        is_primary: false,
        category: 'hero'
      }
    ],
    products: [
      {
        id: 4,
        url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
        alt: 'Product 1',
        title: 'Wireless Headphones',
        description: 'High quality wireless headphones',
        is_primary: true,
        category: 'products'
      },
      {
        id: 5,
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
        alt: 'Product 2',
        title: 'Smart Watch',
        description: 'Advanced smart watch',
        is_primary: true,
        category: 'products'
      }
    ],
    categories: [
      {
        id: 6,
        url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop',
        alt: 'Electronics',
        title: 'Electronics',
        description: 'Latest electronic devices',
        is_primary: true,
        category: 'categories'
      },
      {
        id: 7,
        url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop',
        alt: 'Fashion',
        title: 'Fashion',
        description: 'Trendy fashion items',
        is_primary: true,
        category: 'categories'
      }
    ],
    collections: [
      {
        id: 8,
        url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop',
        alt: 'Summer Collection',
        title: 'Summer Collection',
        description: 'Fresh summer styles',
        is_primary: true,
        category: 'collections'
      }
    ]
  }

  return mockImages[category] || []
}
