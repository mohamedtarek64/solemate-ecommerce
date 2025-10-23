import { ref, computed } from 'vue'
import { buildApiUrl, getAuthHeaders } from '@/config/api'
import { getColorNameFromHex } from '@/utils/colorMapping'

export function useProductsTabs() {
  // State
  const currentTab = ref('men')
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)
  const isInitialized = ref(false)
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 0,
    from: 0,
    to: 0
  })

  // Filters
  const filters = ref({
    search: '',
    brand: '',
    size: '',
    color: '',
    category: '',
    price: 500,
    min_price: 0,
    max_price: 1000,
    sort: 'popular',
    colors: [] // Array of selected colors
  })

  // Tab mapping
  const tabMapping = {
    'men': { label: 'Men', table: 'products_men', category: 'Sneakers' },
    'women': { label: 'Women', table: 'products_women', category: 'Training' },
    'kids': { label: 'Kids', table: 'products_kids', category: 'Kids' }
  }

  // Computed
  const currentTabInfo = computed(() => tabMapping[currentTab.value])
  const isLoading = computed(() => loading.value)

  // Methods
  const fetchProducts = async (tab = currentTab.value, page = 1) => {
    // Prevent multiple simultaneous requests
    if (loading.value) {
      return
    }

    loading.value = true
    error.value = null

    try {
      const token = localStorage.getItem('auth_token')
      
      // Build query parameters with all filters
      const params = new URLSearchParams({
        tab: tab,
        page: page,
        per_page: 12
      })

      // Add search filter
      if (filters.value.search && filters.value.search.trim()) {
        params.append('search', filters.value.search.trim())
      }

      // Add brand filter
      if (filters.value.brand && filters.value.brand.trim()) {
        params.append('brand', filters.value.brand.trim())
      }

      // Add size filter
      if (filters.value.size && filters.value.size.trim()) {
        params.append('size', filters.value.size.trim())
      }

      // Add color filters (multiple colors)
      if (filters.value.colors && filters.value.colors.length > 0) {
        filters.value.colors.forEach(color => {
          // Convert hex color to color name for better API matching
          const colorName = getColorNameFromHex(color)
          params.append('colors[]', colorName)
        })
      }

      // Add single color filter (for backward compatibility)
      if (filters.value.color && filters.value.color.trim()) {
        const colorName = getColorNameFromHex(filters.value.color)
        params.append('color', colorName)
      }

      // Add category filter
      if (filters.value.category) {
        params.append('category', filters.value.category)
      }

      // Add price range
      const maxPrice = filters.value.price || filters.value.max_price || 1000
      params.append('min_price', filters.value.min_price || 0)
      params.append('max_price', maxPrice)

      // Add sort
      if (filters.value.sort) {
        params.append('sort', filters.value.sort)
      }

      console.log('Loading products with filters:', {
        tab: activeTab.value,
        filters: filters.value,
        processed_color: filters.value.color ? getColorNameFromHex(filters.value.color) : null
      })

      const response = await fetch(`${buildApiUrl('/search/products-by-tab')}?${params}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        products.value = data.data.products || []
        pagination.value = data.data.pagination || {
          current_page: 1,
          last_page: 1,
          per_page: 12,
          total: 0
        }

        // Update current tab
        currentTab.value = tab

        } else {
        throw new Error(data.message || 'Failed to fetch products')
      }
    } catch (err) {
      error.value = err.message
      console.error('❌ Error fetching products:', err)
      // Set empty products on error
      products.value = []
    } finally {
      loading.value = false
    }
  }

  const switchTab = async (tab) => {
    if (tab === currentTab.value) return

    await fetchProducts(tab, 1)
  }

  const applyFilters = async () => {
    await fetchProducts(currentTab.value, 1)
  }

  const clearFilters = () => {
    filters.value = {
      search: '',
      brand: '',
      size: '',
      color: '',
      category: '',
      price: 500,
      min_price: 0,
      max_price: 1000,
      sort: 'popular',
      colors: []
    }
    fetchProducts(currentTab.value, 1)
  }

  const goToPage = async (page) => {
    if (page >= 1 && page <= pagination.value.last_page) {
      await fetchProducts(currentTab.value, page)
    }
  }

  const viewProduct = (productId) => {
    // Get category from current tab
    const category = currentTab.value // 'men', 'women', or 'kids'

    // Navigate to product details page with category parameter
    if (window.$router) {
      window.$router.push(`/products/${productId}?category=${category}`)
    } else {
      // Fallback to window.location if router is not available
      window.location.href = `/products/${productId}?category=${category}`
    }
  }

  const addToCart = async (productId) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('http://127.0.0.1:8000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1
        })
      })

      if (response.ok) {
        // You can add a toast notification here
      } else {
        console.error('❌ Failed to add product to cart')
      }
    } catch (error) {
      console.error('❌ Error adding to cart:', error)
    }
  }

  // Initialize with men's products (only once)
  const initialize = async () => {
    if (!isInitialized.value && !loading.value) {
      isInitialized.value = true
      await fetchProducts('men', 1)
    }
  }

  return {
    // State
    currentTab,
    products,
    loading: isLoading,
    error,
    pagination,
    filters,

    // Computed
    currentTabInfo,
    tabMapping,

    // Methods
    fetchProducts,
    switchTab,
    applyFilters,
    clearFilters,
    goToPage,
    viewProduct,
    addToCart,
    initialize
  }
}
