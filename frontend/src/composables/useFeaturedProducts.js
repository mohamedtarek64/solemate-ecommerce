import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export function useFeaturedProducts() {
  const router = useRouter()

  // State
  const featuredProducts = ref([])
  const featuredLoading = ref(false)
  const featuredError = ref(null)

  // Load featured products with fallback to any available products
  const loadFeaturedProducts = async () => {
    featuredLoading.value = true
    featuredError.value = null

    try {
      const loadedProducts = []

      // Try to load from products_men first (skip first 3, take last 3)
      try {
        const response = await fetch('/api/products?table=products_men&limit=6', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            const products = Array.isArray(data.data) ? data.data : (data.data.data || [])
            // Skip first 3 products, take the last 3
            loadedProducts.push(...products.slice(3, 6))
          }
        }
      } catch (err) {
        // Failed to load from men's products (will try women's next)
      }

      // If we need more products, load from women
      if (loadedProducts.length < 3) {
        try {
          const response = await fetch('/api/products?table=products_women&limit=3', {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            const data = await response.json()
            if (data.success && data.data) {
              const products = Array.isArray(data.data) ? data.data : (data.data.data || [])
              loadedProducts.push(...products.slice(0, 3 - loadedProducts.length))
            }
          }
        } catch (err) {
          // Failed to load from women's products (using what we have)
        }
      }

      // Normalize products for featured display
      featuredProducts.value = loadedProducts.map(normalizeFeaturedProduct)

      } catch (err) {
      console.error('Error loading featured products:', err)
      featuredError.value = err.message
    } finally {
      featuredLoading.value = false
    }
  }

  // Helper: normalize product for featured display
  const normalizeFeaturedProduct = (p) => {
    // Helper to convert object/array to array
    const toArray = (val) => {
      if (Array.isArray(val)) return val
      if (val && typeof val === 'object') return Object.values(val)
      return []
    }

    const allImages = [
      p.image_url || p.image || p.main_image,
      ...toArray(p.additional_images),
      ...toArray(p.images),
      p.image2,
      p.image3,
      p.image4
    ].filter(Boolean)

    return {
      id: p.id,
      name: p.name || 'Product Name',
      description: p.description || p.short_description || 'Premium quality product',
      price: parseFloat(p.price) || 0,
      originalPrice: p.original_price ? parseFloat(p.original_price) : null,
      comparePrice: p.compare_price ? parseFloat(p.compare_price) : null,
      image: allImages[0] || '',
      images: allImages,
      brand: (p.brand || p.brand_name || 'Unknown').toLowerCase(),
      category: (p.category || p.category_name || '').toLowerCase(),
      gender: (p.gender || p.for_gender || '').toLowerCase(),
      rating: parseFloat(p.rating) || 4.6,
      isOnSale: p.original_price && parseFloat(p.price) < parseFloat(p.original_price),
      badge: getProductBadge(p),
      sku: p.sku || '',
      stockStatus: p.stock_status || 'in_stock'
    }
  }

  // Helper: determine product badge
  const getProductBadge = (product) => {
    if (product.original_price && parseFloat(product.price) < parseFloat(product.original_price)) {
      return { text: 'SALE', class: 'bg-accent-green text-black' }
    }
    if (product.featured || product.is_featured) {
      return { text: 'FEATURED', class: 'bg-primary-orange text-white' }
    }
    if (product.brand && (product.brand.includes('nike') || product.brand.includes('adidas'))) {
      return { text: 'HOT', class: 'bg-primary-orange text-white' }
    }
    if (product.rating && parseFloat(product.rating) >= 4.8) {
      return { text: 'TOP', class: 'bg-blue-500 text-white' }
    }
    // Default badge for our specific products
    if (product.id === 57 || product.id === 60 || product.id === 61) {
      return { text: 'NEW', class: 'bg-green-500 text-white' }
    }
    return null
  }

  // Actions
  const viewProduct = (product) => {
    router.push({ name: 'ProductDetail', params: { id: product.id } })
  }

  const addToCart = (product) => {
    // TODO: Implement add to cart functionality
  }

  const addToWishlist = (product) => {
    // TODO: Implement add to wishlist functionality
  }

  // Auto-load on mount
  onMounted(() => {
    loadFeaturedProducts()
  })

  return {
    // State
    featuredProducts,
    loading: featuredLoading,
    error: featuredError,

    // Actions
    loadFeaturedProducts,
    viewProduct,
    addToCart,
    addToWishlist
  }
}
