// Analytics JavaScript Logic
import { ref, computed, onMounted, nextTick } from 'vue'
import { useAdminDashboard } from '@/composables/useAdminDashboard'
import Chart from 'chart.js/auto'

export function useAnalyticsState() {
  // Analytics data
  const analyticsData = ref({
    sales: {},
    users: {},
    products: {}
  })
  const topProducts = ref([])
  const categoryPerformance = ref([])
  const chartData = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const selectedPeriod = ref('Weekly')

  // Chart references
  const salesChart = ref(null)
  const revenueChart = ref(null)
  const ordersChart = ref(null)
  const usersChart = ref(null)

  // Chart instances
  let salesChartInstance = null
  let revenueChartInstance = null
  let ordersChartInstance = null
  let usersChartInstance = null

  return {
    analyticsData,
    topProducts,
    categoryPerformance,
    chartData,
    isLoading,
    error,
    selectedPeriod,
    salesChart,
    revenueChart,
    ordersChart,
    usersChart,
    salesChartInstance,
    revenueChartInstance,
    ordersChartInstance,
    usersChartInstance
  }
}

export function useAnalyticsComputed(analyticsData) {
  const conversionRate = computed(() => {
    const totalUsers = analyticsData.value.users?.total_users || 0
    const totalOrders = analyticsData.value.sales?.total_orders || 0
    return calculateConversionRate(totalUsers, totalOrders)
  })

  return {
    conversionRate
  }
}

export function useAnalyticsAPI(isLoading, error) {
  const loadAnalyticsData = async (selectedPeriod, token) => {
    try {
      isLoading.value = true
      error.value = null

      // For now, use fallback data since analytics API endpoints don't exist
      // This prevents 500 errors and provides a working demo
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      return {
        analyticsData: getFallbackData(selectedPeriod),
        topProducts: getFallbackTopProducts(),
        categoryPerformance: getFallbackCategoryPerformance(),
        chartData: getFallbackChartData(selectedPeriod)
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    loadAnalyticsData
  }
}

export function useAnalyticsActions() {
  const changePeriod = async (period, selectedPeriod, loadAnalyticsData, isLoading) => {
    selectedPeriod.value = period
    // Show loading state
    isLoading.value = true

    try {
      await loadAnalyticsData()
    } catch (error) {
      console.error('Error loading data for period:', period, error)
    } finally {
      isLoading.value = false
    }
  }

  const createCharts = async (salesChart, revenueChart, ordersChart, usersChart, chartData, categoryPerformance, Chart, salesChartInstance, revenueChartInstance, ordersChartInstance, usersChartInstance) => {
    // Destroy existing charts
    destroyCharts(salesChartInstance, revenueChartInstance, ordersChartInstance, usersChartInstance)

    // Create new charts using imported functions
    salesChartInstance = createSalesChart(salesChart.value, chartData.value, Chart)
    revenueChartInstance = createRevenueChart(revenueChart.value, categoryPerformance.value, Chart)
    ordersChartInstance = createOrdersChart(ordersChart.value, chartData.value, Chart)
    usersChartInstance = createUsersChart(usersChart.value, chartData.value, Chart)
  }

  const destroyCharts = (salesChartInstance, revenueChartInstance, ordersChartInstance, usersChartInstance) => {
    destroyChart(salesChartInstance)
    destroyChart(revenueChartInstance)
    destroyChart(ordersChartInstance)
    destroyChart(usersChartInstance)

    salesChartInstance = null
    revenueChartInstance = null
    ordersChartInstance = null
    usersChartInstance = null
  }

  return {
    changePeriod,
    createCharts,
    destroyCharts
  }
}

// Fallback data functions
export function getFallbackData(period) {
  return {
    sales: getSampleSalesData(period),
    users: getSampleUserData(period),
    products: {
      total_products: 25,
      active_products: 20,
      low_stock_products: 3
    }
  }
}

export function getFallbackChartData(period) {
  return generateSampleChartData(period)
}

export function getFallbackTopProducts() {
  return [
    { id: 1, name: 'Classic White Sneakers', orders_count: 45, total_revenue: 2250 },
    { id: 2, name: 'Black Running Shoes', orders_count: 38, total_revenue: 1900 },
    { id: 3, name: 'Blue Casual Shoes', orders_count: 32, total_revenue: 1600 },
    { id: 4, name: 'Red Sports Shoes', orders_count: 28, total_revenue: 1400 },
    { id: 5, name: 'Brown Leather Shoes', orders_count: 22, total_revenue: 1100 }
  ]
}

export function getFallbackCategoryPerformance() {
  return [
    { category: 'Sneakers', orders_count: 120, total_revenue: 6000 },
    { category: 'Running', orders_count: 85, total_revenue: 4250 },
    { category: 'Casual', orders_count: 65, total_revenue: 3250 },
    { category: 'Sports', orders_count: 45, total_revenue: 2250 },
    { category: 'Formal', orders_count: 30, total_revenue: 1500 }
  ]
}

export function calculateConversionRate(totalUsers, totalOrders) {
  if (totalUsers === 0) return 0
  return Math.round((totalOrders / totalUsers) * 100)
}

// Sample data generation functions
export function getSampleSalesData(period) {
  const baseData = {
    total_sales: 0,
    total_orders: 0,
    completed_orders: 0,
    pending_orders: 0,
    average_order_value: 0
  }

  // Add some randomness to make data more realistic
  const randomFactor = () => Math.random() * 0.3 + 0.85 // 85% to 115%

  switch (period.toLowerCase()) {
    case 'daily':
      return {
        ...baseData,
        total_sales: Math.round(1250 * randomFactor()),
        total_orders: Math.round(15 * randomFactor()),
        completed_orders: Math.round(12 * randomFactor()),
        pending_orders: Math.round(3 * randomFactor()),
        average_order_value: Math.round((83.33 * randomFactor()) * 100) / 100
      }
    case 'weekly':
      return {
        ...baseData,
        total_sales: Math.round(8750 * randomFactor()),
        total_orders: Math.round(105 * randomFactor()),
        completed_orders: Math.round(95 * randomFactor()),
        pending_orders: Math.round(10 * randomFactor()),
        average_order_value: Math.round((83.33 * randomFactor()) * 100) / 100
      }
    case 'monthly':
      return {
        ...baseData,
        total_sales: Math.round(37500 * randomFactor()),
        total_orders: Math.round(450 * randomFactor()),
        completed_orders: Math.round(420 * randomFactor()),
        pending_orders: Math.round(30 * randomFactor()),
        average_order_value: Math.round((83.33 * randomFactor()) * 100) / 100
      }
    default:
      return baseData
  }
}

export function getSampleUserData(period) {
  const baseData = {
    total_users: 0,
    new_users: 0,
    active_users: 0
  }

  // Add some randomness to make data more realistic
  const randomFactor = () => Math.random() * 0.3 + 0.85 // 85% to 115%

  switch (period.toLowerCase()) {
    case 'daily':
      return {
        ...baseData,
        total_users: Math.round(1250 * randomFactor()),
        new_users: Math.round(8 * randomFactor()),
        active_users: Math.round(45 * randomFactor())
      }
    case 'weekly':
      return {
        ...baseData,
        total_users: Math.round(1250 * randomFactor()),
        new_users: Math.round(35 * randomFactor()),
        active_users: Math.round(180 * randomFactor())
      }
    case 'monthly':
      return {
        ...baseData,
        total_users: Math.round(1250 * randomFactor()),
        new_users: Math.round(150 * randomFactor()),
        active_users: Math.round(650 * randomFactor())
      }
    default:
      return baseData
  }
}

export function generateSampleChartData(period) {
  const now = new Date()
  const data = []

  switch (period.toLowerCase()) {
    case 'daily':
      // Generate hourly data for today with realistic business hours pattern
      for (let i = 0; i < 24; i++) {
        const hour = new Date(now)
        hour.setHours(i, 0, 0, 0)

        // Business hours have higher activity (9 AM to 9 PM)
        let baseSales = 50
        let baseOrders = 2
        if (i >= 9 && i <= 21) {
          baseSales = 150
          baseOrders = 8
        }

        data.push({
          date: hour.toISOString(),
          sales: Math.floor(Math.random() * 200) + baseSales,
          orders: Math.floor(Math.random() * 10) + baseOrders
        })
      }
      break
    case 'weekly':
      // Generate daily data for the past week with weekend pattern
      for (let i = 6; i >= 0; i--) {
        const day = new Date(now)
        day.setDate(day.getDate() - i)

        // Weekends have different activity
        const isWeekend = day.getDay() === 0 || day.getDay() === 6
        const baseSales = isWeekend ? 300 : 500
        const baseOrders = isWeekend ? 5 : 10

        data.push({
          date: day.toISOString(),
          sales: Math.floor(Math.random() * 1500) + baseSales,
          orders: Math.floor(Math.random() * 20) + baseOrders
        })
      }
      break
    case 'monthly':
      // Generate daily data for the past month
      for (let i = 29; i >= 0; i--) {
        const day = new Date(now)
        day.setDate(day.getDate() - i)

        // Add some monthly trends
        const trendFactor = 1 + (Math.sin(i / 7) * 0.3) // Weekly cycle
        const baseSales = Math.floor(800 * trendFactor)
        const baseOrders = Math.floor(15 * trendFactor)

        data.push({
          date: day.toISOString(),
          sales: Math.floor(Math.random() * 2000) + baseSales,
          orders: Math.floor(Math.random() * 25) + baseOrders
        })
      }
      break
  }

  return data
}

// Chart creation functions
export function createSalesChart(canvas, chartData, Chart) {
  if (!canvas) return null

  const labels = chartData.map(item => {
    const date = new Date(item.date)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })

  const salesData = chartData.map(item => item.sales)

  return new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Sales',
        data: salesData,
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#9CA3AF'
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#9CA3AF'
          },
          grid: {
            color: '#374151'
          }
        },
        y: {
          ticks: {
            color: '#9CA3AF'
          },
          grid: {
            color: '#374151'
          }
        }
      }
    }
  })
}

export function createRevenueChart(canvas, categoryPerformance, Chart) {
  if (!canvas) return null

  const labels = categoryPerformance.map(item => item.category)
  const data = categoryPerformance.map(item => item.total_revenue)

  return new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: [
          '#f97316',
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#9CA3AF'
          }
        }
      }
    }
  })
}

export function createOrdersChart(canvas, chartData, Chart) {
  if (!canvas) return null

  const labels = chartData.map(item => {
    const date = new Date(item.date)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })

  const ordersData = chartData.map(item => item.orders)

  return new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Orders',
        data: ordersData,
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#9CA3AF'
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#9CA3AF'
          },
          grid: {
            color: '#374151'
          }
        },
        y: {
          ticks: {
            color: '#9CA3AF'
          },
          grid: {
            color: '#374151'
          }
        }
      }
    }
  })
}

export function createUsersChart(canvas, chartData, Chart) {
  if (!canvas) return null

  const labels = chartData.map(item => {
    const date = new Date(item.date)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })

  // Generate user growth data
  const usersData = chartData.map((_, index) => Math.floor(Math.random() * 20) + 10 + (index * 2))

  return new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'New Users',
        data: usersData,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#9CA3AF'
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#9CA3AF'
          },
          grid: {
            color: '#374151'
          }
        },
        y: {
          ticks: {
            color: '#9CA3AF'
          },
          grid: {
            color: '#374151'
          }
        }
      }
    }
  })
}

export function destroyChart(chartInstance) {
  if (chartInstance) {
    chartInstance.destroy()
  }
}

export function initializeAnalytics() {
  return {
    onMounted: async (loadAnalyticsData, selectedPeriod, token) => {
      await loadAnalyticsData(selectedPeriod.value, token)
    }
  }
}
