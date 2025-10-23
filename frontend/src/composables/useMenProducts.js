import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotifications } from '@/composables/useNotifications'

export function useMenProducts() {
  const router = useRouter()
  const { success } = useNotifications()

  // State
  const menProducts = ref([])
  const menLoading = ref(false)
  const menError = ref(null)
  const menCarouselIndex = ref({}) // productId -> index
  const menScroller = ref(null)

  // Auto-rotate state
  let menAutoRotateTimer = null
  let menInteractionLock = false

  // Helper functions
  const getProductImages = (product) => {
    // Use the combined images array from normalizeProduct
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images
    }

    // Fallback to single image
    const fallbackImages = [product.image].filter(Boolean)
    return fallbackImages
  }

  const getCurrentIndex = (product) => menCarouselIndex.value[product.id] ?? 0

  const currentProductImage = (product) => {
    const images = getProductImages(product)
    const idx = getCurrentIndex(product)
    return images[Math.min(Math.max(idx, 0), images.length - 1)] || ''
  }

  const nextImage = (product) => {
    const images = getProductImages(product)
    if (!images.length) return
    const idx = getCurrentIndex(product)
    const newIdx = (idx + 1) % images.length
    menCarouselIndex.value[product.id] = newIdx
    }

  const prevImage = (product) => {
    const images = getProductImages(product)
    if (!images.length) return
    const idx = getCurrentIndex(product)
    const newIdx = (idx - 1 + images.length) % images.length
    menCarouselIndex.value[product.id] = newIdx
    }

  // Helper: normalize product shape
  const normalizeProduct = (p) => {
    // Helper to convert object/array to array
    const toArray = (val) => {
      if (Array.isArray(val)) return val
      if (val && typeof val === 'object') return Object.values(val)
      return []
    }

    // Combine all available images with better logic
    const allImages = [
      p.image_url || p.image || p.main_image,
      ...toArray(p.additional_images),
      ...toArray(p.images),
      p.image2,
      p.image3,
      p.image4
    ].filter(Boolean)

    // Remove duplicates
    const uniqueImages = [...new Set(allImages)]
    
    const normalized = {
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price ?? p.original_price ?? 0,
      image: uniqueImages[0] || '',
      images: uniqueImages,
      brand: (p.brand || p.brand_name || '').toLowerCase(),
      category: (p.category || p.category_name || '').toLowerCase(),
      gender: (p.gender || p.for_gender || '').toLowerCase(),
      rating: p.rating || 4.6
    }
    
    return normalized
  }

  // Generic fetch with optional secondary public fallback
  const fetchWithFallback = async (primaryUrl, filterFn, secondaryUrl) => {
    // try primary
    try {
      const res = await fetch(primaryUrl)
      if (res.ok) {
        const payload = await res.json()
        const list = payload.data || payload.products || []
        return filterFn ? list.filter(filterFn) : list
      }
    } catch (_) { /* ignore and fallback */ }

    if (secondaryUrl) {
      try {
        const sec = await fetch(secondaryUrl)
        if (sec.ok) {
          const secPayload = await sec.json()
          const secList = secPayload.data || secPayload.products || []
          return filterFn ? secList.filter(filterFn) : secList
        }
      } catch (_) { /* ignore */ }
    }

    return []
  }

  // Generate placeholder products with multiple images for carousel
  const generatePlaceholderProducts = (featuredImages, categoryImages, instagramImages) => {
    const imgs = [
      ...(featuredImages || []),
      ...(categoryImages || []),
      ...(instagramImages || [])
    ].filter(Boolean)

    // Sample product names for better variety
    const productNames = [
      'Samba OG Shoes',
      'Converse Weapon Mid Top', 
      'Converse Chuck 70 Low Top',
      'Air Max 90 Premium',
      'Stan Smith Classic',
      'Chuck Taylor All Star',
      'Gazelle Indoor Shoes',
      'Campus 80s Vintage'
    ]

    return imgs.slice(0, 8).map((img, idx) => {
      // Create multiple images for carousel by duplicating and modifying URLs
      const baseImages = [img]
      
      // Add variations for carousel (different angles/colors)
      if (img.includes('converse')) {
        baseImages.push(
          img.replace('converse', 'converse-side'),
          img.replace('converse', 'converse-back'),
          img.replace('converse', 'converse-detail')
        )
      } else if (img.includes('adidas')) {
        baseImages.push(
          img.replace('adidas', 'adidas-side'),
          img.replace('adidas', 'adidas-back'),
          img.replace('adidas', 'adidas-detail')
        )
      } else {
        // Generic variations
        baseImages.push(
          img.replace('.jpg', '-side.jpg'),
          img.replace('.jpg', '-back.jpg'),
          img.replace('.jpg', '-detail.jpg')
        )
      }

      return {
        id: 10000 + idx,
        name: productNames[idx] || `Featured Sneaker ${idx + 1}`,
        description: 'Premium performance and comfort with classic style',
        price: 89 + idx * 10,
        image: img,
        images: baseImages.filter(Boolean),
        rating: 4.7
      }
    })
  }

  // Fetch Men products (brand-agnostic, category=men)
  const loadMenProducts = async (featuredImages, categoryImages, instagramImages) => {
    menLoading.value = true
    menError.value = null
    try {
      // Use the correct endpoint for men products
      const response = await fetch('/api/search/products-by-tab?tab=men&limit=16', {
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
      const raw = data.success ? data.data.products : []
      menProducts.value = raw.map(normalizeProduct)

      // Fallback: if empty, build cards from featured images to ensure visible UI
      if (!menProducts.value.length) {
        menProducts.value = generatePlaceholderProducts(featuredImages, categoryImages, instagramImages)
      }

      menCarouselIndex.value = Object.fromEntries(menProducts.value.map(p => [p.id, 0]))
    } catch (e) {
      console.warn('Failed to load men products:', e)
      menError.value = e.message
      menProducts.value = generatePlaceholderProducts(featuredImages, categoryImages, instagramImages)
    } finally {
      menLoading.value = false
    }
  }

  // Horizontal scroll helpers
  const scrollMen = (dir) => {
    const el = menScroller.value
    if (!el) return
    const delta = Math.round(el.clientWidth * 0.8)
    const goingLeft = dir === 'left'
    const goingRight = !goingLeft

    if (goingRight) {
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8
      if (atEnd) {
        // wrap to start
        el.scrollTo({ left: 0, behavior: 'smooth' })
        return
      }
    } else {
      const atStart = el.scrollLeft <= 8
      if (atStart) {
        // wrap to end
        el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' })
        return
      }
    }

    el.scrollBy({ left: goingLeft ? -delta : delta, behavior: 'smooth' })
  }

  // Card actions
  const viewProduct = (product) => router.push({ name: 'ProductDetail', params: { id: product.id }, query: { category: 'men' } })

  const addToCart = (product) => {
    success && success('Added to cart')
  }

  // Auto-rotate per-card images every 2s, pause on user interaction
  const advanceAllCarousels = () => {
    if (menInteractionLock) return
    menProducts.value.forEach((p) => nextImage(p))
  }

  const startMenAutoRotate = () => {
    stopMenAutoRotate()
    // Rotate images every 2 seconds for faster experience
    menAutoRotateTimer = setInterval(advanceAllCarousels, 2000)
  }

  const stopMenAutoRotate = () => {
    if (menAutoRotateTimer) clearInterval(menAutoRotateTimer)
    menAutoRotateTimer = null
  }

  // lock on hover/scroll/click
  const onMenUserInteract = () => {
    menInteractionLock = true
    stopMenAutoRotate()
    // unlock after 3s of inactivity
    setTimeout(() => {
      menInteractionLock = false
      startMenAutoRotate()
    }, 3000)
  }

  // Cleanup on unmount
  onUnmounted(() => {
    stopMenAutoRotate()
  })

  return {
    // State
    menProducts,
    menLoading,
    menError,
    menCarouselIndex,
    menScroller,

    // Methods
    getProductImages,
    getCurrentIndex,
    currentProductImage,
    nextImage,
    prevImage,
    loadMenProducts,
    scrollMen,
    viewProduct,
    addToCart,
    startMenAutoRotate,
    stopMenAutoRotate,
    onMenUserInteract
  }
}
