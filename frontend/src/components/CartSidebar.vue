<template>
  <div v-if="isOpen" class="cart-sidebar-overlay" @click.self="close">
    <div class="cart-sidebar" @click.stop>
      <!-- Header -->
      <div class="cart-sidebar-header">
        <h3 class="cart-title">Shopping Cart</h3>
        <button @click="close" class="close-button">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <!-- Cart Items -->
      <div class="cart-items">
        <div v-if="cartItems.length === 0" class="empty-cart">
          <span class="material-symbols-outlined">shopping_bag</span>
          <p>Your cart is empty</p>
        </div>

        <div v-else>
          <div v-for="item in cartItems" :key="item.id" class="cart-item">
            <div class="item-image">
              <img :src="item.image || item.product_image || '/placeholder-image.jpg'" :alt="item.name || item.product_name || 'Product'" />
            </div>
            <div class="item-details">
              <h4 class="item-name">{{ item.name || item.product_name || 'Loading Product...' }}</h4>
              <div class="item-specs">
                <span v-if="item.color || item.color_name" class="item-spec color">Color: {{ getColorString(item.color || item.color_name) }}</span>
                <span v-if="item.size" class="item-spec size">Size: {{ getSizeString(item.size) }}</span>
              </div>
              <div class="item-price-section">
                <p class="item-price">${{ formatPrice(item.price || item.product_price) }}</p>
                <p class="item-total-price">Total: ${{ formatPrice((item.price || item.product_price || 0) * (item.quantity || 1)) }}</p>
              </div>
              <div class="item-controls">
                <div class="quantity-controls">
                  <button class="quantity-btn" @click="updateQuantity(item.id, item.quantity - 1)">-</button>
                  <span class="quantity-input">{{ item.quantity }}</span>
                  <button class="quantity-btn" @click="updateQuantity(item.id, item.quantity + 1)">+</button>
                </div>
                <button @click="removeItem(item.id)" class="remove-button">
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="cart-sidebar-footer">
        <div class="cart-total">
          <span>Total: ${{ formatPrice(total) }}</span>
        </div>
        <button class="checkout-button" @click="goToCheckout">
          Checkout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCartSidebar } from '@/composables/components/CartSidebar.js'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  cartItems: {
    type: Array,
    default: () => []
  }
})

// Watchers for reactivity
watch(() => props.isOpen, (newValue) => {
  // Sidebar state changed
})

watch(() => props.cartItems, (newItems) => {
  // Cart items updated
}, { deep: true })

// Router
const router = useRouter()

// Emits
const emit = defineEmits(['close', 'update-quantity', 'remove-item', 'update-size'])

// Computed
const total = computed(() => {
  return props.cartItems.reduce((sum, item) => {
    if (!item) return sum

    const itemPrice = parseFloat(item.price) || 0
    const itemQuantity = parseInt(item.quantity) || 1
    const itemTotal = itemPrice * itemQuantity

    return sum + itemTotal
  }, 0)
})

// Methods
const formatPrice = (price) => {
  const numPrice = parseFloat(price)
  if (isNaN(numPrice)) {
    console.warn('Invalid price:', price)
    return '0.00'
  }
  return numPrice.toFixed(2)
}

const close = () => {
  emit('close')
}

const updateQuantity = async (itemId, newQuantity) => {
  // Validate quantity limits
  if (newQuantity < 0) {
    return; // Don't update if quantity is less than 0 (allow removal)
  }
  if (newQuantity > 10) {
    return; // Don't update if quantity is more than 10
  }

  try {
    // Just emit the event - let the parent component handle the API call
    emit('update-quantity', itemId, newQuantity)
  } catch (error) {
    console.error('Error updating quantity:', error)
  }
}

const removeItem = (itemId) => {
  emit('remove-item', itemId)
}

const goToCheckout = () => {
  // Close the sidebar first
  emit('close')

  // Navigate to cart page
  router.push('/cart')
}

// Helper functions to convert objects to strings
const getColorString = (color) => {
  if (!color) return ''
  if (typeof color === 'string') {
    try {
      const parsed = JSON.parse(color)
      return parsed.color || parsed.name || color
    } catch {
      return color
    }
  }
  if (typeof color === 'object') {
    return color.color || color.name || JSON.stringify(color)
  }
  return String(color)
}

const getSizeString = (size) => {
  if (!size) return ''
  if (typeof size === 'string') {
    try {
      const parsed = JSON.parse(size)
      return parsed.size || parsed.name || size
    } catch {
      return size
    }
  }
  if (typeof size === 'object') {
    return size.size || size.name || JSON.stringify(size)
  }
  return String(size)
}
</script>

<style scoped>
@import '@/styles/components/CartSidebar.css';
</style>
