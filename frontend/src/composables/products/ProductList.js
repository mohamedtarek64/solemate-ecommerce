import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { useNotifications } from '@/composables/useNotifications'
import { debounce } from 'lodash-es'

// ProductList Composable
export function useProductList() {
  const router = useRouter()
  const cartStore = useCartStore()
  const wishlistStore = useWishlistStore()
  const { success, error } = useNotifications()

  // State
  const products = ref([])
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 0
  })
  const loading = ref(false)
  const categories = ref([])

  // Filters
  const filters = reactive({
    search: '',
    category: '',
    price_min: '',
    price_max: '',
    sort: 'name',
    order: 'asc'
  })

  // Computed
  const visiblePages = computed(() => {
    const current = pagination.value.current_page
    const last = pagination.value.last_page
    const pages = []

    // Always show first page
    if (current > 3) {
      pages.push(1)
      if (current > 4) pages.push('...')
    }

    // Show pages around current
    for (let i = Math.max(1, current - 2); i <= Math.min(last, current + 2); i++) {
      pages.push(i)
    }

    // Always show last page
    if (current < last - 2) {
      if (current < last - 3) pages.push('...')
      pages.push(last)
    }

    return pages
  })

  // Load products
  const loadProducts = async () => {
    loading.value = true

    try {
      const params = new URLSearchParams({
        page: pagination.value.current_page,
        per_page: pagination.value.per_page,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      })

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
      error('Failed to load products')
    } finally {
      loading.value = false
    }
  }

  // Load categories
  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()

      if (response.ok) {
        categories.value = data.data
      }
    } catch (err) {
      console.error('Load categories error:', err)
    }
  }

  // Apply filters
  const applyFilters = () => {
    pagination.value.current_page = 1
    loadProducts()
  }

  // Clear filters
  const clearFilters = () => {
    Object.keys(filters).forEach(key => {
      filters[key] = ''
    })
    filters.sort = 'name'
    filters.order = 'asc'
    applyFilters()
  }

  // Change page
  const changePage = (page) => {
    if (page !== '...' && page !== pagination.value.current_page) {
      pagination.value.current_page = page
      loadProducts()
    }
  }

  // Add to cart
  const handleAddToCart = async (product) => {
    try {
      await cartStore.addToCart(product.id, 1)
      success(`${product.name} added to cart!`)
    } catch (err) {
      console.error('Add to cart error:', err)
      error('Failed to add product to cart')
    }
  }

  // Add to wishlist
  const handleAddToWishlist = async (product) => {
    try {
      await wishlistStore.addToWishlist(product.id)
      success(`${product.name} added to wishlist!`)
    } catch (err) {
      console.error('Add to wishlist error:', err)
      error('Failed to add product to wishlist')
    }
  }

  // Debounced search
  const debouncedSearch = debounce(() => {
    applyFilters()
  }, 500)

  // Initialize
  onMounted(() => {
    loadProducts()
    loadCategories()
  })

  return {
    // Data
    products,
    pagination,
    loading,
    categories,
    filters,

    // Computed
    visiblePages,

    // Methods
    applyFilters,
    clearFilters,
    changePage,
    handleAddToCart,
    handleAddToWishlist,
    debouncedSearch
  }
}
