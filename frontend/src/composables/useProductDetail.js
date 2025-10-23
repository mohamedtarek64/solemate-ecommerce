import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useOptimizedProducts, useOptimizedCart } from '@/composables/useOptimizedApi.js'
import { useLoadingState } from '@/utils/loadingStates.js'
import { debounce, apiCache } from '@/utils/performance.js'

export function useProductDetail() {
  const route = useRoute()
  const router = useRouter()
  const cartStore = useCartStore()

  // Use optimized APIs
  const { loadProduct: optimizedLoadProduct, clearProductsCache } = useOptimizedProducts()
  const { loadCart: optimizedLoadCart } = useOptimizedCart()

  // Use loading states
  const { loading: productLoading, withLoading: withProductLoading } = useLoadingState('product_detail')
  const { loading: cartLoading, withLoading: withCartLoading } = useLoadingState('cart')
  const { loading: wishlistLoading, withLoading: withWishlistLoading } = useLoadingState('wishlist')

  // State
  const product = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const searchQuery = ref('')
  const selectedImage = ref(0)
  const selectedSize = ref('')
  const selectedColor = ref('')
  const quantity = ref(1)
  const isAddingToCart = ref(false)
  const isAuthenticated = ref(false)

  // Computed properties
  const mainImage = computed(() => {
    if (!product.value) return ''
    const images = product.value.images || []
    return images[selectedImage.value] || product.value.image || ''
  })

  const availableSizes = computed(() => {
    if (!product.value) return []
    return product.value.sizes || []
  })

  const availableColors = computed(() => {
    if (!product.value) return []
    return product.value.colors || []
  })

  const isInStock = computed(() => {
    if (!product.value) return false
    return product.value.stock_quantity > 0
  })

  const formattedPrice = computed(() => {
    if (!product.value) return '$0.00'
    return `$${parseFloat(product.value.price || 0).toFixed(2)}`
  })

  // Handlers
  const selectImage = (index) => {
    selectedImage.value = index
  }

  const selectSize = (size) => {
    selectedSize.value = size
  }

  const selectColor = (color) => {
    selectedColor.value = color
  }

  const increaseQuantity = () => {
    if (quantity.value < 10) {
      quantity.value++
    }
  }

  const decreaseQuantity = () => {
    if (quantity.value > 1) {
      quantity.value--
    }
  }

  const handleAddToCart = async () => {
    if (!product.value) return

    isAddingToCart.value = true
    try {
      await cartStore.addItem({
        product_id: product.value.id,
        quantity: quantity.value,
        size: selectedSize.value,
        color: selectedColor.value
      })
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      isAddingToCart.value = false
    }
  }

  const loadProduct = async () => {
    const productId = route.params.id
    if (!productId) return

    loading.value = true
    error.value = null

    try {
      const productData = await optimizedLoadProduct(productId)
      product.value = productData
    } catch (err) {
      error.value = err.message || 'Failed to load product'
    } finally {
      loading.value = false
    }
  }

  // Additional complex functions from ProductDetail.vue
  const getCurrentUserId = () => {
    // Method 1: From URL params (for testing different users)
    const urlParams = new URLSearchParams(window.location.search)
    const userIdFromUrl = urlParams.get('user_id')
    if (userIdFromUrl) {
      return parseInt(userIdFromUrl)
    }

    // Method 2: From localStorage (if user is logged in)
    const storedUserId = localStorage.getItem('user_id')
    if (storedUserId) {
      return parseInt(storedUserId)
    }

    // Method 3: Default to 18 for testing
    return 18
  }

  const checkRateLimit = () => {
    const now = Date.now()
    const API_RATE_LIMIT = 500 // 500ms between API calls

    if (now - lastApiCall.value < API_RATE_LIMIT) {
      return false
    }
    lastApiCall.value = now
    return true
  }

  const lastApiCall = ref(0)

  const loadProductSizes = async (productId) => {
    if (!productId) return

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/sizes/product/${productId}`)
      const data = await response.json()

      if (data.success) {
        return data.data.sizes || []
      } else {
        console.warn('Failed to load product sizes:', data.message)
        return []
      }
    } catch (error) {
      console.warn('Error loading product sizes:', error)
      return []
    }
  }

  const loadProductReviews = async (productId) => {
    if (!productId) return

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/reviews/product/${productId}`)
      const data = await response.json()

      if (data.success) {
        return {
          reviews: data.data.reviews || [],
          stats: {
            total_reviews: data.data.product.total_reviews,
            average_rating: data.data.product.average_rating,
            rating_distribution: data.data.product.rating_distribution
          }
        }
      } else {
        console.warn('Failed to load product reviews:', data.message)
        return { reviews: [], stats: null }
      }
    } catch (error) {
      console.warn('Error loading product reviews:', error)
      return { reviews: [], stats: null }
    }
  }

  const getRatingPercentage = (rating, stats) => {
    if (!stats?.rating_distribution) return 0

    const ratingKey = `${rating}_star`
    const count = stats.rating_distribution[ratingKey] || 0
    const total = stats.total_reviews || 1

    return Math.round((count / total) * 100)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const zoomImage = (imageUrl) => {
    if (!imageUrl) return

    // Create modal overlay
    const modal = document.createElement('div')
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      cursor: pointer;
    `

    // Create image element
    const img = document.createElement('img')
    img.src = imageUrl
    img.style.cssText = `
      max-width: 90%;
      max-height: 90%;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    `

    modal.appendChild(img)
    document.body.appendChild(modal)

    // Close modal on click
    modal.addEventListener('click', () => {
      document.body.removeChild(modal)
    })

    // Close modal on escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(modal)
        document.removeEventListener('keydown', handleEscape)
      }
    }
    document.addEventListener('keydown', handleEscape)
  }

  const playVideo = (videoSource) => {
    // Create modal for video playback
    const modal = document.createElement('div')
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      cursor: pointer;
    `

    const video = document.createElement('video')
    video.src = videoSource
    video.controls = true
    video.autoplay = true
    video.style.cssText = `
      max-width: 90%;
      max-height: 90%;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    `

    modal.appendChild(video)
    document.body.appendChild(modal)

    // Close modal on click
    modal.addEventListener('click', () => {
      document.body.removeChild(modal)
    })

    // Close modal on escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(modal)
        document.removeEventListener('keydown', handleEscape)
      }
    }
    document.addEventListener('keydown', handleEscape)
  }

  const restartVideos = () => {
    setTimeout(() => {
      const videos = document.querySelectorAll('.product-video')
      videos.forEach(video => {
        video.currentTime = 0
        video.play().catch(e => {
          })
      })
    }, 100)
  }

  const setVideoThumbnail = (event, index) => {
    // This function can be used to set custom thumbnails if needed
    }

  const getToken = () => {
    return localStorage.getItem('auth_token') || localStorage.getItem('token') || sessionStorage.getItem('token')
  }

  const checkServerStatus = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/debug-products', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })
      return response.ok
    } catch (error) {
      return false
    }
  }

  return {
    // Existing exports
    product,
    loading,
    error,
    searchQuery,
    selectedImage,
    selectedSize,
    selectedColor,
    quantity,
    isAddingToCart,
    isAuthenticated,
    productLoading,
    cartLoading,
    wishlistLoading,
    mainImage,
    availableSizes,
    availableColors,
    isInStock,
    formattedPrice,
    selectImage,
    selectSize,
    selectColor,
    increaseQuantity,
    decreaseQuantity,
    handleAddToCart,
    loadProduct,
    clearProductsCache,
    optimizedLoadCart,

    // New exports
    getCurrentUserId,
    checkRateLimit,
    loadProductSizes,
    loadProductReviews,
    getRatingPercentage,
    formatDate,
    zoomImage,
    playVideo,
    restartVideos,
    setVideoThumbnail,
    getToken,
    checkServerStatus
  }
}
