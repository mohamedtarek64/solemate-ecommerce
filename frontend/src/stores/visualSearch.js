import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/utils/apiClient'

export const useVisualSearchStore = defineStore('visualSearch', () => {
  // State
  const visualSearches = ref([])
  const currentSearch = ref(null)
  const similarProducts = ref([])
  const imageCategories = ref([])
  const popularSearches = ref([])
  const searchHistory = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const hasSearches = computed(() => visualSearches.value.length > 0)
  const hasCurrentSearch = computed(() => !!currentSearch.value)
  const hasSimilarProducts = computed(() => similarProducts.value.length > 0)
  const hasCategories = computed(() => imageCategories.value.length > 0)
  const hasPopularSearches = computed(() => popularSearches.value.length > 0)
  const hasSearchHistory = computed(() => searchHistory.value.length > 0)

  // Actions
  const performVisualSearch = async (imageFile) => {
    isLoading.value = true
    error.value = null

    try {
      const formData = new FormData()
      formData.append('image', imageFile)

      const response = await apiClient.post('/visual-search/search', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        const searchData = response.data.data
        currentSearch.value = searchData.visual_search
        similarProducts.value = searchData.similar_products || []
        
        // Add to search history
        addToSearchHistory(searchData.visual_search)
        
        return {
          success: true,
          data: searchData
        }
      } else {
        throw new Error(response.data.error || 'Visual search failed')
      }
    } catch (err) {
      error.value = err.response?.data?.error || err.message || 'Visual search failed'
      return {
        success: false,
        error: error.value
      }
    } finally {
      isLoading.value = false
    }
  }

  const getVisualSearchResults = async (searchId) => {
    try {
      const response = await apiClient.get(`/visual-search/results/${searchId}`)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        throw new Error(response.data.error || 'Failed to get search results')
      }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Failed to get search results'
      }
    }
  }

  const getSimilarProducts = async (productId, limit = 10) => {
    try {
      const response = await apiClient.get(`/visual-search/similar-products/${productId}`, {
        params: { limit }
      })
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        throw new Error(response.data.error || 'Failed to get similar products')
      }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Failed to get similar products'
      }
    }
  }

  const getVisualSearchHistory = async (limit = 20) => {
    try {
      const response = await apiClient.get('/visual-search/history', {
        params: { limit }
      })
      
      if (response.data.success) {
        searchHistory.value = response.data.data.searches || []
        return {
          success: true,
          data: response.data.data
        }
      } else {
        throw new Error(response.data.error || 'Failed to get search history')
      }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Failed to get search history'
      }
    }
  }

  const getPopularSearches = async (limit = 10) => {
    try {
      const response = await apiClient.get('/visual-search/popular-searches', {
        params: { limit }
      })
      
      if (response.data.success) {
        popularSearches.value = response.data.data.popular_searches || []
        return {
          success: true,
          data: response.data.data
        }
      } else {
        throw new Error(response.data.error || 'Failed to get popular searches')
      }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Failed to get popular searches'
      }
    }
  }

  const getImageCategories = async () => {
    try {
      const response = await apiClient.get('/visual-search/categories')
      
      if (response.data.success) {
        imageCategories.value = response.data.data.categories || []
        return {
          success: true,
          data: response.data.data
        }
      } else {
        throw new Error(response.data.error || 'Failed to get image categories')
      }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Failed to get image categories'
      }
    }
  }

  const getVisualSearchAnalytics = async (days = 30) => {
    try {
      const response = await apiClient.get('/visual-search/analytics', {
        params: { days }
      })
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        throw new Error(response.data.error || 'Failed to get analytics')
      }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Failed to get analytics'
      }
    }
  }

  const deleteVisualSearch = async (searchId) => {
    try {
      const response = await apiClient.delete(`/visual-search/search/${searchId}`)
      
      if (response.data.success) {
        // Remove from local state
        visualSearches.value = visualSearches.value.filter(search => search.id !== searchId)
        searchHistory.value = searchHistory.value.filter(search => search.id !== searchId)
        
        return {
          success: true,
          message: response.data.message
        }
      } else {
        throw new Error(response.data.error || 'Failed to delete search')
      }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Failed to delete search'
      }
    }
  }

  const saveSearch = async (searchData) => {
    try {
      const response = await apiClient.post('/search/save', searchData)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        throw new Error(response.data.error || 'Failed to save search')
      }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Failed to save search'
      }
    }
  }

  const processProductVisualFeatures = async (productId) => {
    try {
      const response = await apiClient.post(`/visual-search/products/${productId}/process-features`)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        throw new Error(response.data.error || 'Failed to process product features')
      }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Failed to process product features'
      }
    }
  }

  const batchProcessProductFeatures = async (limit = 100) => {
    try {
      const response = await apiClient.post('/visual-search/products/batch-process-features', {
        limit
      })
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        throw new Error(response.data.error || 'Failed to batch process features')
      }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Failed to batch process features'
      }
    }
  }

  const getVisualSearchStatistics = async () => {
    try {
      const response = await apiClient.get('/visual-search/statistics')
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        throw new Error(response.data.error || 'Failed to get statistics')
      }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Failed to get statistics'
      }
    }
  }

  const createImageCategory = async (categoryData) => {
    try {
      const response = await apiClient.post('/visual-search/categories', categoryData)
      
      if (response.data.success) {
        imageCategories.value.push(response.data.data.category)
        return {
          success: true,
          data: response.data.data
        }
      } else {
        throw new Error(response.data.error || 'Failed to create category')
      }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Failed to create category'
      }
    }
  }

  const updateImageCategory = async (categoryId, categoryData) => {
    try {
      const response = await apiClient.put(`/visual-search/categories/${categoryId}`, categoryData)
      
      if (response.data.success) {
        const index = imageCategories.value.findIndex(cat => cat.id === categoryId)
        if (index !== -1) {
          imageCategories.value[index] = response.data.data.category
        }
        return {
          success: true,
          data: response.data.data
        }
      } else {
        throw new Error(response.data.error || 'Failed to update category')
      }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Failed to update category'
      }
    }
  }

  const deleteImageCategory = async (categoryId) => {
    try {
      const response = await apiClient.delete(`/visual-search/categories/${categoryId}`)
      
      if (response.data.success) {
        imageCategories.value = imageCategories.value.filter(cat => cat.id !== categoryId)
        return {
          success: true,
          message: response.data.message
        }
      } else {
        throw new Error(response.data.error || 'Failed to delete category')
      }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Failed to delete category'
      }
    }
  }

  const addToSearchHistory = (search) => {
    // Remove if already exists
    searchHistory.value = searchHistory.value.filter(item => item.id !== search.id)
    
    // Add to beginning
    searchHistory.value.unshift(search)
    
    // Keep only last 20 searches
    searchHistory.value = searchHistory.value.slice(0, 20)
    
    // Save to localStorage
    localStorage.setItem('visual_search_history', JSON.stringify(searchHistory.value))
  }

  const getSearchHistory = () => {
    try {
      const stored = localStorage.getItem('visual_search_history')
      if (stored) {
        searchHistory.value = JSON.parse(stored)
      }
    } catch (err) {
      console.error('Error loading visual search history:', err)
    }
  }

  const clearSearchHistory = () => {
    searchHistory.value = []
    localStorage.removeItem('visual_search_history')
  }

  const clearCurrentSearch = () => {
    currentSearch.value = null
    similarProducts.value = []
  }

  const clearError = () => {
    error.value = null
  }

  const resetStore = () => {
    visualSearches.value = []
    currentSearch.value = null
    similarProducts.value = []
    imageCategories.value = []
    popularSearches.value = []
    searchHistory.value = []
    isLoading.value = false
    error.value = null
  }

  // Initialize search history on store creation
  getSearchHistory()

  return {
    // State
    visualSearches,
    currentSearch,
    similarProducts,
    imageCategories,
    popularSearches,
    searchHistory,
    isLoading,
    error,

    // Getters
    hasSearches,
    hasCurrentSearch,
    hasSimilarProducts,
    hasCategories,
    hasPopularSearches,
    hasSearchHistory,

    // Actions
    performVisualSearch,
    getVisualSearchResults,
    getSimilarProducts,
    getVisualSearchHistory,
    getPopularSearches,
    getImageCategories,
    getVisualSearchAnalytics,
    deleteVisualSearch,
    saveSearch,
    processProductVisualFeatures,
    batchProcessProductFeatures,
    getVisualSearchStatistics,
    createImageCategory,
    updateImageCategory,
    deleteImageCategory,
    addToSearchHistory,
    getSearchHistory,
    clearSearchHistory,
    clearCurrentSearch,
    clearError,
    resetStore
  }
})
