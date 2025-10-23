import { ref, reactive } from 'vue'

export function useAdminDashboard() {
  // Reactive state
  const dashboardData = ref({
    stats: {
      orders: { total_revenue: 0, total: 0 },
      users: { active: 0 },
      products: { total: 0 }
    }
  })

  const recentOrders = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Additional dashboard states expected by AdminDashboard.vue
  const salesOverview = reactive({
    total: 0,
    growth: 0,
    period: 'Weekly'
  })

  const performanceIndicators = reactive({
    conversionRate: 0,
    popularProduct: 'N/A',
    topTrafficSource: 'Direct'
  })

  const chartData = ref([])

  // Cache for sales overview by period
  const salesCache = reactive({ Daily: null, Weekly: null, Monthly: null })
  let debounceTimer = null

  // API Base URL
  const API_BASE_URL = 'http://127.0.0.1:8000/api'

  // Get API headers
  const getApiHeaders = () => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  const applySalesPayload = (payload, period) => {
    salesOverview.total = payload?.total || 0
    salesOverview.growth = payload?.growth || 0
    salesOverview.period = payload?.period || period
    chartData.value = Array.isArray(payload?.data) ? payload.data : []
  }

  const loadSalesOverview = async (period = salesOverview.period) => {
    // return from cache if available
    if (salesCache[period]) {
      applySalesPayload(salesCache[period], period)
      return
    }
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard/sales-overview?period=${encodeURIComponent(period)}`, {
        method: 'GET',
        headers: getApiHeaders()
      })
      if (!res.ok) throw new Error(`Sales overview failed: ${res.status}`)
      const json = await res.json()
      const payload = json?.data || { total: 0, growth: 0, period, data: [] }
      salesCache[period] = payload
      applySalesPayload(payload, period)
    } catch (e) {
      console.error('loadSalesOverview error:', e)
      chartData.value = []
    }
  }

  // Load dashboard data from API
  const loadDashboardData = async () => {
    isLoading.value = true
    error.value = null

    try {
      // Fetch dashboard stats
      const statsResponse = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        method: 'GET',
        headers: getApiHeaders()
      })

      if (!statsResponse.ok) {
        throw new Error(`Stats API failed: ${statsResponse.status}`)
      }

      const statsData = await statsResponse.json()
      dashboardData.value = statsData.data || { stats: { orders: { total_revenue: 0, total: 0 }, users: { active: 0 }, products: { total: 0 } } }

      // Also load sales overview for the current period to drive the chart
      await loadSalesOverview(salesOverview.period)

    } catch (err) {
      console.error('Error loading dashboard data:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  // Load recent orders
  const loadRecentOrders = async () => {
    try {
      const ordersResponse = await fetch(`${API_BASE_URL}/dashboard/recent-orders`, {
        method: 'GET',
        headers: getApiHeaders()
      })

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        recentOrders.value = ordersData.data || []
      }
    } catch (err) {
      console.error('Error loading recent orders:', err)
    }
  }

  // Debounced change sales period and refresh
  const changeSalesPeriod = async (period) => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      loadSalesOverview(period)
    }, 200)
  }

  // Stop auto refresh (no-op placeholder)
  const stopAutoRefresh = () => {}

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  // Format date
  const formatDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Get status class for orders
  const getStatusClass = (status) => {
    const classes = {
      'completed': 'px-2 py-1 rounded-full text-xs bg-green-900/30 text-green-400',
      'pending': 'px-2 py-1 rounded-full text-xs bg-yellow-900/30 text-yellow-400',
      'shipped': 'px-2 py-1 rounded-full text-xs bg-blue-900/30 text-blue-400',
      'cancelled': 'px-2 py-1 rounded-full text-xs bg-red-900/30 text-red-400',
      'processing': 'px-2 py-1 rounded-full text-xs bg-purple-900/30 text-purple-400',
      'delivered': 'px-2 py-1 rounded-full text-xs bg-green-900/30 text-green-400'
    }
    return classes[status] || classes['pending']
  }

  return {
    // State
    dashboardData,
    recentOrders,
    salesOverview,
    performanceIndicators,
    chartData,
    isLoading,
    error,

    // Methods
    loadDashboardData,
    loadRecentOrders,
    changeSalesPeriod,
    stopAutoRefresh,
    formatCurrency,
    formatDate,
    getStatusClass
  }
}
