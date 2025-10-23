import { ref, computed, watch } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useLoadingState } from '@/utils/loadingStates.js'

export function useCartAndWishlist() {
  const cartStore = useCartStore()
  const { loading: cartLoading, withLoading: withCartLoading } = useLoadingState('cart')
  const { loading: wishlistLoading, withLoading: withWishlistLoading } = useLoadingState('wishlist')

  // State
  const isInWishlist = ref(false)
  const wishlistCount = ref(0)
  const isCartOpen = ref(false)

  // Computed
  const cartCount = computed(() => cartStore.totalItems || 0)
  const cartItems = computed(() => cartStore.items || [])

  // Methods
  const loadCartItems = async () => {
    try {
      await withCartLoading(async () => {
        await cartStore.loadCart()
      })
    } catch (error) {
      console.error('Error loading cart items:', error)
    }
  }

  const loadWishlistCount = async () => {
    try {
      await withWishlistLoading(async () => {
        // Load wishlist count logic here
        // This would typically make an API call to get wishlist count
        wishlistCount.value = 0 // Placeholder
      })
    } catch (error) {
      console.error('Error loading wishlist count:', error)
    }
  }

  const toggleCart = () => {
    isCartOpen.value = !isCartOpen.value
  }

  const closeCart = () => {
    isCartOpen.value = false
  }

  const addToWishlist = async (product) => {
    try {
      // Add to wishlist logic here
      isInWishlist.value = true
      wishlistCount.value++
    } catch (error) {
      console.error('Error adding to wishlist:', error)
    }
  }

  const removeFromWishlist = async (product) => {
    try {
      // Remove from wishlist logic here
      isInWishlist.value = false
      wishlistCount.value = Math.max(0, wishlistCount.value - 1)
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    }
  }

  return {
    // State
    isInWishlist,
    wishlistCount,
    isCartOpen,
    cartLoading,
    wishlistLoading,

    // Computed
    cartCount,
    cartItems,

    // Methods
    loadCartItems,
    loadWishlistCount,
    toggleCart,
    closeCart,
    addToWishlist,
    removeFromWishlist
  }
}
