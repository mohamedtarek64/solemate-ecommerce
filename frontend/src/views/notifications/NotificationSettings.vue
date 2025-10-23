<template>
  <div class="notification-settings-page">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Notification Settings</h1>
              <p class="text-sm text-gray-600 mt-1">Customize your notification preferences</p>
            </div>
            <router-link
              to="/notifications"
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Notifications
            </router-link>
          </div>
        </div>
      </div>

      <!-- Settings Component -->
      <NotificationSettings />
    </div>
  </div>
</template>

<script setup>
import NotificationSettings from '@/components/notifications/NotificationSettings.vue'
</script>

<style scoped>
/* Additional styles if needed */
</style>
