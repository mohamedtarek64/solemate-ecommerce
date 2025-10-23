import { ref, computed, watch } from 'vue'

export function useSearch() {
  // State
  const searchQuery = ref('')
  const searchResults = ref([])
  const loading = ref(false)
  const error = ref(null)
  const suggestions = ref([])
  const filters = ref({})
  const pagination = ref({})
  const searchMeta = ref({})

  // Filter state
  const activeFilters = ref({
    category: null,
    brand: null,
    min_price: null,
    max_price: null,
    size: null,
    color: null,
    sort: 'popular',
    in_stock: null,
    on_sale: null,
    featured: null
  })

  // Pagination state
  const currentPage = ref(1)
  const perPage = ref(12)

  // Computed properties
  const hasResults = computed(() => searchResults.value.length > 0)
  const hasFilters = computed(() => {
    return Object.values(activeFilters.value).some(value =>
      value !== null && value !== '' && value !== 'popular'
    )
  })
  const totalPages = computed(() => pagination.value.last_page || 1)
  const hasMorePages = computed(() => pagination.value.has_more || false)

  // Helper function to get token
  const getToken = () => {
    return localStorage.getItem('auth_token') || localStorage.getItem('token') || sessionStorage.getItem('token')
  }

  // Helper function to get API headers
  const getApiHeaders = () => {
    const token = getToken()
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  // Build search URL with parameters
  const buildSearchUrl = (baseUrl, params) => {
    const url = new URL(baseUrl, window.location.origin)

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== '' && value !== undefined) {
        url.searchParams.append(key, value)
      }
    })

    return url.toString()
  }

  // Perform search
  const search = async (query = null, customFilters = {}) => {
    loading.value = true
    error.value = null

    try {
      const searchParams = {
        q: query || searchQuery.value,
        page: currentPage.value,
        per_page: perPage.value,
        ...activeFilters.value,
        ...customFilters
      }

      const url = buildSearchUrl('http://127.0.0.1:8000/api/search', searchParams)

      const response = await fetch(url, {
        method: 'GET',
        headers: getApiHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        searchResults.value = data.data.products || []
        pagination.value = data.data.pagination || {}
        filters.value = data.data.filters || {}
        searchMeta.value = data.data.search_meta || {}

        // Update suggestions if available
        if (data.data.suggestions) {
          suggestions.value = data.data.suggestions
        }
      } else {
        throw new Error(data.message || 'Search failed')
      }
    } catch (err) {
      console.error('Search error:', err)
      error.value = err.message
      searchResults.value = []
    } finally {
      loading.value = false
    }
  }

  // Get search suggestions
  const getSuggestions = async (query, category = null) => {
    if (!query || query.length < 2) {
      suggestions.value = []
      return
    }

    try {
      const params = { q: query }
      if (category) params.category = category

      const url = buildSearchUrl('http://127.0.0.1:8000/api/search/suggestions', params)

      const response = await fetch(url, {
        method: 'GET',
        headers: getApiHeaders()
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          suggestions.value = data.data.suggestions || []
        }
      }
    } catch (err) {
      console.error('Suggestions error:', err)
    }
  }

  // Get filter options
  const getFilters = async (category = null) => {
    try {
      const params = {}
      if (category) params.category = category

      const url = buildSearchUrl('http://127.0.0.1:8000/api/search/filters', params)

      const response = await fetch(url, {
        method: 'GET',
        headers: getApiHeaders()
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          filters.value = data.data
        }
      }
    } catch (err) {
      console.error('Filters error:', err)
    }
  }

  // Get trending searches
  const getTrending = async (category = null) => {
    try {
      const params = {}
      if (category) params.category = category

      const url = buildSearchUrl('http://127.0.0.1:8000/api/search/trending', params)

      const response = await fetch(url, {
        method: 'GET',
        headers: getApiHeaders()
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          return data.data
        }
      }
    } catch (err) {
      console.error('Trending error:', err)
    }
    return null
  }

  // Apply filter
  const applyFilter = (key, value) => {
    activeFilters.value[key] = value
    currentPage.value = 1 // Reset to first page
    search()
  }

  // Remove filter
  const removeFilter = (key) => {
    activeFilters.value[key] = null
    currentPage.value = 1 // Reset to first page
    search()
  }

  // Clear all filters
  const clearFilters = () => {
    activeFilters.value = {
      category: null,
      brand: null,
      min_price: null,
      max_price: null,
      size: null,
      color: null,
      sort: 'popular',
      in_stock: null,
      on_sale: null,
      featured: null
    }
    currentPage.value = 1
    search()
  }

  // Set search query
  const setSearchQuery = (query) => {
    searchQuery.value = query
    currentPage.value = 1
  }

  // Go to page
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
      search()
    }
  }

  // Next page
  const nextPage = () => {
    if (hasMorePages.value) {
      goToPage(currentPage.value + 1)
    }
  }

  // Previous page
  const previousPage = () => {
    if (currentPage.value > 1) {
      goToPage(currentPage.value - 1)
    }
  }

  // Sort results
  const sortResults = (sortBy) => {
    activeFilters.value.sort = sortBy
    currentPage.value = 1
    search()
  }

  // Price range filter
  const setPriceRange = (min, max) => {
    activeFilters.value.min_price = min
    activeFilters.value.max_price = max
    currentPage.value = 1
    search()
  }

  // Category filter
  const setCategory = (category) => {
    activeFilters.value.category = category
    currentPage.value = 1
    search()
  }

  // Brand filter
  const setBrand = (brand) => {
    activeFilters.value.brand = brand
    currentPage.value = 1
    search()
  }

  // Size filter
  const setSize = (size) => {
    activeFilters.value.size = size
    currentPage.value = 1
    search()
  }

  // Color filter
  const setColor = (color) => {
    activeFilters.value.color = color
    currentPage.value = 1
    search()
  }

  // Stock filter
  const setStockFilter = (inStock) => {
    activeFilters.value.in_stock = inStock
    currentPage.value = 1
    search()
  }

  // Sale filter
  const setSaleFilter = (onSale) => {
    activeFilters.value.on_sale = onSale
    currentPage.value = 1
    search()
  }

  // Featured filter
  const setFeaturedFilter = (featured) => {
    activeFilters.value.featured = featured
    currentPage.value = 1
    search()
  }

  // Clear search
  const clearSearch = () => {
    searchQuery.value = ''
    searchResults.value = []
    suggestions.value = []
    error.value = null
    currentPage.value = 1
    clearFilters()
  }

  // Reset pagination
  const resetPagination = () => {
    currentPage.value = 1
  }

  // Watch for search query changes
  watch(searchQuery, (newQuery) => {
    if (newQuery && newQuery.length >= 2) {
      getSuggestions(newQuery, activeFilters.value.category)
    } else {
      suggestions.value = []
    }
  })

  return {
    // State
    searchQuery,
    searchResults,
    loading,
    error,
    suggestions,
    filters,
    pagination,
    searchMeta,
    activeFilters,
    currentPage,
    perPage,

    // Computed
    hasResults,
    hasFilters,
    totalPages,
    hasMorePages,

    // Methods
    search,
    getSuggestions,
    getFilters,
    getTrending,
    applyFilter,
    removeFilter,
    clearFilters,
    setSearchQuery,
    goToPage,
    nextPage,
    previousPage,
    sortResults,
    setPriceRange,
    setCategory,
    setBrand,
    setSize,
    setColor,
    setStockFilter,
    setSaleFilter,
    setFeaturedFilter,
    clearSearch,
    resetPagination
  }
}
