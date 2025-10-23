/**
 * Unified Order Calculations
 * 
 * Centralized calculation logic for cart and checkout to ensure consistency
 */

/**
 * Calculate order summary with consistent logic
 * @param {number} subtotal - Cart subtotal
 * @param {number} shippingCost - Shipping cost (default 0)
 * @param {number} discountAmount - Discount amount (default 0)
 * @returns {Object} Order summary with all calculations
 */
export function calculateOrderSummary(subtotal = 0, shippingCost = 0, discountAmount = 0) {
  // Ensure all values are numbers
  const cleanSubtotal = parseFloat(subtotal) || 0
  const cleanShipping = parseFloat(shippingCost) || 0
  const cleanDiscount = parseFloat(discountAmount) || 0

  // Tax rate: 8%
  const TAX_RATE = 0.08

  // Calculate tax on subtotal only (not including shipping)
  const tax = cleanSubtotal * TAX_RATE

  // Calculate total
  const total = cleanSubtotal + cleanShipping + tax - cleanDiscount

  return {
    subtotal: parseFloat(cleanSubtotal.toFixed(2)),
    shipping: parseFloat(cleanShipping.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    discount: parseFloat(cleanDiscount.toFixed(2)),
    total: parseFloat(total.toFixed(2))
  }
}

/**
 * Calculate shipping cost based on subtotal
 * @param {number} subtotal - Cart subtotal
 * @returns {number} Shipping cost
 */
export function calculateShippingCost(subtotal = 0) {
  const cleanSubtotal = parseFloat(subtotal) || 0
  
  // Free shipping over $100
  return cleanSubtotal >= 100 ? 0 : 10
}

/**
 * Get default shipping methods
 * @returns {Array} Shipping methods
 */
export function getShippingMethods() {
  return [
    {
      id: 'standard',
      name: 'Standard Shipping',
      cost: 10,
      price: 10,
      description: '5-7 business days',
      deliveryTime: '5-7 business days'
    },
    {
      id: 'express',
      name: 'Express Shipping',
      cost: 20,
      price: 20,
      description: '2-3 business days',
      deliveryTime: '2-3 business days'
    },
    {
      id: 'overnight',
      name: 'Overnight Shipping',
      cost: 35,
      price: 35,
      description: 'Next business day',
      deliveryTime: 'Next business day'
    },
    {
      id: 'free',
      name: 'Free Shipping',
      cost: 0,
      price: 0,
      description: 'Available for orders over $100',
      deliveryTime: '7-10 business days',
      minOrderAmount: 100
    }
  ]
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  const cleanAmount = parseFloat(amount) || 0
  return `$${cleanAmount.toFixed(2)}`
}

/**
 * Validate order totals
 * @param {Object} orderSummary - Order summary object
 * @returns {boolean} Whether totals are valid
 */
export function validateOrderTotals(orderSummary) {
  const { subtotal, shipping, tax, discount, total } = orderSummary
  
  // Recalculate expected total
  const expectedTotal = subtotal + shipping + tax - discount
  
  // Allow for small floating point differences (< 0.01)
  return Math.abs(total - expectedTotal) < 0.01
}

