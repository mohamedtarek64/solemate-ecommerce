/**
 * Admin Dashboard Optimization
 * Optimizes admin operations with virtual scrolling and data prefetching
 */

import { ref, computed, onMounted } from 'vue'
import advancedCache from '@/utils/advancedCache'
import performanceMonitor from '@/utils/performanceMonitorEnhanced'

export function useAdminOptimization() {
  const dashboardData = ref({
    stats: null,
    recentOrders: [],
    topProducts: [],
    customers: []
  })

  const isLoading = ref(true)
  const loadingStates = ref({
    stats: true,
    orders: true,
    products: true,
    customers: true
  })

  /**
   * Load dashboard stats (priority)
   */
  const loadStats = async (fetchFn) => {
    const cacheKey = 'admin_stats'
    const measurement = performanceMonitor.startMeasure('admin-stats', 'api-call')

    try {
      // Try cache first (2 minutes TTL)
      const cached = advancedCache.get(cacheKey)
      if (cached) {
        dashboardData.value.stats = cached
        loadingStates.value.stats = false
        performanceMonitor.endMeasure(measurement)
        return cached
      }

      const data = await fetchFn()
      dashboardData.value.stats = data
      loadingStates.value.stats = false

      // Cache for 2 minutes
      advancedCache.set(cacheKey, data, 2 * 60 * 1000)

      performanceMonitor.endMeasure(measurement)
      return data
    } catch (err) {
      loadingStates.value.stats = false
      throw err
    }
  }

  /**
   * Load recent orders with pagination
   */
  const loadRecentOrders = async (fetchFn, page = 1, limit = 20) => {
    const cacheKey = `admin_orders_${page}_${limit}`
    const measurement = performanceMonitor.startMeasure('admin-orders', 'api-call')

    try {
      // Try cache first (1 minute TTL)
      const cached = advancedCache.get(cacheKey)
      if (cached) {
        dashboardData.value.recentOrders = cached
        loadingStates.value.orders = false
        performanceMonitor.endMeasure(measurement)
        return cached
      }

      const data = await fetchFn(page, limit)
      dashboardData.value.recentOrders = data
      loadingStates.value.orders = false

      // Cache for 1 minute
      advancedCache.set(cacheKey, data, 60 * 1000)

      performanceMonitor.endMeasure(measurement)
      return data
    } catch (err) {
      loadingStates.value.orders = false
      throw err
    }
  }

  /**
   * Load top products
   */
  const loadTopProducts = async (fetchFn) => {
    const cacheKey = 'admin_top_products'
    const measurement = performanceMonitor.startMeasure('admin-products', 'api-call')

    try {
      // Try cache first (5 minutes TTL)
      const cached = advancedCache.get(cacheKey)
      if (cached) {
        dashboardData.value.topProducts = cached
        loadingStates.value.products = false
        performanceMonitor.endMeasure(measurement)
        return cached
      }

      const data = await fetchFn()
      dashboardData.value.topProducts = data
      loadingStates.value.products = false

      // Cache for 5 minutes
      advancedCache.set(cacheKey, data, 5 * 60 * 1000)

      performanceMonitor.endMeasure(measurement)
      return data
    } catch (err) {
      loadingStates.value.products = false
      throw err
    }
  }

  /**
   * Load customers with pagination
   */
  const loadCustomers = async (fetchFn, page = 1, limit = 50) => {
    const cacheKey = `admin_customers_${page}_${limit}`
    const measurement = performanceMonitor.startMeasure('admin-customers', 'api-call')

    try {
      // Try cache first (3 minutes TTL)
      const cached = advancedCache.get(cacheKey)
      if (cached) {
        dashboardData.value.customers = cached
        loadingStates.value.customers = false
        performanceMonitor.endMeasure(measurement)
        return cached
      }

      const data = await fetchFn(page, limit)
      dashboardData.value.customers = data
      loadingStates.value.customers = false

      // Cache for 3 minutes
      advancedCache.set(cacheKey, data, 3 * 60 * 1000)

      performanceMonitor.endMeasure(measurement)
      return data
    } catch (err) {
      loadingStates.value.customers = false
      throw err
    }
  }

  /**
   * Optimistic order status update
   */
  const updateOrderStatus = async (orderId, newStatus, updateFn) => {
    const measurement = performanceMonitor.startMeasure('admin-update-order', 'interaction')

    // Find order
    const order = dashboardData.value.recentOrders.find(o => o.id === orderId)
    if (!order) return

    // Save previous state
    const previousStatus = order.status

    // Optimistic update
    order.status = newStatus

    try {
      await updateFn(orderId, newStatus)

      // Invalidate cache
      advancedCache.invalidatePattern('admin_orders_')

      performanceMonitor.endMeasure(measurement)
      return { success: true }
    } catch (err) {
      // Rollback on error
      order.status = previousStatus
      performanceMonitor.endMeasure(measurement)
      throw err
    }
  }

  /**
   * Batch update orders
   */
  const batchUpdateOrders = async (updates, updateFn) => {
    const measurement = performanceMonitor.startMeasure('admin-batch-update', 'interaction')

    const previousStates = new Map()

    try {
      // Apply optimistic updates
      updates.forEach(({ orderId, status }) => {
        const order = dashboardData.value.recentOrders.find(o => o.id === orderId)
        if (order) {
          previousStates.set(orderId, order.status)
          order.status = status
        }
      })

      // Batch API calls
      await Promise.allSettled(
        updates.map(({ orderId, status }) => updateFn(orderId, status))
      )

      // Invalidate cache
      advancedCache.invalidatePattern('admin_orders_')

      performanceMonitor.endMeasure(measurement)
      return { success: true }
    } catch (err) {
      // Rollback on error
      previousStates.forEach((prevStatus, orderId) => {
        const order = dashboardData.value.recentOrders.find(o => o.id === orderId)
        if (order) order.status = prevStatus
      })

      performanceMonitor.endMeasure(measurement)
      throw err
    }
  }

  /**
   * Export data optimization
   */
  const exportData = async (type, exportFn) => {
    const measurement = performanceMonitor.startMeasure(`admin-export-${type}`, 'interaction')

    try {
      // Show progress indicator
      const notification = {
        type: 'info',
        message: 'Preparing export...'
      }

      const data = await exportFn()

      performanceMonitor.endMeasure(measurement)
      return data
    } catch (err) {
      performanceMonitor.endMeasure(measurement)
      throw err
    }
  }

  /**
   * Real-time data refresh
   */
  const refreshData = async (fetchFunctions) => {
    const measurement = performanceMonitor.startMeasure('admin-refresh', 'interaction')

    try {
      // Clear cache
      advancedCache.invalidatePattern('admin_')

      // Reload all data in parallel
      await Promise.all([
        loadStats(fetchFunctions.stats),
        loadRecentOrders(fetchFunctions.orders),
        loadTopProducts(fetchFunctions.products)
      ])

      performanceMonitor.endMeasure(measurement)
      return { success: true }
    } catch (err) {
      performanceMonitor.endMeasure(measurement)
      throw err
    }
  }

  /**
   * Setup auto-refresh
   */
  const setupAutoRefresh = (fetchFunctions, interval = 60000) => {
    const refreshInterval = setInterval(() => {
      // Only refresh stats (lightweight)
      loadStats(fetchFunctions.stats)
    }, interval)

    return () => clearInterval(refreshInterval)
  }

  /**
   * Prefetch data for tabs
   */
  const prefetchTabData = (tab, fetchFn) => {
    setTimeout(async () => {
      const cacheKey = `admin_tab_${tab}`
      const cached = advancedCache.get(cacheKey)

      if (!cached) {
        const data = await fetchFn()
        advancedCache.set(cacheKey, data, 5 * 60 * 1000)
      }
    }, 500)
  }

  // Computed
  const isFullyLoaded = computed(() => {
    return !Object.values(loadingStates.value).some(state => state === true)
  })

  const totalOrders = computed(() => {
    return dashboardData.value.stats?.totalOrders || 0
  })

  const totalRevenue = computed(() => {
    return dashboardData.value.stats?.totalRevenue || 0
  })

  const totalCustomers = computed(() => {
    return dashboardData.value.stats?.totalCustomers || 0
  })

  // Lifecycle
  onMounted(() => {
    performanceMonitor.measurePageLoad('AdminDashboard')
  })

  return {
    dashboardData,
    isLoading,
    loadingStates,
    isFullyLoaded,
    totalOrders,
    totalRevenue,
    totalCustomers,
    loadStats,
    loadRecentOrders,
    loadTopProducts,
    loadCustomers,
    updateOrderStatus,
    batchUpdateOrders,
    exportData,
    refreshData,
    setupAutoRefresh,
    prefetchTabData
  }
}

