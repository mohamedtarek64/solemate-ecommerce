import { ref } from 'vue'

export function useProductReviewsAndSizes() {
  // State
  const productSizes = ref([])
  const productReviews = ref([])
  const reviewsStats = ref(null)
  const reviewsLoading = ref(false)
  const sizesLoading = ref(false)

  // Rate limiting for API calls
  const lastApiCall = ref(0)
  const API_RATE_LIMIT = 500 // 500ms between API calls

  // Rate limiting function
  const checkRateLimit = () => {
    const now = Date.now()
    if (now - lastApiCall.value < API_RATE_LIMIT) {
      return false
    }
    lastApiCall.value = now
    return true
  }

  // Load product sizes
  const loadProductSizes = async (productId) => {
    if (!productId) return

    sizesLoading.value = true
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/sizes/product/${productId}`)
      const data = await response.json()

      if (data.success) {
        productSizes.value = data.data.sizes || []
      } else {
        console.warn('Failed to load product sizes:', data.message)
        productSizes.value = []
      }
    } catch (error) {
      console.warn('Error loading product sizes:', error)
      productSizes.value = []
    } finally {
      sizesLoading.value = false
    }
  }

  // Load product reviews
  const loadProductReviews = async (productId) => {
    if (!productId) return

    reviewsLoading.value = true
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/reviews/product/${productId}`)
      const data = await response.json()

      if (data.success) {
        productReviews.value = data.data.reviews || []
        reviewsStats.value = data.data.stats || null
      } else {
        console.warn('Failed to load product reviews:', data.message)
        productReviews.value = []
        reviewsStats.value = null
      }
    } catch (error) {
      console.warn('Error loading product reviews:', error)
      productReviews.value = []
      reviewsStats.value = null
    } finally {
      reviewsLoading.value = false
    }
  }

  // Load reviews stats
  const loadReviewsStats = async (productId) => {
    if (!productId) return

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/reviews/stats`)
      const data = await response.json()

      if (data.success) {
        reviewsStats.value = data.data
      }
    } catch (error) {
      console.warn('Error loading reviews stats:', error)
    }
  }

  // Get rating percentage
  const getRatingPercentage = (rating, totalReviews) => {
    if (!totalReviews) return 0
    return Math.round((rating / totalReviews) * 100)
  }

  return {
    // State
    productSizes,
    productReviews,
    reviewsStats,
    reviewsLoading,
    sizesLoading,

    // Methods
    loadProductSizes,
    loadProductReviews,
    loadReviewsStats,
    getRatingPercentage,
    checkRateLimit
  }
}
