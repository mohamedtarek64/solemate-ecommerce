<template>
  <div class="stripe-payment">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Processing payment...</p>
    </div>

    <div v-else-if="paymentIntent" class="payment-form">
      <div class="payment-summary">
        <h3>Payment Summary</h3>
        <div class="summary-item">
          <span>Subtotal:</span>
          <span>${{ (calculation.subtotal / 100).toFixed(2) }}</span>
        </div>
        <div class="summary-item">
          <span>Shipping:</span>
          <span>${{ (calculation.shipping_cost / 100).toFixed(2) }}</span>
        </div>
        <div class="summary-item">
          <span>Tax:</span>
          <span>${{ (calculation.tax_amount / 100).toFixed(2) }}</span>
        </div>
        <div class="summary-item total">
          <span>Total:</span>
          <span>${{ (calculation.total / 100).toFixed(2) }}</span>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="stripe-form">
        <div class="form-group">
          <label for="card-element">Card Information</label>
          <div id="card-element" class="card-element">
            <!-- Stripe Elements will create form elements here -->
          </div>
          <div id="card-errors" class="error-message" role="alert"></div>
        </div>

        <div class="form-group">
          <label for="billing-name">Name on Card</label>
          <input
            id="billing-name"
            v-model="billingName"
            type="text"
            placeholder="Full name"
            required
          />
        </div>

        <div class="form-group">
          <label for="billing-email">Email</label>
          <input
            id="billing-email"
            v-model="billingEmail"
            type="email"
            placeholder="your@email.com"
            required
          />
        </div>

        <button
          type="submit"
          :disabled="processing"
          class="pay-button"
        >
          <span v-if="processing">
            <div class="button-spinner"></div>
            Processing...
          </span>
          <span v-else>
            Pay ${{ (calculation.total / 100).toFixed(2) }}
          </span>
        </button>
      </form>
    </div>

    <div v-else class="error-state">
      <h3>Payment Error</h3>
      <p>{{ error || 'Unable to initialize payment. Please try again.' }}</p>
      <button @click="initializePayment" class="retry-button">
        Try Again
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useStripePayment } from './StripePayment.js'
import '@/styles/checkout/StripePayment.css'

// Props
const props = defineProps({
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'usd'
  },
  orderId: {
    type: String,
    required: true
  }
})

// Emits
const emit = defineEmits(['payment-success', 'payment-error'])

// Use Stripe Payment Composable
const {
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
  handleSubmit,
  destroyStripe
} = useStripePayment(props)

const initializeStripe = async () => {
  try {
    loading.value = true

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

    // Handle real-time validation errors from the card Element
    cardElement.value.on('change', ({ error }) => {
      const displayError = document.getElementById('card-errors')
      if (error) {
        displayError.textContent = error.message
      } else {
        displayError.textContent = ''
      }
    })

  } catch (err) {
    console.error('Stripe initialization error:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const createPaymentIntent = async () => {
  try {
    const response = await fetch('/api/checkout/stripe/create-payment-intent', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: props.amount,
        currency: props.currency,
        order_id: props.orderId,
        billing_name: billingName.value,
        billing_email: billingEmail.value
      })
    })

    if (!response.ok) {
      throw new Error('Failed to create payment intent')
    }

    const data = await response.json()
    paymentIntent.value = data.data.payment_intent
    calculation.value = data.data.calculation

  } catch (err) {
    console.error('Payment intent creation error:', err)
    error.value = err.message
  }
}

const handleSubmit = async (event) => {
  event.preventDefault()

  if (!stripe.value || !elements.value || !cardElement.value) {
    error.value = 'Stripe not initialized'
    return
  }

  processing.value = true

  try {
    const { error: stripeError, paymentIntent: confirmedPaymentIntent } = await stripe.value.confirmCardPayment(
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

    if (stripeError) {
      console.error('Payment failed:', stripeError)
      emit('payment-error', stripeError)
      error.value = stripeError.message
    } else {
      emit('payment-success', confirmedPaymentIntent)
    }
  } catch (err) {
    console.error('Payment processing error:', err)
    emit('payment-error', err)
    error.value = err.message
  } finally {
    processing.value = false
  }
}

const initializePayment = async () => {
  await initializeStripe()
  if (!error.value) {
    await createPaymentIntent()
  }
}

// Lifecycle
onMounted(async () => {
  await initializePayment()
})

onUnmounted(() => {
  if (cardElement.value) {
    cardElement.value.destroy()
  }
})
</script>

<style scoped>
/* Stripe Payment Styles */
.stripe-payment {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  text-align: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.payment-form {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.payment-summary {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 24px;
}

.payment-summary h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.summary-item.total {
  font-weight: 600;
  font-size: 16px;
  border-top: 1px solid #e5e7eb;
  padding-top: 8px;
  margin-top: 8px;
}

.stripe-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.form-group input {
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.card-element {
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  transition: border-color 0.2s;
}

.card-element:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.error-message {
  color: #dc2626;
  font-size: 14px;
  margin-top: 4px;
  min-height: 20px;
}

.pay-button {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.pay-button:hover:not(:disabled) {
  background: #2563eb;
}

.pay-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.button-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-state {
  text-align: center;
  padding: 40px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
}

.error-state h3 {
  color: #dc2626;
  margin-bottom: 16px;
}

.error-state p {
  color: #7f1d1d;
  margin-bottom: 24px;
}

.retry-button {
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px 24px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background: #b91c1c;
}

/* Responsive */
@media (max-width: 640px) {
  .stripe-payment {
    padding: 16px;
  }

  .payment-form {
    padding: 16px;
  }

  .payment-summary {
    padding: 12px;
  }
}

/* Accessibility */
.pay-button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.form-group input:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .payment-form {
    border: 2px solid #000;
  }

  .form-group input,
  .card-element {
    border-width: 2px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .spinner,
  .button-spinner {
    animation: none;
  }

  .form-group input,
  .card-element,
  .pay-button {
    transition: none;
  }
}
</style>
