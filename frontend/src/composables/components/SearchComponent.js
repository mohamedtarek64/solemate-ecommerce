import { ref, computed, watch, onMounted } from 'vue'

// Search Component Composable
export function useSearchComponent(props, router, searchComposable) {
  const {
    searchQuery,
    activeFilters,
    currentPage,
    totalPages,
    suggestions,
    setSearchQuery,
    getSuggestions,
    search
  } = searchComposable

  const showSuggestions = ref(false)

  // Computed properties
  const visiblePages = computed(() => {
    const pages = []
    const start = Math.max(1, currentPage.value - 2)
    const end = Math.min(totalPages.value, start + 4)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  })

  // Methods
  const handleSearchInput = () => {
    if (searchQuery.value.length >= 2) {
      getSuggestions(searchQuery.value, activeFilters.value.category)
    } else {
      suggestions.value = []
    }
  }

  const performSearch = () => {
    showSuggestions.value = false
    search()
  }

  const selectSuggestion = (suggestion) => {
    setSearchQuery(suggestion)
    showSuggestions.value = false
    search()
  }

  const hideSuggestions = () => {
    setTimeout(() => {
      showSuggestions.value = false
    }, 200)
  }

  const viewProduct = (productId) => {
    router.push(`/products/${productId}`)
  }

  const initializeSearch = () => {
    // Initialize with props
    if (props.initialQuery) {
      setSearchQuery(props.initialQuery)
    }
    if (props.initialCategory) {
      activeFilters.value.category = props.initialCategory
    }

    // Watch for search query changes
    watch(searchQuery, (newQuery) => {
      if (newQuery && newQuery.length >= 2) {
        getSuggestions(newQuery, activeFilters.value.category)
      }
    })
  }

  return {
    showSuggestions,
    visiblePages,
    handleSearchInput,
    performSearch,
    selectSuggestion,
    hideSuggestions,
    viewProduct,
    initializeSearch
  }
}
