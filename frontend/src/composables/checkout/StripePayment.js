import { ref } from 'vue'
import { loadStripe } from '@stripe/stripe-js'

// Stripe Payment Composable
export function useStripePayment(props) {
  // State
  const stripe = ref(null)
  const elements = ref(null)
  const cardElement = ref(null)
  const paymentIntent = ref(null)
  const calculation = ref(null)
  const loading = ref(false)
  const processing = ref(false)
  const error = ref(null)
  const billingName = ref('')
  const billingEmail = ref('')
  const publishableKey = ref(null)

  // Methods
  const initializeStripe = async () => {
    try {
      // Get Stripe configuration from backend
      const response = await fetch('/api/checkout/stripe/config', {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to get Stripe configuration')
      }

      const config = await response.json()
      publishableKey.value = config.data.publishable_key

      // Initialize Stripe
      stripe.value = await loadStripe(publishableKey.value)

      if (!stripe.value) {
        throw new Error('Failed to load Stripe')
      }

      // Create elements
      elements.value = stripe.value.elements()

      // Create card element
      cardElement.value = elements.value.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
              color: '#aab7c4',
            },
          },
          invalid: {
            color: '#9e2146',
          },
        },
      })

      // Mount card element
      cardElement.value.mount('#card-element')

      // Handle real-time validation errors
      cardElement.value.on('change', ({ error }) => {
        const displayError = document.getElementById('card-errors')
        if (error) {
          displayError.textContent = error.message
        } else {
          displayError.textContent = ''
        }
      })

    } catch (error) {
      console.error('Stripe initialization error:', error)
      error.value = 'Failed to initialize payment system'
      props.onError(error)
    }
  }

  const createPaymentIntent = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('/api/checkout/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shipping_address_id: props.checkoutData.shipping_address_id,
          billing_address_id: props.checkoutData.billing_address_id,
          shipping_method_id: props.checkoutData.shipping_method_id,
          coupon_code: props.checkoutData.coupon_code
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to create payment intent')
      }

      paymentIntent.value = result.data
      calculation.value = result.data.calculation

    } catch (error) {
      console.error('Payment intent creation error:', error)
      error.value = error.message || 'Failed to initialize payment'
      props.onError(error)
    } finally {
      loading.value = false
    }
  }

  const handleSubmit = async () => {
    if (!stripe.value || !cardElement.value || !paymentIntent.value) {
      return
    }

    processing.value = true
    error.value = null

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent: confirmedPaymentIntent } = await stripe.value.confirmCardPayment(
        paymentIntent.value.client_secret,
        {
          payment_method: {
            card: cardElement.value,
            billing_details: {
              name: billingName.value,
              email: billingEmail.value,
            },
          },
        }
      )

      if (error) {
        throw new Error(error.message)
      }

      if (confirmedPaymentIntent.status === 'succeeded') {
        // Confirm payment with backend
        await confirmPaymentWithBackend(confirmedPaymentIntent.id)
      } else {
        throw new Error('Payment was not successful')
      }

    } catch (error) {
      console.error('Payment error:', error)
      error.value = error.message || 'Payment failed'
      props.onError(error)
    } finally {
      processing.value = false
    }
  }

  const confirmPaymentWithBackend = async (paymentIntentId) => {
    try {
      const response = await fetch('/api/checkout/stripe/confirm-payment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId,
          shipping_address_id: props.checkoutData.shipping_address_id,
          billing_address_id: props.checkoutData.billing_address_id,
          shipping_method_id: props.checkoutData.shipping_method_id,
          coupon_code: props.checkoutData.coupon_code,
          notes: props.checkoutData.notes
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to confirm payment')
      }

      // Payment successful
      props.onSuccess(result.data)

    } catch (error) {
      console.error('Payment confirmation error:', error)
      throw error
    }
  }

  const retry = async () => {
    error.value = null
    await createPaymentIntent()
  }

  const getAuthToken = () => {
    // Get authentication token from your auth store or localStorage
    return localStorage.getItem('auth_token') || ''
  }

  return {
    stripe,
    elements,
    cardElement,
    paymentIntent,
    calculation,
    loading,
    processing,
    error,
    billingName,
    billingEmail,
    publishableKey,
    initializeStripe,
    createPaymentIntent,
    handleSubmit,
    retry,
    getAuthToken
  }
}
