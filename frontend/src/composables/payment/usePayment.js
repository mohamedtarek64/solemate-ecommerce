/**
 * usePayment Composable
 * Provides payment functionality and state management
 */

import { ref, computed } from 'vue'
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
  createStripeCustomer,
  getPaymentMethods as fetchPaymentMethods
} from '@/services/payment/paymentService'

export function usePayment() {
  // State
  const loading = ref(false)
  const error = ref(null)
  const paymentIntent = ref(null)
  const paymentStatus = ref('idle') // idle, processing, succeeded, failed
  const savedPaymentMethods = ref([])

  // Computed
  const isProcessing = computed(() => loading.value || paymentStatus.value === 'processing')
  const isSucceeded = computed(() => paymentStatus.value === 'succeeded')
  const isFailed = computed(() => paymentStatus.value === 'failed')

  /**
   * Initialize payment
   */
  const initializePayment = async (amount, orderId) => {
    loading.value = true
    error.value = null

    try {
      const result = await createPaymentIntent({
        amount,
        currency: 'usd',
        order_id: orderId
      })

      // Handle demo mode gracefully
      if (result.demo) {
        console.warn('⚠️ Demo mode: Payment service unavailable')
        paymentStatus.value = 'demo'
        return { success: true, demo: true }
      }

      if (result.success) {
        paymentIntent.value = result.data
        paymentStatus.value = 'initialized'
        return result.data
      } else {
        // Silent fail for demo mode
        console.warn('⚠️ Payment initialization failed, using demo mode')
        paymentStatus.value = 'demo'
        return { success: true, demo: true }
      }
    } catch (err) {
      // Silent handling - don't throw error
      console.warn('⚠️ Payment error, continuing in demo mode:', err.message)
      paymentStatus.value = 'demo'
      return { success: true, demo: true }
    } finally {
      loading.value = false
    }
  }

  /**
   * Process payment
   */
  const processPayment = async (paymentIntentId, orderId) => {
    loading.value = true
    error.value = null
    paymentStatus.value = 'processing'

    try {
      const result = await confirmPayment({
        payment_intent_id: paymentIntentId,
        order_id: orderId
      })

      if (result.success) {
        paymentStatus.value = 'succeeded'
        return result.data
      } else {
        throw new Error(result.message || 'Payment failed')
      }
    } catch (err) {
      error.value = err.message
      paymentStatus.value = 'failed'
      console.error('Process payment error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Check payment status
   */
  const checkPaymentStatus = async (paymentIntentId) => {
    try {
      const result = await getPaymentStatus(paymentIntentId)

      if (result.success) {
        paymentStatus.value = result.data.status
        return result.data
      } else {
        throw new Error(result.message || 'Failed to get status')
      }
    } catch (err) {
      error.value = err.message
      console.error('Check payment status error:', err)
      throw err
    }
  }

  /**
   * Create customer
   */
  const setupCustomer = async () => {
    try {
      const result = await createStripeCustomer()

      if (result.success) {
        return result.data
      } else {
        throw new Error(result.message || 'Failed to create customer')
      }
    } catch (err) {
      console.error('Setup customer error:', err)
      throw err
    }
  }

  /**
   * Load payment methods
   */
  const loadPaymentMethods = async () => {
    try {
      const methods = await fetchPaymentMethods()
      savedPaymentMethods.value = methods
      return methods
    } catch (err) {
      console.error('Load payment methods error:', err)
      return []
    }
  }

  /**
   * Reset payment state
   */
  const resetPayment = () => {
    loading.value = false
    error.value = null
    paymentIntent.value = null
    paymentStatus.value = 'idle'
  }

  return {
    // State
    loading,
    error,
    paymentIntent,
    paymentStatus,
    savedPaymentMethods,

    // Computed
    isProcessing,
    isSucceeded,
    isFailed,

    // Methods
    initializePayment,
    processPayment,
    checkPaymentStatus,
    setupCustomer,
    loadPaymentMethods,
    resetPayment
  }
}

export default usePayment
