import { ref, computed, onMounted, watch } from 'vue'
import { useProductsTabs } from '@/composables/useProductsTabs'
import { getAllColors } from '@/utils/colorMapping'

function useProductsSetup() {

  // Use the optimized products tabs composable
  const {
    currentTab,
    products,
    loading,
    error,
    pagination,
    filters,
    currentTabInfo,
    tabMapping,
    switchTab,
    applyFilters,
    clearFilters,
    goToPage,
    viewProduct,
    addToCart,
    initialize
  } = useProductsTabs()

  // Local UI state
  const selectedColors = ref([])

  // Filter options
  const brands = ref(['Nike', 'Adidas', 'Jordan', 'Puma', 'New Balance', 'Converse'])
  const sizes = ref(['6', '7', '8', '9', '10', '11', '12', '13'])
  const colors = ref(getAllColors().map(color => color.hex))
  const categories = ref([
    { id: 1, name: 'Sneakers' },
    { id: 2, name: 'Training' },
    { id: 3, name: 'Kids' }
  ])

  const sortOptions = ref([
    { value: 'popular', label: 'Popular' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' }
  ])

  // Computed properties
  const visiblePages = computed(() => {
    if (!pagination.value) return []
    const current = pagination.value.current_page || 1
    const last = pagination.value.last_page || 1
    const pages = []

    for (let i = Math.max(1, current - 2); i <= Math.min(last, current + 2); i++) {
      pages.push(i)
    }
    return pages
  })

  // User state (mock for now)
  const user = ref({ first_name: 'User' })
  const isAuthenticated = ref(true)

  // Methods
  const handleSearch = async () => {
    await applyFilters()
  }

  const handleFilterChange = async () => {
    await applyFilters()
  }

  const setActiveCategory = async (category) => {
    // Map UI categories to tab names
    const categoryMap = {
      'men': 'men',
      'women': 'women',
      'kids': 'kids'
    }

    const tabName = categoryMap[category] || category
    await switchTab(tabName)
  }

  const setCategoryFilter = async (categoryId) => {
    filters.value.category = categoryId
    await applyFilters()
  }

  const setBrandFilter = async (brand) => {
    filters.value.brand = brand
    await applyFilters()
  }

  const setSort = async (sortValue) => {
    filters.value.sort = sortValue
    await applyFilters()
  }

  const toggleColor = (color) => {
    const index = selectedColors.value.indexOf(color)
    if (index > -1) {
      selectedColors.value.splice(index, 1)
    } else {
      selectedColors.value.push(color)
    }
    
    // Update filters.colors
    filters.value.colors = selectedColors.value
    
    // Apply filters
    applyFilters()
  }

  // Watch for URL changes (with debounce)
  let urlWatchTimeout = null
  watch(() => window.location.search, (newSearch) => {
    if (urlWatchTimeout) {
      clearTimeout(urlWatchTimeout)
    }

    urlWatchTimeout = setTimeout(() => {
      const urlParams = new URLSearchParams(newSearch)
      const category = urlParams.get('category')
      const q = urlParams.get('q')

      if (category) {
        setActiveCategory(category)
      }
      if (q) {
        filters.value.search = q
        applyFilters()
      }
    }, 300) // 300ms debounce
  }, { immediate: false }) // Don't run immediately to prevent loops

  // Initialize on mount (only once)
  onMounted(() => {
    // Add a small delay to prevent race conditions
    setTimeout(() => {
      initialize()
    }, 100)
  })

  return {
    products,
    isLoading: loading,
    error,
    pagination,
    filters,
    activeCategory: currentTab,
    selectedColors,
    brands,
    sizes,
    colors,
    categories,
    sortOptions,
    visiblePages,
    user,
    isAuthenticated,
    loadProducts: applyFilters,
    handleSearch,
    handleFilterChange,
    setActiveCategory,
    setCategoryFilter,
    setBrandFilter,
    clearFilters,
    setSort,
    toggleColor,
    applyFilters,
    goToPage,
    viewProduct,
    addToCart
  }
}

// Export default
export default useProductsSetup
