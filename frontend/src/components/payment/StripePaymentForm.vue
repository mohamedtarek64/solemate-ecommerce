<template>
  <div class="stripe-payment-form">
    <div class="payment-header">
      <h3 class="payment-title">Payment Details</h3>
      <div class="secure-badge">
        <span class="material-symbols-outlined">lock</span>
        <span>Secure Payment</span>
      </div>
    </div>

    <!-- Stripe Elements Container -->
    <div class="card-element-container">
      <div id="card-element" class="card-element"></div>
      <div v-if="cardError" class="card-error">
        <span class="material-symbols-outlined">error</span>
        <span>{{ cardError }}</span>
      </div>
    </div>

    <!-- Amount Display -->
    <div class="amount-display">
      <span class="amount-label">Total Amount:</span>
      <span class="amount-value">${{ formatAmount(amount) }}</span>
    </div>

    <!-- Payment Button -->
    <button
      :disabled="loading || !stripe || !elements"
      class="pay-button"
      :class="{ loading: loading }"
      @click="handlePayment"
    >
      <span v-if="loading" class="spinner-small"></span>
      <span v-else class="material-symbols-outlined">credit_card</span>
      <span>{{ loading ? 'Processing...' : `Pay $${formatAmount(amount)}` }}</span>
    </button>

    <!-- Payment Methods -->
    <div class="payment-methods">
      <span class="methods-label">We accept:</span>
      <div class="methods-icons">
        <img src="/images/payment/visa.svg" alt="Visa" class="payment-icon" />
        <img src="/images/payment/mastercard.svg" alt="Mastercard" class="payment-icon" />
        <img src="/images/payment/amex.svg" alt="American Express" class="payment-icon" />
        <img src="/images/payment/discover.svg" alt="Discover" class="payment-icon" />
      </div>
    </div>

    <!-- Security Notice -->
    <div class="security-notice">
      <span class="material-symbols-outlined">verified_user</span>
      <p>Your payment information is encrypted and secure</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { loadStripe } from '@stripe/stripe-js';

const props = defineProps({
  amount: {
    type: Number,
    required: true,
  },
  orderId: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['success', 'error']);

// State
const stripe = ref(null);
const elements = ref(null);
const cardElement = ref(null);
const loading = ref(false);
const cardError = ref('');
const clientSecret = ref('');

// Format amount
const formatAmount = (amount) => {
  return parseFloat(amount).toFixed(2);
};

// Initialize Stripe
const initializeStripe = async () => {
  try {
    // Load Stripe
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_your_public_key_here';
    stripe.value = await loadStripe(stripeKey);

    if (!stripe.value) {
      throw new Error('Failed to load Stripe');
    }

    // Create elements
    elements.value = stripe.value.elements();

    // Create card element
    const style = {
      base: {
        color: '#ffffff',
        fontFamily: '"Space Grotesk", "Noto Sans", sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#8b7355',
        },
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    };

    cardElement.value = elements.value.create('card', { style });
    cardElement.value.mount('#card-element');

    // Handle card errors
    cardElement.value.on('change', (event) => {
      cardError.value = event.error ? event.error.message : '';
    });
  } catch (error) {
    console.error('❌ Stripe initialization error:', error);
    emit('error', error.message);
  }
};

// Create payment intent
const createPaymentIntent = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('http://127.0.0.1:8000/api/payment/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount: props.amount,
        currency: 'usd',
        order_id: props.orderId,
      }),
    });

    const data = await response.json();

    if (data.success) {
      clientSecret.value = data.data.client_secret;
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to create payment intent');
    }
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Handle payment
const handlePayment = async () => {
  if (!stripe.value || !cardElement.value) {
    cardError.value = 'Stripe not initialized';
    return;
  }

  loading.value = true;
  cardError.value = '';

  try {
    // Create payment intent
    const paymentData = await createPaymentIntent();

    // Confirm card payment
    const { error, paymentIntent } = await stripe.value.confirmCardPayment(
      paymentData.client_secret,
      {
        payment_method: {
          card: cardElement.value,
        },
      }
    );

    if (error) {
      cardError.value = error.message;
      emit('error', error.message);
    } else if (paymentIntent.status === 'succeeded') {
      // Confirm payment with backend
      await confirmPayment(paymentIntent.id);
      emit('success', {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
      });
    }
  } catch (error) {
    cardError.value = error.message;
    emit('error', error.message);
    console.error('Payment error:', error);
  } finally {
    loading.value = false;
  }
};

// Confirm payment with backend
const confirmPayment = async (paymentIntentId) => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('http://127.0.0.1:8000/api/payment/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        payment_intent_id: paymentIntentId,
        order_id: props.orderId,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Payment confirmation failed');
    }

    return data;
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

// Lifecycle
onMounted(() => {
  initializeStripe();
});

onUnmounted(() => {
  if (cardElement.value) {
    cardElement.value.destroy();
  }
});
</script>

<style scoped>
.stripe-payment-form {
  background: #231910;
  border: 1px solid #4a3421;
  border-radius: 12px;
  padding: 24px;
}

.payment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #4a3421;
}

.payment-title {
  color: white;
  font-size: 20px;
  font-weight: 600;
}

.secure-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 6px;
  color: #22c55e;
  font-size: 13px;
  font-weight: 500;
}

.secure-badge .material-symbols-outlined {
  font-size: 18px;
}

.card-element-container {
  margin-bottom: 24px;
}

.card-element {
  padding: 16px;
  background: #2a1e12;
  border: 2px solid #4a3421;
  border-radius: 8px;
  transition: border-color 0.3s ease;
}

.card-element:focus-within {
  border-color: #d4a574;
}

.card-error {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  color: #ef4444;
  font-size: 14px;
}

.card-error .material-symbols-outlined {
  font-size: 20px;
}

.amount-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #2a1e12;
  border-radius: 8px;
  margin-bottom: 24px;
}

.amount-label {
  color: #ccaa8e;
  font-size: 16px;
  font-weight: 500;
}

.amount-value {
  color: #d4a574;
  font-size: 24px;
  font-weight: 700;
}

.pay-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #d4a574, #ccaa8e);
  color: #231910;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 24px;
}

.pay-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(212, 165, 116, 0.3);
}

.pay-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pay-button.loading {
  background: linear-gradient(135deg, #8b7355, #6b5845);
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid #231910;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #2a1e12;
  border-radius: 8px;
  margin-bottom: 16px;
}

.methods-label {
  color: #8b7355;
  font-size: 13px;
  font-weight: 500;
}

.methods-icons {
  display: flex;
  gap: 12px;
}

.payment-icon {
  height: 24px;
  width: auto;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.payment-icon:hover {
  opacity: 1;
}

.security-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #8b7355;
  font-size: 13px;
}

.security-notice .material-symbols-outlined {
  font-size: 18px;
  color: #22c55e;
}

/* Responsive */
@media (max-width: 768px) {
  .stripe-payment-form {
    padding: 20px;
  }

  .payment-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
