/**
 * Type definitions and interfaces for the application
 * Note: This is JavaScript, so these are documentation comments
 */

/**
 * @typedef {Object} Product
 * @property {number} id - Product ID
 * @property {string} name - Product name
 * @property {string} description - Product description
 * @property {string} short_description - Short product description
 * @property {string} slug - Product slug for URL
 * @property {string} sku - Product SKU
 * @property {number} price - Product price
 * @property {number|null} original_price - Original price (for discounts)
 * @property {number|null} discount_percentage - Discount percentage
 * @property {number} quantity - Available quantity
 * @property {boolean} in_stock - Whether product is in stock
 * @property {boolean} featured - Whether product is featured
 * @property {string} status - Product status (active, inactive, draft)
 * @property {string[]} images - Array of image URLs
 * @property {Color[]} colors - Available colors
 * @property {Category[]} categories - Product categories
 * @property {ProductAttribute[]} attributes - Product attributes
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} Color
 * @property {string} name - Color name
 * @property {string} color - CSS color class
 * @property {string} hex - Hex color code
 */

/**
 * @typedef {Object} Category
 * @property {number} id - Category ID
 * @property {string} name - Category name
 * @property {string} slug - Category slug
 * @property {string} description - Category description
 * @property {string} image - Category image URL
 * @property {number|null} parent_id - Parent category ID
 * @property {Category[]} children - Child categories
 */

/**
 * @typedef {Object} ProductAttribute
 * @property {string} name - Attribute name
 * @property {string} value - Attribute value
 * @property {string} type - Attribute type (text, number, select, etc.)
 */

/**
 * @typedef {Object} CartItem
 * @property {number} id - Cart item ID
 * @property {Product} product - Product details
 * @property {number} quantity - Item quantity
 * @property {string} color - Selected color
 * @property {string} size - Selected size
 * @property {number} price - Item price
 * @property {number} total - Total price for this item
 */

/**
 * @typedef {Object} ShoppingCart
 * @property {number} id - Cart ID
 * @property {number} user_id - User ID
 * @property {CartItem[]} items - Cart items
 * @property {number} total_items - Total number of items
 * @property {number} total_price - Total cart price
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} WishlistItem
 * @property {number} id - Wishlist item ID
 * @property {Product} product - Product details
 * @property {string} created_at - Creation timestamp
 */

/**
 * @typedef {Object} Wishlist
 * @property {number} id - Wishlist ID
 * @property {number} user_id - User ID
 * @property {WishlistItem[]} items - Wishlist items
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} User
 * @property {number} id - User ID
 * @property {string} name - User name
 * @property {string} email - User email
 * @property {string} phone - User phone
 * @property {string} avatar - User avatar URL
 * @property {string} role - User role
 * @property {boolean} email_verified - Email verification status
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} Order
 * @property {number} id - Order ID
 * @property {string} order_number - Order number
 * @property {number} user_id - User ID
 * @property {OrderItem[]} items - Order items
 * @property {Address} shipping_address - Shipping address
 * @property {Address} billing_address - Billing address
 * @property {string} status - Order status
 * @property {number} subtotal - Subtotal amount
 * @property {number} tax - Tax amount
 * @property {number} shipping - Shipping cost
 * @property {number} total - Total amount
 * @property {string} payment_method - Payment method
 * @property {string} payment_status - Payment status
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} OrderItem
 * @property {number} id - Order item ID
 * @property {Product} product - Product details
 * @property {number} quantity - Item quantity
 * @property {string} color - Selected color
 * @property {string} size - Selected size
 * @property {number} price - Item price
 * @property {number} total - Total price for this item
 */

/**
 * @typedef {Object} Address
 * @property {number} id - Address ID
 * @property {string} first_name - First name
 * @property {string} last_name - Last name
 * @property {string} company - Company name
 * @property {string} address_line_1 - Address line 1
 * @property {string} address_line_2 - Address line 2
 * @property {string} city - City
 * @property {string} state - State/Province
 * @property {string} postal_code - Postal code
 * @property {string} country - Country
 * @property {string} phone - Phone number
 * @property {boolean} is_default - Whether this is the default address
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Whether the request was successful
 * @property {string} message - Response message
 * @property {*} data - Response data
 * @property {Object} pagination - Pagination information (if applicable)
 * @property {Object} errors - Validation errors (if any)
 */

/**
 * @typedef {Object} PaginationInfo
 * @property {number} current_page - Current page number
 * @property {number} last_page - Last page number
 * @property {number} per_page - Items per page
 * @property {number} total - Total number of items
 * @property {number} from - Starting item number
 * @property {number} to - Ending item number
 */

/**
 * @typedef {Object} SearchFilters
 * @property {string} query - Search query
 * @property {number[]} categories - Category IDs
 * @property {number} min_price - Minimum price
 * @property {number} max_price - Maximum price
 * @property {string[]} colors - Color filters
 * @property {string[]} sizes - Size filters
 * @property {boolean} in_stock - Only in-stock items
 * @property {boolean} featured - Only featured items
 * @property {string} sort_by - Sort field
 * @property {string} sort_order - Sort order (asc, desc)
 */

/**
 * @typedef {Object} AnimationConfig
 * @property {number} duration - Animation duration in seconds
 * @property {string} easing - Animation easing function
 * @property {boolean} enableComplexAnimations - Whether to enable complex animations
 * @property {boolean} enableParallax - Whether to enable parallax effects
 */

/**
 * @typedef {Object} PerformanceMetrics
 * @property {number} loadTime - Page load time in milliseconds
 * @property {number} renderTime - Render time in milliseconds
 * @property {number} memoryUsage - Memory usage in MB
 * @property {number} fps - Frames per second
 */

// Export types for JSDoc usage
export const TYPES = {
  Product: 'Product',
  Color: 'Color',
  Category: 'Category',
  ProductAttribute: 'ProductAttribute',
  CartItem: 'CartItem',
  ShoppingCart: 'ShoppingCart',
  WishlistItem: 'WishlistItem',
  Wishlist: 'Wishlist',
  User: 'User',
  Order: 'Order',
  OrderItem: 'OrderItem',
  Address: 'Address',
  ApiResponse: 'ApiResponse',
  PaginationInfo: 'PaginationInfo',
  SearchFilters: 'SearchFilters',
  AnimationConfig: 'AnimationConfig',
  PerformanceMetrics: 'PerformanceMetrics'
}
