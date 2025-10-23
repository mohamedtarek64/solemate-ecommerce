<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div class="text-9xl font-bold text-gray-300 mb-4">404</div>
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
      <p class="text-xl text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
      <router-link 
        to="/" 
        class="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
      >
        Go Home
      </router-link>
    </div>
  </div>
</template>

<script setup>
// No additional logic needed for 404 page
</script>
