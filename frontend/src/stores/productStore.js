import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'
import { handleApiError, logError, safeAsync } from '../utils/errorHandler'

export const useProductStore = defineStore('product', () => {
  // State
  const products = ref([])
  const currentProduct = ref(null)
  const featuredProducts = ref([])
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 0
  })

  // Getters
  const getProductById = computed(() => {
    return (id) => products.value.find(product => product.id === id)
  })

  const getProductBySlug = computed(() => {
    return (slug) => products.value.find(product => product.slug === slug)
  })

  const hasProducts = computed(() => products.value.length > 0)

  // Actions
  const fetchProducts = async (params = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get('/v1/products', { params })
      products.value = response.data.data
      pagination.value = response.data.pagination
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch products'
      console.error('Error fetching products:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchProduct = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get(`/products/${id}`)
      currentProduct.value = response.data.data
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch product'
      console.error('Error fetching product:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchFeaturedProducts = async () => {
    loading.value = true
    error.value = null
    
    const { data, error: fetchError } = await safeAsync(
      async () => {
        const response = await api.get('/v1/products/featured')
        // Handle both direct array response and wrapped response
        if (Array.isArray(response.data)) {
          return response.data
        } else if (response.data.data && Array.isArray(response.data.data)) {
          return response.data.data
        } else {
          return []
        }
      },
      'fetchFeaturedProducts',
      'Failed to fetch featured products'
    )
    
    if (fetchError) {
      error.value = fetchError
      featuredProducts.value = []
      logError(new Error(fetchError), 'fetchFeaturedProducts')
    } else {
      featuredProducts.value = data || []
    }
    
    loading.value = false
  }

  const searchProducts = async (query, filters = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const params = { search: query, ...filters }
      const response = await api.get('/v1/products/search', { params })
      products.value = response.data.data
      pagination.value = response.data.pagination
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to search products'
      console.error('Error searching products:', err)
    } finally {
      loading.value = false
    }
  }

  const getProductsByCategory = async (category) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get('/v1/products', { 
        params: { category } 
      })
      products.value = response.data.data
      pagination.value = response.data.pagination
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch category products'
      console.error('Error fetching category products:', err)
    } finally {
      loading.value = false
    }
  }

  const clearProducts = () => {
    products.value = []
    currentProduct.value = null
    pagination.value = {
      current_page: 1,
      last_page: 1,
      per_page: 12,
      total: 0
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    products,
    currentProduct,
    featuredProducts,
    loading,
    error,
    pagination,
    
    // Getters
    getProductById,
    getProductBySlug,
    hasProducts,
    
    // Actions
    fetchProducts,
    fetchProduct,
    fetchFeaturedProducts,
    searchProducts,
    getProductsByCategory,
    clearProducts,
    clearError
  }
})
