<template>
  <div class="min-h-screen bg-gray-50">
    <!-- User Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <h1 class="text-2xl font-bold text-gray-900">My Dashboard</h1>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-sm text-gray-500">
              Welcome back, {{ user?.first_name || 'User' }}
            </div>
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          v-for="stat in stats"
          :key="stat.title"
          class="bg-white rounded-lg shadow p-6"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div :class="[
                'w-8 h-8 rounded-md flex items-center justify-center',
                stat.color
              ]">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="stat.icon" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">{{ stat.title }}</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stat.value }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Recent Orders -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">Recent Orders</h3>
              <router-link
                to="/orders"
                class="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
              >
                View all
              </router-link>
            </div>
            <div class="space-y-4">
              <div
                v-for="order in recentOrders"
                :key="order.id"
                class="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0"
              >
                <div>
                  <p class="text-sm font-medium text-gray-900">Order #{{ order.id }}</p>
                  <p class="text-sm text-gray-500">{{ order.items_count }} items</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-gray-900">${{ order.total }}</p>
                  <span :class="[
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    getStatusColor(order.status)
                  ]">
                    {{ order.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="space-y-6">
          <!-- Wishlist -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Wishlist</h3>
            <div class="space-y-3">
              <div
                v-for="item in wishlistItems"
                :key="item.id"
                class="flex items-center space-x-3"
              >
                <img
                  :src="item.product_image"
                  :alt="item.product_name"
                  class="w-12 h-12 rounded-md object-cover"
                />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ item.product_name }}
                  </p>
                  <p class="text-sm text-gray-500">${{ item.product_price }}</p>
                </div>
              </div>
            </div>
            <div class="mt-4">
              <router-link
                to="/wishlist"
                class="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
              >
                View all wishlist items
              </router-link>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm text-gray-500">Total Orders</span>
                <span class="text-sm font-medium text-gray-900">{{ stats[0]?.value || 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-500">Total Spent</span>
                <span class="text-sm font-medium text-gray-900">${{ totalSpent }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-500">Wishlist Items</span>
                <span class="text-sm font-medium text-gray-900">{{ wishlistItems.length }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recommended Products -->
      <div class="mt-8">
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Recommended for You</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div
              v-for="product in recommendedProducts"
              :key="product.id"
              class="group cursor-pointer"
            >
              <div class="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200">
                <img
                  :src="product.image_url"
                  :alt="product.name"
                  class="h-full w-full object-cover object-center group-hover:opacity-75"
                />
              </div>
              <div class="mt-2">
                <p class="text-sm font-medium text-gray-900 truncate">{{ product.name }}</p>
                <p class="text-sm text-gray-500">${{ product.price }}</p>
                <div class="flex items-center mt-1">
                  <div class="flex items-center">
                    <svg
                      v-for="i in 5"
                      :key="i"
                      :class="[
                        'h-4 w-4',
                        i <= product.rating ? 'text-yellow-400' : 'text-gray-300'
                      ]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <span class="ml-1 text-xs text-gray-500">({{ product.reviews_count }})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotifications } from '@/composables/useNotifications'
import { initializeUserDashboard, useUserDashboard } from "@/composables/user/UserDashboard.js";
import ProfileDropdown from '@/components/ProfileDropdown.vue'
// ✅ Enhanced Performance Optimization
import { useProfileOptimization } from '@/composables/useProfileOptimization'
import OptimizedImage from '@/components/common/OptimizedImage.vue'
import advancedCache from '@/utils/advancedCache'
import performanceMonitorEnhanced from '@/utils/performanceMonitorEnhanced'

const router = useRouter()
const authStore = useAuthStore()
const { error: showError } = useNotifications()

// Use composable
const {
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
} = useUserDashboard(router, authStore, { showError })

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
@import "@/styles/user/UserDashboard.css";
</style>
