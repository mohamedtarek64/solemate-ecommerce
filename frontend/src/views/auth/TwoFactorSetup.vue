<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Two-Factor Authentication
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Set up two-factor authentication for enhanced security
        </p>
      </div>

      <!-- QR Code Setup -->
      <div v-if="!twoFactorEnabled && !showRecoveryCodes" class="space-y-6">
        <div class="text-center">
          <div v-if="qrCodeUrl" class="mx-auto w-48 h-48 bg-white p-4 rounded-lg shadow">
            <img :src="qrCodeUrl" alt="QR Code" class="w-full h-full" />
          </div>
          <p class="mt-4 text-sm text-gray-600">
            Scan this QR code with your authenticator app
          </p>
        </div>

        <form @submit.prevent="verifyTwoFactor">
          <div>
            <label for="code" class="block text-sm font-medium text-gray-700">
              Enter verification code
            </label>
            <input
              id="code"
              v-model="verificationCode"
              name="code"
              type="text"
              maxlength="6"
              required
              class="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="000000"
            />
          </div>

          <div class="mt-4">
            <button
              type="submit"
              :disabled="loading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {{ loading ? 'Verifying...' : 'Enable Two-Factor Authentication' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Recovery Codes -->
      <div v-if="showRecoveryCodes" class="space-y-6">
        <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-yellow-800">
                Save your recovery codes
              </h3>
              <div class="mt-2 text-sm text-yellow-700">
                <p>Store these recovery codes in a safe place. You can use them to access your account if you lose your authenticator device.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 p-4 rounded-md">
          <h4 class="text-sm font-medium text-gray-900 mb-2">Recovery Codes:</h4>
          <div class="grid grid-cols-2 gap-2 text-sm font-mono">
            <div v-for="code in recoveryCodes" :key="code" class="p-2 bg-white rounded border">
              {{ code }}
            </div>
          </div>
        </div>

        <div class="flex space-x-3">
          <button
            @click="downloadRecoveryCodes"
            class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Download Codes
          </button>
          <button
            @click="completeSetup"
            class="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Complete Setup
          </button>
        </div>
      </div>

      <!-- Two-Factor Enabled -->
      <div v-if="twoFactorEnabled" class="space-y-6">
        <div class="bg-green-50 border border-green-200 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">
                Two-Factor Authentication Enabled
              </h3>
              <div class="mt-2 text-sm text-green-700">
                <p>Your account is now protected with two-factor authentication.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex space-x-3">
          <button
            @click="viewRecoveryCodes"
            class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            View Recovery Codes
          </button>
          <button
            @click="disableTwoFactor"
            class="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Disable 2FA
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTwoFactorSetup } from '@/composables/auth/TwoFactorSetup.js';

// Use the separated script
const {
  loading,
  twoFactorEnabled,
  showRecoveryCodes,
  qrCodeUrl,
  recoveryCodes,
  verificationCode,
  verifyTwoFactor,
  completeSetup,
  viewRecoveryCodes,
  downloadRecoveryCodes,
  disableTwoFactor
} = useTwoFactorSetup();
</script>

<style scoped>
@import '@/styles/auth/TwoFactorSetup.css';
</style>
