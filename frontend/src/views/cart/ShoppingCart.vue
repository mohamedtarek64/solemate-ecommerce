<template>
  <div class="shopping-cart-page">
    <div class="container mx-auto px-4 py-8">
      <div class="cart-header">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
        <p class="text-gray-600">
          {{ cartSummary.items_count }} {{ cartSummary.items_count === 1 ? 'item' : 'items' }} in your cart
        </p>
      </div>

      <!-- Optimized Loading State -->
      <OptimizedLoading
        v-if="loading || cartLoading || optimizedLoading"
        type="skeleton"
        :count="3"
        skeleton-class="cart-item"
        message="Loading your cart..."
      />

      <div v-else-if="cartSummary.items_count === 0" class="empty-cart">
        <div class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
          <p class="text-gray-600 mb-4">Add some products to get started</p>
          <router-link to="/products" class="btn-primary">
            Continue Shopping
          </router-link>
        </div>
      </div>

      <div v-else class="cart-content">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Cart Items -->
          <div class="lg:col-span-2">
            <div class="cart-items">
              <CartItem
                v-for="item in cartSummary.items"
                :key="item.id"
                :item="item"
                @update-quantity="handleUpdateQuantity"
                @remove-item="handleRemoveItem"
              />
            </div>

            <!-- Cart Issues -->
            <div v-if="cartIssues.length > 0" class="cart-issues mt-6">
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-yellow-800">Cart Issues Detected</h3>
                    <div class="mt-2 text-sm text-yellow-700">
                      <ul class="list-disc list-inside space-y-1">
                        <li v-for="issue in cartIssues" :key="issue.item_id">
                          {{ issue.product_name }}: {{ issue.issue }}
                        </li>
                      </ul>
                    </div>
                    <div class="mt-4">
                      <button
                        @click="handleFixIssues"
                        class="btn-secondary"
                      >
                        Fix Issues
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Cart Summary -->
          <div class="lg:col-span-1">
            <CartSummary
              :summary="cartSummary"
              @apply-discount="handleApplyDiscount"
              @remove-discount="handleRemoveDiscount"
              @proceed-checkout="handleProceedCheckout"
            />
          </div>
        </div>

        <!-- Continue Shopping -->
        <div class="mt-8 text-center">
          <router-link to="/products" class="btn-secondary">
            Continue Shopping
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useShoppingCart, useCartHandlers, initializeShoppingCart } from '@/composables/cart/ShoppingCart.js'
import OptimizedLoading from '@/components/OptimizedLoading.vue'
import { useOptimizedCart } from '@/composables/useOptimizedApi.js'
import { useLoadingState } from '@/utils/loadingStates.js'
import CartItem from '@/components/cart/CartItem.vue'
import CartSummary from '@/components/cart/CartSummary.vue'

const {
  cartSummary,
  loading,
  cartIssues,
  loadCart,
  updateItemQuantity,
  removeItem,
  applyDiscount,
  removeDiscount,
  fixCartIssues,
  validateCart
} = useShoppingCart()

const {
  handleUpdateQuantity: handleUpdate,
  handleRemoveItem: handleRemove,
  handleApplyDiscount: handleApply,
  handleRemoveDiscount: handleRemoveDiscount,
  handleFixIssues: handleFix,
  handleProceedCheckout
} = useCartHandlers()

const handleUpdateQuantity = (itemId, quantity) => handleUpdate(itemId, quantity, updateItemQuantity, validateCart)
const handleRemoveItem = (itemId) => handleRemove(itemId, removeItem, validateCart)
const handleApplyDiscount = (discountData) => handleApply(discountData, applyDiscount)
const handleRemoveDiscount = () => handleRemoveDiscount(removeDiscount)
const handleFixIssues = () => handleFix(cartIssues, fixCartIssues, validateCart)

const { onMounted: initShoppingCart } = initializeShoppingCart()

onMounted(async () => {
  await initShoppingCart(loadCart, validateCart)
})
</script>

<style scoped>
@import '@/styles/cart/ShoppingCart.css';
</style>
