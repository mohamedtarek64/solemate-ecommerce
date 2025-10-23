/**
 * useSearch Composable
 * Provides search functionality and state management
 */

import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  searchProducts,
  getSearchSuggestions,
  getPopularSearches,
  saveSearchHistory
} from '@/services/search/searchService'

export function useSearch() {
  const router = useRouter()

  // State
  const searchQuery = ref('')
  const suggestions = ref([])
  const popularSearches = ref([])
  const searchResults = ref([])
  const loading = ref(false)
  const error = ref(null)
  const showSuggestions = ref(false)
  const selectedIndex = ref(-1)

  // Computed
  const hasResults = computed(() => searchResults.value.length > 0)
  const totalResults = computed(() => searchResults.value.length)

  // Debounce timer
  let debounceTimer = null

  /**
   * Fetch suggestions with debounce
   */
  const fetchSuggestions = async (query) => {
    if (query.length < 1) {
      suggestions.value = []
      return
    }

    loading.value = true
    error.value = null

    try {
      const data = await getSearchSuggestions(query)
      suggestions.value = data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching suggestions:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Handle input with debounce
   */
  const handleInput = (query) => {
    searchQuery.value = query
    clearTimeout(debounceTimer)
    selectedIndex.value = -1

    debounceTimer = setTimeout(() => {
      fetchSuggestions(query)
    }, 300)
  }

  /**
   * Fetch popular searches
   */
  const fetchPopularSearches = async () => {
    try {
      const data = await getPopularSearches()
      popularSearches.value = data.slice(0, 5)
    } catch (err) {
      console.error('Error fetching popular searches:', err)
    }
  }

  /**
   * Perform search
   */
  const performSearch = async (params = {}) => {
    const query = params.query || searchQuery.value

    if (!query || !query.trim()) {
      return
    }

    loading.value = true
    error.value = null

    try {
      const data = await searchProducts({
        query,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        brand: params.brand,
        category: params.category,
        sort: params.sort,
        limit: params.limit
      })

      if (data.success) {
        searchResults.value = data.data.products
        saveSearchHistory(query)
      } else {
        throw new Error(data.message || 'Search failed')
      }
    } catch (err) {
      error.value = err.message
      console.error('Search error:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Navigate to search results page
   */
  const navigateToSearch = (query = null) => {
    const searchTerm = query || searchQuery.value

    if (!searchTerm || !searchTerm.trim()) {
      return
    }

    router.push({
      path: '/search',
      query: { q: searchTerm }
    })

    saveSearchHistory(searchTerm)
    closeSuggestions()
  }

  /**
   * Navigate through suggestions with keyboard
   */
  const navigateSuggestions = (direction) => {
    if (suggestions.value.length === 0) return

    selectedIndex.value += direction

    if (selectedIndex.value < 0) {
      selectedIndex.value = suggestions.value.length - 1
    } else if (selectedIndex.value >= suggestions.value.length) {
      selectedIndex.value = 0
    }
  }

  /**
   * Select a suggestion - Navigate to product detail or search
   */
  const selectSuggestion = (suggestion) => {
    // If suggestion has product ID, go to product detail
    if (suggestion.id && suggestion.table_source) {
      router.push(`/products/${suggestion.id}`)
      closeSuggestions()
    } else {
      // Otherwise, perform search
      searchQuery.value = suggestion.name
      navigateToSearch(suggestion.name)
    }
  }

  /**
   * Clear search
   */
  const clearSearch = () => {
    searchQuery.value = ''
    suggestions.value = []
    searchResults.value = []
    selectedIndex.value = -1
    error.value = null
  }

  /**
   * Close suggestions
   */
  const closeSuggestions = () => {
    showSuggestions.value = false
    selectedIndex.value = -1
  }

  /**
   * Open suggestions
   */
  const openSuggestions = () => {
    showSuggestions.value = true
  }

  /**
   * Cleanup
   */
  const cleanup = () => {
    clearTimeout(debounceTimer)
  }

  return {
    // State
    searchQuery,
    suggestions,
    popularSearches,
    searchResults,
    loading,
    error,
    showSuggestions,
    selectedIndex,

    // Computed
    hasResults,
    totalResults,

    // Methods
    handleInput,
    fetchSuggestions,
    fetchPopularSearches,
    performSearch,
    navigateToSearch,
    navigateSuggestions,
    selectSuggestion,
    clearSearch,
    closeSuggestions,
    openSuggestions,
    cleanup
  }
}

export default useSearch
