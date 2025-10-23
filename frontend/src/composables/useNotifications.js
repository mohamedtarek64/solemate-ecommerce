import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export function useNotifications() {
  // Check if Pinia is available before using store
  let authStore = null
  try {
    authStore = useAuthStore()
  } catch (error) {
    console.warn('Pinia store not available, using fallback for notifications')
    // Return a fallback object with basic functionality
    return {
      notifications: ref([]),
      unreadCount: ref(0),
      settings: ref({}),
      loading: ref(false),
      error: ref(null),
      hasUnreadNotifications: computed(() => false),
      unreadNotifications: computed(() => []),
      success: (message) => console.log('✅ Success:', message),
      error: (message) => console.error('❌ Error:', message),
      showSuccess: (message) => console.log('✅ Success:', message),
      showError: (message) => console.error('❌ Error:', message),
      showWarning: (message) => console.warn('⚠️ Warning:', message),
      showInfo: (message) => console.info('ℹ️ Info:', message),
      fetchNotifications: async () => ({ data: [] }),
      fetchUnreadCount: async () => 0,
      markAsRead: async () => true,
      markAllAsRead: async () => true,
      deleteNotification: async () => true,
      fetchSettings: async () => ({}),
      updateSettings: async () => ({}),
      subscribeToPush: async () => true,
      unsubscribeFromPush: async () => true,
      startAutoRefresh: () => {},
      stopAutoRefresh: () => {},
      initialize: async () => {}
    }
  }

  // Reactive state
  const notifications = ref([])
  const unreadCount = ref(0)
  const settings = ref({
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    order_updates: true,
    promotions: true,
    stock_alerts: true,
    payment_updates: true,
    shipping_updates: true
  })
  const loading = ref(false)
  const error = ref(null)

  // Computed properties
  const hasUnreadNotifications = computed(() => unreadCount.value > 0)
  const unreadNotifications = computed(() =>
    notifications.value.filter(notification => !notification.read_at)
  )

  // API methods
  const fetchNotifications = async (params = {}) => {
    try {
      loading.value = true
      error.value = null

      if (!authStore || !authStore.token) {
        throw new Error('Authentication required')
      }

      const queryParams = new URLSearchParams({
        page: params.page || 1,
        per_page: params.perPage || 20,
        ...(params.unreadOnly && { unread_only: true }),
        ...(params.type && { type: params.type })
      })

      const response = await fetch(`${API_BASE_URL}/notifications?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        notifications.value = result.data.data || []
        return result.data
      } else {
        throw new Error(result.message || 'Failed to fetch notifications')
      }
    } catch (err) {
      error.value = err.message
      console.error('Error fetching notifications:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchUnreadCount = async () => {
    try {
      if (!authStore || !authStore.token) {
        return 0
      }

      const response = await fetch(`${API_BASE_URL}/notifications/count`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        unreadCount.value = result.data.count || 0
        return result.data.count
      } else {
        throw new Error(result.message || 'Failed to fetch unread count')
      }
    } catch (err) {
      console.error('Error fetching unread count:', err)
      return 0
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        // Update local state
        const notification = notifications.value.find(n => n.id === notificationId)
        if (notification) {
          notification.read_at = new Date().toISOString()
        }
        await fetchUnreadCount()
        return true
      } else {
        throw new Error(result.message || 'Failed to mark notification as read')
      }
    } catch (err) {
      error.value = err.message
      console.error('Error marking notification as read:', err)
      throw err
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        // Update local state
        notifications.value.forEach(notification => {
          notification.read_at = new Date().toISOString()
        })
        unreadCount.value = 0
        return true
      } else {
        throw new Error(result.message || 'Failed to mark all notifications as read')
      }
    } catch (err) {
      error.value = err.message
      console.error('Error marking all notifications as read:', err)
      throw err
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        // Remove from local state
        notifications.value = notifications.value.filter(n => n.id !== notificationId)
        await fetchUnreadCount()
        return true
      } else {
        throw new Error(result.message || 'Failed to delete notification')
      }
    } catch (err) {
      error.value = err.message
      console.error('Error deleting notification:', err)
      throw err
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/settings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        settings.value = result.data
        return result.data
      } else {
        throw new Error(result.message || 'Failed to fetch settings')
      }
    } catch (err) {
      console.error('Error fetching notification settings:', err)
      return settings.value
    }
  }

  const updateSettings = async (newSettings) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSettings)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        settings.value = result.data
        return result.data
      } else {
        throw new Error(result.message || 'Failed to update settings')
      }
    } catch (err) {
      error.value = err.message
      console.error('Error updating notification settings:', err)
      throw err
    }
  }

  // Push notification methods
  const subscribeToPush = async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Push notifications not supported')
      }

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.VUE_APP_VAPID_PUBLIC_KEY
      })

      const response = await fetch(`${API_BASE_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
            auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth'))))
          }
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        return true
      } else {
        throw new Error(result.message || 'Failed to subscribe to push notifications')
      }
    } catch (err) {
      console.error('Error subscribing to push notifications:', err)
      throw err
    }
  }

  const unsubscribeFromPush = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/unsubscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        return true
      } else {
        throw new Error(result.message || 'Failed to unsubscribe from push notifications')
      }
    } catch (err) {
      console.error('Error unsubscribing from push notifications:', err)
      throw err
    }
  }

  // Auto-refresh functionality
  let refreshInterval = null

  const startAutoRefresh = (intervalMs = 30000) => {
    if (refreshInterval) {
      clearInterval(refreshInterval)
    }

    refreshInterval = setInterval(async () => {
      if (authStore && authStore.isAuthenticated) {
        await fetchUnreadCount()
      }
    }, intervalMs)
  }

  const stopAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval)
      refreshInterval = null
    }
  }

  // Initialize
  const initialize = async () => {
    if (authStore && authStore.isAuthenticated) {
      await Promise.all([
        fetchNotifications(),
        fetchUnreadCount(),
        fetchSettings()
      ])
      startAutoRefresh()
    }
  }

  // Cleanup
  onUnmounted(() => {
    stopAutoRefresh()
  })

  // Simple notification functions
  const success = (message) => {
    }

  const showError = (message) => {
    console.error('❌ Error:', message)
  }

  const showSuccess = (message) => {
    }

  const showWarning = (message) => {
    console.warn('⚠️ Warning:', message)
  }

  const showInfo = (message) => {
    console.info('ℹ️ Info:', message)
  }

  return {
    // State
    notifications,
    unreadCount,
    settings,
    loading,
    error,

    // Computed
    hasUnreadNotifications,
    unreadNotifications,

    // Simple notification functions
    success,
    error: showError,
    showError,
    showSuccess,
    showWarning,
    showInfo,

    // Methods
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchSettings,
    updateSettings,
    subscribeToPush,
    unsubscribeFromPush,
    startAutoRefresh,
    stopAutoRefresh,
    initialize
  }
}
