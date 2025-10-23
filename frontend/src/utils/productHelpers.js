/**
 * Product utility functions
 */

import { formatCurrency } from './currency'

/**
 * Format product price with currency
 * @param {number} price - Product price
 * @param {string} currency - Currency code
 * @returns {string} Formatted price
 */
export const formatProductPrice = (price, currency = 'EGP') => {
  return formatCurrency(price, currency)
}

/**
 * Calculate discount percentage
 * @param {number} originalPrice - Original price
 * @param {number} salePrice - Sale price
 * @returns {number} Discount percentage
 */
export const calculateDiscountPercentage = (originalPrice, salePrice) => {
  if (!originalPrice || originalPrice <= salePrice) return 0
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100)
}

/**
 * Check if product is on sale
 * @param {Object} product - Product object
 * @returns {boolean} True if product is on sale
 */
export const isProductOnSale = (product) => {
  return product.compare_price && product.compare_price > product.price
}

/**
 * Get product discount amount
 * @param {Object} product - Product object
 * @returns {number} Discount amount
 */
export const getProductDiscountAmount = (product) => {
  if (!isProductOnSale(product)) return 0
  return product.compare_price - product.price
}

/**
 * Check if product is in stock
 * @param {Object} product - Product object
 * @returns {boolean} True if product is in stock
 */
export const isProductInStock = (product) => {
  if (!product.track_quantity) return true
  return product.quantity > 0
}

/**
 * Get product stock status
 * @param {Object} product - Product object
 * @returns {string} Stock status
 */
export const getProductStockStatus = (product) => {
  if (!product.track_quantity) return 'unlimited'
  
  if (product.quantity > 10) return 'in_stock'
  if (product.quantity > 0) return 'low_stock'
  return 'out_of_stock'
}

/**
 * Get product stock status text
 * @param {Object} product - Product object
 * @returns {string} Stock status text
 */
export const getProductStockStatusText = (product) => {
  const status = getProductStockStatus(product)
  
  switch (status) {
    case 'in_stock':
      return 'In Stock'
    case 'low_stock':
      return 'Low Stock'
    case 'out_of_stock':
      return 'Out of Stock'
    case 'unlimited':
      return 'Available'
    default:
      return 'Unknown'
  }
}

/**
 * Get product stock status color
 * @param {Object} product - Product object
 * @returns {string} CSS color class
 */
export const getProductStockStatusColor = (product) => {
  const status = getProductStockStatus(product)
  
  switch (status) {
    case 'in_stock':
      return 'text-green-600'
    case 'low_stock':
      return 'text-yellow-600'
    case 'out_of_stock':
      return 'text-red-600'
    case 'unlimited':
      return 'text-blue-600'
    default:
      return 'text-gray-600'
  }
}

/**
 * Get product image URL
 * @param {Object} product - Product object
 * @param {number} index - Image index (default: 0)
 * @returns {string} Image URL
 */
export const getProductImageUrl = (product, index = 0) => {
  if (product.images && product.images.length > index) {
    return product.images[index].url || `/storage/${product.images[index].image_path}`
  }
  
  if (product.image_url) {
    return product.image_url
  }
  
  return '/images/placeholder-product.jpg'
}

/**
 * Get product primary image URL
 * @param {Object} product - Product object
 * @returns {string} Primary image URL
 */
export const getProductPrimaryImageUrl = (product) => {
  if (product.images && product.images.length > 0) {
    const primaryImage = product.images.find(img => img.is_primary) || product.images[0]
    return primaryImage.url || `/storage/${primaryImage.image_path}`
  }
  
  return getProductImageUrl(product)
}

/**
 * Get all product image URLs
 * @param {Object} product - Product object
 * @returns {Array} Array of image URLs
 */
export const getProductImageUrls = (product) => {
  if (product.images && product.images.length > 0) {
    return product.images.map(img => img.url || `/storage/${img.image_path}`)
  }
  
  return [getProductImageUrl(product)]
}

/**
 * Get product main category
 * @param {Object} product - Product object
 * @returns {Object|null} Main category
 */
export const getProductMainCategory = (product) => {
  if (product.categories && product.categories.length > 0) {
    return product.categories[0]
  }
  
  if (product.main_category) {
    return product.main_category
  }
  
  return null
}

/**
 * Get product categories as string
 * @param {Object} product - Product object
 * @param {string} separator - Separator between categories
 * @returns {string} Categories string
 */
export const getProductCategoriesString = (product, separator = ', ') => {
  if (product.categories && product.categories.length > 0) {
    return product.categories.map(cat => cat.name).join(separator)
  }
  
  return ''
}

/**
 * Get product URL
 * @param {Object} product - Product object
 * @returns {string} Product URL
 */
export const getProductUrl = (product) => {
  return `/products/${product.slug}`
}

/**
 * Get product breadcrumb
 * @param {Object} product - Product object
 * @returns {Array} Breadcrumb array
 */
export const getProductBreadcrumb = (product) => {
  const breadcrumb = [
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' }
  ]
  
  const mainCategory = getProductMainCategory(product)
  if (mainCategory) {
    breadcrumb.push({
      name: mainCategory.name,
      url: `/categories/${mainCategory.slug}`
    })
  }
  
  breadcrumb.push({
    name: product.name,
    url: getProductUrl(product)
  })
  
  return breadcrumb
}

/**
 * Generate product slug
 * @param {string} name - Product name
 * @returns {string} Generated slug
 */
export const generateProductSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-')
}

/**
 * Validate product data
 * @param {Object} product - Product data
 * @returns {Object} Validation result
 */
export const validateProduct = (product) => {
  const errors = []
  
  if (!product.name || product.name.trim().length === 0) {
    errors.push('Product name is required')
  }
  
  if (!product.price || product.price <= 0) {
    errors.push('Product price must be greater than 0')
  }
  
  if (!product.sku || product.sku.trim().length === 0) {
    errors.push('Product SKU is required')
  }
  
  if (product.track_quantity && (product.quantity < 0 || product.quantity === undefined)) {
    errors.push('Product quantity must be 0 or greater')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Sort products by criteria
 * @param {Array} products - Products array
 * @param {string} sortBy - Sort criteria
 * @param {string} sortOrder - Sort order (asc/desc)
 * @returns {Array} Sorted products
 */
export const sortProducts = (products, sortBy = 'name', sortOrder = 'asc') => {
  return [...products].sort((a, b) => {
    let aValue = a[sortBy]
    let bValue = b[sortBy]
    
    // Handle nested properties
    if (sortBy === 'main_category') {
      aValue = getProductMainCategory(a)?.name || ''
      bValue = getProductMainCategory(b)?.name || ''
    }
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }
    
    if (sortOrder === 'desc') {
      return bValue > aValue ? 1 : -1
    }
    
    return aValue > bValue ? 1 : -1
  })
}

/**
 * Filter products by criteria
 * @param {Array} products - Products array
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered products
 */
export const filterProducts = (products, filters) => {
  return products.filter(product => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const searchableFields = [
        product.name,
        product.description,
        product.short_description,
        product.sku
      ]
      
      if (!searchableFields.some(field => 
        field && field.toLowerCase().includes(searchTerm)
      )) {
        return false
      }
    }
    
    // Category filter
    if (filters.category_id) {
      const hasCategory = product.categories?.some(cat => cat.id === filters.category_id)
      if (!hasCategory) return false
    }
    
    // Price range filter
    if (filters.min_price !== undefined && product.price < filters.min_price) {
      return false
    }
    
    if (filters.max_price !== undefined && product.price > filters.max_price) {
      return false
    }
    
    // Stock filter
    if (filters.in_stock && !isProductInStock(product)) {
      return false
    }
    
    // Featured filter
    if (filters.featured && !product.featured) {
      return false
    }
    
    return true
  })
}

/**
 * Get product comparison data
 * @param {Array} products - Products to compare
 * @returns {Object} Comparison data
 */
export const getProductComparison = (products) => {
  if (products.length === 0) return null
  
  const comparison = {
    count: products.length,
    priceRange: {
      min: Math.min(...products.map(p => p.price)),
      max: Math.max(...products.map(p => p.price))
    },
    categories: [...new Set(products.flatMap(p => p.categories?.map(c => c.name) || []))],
    inStock: products.filter(p => isProductInStock(p)).length,
    onSale: products.filter(p => isProductOnSale(p)).length
  }
  
  return comparison
}
