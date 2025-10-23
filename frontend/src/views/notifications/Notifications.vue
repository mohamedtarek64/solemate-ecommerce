<template>
  <div class="notifications-page">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Notifications</h1>
              <p class="text-sm text-gray-600 mt-1">Manage your notification preferences</p>
            </div>
            <div class="flex items-center space-x-3">
              <button
                @click="markAllAsRead"
                v-if="hasUnreadNotifications"
                class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Mark All Read
              </button>

              <router-link
                to="/notifications/settings"
                class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Settings
              </router-link>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="px-6 py-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-blue-50 rounded-lg p-4">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-blue-600">Total Notifications</p>
                  <p class="text-2xl font-bold text-blue-900">{{ notifications.length }}</p>
                </div>
              </div>
            </div>

            <div class="bg-yellow-50 rounded-lg p-4">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-yellow-600">Unread</p>
                  <p class="text-2xl font-bold text-yellow-900">{{ unreadCount }}</p>
                </div>
              </div>
            </div>

            <div class="bg-green-50 rounded-lg p-4">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-green-600">Read</p>
                  <p class="text-2xl font-bold text-green-900">{{ notifications.length - unreadCount }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Filters</h3>
        </div>
        <div class="px-6 py-4">
          <div class="flex flex-wrap items-center gap-4">
            <select
              v-model="selectedType"
              @change="handleFilterChange"
              class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="order">Order Updates</option>
              <option value="promotion">Promotions</option>
              <option value="stock">Stock Alerts</option>
              <option value="payment">Payment Updates</option>
              <option value="shipping">Shipping Updates</option>
              <option value="admin">Admin Notifications</option>
            </select>

            <select
              v-model="selectedStatus"
              @change="handleFilterChange"
              class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>

            <button
              @click="clearFilters"
              class="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <!-- Loading State -->
        <div v-if="loading" class="p-8 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p class="text-sm text-gray-500 mt-2">Loading notifications...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="p-8 text-center">
          <div class="text-red-500 text-sm">{{ error }}</div>
          <button
            @click="fetchNotifications"
            class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="notifications.length === 0" class="p-8 text-center">
          <div class="text-gray-400 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
          <p class="text-gray-500">You don't have any notifications yet</p>
        </div>

        <!-- Notifications List -->
        <div v-else class="divide-y divide-gray-200">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            @click="handleNotificationClick(notification)"
            class="px-6 py-4 hover:bg-gray-50 cursor-pointer"
            :class="{ 'bg-blue-50': !notification.read_at }"
          >
            <div class="flex items-start space-x-3">
              <!-- Icon -->
              <div class="flex-shrink-0">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center"
                  :class="getNotificationIconClass(notification.type)"
                >
                  <component :is="getNotificationIcon(notification.type)" class="w-5 h-5" />
                </div>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium text-gray-900">
                    {{ notification.title }}
                  </p>
                  <div class="flex items-center space-x-2">
                    <span class="text-xs text-gray-400">
                      {{ formatTime(notification.created_at) }}
                    </span>
                    <button
                      @click.stop="deleteNotification(notification.id)"
                      class="text-gray-400 hover:text-red-500"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <p class="text-sm text-gray-600 mt-1">
                  {{ notification.message }}
                </p>
                <div v-if="!notification.read_at" class="flex items-center mt-2">
                  <div class="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span class="text-xs text-blue-600 font-medium">Unread</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Load More -->
        <div v-if="hasMorePages" class="px-6 py-4 border-t border-gray-200 text-center">
          <button
            @click="loadMore"
            :disabled="loading"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {{ loading ? 'Loading...' : 'Load More' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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
  markAllAsRead,
  deleteNotification: deleteNotificationAPI
} = useNotifications()

// Local state
const selectedType = ref('')
const selectedStatus = ref('')
const currentPage = ref(1)
const hasMorePages = ref(false)

// Methods
const handleFilterChange = async () => {
  currentPage.value = 1
  await fetchNotifications({
    type: selectedType.value || undefined,
    unreadOnly: selectedStatus.value === 'unread',
    page: 1
  })
}

const clearFilters = () => {
  selectedType.value = ''
  selectedStatus.value = ''
  handleFilterChange()
}

const handleNotificationClick = async (notification) => {
  if (!notification.read_at) {
    await markAsRead(notification.id)
  }
  // Handle navigation based on notification type
  }

const deleteNotification = async (notificationId) => {
  if (confirm('Are you sure you want to delete this notification?')) {
    await deleteNotificationAPI(notificationId)
  }
}

const loadMore = async () => {
  currentPage.value++
  await fetchNotifications({
    type: selectedType.value || undefined,
    unreadOnly: selectedStatus.value === 'unread',
    page: currentPage.value
  })
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
</script>

<style scoped>
/* Additional styles if needed */
</style>
