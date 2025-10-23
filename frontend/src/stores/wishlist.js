import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import wishlistService from '@/services/wishlistService'

export const useWishlistStore = defineStore('wishlist', () => {
  // State
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const itemCount = computed(() => items.value.length)

  const isInWishlist = computed(() => (productId) => {
    return items.value.some(item => item.product_id === productId)
  })

  // Actions
  const fetchWishlistItems = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await wishlistService.getWishlistItems()

      if (response.success) {
        items.value = response.data.items || []
      } else {
        error.value = response.message || 'Failed to fetch wishlist items'
      }
    } catch (err) {
      console.error('Error fetching wishlist items:', err)
      error.value = err.message || 'An error occurred while fetching wishlist items'
    } finally {
      loading.value = false
    }
  }

  const addToWishlist = async (productData) => {
    loading.value = true
    error.value = null

    try {
      // Ensure user_id is included in productData
      if (!productData.user_id) {
        productData.user_id = localStorage.getItem('user_id') || localStorage.getItem('auth_token') || 18
      }

      const response = await wishlistService.addToWishlist(productData)

      if (response.success) {
        // Refresh the wishlist items
        await fetchWishlistItems()
        return { success: true }
      } else {
        error.value = response.message || 'Failed to add to wishlist'
        return { success: false, message: error.value }
      }
    } catch (err) {
      console.error('Error adding to wishlist:', err)
      error.value = err.message || 'An error occurred while adding to wishlist'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const removeFromWishlist = async (wishlistItemId) => {
    loading.value = true
    error.value = null

    try {
      const response = await wishlistService.removeFromWishlist(wishlistItemId)

      if (response.success) {
        // Remove the item from local state
        items.value = items.value.filter(item => item.id !== wishlistItemId)
        return { success: true }
      } else {
        error.value = response.message || 'Failed to remove from wishlist'
        return { success: false, message: error.value }
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err)
      error.value = err.message || 'An error occurred while removing from wishlist'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const clearWishlist = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await wishlistService.clearWishlist()

      if (response.success) {
        items.value = []
        return { success: true }
      } else {
        error.value = response.message || 'Failed to clear wishlist'
        return { success: false, message: error.value }
      }
    } catch (err) {
      console.error('Error clearing wishlist:', err)
      error.value = err.message || 'An error occurred while clearing wishlist'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const getWishlistCount = async () => {
    try {
      const response = await wishlistService.getWishlistCount()

      if (response.success) {
        return response.data.count || 0
      }
      return 0
    } catch (err) {
      console.error('Error getting wishlist count:', err)
      return 0
    }
  }

  return {
    // State
    items,
    loading,
    error,

    // Getters
    itemCount,
    isInWishlist,

    // Actions
    fetchWishlistItems,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    getWishlistCount
  }
})
