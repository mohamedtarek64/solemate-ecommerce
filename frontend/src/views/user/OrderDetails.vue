<template>
  <div class="order-details-page">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-[#4a4a4a] px-10 py-4 bg-slate-900/95 backdrop-blur-md">
      <router-link to="/" class="flex items-center gap-4 hover:opacity-80 transition-opacity">
        <div class="text-orange-500">
          <svg class="h-8 w-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
          </svg>
        </div>
        <h2 class="text-2xl font-bold tracking-tighter text-white">SoleMate</h2>
      </router-link>
      <nav class="hidden md:flex items-center gap-8 text-sm font-medium">
        <router-link to="/" class="text-gray-300 hover:text-orange-500 transition-colors">Home</router-link>
        <router-link to="/products" class="text-gray-300 hover:text-orange-500 transition-colors">Products</router-link>
        <router-link to="/orders" class="text-gray-300 hover:text-orange-500 transition-colors">Orders</router-link>
        <router-link to="/wishlist" class="text-gray-300 hover:text-orange-500 transition-colors">Wishlist</router-link>
      </nav>
      <div class="flex items-center gap-4 relative z-[60]">
        <ProfileDropdown />
      </div>
    </header>

    <!-- Spacer for fixed header -->
    <div class="h-20"></div>

    <!-- Main Content -->
    <main class="order-details">
      <div class="container">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p class="text-[#a0a0a0]">Loading order details...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-12">
          <div class="text-red-500 text-lg mb-4">{{ error }}</div>
          <button
            @click="fetchOrderDetails"
            class="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            Retry
          </button>
        </div>

        <!-- Order Details -->
        <div v-else-if="order" class="space-y-8">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-white mb-2">Order Details</h1>
              <p class="text-[#a0a0a0]">Order #{{ order.order_number }}</p>
            </div>
            <div class="flex items-center gap-4">
              <button
                @click="showInvoice = true"
                class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span class="material-symbols-outlined text-lg">receipt_long</span>
                <span>View Invoice</span>
              </button>
              <div class="flex items-center gap-3">
                <span class="text-[#a0a0a0]">Status:</span>
                <span
                  class="px-3 py-1 rounded-full text-sm font-medium"
                  :class="getStatusClass(order.status)"
                >
                  {{ getStatusText(order.status) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Order Summary Card -->
          <div class="bg-[#2a2a2a] rounded-lg p-6">
            <h2 class="text-xl font-semibold text-white mb-4">Order Summary</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-[#a0a0a0]">Order Number:</span>
                  <span class="text-white font-medium">{{ order.order_number }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-[#a0a0a0]">Order Date:</span>
                  <span class="text-white">{{ formatDate(order.created_at) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-[#a0a0a0]">Payment Method:</span>
                  <span class="text-white">{{ order.payment_method }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-[#a0a0a0]">Shipping Method:</span>
                  <span class="text-white">{{ order.shipping_method }}</span>
                </div>
              </div>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-[#a0a0a0]">Subtotal:</span>
                  <span class="text-white">{{ formatCurrency(order.subtotal) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-[#a0a0a0]">Shipping:</span>
                  <span class="text-white">{{ formatCurrency(order.shipping_cost) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-[#a0a0a0]">Tax:</span>
                  <span class="text-white">{{ formatCurrency(order.tax_amount) }}</span>
                </div>
                <div class="flex justify-between border-t border-[#4a4a4a] pt-3">
                  <span class="text-[#a0a0a0] font-medium">Total:</span>
                  <span class="text-orange-500 font-bold text-lg">{{ formatCurrency(order.total_amount) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="bg-[#2a2a2a] rounded-lg p-6">
            <h2 class="text-xl font-semibold text-white mb-4">Order Items</h2>
            <div class="space-y-4">
              <div
                v-for="item in order.order_items"
                :key="item.id"
                class="flex items-center gap-4 p-4 bg-[#3a3a3a] rounded-lg"
              >
                <div class="w-16 h-16 bg-[#4a4a4a] rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    v-if="item.product_image || item.image"
                    :src="item.product_image || item.image"
                    :alt="item.product_name"
                    class="w-full h-full object-cover rounded-lg"
                    @error="handleImageError"
                  />
                  <svg
                    v-else
                    class="w-8 h-8 text-[#a0a0a0]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style="display: block;"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 7a2 2 0 01-2 2H8a2 2 0 01-2-2L5 9z"></path>
                  </svg>
                </div>
                <div class="flex-1">
                  <h3 class="text-white font-medium">{{ item.product_name }}</h3>
                  <div class="flex items-center gap-4 text-sm text-[#a0a0a0] mt-1">
                    <span v-if="item.size">Size: {{ item.size }}</span>
                    <span v-if="item.color">Color: {{ item.color }}</span>
                    <span v-if="item.variant">Variant: {{ item.variant }}</span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-white font-medium">Qty: {{ item.quantity }}</div>
                  <div class="text-orange-500 font-bold">{{ formatCurrency(item.price || item.product_price || item.unit_price || (item.subtotal / item.quantity) || 0) }}</div>
                  <div class="text-sm text-[#a0a0a0]">Total: {{ formatCurrency(item.subtotal || item.total || (item.price * item.quantity) || 0) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Shipping Address -->
          <div class="bg-[#2a2a2a] rounded-lg p-6">
            <h2 class="text-xl font-semibold text-white mb-4">Shipping Address</h2>
            <div class="text-white">
              <div>{{ shippingAddress.firstName }} {{ shippingAddress.lastName }}</div>
              <div>{{ shippingAddress.address }}</div>
              <div>{{ shippingAddress.city }}, {{ shippingAddress.state }} {{ shippingAddress.zipCode }}</div>
              <div class="mt-2">
                <span class="text-[#a0a0a0]">Phone:</span> {{ shippingAddress.phone }}
              </div>
              <div>
                <span class="text-[#a0a0a0]">Email:</span> {{ shippingAddress.email }}
              </div>
            </div>
          </div>

          <!-- Tracking Information -->
          <div v-if="order.tracking_number" class="bg-[#2a2a2a] rounded-lg p-6">
            <h2 class="text-xl font-semibold text-white mb-4">Tracking Information</h2>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-[#a0a0a0]">Tracking Number:</span>
                <span class="text-white font-medium">{{ order.tracking_number }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[#a0a0a0]">Carrier:</span>
                <span class="text-white">DHL Express</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[#a0a0a0]">Estimated Delivery:</span>
                <span class="text-white">{{ formatDate(order.delivered_at || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)) }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link
              to="/orders"
              class="px-6 py-3 bg-[#4a4a4a] text-white rounded-lg hover:bg-[#6a6a6a] transition-colors font-medium text-center"
            >
              Back to Orders
            </router-link>
            <button
              v-if="canCancelOrder"
              @click="cancelOrder"
              class="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              Cancel Order
            </button>
            <router-link
              to="/"
              class="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium text-center"
            >
              Continue Shopping
            </router-link>
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
                    @click="confirmCancelOrder"
                    class="btn-cancel-confirm action-btn px-4 py-2 rounded-lg"
                  >
                    Yes, Cancel Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Invoice Modal -->
    <div v-if="showInvoice" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4" @click="showInvoice = false">
      <div class="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
        <!-- Invoice Header -->
        <div class="sticky top-0 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-900">Invoice</h2>
          <div class="flex items-center gap-2">
            <button @click="printInvoice" class="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
              <span class="material-symbols-outlined text-lg">print</span>
              <span>Print</span>
            </button>
            <button @click="showInvoice = false" class="text-gray-400 hover:text-gray-600 transition-colors">
              <span class="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>
        </div>

        <!-- Invoice Content -->
        <div id="invoice-content" class="p-8">
          <!-- Company Info -->
          <div class="flex items-start justify-between mb-8">
            <div>
              <div class="flex items-center gap-3 mb-4">
                <svg class="h-10 w-10 text-orange-500" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
                </svg>
                <h1 class="text-3xl font-bold text-gray-900">SoleMate</h1>
              </div>
              <p class="text-gray-600">123 Sneaker Street</p>
              <p class="text-gray-600">New York, NY 10001</p>
              <p class="text-gray-600">support@solemate.com</p>
              <p class="text-gray-600">+1 (555) 123-4567</p>
            </div>
            <div class="text-right">
              <h2 class="text-2xl font-bold text-gray-900 mb-2">INVOICE</h2>
              <p class="text-gray-600"><span class="font-semibold">Order #:</span> {{ order.order_number }}</p>
              <p class="text-gray-600"><span class="font-semibold">Date:</span> {{ formatDate(order.created_at) }}</p>
              <p class="text-gray-600"><span class="font-semibold">Status:</span> <span :class="getStatusClass(order.status)">{{ getStatusText(order.status) }}</span></p>
            </div>
          </div>

          <!-- Customer & Shipping Info -->
          <div class="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
              <p class="text-gray-800 font-medium">{{ shippingAddress.firstName }} {{ shippingAddress.lastName }}</p>
              <p class="text-gray-600">{{ shippingAddress.email }}</p>
              <p class="text-gray-600">{{ shippingAddress.phone }}</p>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Ship To:</h3>
              <p class="text-gray-800 font-medium">{{ shippingAddress.firstName }} {{ shippingAddress.lastName }}</p>
              <p class="text-gray-600">{{ shippingAddress.address }}</p>
              <p class="text-gray-600">{{ shippingAddress.city }}, {{ shippingAddress.state }} {{ shippingAddress.zipCode }}</p>
              <p class="text-gray-600">{{ shippingAddress.phone }}</p>
            </div>
          </div>

          <!-- Order Items Table -->
          <div class="mb-8">
            <table class="w-full">
              <thead>
                <tr class="border-b-2 border-gray-300">
                  <th class="text-left py-3 text-gray-700 font-semibold">Item</th>
                  <th class="text-center py-3 text-gray-700 font-semibold">Quantity</th>
                  <th class="text-right py-3 text-gray-700 font-semibold">Unit Price</th>
                  <th class="text-right py-3 text-gray-700 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in order.order_items" :key="item.id" class="border-b border-gray-200">
                  <td class="py-4">
                    <div class="flex items-center gap-3">
                      <img v-if="item.product_image || item.image" :src="item.product_image || item.image" :alt="item.product_name || item.name" class="w-16 h-16 object-cover rounded-lg">
                      <div>
                        <p class="font-medium text-gray-900">{{ item.product_name || item.name }}</p>
                        <p v-if="item.size || item.color" class="text-sm text-gray-600">
                          <span v-if="item.size">Size: {{ item.size }}</span>
                          <span v-if="item.size && item.color"> | </span>
                          <span v-if="item.color">Color: {{ item.color }}</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td class="text-center text-gray-800">{{ item.quantity }}</td>
                  <td class="text-right text-gray-800">${{ parseFloat(item.product_price || item.price || 0).toFixed(2) }}</td>
                  <td class="text-right font-medium text-gray-900">${{ (parseFloat(item.product_price || item.price || 0) * item.quantity).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Totals -->
          <div class="flex justify-end">
            <div class="w-80 space-y-2">
              <div class="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span class="font-medium">${{ parseFloat(order.subtotal_amount || order.subtotal || 0).toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-gray-700">
                <span>Shipping:</span>
                <span class="font-medium">${{ parseFloat(order.shipping_amount || order.shipping_cost || 0).toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-gray-700">
                <span>Tax:</span>
                <span class="font-medium">${{ parseFloat(order.tax_amount || order.tax || 0).toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t-2 border-gray-300">
                <span>Total:</span>
                <span class="text-orange-600">${{ parseFloat(order.total_amount || order.total || 0).toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600 text-sm">
            <p class="mb-2">Thank you for your purchase!</p>
            <p>For any questions, please contact us at support@solemate.com</p>
            <p class="mt-4 text-gray-500">This is a computer-generated invoice. No signature required.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ProfileDropdown from '@/components/ProfileDropdown.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Reactive state
const order = ref(null)
const loading = ref(true)
const error = ref(null)
const showInvoice = ref(false)

// Computed
const user = computed(() => authStore.user)

const shippingAddress = computed(() => {
  if (!order.value?.shipping_address) return {}
  return typeof order.value.shipping_address === 'string'
    ? JSON.parse(order.value.shipping_address)
    : order.value.shipping_address
})

const canCancelOrder = computed(() => {
  return order.value?.status === 'pending' || order.value?.status === 'confirmed'
})

// Methods
const fetchOrderDetails = async () => {
  try {
    loading.value = true
    error.value = null

    const orderId = route.params.id
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token')

    const response = await fetch(`http://127.0.0.1:8000/api/orders/${orderId}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    const result = await response.json()

    if (result.success) {
      order.value = result.data
      } else {
      throw new Error(result.message || 'Failed to fetch order details')
    }
  } catch (err) {
    error.value = err.message
    console.error('Error fetching order details:', err)
  } finally {
    loading.value = false
  }
}

// Cancel order modal state
const showCancelModal = ref(false)
const orderToCancel = ref(null)

const cancelOrder = () => {
  orderToCancel.value = order.value
  showCancelModal.value = true
}

const printInvoice = () => {
  // Create a print window with the invoice content
  const printWindow = window.open('', '_blank')
  const invoiceContent = document.getElementById('invoice-content')

  if (printWindow && invoiceContent) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${order.value.order_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .totals { margin-top: 20px; text-align: right; }
            .total-row { font-size: 1.2em; font-weight: bold; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          ${invoiceContent.innerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }
}

const confirmCancelOrder = async () => {
  try {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token')

    const response = await fetch(`http://127.0.0.1:8000/api/orders/${order.value.id}/cancel`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    const result = await response.json()

    if (result.success) {
      // Refresh order details
      await fetchOrderDetails()
      showCancelModal.value = false
      // Show success message
      alert('Order cancelled successfully')
    } else {
      throw new Error(result.message || 'Failed to cancel order')
    }
  } catch (err) {
    alert('Failed to cancel order: ' + err.message)
    console.error('Error cancelling order:', err)
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const getStatusText = (status) => {
  const statusMap = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  }
  return statusMap[status] || status
}

const getStatusClass = (status) => {
  const classMap = {
    pending: 'bg-yellow-500 text-white',
    confirmed: 'bg-blue-500 text-white',
    processing: 'bg-orange-500 text-white',
    shipped: 'bg-purple-500 text-white',
    delivered: 'bg-green-500 text-white',
    cancelled: 'bg-red-500 text-white'
  }
  return classMap[status] || 'bg-gray-500 text-white'
}

const handleImageError = (event) => {
  try {
    if (event.target && event.target.style) {
      event.target.style.display = 'none'
    }
    if (event.target && event.target.nextElementSibling && event.target.nextElementSibling.style) {
      event.target.nextElementSibling.style.display = 'block'
    }
  } catch (error) {
    console.warn('Image error handler failed:', error)
  }
}

// Initialize
onMounted(() => {
  fetchOrderDetails()
})
</script>

<style scoped>
@import '@/styles/user/OrderDetails.css';
</style>
