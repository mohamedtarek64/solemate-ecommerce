import { defineStore } from 'pinia'
import stripeService from '@/utils/stripe.js'

export const useStripeStore = defineStore('stripe', {
  state: () => ({
    stripe: null,
    publishableKey: null,
    paymentIntent: null,
    calculation: null,
    loading: false,
    error: null,
    processing: false
  }),

  getters: {
    isInitialized: (state) => !!state.stripe,
    hasPaymentIntent: (state) => !!state.paymentIntent,
    formattedTotal: (state) => {
      if (!state.calculation) return '$0.00'
      return stripeService.formatAmount(state.calculation.total)
    },
    formattedSubtotal: (state) => {
      if (!state.calculation) return '$0.00'
      return stripeService.formatAmount(state.calculation.subtotal)
    },
    formattedShipping: (state) => {
      if (!state.calculation) return '$0.00'
      return stripeService.formatAmount(state.calculation.shipping_cost)
    },
    formattedTax: (state) => {
      if (!state.calculation) return '$0.00'
      return stripeService.formatAmount(state.calculation.tax_amount)
    }
  },

  actions: {
    /**
     * Initialize Stripe
     */
    async initialize(authToken) {
      try {
        this.loading = true
        this.error = null

        // Get configuration from backend
        const config = await stripeService.getConfig(authToken)
        this.publishableKey = config.publishable_key

        // Initialize Stripe
        this.stripe = await stripeService.initialize(this.publishableKey)

        return this.stripe
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Create payment intent
     */
    async createPaymentIntent(checkoutData, authToken) {
      try {
        this.loading = true
        this.error = null

        const result = await stripeService.createPaymentIntent(checkoutData, authToken)
        
        this.paymentIntent = result
        this.calculation = result.calculation

        return result
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Process payment
     */
    async processPayment(paymentMethodData, checkoutData, authToken) {
      try {
        this.processing = true
        this.error = null

        if (!this.paymentIntent) {
          throw new Error('No payment intent available')
        }

        // Confirm payment with Stripe
        const confirmedPaymentIntent = await stripeService.confirmPayment(
          this.paymentIntent.client_secret,
          paymentMethodData
        )

        if (confirmedPaymentIntent.status !== 'succeeded') {
          throw new Error('Payment was not successful')
        }

        // Confirm payment with backend
        const orderData = await stripeService.confirmPaymentWithBackend(
          confirmedPaymentIntent.id,
          checkoutData,
          authToken
        )

        // Clear payment intent after successful payment
        this.clearPaymentIntent()

        return orderData
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.processing = false
      }
    },

    /**
     * Clear payment intent
     */
    clearPaymentIntent() {
      this.paymentIntent = null
      this.calculation = null
      this.error = null
    },

    /**
     * Clear all state
     */
    clearState() {
      this.stripe = null
      this.publishableKey = null
      this.paymentIntent = null
      this.calculation = null
      this.loading = false
      this.error = null
      this.processing = false
    },

    /**
     * Set error
     */
    setError(error) {
      this.error = error
    },

    /**
     * Clear error
     */
    clearError() {
      this.error = null
    }
  }
})
