import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/services/api'

export const useSearchStore = defineStore('search', () => {
  // State
  const searchResults = ref({
    products: [],
    total: 0,
    current_page: 1,
    per_page: 20,
    last_page: 1,
    suggestions: [],
    popular_searches: [],
    filters: [],
    applied_filters: {}
  })

  const savedSearches = ref([])
  const searchHistory = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const hasResults = computed(() => searchResults.value.products.length > 0)
  const totalResults = computed(() => searchResults.value.total)
  const currentPage = computed(() => searchResults.value.current_page)
  const lastPage = computed(() => searchResults.value.last_page)
  const hasNextPage = computed(() => currentPage.value < lastPage.value)
  const hasPreviousPage = computed(() => currentPage.value > 1)

  // Actions
  const search = async (params) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.get('/search', { params })
      searchResults.value = response.data

      // Add to search history
      if (params.q) {
        addToSearchHistory(params.q)
      }

      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Search failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getSuggestions = async (query, limit = 10) => {
    try {
      const response = await api.get('/search/suggestions', {
        params: { q: query, limit }
      })
      return response.data
    } catch (err) {
      console.error('Error getting suggestions:', err)
      return []
    }
  }

  const getPopularSearches = async (days = 7, limit = 10) => {
    try {
      const response = await api.get('/search/popular', {
        params: { days, limit }
      })
      return response.data
    } catch (err) {
      console.error('Error getting popular searches:', err)
      return []
    }
  }

  const getTrendingSearches = async (hours = 24, limit = 10) => {
    try {
      const response = await api.get('/search/trending', {
        params: { hours, limit }
      })
      return response.data
    } catch (err) {
      console.error('Error getting trending searches:', err)
      return []
    }
  }

  const saveSearch = async (searchData) => {
    try {
      const response = await api.post('/search/save', searchData)
      const savedSearch = response.data.saved_search
      
      // Add to local saved searches
      savedSearches.value.unshift(savedSearch)
      
      return savedSearch
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to save search'
      throw err
    }
  }

  const getSavedSearches = async () => {
    try {
      const response = await api.get('/search/saved')
      savedSearches.value = response.data
      return response.data
    } catch (err) {
      console.error('Error getting saved searches:', err)
      return []
    }
  }

  const getPublicSavedSearches = async (limit = 20) => {
    try {
      const response = await api.get('/search/saved/public', {
        params: { limit }
      })
      return response.data
    } catch (err) {
      console.error('Error getting public saved searches:', err)
      return []
    }
  }

  const deleteSavedSearch = async (savedSearchId) => {
    try {
      await api.delete(`/search/saved/${savedSearchId}`)
      
      // Remove from local saved searches
      savedSearches.value = savedSearches.value.filter(
        search => search.id !== savedSearchId
      )
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete saved search'
      throw err
    }
  }

  const useSavedSearch = async (savedSearchId) => {
    try {
      const response = await api.post(`/search/saved/${savedSearchId}/use`)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to use saved search'
      throw err
    }
  }

  const getSearchAnalytics = async (days = 30) => {
    try {
      const response = await api.get('/search/analytics', {
        params: { days }
      })
      return response.data
    } catch (err) {
      console.error('Error getting search analytics:', err)
      return null
    }
  }

  const reindexProducts = async () => {
    try {
      const response = await api.post('/search/reindex')
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to reindex products'
      throw err
    }
  }

  const addToSearchHistory = (query) => {
    // Remove if already exists
    searchHistory.value = searchHistory.value.filter(item => item !== query)
    
    // Add to beginning
    searchHistory.value.unshift(query)
    
    // Keep only last 10 searches
    searchHistory.value = searchHistory.value.slice(0, 10)
    
    // Save to localStorage
    localStorage.setItem('search_history', JSON.stringify(searchHistory.value))
  }

  const getSearchHistory = () => {
    try {
      const stored = localStorage.getItem('search_history')
      if (stored) {
        searchHistory.value = JSON.parse(stored)
      }
    } catch (err) {
      console.error('Error loading search history:', err)
    }
  }

  const clearSearchHistory = () => {
    searchHistory.value = []
    localStorage.removeItem('search_history')
  }

  const clearError = () => {
    error.value = null
  }

  const resetSearchResults = () => {
    searchResults.value = {
      products: [],
      total: 0,
      current_page: 1,
      per_page: 20,
      last_page: 1,
      suggestions: [],
      popular_searches: [],
      filters: [],
      applied_filters: {}
    }
  }

  // Initialize search history on store creation
  getSearchHistory()

  return {
    // State
    searchResults,
    savedSearches,
    searchHistory,
    isLoading,
    error,

    // Getters
    hasResults,
    totalResults,
    currentPage,
    lastPage,
    hasNextPage,
    hasPreviousPage,

    // Actions
    search,
    getSuggestions,
    getPopularSearches,
    getTrendingSearches,
    saveSearch,
    getSavedSearches,
    getPublicSavedSearches,
    deleteSavedSearch,
    useSavedSearch,
    getSearchAnalytics,
    reindexProducts,
    addToSearchHistory,
    getSearchHistory,
    clearSearchHistory,
    clearError,
    resetSearchResults
  }
})
