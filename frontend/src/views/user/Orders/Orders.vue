<template>
  <div class="relative flex size-full min-h-screen flex-col overflow-x-hidden">
    <!-- Header -->
    <header class="sticky top-0 z-10 bg-[#231910]/80 backdrop-blur-sm">
      <div class="container mx-auto flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#4a3421] px-4 sm:px-6 lg:px-8 py-3">
        <router-link to="/" class="flex items-center gap-4 hover:opacity-80 transition-opacity">
          <svg class="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
          </svg>
          <h1 class="text-2xl font-bold tracking-tight">SoleMate</h1>
        </router-link>

        <nav class="hidden md:flex items-center gap-8">
          <router-link to="/products?new=true" class="text-sm font-medium hover:text-orange-500 transition-colors">New Arrivals</router-link>
          <router-link to="/products?category=men" class="text-sm font-medium hover:text-orange-500 transition-colors">Men</router-link>
          <router-link to="/products?category=women" class="text-sm font-medium hover:text-orange-500 transition-colors">Women</router-link>
          <router-link to="/products?category=kids" class="text-sm font-medium hover:text-orange-500 transition-colors">Kids</router-link>
        </nav>

        <div class="flex items-center gap-2">
          <button @click="showSearchModal = true" class="flex h-10 w-10 items-center justify-center rounded-full bg-[#4a3421] text-white transition-colors hover:bg-[#5a4431]">
            <span class="material-symbols-outlined text-xl">search</span>
          </button>
          <router-link to="/wishlist" class="flex h-10 w-10 items-center justify-center rounded-full bg-[#4a3421] text-white transition-colors hover:bg-[#5a4431]">
            <span class="material-symbols-outlined text-xl">favorite_border</span>
          </router-link>
          <router-link to="/cart" class="flex h-10 w-10 items-center justify-center rounded-full bg-[#4a3421] text-white transition-colors hover:bg-[#5a4431]">
            <span class="material-symbols-outlined text-xl">shopping_bag</span>
          </router-link>
          <ProfileDropdown />
        </div>
      </div>

      <!-- Search Modal -->
      <SearchModal v-model="showSearchModal" @close="showSearchModal = false" />
    </header>

    <!-- Main Content -->
    <main class="container mx-auto flex-1 px-4 sm:px-6 lg:px-8 py-10">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <!-- Sidebar -->
        <aside class="lg:col-span-1">
          <div class="bg-[#231910] rounded-xl p-6">
            <h2 class="text-3xl font-bold mb-8">My Account</h2>
            <nav class="flex flex-col space-y-2">
              <router-link
                to="/profile"
                class="flex items-center gap-3 rounded-md px-4 py-3 hover:bg-[#4a3421] text-[#ccaa8e] hover:text-white font-semibold text-sm transition-colors"
              >
                <span class="material-symbols-outlined">person</span>
                <span>Profile</span>
              </router-link>
              <router-link
                to="/orders"
                class="flex items-center gap-3 rounded-md px-4 py-3 bg-orange-500 text-white font-bold text-sm"
              >
                <span class="material-symbols-outlined">receipt_long</span>
                <span>Orders</span>
              </router-link>
              <router-link
                to="/wishlist"
                class="flex items-center gap-3 rounded-md px-4 py-3 hover:bg-[#4a3421] text-[#ccaa8e] hover:text-white font-semibold text-sm transition-colors"
              >
                <span class="material-symbols-outlined">favorite_border</span>
                <span>Wishlist</span>
              </router-link>
              <router-link
                to="/settings"
                class="flex items-center gap-3 rounded-md px-4 py-3 hover:bg-[#4a3421] text-[#ccaa8e] hover:text-white font-semibold text-sm transition-colors"
              >
                <span class="material-symbols-outlined">settings</span>
                <span>Settings</span>
              </router-link>
              <div class="border-t border-[#4a3421] my-4"></div>
              <button
                @click="handleLogout"
                class="flex items-center gap-3 rounded-md px-4 py-3 hover:bg-[#4a3421] text-[#ccaa8e] hover:text-white font-semibold text-sm transition-colors"
              >
                <span class="material-symbols-outlined">logout</span>
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </aside>

        <!-- Orders Content -->
        <div class="lg:col-span-3">
          <div class="bg-[#231910] rounded-xl p-8">
            <div class="flex items-center justify-between mb-8">
              <h3 class="text-2xl font-bold">My Orders</h3>
              <div class="flex gap-2">
                <select
                  v-model="selectedFilter"
                  @change="filterOrders"
                  class="bg-[#2d2218] border border-[#4a3421] text-white rounded-lg px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500"
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <!-- Optimized Loading State -->
            <OptimizedLoading
              v-if="isLoading || ordersLoading || optimizedLoading"
              type="skeleton"
              :count="5"
              skeleton-class="order"
              message="Loading your orders..."
            />

            <!-- Empty State -->
            <div v-else-if="filteredOrders.length === 0" class="text-center py-12">
              <div class="bg-[#2d2218] rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <span class="material-symbols-outlined text-4xl text-[#ccaa8e]">receipt_long</span>
              </div>
              <h4 class="text-xl font-semibold text-white mb-2">No Orders Found</h4>
              <p class="text-[#ccaa8e] mb-6">You haven't placed any orders yet.</p>
            <router-link
                to="/"
                class="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Start Shopping
            </router-link>
            </div>

            <!-- Order Details Modal -->
            <div v-if="selectedOrder" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div class="bg-[#231910] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6">
                  <!-- Modal Header -->
                  <div class="flex items-center justify-between mb-6">
                    <h3 class="text-2xl font-bold text-white">Order Details</h3>
                    <button
                      @click="selectedOrder = null"
                      class="text-[#ccaa8e] hover:text-white transition-colors"
                    >
                      <span class="material-symbols-outlined text-2xl">close</span>
                    </button>
                  </div>

                  <!-- Order Info -->
                  <div class="bg-[#2d2218] rounded-lg p-4 mb-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 class="text-lg font-semibold text-white mb-2">Order Information</h4>
                        <p class="text-[#ccaa8e]"><span class="text-white">Order #:</span> {{ selectedOrder.order_number }}</p>
                        <p class="text-[#ccaa8e]"><span class="text-white">Date:</span> {{ formatDate(selectedOrder.created_at) }}</p>
                        <p class="text-[#ccaa8e]"><span class="text-white">Status:</span>
                          <span :class="getStatusClass(selectedOrder.status)" class="ml-2 px-2 py-1 rounded-full text-xs font-medium">
                            {{ getStatusText(selectedOrder.status) }}
                          </span>
                        </p>
                        <p class="text-[#ccaa8e]"><span class="text-white">Total:</span> ${{ selectedOrder.total_amount }}</p>
                        <p class="text-[#ccaa8e]"><span class="text-white">Payment:</span> {{ selectedOrder.payment_method || 'Credit Card' }}</p>
                        <p class="text-[#ccaa8e]"><span class="text-white">Status:</span>
                          <span :class="getStatusClass(selectedOrder.payment_status)" class="ml-2 px-2 py-1 rounded-full text-xs font-medium">
                            {{ selectedOrder.payment_status || 'Paid' }}
                          </span>
                        </p>
                      </div>
                      <div>
                        <h4 class="text-lg font-semibold text-white mb-2">Shipping Information</h4>
                        <p class="text-[#ccaa8e]"><span class="text-white">Method:</span> {{ selectedOrder.shipping_method || 'Standard Shipping' }}</p>
                        <p class="text-[#ccaa8e]"><span class="text-white">Tracking:</span> {{ selectedOrder.tracking_number || 'Not available' }}</p>
                        <p class="text-[#ccaa8e]"><span class="text-white">Address:</span>
                          {{ selectedOrder.shipping_address ?
                            `${selectedOrder.shipping_address.address}, ${selectedOrder.shipping_address.city}, ${selectedOrder.shipping_address.state} ${selectedOrder.shipping_address.zip}` :
                            'Not available'
                          }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Order Items -->
                  <div class="mb-6">
                    <h4 class="text-lg font-semibold text-white mb-4">Order Items</h4>
                    <div class="space-y-3">
                      <div
                        v-for="item in selectedOrder.items"
                        :key="item.id"
                        class="flex items-center gap-4 p-3 bg-[#2d2218] rounded-lg"
                      >
                        <div class="w-16 h-16 bg-[#4a3421] rounded-lg flex items-center justify-center">
                          <span class="material-symbols-outlined text-2xl text-[#ccaa8e]">image</span>
                        </div>
                        <div class="flex-1">
                          <h5 class="font-medium text-white">{{ item.product_name }}</h5>
                          <p class="text-sm text-[#ccaa8e]">Size: {{ item.size }} | Qty: {{ item.quantity }}</p>
                        </div>
                        <div class="text-right">
                          <div class="font-semibold text-white">${{ item.price }}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Order Actions -->
                  <div class="flex gap-3 justify-end">
                    <button
                      @click="selectedOrder = null"
                      class="px-4 py-2 text-[#ccaa8e] border border-[#4a3421] rounded-lg hover:bg-[#4a3421] hover:text-white transition-colors"
                    >
                      Close
                    </button>
                    <button
                      v-if="canCancelOrder(selectedOrder.status)"
                      @click="confirmCancelOrderWrapper(selectedOrder)"
                      class="px-4 py-2 text-red-500 border border-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                    >
                      Cancel Order
                    </button>
                    <button
                      v-if="selectedOrder.status === 'delivered'"
                      @click="optimizedReorderItems(selectedOrder)"
                      :disabled="buttonLoadingStates[`reorder-${selectedOrder.id}`]"
                      class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                    >
                      {{ buttonLoadingStates[`reorder-${selectedOrder.id}`] ? 'Reordering...' : 'Reorder Items' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Cancel Order Confirmation Modal -->
            <div v-if="showCancelModal" class="modal-overlay fixed inset-0 flex items-center justify-center z-50 p-4">
              <div class="cancel-modal modal-content rounded-xl max-w-md w-full">
                <div class="p-6">
                  <!-- Modal Header -->
                  <div class="cancel-modal-header flex items-center justify-between mb-6 pb-4">
                    <div class="flex items-center gap-3">
                      <span class="cancel-modal-icon material-symbols-outlined text-2xl">warning</span>
                      <h3 class="cancel-modal-title text-xl font-bold">Cancel Order</h3>
                    </div>
                    <button
                      @click="showCancelModal = false"
                      class="text-[#ccaa8e] hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                    >
                      <span class="material-symbols-outlined text-xl">close</span>
                    </button>
                  </div>

                  <!-- Modal Content -->
                  <div class="mb-6">
                    <p class="cancel-modal-message text-lg mb-4">
                      Are you sure you want to cancel order <span class="text-white font-semibold">#{{ orderToCancel?.order_number }}</span>?
                    </p>
                    <div class="cancel-modal-warning">
                      <p class="text-sm">
                        ⚠️ This action cannot be undone. If you've already been charged, you'll receive a refund within 3-5 business days.
                      </p>
                    </div>
                  </div>

                  <!-- Modal Actions -->
                  <div class="cancel-modal-actions flex gap-3 justify-end pt-4">
                    <button
                      @click="showCancelModal = false"
                      class="btn-cancel-cancel action-btn px-4 py-2 rounded-lg"
                    >
                      Keep Order
                    </button>
                    <button
                      @click="cancelOrder"
                      class="btn-cancel-confirm action-btn px-4 py-2 rounded-lg"
                    >
                      Yes, Cancel Order
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Orders List -->
            <div v-else class="space-y-6">
              <div
                v-for="order in filteredOrders"
                :key="order.id"
                class="bg-[#2d2218] rounded-lg p-6 border border-[#4a3421] hover:border-orange-500/50 transition-colors"
              >
                <!-- Order Header -->
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-4">
                    <div>
                      <h4 class="text-lg font-semibold text-white">Order #{{ order.order_number }}</h4>
                      <p class="text-sm text-[#ccaa8e]">Placed on {{ formatDate(order.created_at) }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-lg font-bold text-white">${{ order.total_amount }}</div>
                    <span
                      :class="getStatusClass(order.status)"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    >
                      {{ getStatusText(order.status) }}
                    </span>
                  </div>
                </div>

                <!-- Order Items -->
                <div class="space-y-3 mb-4">
                  <div
                    v-for="item in order.items"
                    :key="item.id"
                    class="flex items-center gap-4 p-3 bg-[#1a1a1a] rounded-lg"
                  >
                    <div class="w-16 h-16 bg-[#4a3421] rounded-lg flex items-center justify-center">
                      <span class="material-symbols-outlined text-2xl text-[#ccaa8e]">image</span>
                    </div>
                    <div class="flex-1">
                      <h5 class="font-medium text-white">{{ item.product_name }}</h5>
                      <p class="text-sm text-[#ccaa8e]">Size: {{ item.size }} | Qty: {{ item.quantity }}</p>
                    </div>
                    <div class="text-right">
                      <div class="font-semibold text-white">${{ item.price }}</div>
                    </div>
                  </div>
                </div>

                <!-- Order Actions -->
                <div class="flex items-center justify-between pt-4 border-t border-[#4a3421]">
                  <div class="flex gap-2">
                    <router-link
                      :to="`/orders/${order.id}`"
                      class="px-4 py-2 text-orange-500 border border-orange-500 rounded-lg hover:bg-orange-500 hover:text-white transition-colors text-sm font-medium inline-block"
                    >
                      View Details
                    </router-link>
                    <button
                      v-if="order.status === 'delivered'"
                      @click="optimizedReorderItems(order)"
                      :disabled="buttonLoadingStates[`reorder-${order.id}`]"
                      class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      {{ buttonLoadingStates[`reorder-${order.id}`] ? 'Reordering...' : 'Reorder' }}
                    </button>
                    <button
                      v-if="canCancelOrder(order.status)"
                      @click="confirmCancelOrderWrapper(order)"
                      class="px-4 py-2 text-red-500 border border-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors text-sm font-medium"
                    >
                      Cancel Order
                    </button>
                  </div>
                  <div class="text-sm text-[#ccaa8e]">
                    {{ order.items.length }} item{{ order.items.length !== 1 ? 's' : '' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-8">
              <button
                @click="previousPage"
                :disabled="currentPage === 1"
                class="px-3 py-2 text-[#ccaa8e] border border-[#4a3421] rounded-lg hover:bg-[#4a3421] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span class="px-4 py-2 text-white">
                Page {{ currentPage }} of {{ totalPages }}
              </span>
              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="px-3 py-2 text-[#ccaa8e] border border-[#4a3421] rounded-lg hover:bg-[#4a3421] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useNotifications } from '@/composables/useNotifications'
import { useOrdersState, useOrdersAuth, useOrdersComputed, useOrdersAPI, useOrdersActions, initializeOrders } from "@/composables/user/Orders.js";
import ProfileDropdown from '@/components/ProfileDropdown.vue'
import SearchModal from '@/components/search/SearchModal.vue'
import OptimizedLoading from '@/components/OptimizedLoading.vue'
import { usePaginatedApi } from '@/composables/useOptimizedApi.js'
import { useLoadingState } from '@/utils/loadingStates.js'
// ✅ Enhanced Performance Optimization
import VirtualScroll from '@/components/common/VirtualScroll.vue'
import OptimizedImage from '@/components/common/OptimizedImage.vue'
import advancedCache from '@/utils/advancedCache'
import performanceMonitorEnhanced from '@/utils/performanceMonitorEnhanced'

// Search modal state
const showSearchModal = ref(false)

// Performance optimizations
const buttonLoadingStates = ref({})

// State
const { orders, isLoading, selectedFilter, currentPage, itemsPerPage, selectedOrder, orderToCancel, showCancelModal } = useOrdersState()

// Use optimized paginated API
const {
  loading: optimizedLoading,
  data: optimizedOrders,
  page: optimizedPage,
  totalPages: optimizedTotalPages,
  loadPage: optimizedLoadPage
} = usePaginatedApi('/api/orders', { perPage: 10 })

// Use loading states
const { loading: ordersLoading, withLoading: withOrdersLoading } = useLoadingState('orders_page')

// Auth
const { router, user, isAuthenticated, authLogout, success, showError, isLoggedIn } = useOrdersAuth()

// Computed
const { filteredOrders, totalPages } = useOrdersComputed(orders, selectedFilter, currentPage, itemsPerPage)

// API
const { loadOrders: loadOrdersAPI, viewOrderDetails, cancelOrder: cancelOrderAPI } = useOrdersAPI(isLoading, showError)

// Actions
const {
  filterOrders,
  getStatusClass,
  getStatusText,
  formatDate,
  reorderItems: reorderItemsAction,
  canCancelOrder,
  confirmCancelOrder,
  previousPage,
  nextPage,
  handleLogout
} = useOrdersActions()

// Optimized actions with loading states
const optimizedReorderItems = async (order) => {
  if (buttonLoadingStates.value[`reorder-${order.id}`]) return

  buttonLoadingStates.value[`reorder-${order.id}`] = true

  try {
    await reorderItemsAction(order)
  } finally {
    setTimeout(() => {
      buttonLoadingStates.value[`reorder-${order.id}`] = false
    }, 1000)
  }
}

const optimizedCancelOrder = async () => {
  if (buttonLoadingStates.value['cancel']) return

  buttonLoadingStates.value['cancel'] = true

  try {
    await cancelOrderAPI()
  } finally {
    setTimeout(() => {
      buttonLoadingStates.value['cancel'] = false
    }, 1000)
  }
}

// Wrapper functions
const loadOrders = () => loadOrdersAPI(orders)
const reorderItems = (order) => reorderItemsAction(order, selectedOrder, success, showError)
const cancelOrder = () => cancelOrderAPI(orderToCancel, orders, showCancelModal, selectedOrder, success, showError)
const confirmCancelOrderWrapper = (order) => {
  orderToCancel.value = order
  showCancelModal.value = true
}

// Initialize
const { onMounted: initOrders } = initializeOrders()

onMounted(async () => {
  await initOrders(isLoggedIn, router, loadOrders)
})
</script>

<style scoped>
@import "./Orders.css";
@import '@/styles/components/OptimizedButtons.css';
</style>
