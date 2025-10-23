import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { buildApiUrl, getAuthHeaders, getHeaders } from '@/config/api'

// Global state
const product = ref(null)
const loading = ref(true)
const error = ref(null)
const relatedProducts = ref([])
const productCache = ref(new Map())

export function useProduct() {
  const route = useRoute()

  // Computed properties
  const hasProduct = computed(() => !!product.value)
  const productId = computed(() => route.params.id)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => !!error.value)
  const hasRelatedProducts = computed(() => relatedProducts.value.length > 0)

  // Helper functions
  const getToken = () => {
    return localStorage.getItem('auth_token') ||
           localStorage.getItem('token') ||
           sessionStorage.getItem('token')
  }

  const getApiHeaders = (includeAuth = true) => {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }

    if (includeAuth) {
      const token = getToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    return headers
  }

  const clearError = () => {
    error.value = null
  }

  const resetState = () => {
    product.value = null
    relatedProducts.value = []
    error.value = null
    loading.value = true
  }

  // Enhanced load product function
  const loadProduct = async (forceRefresh = false) => {
    try {
      const currentProductId = productId.value
      if (!currentProductId) {
        throw new Error('Product ID not found')
      }

      // Check cache first (unless force refresh)
      if (!forceRefresh && productCache.value.has(currentProductId)) {
        const cachedProduct = productCache.value.get(currentProductId)
        product.value = cachedProduct
        loading.value = false
        return cachedProduct
      }

      loading.value = true
      error.value = null

      const endpoint = buildApiUrl(`/products/${currentProductId}`)

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Product not found')
        }
        if (response.status === 401) {
          throw new Error('Authentication required')
        }
        if (response.status >= 500) {
          throw new Error('Server error, please try again later')
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success && data.data) {
        product.value = data.data
        // Cache the product
        productCache.value.set(currentProductId, data.data)
        return data.data
      } else {
        throw new Error(data.message || 'Failed to load product')
      }
    } catch (err) {
      console.error('Error loading product:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Enhanced load related products function
  const loadRelatedProducts = async () => {
    if (!product.value?.id) return

    try {
      const endpoint = `http://127.0.0.1:8000/api/products/${product.value.id}/related`

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: getApiHeaders(false) // Don't require auth for related products
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.length > 0) {
          relatedProducts.value = data.data
        }
      } else {
        console.warn('Failed to load related products:', response.status)
      }
    } catch (error) {
      console.error('Error loading related products:', error)
      // Don't throw error for related products as it's not critical
    }
  }

  // Enhanced server status check
  const checkServerStatus = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/debug-products', {
        method: 'GET',
        headers: getApiHeaders(false),
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })
      return response.ok
    } catch (error) {
      console.warn('Server status check failed:', error)
      return false
    }
  }

  // New function: Refresh product data
  const refreshProduct = async () => {
    return await loadProduct(true)
  }

  // New function: Load product by ID (for navigation)
  const loadProductById = async (id) => {
    if (!id) return null

    try {
      loading.value = true
      error.value = null

      const endpoint = `http://127.0.0.1:8000/api/products/${id}`

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: getApiHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success && data.data) {
        return data.data
      } else {
        throw new Error(data.message || 'Failed to load product')
      }
    } catch (err) {
      console.error('Error loading product by ID:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // New function: Clear cache
  const clearCache = () => {
    productCache.value.clear()
  }

  // New function: Get cached product
  const getCachedProduct = (id) => {
    return productCache.value.get(id)
  }

  return {
    // State
    product,
    loading,
    error,
    relatedProducts,

    // Computed
    hasProduct,
    productId,
    isLoading,
    hasError,
    hasRelatedProducts,

    // Methods
    loadProduct,
    loadRelatedProducts,
    refreshProduct,
    loadProductById,
    checkServerStatus,
    clearError,
    resetState,
    clearCache,
    getCachedProduct
  }
}
