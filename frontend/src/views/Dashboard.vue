<template>
  <div class="container mx-auto px-4 py-8">
      <div class="max-w-7xl mx-auto">
        <!-- Welcome Section -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">
            Welcome back, {{ user?.name || 'User' }}!
          </h1>
          <p class="mt-2 text-gray-600">
            Here's what's happening with your account today.
          </p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Total Orders</p>
                <p class="text-2xl font-semibold text-gray-900">{{ stats.totalOrders }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Total Spent</p>
                <p class="text-2xl font-semibold text-gray-900">${{ stats.totalSpent }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Wishlist Items</p>
                <p class="text-2xl font-semibold text-gray-900">{{ stats.wishlistItems }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Completed Orders</p>
                <p class="text-2xl font-semibold text-gray-900">{{ stats.completedOrders }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Orders -->
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Recent Orders</h2>
          </div>
          <div class="p-6">
            <div v-if="recentOrders.length === 0" class="text-center py-8">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
              <p class="mt-1 text-sm text-gray-500">Get started by placing your first order.</p>
              <div class="mt-6">
                <router-link
                  to="/products"
                  class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Start Shopping
                </router-link>
              </div>
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="order in recentOrders"
                :key="order.id"
                class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span class="text-sm font-medium text-gray-600">#{{ order.id }}</span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-900">Order #{{ order.id }}</p>
                    <p class="text-sm text-gray-500">{{ order.date }}</p>
                  </div>
                </div>
                <div class="flex items-center">
                  <span class="text-sm font-medium text-gray-900">${{ order.total }}</span>
                  <span class="ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getStatusClass(order.status)">
                    {{ order.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup>
import { useDashboard } from '@/composables/Dashboard.js';

// Use the separated script
const {
  user,
  stats,
  recentOrders,
  getStatusClass
} = useDashboard();
</script>

<style scoped>
/* Additional component-specific styles if needed */
</style>
