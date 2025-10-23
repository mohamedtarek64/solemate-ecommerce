/**
 * Product Detail Page Optimization
 * Optimizes product detail loading with lazy loading and prefetching
 */

import { ref, computed, watch, onMounted } from 'vue'
import advancedCache from '@/utils/advancedCache'
import performanceMonitor from '@/utils/performanceMonitorEnhanced'

export function useProductDetailOptimization(productId) {
  const product = ref(null)
  const relatedProducts = ref([])
  const reviews = ref([])
  const isLoading = ref(true)
  const loadingStates = ref({
    product: true,
    images: true,
    related: true,
    reviews: true
  })

  /**
   * Load product data with priority
   */
  const loadProductData = async (fetchFn) => {
    const measurement = performanceMonitor.startMeasure('product-detail-load', 'page-load')
    const cacheKey = `product_detail_${productId.value}`

    try {
      // Try cache first
      const cached = advancedCache.get(cacheKey)
      if (cached) {
        product.value = cached
        loadingStates.value.product = false
        performanceMonitor.endMeasure(measurement)
        return cached
      }

      // Fetch product data
      const data = await fetchFn()
      product.value = data
      loadingStates.value.product = false

      // Cache for 15 minutes
      advancedCache.set(cacheKey, data, 15 * 60 * 1000)

      performanceMonitor.endMeasure(measurement)
      return data
    } catch (err) {
      loadingStates.value.product = false
      throw err
    }
  }

  /**
   * Preload main product image
   */
  const preloadMainImage = (imageUrl) => {
    if (!imageUrl) return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = imageUrl
    document.head.appendChild(link)
  }

  /**
   * Load product images progressively
   */
  const loadImagesProgressively = (images) => {
    if (!images || images.length === 0) return

    const measurement = performanceMonitor.startMeasure('product-images-load', 'interaction')

    // Load main image first
    preloadMainImage(images[0])

    // Load remaining images with delay
    images.slice(1).forEach((img, index) => {
      setTimeout(() => {
        const image = new Image()
        image.src = img
      }, index * 100)
    })

    loadingStates.value.images = false
    performanceMonitor.endMeasure(measurement)
  }

  /**
   * Load related products (lazy)
   */
  const loadRelatedProducts = async (fetchFn) => {
    const cacheKey = `related_products_${productId.value}`

    try {
      // Try cache first
      const cached = advancedCache.get(cacheKey)
      if (cached) {
        relatedProducts.value = cached
        loadingStates.value.related = false
        return cached
      }

      const measurement = performanceMonitor.startMeasure('related-products-load', 'api-call')
      
      // Delay to prioritize main product
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const data = await fetchFn()
      relatedProducts.value = data

      // Cache for 10 minutes
      advancedCache.set(cacheKey, data, 10 * 60 * 1000)

      loadingStates.value.related = false
      performanceMonitor.endMeasure(measurement)
      return data
    } catch (err) {
      loadingStates.value.related = false
      console.error('Error loading related products:', err)
      return []
    }
  }

  /**
   * Load reviews (lazy)
   */
  const loadReviews = async (fetchFn) => {
    const cacheKey = `product_reviews_${productId.value}`

    try {
      // Try cache first
      const cached = advancedCache.get(cacheKey)
      if (cached) {
        reviews.value = cached
        loadingStates.value.reviews = false
        return cached
      }

      const measurement = performanceMonitor.startMeasure('reviews-load', 'api-call')
      
      // Delay to prioritize main content
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const data = await fetchFn()
      reviews.value = data

      // Cache for 5 minutes (reviews change more frequently)
      advancedCache.set(cacheKey, data, 5 * 60 * 1000)

      loadingStates.value.reviews = false
      performanceMonitor.endMeasure(measurement)
      return data
    } catch (err) {
      loadingStates.value.reviews = false
      console.error('Error loading reviews:', err)
      return []
    }
  }

  /**
   * Prefetch similar products
   */
  const prefetchSimilarProducts = (category) => {
    setTimeout(() => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = `/api/products?category=${category}&limit=8`
      document.head.appendChild(link)
    }, 1000)
  }

  /**
   * Setup image gallery optimization
   */
  const setupImageGallery = (images) => {
    if (!images || images.length === 0) return

    // Intersection Observer for gallery images
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target
            const src = img.dataset.src
            if (src) {
              img.src = src
              img.classList.add('loaded')
              observer.unobserve(img)
            }
          }
        })
      },
      { rootMargin: '100px' }
    )

    requestAnimationFrame(() => {
      const galleryImages = document.querySelectorAll('[data-gallery-image]')
      galleryImages.forEach(img => observer.observe(img))
    })
  }

  /**
   * Preload images array
   */
  const preloadImages = async (images) => {
    if (!images || images.length === 0) return

    const measurement = performanceMonitor.startMeasure('preload-images', 'interaction')
    
    try {
      const promises = images.map(url => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.onload = () => resolve(img)
          img.onerror = () => reject(new Error(`Failed to preload: ${url}`))
          img.src = url
        })
      })
      
      await Promise.all(promises)
      } catch (err) {
      console.warn('⚠️ Some images failed to preload:', err)
    } finally {
      performanceMonitor.endMeasure(measurement)
    }
  }

  /**
   * Cache product data
   */
  const cacheProductData = async (productData) => {
    if (!productData) return

    const cacheKey = `product_detail_${productId.value}`
    try {
      advancedCache.set(cacheKey, productData, 15 * 60 * 1000) // 15 minutes
      } catch (err) {
      console.warn('⚠️ Failed to cache product data:', err)
    }
  }

  /**
   * Optimistic add to cart
   */
  const optimisticAddToCart = async (cartData) => {
    const measurement = performanceMonitor.startMeasure('add-to-cart', 'interaction')

    try {
      // Show immediate feedback
      // Simulate immediate success
      const notification = {
        type: 'success',
        message: 'Added to cart!',
        show: true
      }

      // Invalidate cart cache
      advancedCache.invalidatePattern('cart')

      performanceMonitor.endMeasure(measurement)
      return notification
    } catch (err) {
      performanceMonitor.endMeasure(measurement)
      throw err
    }
  }

  /**
   * Clear product cache
   */
  const clearCache = () => {
    advancedCache.delete(`product_detail_${productId.value}`)
    advancedCache.delete(`related_products_${productId.value}`)
    advancedCache.delete(`product_reviews_${productId.value}`)
  }

  // Computed
  const isFullyLoaded = computed(() => {
    return !Object.values(loadingStates.value).some(state => state === true)
  })

  // Watch product ID changes
  watch(productId, () => {
    clearCache()
    isLoading.value = true
    loadingStates.value = {
      product: true,
      images: true,
      related: true,
      reviews: true
    }
  })

  // Lifecycle
  onMounted(() => {
    performanceMonitor.measurePageLoad('ProductDetail')
  })

  return {
    product,
    relatedProducts,
    reviews,
    isLoading,
    loadingStates,
    isFullyLoaded,
    loadProductData,
    loadImagesProgressively,
    loadRelatedProducts,
    loadReviews,
    setupImageGallery,
    optimisticAddToCart,
    prefetchSimilarProducts,
    clearCache,
    preloadImages,
    cacheProductData
  }
}

