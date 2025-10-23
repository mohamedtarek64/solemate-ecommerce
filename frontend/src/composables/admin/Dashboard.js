// Admin Dashboard JavaScript Logic
import { useAdminDashboard } from '@/composables/useAdminDashboard.js'

export function useDashboardState() {
  // Use the admin dashboard composable
  const {
    dashboardData,
    recentOrders,
    isLoading,
    error
  } = useAdminDashboard()

  return {
    dashboardData,
    recentOrders,
    isLoading,
    error
  }
}

export function useDashboardUtils() {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusClass = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      processing: 'status-processing',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled'
    }
    return statusClasses[status] || 'status-pending'
  }

  return {
    formatCurrency,
    formatDate,
    getStatusClass
  }
}

export function initializeDashboard() {
  return {
    onMounted: () => {
      // Dashboard initialization logic if needed
      }
  }
}
