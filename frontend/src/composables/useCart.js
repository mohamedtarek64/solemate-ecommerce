/**
 * Cart Composable
 *
 * Enhanced cart functionality with improved error handling and state management
 */
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBaseComposable } from './useBaseComposable'
import { useApi } from './useApi'
import { useCartStore } from '@/stores/cart'
import { calculateOrderSummary, calculateShippingCost } from '@/utils/orderCalculations'

export function useCart() {
  const base = useBaseComposable()
  const api = useApi()
  const cartStore = useCartStore()
  const router = useRouter()

  // Cart-specific state
  const isCartOpen = ref(false)
  // Use cart store instead of local state
  const cartItems = computed(() => cartStore.items)
  const cartSummary = computed(() => ({
    totalItems: cartStore.totalItems,
    totalPrice: cartStore.totalPrice,
    totalSavings: cartStore.totalSavings,
    itemsCount: cartStore.itemCount
  }))

  // Computed properties
  const isEmpty = computed(() => cartItems.value.length === 0)
  const hasItems = computed(() => !isEmpty.value)
  const totalItems = computed(() => cartSummary.value.totalItems)
  const totalPrice = computed(() => cartSummary.value.totalPrice)
  const totalSavings = computed(() => cartSummary.value.totalSavings)

  // Promo code functionality
  const promoCode = ref('')
  const discountAmount = ref(0)
  const appliedDiscountCode = ref(null)

  // Cart summary for Cart.vue - using unified calculations
  const subtotal = computed(() => totalPrice.value || 0)
  const shippingCost = computed(() => calculateShippingCost(subtotal.value))
  
  // Use unified order calculation
  const orderSummary = computed(() => {
    return calculateOrderSummary(
      subtotal.value,
      shippingCost.value,
      discountAmount.value
    )
  })
  
  const taxAmount = computed(() => orderSummary.value.tax)
  const totalAmount = computed(() => orderSummary.value.total)

  // Cart operations
  const loadCartItems = async (forceRefresh = false) => {
    const cacheKey = `api_cache_cart_${cartStore.getCurrentUserId()}`

    try {
      let result

      if (forceRefresh) {
        result = await api.apiGet('/cart')
      } else {
        result = await api.fetchWithCache('/cart', cacheKey)
      }

      if (result.success) {
        // Update store instead of local assignment
        await cartStore.loadCartItems()
      }

      return result
    } catch (err) {
      base.showError('Failed to load cart items')
      throw err
    }
  }

  const addToCart = async (product, quantity = 1, variant = {}) => {
    const { color = '', size = '', productTable = 'products_women' } = variant

    return base.executeAsync(
      async () => {
        // Use cart store instead of direct API call
        await cartStore.addToCart(product, size, color)
        // Don't show success message here - cart store handles it
        return { success: true }
      },
      {
        showSuccessMessage: null, // We handle success message manually
        showErrorMessage: `Failed to add ${product.name} to cart`
      }
    )
  }

  const updateQuantity = async (itemId, quantity) => {
    return base.executeAsync(
      async () => {
        // Use cart store instead of direct API call
        await cartStore.updateQuantity(itemId, quantity)
        // Don't show success message here - cart store handles it
        return { success: true }
      },
      {
        showSuccessMessage: null,
        showErrorMessage: 'Failed to update quantity'
      }
    )
  }

  const removeFromCart = async (itemId) => {
    return base.executeAsync(
      async () => {
        // Use cart store instead of direct API call
        await cartStore.removeFromCart(itemId)
        // Don't show success message here - cart store handles it
        return { success: true }
      },
      {
        showSuccessMessage: null,
        showErrorMessage: 'Failed to remove item from cart'
      }
    )
  }

  const clearCart = async () => {
    return base.executeAsync(
      async () => {
        // Use cart store instead of direct API call
        await cartStore.clearCart()
        // Don't show success message here - cart store handles it
        return { success: true }
      },
      {
        showSuccessMessage: null,
        showErrorMessage: 'Failed to clear cart'
      }
    )
  }

  const getCartCount = async () => {
    try {
      const result = await api.apiGet('/cart/count')
      return result.success ? result.data.total_quantity : 0
    } catch (err) {
      console.error('Failed to get cart count:', err)
      return 0
    }
  }

  // Cart UI operations
  const openCart = () => {
    isCartOpen.value = true
  }

  const closeCart = () => {
    isCartOpen.value = false
  }

  const toggleCart = () => {
    isCartOpen.value = !isCartOpen.value
  }

  // Cart validation
  const validateCartItem = (item) => {
    const errors = []

    if (!item.product_id) {
      errors.push('Product ID is required')
    }

    if (!item.quantity || item.quantity < 1) {
      errors.push('Quantity must be at least 1')
    }

    if (item.quantity > 10) {
      errors.push('Quantity cannot exceed 10')
    }

    return errors
  }

  const validateCart = () => {
    const errors = []

    if (!cartItems.value || !Array.isArray(cartItems.value)) {
      errors.push('Cart items are not properly loaded')
      return errors
    }

    cartItems.value.forEach((item, index) => {
      const itemErrors = validateCartItem(item)
      if (itemErrors.length > 0) {
        errors.push(`Item ${index + 1}: ${itemErrors.join(', ')}`)
      }
    })

    return errors
  }

  // Cart utilities
  const findCartItem = (productId, variant = {}) => {
    const { color = '', size = '' } = variant

    return cartItems.value.find(item =>
      item.id === productId &&
      item.color === color &&
      item.size === size
    )
  }

  const getItemQuantity = (productId, variant = {}) => {
    const item = findCartItem(productId, variant)
    return item ? item.quantity : 0
  }

  const isInCart = (productId, variant = {}) => {
    return !!findCartItem(productId, variant)
  }

  // Bulk operations
  const bulkUpdateQuantities = async (updates) => {
    const promises = updates.map(({ itemId, quantity }) =>
      updateQuantity(itemId, quantity)
    )

    return Promise.allSettled(promises)
  }

  const bulkRemoveItems = async (itemIds) => {
    const promises = itemIds.map(itemId =>
      removeFromCart(itemId)
    )

    return Promise.allSettled(promises)
  }

  // Cart persistence
  const saveCartToStorage = () => {
    localStorage.setItem('cart_backup', JSON.stringify({
      items: cartItems.value,
      summary: cartSummary.value,
      timestamp: Date.now()
    }))
  }

  const loadCartFromStorage = () => {
    const backup = localStorage.getItem('cart_backup')
    if (backup) {
      try {
        const data = JSON.parse(backup)
        // Don't modify computed properties - use store instead
        } catch (err) {
        console.error('Failed to load cart from storage:', err)
      }
    }
  }

  // Initialize cart
  const initializeCart = async () => {
    try {
      await cartStore.loadCartItems()
    } catch (err) {
      console.error('Failed to initialize cart:', err)
      loadCartFromStorage() // Fallback to local storage
    }
  }

  // Sync with cart store
  const syncDiscountToStore = () => {
    cartStore.promoCode = promoCode.value
    cartStore.discountAmount = discountAmount.value
    cartStore.appliedDiscountCode = appliedDiscountCode.value
  }

  const applyPromoCode = async () => {
    if (!promoCode.value.trim()) {
      base.showError('Please enter a promo code')
      return
    }

    // Validate promo code format on frontend
    const codeRegex = /^[A-Z0-9]{3,50}$/
    const trimmedCode = promoCode.value.trim().toUpperCase()

    if (!codeRegex.test(trimmedCode)) {
      base.showError('Invalid promo code format. Use 3-50 uppercase letters and numbers only.')
      return
    }

    if (subtotal.value <= 0) {
      base.showError('Cart must contain items to apply promo code')
      return
    }

    // Declare requestData outside try-catch so it's accessible in catch block
    let requestData = null

    try {
      // Get product IDs from cart items (with safety check)
      if (!cartItems.value || !Array.isArray(cartItems.value)) {
        base.showError('Cart items are not properly loaded')
        return
      }

      const productIds = cartItems.value.map(item => item.product_id || item.id).filter(Boolean)

      // Prepare request data
      requestData = {
        code: trimmedCode,
        total_amount: subtotal.value,
        product_ids: productIds,
        category_ids: [] // You can add category logic here if needed
      }

      console.log('Applying promo code:', {
        code: trimmedCode,
        total_amount: subtotal.value,
        product_ids_count: productIds.length,
        category_ids: Array.isArray(requestData.category_ids)
      })
      
      // Debug cart items
      // Call Laravel API to validate and apply discount
      const response = await api.apiPost('/discount-codes/validate', requestData)

      if (response.success) {
        discountAmount.value = response.data.discount_amount
        appliedDiscountCode.value = response.data.discount_code

        // Sync to cart store
        syncDiscountToStore()

        // Show success message with discount details
        const discountText = response.data.discount_code.type === 'percentage'
          ? `${response.data.discount_code.value}% off`
          : `$${response.data.discount_code.value} off`

        base.showSuccess(`Promo code "${response.data.discount_code.name}" applied! ${discountText} - You saved $${response.data.discount_amount.toFixed(2)}`)
      } else {
        throw new Error(response.message || 'Invalid promo code')
      }
    } catch (error) {
      console.error('Error applying promo code:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        requestData: requestData,
        cartItems: cartItems.value,
        subtotal: subtotal.value
      })
      
      // Enhanced error message based on error type
      let errorMessage = 'Failed to apply promo code'
      if (error.message.includes('Discount code does not apply to this order')) {
        errorMessage = 'This promo code does not apply to your current order. Please check the minimum amount requirements.'
      } else if (error.message.includes('Invalid discount code')) {
        errorMessage = 'Invalid promo code. Please check the code and try again.'
      } else if (error.message.includes('expired')) {
        errorMessage = 'This promo code has expired.'
      } else if (error.message.includes('usage limit')) {
        errorMessage = 'This promo code has reached its usage limit.'
      }
      
      base.showError(errorMessage)
      discountAmount.value = 0
      appliedDiscountCode.value = null
    }
  }

  // Checkout functionality
  const proceedToCheckout = () => {
    if (cartItems.value.length === 0) {
      base.showError('Your cart is empty')
      return
    }

    // Check if user is authenticated
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    if (!token) {
      base.showError('Please login to proceed to checkout')
      setTimeout(() => {
        router.push('/login')
      }, 1500)
      return
    }

    // Show loading message
    base.showSuccess('Redirecting to checkout...')

    // Navigate to checkout page
    setTimeout(() => {
      router.push('/checkout')
    }, 1000)
  }

  return {
    // Base composable methods
    ...base,

    // Cart state
    isCartOpen,
    cartItems,
    cartSummary,

    // Computed
    isEmpty,
    hasItems,
    totalItems,
    totalPrice,
    totalSavings,

    // Cart summary
    subtotal,
    shippingCost,
    taxAmount,
    totalAmount,
    orderSummary,

    // Cart operations
    loadCartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    removeItem: removeFromCart, // Alias for Cart.vue
    clearCart,
    getCartCount,

    // UI operations
    openCart,
    closeCart,
    toggleCart,

    // Validation
    validateCartItem,
    validateCart,

    // Utilities
    findCartItem,
    getItemQuantity,
    isInCart,

    // Bulk operations
    bulkUpdateQuantities,
    bulkRemoveItems,

    // Persistence
    saveCartToStorage,
    loadCartFromStorage,
    initializeCart,

    // Promo code and checkout
    promoCode,
    discountAmount,
    appliedDiscountCode,
    applyPromoCode,
    syncDiscountToStore,
    proceedToCheckout
  }
}
