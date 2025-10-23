import { ref, computed } from 'vue'
import ApiService from '@/services/apiService'
import LoggerService from '@/services/loggerService'

// UserDashboard Composable
export function useUserDashboard(router, authStore, notifications) {
  const { showError } = notifications

  // State
  const dashboardData = ref(null)
  const loading = ref(false)

  // Computed
  const user = computed(() => authStore.user)

  const stats = computed(() => {
    if (!dashboardData.value?.stats) return []

    const { stats: data } = dashboardData.value

    return [
      {
        title: 'Total Orders',
        value: data.orders?.total || 0,
        color: 'bg-blue-500',
        icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
      },
      {
        title: 'Wishlist Items',
        value: data.wishlist?.total || 0,
        color: 'bg-red-500',
        icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
      },
      {
        title: 'Reviews Written',
        value: data.reviews?.total || 0,
        color: 'bg-yellow-500',
        icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
      },
      {
        title: 'Total Spent',
        value: `$${data.spending?.total || 0}`,
        color: 'bg-green-500',
        icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
      }
    ]
  })

  const recentOrders = computed(() => dashboardData.value?.recent_orders || [])
  const wishlistItems = computed(() => dashboardData.value?.wishlist_items || [])
  const recommendedProducts = computed(() => dashboardData.value?.recommended_products || [])
  const totalSpent = computed(() => dashboardData.value?.stats?.spending?.total || 0)

  // Methods
  const loadDashboardData = async () => {
    loading.value = true
    try {
      LoggerService.userAction('Loading dashboard data')

      const data = await ApiService.get('/user/dashboard')
      dashboardData.value = data.data

      LoggerService.userAction('Dashboard data loaded successfully')
    } catch (err) {
      LoggerService.error('Error loading dashboard', err, 'UserDashboard.loadDashboardData')
      showError('Failed to load dashboard data')
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      LoggerService.auth('User logout initiated')
      await authStore.logout()
      router.push('/login')
      LoggerService.auth('User logout completed')
    } catch (err) {
      LoggerService.error('Logout error', err, 'UserDashboard.logout')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return {
    dashboardData,
    loading,
    user,
    stats,
    recentOrders,
    wishlistItems,
    recommendedProducts,
    totalSpent,
    loadDashboardData,
    logout,
    getStatusColor
  }
}

// Initialize function
export function initializeUserDashboard() {
  // This function can be used for any initialization logic
  // Currently the composable handles its own initialization
  }