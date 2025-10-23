<template>
  <div class="relative flex size-full min-h-screen flex-col bg-[#231910] dark group/design-root overflow-x-hidden" style='font-family: "Space Grotesk", "Noto Sans", sans-serif;'>
    <!-- Header -->
    <header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#4a3421] px-10 py-4">
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
        <router-link to="/" class="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#4a3421] text-white hover:bg-[#f97306] transition-colors" title="Search">
          <span class="material-symbols-outlined">search</span>
        </router-link>
        <router-link to="/wishlist" class="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#4a3421] text-white hover:bg-[#f97306] transition-colors" title="Wishlist">
          <span class="material-symbols-outlined">favorite</span>
        </router-link>
        <div class="bg-[#f97306] text-white rounded-full size-10 flex items-center justify-center font-bold text-lg">
          {{ user?.first_name?.charAt(0) || 'U' }}
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 px-4 sm:px-6 lg:px-8 xl:px-40 py-12">
      <div class="mx-auto max-w-5xl">
         <!-- Breadcrumb -->
        <div class="mb-8">
          <div class="flex items-center gap-2 mb-8">
            <router-link to="/" class="text-[#ccaa8e] hover:text-white text-sm font-medium">Home</router-link>
            <span class="text-[#ccaa8e] text-sm">/</span>
            <router-link to="/cart" class="text-[#ccaa8e] hover:text-white text-sm font-medium">Cart</router-link>
            <span class="text-[#ccaa8e] text-sm">/</span>
            <span class="text-white text-sm font-medium">Order Success</span>
          </div>
          <h1 class="text-white text-4xl font-bold tracking-tight mb-8">Order Placed Successfully!</h1>
        </div>

        <!-- Success Message -->
        <div class="text-center mb-12">
          <div class="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24" class="text-white">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </div>
          <p class="text-xl text-[#ccaa8e] mb-2">Thank you for your purchase</p>
          <p class="text-[#ccaa8e]">Your order has been confirmed and will be processed shortly.</p>
        </div>

        <!-- Order Details -->
        <div class="bg-[#2a2a2a] rounded-lg p-8 mb-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Order Info -->
            <div>
              <h3 class="text-xl font-semibold text-white mb-4">Order Information</h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-[#ccaa8e]">Order Number:</span>
                  <span class="text-white font-medium">#{{ orderId }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-[#ccaa8e]">Order Date:</span>
                  <span class="text-white">{{ formatDate(new Date()) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-[#ccaa8e]">Total Amount:</span>
                  <span class="text-[#f97306] font-bold">{{ formatCurrency(orderTotal) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-[#ccaa8e]">Status:</span>
                  <span class="text-green-500 font-medium">Confirmed</span>
                </div>
              </div>
            </div>

            <!-- Next Steps -->
            <div>
              <h3 class="text-xl font-semibold text-white mb-4">What's Next?</h3>
              <div class="space-y-4">
                <div class="flex items-start gap-3">
                  <div class="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span class="text-white text-xs font-bold">1</span>
                  </div>
                  <div>
                    <p class="text-white font-medium">Order Confirmation</p>
                    <p class="text-[#a0a0a0] text-sm">You'll receive an email confirmation shortly</p>
                  </div>
                </div>

                <div class="flex items-start gap-3">
                  <div class="w-6 h-6 bg-[#4a4a4a] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span class="text-[#a0a0a0] text-xs font-bold">2</span>
                  </div>
                  <div>
                    <p class="text-white font-medium">Processing</p>
                    <p class="text-[#a0a0a0] text-sm">We'll prepare your items for shipping</p>
                  </div>
                </div>

                <div class="flex items-start gap-3">
                  <div class="w-6 h-6 bg-[#4a4a4a] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span class="text-[#a0a0a0] text-xs font-bold">3</span>
                  </div>
                  <div>
                    <p class="text-white font-medium">Shipping</p>
                    <p class="text-[#a0a0a0] text-sm">Your order will be shipped and you'll get tracking info</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            :to="`/orders/${orderId}`"
            class="px-8 py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium text-center"
          >
            View Order Details
          </router-link>

          <router-link
            to="/"
            class="px-8 py-4 bg-[#4a4a4a] text-white rounded-lg hover:bg-[#6a6a6a] transition-colors font-medium text-center"
          >
            Continue Shopping
          </router-link>
        </div>

        <!-- Help Section -->
        <div class="mt-12 text-center">
          <p class="text-[#a0a0a0] mb-4">Need help with your order?</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="mailto:support@solemate.com" class="text-orange-500 hover:text-orange-400 transition-colors">
              support@solemate.com
            </a>
            <span class="text-[#6a6a6a] hidden sm:block">•</span>
            <a href="tel:+1234567890" class="text-orange-500 hover:text-orange-400 transition-colors">
              +1 (234) 567-8900
            </a>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useOrderSuccess } from '@/composables/checkout/OrderSuccess.js'

const route = useRoute()

// Use composable
const {
  user,
  orderId,
  orderTotal,
  formatDate,
  formatCurrency
} = useOrderSuccess(route)

onMounted(() => {
  // Load order details from API if needed
  })
</script>

<style scoped>
@import '@/styles/checkout/OrderSuccess.css';
</style>
