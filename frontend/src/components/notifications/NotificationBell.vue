<template>
  <div class="notification-bell relative">
    <button
      @click="toggleDropdown"
      class="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
      :class="{ 'text-blue-600': hasUnreadNotifications }"
    >
      <!-- Bell Icon -->
      <svg
        class="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        ></path>
      </svg>

      <!-- Unread Badge -->
      <span
        v-if="hasUnreadNotifications"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Dropdown -->
    <div
      v-if="isDropdownOpen"
      class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
    >
      <!-- Header -->
      <div class="px-4 py-3 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">
            Notifications
          </h3>
          <div class="flex items-center space-x-2">
            <button
              @click="markAllAsRead"
              v-if="hasUnreadNotifications"
              class="text-sm text-blue-600 hover:text-blue-800"
            >
              Mark All Read
            </button>
            <button
              @click="toggleDropdown"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="p-4 text-center">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        <p class="text-sm text-gray-500 mt-2">Loading...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-4 text-center">
        <div class="text-red-500 text-sm">{{ error }}</div>
        <button
          @click="fetchNotifications"
          class="mt-2 text-blue-600 hover:text-blue-800 text-sm"
        >
          Retry
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="notifications.length === 0" class="p-4 text-center">
        <div class="text-gray-400 mb-2">
          <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
          </svg>
        </div>
        <p class="text-gray-500 text-sm">No new notifications</p>
      </div>

      <!-- Notifications List -->
      <div v-else class="max-h-96 overflow-y-auto">
        <div
          v-for="notification in notifications.slice(0, 5)"
          :key="notification.id"
          @click="handleNotificationClick(notification)"
          class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
          :class="{ 'bg-blue-50': !notification.read_at }"
        >
          <div class="flex items-start space-x-3">
            <!-- Icon -->
            <div class="flex-shrink-0">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center"
                :class="getNotificationIconClass(notification.type)"
              >
                <component :is="getNotificationIcon(notification.type)" class="w-4 h-4" />
              </div>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">
                {{ notification.title }}
              </p>
              <p class="text-sm text-gray-600 mt-1 line-clamp-2">
                {{ notification.message }}
              </p>
              <p class="text-xs text-gray-400 mt-1">
                {{ formatTime(notification.created_at) }}
              </p>
            </div>

            <!-- Unread indicator -->
            <div v-if="!notification.read_at" class="flex-shrink-0">
              <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div v-if="notifications.length > 0" class="px-4 py-3 border-t border-gray-200">
        <router-link
          to="/notifications"
          class="block text-center text-sm text-blue-600 hover:text-blue-800"
        >
          View All Notifications
        </router-link>
      </div>
    </div>

    <!-- Backdrop -->
    <div
      v-if="isDropdownOpen"
      @click="toggleDropdown"
      class="fixed inset-0 z-40"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNotifications } from '@/composables/useNotifications'

// Composables
const {
  notifications,
  unreadCount,
  loading,
  error,
  hasUnreadNotifications,
  fetchNotifications,
  markAsRead,
  markAllAsRead
} = useNotifications()

// Local state
const isDropdownOpen = ref(false)

// Methods
const toggleDropdown = async () => {
  isDropdownOpen.value = !isDropdownOpen.value

  if (isDropdownOpen.value && notifications.value.length === 0) {
    await fetchNotifications()
  }
}

const handleNotificationClick = async (notification) => {
  if (!notification.read_at) {
    await markAsRead(notification.id)
  }

  // Handle navigation based on notification type
  // This would depend on your routing structure
  }

const getNotificationIcon = (type) => {
  const icons = {
    order: 'OrderIcon',
    promotion: 'PromotionIcon',
    stock: 'StockIcon',
    admin: 'AdminIcon',
    payment: 'PaymentIcon',
    shipping: 'ShippingIcon'
  }
  return icons[type] || 'DefaultIcon'
}

const getNotificationIconClass = (type) => {
  const classes = {
    order: 'bg-blue-100 text-blue-600',
    promotion: 'bg-green-100 text-green-600',
    stock: 'bg-yellow-100 text-yellow-600',
    admin: 'bg-purple-100 text-purple-600',
    payment: 'bg-indigo-100 text-indigo-600',
    shipping: 'bg-orange-100 text-orange-600'
  }
  return classes[type] || 'bg-gray-100 text-gray-600'
}

const formatTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now - date) / (1000 * 60))

  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`

  return date.toLocaleDateString('en-US')
}

// Initialize
onMounted(async () => {
  await fetchNotifications()
})

// Cleanup
onUnmounted(() => {
  // Any cleanup if needed
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
