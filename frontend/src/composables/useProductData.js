import { ref, computed } from 'vue'

export function useProductData() {
  // Products data
  const products = ref([])
  const womenProducts = ref([])
  const menProducts = ref([])
  const kidsProducts = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const selectedProduct = ref(null)

  // Filters
  const searchQuery = ref('')
  const categoryFilter = ref('')
  const brandFilter = ref('')
  const statusFilter = ref('')
  const selectedCategory = ref('all')

  // Pagination
  const currentPage = ref(1)
  const itemsPerPage = ref(10)

  // Selection
  const selectedProducts = ref([])

  // Computed properties
  const totalProducts = computed(() => {
    return womenProducts.value.length + menProducts.value.length + kidsProducts.value.length
  })

  const activeProducts = computed(() => {
    const allProducts = [...womenProducts.value, ...menProducts.value, ...kidsProducts.value]
    return allProducts.filter(p => p.quantity > 0).length
  })

  const outOfStockProducts = computed(() => {
    const allProducts = [...womenProducts.value, ...menProducts.value, ...kidsProducts.value]
    return allProducts.filter(p => p.quantity === 0).length
  })

  const lowStockProducts = computed(() => {
    const allProducts = [...womenProducts.value, ...menProducts.value, ...kidsProducts.value]
    return allProducts.filter(p => p.quantity > 0 && p.quantity < 10).length
  })

  const productCategories = computed(() => [
    {
      key: 'all',
      name: 'All Products',
      icon: 'inventory_2',
      count: totalProducts.value
    },
    {
      key: 'women',
      name: 'Women\'s',
      icon: 'woman',
      count: womenProducts.value.length
    },
    {
      key: 'men',
      name: 'Men\'s',
      icon: 'man',
      count: menProducts.value.length
    },
    {
      key: 'kids',
      name: 'Kids',
      icon: 'child_care',
      count: kidsProducts.value.length
    }
  ])

  const currentProducts = computed(() => {
    switch (selectedCategory.value) {
      case 'women':
        return womenProducts.value
      case 'men':
        return menProducts.value
      case 'kids':
        return kidsProducts.value
      default:
        return [...womenProducts.value, ...menProducts.value, ...kidsProducts.value]
    }
  })

  const filteredProducts = computed(() => {
    let filtered = currentProducts.value

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      )
    }

    if (categoryFilter.value) {
      filtered = filtered.filter(p => p.category === categoryFilter.value)
    }

    if (brandFilter.value) {
      filtered = filtered.filter(p => p.brand === brandFilter.value)
    }

    if (statusFilter.value) {
      if (statusFilter.value === 'active') {
        filtered = filtered.filter(p => p.quantity > 0)
      } else if (statusFilter.value === 'inactive') {
        filtered = filtered.filter(p => p.quantity === 0)
      } else if (statusFilter.value === 'out_of_stock') {
        filtered = filtered.filter(p => p.quantity === 0)
      }
    }

    return filtered
  })

  const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage.value))

  const visiblePages = computed(() => {
    const pages = []
    const start = Math.max(1, currentPage.value - 2)
    const end = Math.min(totalPages.value, start + 4)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return pages
  })

  // Data loading functions
  const loadProducts = async () => {
    try {
      isLoading.value = true
      error.value = null

      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')

      if (!token) {
        throw new Error('No authentication token found')
      }

      // Load all products from both tables
      const allProductsResponse = await fetch('http://127.0.0.1:8000/api/admin/products', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (allProductsResponse.ok) {
        const allProductsResult = await allProductsResponse.json()
        if (allProductsResult.success) {
          const allProducts = allProductsResult.data.products || []

          // Categorize products based on table_source
          womenProducts.value = allProducts.filter(product =>
            product.table_source === 'products_women'
          )

          menProducts.value = allProducts.filter(product =>
            product.table_source === 'products'
          )

          kidsProducts.value = allProducts.filter(product =>
            product.category && (
              product.category.toLowerCase().includes('kids') ||
              product.name.toLowerCase().includes('kids') ||
              product.category.toLowerCase().includes('children') ||
              product.name.toLowerCase().includes('children')
            )
          )

          // Load colors for all products
          await loadColorsForProducts(womenProducts.value, token)
          await loadColorsForProducts(menProducts.value, token)
          await loadColorsForProducts(kidsProducts.value, token)
        }
      }

    } catch (err) {
      console.error('Error fetching products:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const loadColorsForProducts = async (products, token) => {
    for (let product of products) {
      try {
        const colorsResponse = await fetch(`http://127.0.0.1:8000/api/admin/products/${product.id}/colors`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })

        if (colorsResponse.ok) {
          const colorsResult = await colorsResponse.json()
          if (colorsResult.success) {
            product.colors = colorsResult.data.colors || []
          }
        }
      } catch (err) {
        product.colors = []
      }
    }
  }

  // Filter functions
  const applyFilters = () => {
    currentPage.value = 1
  }

  const clearFilters = () => {
    searchQuery.value = ''
    categoryFilter.value = ''
    brandFilter.value = ''
    statusFilter.value = ''
    currentPage.value = 1
  }

  const toggleSelectAll = () => {
    if (selectedProducts.value.length === filteredProducts.value.length) {
      selectedProducts.value = []
    } else {
      selectedProducts.value = filteredProducts.value.map(p => p.id)
    }
  }

  // Utility functions
  const getProductStatus = (product) => {
    if (product.quantity === 0) return 'Out of Stock'
    if (product.quantity < 10) return 'Low Stock'
    return 'Active'
  }

  const getProductStatusClass = (product) => {
    if (product.quantity === 0) return 'bg-red-900 text-red-300'
    if (product.quantity < 10) return 'bg-yellow-900 text-yellow-300'
    return 'bg-green-900 text-green-300'
  }

  return {
    // Data
    products,
    womenProducts,
    menProducts,
    kidsProducts,
    isLoading,
    error,
    selectedProduct,

    // Filters
    searchQuery,
    categoryFilter,
    brandFilter,
    statusFilter,
    selectedCategory,

    // Pagination
    currentPage,
    itemsPerPage,

    // Selection
    selectedProducts,

    // Computed
    totalProducts,
    activeProducts,
    outOfStockProducts,
    lowStockProducts,
    productCategories,
    currentProducts,
    filteredProducts,
    totalPages,
    visiblePages,

    // Functions
    loadProducts,
    loadColorsForProducts,
    applyFilters,
    clearFilters,
    toggleSelectAll,
    getProductStatus,
    getProductStatusClass
  }
}
