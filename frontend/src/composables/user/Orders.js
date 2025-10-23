// Orders JavaScript Logic
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useNotifications } from '@/composables/useNotifications'

export function useOrdersState() {
  // Data
  const orders = ref([])
  const isLoading = ref(false)
  const selectedFilter = ref('all')
  const currentPage = ref(1)
  const itemsPerPage = ref(5)
  const selectedOrder = ref(null)
  const orderToCancel = ref(null)
  const showCancelModal = ref(false)

  return {
    orders,
    isLoading,
    selectedFilter,
    currentPage,
    itemsPerPage,
    selectedOrder,
    orderToCancel,
    showCancelModal
  }
}

export function useOrdersAuth() {
  const router = useRouter()
  const { user, isAuthenticated, handleLogout: authLogout } = useAuth()
  const { success, error: showError } = useNotifications()

  const isLoggedIn = computed(() => isAuthenticated.value)

  return {
    router,
    user,
    isAuthenticated,
    authLogout,
    success,
    showError,
    isLoggedIn
  }
}

export function useOrdersComputed(orders, selectedFilter, currentPage, itemsPerPage) {
  const filteredOrders = computed(() => {
    // Ensure orders.value is an array
    let filtered = Array.isArray(orders.value) ? orders.value : []

    if (selectedFilter.value !== 'all') {
      filtered = filtered.filter(order => order.status === selectedFilter.value)
    }

    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value

    return filtered.slice(start, end)
  })

  const totalPages = computed(() => {
    const filtered = selectedFilter.value === 'all'
      ? (Array.isArray(orders.value) ? orders.value : [])
      : (Array.isArray(orders.value) ? orders.value.filter(order => order.status === selectedFilter.value) : [])

    return Math.ceil(filtered.length / itemsPerPage.value)
  })

  return {
    filteredOrders,
    totalPages
  }
}

export function useOrdersAPI(isLoading, showError) {
  const loadOrders = async (orders) => {
    isLoading.value = true

    try {
      // Load orders from database
      const response = await fetch('http://127.0.0.1:8000/api/orders', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Handle paginated response from Laravel
          if (result.data && Array.isArray(result.data.data)) {
            orders.value = result.data.data
            } else if (Array.isArray(result.data)) {
            orders.value = result.data
            } else {
            orders.value = []
            }

          // Ensure each order has items array
          orders.value.forEach(order => {
            if (!order.items) {
              order.items = []
            }
          })
          } else {
          throw new Error(result.message || 'Failed to load orders')
        }
      } else {
        const errorData = await response.json()
        console.error('❌ Orders API error:', errorData)
        throw new Error(errorData.message || 'Failed to load orders')
      }
    } catch (error) {
      console.error('❌ Error loading orders:', error)
      showError('Failed to load orders. Please try again.')
      orders.value = []
    } finally {
      isLoading.value = false
    }
  }

  const viewOrderDetails = async (order, selectedOrder, showError) => {
    try {
      // Load detailed order information from API
      const response = await fetch(`http://127.0.0.1:8000/api/orders/${order.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          selectedOrder.value = result.data
          } else {
          throw new Error(result.message || 'Failed to load order details')
        }
      } else {
        // Fallback to basic order data
        selectedOrder.value = order
        console.warn('Using basic order data - detailed API not available')
      }
    } catch (error) {
      console.error('❌ Error loading order details:', error)
      // Fallback to basic order data
      selectedOrder.value = order
      showError('Failed to load detailed order information')
    }
  }

  const cancelOrder = async (orderToCancel, orders, showCancelModal, selectedOrder, success, showError) => {
    if (!orderToCancel.value) return

    try {
      // Get auth token and user ID
      const authToken = localStorage.getItem('auth_token')
      const userId = localStorage.getItem('user_id')

      if (!authToken || !userId) {
        throw new Error('Please log in to cancel an order')
      }

      const response = await fetch(`http://127.0.0.1:8000/api/orders/${orderToCancel.value.id}/cancel?user_id=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          success('Order cancelled successfully!')

          // Update order status in local state
          const orderIndex = orders.value.findIndex(o => o.id === orderToCancel.value.id)
          if (orderIndex !== -1) {
            orders.value[orderIndex].status = 'cancelled'
          }

          // Close modals
          showCancelModal.value = false
          selectedOrder.value = null
          orderToCancel.value = null

          } else {
          throw new Error(result.message || 'Failed to cancel order')
        }
      } else {
        const errorData = await response.json()
        console.error('❌ Cancel order API error:', errorData)
        throw new Error(errorData.message || 'Failed to cancel order')
      }
    } catch (error) {
      console.error('❌ Error cancelling order:', error)
      showError('Failed to cancel order. Please try again.')
    }
  }

  return {
    loadOrders,
    viewOrderDetails,
    cancelOrder
  }
}

export function useOrdersActions() {
  const filterOrders = (currentPage) => {
    currentPage.value = 1
  }

  const getStatusClass = (status) => {
    const classes = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return classes[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pending',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    }
    return texts[status] || status
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const reorderItems = async (order, selectedOrder, success, showError) => {
    try {
      // Add items to cart
      const cartItems = order.items.map(item => ({
        product_id: item.id,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        size: item.size || 'N/A'
      }))

      // Store in localStorage for cart
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]')
      const updatedCart = [...existingCart, ...cartItems]
      localStorage.setItem('cart', JSON.stringify(updatedCart))

      success(`Added ${cartItems.length} item(s) to cart!`)

      // Close modal if open
      if (selectedOrder.value) {
        selectedOrder.value = null
      }

      // Optionally redirect to cart
      // router.push('/cart')

    } catch (error) {
      console.error('Error reordering items:', error)
      showError('Failed to add items to cart. Please try again.')
    }
  }

  const canCancelOrder = (status) => {
    // Can cancel if order is pending or confirmed (not shipped, delivered, or cancelled)
    return ['pending', 'confirmed'].includes(status)
  }

  const confirmCancelOrder = (order) => {
    // This function will be called from the component with the correct refs
    return { order }
  }

  const previousPage = (currentPage) => {
    if (currentPage.value > 1) {
      currentPage.value--
    }
  }

  const nextPage = (currentPage, totalPages) => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
    }
  }

  const handleLogout = async (authLogout, success, router, showError) => {
    try {
      await authLogout()
      success('Logged out successfully!')
      router.push('/')
    } catch (error) {
      showError('Failed to logout. Please try again.')
    }
  }

  return {
    filterOrders,
    getStatusClass,
    getStatusText,
    formatDate,
    reorderItems,
    canCancelOrder,
    confirmCancelOrder,
    previousPage,
    nextPage,
    handleLogout
  }
}

export function initializeOrders() {
  return {
    onMounted: async (isLoggedIn, router, loadOrders) => {
      setTimeout(async () => {
        if (!isLoggedIn.value) {
          router.push('/login')
          return
        }

        await loadOrders()
      }, 100)
    }
  }
}
