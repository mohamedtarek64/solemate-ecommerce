<template>
  <div class="relative flex size-full min-h-screen flex-col bg-[#231910] dark group/design-root overflow-x-hidden" style='font-family: "Space Grotesk", "Noto Sans", sans-serif;'>
    <!-- Header -->
    <header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#4a3421] px-10 py-4">
      <router-link to="/" class="flex items-center gap-4 text-white hover:opacity-80 transition-opacity">
        <div class="size-6 text-[#f97306]">
          <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
          </svg>
        </div>
        <h2 class="text-white text-xl font-bold leading-tight tracking-[-0.015em]">SoleMate</h2>
      </router-link>

      <div class="hidden lg:flex items-center gap-8 text-sm font-medium text-white">
        <router-link to="/products?new=true" class="hover:text-[#f97306] transition-colors">New Arrivals</router-link>
        <router-link to="/products?category=men" class="hover:text-[#f97306] transition-colors">Men</router-link>
        <router-link to="/products?category=women" class="hover:text-[#f97306] transition-colors">Women</router-link>
        <router-link to="/products?category=kids" class="hover:text-[#f97306] transition-colors">Kids</router-link>
      </div>

      <div class="flex items-center gap-4">
        <button @click="showSearchModal = true" class="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#4a3421] text-white hover:bg-[#f97306] transition-colors" title="Search">
          <span class="material-symbols-outlined">search</span>
        </button>
        <router-link to="/wishlist" class="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#4a3421] text-white hover:bg-[#f97306] transition-colors" title="Wishlist">
          <span class="material-symbols-outlined">favorite</span>
        </router-link>
        <ProfileDropdown />
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 px-4 sm:px-6 lg:px-8 py-12">
      <div class="max-w-7xl mx-auto">
        <!-- Breadcrumb -->
        <div class="flex items-center gap-2 mb-8">
          <router-link to="/" class="text-[#ccaa8e] hover:text-white text-sm font-medium">Home</router-link>
          <span class="text-[#ccaa8e] text-sm">/</span>
          <span class="text-white text-sm font-medium">Shopping Cart</span>
        </div>

        <h1 class="text-white text-4xl font-bold tracking-tight mb-8">Your Cart</h1>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f97306] mx-auto"></div>
          <p class="mt-4 text-[#ccaa8e]">Loading cart...</p>
        </div>

        <!-- Empty Cart -->
        <div v-else-if="cartItems.length === 0" class="text-center py-12">
          <div class="bg-[#2a1e12] rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
            <span class="material-symbols-outlined text-4xl text-[#ccaa8e]">shopping_cart</span>
          </div>
          <h3 class="text-xl font-semibold text-white mb-2">Your cart is empty</h3>
          <p class="text-[#ccaa8e] mb-6">Start adding some items to your cart.</p>
          <router-link
            to="/products"
            class="inline-flex items-center px-6 py-3 bg-[#f97306] text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            Continue Shopping
          </router-link>
        </div>

        <!-- Cart Content -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <!-- Cart Items -->
          <div class="lg:col-span-2 space-y-6">
            <div
              v-for="item in cartItems"
              :key="item.id"
              class="flex items-center gap-6 p-4 bg-[#2a1e12] rounded-lg"
            >
              <!-- Product Image -->
              <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-md w-24 h-24 bg-[#4a3421] flex items-center justify-center">
                <span v-if="!item.image && !item.product_image" class="material-symbols-outlined text-2xl text-[#ccaa8e]">image</span>
                <img v-else :src="item.image || item.product_image" :alt="item.name || item.product_name" class="w-full h-full object-cover rounded-md">
              </div>

              <!-- Product Info -->
              <div class="flex-1">
                <h3 class="text-white text-lg font-semibold">{{ item.name || item.product_name }}</h3>
                <p class="text-[#ccaa8e] text-sm">Size: {{ item.size || 'N/A' }}</p>
                <p v-if="item.color || item.color_name" class="text-[#ccaa8e] text-sm">Color: {{ getColorString(item.color || item.color_name) }}</p>
                <div class="flex items-center gap-4 mt-2">
                  <!-- Quantity Controls -->
                  <div class="flex items-center border border-[#4a3421] rounded-md">
                    <button
                      @click="optimizedUpdateQuantity(item.id, (item.cart_quantity || item.quantity) - 1)"
                      :disabled="buttonLoadingStates[`qty-${item.id}`]"
                      class="px-2 py-1 text-white hover:bg-[#4a3421] rounded-l-md transition-colors disabled:opacity-50"
                    >
                      {{ buttonLoadingStates[`qty-${item.id}`] ? '⏳' : '-' }}
                    </button>
                    <span class="px-3 text-white">{{ item.cart_quantity || item.quantity }}</span>
                    <button
                      @click="optimizedUpdateQuantity(item.id, (item.cart_quantity || item.quantity) + 1)"
                      :disabled="buttonLoadingStates[`qty-${item.id}`]"
                      class="px-2 py-1 text-white hover:bg-[#4a3421] rounded-r-md transition-colors disabled:opacity-50"
                    >
                      {{ buttonLoadingStates[`qty-${item.id}`] ? '⏳' : '+' }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Price and Remove -->
              <div class="text-right">
                <p class="text-white text-lg font-semibold">${{ ((item.price || item.product_price || 0) * (item.cart_quantity || item.quantity)).toFixed(2) }}</p>
                <button
                  @click="optimizedRemoveItem(item.id)"
                  :disabled="buttonLoadingStates[`remove-${item.id}`]"
                  class="text-[#ccaa8e] hover:text-white text-sm mt-2 transition-colors disabled:opacity-50"
                >
                  {{ buttonLoadingStates[`remove-${item.id}`] ? 'Removing...' : 'Remove' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="lg:col-span-1">
            <div class="bg-[#2a1e12] p-6 rounded-lg">
              <h2 class="text-white text-2xl font-bold mb-6">Order Summary</h2>

              <div class="space-y-4">
                <div class="flex justify-between text-sm">
                  <p class="text-[#ccaa8e]">Subtotal</p>
                  <p class="text-white font-medium">${{ subtotal.toFixed(2) }}</p>
                </div>
                <div class="flex justify-between text-sm">
                  <p class="text-[#ccaa8e]">Shipping</p>
                  <p class="text-white font-medium">{{ shippingCost > 0 ? `$${shippingCost.toFixed(2)}` : 'Free' }}</p>
                </div>
                <div class="flex justify-between text-sm">
                  <p class="text-[#ccaa8e]">Taxes</p>
                  <p class="text-white font-medium">${{ taxAmount.toFixed(2) }}</p>
                </div>
                <div v-if="discountAmount > 0" class="flex justify-between text-sm text-green-400">
                  <p>Discount{{ appliedDiscountCode ? ` (${appliedDiscountCode.name})` : '' }}</p>
                  <p>-${{ discountAmount.toFixed(2) }}</p>
                </div>
              </div>

              <div class="border-t border-[#4a3421] my-6"></div>

              <div class="flex justify-between text-lg font-bold">
                <p class="text-white">Total</p>
                <p class="text-white">${{ totalAmount.toFixed(2) }}</p>
              </div>

              <!-- Promo Code Section -->
              <div class="mt-8">
                <h3 class="text-white text-lg font-semibold mb-4">💰 Discount Code</h3>

                <!-- Available Discount Codes Info -->
                <div class="mb-4 p-3 bg-[#352518] rounded-md border border-[#4a3421]">
                  <p class="text-[#ccaa8e] text-sm mb-2">💡 Available discount codes:</p>
                  <div class="grid grid-cols-1 gap-2">
                    <div class="flex items-center justify-between p-2 bg-green-900/20 rounded border border-green-700">
                      <span class="text-green-400 text-sm font-medium">WELCOME10</span>
                      <span class="text-green-300 text-xs">10% off (min $50)</span>
                    </div>
                    <div class="flex items-center justify-between p-2 bg-blue-900/20 rounded border border-blue-700">
                      <span class="text-blue-400 text-sm font-medium">SAVE20</span>
                      <span class="text-blue-300 text-xs">$20 off (min $100)</span>
                    </div>
                    <div class="flex items-center justify-between p-2 bg-purple-900/20 rounded border border-purple-700">
                      <span class="text-purple-400 text-sm font-medium">FLASH50</span>
                      <span class="text-purple-300 text-xs">50% off everything!</span>
                    </div>
                    <div class="flex items-center justify-between p-2 bg-orange-900/20 rounded border border-orange-700">
                      <span class="text-orange-400 text-sm font-medium">NEWUSER</span>
                      <span class="text-orange-300 text-xs">25% off for new users</span>
                    </div>
                  </div>
                </div>

                <label class="sr-only" for="promo-code">Promo Code</label>
                <div class="flex">
                  <input
                    class="form-input flex-1 rounded-l-md border-r-0 border-[#6a4a2f] bg-[#352518] text-white placeholder:text-[#ccaa8e] focus:border-[#f97306] focus:ring-0 uppercase text-center"
                    id="promo-code"
                    placeholder="ENTER PROMO CODE (E.G., WELCOME10)"
                    type="text"
                    v-model="promoCode"
                    :disabled="appliedDiscountCode"
                    maxlength="50"
                    @input="formatPromoCode"
                  />
                  <button
                    v-if="!appliedDiscountCode"
                    @click="optimizedApplyPromoCode"
                    :disabled="buttonLoadingStates['promo'] || !promoCode.trim()"
                    class="bg-[#4a3421] hover:bg-[#f97306] text-white font-bold py-2 px-4 rounded-r-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ buttonLoadingStates['promo'] ? 'Applying...' : 'Apply' }}
                  </button>
                  <button
                    v-else
                    @click="removeDiscount"
                    class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-r-md transition-colors"
                  >
                    Remove
                  </button>
                </div>

                <!-- Applied Discount Info -->
                <div v-if="appliedDiscountCode" class="mt-3 p-3 bg-green-900/20 rounded-md border border-green-700">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-green-400 text-sm font-medium">✅ Applied: {{ appliedDiscountCode.name }}</p>
                      <p class="text-green-300 text-xs">{{ appliedDiscountCode.description }}</p>
                    </div>
                    <div class="text-right">
                      <p class="text-green-400 font-bold">-{{ appliedDiscountCode.type === 'percentage' ? appliedDiscountCode.value + '%' : '$' + appliedDiscountCode.value }}</p>
                      <p class="text-green-300 text-xs">You saved ${{ discountAmount.toFixed(2) }}</p>
                    </div>
                  </div>
                </div>

                <!-- Instructions -->
                <div v-if="!appliedDiscountCode" class="mt-2 text-xs text-[#ccaa8e]">
                  💡 Enter any of the codes above to get your discount!
                </div>
              </div>

              <!-- Checkout Button -->
              <button
                @click="proceedToCheckout"
                class="w-full mt-6 bg-[#f97306] text-white text-base font-bold py-3 rounded-md hover:bg-orange-600 transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Search Modal -->
    <SearchModal v-model="showSearchModal" @close="showSearchModal = false" />
  </div>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue'
import { useCart } from '@/composables/useCart'
import { useCartPage } from '@/composables/cart/Cart.js'
import ProfileDropdown from '@/components/ProfileDropdown.vue'
import SearchModal from '@/components/search/SearchModal.vue'
import { useNotifications } from '@/composables/useNotifications'
// ✅ Enhanced Cart Optimization
import { useCartOptimization } from '@/composables/useCartOptimization'
import OptimizedImage from '@/components/common/OptimizedImage.vue'
import cartOptimizer from '@/utils/cartOptimizer'
import performanceMonitorEnhanced from '@/utils/performanceMonitorEnhanced'

// Search modal state
const showSearchModal = ref(false)

// ✅ Enhanced Cart Optimization
const cartOptimization = useCartOptimization()

// Performance optimizations
const buttonLoadingStates = ref({})
const { success, showError } = useNotifications()

// Use the cart composable
const {
  cartItems,
  isLoading,
  promoCode,
  discountAmount,
  appliedDiscountCode,
  user,
  isAuthenticated,
  subtotal,
  shippingCost,
  taxAmount,
  totalAmount,
  loadCartItems,
  updateQuantity,
  removeItem,
  applyPromoCode,
  proceedToCheckout
} = useCart()

// Optimized quantity update with debouncing
const optimizedUpdateQuantity = async (itemId, newQuantity) => {
  if (buttonLoadingStates.value[`qty-${itemId}`]) return

  if (newQuantity < 1) {
    await optimizedRemoveItem(itemId)
    return
  }

  buttonLoadingStates.value[`qty-${itemId}`] = true

  try {
    await updateQuantity(itemId, newQuantity)
  } catch (error) {
    showError('Failed to update quantity')
  } finally {
    setTimeout(() => {
      buttonLoadingStates.value[`qty-${itemId}`] = false
    }, 300)
  }
}

// Optimized remove item with confirmation
const optimizedRemoveItem = async (itemId) => {
  if (buttonLoadingStates.value[`remove-${itemId}`]) return

  buttonLoadingStates.value[`remove-${itemId}`] = true

  try {
    await removeItem(itemId)
    success('Item removed from cart')
  } catch (error) {
    showError('Failed to remove item')
  } finally {
    setTimeout(() => {
      buttonLoadingStates.value[`remove-${itemId}`] = false
    }, 300)
  }
}

// Optimized promo code application
const optimizedApplyPromoCode = async () => {
  if (buttonLoadingStates.value['promo']) return

  buttonLoadingStates.value['promo'] = true

  try {
    await applyPromoCode()
    // Success message is handled in the composable
  } catch (error) {
    // Error message is handled in the composable
  } finally {
    setTimeout(() => {
      buttonLoadingStates.value['promo'] = false
    }, 500)
  }
}

// Remove applied discount
const removeDiscount = () => {
  discountAmount.value = 0
  appliedDiscountCode.value = null
  promoCode.value = ''
  success('Discount removed')
}

// Format promo code input (uppercase, alphanumeric only)
const formatPromoCode = (event) => {
  let value = event.target.value
  // Remove non-alphanumeric characters and convert to uppercase
  value = value.replace(/[^A-Z0-9]/gi, '').toUpperCase()
  // Limit to 50 characters
  value = value.substring(0, 50)
  event.target.value = value
  promoCode.value = value
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

// Use cart page composable
const {
  continueShopping,
  startShopping,
  saveForLater,
  formatCurrency
} = useCartPage()

// Load cart items when component mounts
onMounted(async () => {
  // ✅ Start performance monitoring
  const measurement = performanceMonitorEnhanced.startMeasure('cart-page-load', 'page-load')
  
  // ✅ Load with caching and optimization
  try {
    await loadCartItems()
    // ✅ Setup image lazy loading
    requestAnimationFrame(() => {
      const images = document.querySelectorAll('img')
      images.forEach((img, index) => {
        if (index > 2) img.loading = 'lazy'
      })
    })
  } finally {
    performanceMonitorEnhanced.endMeasure(measurement)
  }
  
  })
</script>

<style scoped>
@import '@/styles/cart/Cart.css';
@import '@/styles/components/OptimizedButtons.css';
</style>
