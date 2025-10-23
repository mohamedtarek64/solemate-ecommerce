import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export function useWomenProducts() {
  const router = useRouter()

  // State
  const womenProducts = ref([])
  const womenLoading = ref(false)
  const womenError = ref(null)
  const womenCarouselIndex = ref({})
  const womenScroller = ref(null)
  let womenAutoRotateTimer = null
  let womenInteractionLock = false

  // Helper to convert object/array to array
  const toArray = (val) => {
    if (Array.isArray(val)) return val
    if (val && typeof val === 'object') return Object.values(val)
    return []
  }

  // Normalize product data
  const normalizeProduct = (p) => {
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
      name: p.name,
      description: p.description,
      price: p.price ?? p.original_price ?? 0,
      image: allImages[0] || '',
      images: allImages, // Combined array
      brand: (p.brand || p.brand_name || '').toLowerCase(),
      category: (p.category || p.category_name || '').toLowerCase(),
      gender: (p.gender || p.for_gender || '').toLowerCase(),
      rating: p.rating || 4.6
    }
  }

  // Get product images
  const getProductImages = (product) => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images
    }

    // Fallback to single image
    const fallbackImages = [product.image].filter(Boolean)
    return fallbackImages
  }

  // Get current product image
  const currentProductImage = (product) => {
    const images = getProductImages(product)
    const currentIndex = womenCarouselIndex.value[product.id] || 0
    return images[currentIndex] || images[0] || ''
  }

  // Get current index
  const getCurrentIndex = (product) => {
    return womenCarouselIndex.value[product.id] || 0
  }

  // Navigate to next image
  const nextImage = (product) => {
    const images = getProductImages(product)
    if (images.length <= 1) return

    const currentIndex = womenCarouselIndex.value[product.id] || 0
    const nextIndex = (currentIndex + 1) % images.length
    womenCarouselIndex.value[product.id] = nextIndex
    }

  // Navigate to previous image
  const prevImage = (product) => {
    const images = getProductImages(product)
    if (images.length <= 1) return

    const currentIndex = womenCarouselIndex.value[product.id] || 0
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1
    womenCarouselIndex.value[product.id] = prevIndex
    }

  // Auto-rotate functionality
  const startWomenAutoRotate = () => {
    if (womenAutoRotateTimer) return
    if (womenInteractionLock) return

    womenAutoRotateTimer = setInterval(advanceAllCarousels, 2000)
  }

  const stopWomenAutoRotate = () => {
    if (womenAutoRotateTimer) {
      clearInterval(womenAutoRotateTimer)
      womenAutoRotateTimer = null
    }
  }

  const advanceAllCarousels = () => {
    womenProducts.value.forEach(product => {
      const images = getProductImages(product)
      if (images.length > 1) {
        nextImage(product)
      }
    })
  }

  // Handle user interaction
  const onWomenUserInteract = () => {
    stopWomenAutoRotate()
    womenInteractionLock = true
    setTimeout(() => {
      womenInteractionLock = false
      startWomenAutoRotate()
    }, 3000)
  }

  // Scroll functionality
  const scrollWomen = (direction) => {
    if (!womenScroller.value) return

    const scrollAmount = 300
    const currentScroll = womenScroller.value.scrollLeft

    if (direction === 'left') {
      womenScroller.value.scrollLeft = Math.max(0, currentScroll - scrollAmount)
    } else {
      womenScroller.value.scrollLeft = currentScroll + scrollAmount
    }
  }

  // Load women products
  const loadWomenProducts = async (featuredImages, categoryImages, instagramImages) => {
    womenLoading.value = true
    womenError.value = null

    try {
      const response = await fetch('/api/search/products-by-tab?tab=women&limit=16', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.success && data.data && data.data.products && Array.isArray(data.data.products)) {
        const normalizedProducts = data.data.products.map(normalizeProduct)
        womenProducts.value = normalizedProducts
        } else {
        console.warn('⚠️ No women products data received')
        womenProducts.value = []
      }
    } catch (err) {
      console.error('❌ Error loading women products:', err)
      womenError.value = err.message
      womenProducts.value = []
    } finally {
      womenLoading.value = false
    }
  }

  // View product
  const viewProduct = (product) => {
    router.push({ name: 'ProductDetail', params: { id: product.id }, query: { category: 'women' } })
  }

  // Add to cart
  const addToCart = (product) => {
    // TODO: Implement add to cart functionality
  }

  // Auto-load on mount
  onMounted(() => {
    // Auto-load will be called from parent component
  })

  return {
    // State
    womenProducts,
    loading: womenLoading,
    error: womenError,
    womenCarouselIndex,
    womenScroller,

    // Actions
    loadWomenProducts,
    viewProduct,
    addToCart,
    getProductImages,
    getCurrentIndex,
    currentProductImage,
    nextImage,
    prevImage,
    scrollWomen,
    startWomenAutoRotate,
    stopWomenAutoRotate,
    onWomenUserInteract
  }
}
