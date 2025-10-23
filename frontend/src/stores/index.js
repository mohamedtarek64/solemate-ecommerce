// Stores Index - Centralized store exports
// This file provides a clean way to import stores throughout the application

export { useAuthStore } from './auth'
export { useCartStore } from './cart'
export { useCategoryStore } from './categories'
export { useCheckoutStore } from './checkout'
export { useImageStore } from './imageStore'
export { useProductStore } from './productStore'
export { useSearchStore } from './search'
export { useVisualSearchStore } from './visualSearch'
export { useWishlistStore } from './wishlist'

// Store initialization helper
export const initializeStores = (pinia) => {
  // This function can be used to initialize stores with any global configuration
  }
