import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRoles } from './useRoles'
import { useNotifications } from './useNotifications'

export function useDashboard() {
  const authStore = useAuthStore()
  const { isAdmin, isVendor, isUser, getDefaultRedirect } = useRoles()
  const { error: showError, success: showSuccess } = useNotifications()
  
  // State
  const dashboardData = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  // Computed
  const user = computed(() => authStore.user)
  const currentRole = computed(() => {
    if (isAdmin.value) return 'admin'
    if (isVendor.value) return 'vendor'
    if (isUser.value) return 'user'
    return 'guest'
  })
  
  // Dashboard type based on role
  const dashboardType = computed(() => {
    if (isAdmin.value) return 'admin'
    if (isVendor.value) return 'vendor'
    if (isUser.value) return 'user'
    return 'public'
  })
  
  // API endpoints based on role
  const getApiEndpoint = () => {
    switch (currentRole.value) {
      case 'admin':
        return '/api/admin/dashboard'
      case 'vendor':
        return '/api/vendor/dashboard'
      case 'user':
        return '/api/user/dashboard'
      default:
        return '/api/dashboard'
    }
  }
  
  // Load dashboard data
  const loadDashboardData = async () => {
    if (!authStore.isAuthenticated) {
      error.value = 'User not authenticated'
      return
    }
    
    loading.value = true
    error.value = null
    
    try {
      const endpoint = getApiEndpoint()
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to load dashboard data')
      }
      
      const data = await response.json()
      dashboardData.value = data.data
      
      showSuccess('Dashboard data loaded successfully')
    } catch (err) {
      console.error('Error loading dashboard:', err)
      error.value = err.message
      showError(err.message || 'Failed to load dashboard data')
    } finally {
      loading.value = false
    }
  }
  
  // Refresh dashboard data
  const refreshDashboard = async () => {
    await loadDashboardData()
  }
  
  // Get dashboard statistics
  const getStats = () => {
    if (!dashboardData.value?.stats) return []
    
    const { stats } = dashboardData.value
    
    switch (currentRole.value) {
      case 'admin':
        return [
          {
            title: 'Total Users',
            value: stats.users?.total || 0,
            change: 12,
            color: 'bg-blue-500',
            icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
          },
          {
            title: 'Total Products',
            value: stats.products?.total || 0,
            change: 8,
            color: 'bg-green-500',
            icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
          },
          {
            title: 'Total Orders',
            value: stats.orders?.total || 0,
            change: 15,
            color: 'bg-yellow-500',
            icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
          },
          {
            title: 'Total Revenue',
            value: `$${stats.orders?.total_revenue || 0}`,
            change: 22,
            color: 'bg-purple-500',
            icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
          }
        ]
      
      case 'vendor':
        return [
          {
            title: 'My Products',
            value: stats.products?.total || 0,
            change: 5,
            color: 'bg-blue-500',
            icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
          },
          {
            title: 'Orders',
            value: stats.orders?.total || 0,
            change: 12,
            color: 'bg-green-500',
            icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
          },
          {
            title: 'Revenue',
            value: `$${stats.revenue?.total || 0}`,
            change: 18,
            color: 'bg-yellow-500',
            icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
          },
          {
            title: 'Reviews',
            value: stats.reviews?.total || 0,
            change: 8,
            color: 'bg-purple-500',
            icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
          }
        ]
      
      case 'user':
        return [
          {
            title: 'Total Orders',
            value: stats.orders?.total || 0,
            color: 'bg-blue-500',
            icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
          },
          {
            title: 'Wishlist Items',
            value: stats.wishlist?.total || 0,
            color: 'bg-red-500',
            icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
          },
          {
            title: 'Reviews Written',
            value: stats.reviews?.total || 0,
            color: 'bg-yellow-500',
            icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
          },
          {
            title: 'Total Spent',
            value: `$${stats.spending?.total || 0}`,
            color: 'bg-green-500',
            icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
          }
        ]
      
      default:
        return []
    }
  }
  
  // Get recent activities
  const getRecentActivities = () => {
    return dashboardData.value?.recent_activities || []
  }
  
  // Get recent orders
  const getRecentOrders = () => {
    return dashboardData.value?.recent_orders || []
  }
  
  // Get wishlist items (for users)
  const getWishlistItems = () => {
    return dashboardData.value?.wishlist_items || []
  }
  
  // Get recommended products (for users)
  const getRecommendedProducts = () => {
    return dashboardData.value?.recommended_products || []
  }
  
  // Get top products (for admin/vendor)
  const getTopProducts = () => {
    return dashboardData.value?.top_products || []
  }
  
  // Get sales data (for admin/vendor)
  const getSalesData = () => {
    return dashboardData.value?.sales_data || []
  }
  
  // Clear dashboard data
  const clearDashboard = () => {
    dashboardData.value = null
    error.value = null
  }
  
  // Check if dashboard is loaded
  const isDashboardLoaded = computed(() => {
    return dashboardData.value !== null && !loading.value
  })
  
  return {
    // State
    dashboardData,
    loading,
    error,
    
    // Computed
    user,
    currentRole,
    dashboardType,
    isDashboardLoaded,
    
    // Methods
    loadDashboardData,
    refreshDashboard,
    clearDashboard,
    
    // Data getters
    getStats,
    getRecentActivities,
    getRecentOrders,
    getWishlistItems,
    getRecommendedProducts,
    getTopProducts,
    getSalesData
  }
}
