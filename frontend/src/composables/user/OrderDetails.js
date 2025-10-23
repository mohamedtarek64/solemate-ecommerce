import { ref, computed } from 'vue'
import ApiService from '@/services/apiService'
import LoggerService from '@/services/loggerService'

// OrderDetails Composable
export function useOrderDetails(route, router, auth, notifications) {
  const { user, isAuthenticated } = auth
  const { success, showError } = notifications

  // Data
  const order = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const showCancelModal = ref(false)

  // Computed
  const isLoggedIn = computed(() => isAuthenticated.value)

  // Methods
  const loadOrderDetails = async () => {
    if (!isLoggedIn.value) {
      router.push('/login')
      return
    }

    const orderId = route.params.id
    if (!orderId) {
      error.value = 'Order ID is required'
      return
    }

    try {
      isLoading.value = true
      error.value = null

      LoggerService.order('Loading order details', { orderId })

      const result = await ApiService.get(`/orders/${orderId}`)

      if (result.success) {
        order.value = result.data
        LoggerService.order('Order details loaded successfully', { orderId })
      } else {
        throw new Error(result.message || 'Failed to load order details')
      }
    } catch (err) {
      LoggerService.error('Error loading order details', err, 'OrderDetails.loadOrderDetails')
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusIcon = (status) => {
    const icons = {
      pending: 'schedule',
      processing: 'trolley',
      confirmed: 'check_circle',
      shipped: 'local_shipping',
      delivered: 'done',
      cancelled: 'cancel'
    }
    return icons[status] || 'help'
  }

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pending',
      processing: 'Processing',
      confirmed: 'Confirmed',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    }
    return texts[status] || status
  }

  const getStatusDescription = (status) => {
    const descriptions = {
      pending: 'Your order is being reviewed.',
      processing: 'Your order is being prepared.',
      confirmed: 'Your order has been confirmed.',
      shipped: 'Your order is on its way.',
      delivered: 'Your order has been delivered.',
      cancelled: 'Your order has been cancelled.'
    }
    return descriptions[status] || 'Status unknown'
  }

  const getPaymentStatus = (paymentStatus) => {
    if (!paymentStatus) return 'Paid'
    return paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)
  }

  const canCancelOrder = (status) => {
    return ['pending', 'confirmed'].includes(status)
  }

  const reorderItems = () => {
    if (!order.value) return

    try {
      const cartItems = order.value.items.map(item => ({
        product_id: item.id,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        size: item.size || 'N/A'
      }))

      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]')
      const updatedCart = [...existingCart, ...cartItems]
      localStorage.setItem('cart', JSON.stringify(updatedCart))

      success(`Added ${cartItems.length} item(s) to cart!`)
      router.push('/cart')
    } catch (error) {
      console.error('Error reordering items:', error)
      showError('Failed to add items to cart. Please try again.')
    }
  }

  const confirmCancelOrder = () => {
    showCancelModal.value = true
  }

  const cancelOrder = async () => {
    if (!order.value) return

    try {
      LoggerService.order('Cancelling order', { orderId: order.value.id })

      const result = await ApiService.delete(`/orders/${order.value.id}/cancel`)

      if (result.success) {
        success('Order cancelled successfully!')
        order.value.status = 'cancelled'
        showCancelModal.value = false
        LoggerService.order('Order cancelled successfully', { orderId: order.value.id })
      } else {
        throw new Error(result.message || 'Failed to cancel order')
      }
    } catch (error) {
      LoggerService.error('Error cancelling order', error, 'OrderDetails.cancelOrder')
      showError('Failed to cancel order. Please try again.')
    }
  }

  const trackOrder = () => {
    if (!order.value?.tracking_number) {
      showError('No tracking number available for this order')
      return
    }

    // Open tracking in new tab (you can customize this URL based on your shipping provider)
    const trackingUrl = `https://www.fedex.com/fedextrack/?trknbr=${order.value.tracking_number}`
    window.open(trackingUrl, '_blank')
    success('Opening tracking page...')
  }

  const contactSupport = () => {
    // You can customize this based on your support system
    const supportEmail = 'support@solemate.com'
    const subject = `Support Request - Order #${order.value?.order_number || 'Unknown'}`
    const body = `Hello,\n\nI need support regarding my order #${order.value?.order_number || 'Unknown'}.\n\nPlease provide details about your inquiry:\n\n`

    const mailtoUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailtoUrl
    success('Opening email client...')
  }

  const viewProduct = (item) => {
    // Navigate to product detail page
    router.push(`/product/${item.product_id || item.id}`)
  }

  const handleLogout = async () => {
    try {
      // Clear auth token
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')

      // Redirect to home
      router.push('/')
      success('Logged out successfully!')
    } catch (error) {
      console.error('Logout error:', error)
      showError('Failed to logout. Please try again.')
    }
  }

  return {
    order,
    isLoading,
    error,
    showCancelModal,
    isLoggedIn,
    loadOrderDetails,
    formatDate,
    getStatusIcon,
    getStatusText,
    getStatusDescription,
    getPaymentStatus,
    canCancelOrder,
    reorderItems,
    confirmCancelOrder,
    cancelOrder,
    trackOrder,
    contactSupport,
    viewProduct,
    handleLogout
  }
}
