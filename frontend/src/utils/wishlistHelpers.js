/**
 * Wishlist Helper Functions
 * Utility functions for wishlist operations
 */

/**
 * Calculate wishlist totals
 * @param {Array} wishlists - Wishlists
 * @returns {Object} - Wishlist totals
 */
export function calculateWishlistTotals(wishlists) {
  if (!wishlists || !Array.isArray(wishlists)) {
    return {
      totalWishlists: 0,
      totalItems: 0,
      totalValue: 0
    }
  }

  const totalWishlists = wishlists.length
  let totalItems = 0
  let totalValue = 0

  wishlists.forEach(wishlist => {
    if (wishlist.items && Array.isArray(wishlist.items)) {
      totalItems += wishlist.items.length
      totalValue += wishlist.items.reduce((sum, item) => {
        return sum + (item.product?.price || 0) * (item.quantity || 1)
      }, 0)
    }
  })

  return {
    totalWishlists,
    totalItems,
    totalValue: Math.round(totalValue * 100) / 100
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
 * Validate wishlist
 * @param {Object} wishlist - Wishlist to validate
 * @returns {Object} - Validation result
 */
export function validateWishlist(wishlist) {
  const errors = []

  if (!wishlist) {
    errors.push('Wishlist is required')
    return { isValid: false, errors }
  }

  if (!wishlist.name || wishlist.name.trim().length === 0) {
    errors.push('Wishlist name is required')
  }

  if (wishlist.name && wishlist.name.length > 100) {
    errors.push('Wishlist name cannot exceed 100 characters')
  }

  if (wishlist.description && wishlist.description.length > 500) {
    errors.push('Wishlist description cannot exceed 500 characters')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate wishlist item
 * @param {Object} item - Wishlist item to validate
 * @returns {Object} - Validation result
 */
export function validateWishlistItem(item) {
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

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Find wishlist by ID
 * @param {Array} wishlists - Wishlists
 * @param {number} id - Wishlist ID
 * @returns {Object|null} - Wishlist if found, null otherwise
 */
export function findWishlistById(wishlists, id) {
  if (!wishlists || !Array.isArray(wishlists)) {
    return null
  }

  return wishlists.find(wishlist => wishlist.id === id)
}

/**
 * Find wishlist by name
 * @param {Array} wishlists - Wishlists
 * @param {string} name - Wishlist name
 * @returns {Object|null} - Wishlist if found, null otherwise
 */
export function findWishlistByName(wishlists, name) {
  if (!wishlists || !Array.isArray(wishlists)) {
    return null
  }

  return wishlists.find(wishlist => 
    wishlist.name.toLowerCase() === name.toLowerCase()
  )
}

/**
 * Check if product is in wishlist
 * @param {Object} wishlist - Wishlist
 * @param {number} productId - Product ID to check
 * @returns {Object|null} - Wishlist item if found, null otherwise
 */
export function findWishlistItem(wishlist, productId) {
  if (!wishlist || !wishlist.items || !Array.isArray(wishlist.items)) {
    return null
  }

  return wishlist.items.find(item => item.product_id === productId)
}

/**
 * Check if product is in any wishlist
 * @param {Array} wishlists - Wishlists
 * @param {number} productId - Product ID to check
 * @returns {Object|null} - Wishlist and item if found, null otherwise
 */
export function findProductInWishlists(wishlists, productId) {
  if (!wishlists || !Array.isArray(wishlists)) {
    return null
  }

  for (const wishlist of wishlists) {
    const item = findWishlistItem(wishlist, productId)
    if (item) {
      return { wishlist, item }
    }
  }

  return null
}

/**
 * Get wishlist item quantity
 * @param {Object} wishlist - Wishlist
 * @param {number} productId - Product ID
 * @returns {number} - Quantity of the product in wishlist
 */
export function getWishlistItemQuantity(wishlist, productId) {
  const item = findWishlistItem(wishlist, productId)
  return item ? item.quantity : 0
}

/**
 * Calculate wishlist item total
 * @param {Object} item - Wishlist item
 * @returns {number} - Item total (price * quantity)
 */
export function calculateWishlistItemTotal(item) {
  if (!item || !item.product?.price || !item.quantity) {
    return 0
  }
  return Math.round((item.product.price * item.quantity) * 100) / 100
}

/**
 * Generate wishlist summary
 * @param {Object} wishlist - Wishlist
 * @returns {Object} - Wishlist summary
 */
export function generateWishlistSummary(wishlist) {
  if (!wishlist || !wishlist.items) {
    return {
      itemCount: 0,
      totalValue: 0,
      formattedTotalValue: formatCurrency(0),
      isEmpty: true,
      hasItems: false,
      averagePrice: 0,
      formattedAveragePrice: formatCurrency(0)
    }
  }

  const itemCount = wishlist.items.length
  const totalValue = wishlist.items.reduce((sum, item) => {
    return sum + calculateWishlistItemTotal(item)
  }, 0)

  const averagePrice = itemCount > 0 ? totalValue / itemCount : 0

  return {
    itemCount,
    totalValue: Math.round(totalValue * 100) / 100,
    formattedTotalValue: formatCurrency(totalValue),
    isEmpty: itemCount === 0,
    hasItems: itemCount > 0,
    averagePrice: Math.round(averagePrice * 100) / 100,
    formattedAveragePrice: formatCurrency(averagePrice)
  }
}

/**
 * Sort wishlist items
 * @param {Array} items - Wishlist items
 * @param {string} sortBy - Sort field (name, price, quantity, added_at)
 * @param {string} sortOrder - Sort order (asc, desc)
 * @returns {Array} - Sorted wishlist items
 */
export function sortWishlistItems(items, sortBy = 'added_at', sortOrder = 'desc') {
  if (!items || !Array.isArray(items)) {
    return []
  }

  return [...items].sort((a, b) => {
    let aValue, bValue

    switch (sortBy) {
      case 'name':
        aValue = a.product?.name?.toLowerCase() || ''
        bValue = b.product?.name?.toLowerCase() || ''
        break
      case 'price':
        aValue = a.product?.price || 0
        bValue = b.product?.price || 0
        break
      case 'quantity':
        aValue = a.quantity || 0
        bValue = b.quantity || 0
        break
      case 'added_at':
        aValue = new Date(a.added_at)
        bValue = new Date(b.added_at)
        break
      default:
        aValue = a[sortBy]
        bValue = b[sortBy]
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })
}

/**
 * Filter wishlist items
 * @param {Array} items - Wishlist items
 * @param {Object} filters - Filter criteria
 * @returns {Array} - Filtered wishlist items
 */
export function filterWishlistItems(items, filters = {}) {
  if (!items || !Array.isArray(items)) {
    return []
  }

  return items.filter(item => {
    // Filter by category
    if (filters.category && item.product?.category !== filters.category) {
      return false
    }

    // Filter by price range
    if (filters.minPrice && item.product?.price < filters.minPrice) {
      return false
    }
    if (filters.maxPrice && item.product?.price > filters.maxPrice) {
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
 * Export wishlist data
 * @param {Object} wishlist - Wishlist
 * @returns {Object} - Exported wishlist data
 */
export function exportWishlistData(wishlist) {
  return {
    name: wishlist.name,
    description: wishlist.description,
    is_public: wishlist.is_public,
    items: wishlist.items?.map(item => ({
      product_id: item.product_id,
      product_name: item.product?.name || 'Unknown Product',
      quantity: item.quantity,
      price: item.product?.price || 0,
      total: calculateWishlistItemTotal(item)
    })) || [],
    exported_at: new Date().toISOString(),
    item_count: wishlist.items?.length || 0
  }
}

/**
 * Import wishlist data
 * @param {Object} wishlistData - Wishlist data to import
 * @returns {Object} - Import result
 */
export function importWishlistData(wishlistData) {
  const errors = []
  const items = []

  if (!wishlistData) {
    errors.push('Invalid wishlist data format')
    return { success: false, errors, items }
  }

  // Validate wishlist basic info
  const wishlistValidation = validateWishlist(wishlistData)
  if (!wishlistValidation.isValid) {
    errors.push(...wishlistValidation.errors)
  }

  // Validate items
  if (wishlistData.items && Array.isArray(wishlistData.items)) {
    for (const item of wishlistData.items) {
      const validation = validateWishlistItem(item)
      if (!validation.isValid) {
        errors.push(`Invalid item: ${validation.errors.join(', ')}`)
        continue
      }

      items.push({
        product_id: item.product_id,
        quantity: item.quantity,
        added_at: new Date().toISOString()
      })
    }
  }

  return {
    success: errors.length === 0,
    errors,
    items,
    wishlist: {
      name: wishlistData.name,
      description: wishlistData.description || '',
      is_public: wishlistData.is_public || false
    }
  }
}

/**
 * Get wishlist storage key
 * @param {number} userId - User ID
 * @returns {string} - Storage key
 */
export function getWishlistStorageKey(userId = null) {
  return userId ? `wishlists_${userId}` : 'wishlists_guest'
}

/**
 * Save wishlists to localStorage
 * @param {Array} wishlists - Wishlists
 * @param {number} userId - User ID
 */
export function saveWishlistsToStorage(wishlists, userId = null) {
  try {
    const key = getWishlistStorageKey(userId)
    const wishlistData = {
      wishlists,
      saved_at: new Date().toISOString()
    }
    localStorage.setItem(key, JSON.stringify(wishlistData))
  } catch (error) {
    console.error('Error saving wishlists to storage:', error)
  }
}

/**
 * Load wishlists from localStorage
 * @param {number} userId - User ID
 * @returns {Array} - Wishlists
 */
export function loadWishlistsFromStorage(userId = null) {
  try {
    const key = getWishlistStorageKey(userId)
    const wishlistData = localStorage.getItem(key)
    
    if (!wishlistData) {
      return []
    }

    const parsed = JSON.parse(wishlistData)
    return parsed.wishlists || []
  } catch (error) {
    console.error('Error loading wishlists from storage:', error)
    return []
  }
}

/**
 * Clear wishlists from localStorage
 * @param {number} userId - User ID
 */
export function clearWishlistsFromStorage(userId = null) {
  try {
    const key = getWishlistStorageKey(userId)
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error clearing wishlists from storage:', error)
  }
}

/**
 * Generate wishlist sharing URL
 * @param {Object} wishlist - Wishlist
 * @param {string} baseUrl - Base URL
 * @returns {string} - Sharing URL
 */
export function generateWishlistShareUrl(wishlist, baseUrl = window.location.origin) {
  if (!wishlist || !wishlist.id) {
    return ''
  }

  return `${baseUrl}/wishlist/${wishlist.id}`
}

/**
 * Parse wishlist sharing URL
 * @param {string} url - Sharing URL
 * @returns {Object} - Parsed URL data
 */
export function parseWishlistShareUrl(url) {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    const wishlistId = pathParts[pathParts.length - 1]
    
    return {
      isValid: !isNaN(wishlistId),
      wishlistId: parseInt(wishlistId),
      baseUrl: `${urlObj.protocol}//${urlObj.host}`
    }
  } catch (error) {
    return {
      isValid: false,
      wishlistId: null,
      baseUrl: ''
    }
  }
}

/**
 * Get wishlist statistics
 * @param {Array} wishlists - Wishlists
 * @returns {Object} - Wishlist statistics
 */
export function getWishlistStatistics(wishlists) {
  if (!wishlists || !Array.isArray(wishlists)) {
    return {
      totalWishlists: 0,
      totalItems: 0,
      totalValue: 0,
      averageItemsPerWishlist: 0,
      mostExpensiveItem: null,
      leastExpensiveItem: null
    }
  }

  const totals = calculateWishlistTotals(wishlists)
  const averageItemsPerWishlist = totals.totalWishlists > 0 
    ? Math.round((totals.totalItems / totals.totalWishlists) * 100) / 100 
    : 0

  let mostExpensiveItem = null
  let leastExpensiveItem = null
  let maxPrice = 0
  let minPrice = Infinity

  wishlists.forEach(wishlist => {
    if (wishlist.items && Array.isArray(wishlist.items)) {
      wishlist.items.forEach(item => {
        const price = item.product?.price || 0
        if (price > maxPrice) {
          maxPrice = price
          mostExpensiveItem = item
        }
        if (price < minPrice && price > 0) {
          minPrice = price
          leastExpensiveItem = item
        }
      })
    }
  })

  return {
    ...totals,
    averageItemsPerWishlist,
    mostExpensiveItem,
    leastExpensiveItem,
    formattedTotalValue: formatCurrency(totals.totalValue)
  }
}
