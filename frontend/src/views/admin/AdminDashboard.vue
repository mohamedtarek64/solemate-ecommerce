<!-- Updated: Fixed sidebar visibility - v6.0 -->
<template>
  <div class="admin-dashboard">
    <div class="relative flex size-full min-h-screen flex-col bg-[#1C1C1C] dark group/design-root overflow-x-hidden">
      <div class="flex flex-col lg:flex-row h-full grow">
        <!-- Sidebar -->
        <AdminSidebar />

        <!-- Main Content -->
        <main class="flex-1 p-6 md:p-8">
          <!-- Header -->
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <p class="text-white text-3xl font-bold">Dashboard</p>
              <p class="text-gray-400">Overview of your e-commerce performance</p>
            </div>
            <div class="flex gap-2">
              <button
                @click="loadDashboardData"
                :disabled="isLoading"
                class="flex items-center justify-center rounded-md h-10 px-4 bg-[#2C2C2C] text-white text-sm font-medium hover:bg-[#3A3A3A] gap-2 disabled:opacity-50"
              >
                <i class="fas fa-sync-alt" :class="{ 'animate-spin': isLoading }"></i>
                <span class="truncate">{{ isLoading ? 'Loading...' : 'Refresh' }}</span>
              </button>
              <router-link to="/admin/orders" class="flex items-center justify-center rounded-md h-10 px-4 bg-[#2C2C2C] text-white text-sm font-medium hover:bg-[#3A3A3A] gap-2">
                <i class="fas fa-eye"></i>
                <span class="truncate">View Orders</span>
              </router-link>
              <router-link to="/admin/customers" class="flex items-center justify-center rounded-md h-10 px-4 bg-[#2C2C2C] text-white text-sm font-medium hover:bg-[#3A3A3A] gap-2">
                <i class="fas fa-user-plus"></i>
                <span class="truncate">Manage Customers</span>
              </router-link>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div v-for="i in 4" :key="i" class="flex flex-col gap-2 rounded-md p-6 bg-[#232323]">
              <div class="h-4 bg-gray-700 rounded animate-pulse"></div>
              <div class="h-8 bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="mb-8 p-4 bg-red-900/20 border border-red-500/50 text-red-300 rounded-md">
            <div class="flex items-center gap-2">
              <i class="fas fa-exclamation-triangle text-4xl mb-2"></i>
              <span>{{ error }}</span>
            </div>
          </div>

          <!-- Stats Cards -->
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="flex flex-col gap-2 rounded-md p-6 bg-[#232323]">
              <p class="text-gray-300 text-base font-medium">Total Revenue</p>
              <p class="text-white text-3xl font-bold">{{ formatCurrency(dashboardData.stats?.orders?.total_revenue || 0) }}</p>
            </div>
            <div class="flex flex-col gap-2 rounded-md p-6 bg-[#232323]">
              <p class="text-gray-300 text-base font-medium">Total Orders</p>
              <p class="text-white text-3xl font-bold">{{ dashboardData.stats?.orders?.total || 0 }}</p>
            </div>
            <div class="flex flex-col gap-2 rounded-md p-6 bg-[#232323]">
              <p class="text-gray-300 text-base font-medium">Active Customers</p>
              <p class="text-white text-3xl font-bold">{{ dashboardData.stats?.users?.active || 0 }}</p>
            </div>
            <div class="flex flex-col gap-2 rounded-md p-6 bg-[#232323]">
              <p class="text-gray-300 text-base font-medium">Total Products</p>
              <p class="text-white text-3xl font-bold">{{ dashboardData.stats?.products?.total || 0 }}</p>
            </div>
          </div>

          <!-- Sales Overview Chart -->
          <div class="bg-[#232323] p-6 rounded-md mb-8">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <h2 class="text-white text-xl font-bold">Sales Overview</h2>
                <div class="flex items-center gap-2 mt-1">
                  <p class="text-white text-3xl font-bold">{{ formatCurrency(salesOverview.total) }}</p>
                  <p class="text-green-500 text-base font-medium flex items-center">
                    <i class="fas fa-arrow-up text-lg"></i>{{ salesOverview.growth }}%
                  </p>
                  <p class="text-gray-400">{{ salesOverview.period }}</p>
                </div>
              </div>
              <div class="flex items-center rounded-md bg-[#2C2C2C] p-1">
                <label class="cursor-pointer px-3 py-1 rounded-md text-sm font-medium has-[:checked]:bg-[#f97306] has-[:checked]:text-white text-gray-300">
                  Daily<input class="sr-only" name="sales-period" type="radio" value="Daily" v-model="salesOverview.period" @change="changeSalesPeriod('Daily')"/>
                </label>
                <label class="cursor-pointer px-3 py-1 rounded-md text-sm font-medium has-[:checked]:bg-[#f97306] has-[:checked]:text-white text-gray-300">
                  Weekly<input class="sr-only" name="sales-period" type="radio" value="Weekly" v-model="salesOverview.period" @change="changeSalesPeriod('Weekly')"/>
                </label>
                <label class="cursor-pointer px-3 py-1 rounded-md text-sm font-medium has-[:checked]:bg-[#f97306] has-[:checked]:text-white text-gray-300">
                  Monthly<input class="sr-only" name="sales-period" type="radio" value="Monthly" v-model="salesOverview.period" @change="changeSalesPeriod('Monthly')"/>
                </label>
              </div>
            </div>
            <div class="h-80 relative">
              <div v-if="chartData.length === 0" class="flex items-center justify-center h-full text-gray-400">
                <div class="text-center">
                  <div class="text-4xl mb-2">📊</div>
                  <p>No sales data available</p>
                </div>
              </div>
              <svg v-else @mousemove="onChartMove" @mouseleave="onChartLeave" fill="none" height="100%" preserveAspectRatio="none" viewBox="0 0 472 150" width="100%" xmlns="http://www.w3.org/2000/svg" class="sales-chart">
                <!-- Subtle grid lines -->
                <g stroke="#ffffff22" stroke-width="1">
                  <line x1="0" y1="30" x2="472" y2="30"></line>
                  <line x1="0" y1="60" x2="472" y2="60"></line>
                  <line x1="0" y1="90" x2="472" y2="90"></line>
                  <line x1="0" y1="120" x2="472" y2="120"></line>
                </g>
                <!-- Dynamic chart path based on real data -->
                <path :d="generateChartPath()" fill="url(#sales-gradient)"></path>
                <path :d="generateChartPath()" stroke="#f97306" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"></path>
                <!-- Data point markers -->
                <g>
                  <circle
                    v-for="(pt, i) in chartPoints"
                    :key="i"
                    :cx="pt.x"
                    :cy="pt.y"
                    r="3.5"
                    fill="#f97306"
                    stroke="#fff"
                    stroke-width="1"
                  />
                </g>
                <defs>
                  <linearGradient gradientUnits="userSpaceOnUse" id="sales-gradient" x1="236" x2="236" y1="1" y2="149">
                    <stop stop-color="#f97306" stop-opacity="0.2"></stop>
                    <stop offset="1" stop-color="#f97306" stop-opacity="0"></stop>
                  </linearGradient>
                </defs>
              </svg>
              <!-- Tooltip -->
              <div v-if="hoverIndex !== null" class="pointer-events-none absolute -translate-x-1/2 -translate-y-3 bg-black/70 text-white text-xs px-2 py-1 rounded" :style="{ left: hoverX + 'px', top: hoverY + 'px' }">
                {{ formatCurrency(chartData[hoverIndex] || 0) }}
              </div>
            </div>
          </div>

          <!-- Bottom Section -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Recent Orders Table -->
            <div class="lg:col-span-2 bg-[#232323] p-6 rounded-md">
              <h2 class="text-white text-xl font-bold mb-4">Recent Orders</h2>

              <!-- Loading State -->
              <div v-if="isLoading" class="space-y-3">
                <div v-for="i in 5" :key="i" class="flex items-center space-x-4 p-4">
                  <div class="h-4 bg-gray-700 rounded w-16 animate-pulse"></div>
                  <div class="h-4 bg-gray-700 rounded w-32 animate-pulse"></div>
                  <div class="h-4 bg-gray-700 rounded w-20 animate-pulse"></div>
                  <div class="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
                  <div class="h-4 bg-gray-700 rounded w-20 animate-pulse ml-auto"></div>
                </div>
              </div>

              <!-- Empty State -->
              <div v-else-if="recentOrders.length === 0" class="text-center py-8 text-gray-400">
                <i class="fas fa-receipt text-4xl mb-2"></i>
                <p>No recent orders found</p>
              </div>

              <!-- Table -->
              <div v-else class="overflow-x-auto">
                <table class="w-full text-left">
                  <thead>
                    <tr class="border-b border-gray-700">
                      <th class="py-3 px-4 text-sm font-medium text-gray-300">Order ID</th>
                      <th class="py-3 px-4 text-sm font-medium text-gray-300">Customer</th>
                      <th class="py-3 px-4 text-sm font-medium text-gray-300 hidden md:table-cell">Date</th>
                      <th class="py-3 px-4 text-sm font-medium text-gray-300">Status</th>
                      <th class="py-3 px-4 text-sm font-medium text-gray-300 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="order in recentOrders" :key="order.id" class="border-b border-gray-800 hover:bg-[#2C2C2C]">
                      <td class="py-3 px-4 text-sm text-white">#{{ order.id }}</td>
                      <td class="py-3 px-4 text-sm text-gray-400">{{ order.customer_name || 'N/A' }}</td>
                      <td class="py-3 px-4 text-sm text-gray-400 hidden md:table-cell">{{ formatDate(order.created_at) }}</td>
                      <td class="py-3 px-4 text-sm">
                        <span :class="getStatusClass(order.status)">{{ order.status || 'pending' }}</span>
                      </td>
                      <td class="py-3 px-4 text-sm text-white text-right">{{ formatCurrency(order.total_amount || order.total || 0) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Performance Indicators -->
            <div class="bg-[#232323] p-6 rounded-md">
              <h2 class="text-white text-xl font-bold mb-4">Performance Indicators</h2>
              <div class="space-y-4">
                <div class="flex flex-col gap-1 rounded-md p-4 bg-[#2C2C2C]">
                  <p class="text-gray-300 text-sm font-medium">Conversion Rate</p>
                  <p class="text-white text-2xl font-bold">{{ performanceIndicators.conversionRate }}%</p>
                </div>
                <div class="flex flex-col gap-1 rounded-md p-4 bg-[#2C2C2C]">
                  <p class="text-gray-300 text-sm font-medium">Popular Product</p>
                  <p class="text-white text-xl font-bold truncate">{{ performanceIndicators.popularProduct }}</p>
                </div>
                <div class="flex flex-col gap-1 rounded-md p-4 bg-[#2C2C2C]">
                  <p class="text-gray-300 text-sm font-medium">Top Traffic Source</p>
                  <p class="text-white text-xl font-bold">{{ performanceIndicators.topTrafficSource }}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useAdminDashboard } from '@/composables/useAdminDashboard.js'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
// ✅ Enhanced Admin Optimization
import { useAdminOptimization } from '@/composables/useAdminOptimization'
import VirtualScroll from '@/components/common/VirtualScroll.vue'
import OptimizedImage from '@/components/common/OptimizedImage.vue'
import advancedCache from '@/utils/advancedCache'
import performanceMonitorEnhanced from '@/utils/performanceMonitorEnhanced'

// Use the admin dashboard composable
const {
  dashboardData,
  recentOrders,
  salesOverview,
  performanceIndicators,
  isLoading,
  error,
  chartData,
  loadDashboardData,
  changeSalesPeriod,
  formatCurrency,
  formatDate,
  getStatusClass,
  stopAutoRefresh,
  loadRecentOrders
} = useAdminDashboard()

// ✅ Enhanced Admin Optimization
const adminOptimization = useAdminOptimization()

// Load data on component mount
onMounted(async () => {
  // ✅ Start performance monitoring
  const measurement = performanceMonitorEnhanced.startMeasure('admin-dashboard-load', 'page-load')
  
  try {
    // ✅ Priority Loading: Stats first, then orders
    await loadDashboardData()
    
    // ✅ Load orders in parallel (non-blocking)
    loadRecentOrders()
    
    // ✅ Setup lazy loading for images
    requestAnimationFrame(() => {
      const images = document.querySelectorAll('img')
      images.forEach((img, index) => {
        if (index > 3) img.loading = 'lazy'
      })
    })
    
    } finally {
    performanceMonitorEnhanced.endMeasure(measurement)
  }
})

// Cleanup on component unmount
onUnmounted(() => {
  stopAutoRefresh()
})

// Generate chart path from data
const generateChartPath = () => {
  if (!chartData.value || chartData.value.length === 0) {
    return 'M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25'
  }

  const data = chartData.value
  const maxValue = Math.max(...data, 1)
  const width = 472
  const height = 150
  const stepX = width / (data.length - 1)

  let path = `M0 ${height - (data[0] / maxValue) * height}`

  for (let i = 1; i < data.length; i++) {
    const x = i * stepX
    const y = height - (data[i] / maxValue) * height
    path += ` L${x} ${y}`
  }

  // Close the path for fill
  const fillPath = path + ` L${width} ${height} L0 ${height} Z`

  return fillPath
}

// Compute data point coordinates for markers
const chartPoints = computed(() => {
  const points = []
  if (!chartData.value || chartData.value.length === 0) return points
  const data = chartData.value
  const maxValue = Math.max(...data, 1)
  const width = 472
  const height = 150
  const stepX = width / (data.length - 1)
  for (let i = 0; i < data.length; i++) {
    const x = i * stepX
    const y = height - (data[i] / maxValue) * height
    points.push({ x, y })
  }
  return points
})

// Tooltip state
const hoverIndex = ref(null)
const hoverX = ref(0)
const hoverY = ref(0)
const onChartMove = (e) => {
  if (!chartPoints.value.length) return
  const bounds = e.currentTarget.getBoundingClientRect()
  const x = e.clientX - bounds.left
  hoverX.value = x
  // find nearest point by x
  let nearest = 0
  let minDist = Infinity
  for (let i = 0; i < chartPoints.value.length; i++) {
    const d = Math.abs(chartPoints.value[i].x - x)
    if (d < minDist) { minDist = d; nearest = i }
  }
  hoverIndex.value = nearest
  hoverY.value = chartPoints.value[nearest].y
}
const onChartLeave = () => { hoverIndex.value = null }
</script>

<style scoped>
@import '@/styles/admin/AdminDashboard.css';
.sales-chart path { transition: d 250ms ease, fill-opacity 200ms ease; }
</style>
