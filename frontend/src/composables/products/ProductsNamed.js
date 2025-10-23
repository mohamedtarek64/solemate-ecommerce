import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { useNotifications } from '@/composables/useNotifications'
import { debounce } from 'lodash-es'

// ProductsNamed Composable
export function useProductsSetup() {
  const router = useRouter()
  const cartStore = useCartStore()
  const wishlistStore = useWishlistStore()
  const { success, error } = useNotifications()

  // State
  const products = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 0
  })

  // Filters
  const filters = reactive({
    search: '',
    category: '',
    brand: '',
    colors: [],
    price_min: '',
    price_max: '',
    sort: 'name',
    order: 'asc'
  })

  const searchQuery = ref('')
  const suggestions = ref([])
  const activeFilters = ref([])
  const currentPage = ref(1)
  const perPage = ref(12)

  // Computed
  const activeCategory = computed(() => {
    return filters.category || 'Sneakers'
  })

  // Load products
  const loadProducts = async () => {
    isLoading.value = true
    error.value = null

    try {
      const params = new URLSearchParams({
        page: currentPage.value,
        per_page: perPage.value,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) =>
            value !== '' && value !== null &&
            !(Array.isArray(value) && value.length === 0)
          )
        )
      })

      // Add colors filter
      if (filters.colors.length > 0) {
        params.append('colors', filters.colors.join(','))
      }

      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()

      if (response.ok) {
        products.value = data.data
        pagination.value = {
          current_page: data.current_page,
          last_page: data.last_page,
          per_page: data.per_page,
          total: data.total
        }
      } else {
        throw new Error(data.message || 'Failed to load products')
      }
    } catch (err) {
      console.error('Load products error:', err)
      error.value = err.message || 'Failed to load products'
    } finally {
      isLoading.value = false
    }
  }

  // Set active category
  const setActiveCategory = (category) => {
    filters.category = category
    currentPage.value = 1
    loadProducts()
  }

  // Set category filter
  const setCategoryFilter = (category) => {
    filters.category = category
    applyFilters()
  }

  // Set brand filter
  const setBrandFilter = (brand) => {
    filters.brand = brand
    applyFilters()
  }

  // Clear filters
  const clearFilters = () => {
    Object.keys(filters).forEach(key => {
      if (key === 'colors') {
        filters[key] = []
      } else {
        filters[key] = ''
      }
    })
    filters.sort = 'name'
    filters.order = 'asc'
    currentPage.value = 1
    loadProducts()
  }

  // Set sort
  const setSort = (sort, order = 'asc') => {
    filters.sort = sort
    filters.order = order
    applyFilters()
  }

  // Toggle color
  const toggleColor = (color) => {
    const index = filters.colors.indexOf(color)
    if (index > -1) {
      filters.colors.splice(index, 1)
    } else {
      filters.colors.push(color)
    }
    applyFilters()
  }

  // Apply filters
  const applyFilters = () => {
    currentPage.value = 1
    loadProducts()
  }

  // Go to page
  const goToPage = (page) => {
    currentPage.value = page
    loadProducts()
  }

  // View product
  const viewProduct = (product) => {
    router.push(`/products/${product.id}`)
  }

  // Add to cart
  const addToCart = async (product) => {
    try {
      await cartStore.addToCart(product.id, 1)
      success(`${product.name} added to cart!`)
    } catch (err) {
      console.error('Add to cart error:', err)
      error('Failed to add product to cart')
    }
  }

  // Handle search
  const handleSearch = debounce(() => {
    filters.search = searchQuery.value
    applyFilters()
  }, 500)

  // Watch for filter changes
  watch(filters, () => {
    // Update active filters
    activeFilters.value = Object.entries(filters)
      .filter(([_, value]) =>
        value !== '' && value !== null &&
        !(Array.isArray(value) && value.length === 0)
      )
      .map(([key, value]) => ({ key, value }))
  }, { deep: true })

  // Initialize
  onMounted(() => {
    loadProducts()
  })

  return {
    products,
    isLoading,
    error,
    pagination,
    filters,
    searchQuery,
    suggestions,
    activeFilters,
    currentPage,
    perPage,
    activeCategory,
    setActiveCategory,
    setCategoryFilter,
    setBrandFilter,
    clearFilters,
    setSort,
    toggleColor,
    applyFilters,
    goToPage,
    viewProduct,
    addToCart,
    handleSearch
  }
}
