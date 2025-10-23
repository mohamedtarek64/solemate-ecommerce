import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useNotifications } from '@/composables/useNotifications'

export function useAdidasProducts() {
  const router = useRouter()
  const { success } = useNotifications()

  // State
  const adidasProducts = ref([])
  const adidasLoading = ref(false)
  const adidasError = ref(null)

  // Helper: normalize product shape
  const normalizeProduct = (p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price ?? p.original_price ?? 0,
    image: p.image || p.main_image,
    image2: p.image2,
    image3: p.image3,
    image4: p.image4,
    images: Array.isArray(p.images) ? p.images : [],
    brand: (p.brand || p.brand_name || '').toLowerCase(),
    category: (p.category || p.category_name || '').toLowerCase(),
    gender: (p.gender || p.for_gender || '').toLowerCase(),
    rating: p.rating || 4.6
  })

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

  // Load Adidas Products from API (with fallback)
  const loadAdidasProducts = async () => {
    adidasLoading.value = true
    adidasError.value = null
    try {
      const raw = await fetchWithFallback(
        '/api/search/products?brand=adidas&limit=6',
        (p) => (p.brand || p.brand_name || '').toLowerCase().includes('adidas'),
        '/api/search/products-by-tab?tab=adidas'
      )
      adidasProducts.value = raw.map(normalizeProduct)
    } catch (error) {
      console.warn('Error loading Adidas products:', error)
      adidasError.value = error.message
      adidasProducts.value = []
    } finally {
      adidasLoading.value = false
    }
  }

  // Card actions
  const viewProduct = (product) => router.push({ name: 'product-detail', params: { id: product.id } })

  const addToCart = (product) => {
    success && success('Added to cart')
  }

  return {
    // State
    adidasProducts,
    adidasLoading,
    adidasError,

    // Methods
    loadAdidasProducts,
    viewProduct,
    addToCart
  }
}
