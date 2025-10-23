/**
 * Products Composable
 *
 * Enhanced products functionality with improved error handling and state management
 */
import { ref, computed } from 'vue'
import { useBaseComposable } from './useBaseComposable'
import { useApi } from './useApi'

export function useProducts() {
  const base = useBaseComposable()
  const api = useApi()

  // Products state
  const products = ref([])
  const currentProduct = ref(null)
  const categories = ref([])
  const brands = ref([])
  const filters = ref({
    category: '',
    brand: '',
    priceRange: { min: 0, max: 1000 },
    sortBy: 'name',
    sortOrder: 'asc'
  })

  // Pagination state
  const pagination = ref({
    currentPage: 1,
    perPage: 12,
    total: 0,
    lastPage: 1,
    hasMore: false
  })

  // Search state
  const searchQuery = ref('')
  const searchResults = ref([])
  const isSearching = ref(false)

  // Computed properties
  const hasProducts = computed(() => products.value.length > 0)
  const hasSearchResults = computed(() => searchResults.value.length > 0)
  const totalProducts = computed(() => pagination.value.total)
  const currentPage = computed(() => pagination.value.currentPage)
  const hasMorePages = computed(() => pagination.value.hasMore)

  // Product operations
  const fetchProducts = async (tab = 'women', options = {}) => {
    const { page = 1, perPage = 12, forceRefresh = false } = options

    const cacheKey = `api_cache_products_${tab}_${page}_${perPage}`

    try {
      let result

      if (forceRefresh) {
        result = await api.apiGet(`/search/products-by-tab?tab=${tab}&page=${page}&per_page=${perPage}`)
      } else {
        result = await api.fetchWithCache(`/search/products-by-tab?tab=${tab}&page=${page}&per_page=${perPage}`, cacheKey)
      }

      if (result.success) {
        products.value = result.data.products || []
        pagination.value = {
          currentPage: page,
          perPage,
          total: result.data.pagination?.total || 0,
          lastPage: result.data.pagination?.last_page || 1,
          hasMore: result.data.pagination?.has_more || false
        }
      }

      return result
    } catch (err) {
      base.showError('Failed to fetch products')
      throw err
    }
  }

  const fetchProductById = async (productId, forceRefresh = false) => {
    const cacheKey = `api_cache_product_${productId}`

    try {
      let result

      if (forceRefresh) {
        result = await api.apiGet(`/products/${productId}`)
      } else {
        result = await api.fetchWithCache(`/products/${productId}`, cacheKey)
      }

      if (result.success) {
        currentProduct.value = result.data
      }

      return result
    } catch (err) {
      base.showError('Failed to fetch product details')
      throw err
    }
  }

  const searchProducts = async (query, options = {}) => {
    const { page = 1, perPage = 12, tab = 'all' } = options

    if (!query.trim()) {
      searchResults.value = []
      return { success: true, data: { products: [], pagination: {} } }
    }

    try {
      base.setLoading(true)
      isSearching.value = true

      const result = await api.apiGet(`/search/products?query=${encodeURIComponent(query)}&tab=${tab}&page=${page}&per_page=${perPage}`)

      if (result.success) {
        searchResults.value = result.data.products || []
        pagination.value = {
          currentPage: page,
          perPage,
          total: result.data.pagination?.total || 0,
          lastPage: result.data.pagination?.last_page || 1,
          hasMore: result.data.pagination?.has_more || false
        }
      }

      return result
    } catch (err) {
      base.showError('Failed to search products')
      throw err
    } finally {
      base.setLoading(false)
      isSearching.value = false
    }
  }

  const fetchCategories = async () => {
    try {
      const result = await api.fetchWithCache('/categories', 'api_cache_categories')

      if (result.success) {
        categories.value = result.data || []
      }

      return result
    } catch (err) {
      console.error('Failed to fetch categories:', err)
      return { success: false, data: [] }
    }
  }

  const fetchBrands = async () => {
    try {
      const result = await api.fetchWithCache('/brands', 'api_cache_brands')

      if (result.success) {
        brands.value = result.data || []
      }

      return result
    } catch (err) {
      console.error('Failed to fetch brands:', err)
      return { success: false, data: [] }
    }
  }

  // Filter operations
  const setFilter = (key, value) => {
    filters.value[key] = value
  }

  const clearFilters = () => {
    filters.value = {
      category: '',
      brand: '',
      priceRange: { min: 0, max: 1000 },
      sortBy: 'name',
      sortOrder: 'asc'
    }
  }

  const applyFilters = async (tab = 'women') => {
    const { category, brand, priceRange, sortBy, sortOrder } = filters.value

    const params = new URLSearchParams({
      tab,
      page: 1,
      per_page: pagination.value.perPage
    })

    if (category) params.append('category', category)
    if (brand) params.append('brand', brand)
    if (priceRange.min > 0) params.append('min_price', priceRange.min)
    if (priceRange.max < 1000) params.append('max_price', priceRange.max)
    if (sortBy) params.append('sort_by', sortBy)
    if (sortOrder) params.append('sort_order', sortOrder)

    try {
      const result = await api.apiGet(`/search/products-by-tab?${params}`)

      if (result.success) {
        products.value = result.data.products || []
        pagination.value = {
          currentPage: 1,
          perPage: pagination.value.perPage,
          total: result.data.pagination?.total || 0,
          lastPage: result.data.pagination?.last_page || 1,
          hasMore: result.data.pagination?.has_more || false
        }
      }

      return result
    } catch (err) {
      base.showError('Failed to apply filters')
      throw err
    }
  }

  // Pagination operations
  const loadNextPage = async (tab = 'women') => {
    if (!hasMorePages.value) return

    const nextPage = pagination.value.currentPage + 1

    try {
      const result = await fetchProducts(tab, { page: nextPage })

      if (result.success) {
        // Append new products to existing ones
        products.value = [...products.value, ...(result.data.products || [])]
      }

      return result
    } catch (err) {
      base.showError('Failed to load next page')
      throw err
    }
  }

  const loadPreviousPage = async (tab = 'women') => {
    if (pagination.value.currentPage <= 1) return

    const prevPage = pagination.value.currentPage - 1

    try {
      return await fetchProducts(tab, { page: prevPage })
    } catch (err) {
      base.showError('Failed to load previous page')
      throw err
    }
  }

  const goToPage = async (page, tab = 'women') => {
    try {
      return await fetchProducts(tab, { page })
    } catch (err) {
      base.showError('Failed to navigate to page')
      throw err
    }
  }

  // Product utilities
  const findProductById = (productId) => {
    return products.value.find(product => product.id === productId) ||
           searchResults.value.find(product => product.id === productId) ||
           currentProduct.value
  }

  const getProductPrice = (product) => {
    return product.price || product.original_price || 0
  }

  const getProductDiscount = (product) => {
    if (!product.original_price || !product.price) return 0
    return Math.round(((product.original_price - product.price) / product.original_price) * 100)
  }

  const getProductRating = (product) => {
    return product.rating || 4.5
  }

  const getProductReviewsCount = (product) => {
    return product.reviews_count || 0
  }

  const getProductStockStatus = (product) => {
    const stock = product.stock_quantity || product.quantity || 0
    if (stock === 0) return 'out_of_stock'
    if (stock < 10) return 'low_stock'
    return 'in_stock'
  }

  const isProductInStock = (product) => {
    return getProductStockStatus(product) !== 'out_of_stock'
  }

  // Product validation
  const validateProduct = (product) => {
    const errors = []

    if (!product.name) {
      errors.push('Product name is required')
    }

    if (!product.price || product.price <= 0) {
      errors.push('Valid price is required')
    }

    if (!product.description) {
      errors.push('Product description is required')
    }

    return errors
  }

  // Cache management
  const clearProductCache = (productId = null) => {
    if (productId) {
      localStorage.removeItem(`api_cache_product_${productId}`)
    } else {
      // Clear all product cache
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('api_cache_product_') ||
            key.startsWith('api_cache_products_')) {
          localStorage.removeItem(key)
        }
      })
    }
  }

  // Initialize products
  const initializeProducts = async (tab = 'women') => {
    try {
      await Promise.all([
        fetchProducts(tab),
        fetchCategories(),
        fetchBrands()
      ])
    } catch (err) {
      console.error('Failed to initialize products:', err)
    }
  }

  return {
    // Base composable methods
    ...base,

    // Products state
    products,
    currentProduct,
    categories,
    brands,
    filters,
    pagination,
    searchQuery,
    searchResults,
    isSearching,

    // Computed
    hasProducts,
    hasSearchResults,
    totalProducts,
    currentPage,
    hasMorePages,

    // Product operations
    fetchProducts,
    fetchProductById,
    searchProducts,
    fetchCategories,
    fetchBrands,

    // Filter operations
    setFilter,
    clearFilters,
    applyFilters,

    // Pagination operations
    loadNextPage,
    loadPreviousPage,
    goToPage,

    // Utilities
    findProductById,
    getProductPrice,
    getProductDiscount,
    getProductRating,
    getProductReviewsCount,
    getProductStockStatus,
    isProductInStock,

    // Validation
    validateProduct,

    // Cache management
    clearProductCache,

    // Initialization
    initializeProducts
  }
}
