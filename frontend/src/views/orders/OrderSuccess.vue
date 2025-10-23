<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h1 class="mt-4 text-3xl font-bold text-gray-900">Order Placed Successfully!</h1>
        <p class="mt-2 text-gray-600">Thank you for your purchase. Your order has been confirmed.</p>
        
        <div class="mt-8">
          <router-link 
            to="/orders" 
            class="bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 mr-4"
          >
            View Orders
          </router-link>
          <router-link 
            to="/products" 
            class="border border-gray-300 text-gray-700 px-6 py-3 rounded-md font-medium hover:bg-gray-50"
          >
            Continue Shopping
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Order success page
</script>
