<template>
  <div class="admin-dashboard">
    <div class="relative flex size-full min-h-screen flex-col bg-[#1C1C1C] dark group/design-root overflow-x-hidden">
      <div class="flex flex-col lg:flex-row h-full grow">
        <!-- Sidebar -->
        <aside class="flex flex-col w-full lg:w-64 bg-[#232323] p-6 shrink-0">
          <div class="flex flex-col gap-y-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-[#f97306] rounded-full"></div>
              <h1 class="text-white text-xl font-bold leading-normal">SoleMate</h1>
            </div>
            <nav class="flex flex-col gap-2">
              <router-link to="/admin/dashboard" class="flex items-center gap-3 px-4 py-2 rounded-md bg-[#f97306]">
                <span class="material-symbols-outlined text-white">dashboard</span>
                <p class="text-white text-sm font-medium leading-normal">Dashboard</p>
              </router-link>
              <router-link to="/admin/invoices" class="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-[#3A3A3A] text-gray-300">
                <span class="material-symbols-outlined">receipt_long</span>
                <p class="text-sm font-medium leading-normal">Invoices</p>
              </router-link>
              <router-link to="/admin/products" class="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-[#3A3A3A] text-gray-300">
                <span class="material-symbols-outlined">inventory_2</span>
                <p class="text-sm font-medium leading-normal">Products</p>
              </router-link>
              <router-link to="/admin/orders" class="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-[#3A3A3A] text-gray-300">
                <span class="material-symbols-outlined">receipt_long</span>
                <p class="text-sm font-medium leading-normal">Orders</p>
              </router-link>
              <router-link to="/admin/customers" class="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-[#3A3A3A] text-gray-300">
                <span class="material-symbols-outlined">group</span>
                <p class="text-sm font-medium leading-normal">Customers</p>
              </router-link>
              <router-link to="/admin/analytics" class="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-[#3A3A3A] text-gray-300">
                <span class="material-symbols-outlined">analytics</span>
                <p class="text-sm font-medium leading-normal">Analytics</p>
              </router-link>
              <router-link to="/admin/discount-codes" class="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-[#3A3A3A] text-gray-300">
                <span class="material-symbols-outlined">sell</span>
                <p class="text-sm font-medium leading-normal">Discount Codes</p>
              </router-link>
              <router-link to="/admin/settings" class="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-[#3A3A3A] text-gray-300">
                <span class="material-symbols-outlined">settings</span>
                <p class="text-sm font-medium leading-normal">Settings</p>
              </router-link>
            </nav>
          </div>
          <div class="mt-auto flex flex-col gap-4">
            <button class="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-10 px-4 bg-[#f97306] text-white text-sm font-bold leading-normal tracking-[0.015em] w-full gap-2">
              <span class="material-symbols-outlined">add</span>
              <span class="truncate">Add Product</span>
            </button>
            <a class="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white" href="#">
              <span class="material-symbols-outlined">help_outline</span>
              <p class="text-sm font-medium leading-normal">Help and Docs</p>
            </a>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 p-6 md:p-8">
          <!-- Header -->
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 class="text-white text-3xl font-bold leading-normal">Dashboard</h1>
              <p class="text-gray-400 text-base font-normal leading-normal">Welcome to your admin dashboard</p>
            </div>
            <div class="flex items-center gap-4">
              <ProfileDropdown />
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div v-for="i in 4" :key="i" class="bg-[#232323] rounded-lg shadow p-6">
              <div class="h-4 bg-gray-600 rounded animate-pulse mb-2"></div>
              <div class="h-8 bg-gray-600 rounded animate-pulse"></div>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="mb-8 p-4 bg-red-900/20 border border-red-500/50 text-red-400 rounded">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined">warning</span>
              <span>{{ error }}</span>
            </div>
          </div>

          <!-- Stats Cards -->
          <div v-else v-if="dashboardData?.stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-[#232323] rounded-lg shadow p-6">
              <h3 class="text-sm font-medium text-gray-400 mb-2">Total Revenue</h3>
              <p class="text-3xl font-bold text-white">{{ formatCurrency(dashboardData?.stats?.orders?.total_revenue || 0) }}</p>
            </div>
            <div class="bg-[#232323] rounded-lg shadow p-6">
              <h3 class="text-sm font-medium text-gray-400 mb-2">Total Orders</h3>
              <p class="text-3xl font-bold text-white">{{ dashboardData?.stats?.orders?.total || 0 }}</p>
            </div>
            <div class="bg-[#232323] rounded-lg shadow p-6">
              <h3 class="text-sm font-medium text-gray-400 mb-2">Active Customers</h3>
              <p class="text-3xl font-bold text-white">{{ dashboardData?.stats?.users?.active || 0 }}</p>
            </div>
            <div class="bg-[#232323] rounded-lg shadow p-6">
              <h3 class="text-sm font-medium text-gray-400 mb-2">Total Products</h3>
              <p class="text-3xl font-bold text-white">{{ dashboardData?.stats?.products?.total || 0 }}</p>
            </div>
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-[#232323] rounded-lg shadow p-6">
              <h3 class="text-sm font-medium text-gray-400 mb-2">Total Revenue</h3>
              <p class="text-3xl font-bold text-white">{{ formatCurrency(0) }}</p>
            </div>
            <div class="bg-[#232323] rounded-lg shadow p-6">
              <h3 class="text-sm font-medium text-gray-400 mb-2">Total Orders</h3>
              <p class="text-3xl font-bold text-white">0</p>
            </div>
            <div class="bg-[#232323] rounded-lg shadow p-6">
              <h3 class="text-sm font-medium text-gray-400 mb-2">Active Customers</h3>
              <p class="text-3xl font-bold text-white">0</p>
            </div>
            <div class="bg-[#232323] rounded-lg shadow p-6">
              <h3 class="text-sm font-medium text-gray-400 mb-2">Total Products</h3>
              <p class="text-3xl font-bold text-white">0</p>
            </div>
          </div>

          <!-- Recent Orders -->
          <div class="bg-[#232323] rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-700">
              <h2 class="text-xl font-semibold text-white">Recent Orders</h2>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-700">
                <thead class="bg-gray-800">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Order ID</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Customer</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody class="bg-[#232323] divide-y divide-gray-700">
                  <tr v-if="!recentOrders || recentOrders.length === 0">
                    <td colspan="5" class="px-6 py-4 text-center text-gray-400">No recent orders found</td>
                  </tr>
                  <tr v-for="order in recentOrders" :key="order.id" v-else>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-white">#{{ order.id }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{{ order.customer_name || 'N/A' }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="getStatusClass(order.status)">
                        {{ order.status || 'pending' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-white">{{ formatCurrency(order.total_amount || order.total || 0) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{{ formatDate(order.created_at) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAdminDashboard } from '@/composables/useAdminDashboard'
import ProfileDropdown from '@/components/ProfileDropdown.vue'

// Utils and API
const {
  dashboardData,
  recentOrders,
  isLoading,
  error,
  formatCurrency,
  formatDate,
  getStatusClass,
  loadDashboardData,
  loadRecentOrders
} = useAdminDashboard()

// Initialize
onMounted(async () => {
  await loadDashboardData()
  await loadRecentOrders()
})
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background-color: #1C1C1C;
}

.material-symbols-outlined {
  font-variation-settings:
    'FILL' 0,
    'wght' 400,
    'GRAD' 0,
    'opsz' 24
}
</style>
