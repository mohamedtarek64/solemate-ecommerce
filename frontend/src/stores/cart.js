import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import apiService from '@/services/apiService'
import { performanceMonitor } from '@/utils/performanceMonitor.js'

const toast = useToast()

const showNotification = (message, type = 'info') => {
  toast[type](message)
}

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref([])
  const isOpen = ref(false)
  const loading = ref(false)
  const cache = new Map()
  const lastUpdated = ref(0)

  // Discount state
  const promoCode = ref('')
  const discountAmount = ref(0)
  const appliedDiscountCode = ref(null)

  // Getters
  const totalItems = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })

  const totalPrice = computed(() => {
    return items.value.reduce((total, item) => {
      return total + (item.price * item.quantity)
    }, 0)
  })

  const totalSavings = computed(() => {
    return items.value.reduce((total, item) => {
      if (item.originalPrice) {
        return total + ((item.originalPrice - item.price) * item.quantity)
      }
      return total
    }, 0)
  })

  const isEmpty = computed(() => items.value.length === 0)

  const itemCount = computed(() => items.value.length)

  // Optimized cart items loading with caching
  const loadCartItems = async (forceRefresh = false) => {
    // Start performance monitoring
    performanceMonitor.startTiming('cart_load_operation')

    const cacheKey = 'cart_items'
    const cacheTimeout = 30000 // 30 seconds

    // Check cache first
    if (!forceRefresh && cache.has(cacheKey)) {
      const cached = cache.get(cacheKey)
      if (Date.now() - cached.timestamp < cacheTimeout) {
        items.value = cached.data
        return cached.data
      }
    }

    try {
      loading.value = true

      const response = await apiService.getCartItems()

      if (response.success && response.data && response.data.items) {
        // Parse PowerShell formatted data if needed
        const formattedItems = response.data.items.map((item, index) => {
          // Handle PowerShell object format
          const itemData = typeof item === 'string'
            ? JSON.parse(item.replace(/@\{/g, '{').replace(/\}/g, '}'))
            : item

          // Try to get color-specific image
        let itemImage = itemData.product_image || itemData.image || '/images/placeholder-product.jpg'

        // If we have color information, try to find the color image from localStorage
        if (itemData.color_name || itemData.color) {
          const colorName = itemData.color_name || itemData.color
          const productId = itemData.product_id

          // Try to get product data from localStorage
          const savedProductData = localStorage.getItem(`cart_product_${productId}`)
          if (savedProductData) {
            try {
              const productData = JSON.parse(savedProductData)
              if (productData.colors) {
                const colorObj = productData.colors.find(color =>
                  color.color_name === colorName ||
                  color.name === colorName ||
                  color.color === colorName
                )
                if (colorObj && colorObj.image_url) {
                  itemImage = colorObj.image_url
                }
              }
            } catch (e) {
              console.error('Error parsing product data:', e)
            }
          }
        }

        const formattedItem = {
            id: itemData.id || Math.random().toString(36),
            product_id: itemData.product_id, // Add product_id for order creation
            name: itemData.product_name || itemData.name || 'Product',
            price: parseFloat(itemData.product_price || itemData.price) || 0,
            originalPrice: parseFloat(itemData.original_price || itemData.originalPrice) || parseFloat(itemData.product_price || itemData.price) || 0,
            image: itemImage,
            color: itemData.color_name || itemData.color || '',
            size: itemData.size || '',
            quantity: parseInt(itemData.cart_quantity || itemData.quantity) || 1,
            maxQuantity: 10
          }

          return formattedItem
        })

        items.value = formattedItems

        // Cache the result
        cache.set(cacheKey, {
          data: formattedItems,
          timestamp: Date.now()
        })
        lastUpdated.value = Date.now()
      } else {
        items.value = []
        showNotification('Cart is empty', 'info')
      }
    } catch (error) {
      console.error('Error loading cart items:', error)
      showNotification('Failed to load cart items', 'error')
      items.value = []
    } finally {
      loading.value = false

      // End performance monitoring
      const duration = performanceMonitor.endTiming('cart_load_operation')
      if (duration) {
        performanceMonitor.recordMetric('cart_load_duration', duration, {
          forceRefresh,
          itemCount: items.value.length
        })
      }
    }
  }

  // Clear cache
  const clearCache = () => {
    cache.clear()
    lastUpdated.value = 0
  }

  // Set items (for external updates)
  const setItems = (newItems) => {
    items.value = newItems
    lastUpdated.value = Date.now()

    // Update cache
    cache.set('cart_items', {
      data: newItems,
      timestamp: Date.now()
    })
  }

  // Actions
  const addToCart = async (product, selectedSize = null, selectedColor = null, quantity = 1, userId = null) => {
    // Start performance monitoring
    performanceMonitor.startTiming('cart_add_operation')
    
    // Debug logging for product object
    console.log('Adding product to cart:', product)

    // Get product ID early for validation
    const productId = product.id || product.product_id
    if (!productId) {
      console.error('❌ Product ID is missing at the start!', {
        product,
        productKeys: Object.keys(product || {})
      })
      throw new Error('Product ID is required to add item to cart')
    }

    // OPTIMISTIC UPDATE - Add to UI immediately
    const tempId = Date.now() + Math.random()

    // Get the selected color's image
    let selectedColorImage = '/images/placeholder-product.jpg'

    // If selectedColor is an object with image_url, use it
    if (selectedColor && typeof selectedColor === 'object' && selectedColor.image_url) {
      selectedColorImage = selectedColor.image_url
    }
    // If selectedColor is a string, try to find it in product colors
    else if (selectedColor && typeof selectedColor === 'string' && product.colors) {
      const colorObj = product.colors.find(color =>
        color.color_name === selectedColor ||
        color.name === selectedColor ||
        color.color === selectedColor
      )
      if (colorObj && colorObj.image_url) {
        selectedColorImage = colorObj.image_url
      }
    }

    const newItem = {
      id: tempId, // Temporary ID
      name: product.name || product.product_name || 'Unknown Product',
      price: parseFloat(product.price || product.product_price || 0),
      image: selectedColorImage || product.image_url || product.image || product.product_image || '/images/placeholder-product.jpg',
      color: selectedColor || '',
      size: selectedSize || '',
      quantity: quantity,
      maxQuantity: 10,
      isOptimistic: true, // Mark as optimistic
      productData: {
        colors: product.colors || [],
        id: productId
      }
    }

    // Save product data to localStorage for this cart item
    if (newItem.productData.colors.length > 0) {
      const cartItemData = {
        productId: productId,
        colors: product.colors,
        timestamp: Date.now()
      }
      localStorage.setItem(`cart_product_${productId}`, JSON.stringify(cartItemData))
    }

    // Add to UI immediately
    items.value.push(newItem)

    // Make API call in background
    try {
      // Determine correct product table
      let productTable = 'products_women' // default
      if (product.source_table) {
        productTable = product.source_table
      } else if (product.table) {
        productTable = product.table
      } else if (product.product_table) {
        productTable = product.product_table
      } else if (product.category) {
        // Fallback to category-based detection
        if (product.category.toLowerCase().includes('men')) {
          productTable = 'products_men'
        } else if (product.category.toLowerCase().includes('kids')) {
          productTable = 'products_kids'
        }
      }

      // Get user ID for logging and API call
      const finalUserId = userId || localStorage.getItem('user_id') || localStorage.getItem('auth_token') || 'not_found'

      const response = await apiService.addToCart(
        productId,
        quantity,
        selectedColor || '',
        selectedSize || '',
        productTable,
        finalUserId
      )

      if (response.success) {
        // Update the item with real ID
        const itemIndex = items.value.findIndex(item => item.id === tempId)
        if (itemIndex !== -1) {
          items.value[itemIndex].id = response.data?.cart_item_id || tempId
          items.value[itemIndex].isOptimistic = false
        }
      } else {
        // Remove the optimistic item on failure
        items.value = items.value.filter(item => item.id !== tempId)
        showNotification(response.message || 'Failed to add product to cart', 'error')
      }
    } catch (error) {
      // Remove the optimistic item on error
      items.value = items.value.filter(item => item.id !== tempId)
      console.error('Error adding to cart:', error)
      showNotification('Failed to add product to cart', 'error')
    } finally {
      // End performance monitoring
      const duration = performanceMonitor.endTiming('cart_add_operation')
      if (duration) {
        performanceMonitor.recordMetric('cart_add_duration', duration, {
          productId: product.id,
          quantity,
          size: selectedSize
        })
      }
    }
  }

  const removeFromCart = async (itemId) => {
    // Start performance monitoring
    performanceMonitor.startTiming('cart_remove_operation')

    try {
      // Optimistic update - remove from UI immediately
      const itemIndex = items.value.findIndex(item => item.id === itemId)
      const removedItem = itemIndex !== -1 ? items.value[itemIndex] : null

      if (itemIndex !== -1) {
        items.value.splice(itemIndex, 1)
      }

      // Make API call in background
      const response = await apiService.removeCartItem(itemId)

      if (!response.success) {
        // Revert optimistic update on failure
        if (removedItem) {
          items.value.splice(itemIndex, 0, removedItem)
        }
        showNotification(response.message || 'Failed to remove product from cart', 'error')
      }
    } catch (error) {
      console.error('Error removing from cart:', error)
      // Revert optimistic update on error
      if (removedItem) {
        items.value.splice(itemIndex, 0, removedItem)
      }
      showNotification('Failed to remove product from cart', 'error')
    } finally {
      // End performance monitoring
      const duration = performanceMonitor.endTiming('cart_remove_operation')
      if (duration) {
        performanceMonitor.recordMetric('cart_remove_duration', duration, {
          itemId
        })
      }
    }
  }

  const updateQuantity = async (itemId, quantity) => {
    // Start performance monitoring
    performanceMonitor.startTiming('cart_update_quantity_operation')

    // Declare variables outside try block so they're accessible in catch
    let itemIndex = -1
    let oldQuantity = 0

    try {
      if (quantity <= 0) {
        await removeFromCart(itemId)
        return
      }

      // Optimistic update - update UI immediately
      itemIndex = items.value.findIndex(item => item.id === itemId)
      if (itemIndex !== -1) {
        oldQuantity = items.value[itemIndex].quantity
        items.value[itemIndex].quantity = quantity
      }

      // Make API call in background
      const response = await apiService.updateCartItem(itemId, quantity)

      if (!response.success) {
        // Revert optimistic update on failure
        if (itemIndex !== -1) {
          items.value[itemIndex].quantity = oldQuantity
        }
        showNotification(response.message || 'Failed to update quantity', 'error')
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
      // Revert optimistic update on error
      if (itemIndex !== -1) {
        items.value[itemIndex].quantity = oldQuantity
      }
      showNotification('Failed to update quantity', 'error')
    } finally {
      // End performance monitoring
      const duration = performanceMonitor.endTiming('cart_update_quantity_operation')
      if (duration) {
        performanceMonitor.recordMetric('cart_update_quantity_duration', duration, {
          itemId,
          quantity
        })
      }
    }
  }

  const incrementQuantity = async (itemId) => {
    const item = items.value.find(item => item.id === itemId)
    if (item && item.quantity < 10) { // Max quantity from backend
      await updateQuantity(itemId, item.quantity + 1)
    }
  }

  const decrementQuantity = async (itemId) => {
    const item = items.value.find(item => item.id === itemId)
    if (item && item.quantity > 1) {
      await updateQuantity(itemId, item.quantity - 1)
    } else if (item && item.quantity === 1) {
      await removeFromCart(itemId)
    }
  }

  const clearCart = async () => {
    // Start performance monitoring
    performanceMonitor.startTiming('cart_clear_operation')

    try {
      loading.value = true

      const response = await apiService.clearCart()

      if (response.success) {
        // Reload cart items from API
        await loadCartItems()
        showNotification('Cart cleared!', 'info')
      } else {
        showNotification(response.message || 'Failed to clear cart', 'error')
      }
    } catch (error) {
      console.error('Error clearing cart:', error)
      showNotification('Failed to clear cart', 'error')
    } finally {
      loading.value = false

      // End performance monitoring
      const duration = performanceMonitor.endTiming('cart_clear_operation')
      if (duration) {
        performanceMonitor.recordMetric('cart_clear_duration', duration)
      }
    }
  }

  const toggleCart = () => {
    isOpen.value = !isOpen.value
  }

  const openCart = () => {
    isOpen.value = true
  }

  const closeCart = () => {
    isOpen.value = false
  }

  const getItemById = (itemId) => {
    return items.value.find(item => item.id === itemId)
  }

  const isInCart = (productId, size = null, color = null) => {
    return items.value.some(item =>
      item.id === productId &&
      item.size === size &&
      item.color === color
    )
  }

  const getCartItemCount = (productId, size = null, color = null) => {
    const item = items.value.find(item =>
      item.id === productId &&
      item.size === size &&
      item.color === color
    )
    return item ? item.quantity : 0
  }

  // Get cart count from API
  const getCartCount = async () => {
    try {
      const response = await apiService.getCartCount()
      return response.success ? response.data.total_quantity : 0
    } catch (error) {
      console.error('Error getting cart count:', error)
      return 0
    }
  }

  // Get current user ID (for compatibility)
  const getCurrentUserId = () => {
    return apiService.getCurrentUserId()
  }

  // Persist cart to localStorage
  const saveToStorage = () => {
    localStorage.setItem('solemate-cart', JSON.stringify(items.value))
  }

  const loadFromStorage = () => {
    const saved = localStorage.getItem('solemate-cart')
    if (saved) {
      try {
        items.value = JSON.parse(saved)
      } catch (error) {
        console.error('Error loading cart from storage:', error)
        items.value = []
      }
    }
  }

  // Initialize cart from API instead of localStorage
  // loadFromStorage() // Commented out - using API instead

  // Auto-load cart items when store is created
  loadCartItems()

  // Watch for changes and save to storage (optional - for offline support)
  const watchCart = () => {
    // This would be implemented with a watcher in a real app
    saveToStorage()
  }

  return {
    // State
    items,
    isOpen,
    loading,
    lastUpdated,

    // Getters
    totalItems,
    totalPrice,
    totalSavings,
    isEmpty,
    itemCount,

    // Discount state
    promoCode,
    discountAmount,
    appliedDiscountCode,

    // Actions
    loadCartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    toggleCart,
    openCart,
    closeCart,
    getItemById,
    clearCache,
    setItems,
    isInCart,
    getCartItemCount,
    getCartCount,
    getCurrentUserId,
    saveToStorage,
    loadFromStorage
  }
})
