<template>
  <div class="min-h-screen bg-gray-900 flex items-center justify-center">
    <div class="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-8 text-center">
      <!-- Loading State -->
      <div v-if="isLoading" class="space-y-6">
        <div class="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <span class="material-symbols-outlined text-white text-3xl">login</span>
        </div>
        <div>
          <h2 class="text-2xl font-bold text-white mb-2">Processing Login</h2>
          <p class="text-gray-400">Please wait while we complete your authentication...</p>
        </div>
        <div class="flex justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </div>

      <!-- Success State -->
      <div v-else-if="isSuccess" class="space-y-6">
        <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
          <span class="material-symbols-outlined text-white text-3xl">check</span>
        </div>
        <div>
          <h2 class="text-2xl font-bold text-white mb-2">Welcome to SoleMate!</h2>
          <p class="text-gray-400">You have been successfully logged in.</p>
        </div>
        <div class="flex flex-col gap-3">
          <button
            @click="redirectToDashboard"
            class="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            Continue to Dashboard
          </button>
          <button
            @click="redirectToHome"
            class="w-full border border-gray-600 text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="isError" class="space-y-6">
        <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
          <span class="material-symbols-outlined text-white text-3xl">error</span>
        </div>
        <div>
          <h2 class="text-2xl font-bold text-white mb-2">Authentication Failed</h2>
          <p class="text-gray-400">{{ errorMessage }}</p>
        </div>
        <div class="flex flex-col gap-3">
          <button
            @click="retryLogin"
            class="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            Try Again
          </button>
          <button
            @click="redirectToLogin"
            class="w-full border border-gray-600 text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotifications } from '@/composables/useNotifications'
import { useCallback } from '@/composables/auth/Callback.js'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { success, error } = useNotifications()

// Use composable
const {
  isLoading,
  isSuccess,
  isError,
  errorMessage,
  handleCallback,
  redirectToDashboard,
  redirectToHome,
  redirectToLogin,
  retryLogin,
  checkForErrors
} = useCallback(router, route, authStore, { success, error })

// Initialize
onMounted(() => {
  // Check for errors first
  if (!checkForErrors()) {
    handleCallback()
  }
})
</script>

<style scoped>
@import '@/styles/auth/Callback.css';
</style>
