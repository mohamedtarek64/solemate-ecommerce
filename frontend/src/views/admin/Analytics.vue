<template>
  <div class="admin-analytics">
    <div class="relative flex size-full min-h-screen flex-col bg-[#1C1C1C] dark group/design-root overflow-x-hidden">
      <div class="flex flex-col lg:flex-row h-full grow">
        <!-- Sidebar -->
        <AdminSidebar />

        <!-- Main Content -->
        <main class="main-content">
          <!-- Header -->
          <div class="page-header">
            <div>
              <p class="page-title">Analytics & Reports</p>
              <p class="page-subtitle">Comprehensive insights into your business performance</p>
            </div>
            <div class="header-actions">
              <button
                @click="loadAnalyticsData"
                :disabled="isLoading"
                class="action-btn refresh-btn"
              >
                <span class="material-symbols-outlined" :class="{ 'spinning': isLoading }">refresh</span>
                <span class="truncate">{{ isLoading ? 'Loading...' : 'Refresh' }}</span>
              </button>
              <button class="action-btn export-btn">
                <span class="material-symbols-outlined">download</span>
                <span class="truncate">Export Report</span>
              </button>
            </div>
          </div>

          <!-- Time Period Selector -->
          <div class="time-period-selector">
            <div class="time-period-header">
              <h3 class="time-period-title">Time Period</h3>
              <div class="period-buttons">
                <label class="period-btn"
                       :class="selectedPeriod === 'Daily' ? 'active' : ''">
                  Daily
                  <input class="sr-only" name="analytics-period" type="radio" value="Daily"
                         :checked="selectedPeriod === 'Daily'"
                         @change="changePeriod('Daily')"/>
                </label>
                <label class="period-btn"
                       :class="selectedPeriod === 'Weekly' ? 'active' : ''">
                  Weekly
                  <input class="sr-only" name="analytics-period" type="radio" value="Weekly"
                         :checked="selectedPeriod === 'Weekly'"
                         @change="changePeriod('Weekly')"/>
                </label>
                <label class="period-btn"
                       :class="selectedPeriod === 'Monthly' ? 'active' : ''">
                  Monthly
                  <input class="sr-only" name="analytics-period" type="radio" value="Monthly"
                         :checked="selectedPeriod === 'Monthly'"
                         @change="changePeriod('Monthly')"/>
                </label>
              </div>
            </div>
          </div>

          <!-- Analytics Overview Cards -->
          <div class="analytics-cards">
            <div class="analytics-card">
              <p class="card-label">Total Revenue</p>
              <p class="card-value">{{ formatCurrency(analyticsData.sales?.total_sales || 0) }}</p>
              <p class="card-subtitle">{{ selectedPeriod }} period</p>
            </div>
            <div class="analytics-card">
              <p class="card-label">Total Orders</p>
              <p class="card-value">{{ analyticsData.sales?.total_orders || 0 }}</p>
              <p class="card-subtitle">{{ selectedPeriod }} period</p>
            </div>
            <div class="analytics-card">
              <p class="card-label">Active Users</p>
              <p class="card-value">{{ analyticsData.users?.active_users || 0 }}</p>
              <p class="card-subtitle">Current total</p>
            </div>
            <div class="analytics-card">
              <p class="card-label">Conversion Rate</p>
              <p class="card-value">{{ conversionRate }}%</p>
              <p class="card-subtitle">Calculated from real data</p>
            </div>
          </div>

          <!-- Charts Section -->
          <div class="charts-section">
            <!-- Sales Chart -->
            <div class="chart-container">
              <h3 class="chart-title">Sales Trend - {{ selectedPeriod }}</h3>
              <div class="h-64">
                <canvas ref="salesChart" class="chart-canvas"></canvas>
              </div>
            </div>

            <!-- Revenue Chart -->
            <div class="chart-container">
              <h3 class="chart-title">Revenue Distribution</h3>
              <div class="h-64">
                <canvas ref="revenueChart" class="chart-canvas"></canvas>
              </div>
            </div>
          </div>

          <!-- Additional Charts -->
          <div class="charts-section">
            <!-- Orders Chart -->
            <div class="chart-container">
              <h3 class="chart-title">Orders Over Time - {{ selectedPeriod }}</h3>
              <div class="h-64">
                <canvas ref="ordersChart" class="chart-canvas"></canvas>
              </div>
            </div>

            <!-- User Growth Chart -->
            <div class="chart-container">
              <h3 class="chart-title">User Growth - {{ selectedPeriod }}</h3>
              <div class="h-64">
                <canvas ref="usersChart" class="chart-canvas"></canvas>
              </div>
            </div>
          </div>

          <!-- Top Products Section -->
          <div class="data-section mb-8">
            <h3 class="section-title">Top Products</h3>
            <div v-if="topProducts.length === 0" class="empty-state">
              <span class="material-symbols-outlined empty-icon">inventory_2</span>
              <p>No product data available</p>
            </div>
            <div v-else class="data-list">
              <div v-for="(product, index) in topProducts" :key="product.id" class="data-item">
                <div class="data-item-content">
                  <div class="data-item-rank">
                    {{ index + 1 }}
                  </div>
                  <div class="data-item-info">
                    <p class="data-item-name">{{ product.name }}</p>
                    <p class="data-item-subtitle">{{ product.orders_count }} orders</p>
                  </div>
                </div>
                <p class="data-item-value">{{ formatCurrency(product.total_revenue) }}</p>
              </div>
            </div>
          </div>

          <div class="data-sections">
            <!-- Category Performance -->
            <div class="data-section">
              <h3 class="section-title">Category Performance</h3>
              <div v-if="categoryPerformance.length === 0" class="empty-state">
                <span class="material-symbols-outlined empty-icon">category</span>
                <p>No category data available</p>
              </div>
              <div v-else class="data-list">
                <div v-for="category in categoryPerformance" :key="category.category" class="data-item">
                  <div class="data-item-info">
                    <p class="data-item-name">{{ category.category }}</p>
                    <p class="data-item-subtitle">{{ category.orders_count }} orders</p>
                  </div>
                  <p class="data-item-value">{{ formatCurrency(category.total_revenue) }}</p>
                </div>
              </div>
            </div>

            <!-- User Analytics -->
            <div class="data-section">
              <h3 class="section-title">User Analytics</h3>
              <div class="user-analytics">
                <div class="user-stat">
                  <span class="user-stat-label">Total Users</span>
                  <span class="user-stat-value">{{ analyticsData.users?.total_users || 0 }}</span>
                </div>
                <div class="user-stat">
                  <span class="user-stat-label">New Users</span>
                  <span class="user-stat-value">{{ analyticsData.users?.new_users || 0 }}</span>
                </div>
                <div class="user-stat">
                  <span class="user-stat-label">Active Users</span>
                  <span class="user-stat-value">{{ analyticsData.users?.active_users || 0 }}</span>
                </div>
              </div>
            </div>

            <!-- Revenue Analytics -->
            <div class="data-section">
              <h3 class="section-title">Revenue Analytics</h3>
              <div class="user-analytics">
                <div class="user-stat">
                  <span class="user-stat-label">Total Revenue</span>
                  <span class="user-stat-value">{{ formatCurrency(analyticsData.sales?.total_sales || 0) }}</span>
                </div>
                <div class="user-stat">
                  <span class="user-stat-label">Completed Orders</span>
                  <span class="user-stat-value">{{ analyticsData.sales?.completed_orders || 0 }}</span>
                </div>
                <div class="user-stat">
                  <span class="user-stat-label">Pending Orders</span>
                  <span class="user-stat-value">{{ analyticsData.sales?.pending_orders || 0 }}</span>
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
import { ref, computed, onMounted, nextTick } from 'vue'
import { useAdminDashboard } from '@/composables/useAdminDashboard'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import Chart from 'chart.js/auto'
import {
  useAnalyticsState,
  useAnalyticsComputed,
  useAnalyticsAPI,
  useAnalyticsActions,
  getFallbackData,
  getFallbackChartData,
  getFallbackTopProducts,
  getFallbackCategoryPerformance,
  calculateConversionRate,
  createSalesChart,
  createRevenueChart,
  createOrdersChart,
  createUsersChart,
  destroyChart,
  initializeAnalytics
} from '@/composables/admin/Analytics.js'

// Use the admin dashboard composable for shared functions
const { formatCurrency, formatDate } = useAdminDashboard()

// State
const {
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
} = useAnalyticsState()

// Computed
const { conversionRate } = useAnalyticsComputed(analyticsData)

// API
const { loadAnalyticsData: loadAnalyticsDataFromAPI } = useAnalyticsAPI(isLoading, error)

// Actions
const { changePeriod: changePeriodAction, createCharts, destroyCharts } = useAnalyticsActions()

// Methods
const loadAnalyticsData = async () => {
  try {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token')

    if (!token) {
      throw new Error('No authentication token found')
    }

    // Load analytics data using the imported function
    const result = await loadAnalyticsDataFromAPI(selectedPeriod.value, token)

    analyticsData.value = result.analyticsData
    topProducts.value = result.topProducts
    categoryPerformance.value = result.categoryPerformance
    chartData.value = result.chartData

    // Always create charts, even with empty data
    await nextTick()
    createCharts(salesChart, revenueChart, ordersChart, usersChart, chartData, categoryPerformance, Chart, salesChartInstance, revenueChartInstance, ordersChartInstance, usersChartInstance)

  } catch (err) {
    console.error('Error fetching analytics data:', err)
    error.value = err.message

    // Use fallback data if API fails
    analyticsData.value = getFallbackData(selectedPeriod.value)
    topProducts.value = getFallbackTopProducts()
    categoryPerformance.value = getFallbackCategoryPerformance()
    chartData.value = getFallbackChartData(selectedPeriod.value)

    await nextTick()
    createCharts(salesChart, revenueChart, ordersChart, usersChart, chartData, categoryPerformance, Chart, salesChartInstance, revenueChartInstance, ordersChartInstance, usersChartInstance)
  }
}

const changePeriod = async (period) => {
  await changePeriodAction(period, selectedPeriod, loadAnalyticsData, isLoading)
}

// Initialize
onMounted(async () => {
  await loadAnalyticsData()
})
</script>

<style scoped>
@import '@/styles/admin/Analytics.css';
</style>
