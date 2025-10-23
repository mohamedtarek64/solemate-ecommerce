<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8 text-center">
      <div v-if="loading" class="space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
        <h2 class="text-xl font-semibold text-gray-900">Processing OAuth Login...</h2>
        <p class="text-gray-600">Please wait while we complete your authentication.</p>
      </div>

      <div v-else-if="error" class="space-y-4">
        <div class="text-red-600">
          <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-900">Authentication Failed</h2>
        <p class="text-gray-600">{{ error }}</p>
        <div class="space-y-2">
          <button
            @click="retryAuth"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            Try Again
          </button>
          <router-link
            to="/login"
            class="block w-full text-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            Back to Login
          </router-link>
        </div>
      </div>

      <div v-else class="space-y-4">
        <div class="text-green-600">
          <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-900">Login Successful!</h2>
        <p class="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useOAuth2Callback } from '@/composables/auth/OAuth2Callback.js';

// Use the separated script
const {
  loading,
  error,
  retryAuth
} = useOAuth2Callback();
</script>

<style scoped>
@import '@/styles/auth/OAuth2Callback.css';
</style>
