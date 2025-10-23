<template>
  <div class="admin-customers">
    <div class="relative flex size-full min-h-screen flex-col bg-[#1C1C1C] dark group/design-root overflow-x-hidden">
      <div class="flex flex-col lg:flex-row h-full grow">
        <!-- Sidebar -->
        <AdminSidebar />

        <!-- Main Content -->
        <main class="flex-1 p-6 md:p-8">
          <!-- Header -->
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <p class="text-white text-3xl font-bold">Customers Management</p>
              <p class="text-gray-400">Manage and track all customer accounts</p>
            </div>
            <div class="flex gap-2">
              <button
                @click="loadCustomers"
                :disabled="isLoading"
                class="flex items-center justify-center rounded-md h-10 px-4 bg-[#2C2C2C] text-white text-sm font-medium hover:bg-[#3A3A3A] gap-2 disabled:opacity-50"
              >
                <span class="material-symbols-outlined" :class="{ 'animate-spin': isLoading }">refresh</span>
                <span class="truncate">{{ isLoading ? 'Loading...' : 'Refresh' }}</span>
              </button>
              <button class="flex items-center justify-center rounded-md h-10 px-4 bg-[#f97306] text-white text-sm font-medium hover:bg-[#e55a00] gap-2">
                <span class="material-symbols-outlined">filter_list</span>
                <span class="truncate">Filter Customers</span>
              </button>
              <button @click="exportCustomers" class="flex items-center justify-center rounded-md h-10 px-4 bg-[#2C2C2C] text-white text-sm font-medium hover:bg-[#3A3A3A] gap-2">
                <span class="material-symbols-outlined">download</span>
                <span class="truncate">Export</span>
              </button>
            </div>
          </div>

          <!-- Stats Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="flex flex-col gap-2 rounded-md p-6 bg-[#232323]">
              <p class="text-gray-300 text-base font-medium">Total Customers</p>
              <p class="text-white text-3xl font-bold">{{ totalCustomers }}</p>
            </div>
            <div class="flex flex-col gap-2 rounded-md p-6 bg-[#232323]">
              <p class="text-gray-300 text-base font-medium">Active Customers</p>
              <p class="text-white text-3xl font-bold">{{ activeCustomers }}</p>
            </div>
            <div class="flex flex-col gap-2 rounded-md p-6 bg-[#232323]">
              <p class="text-gray-300 text-base font-medium">New This Month</p>
              <p class="text-white text-3xl font-bold">{{ newCustomers }}</p>
            </div>
            <div class="flex flex-col gap-2 rounded-md p-6 bg-[#232323]">
              <p class="text-gray-300 text-base font-medium">Total Orders</p>
              <p class="text-white text-3xl font-bold">{{ totalOrders }}</p>
            </div>
          </div>

          <!-- Customers Table -->
          <div class="bg-[#232323] p-6 rounded-md">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h2 class="text-white text-xl font-bold">All Customers</h2>
              <div class="flex gap-2">
                <select v-model="statusFilter" @change="filterCustomers" class="px-3 py-2 bg-[#2C2C2C] text-white rounded-md border border-gray-600">
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="banned">Banned</option>
                </select>
                <input
                  v-model="searchQuery"
                  @input="searchCustomers"
                  type="text"
                  placeholder="Search customers..."
                  class="px-3 py-2 bg-[#2C2C2C] text-white rounded-md border border-gray-600 placeholder-gray-400"
                />
              </div>
            </div>

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
            <div v-else-if="filteredCustomers.length === 0" class="text-center py-8 text-gray-400">
              <span class="material-symbols-outlined text-4xl mb-2">group</span>
              <p>No customers found</p>
            </div>

            <!-- Customers Table -->
            <div v-else class="overflow-x-auto">
              <table class="w-full text-left">
                <thead>
                  <tr class="border-b border-gray-700">
                    <th class="py-3 px-4 text-sm font-medium text-gray-300">Customer</th>
                    <th class="py-3 px-4 text-sm font-medium text-gray-300">Email</th>
                    <th class="py-3 px-4 text-sm font-medium text-gray-300">Phone</th>
                    <th class="py-3 px-4 text-sm font-medium text-gray-300">Status</th>
                    <th class="py-3 px-4 text-sm font-medium text-gray-300">Orders</th>
                    <th class="py-3 px-4 text-sm font-medium text-gray-300">Joined</th>
                    <th class="py-3 px-4 text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="customer in filteredCustomers" :key="customer.id" class="border-b border-gray-800 hover:bg-[#2C2C2C]">
                    <td class="py-3 px-4 text-sm text-white">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-[#f97306] rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {{ customer.first_name?.charAt(0) || 'U' }}
                        </div>
                        <div>
                          <p class="font-medium">{{ customer.first_name }} {{ customer.last_name }}</p>
                          <p class="text-gray-400 text-xs">ID: {{ customer.id }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="py-3 px-4 text-sm text-gray-400">{{ customer.email }}</td>
                    <td class="py-3 px-4 text-sm text-gray-400">{{ customer.phone || 'N/A' }}</td>
                    <td class="py-3 px-4 text-sm">
                      <span :class="getStatusClass(customer.status || 'active')">{{ customer.status || 'active' }}</span>
                    </td>
                    <td class="py-3 px-4 text-sm text-white">{{ customer.orders_count || 0 }}</td>
                    <td class="py-3 px-4 text-sm text-gray-400">{{ formatDate(customer.created_at) }}</td>
                    <td class="py-3 px-4 text-sm">
                      <div class="flex gap-2">
                        <button @click="viewCustomer(customer)" class="text-blue-400 hover:text-blue-300">
                          <span class="material-symbols-outlined text-sm">visibility</span>
                        </button>
                        <button @click="editCustomer(customer)" class="text-yellow-400 hover:text-yellow-300">
                          <span class="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button @click="deleteCustomer(customer)" class="text-red-400 hover:text-red-300">
                          <span class="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </td>
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
import { ref, computed, onMounted } from 'vue'
import { useAdminDashboard } from '@/composables/useAdminDashboard'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
// ✅ Enhanced Admin Optimization
import { useAdminOptimization } from '@/composables/useAdminOptimization'
import VirtualScroll from '@/components/common/VirtualScroll.vue'
import performanceMonitorEnhanced from '@/utils/performanceMonitorEnhanced'
import {
  useCustomersState,
  useCustomersComputed,
  useCustomersAPI,
  useCustomersActions,
  useCustomersUtils
} from '@/composables/admin/Customers.js'
import OptimizedLoading from '@/components/OptimizedLoading.vue'
import { usePaginatedApi } from '@/composables/useOptimizedApi.js'
import { useLoadingState } from '@/utils/loadingStates.js'

// State
const {
  customers,
  isLoading,
  error,
  statusFilter,
  searchQuery
} = useCustomersState()

// Computed
const {
  totalCustomers,
  activeCustomers,
  newCustomers,
  totalOrders,
  filteredCustomers
} = useCustomersComputed(customers, statusFilter, searchQuery)

// API
const { loadCustomers, viewCustomer, editCustomer, deleteCustomer, exportCustomers } = useCustomersAPI(customers, isLoading, error)

// Use optimized APIs
const {
  loading: optimizedLoading,
  data: optimizedCustomers,
  loadPage: optimizedLoadPage
} = usePaginatedApi('/api/admin/customers', { perPage: 20 })

// Use loading states
const { loading: adminCustomersLoading, withLoading: withAdminCustomersLoading } = useLoadingState('admin_customers')

// Actions
const {
  filterCustomers,
  searchCustomers
} = useCustomersActions()

// Utils
const { formatCurrency, formatDate, getStatusClass } = useCustomersUtils()

// ✅ Enhanced Admin Optimization
const adminOptimization = useAdminOptimization()

// Initialize
onMounted(async () => {
  // ✅ Start performance monitoring
  const measurement = performanceMonitorEnhanced.startMeasure('admin-customers-load', 'page-load')
  
  try {
    await loadCustomers()
    
    // ✅ Setup lazy loading for images
    requestAnimationFrame(() => {
      const images = document.querySelectorAll('img')
      images.forEach((img, index) => {
        if (index > 5) img.loading = 'lazy'
      })
    })
    
    } finally {
    performanceMonitorEnhanced.endMeasure(measurement)
  }
})
</script>

<style scoped>
@import '@/styles/admin/Customers.css';
</style>
