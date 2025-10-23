<template>
  <div class="payment-success-page">
    <!-- Header -->
    <header class="payment-header">
      <div class="container">
        <router-link to="/" class="logo">
          <div class="logo-icon">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
            </svg>
          </div>
          <h2>SoleMate</h2>
        </router-link>
      </div>
    </header>

    <!-- Main Content -->
    <main class="payment-main">
      <div class="container">
        <div class="success-card">
          <!-- Success Icon -->
          <div class="success-icon-wrapper">
            <div class="success-icon">
              <span class="material-symbols-outlined">check_circle</span>
            </div>
            <div class="success-ripple"></div>
          </div>

          <!-- Success Message -->
          <h1 class="success-title">Payment Successful!</h1>
          <p class="success-subtitle">Thank you for your purchase</p>

          <!-- Order Details -->
          <div class="order-details">
            <div class="detail-row">
              <span class="detail-label">Order Number:</span>
              <span class="detail-value">#{{ orderId }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment ID:</span>
              <span class="detail-value">{{ paymentIntentId }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Amount Paid:</span>
              <span class="detail-value amount">${{ formatAmount(amount) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Method:</span>
              <span class="detail-value">Credit Card</span>
            </div>
          </div>

          <!-- Next Steps -->
          <div class="next-steps">
            <h3>What's Next?</h3>
            <ul>
              <li>
                <span class="material-symbols-outlined">mail</span>
                <span>Confirmation email sent to your inbox</span>
              </li>
              <li>
                <span class="material-symbols-outlined">inventory_2</span>
                <span>Your order is being prepared</span>
              </li>
              <li>
                <span class="material-symbols-outlined">local_shipping</span>
                <span>You'll receive tracking info soon</span>
              </li>
            </ul>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <router-link to="/orders" class="btn btn-primary">
              <span class="material-symbols-outlined">receipt_long</span>
              <span>View Order</span>
            </router-link>
            <router-link to="/products" class="btn btn-secondary">
              <span class="material-symbols-outlined">shopping_bag</span>
              <span>Continue Shopping</span>
            </router-link>
          </div>

          <!-- Security Notice -->
          <div class="security-notice">
            <span class="material-symbols-outlined">verified_user</span>
            <p>Your payment was processed securely through Stripe</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const orderId = ref('')
const paymentIntentId = ref('')
const amount = ref(0)

const formatAmount = (amt) => {
  return parseFloat(amt).toFixed(2)
}

onMounted(() => {
  // Get data from route query
  orderId.value = route.query.order_id || 'N/A'
  paymentIntentId.value = route.query.payment_intent || 'N/A'
  amount.value = route.query.amount || 0

  // If no data, redirect to home
  if (!orderId.value || orderId.value === 'N/A') {
    setTimeout(() => {
      router.push('/')
    }, 3000)
  }
})
</script>

<style scoped>
.payment-success-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0a06 0%, #231910 100%);
}

.payment-header {
  background: #231910;
  border-bottom: 1px solid #4a3421;
  padding: 20px 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  text-decoration: none;
  font-size: 24px;
  font-weight: bold;
}

.logo-icon {
  width: 40px;
  height: 40px;
  color: #d4a574;
}

.payment-main {
  padding: 80px 0;
}

.success-card {
  background: #231910;
  border: 1px solid #4a3421;
  border-radius: 16px;
  padding: 48px;
  text-align: center;
}

.success-icon-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 32px;
}

.success-icon {
  position: relative;
  z-index: 2;
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: scaleIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.success-icon .material-symbols-outlined {
  font-size: 72px;
  color: white;
}

.success-ripple {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 3px solid #22c55e;
  border-radius: 50%;
  animation: ripple 1.5s infinite;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes ripple {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.success-title {
  font-size: 36px;
  font-weight: 700;
  color: white;
  margin-bottom: 12px;
}

.success-subtitle {
  font-size: 18px;
  color: #ccaa8e;
  margin-bottom: 40px;
}

.order-details {
  background: #2a1e12;
  border: 1px solid #4a3421;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  text-align: left;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #4a3421;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  color: #8b7355;
  font-size: 14px;
}

.detail-value {
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.detail-value.amount {
  color: #22c55e;
  font-size: 18px;
  font-weight: 700;
}

.next-steps {
  background: #2a1e12;
  border: 1px solid #4a3421;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  text-align: left;
}

.next-steps h3 {
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.next-steps ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.next-steps li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  color: #ccaa8e;
  font-size: 14px;
}

.next-steps .material-symbols-outlined {
  color: #22c55e;
  font-size: 24px;
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 24px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #d4a574, #ccaa8e);
  color: #231910;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(212, 165, 116, 0.3);
}

.btn-secondary {
  background: transparent;
  border: 2px solid #4a3421;
  color: #ccaa8e;
}

.btn-secondary:hover {
  background: #2a1e12;
  border-color: #d4a574;
  color: #d4a574;
}

.security-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #8b7355;
  font-size: 13px;
}

.security-notice .material-symbols-outlined {
  color: #22c55e;
  font-size: 18px;
}

/* Responsive */
@media (max-width: 768px) {
  .success-card {
    padding: 32px 24px;
  }

  .success-title {
    font-size: 28px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
