/**
 * Cart Helper Functions
 * Utility functions for shopping cart operations
 */

/**
 * Calculate cart totals
 * @param {Array} items - Cart items
 * @returns {Object} - Cart totals
 */
export function calculateCartTotals(items) {
  if (!items || !Array.isArray(items)) {
    return {
      subtotal: 0,
      tax: 0,
      shipping: 0,
      discount: 0,
      total: 0,
      itemCount: 0
    }
  }

  const subtotal = items.reduce((sum, item) => {
    return sum + (item.price * item.quantity)
  }, 0)

  const itemCount = items.reduce((sum, item) => {
    return sum + item.quantity
  }, 0)

  // Calculate tax (example: 8.5%)
  const taxRate = 0.085
  const tax = subtotal * taxRate

  // Calculate shipping (example: free over $50, otherwise $5.99)
  const shippingThreshold = 50
  const shipping = subtotal >= shippingThreshold ? 0 : 5.99

  // Calculate discount (example: 10% off over $100)
  const discountThreshold = 100
  const discountRate = 0.10
  const discount = subtotal >= discountThreshold ? subtotal * discountRate : 0

  const total = subtotal + tax + shipping - discount

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    total: Math.round(total * 100) / 100,
    itemCount
  }
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} - Formatted currency string
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

/**
 * Validate cart item
 * @param {Object} item - Cart item to validate
 * @returns {Object} - Validation result
 */
export function validateCartItem(item) {
  const errors = []

  if (!item) {
    errors.push('Item is required')
    return { isValid: false, errors }
  }

  if (!item.product_id) {
    errors.push('Product ID is required')
  }

  if (!item.quantity || item.quantity <= 0) {
    errors.push('Quantity must be greater than 0')
  }

  if (item.quantity && item.quantity > 999) {
    errors.push('Quantity cannot exceed 999')
  }

  if (!item.price || item.price < 0) {
    errors.push('Price must be a positive number')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Check if product is in cart
 * @param {Array} cartItems - Cart items
 * @param {number} productId - Product ID to check
 * @returns {Object|null} - Cart item if found, null otherwise
 */
export function findCartItem(cartItems, productId) {
  if (!cartItems || !Array.isArray(cartItems)) {
    return null
  }

  return cartItems.find(item => item.product_id === productId)
}

/**
 * Get cart item quantity
 * @param {Array} cartItems - Cart items
 * @param {number} productId - Product ID
 * @returns {number} - Quantity of the product in cart
 */
export function getCartItemQuantity(cartItems, productId) {
  const item = findCartItem(cartItems, productId)
  return item ? item.quantity : 0
}

/**
 * Calculate item total
 * @param {Object} item - Cart item
 * @returns {number} - Item total (price * quantity)
 */
export function calculateItemTotal(item) {
  if (!item || !item.price || !item.quantity) {
    return 0
  }
  return Math.round((item.price * item.quantity) * 100) / 100
}

/**
 * Generate cart summary
 * @param {Array} items - Cart items
 * @returns {Object} - Cart summary
 */
export function generateCartSummary(items) {
  const totals = calculateCartTotals(items)
  
  return {
    ...totals,
    formattedSubtotal: formatCurrency(totals.subtotal),
    formattedTax: formatCurrency(totals.tax),
    formattedShipping: formatCurrency(totals.shipping),
    formattedDiscount: formatCurrency(totals.discount),
    formattedTotal: formatCurrency(totals.total),
    isEmpty: items.length === 0,
    hasItems: items.length > 0,
    isEligibleForFreeShipping: totals.subtotal >= 50,
    isEligibleForDiscount: totals.subtotal >= 100
  }
}

/**
 * Sort cart items
 * @param {Array} items - Cart items
 * @param {string} sortBy - Sort field (name, price, quantity, added_at)
 * @param {string} sortOrder - Sort order (asc, desc)
 * @returns {Array} - Sorted cart items
 */
export function sortCartItems(items, sortBy = 'added_at', sortOrder = 'desc') {
  if (!items || !Array.isArray(items)) {
    return []
  }

  return [...items].sort((a, b) => {
    let aValue = a[sortBy]
    let bValue = b[sortBy]

    // Handle different data types
    if (sortBy === 'added_at') {
      aValue = new Date(aValue)
      bValue = new Date(bValue)
    } else if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })
}

/**
 * Filter cart items
 * @param {Array} items - Cart items
 * @param {Object} filters - Filter criteria
 * @returns {Array} - Filtered cart items
 */
export function filterCartItems(items, filters = {}) {
  if (!items || !Array.isArray(items)) {
    return []
  }

  return items.filter(item => {
    // Filter by category
    if (filters.category && item.product?.category !== filters.category) {
      return false
    }

    // Filter by price range
    if (filters.minPrice && item.price < filters.minPrice) {
      return false
    }
    if (filters.maxPrice && item.price > filters.maxPrice) {
      return false
    }

    // Filter by availability
    if (filters.availableOnly && !item.product?.is_available) {
      return false
    }

    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const productName = item.product?.name?.toLowerCase() || ''
      const productDescription = item.product?.description?.toLowerCase() || ''
      
      if (!productName.includes(searchTerm) && !productDescription.includes(searchTerm)) {
        return false
      }
    }

    return true
  })
}

/**
 * Export cart data
 * @param {Array} items - Cart items
 * @param {Object} totals - Cart totals
 * @returns {Object} - Exported cart data
 */
export function exportCartData(items, totals) {
  return {
    items: items.map(item => ({
      product_id: item.product_id,
      product_name: item.product?.name || 'Unknown Product',
      quantity: item.quantity,
      price: item.price,
      total: calculateItemTotal(item)
    })),
    totals,
    exported_at: new Date().toISOString(),
    item_count: items.length
  }
}

/**
 * Import cart data
 * @param {Object} cartData - Cart data to import
 * @returns {Object} - Import result
 */
export function importCartData(cartData) {
  const errors = []
  const items = []

  if (!cartData || !cartData.items) {
    errors.push('Invalid cart data format')
    return { success: false, errors, items }
  }

  if (!Array.isArray(cartData.items)) {
    errors.push('Items must be an array')
    return { success: false, errors, items }
  }

  for (const item of cartData.items) {
    const validation = validateCartItem(item)
    if (!validation.isValid) {
      errors.push(`Invalid item: ${validation.errors.join(', ')}`)
      continue
    }

    items.push({
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      added_at: new Date().toISOString()
    })
  }

  return {
    success: errors.length === 0,
    errors,
    items
  }
}

/**
 * Get cart storage key
 * @param {number} userId - User ID
 * @returns {string} - Storage key
 */
export function getCartStorageKey(userId = null) {
  return userId ? `cart_${userId}` : 'cart_guest'
}

/**
 * Save cart to localStorage
 * @param {Array} items - Cart items
 * @param {number} userId - User ID
 */
export function saveCartToStorage(items, userId = null) {
  try {
    const key = getCartStorageKey(userId)
    const cartData = {
      items,
      saved_at: new Date().toISOString()
    }
    localStorage.setItem(key, JSON.stringify(cartData))
  } catch (error) {
    console.error('Error saving cart to storage:', error)
  }
}

/**
 * Load cart from localStorage
 * @param {number} userId - User ID
 * @returns {Array} - Cart items
 */
export function loadCartFromStorage(userId = null) {
  try {
    const key = getCartStorageKey(userId)
    const cartData = localStorage.getItem(key)
    
    if (!cartData) {
      return []
    }

    const parsed = JSON.parse(cartData)
    return parsed.items || []
  } catch (error) {
    console.error('Error loading cart from storage:', error)
    return []
  }
}

/**
 * Clear cart from localStorage
 * @param {number} userId - User ID
 */
export function clearCartFromStorage(userId = null) {
  try {
    const key = getCartStorageKey(userId)
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error clearing cart from storage:', error)
  }
}
