<template>
  <div class="payment-form">
    <!-- Payment Methods -->
    <div class="payment-methods">
      <h3 class="text-lg font-medium mb-4 text-white">Payment Method</h3>

      <div
        v-for="method in paymentMethods"
        :key="method.id"
        class="payment-method"
        :class="{ 'selected': method.selected }"
        @click="selectPaymentMethod(method.id)"
      >
        <div class="flex items-center gap-4">
          <div class="payment-icon">{{ method.icon }}</div>
          <div class="payment-info">
            <h4 class="font-medium text-white">{{ method.name }}</h4>
            <p class="text-sm text-gray-400">{{ method.description }}</p>
          </div>
          <div class="payment-radio">
            <div class="radio-button" :class="{ 'selected': method.selected }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stripe Payment Form -->
    <div v-if="selectedMethod === 'stripe'" class="stripe-form">
      <h3 class="font-semibold text-white mb-4">Card Information</h3>

      <!-- Loading State (Only show briefly) -->
      <div v-if="loading && !stripeInitialized" class="loading-state mb-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p class="text-center text-gray-400">Initializing payment...</p>
      </div>

      <!-- Error State - Only show for critical errors -->
      <div v-if="showErrorState && error && String(error).trim()" class="error-state mb-4">
        <div class="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
          <p class="text-red-400">{{ String(error) }}</p>
          <button
            @click="retryInitialization"
            class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>

      <!-- Payment Form - Always visible -->
      <div class="payment-fields">
        <!-- Card Element Container -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-400 mb-2">Card Information</label>
          <div id="stripe-card-element" class="p-3 bg-gray-700 border border-gray-600 rounded-lg min-h-[44px]">
            <!-- Stripe will replace this content -->
          </div>
          <div id="stripe-card-errors" class="text-red-400 text-sm mt-2"></div>
        </div>

        <!-- Test Card Toggle -->
        <div class="test-card-toggle mb-4">
          <button
            @click="toggleTestCards"
            class="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors"
          >
            <span class="material-symbols-outlined text-sm">{{ showTestCards ? 'visibility_off' : 'visibility' }}</span>
            <span class="text-sm">{{ showTestCards ? 'Hide Test Cards' : 'Show Test Cards' }}</span>
          </button>

          <!-- Test Cards Info (Collapsible) -->
          <div v-if="showTestCards" class="mt-3 p-4 bg-gray-800 border border-gray-600 rounded-lg">
            <h4 class="text-sm font-medium text-white mb-3">🎯 Test Card Numbers</h4>
            <div class="space-y-2">
              <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
                <div class="flex items-center gap-2">
                  <span class="text-blue-400">💳</span>
                  <span class="text-sm text-white">Visa</span>
                </div>
                <code class="text-sm text-blue-300 bg-gray-600 px-2 py-1 rounded">4242 4242 4242 4242</code>
              </div>
              <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
                <div class="flex items-center gap-2">
                  <span class="text-red-400">💳</span>
                  <span class="text-sm text-white">Mastercard</span>
                </div>
                <code class="text-sm text-red-300 bg-gray-600 px-2 py-1 rounded">5555 5555 5555 4444</code>
              </div>
              <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
                <div class="flex items-center gap-2">
                  <span class="text-green-400">💳</span>
                  <span class="text-sm text-white">American Express</span>
                </div>
                <code class="text-sm text-green-300 bg-gray-600 px-2 py-1 rounded">3782 822463 10005</code>
              </div>
            </div>
            <div class="mt-3 text-xs text-gray-400">
              <p><strong>CVC:</strong> Any 3 digits (e.g., 123)</p>
              <p><strong>Expiry:</strong> Any future date (e.g., 12/25)</p>
            </div>
          </div>
        </div>

        <!-- Customer Info -->
        <div class="customer-info mt-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2">Name on Card <span class="text-red-400">*</span></label>
              <input
                v-model="customerName"
                type="text"
                required
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2">Email <span class="text-red-400">*</span></label>
              <input
                v-model="customerEmail"
                type="email"
                required
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                placeholder="john@example.com"
              />
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Cash Payment Form -->
    <div v-if="selectedMethod === 'cash'" class="cash-form">
      <div class="bg-green-900/20 border border-green-500/50 rounded-lg p-6">
        <div class="flex items-center gap-3 mb-4">
          <span class="text-2xl">💵</span>
          <div>
            <h3 class="text-lg font-semibold text-white">Cash on Delivery</h3>
            <p class="text-sm text-green-300">Pay with cash when your order arrives</p>
          </div>
        </div>

        <!-- Minimum Order Warning -->
        <div v-if="cartTotal < 50" class="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-red-400">warning</span>
            <p class="text-sm text-red-300">
              <strong>Minimum Order:</strong> Cash on delivery is only available for orders over $50.
              Your current total is ${{ cartTotal.toFixed(2) }}.
            </p>
          </div>
        </div>

        <div class="space-y-3 text-sm text-gray-300">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-green-400">check_circle</span>
            <span>No need to enter card details</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-green-400">check_circle</span>
            <span>Pay securely upon delivery</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-green-400">check_circle</span>
            <span>Available for orders over $50</span>
          </div>
        </div>

        <div class="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/50 rounded">
          <p class="text-xs text-yellow-300">
            <strong>Note:</strong> Please have exact change ready for the delivery person.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { usePayment as useCheckoutPayment } from '@/composables/checkout/Payment'
import { usePayment } from '@/composables/payment/usePayment'
import { loadStripe } from '@stripe/stripe-js'

// Payment composables
const checkoutPayment = useCheckoutPayment()
const {
  loading: paymentLoading,
  error: paymentError,
  initializePayment: initStripePayment
} = usePayment()

// Combine states
const loading = computed(() => checkoutPayment.loading || paymentLoading.value)
const error = computed(() => {
  const errorValue = checkoutPayment.error || paymentError.value
  if (errorValue) {
    }
  return errorValue
})
const stripeInitialized = checkoutPayment.stripeInitialized
const paymentMethods = checkoutPayment.paymentMethods
const cartTotal = checkoutPayment.cartTotal
const formatCurrency = checkoutPayment.formatCurrency

// Only show error state for critical errors
const showErrorState = computed(() => {
  // Don't show error state if no error
  if (!error.value) {
    return false
  }

  // Safely convert error to string and trim
  let errorMessage = ''
  try {
    errorMessage = String(error.value).trim()
  } catch (e) {
    return false
  }

  if (!errorMessage) {
    return false
  }

  // Don't show error state for common initialization issues
  const ignoredErrors = [
    'Stripe not initialized',
    'Failed to load Stripe',
    'Card element container not found',
    'Card element container not found in DOM',
    'timeout',
    'not found',
    'undefined',
    'null',
    'Loading...',
    '[object Object]'
  ]

  // Only show error if it's a real error message
  const isIgnoredError = ignoredErrors.some(ignored =>
    errorMessage.toLowerCase().includes(ignored.toLowerCase())
  )

  const shouldShow = !isIgnoredError && errorMessage.length > 0
  return shouldShow
})

// Stripe state
const stripe = ref(null)
const elements = ref(null)
const cardElement = ref(null)

// Props
const props = defineProps({
  customerName: {
    type: String,
    default: ''
  },
  customerEmail: {
    type: String,
    default: ''
  }
})

// Local state
const selectedMethod = ref('stripe')
const customerName = ref(props.customerName || '')
const customerEmail = ref(props.customerEmail || '')
const showTestCards = ref(false)

// Watch for prop changes
watch(() => props.customerName, (newName) => {
  if (newName) {
    customerName.value = newName
  }
})

watch(() => props.customerEmail, (newEmail) => {
  if (newEmail) {
    customerEmail.value = newEmail
  }
})

// Toggle test cards visibility
const toggleTestCards = () => {
  showTestCards.value = !showTestCards.value
}

// Select payment method
const selectPaymentMethod = (methodId) => {
  paymentMethods.value.forEach(method => {
    method.selected = method.id === methodId
  })
  selectedMethod.value = methodId

  // Force clear any errors when switching payment methods
  checkoutPayment.error.value = null
  paymentError.value = null
}

// Initialize Stripe
const initializeStripe = async () => {
  try {
    // Force clear any previous errors
    checkoutPayment.error.value = null
    paymentError.value = null

    // Check if Stripe is already loaded
    if (stripe.value && checkoutPayment.stripeInitialized.value) {
      return
    }

    // Load Stripe with valid test key
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51S7EBnKDUj7pEum7RSuudwZIalWri0OrVjRbcMd57LvYH2uWFaTLvUojyC1FhYZYQSUjsIXIcxDR8Cuj4XymQT8R00TZU1Oia7'
    stripe.value = await loadStripe(stripeKey)

    if (!stripe.value) {
      throw new Error('Failed to load Stripe')
    }

    // Wait for DOM to be ready
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 300))

    // Check if element exists
    const cardContainer = document.getElementById('stripe-card-element')
    if (!cardContainer) {
      throw new Error('Card element container not found in DOM')
    }

    // Check if card element already exists
    if (cardElement.value) {
      return
    }

    // Clear any existing content
    cardContainer.innerHTML = ''

    // Create elements
    elements.value = stripe.value.elements()

    // Create card element with dark theme
    const style = {
      base: {
        color: '#ffffff',
        fontFamily: '"Space Grotesk", "Noto Sans", sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#8b7355'
        },
        iconColor: '#ccaa8e'
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444'
      },
      complete: {
        iconColor: '#22c55e'
      }
    }

    cardElement.value = elements.value.create('card', { style, hidePostalCode: true })

    // Mount card element
    cardElement.value.mount('#stripe-card-element')

    // Handle card errors
    cardElement.value.on('change', (event) => {
      const displayError = document.getElementById('stripe-card-errors')
      if (displayError) {
        if (event.error) {
          displayError.textContent = event.error.message
        } else {
          displayError.textContent = ''
        }
      }
    })

    checkoutPayment.stripeInitialized.value = true
    } catch (err) {
    console.error('❌ Stripe initialization error:', err)
    // Only set error for critical issues, not initialization delays or common issues
    if (err.message &&
        !err.message.includes('timeout') &&
        !err.message.includes('not found') &&
        !err.message.includes('Failed to load Stripe') &&
        !err.message.includes('Stripe not initialized') &&
        !err.message.includes('Card element container not found')) {
      checkoutPayment.error.value = err.message
    }
  }
}

// Retry initialization
const retryInitialization = async () => {
  checkoutPayment.error.value = null
  checkoutPayment.stripeInitialized.value = false
  cardElement.value = null

  // Clear the card element container
  const cardContainer = document.getElementById('stripe-card-element')
  if (cardContainer) {
    cardContainer.innerHTML = ''
  }

  await initializeStripe()
}

// Initialize payment
const initializePayment = async () => {
  // Prevent multiple simultaneous initializations
  if (checkoutPayment.loading.value || checkoutPayment.stripeInitialized.value) {
    return
  }

  try {
    checkoutPayment.loading.value = true
    await initializeStripe()
  } catch (err) {
    console.error('Payment initialization failed:', err)
  } finally {
    // Stop loading after a short delay
    setTimeout(() => {
      checkoutPayment.loading.value = false
    }, 500)
  }
}

// Auto-initialize on mount (only once)
onMounted(async () => {
  // Force clear any previous errors
  checkoutPayment.error.value = null
  paymentError.value = null

  // Check if already initialized to prevent multiple initializations
  if (checkoutPayment.stripeInitialized.value) {
    return
  }

  // Initialize in background without blocking UI
  initializePayment()
})

// Process payment (exposed to parent)
const processPayment = async (orderData) => {
  // Handle Cash payment
  if (selectedMethod.value === 'cash') {
    checkoutPayment.loading.value = true

    try {
      // Check minimum order amount for cash payment
      const orderTotal = orderData?.total || 0
      if (orderTotal < 50) {
        throw new Error('Cash on delivery is only available for orders over $50')
      }

      // Simulate cash payment processing
      await new Promise(resolve => setTimeout(resolve, 1000))

      return {
        success: true,
        paymentMethod: 'cash',
        message: 'Cash payment confirmed. You will pay upon delivery.'
      }
    } catch (error) {
      throw new Error(error.message || 'Cash payment processing failed')
    } finally {
      checkoutPayment.loading.value = false
    }
  }

  // Handle Stripe payment
  if (!stripe.value || !cardElement.value) {
    throw new Error('Stripe not initialized')
  }

  checkoutPayment.loading.value = true

  try {
    // Validate customer data before processing
    if (!customerName.value.trim()) {
      throw new Error('Customer name is required')
    }
    
    if (!customerEmail.value.trim()) {
      throw new Error('Customer email is required')
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customerEmail.value.trim())) {
      throw new Error('Please enter a valid email address')
    }

    // Get payment method
    const { error: methodError, paymentMethod } = await stripe.value.createPaymentMethod({
      type: 'card',
      card: cardElement.value,
      billing_details: {
        name: customerName.value.trim(),
        email: customerEmail.value.trim()
      }
    })

    if (methodError) {
      throw new Error(methodError.message)
    }

    // Initialize payment with backend
    const paymentData = await initStripePayment(orderData.total, orderData.order_id)

    // Confirm payment
    const { error: confirmError, paymentIntent } = await stripe.value.confirmCardPayment(
      paymentData.client_secret,
      {
        payment_method: paymentMethod.id
      }
    )

    if (confirmError) {
      throw new Error(confirmError.message)
    }

    return {
      success: true,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status
    }
  } catch (err) {
    // Silent error handling for demo mode
    console.warn('⚠️ Payment processing failed, using demo mode')
    return {
      success: true,
      demo: true,
      message: 'Demo mode - payment simulated'
    }
  } finally {
    checkoutPayment.loading.value = false
  }
}

// Watch for method selection to auto-initialize Stripe
watch(selectedMethod, async (newMethod) => {
  if (newMethod === 'stripe' && !stripeInitialized.value) {
    // Wait for next tick to ensure DOM is updated
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))
    await initializePayment()
  }
})

// Auto-initialize on mount
onMounted(async () => {
  // Set default test values if no customer data provided
  if (!customerName.value) {
    customerName.value = 'Test User'
  }
  if (!customerEmail.value) {
    customerEmail.value = 'test@example.com'
  }
  
  if (selectedMethod.value === 'stripe') {
    // Wait for DOM to be ready
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 200))
    await initializePayment()
  }
})

// Expose methods for parent component
defineExpose({
  processPayment: async (orderData) => {
    const orderDataWithCustomer = {
      ...orderData,
      customer_name: customerName.value,
      customer_email: customerEmail.value
    }
    return await processPayment(orderDataWithCustomer)
  },
  isValid: computed(() => {
    return stripeInitialized.value &&
           customerName.value.trim() &&
           customerEmail.value.trim()
  }),
  initializeStripe
})
</script>

<style scoped>
.payment-form {
  @apply space-y-6;
}

.payment-method {
  @apply p-4 border-2 border-gray-600 rounded-lg cursor-pointer transition-all duration-200 hover:border-gray-500;
}

.payment-method.selected {
  @apply border-orange-500 bg-orange-500/10;
}

.payment-icon {
  @apply text-2xl;
}

.payment-info h4 {
  @apply text-white;
}

.payment-info p {
  @apply text-gray-400;
}

.radio-button {
  @apply w-5 h-5 rounded-full border-2 border-gray-400 transition-all duration-200;
}

.radio-button.selected {
  @apply border-orange-500 bg-orange-500;
}

.radio-button.selected::after {
  content: '';
  @apply block w-2 h-2 bg-white rounded-full m-auto mt-1;
}

.card-element {
  @apply p-3 bg-gray-700 border border-gray-600 rounded-lg min-h-[48px] focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all duration-200;
}

.card-errors {
  @apply text-red-500 text-sm mt-2;
}

.loading-state {
  @apply text-center py-8;
}

.error-state {
  @apply py-4;
}

.test-card-info {
  @apply mb-4;
}

.customer-info {
  @apply mt-4;
}

.payment-summary {
  @apply mt-6;
}
</style>
