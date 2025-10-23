/**
 * Stripe utility functions for payment processing
 */

import { loadStripe } from '@stripe/stripe-js'
import { STRIPE_CONFIG, getApiBaseUrl } from '../config/stripe.js'

class StripeService {
  constructor() {
    this.stripe = null
    this.publishableKey = null
  }

  /**
   * Initialize Stripe with publishable key
   */
  async initialize(publishableKey = null) {
    try {
      // Use provided key or fallback to environment variable
      this.publishableKey = publishableKey || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

      if (!this.publishableKey) {
        throw new Error('Stripe publishable key not found')
      }

      this.stripe = await loadStripe(this.publishableKey)

      if (!this.stripe) {
        throw new Error('Failed to load Stripe')
      }

      + '...')
      return this.stripe
    } catch (error) {
      console.error('Stripe initialization error:', error)
      throw error
    }
  }

  /**
   * Create payment intent
   */
  async createPaymentIntent(checkoutData, authToken) {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/checkout/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(checkoutData)
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to create payment intent')
      }

      return result.data
    } catch (error) {
      console.error('Payment intent creation error:', error)
      throw error
    }
  }

  /**
   * Confirm payment with Stripe
   */
  async confirmPayment(clientSecret, paymentMethodData) {
    try {
      if (!this.stripe) {
        throw new Error('Stripe not initialized')
      }

      const { error, paymentIntent } = await this.stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: paymentMethodData
        }
      )

      if (error) {
        throw new Error(error.message)
      }

      return paymentIntent
    } catch (error) {
      console.error('Payment confirmation error:', error)
      throw error
    }
  }

  /**
   * Confirm payment with backend
   */
  async confirmPaymentWithBackend(paymentIntentId, checkoutData, authToken) {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/checkout/stripe/confirm-payment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId,
          ...checkoutData
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to confirm payment')
      }

      return result.data
    } catch (error) {
      console.error('Backend payment confirmation error:', error)
      throw error
    }
  }

  /**
   * Get Stripe configuration from backend or config
   */
  async getConfig(authToken) {
    try {
      // Try to get from backend first
      const response = await fetch(`${getApiBaseUrl()}/stripe/config`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (result.success) {
        return result.data
      }
    } catch (error) {
      console.warn('Backend Stripe config failed, using local config:', error)
    }

    // Fallback to local config
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || STRIPE_CONFIG.PUBLISHABLE_KEY

    if (!publishableKey) {
      throw new Error('Stripe publishable key not configured')
    }

    return {
      publishable_key: publishableKey
    }
  }

  /**
   * Create Stripe elements
   */
  createElements(options = {}) {
    if (!this.stripe) {
      throw new Error('Stripe not initialized')
    }

    return this.stripe.elements(options)
  }

  /**
   * Create card element
   */
  createCardElement(elements, options = {}) {
    const defaultOptions = {
      style: {
        base: {
          fontSize: '16px',
          color: '#424770',
          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
          '::placeholder': {
            color: '#aab7c4',
          },
        },
        invalid: {
          color: '#9e2146',
        },
      },
    }

    return elements.create('card', { ...defaultOptions, ...options })
  }

  /**
   * Format amount for display
   */
  formatAmount(amount, currency = 'usd') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  /**
   * Validate card number (basic validation)
   */
  validateCardNumber(cardNumber) {
    // Remove spaces and dashes
    const cleaned = cardNumber.replace(/[\s-]/g, '')

    // Check if it's all digits
    if (!/^\d+$/.test(cleaned)) {
      return false
    }

    // Check length (13-19 digits)
    if (cleaned.length < 13 || cleaned.length > 19) {
      return false
    }

    // Luhn algorithm
    let sum = 0
    let isEven = false

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i])

      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }

      sum += digit
      isEven = !isEven
    }

    return sum % 10 === 0
  }

  /**
   * Get card type from number
   */
  getCardType(cardNumber) {
    const cleaned = cardNumber.replace(/[\s-]/g, '')

    const patterns = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/,
      diners: /^3[0689]/,
      jcb: /^35/
    }

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(cleaned)) {
        return type
      }
    }

    return 'unknown'
  }

  /**
   * Handle payment errors
   */
  handlePaymentError(error) {
    const errorMessages = {
      'card_declined': 'Your card was declined. Please try a different card.',
      'expired_card': 'Your card has expired. Please use a different card.',
      'incorrect_cvc': 'Your card\'s security code is incorrect. Please try again.',
      'processing_error': 'An error occurred while processing your card. Please try again.',
      'insufficient_funds': 'Your card has insufficient funds.',
      'generic_decline': 'Your card was declined. Please try a different card.',
      'lost_card': 'Your card was declined. Please contact your bank.',
      'stolen_card': 'Your card was declined. Please contact your bank.',
    }

    return errorMessages[error.code] || error.message || 'Payment failed. Please try again.'
  }
}

// Create singleton instance
const stripeService = new StripeService()

export default stripeService

// Export individual functions for convenience
export const {
  initialize,
  createPaymentIntent,
  confirmPayment,
  confirmPaymentWithBackend,
  getConfig,
  createElements,
  createCardElement,
  formatAmount,
  validateCardNumber,
  getCardType,
  handlePaymentError
} = stripeService
