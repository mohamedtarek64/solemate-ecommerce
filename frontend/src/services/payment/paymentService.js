/**
 * Payment Service
 * Handles all payment-related API calls
 */

const API_BASE_URL = 'http://127.0.0.1:8000/api'

/**
 * Get auth headers
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token')
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

/**
 * Create payment intent
 * @param {Object} data - Payment data
 * @returns {Promise<Object>}
 */
export const createPaymentIntent = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/stripe/create-payment-intent`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorData = await response.json()
      // Don't throw error for demo mode - just log silently
      console.warn('⚠️ Payment in demo mode:', errorData.message)
      return { 
        success: false, 
        demo: true, 
        message: errorData.message 
      }
    }

    const result = await response.json()
    return result
  } catch (error) {
    // Silent handling for demo mode
    console.warn('⚠️ Payment service unavailable, using demo mode')
    return { 
      success: false, 
      demo: true, 
      message: 'Demo mode active' 
    }
  }
}

/**
 * Confirm payment
 * @param {Object} data - Payment confirmation data
 * @returns {Promise<Object>}
 */
export const confirmPayment = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/stripe/confirm-payment`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to confirm payment')
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Confirm payment error:', error)
    throw error
  }
}

/**
 * Get payment status
 * @param {string} paymentIntentId - Payment intent ID
 * @returns {Promise<Object>}
 */
export const getPaymentStatus = async (paymentIntentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/payment/status/${paymentIntentId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to get payment status')
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Get payment status error:', error)
    throw error
  }
}

/**
 * Create Stripe customer
 * @returns {Promise<Object>}
 */
export const createStripeCustomer = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/payment/create-customer`, {
      method: 'POST',
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to create customer')
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Create customer error:', error)
    throw error
  }
}

/**
 * Get saved payment methods
 * @returns {Promise<Array>}
 */
export const getPaymentMethods = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/payment/methods`, {
      method: 'GET',
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to get payment methods')
    }

    const result = await response.json()
    return result.data || []
  } catch (error) {
    console.error('Get payment methods error:', error)
    return []
  }
}

export default {
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
  createStripeCustomer,
  getPaymentMethods
}
