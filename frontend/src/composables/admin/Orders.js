// Admin Orders JavaScript Logic
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAdminDashboard } from '@/composables/useAdminDashboard'
import ApiService from '@/services/apiService'
import LoggerService from '@/services/loggerService'

export function useOrdersState() {
  // Orders data
  const orders = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const statusFilter = ref('')
  const searchQuery = ref('')
  const currentPage = ref(1)
  const itemsPerPage = ref(15)

  // UI States
  const showMoreActions = ref(null)
  const showConfirmModal = ref(false)
  const confirmModal = ref({
    title: '',
    message: '',
    confirmText: '',
    type: 'info',
    action: null
  })
  const showToast = ref(false)
  const toastMessage = ref('')
  const toastType = ref('success')

  return {
    orders,
    isLoading,
    error,
    statusFilter,
    searchQuery,
    currentPage,
    itemsPerPage,
    showMoreActions,
    showConfirmModal,
    confirmModal,
    showToast,
    toastMessage,
    toastType
  }
}

export function useOrdersComputed(orders, statusFilter, searchQuery) {
  const totalOrders = computed(() => orders.value.length)
  const pendingOrders = computed(() => orders.value.filter(order => order.status === 'pending').length)
  const completedOrders = computed(() => orders.value.filter(order => order.status === 'delivered' || order.status === 'completed').length)
  const totalRevenue = computed(() => orders.value.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0))

  const filteredOrders = computed(() => {
    let filtered = orders.value

    if (statusFilter.value) {
      filtered = filtered.filter(order => order.status === statusFilter.value)
    }

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(order =>
        order.id.toString().includes(query) ||
        order.user_name?.toLowerCase().includes(query) ||
        order.status.toLowerCase().includes(query)
      )
    }

    return filtered
  })

  return {
    totalOrders,
    pendingOrders,
    completedOrders,
    totalRevenue,
    filteredOrders
  }
}

export function useOrdersAPI(isLoading, error, orders, showToastMessageFn = null) {
  // Create a local showToastMessage function
  const showToastMessage = (message, type) => {
    if (showToastMessageFn) {
      showToastMessageFn(message, type)
    } else {
      }] ${message}`)
    }
  }

  const loadOrders = async () => {
    try {
      isLoading.value = true
      error.value = null

      const response = await fetch('/api/admin/orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        orders.value = result.data || []
        return result.data
      } else {
        throw new Error(result.message || 'Failed to load orders')
      }
    } catch (err) {
      LoggerService.error('Error fetching orders', err, 'Orders.loadOrders')
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const viewOrder = async (order) => {
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Show order details in a better format
          const orderDetails = result.data
          // Helper functions for formatting
          const formatCurrency = (amount) => {
            if (typeof amount !== 'number') {
              amount = parseFloat(amount) || 0
            }
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(amount)
          }

          const formatDate = (date) => {
            if (!date) return 'N/A'
            return new Date(date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          }

          // Create detailed order info
          let orderInfo = `📋 ORDER DETAILS\n`
          orderInfo += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
          orderInfo += `🆔 Order ID: #${orderDetails.id}\n`
          orderInfo += `📦 Order Number: ${orderDetails.order_number || 'N/A'}\n`
          orderInfo += `👤 Customer: ${orderDetails.customer_name || 'N/A'}\n`
          orderInfo += `📧 Email: ${orderDetails.customer_email || 'N/A'}\n`
          orderInfo += `📞 Phone: ${orderDetails.customer_phone || 'N/A'}\n`
          orderInfo += `📊 Status: ${orderDetails.status.toUpperCase()}\n`
          orderInfo += `💰 Total: ${formatCurrency(orderDetails.total_amount)}\n`
          orderInfo += `💳 Payment: ${orderDetails.payment_method || 'N/A'}\n`
          orderInfo += `📅 Created: ${formatDate(orderDetails.created_at)}\n`
          orderInfo += `\n🛍️ ORDER ITEMS (${orderDetails.items?.length || 0} items):\n`
          orderInfo += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`

          if (orderDetails.items && orderDetails.items.length > 0) {
            orderDetails.items.forEach((item, index) => {
              orderInfo += `${index + 1}. ${item.product_name}\n`
              orderInfo += `   Price: ${formatCurrency(item.product_price)} x ${item.quantity} = ${formatCurrency(item.subtotal)}\n`
              if (item.size) orderInfo += `   Size: ${item.size}\n`
              if (item.color) orderInfo += `   Color: ${item.color}\n`
              orderInfo += `\n`
            })
          } else {
            orderInfo += `No items found in this order.\n`
          }

          alert(orderInfo)
        }
      } else {
        throw new Error('Failed to load order details')
      }
    } catch (err) {
      console.error('Error viewing order:', err)
      alert('Error loading order details: ' + err.message)
    }
  }

  const editOrder = async (order) => {
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
    const currentStatus = order.status

    // Create a more user-friendly status selection
    const statusOptions = validStatuses.map(status => `${status}${status === currentStatus ? ' (current)' : ''}`).join('\n')
    const newStatus = prompt(`Update order status for Order #${order.id}:\n\nCurrent: ${currentStatus}\n\nAvailable options:\n${statusOptions}\n\nEnter new status:`, currentStatus)

    if (newStatus && newStatus !== currentStatus && validStatuses.includes(newStatus)) {
      try {
        const response = await fetch(`/api/admin/orders/${order.id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success) {
          await loadOrders()
            alert(`✅ Order #${order.id} status updated successfully!\n\nPrevious: ${currentStatus}\nNew: ${newStatus}`)
          } else {
            throw new Error(result.message || 'Failed to update order status')
          }
        } else {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      } catch (err) {
        console.error('Error updating order:', err)
        alert(`❌ Error updating order: ${err.message}`)
      }
    } else if (newStatus && !validStatuses.includes(newStatus)) {
      alert(`❌ Invalid status. Valid options are: ${validStatuses.join(', ')}`)
    }
  }

  const exportOrders = async () => {
    try {
      if (!orders.value || orders.value.length === 0) {
        alert('❌ No orders to export!')
        return
      }

      // Create CSV content for all orders
      let csvContent = 'Orders Export\n'
      csvContent += `Export Date,${new Date().toISOString().split('T')[0]}\n`
      csvContent += `Total Orders,${orders.value.length}\n`
      csvContent += '\n'

      csvContent += 'Order ID,Order Number,Customer Name,Customer Email,Status,Total Amount,Payment Method,Created At,Items Count\n'

      orders.value.forEach(order => {
        csvContent += `${order.id},${order.order_number || 'N/A'},"${order.customer_name || 'N/A'}","${order.customer_email || 'N/A'}",${order.status},${order.total_amount},${order.payment_method || 'N/A'},"${formatDate(order.created_at)}",${order.total_items || 0}\n`
      })

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

      alert(`✅ Orders exported successfully!\n\nTotal Orders: ${orders.value.length}\nFile: orders-export-${new Date().toISOString().split('T')[0]}.csv`)
    } catch (err) {
      console.error('Error exporting orders:', err)
      alert(`❌ Error exporting orders: ${err.message}`)
    }
  }

  const performDelete = async (order) => {
    try {
      // Helper function for currency formatting
      const formatCurrency = (amount) => {
        if (typeof amount !== 'number') {
          amount = parseFloat(amount) || 0
        }
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(amount)
      }

      // Confirm deletion
      const confirmed = confirm(`⚠️ WARNING: Are you sure you want to delete Order #${order.id}?\n\nCustomer: ${order.customer_name || 'N/A'}\nTotal: ${formatCurrency(order.total_amount)}\nStatus: ${order.status}\n\nThis action CANNOT be undone!`)

      if (!confirmed) {
        return
      }

      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        await loadOrders()
        alert(`✅ Order #${order.id} deleted successfully!`)
      } else {
        throw new Error('Failed to delete order')
      }
    } catch (err) {
      console.error('Error deleting order:', err)
      alert(`❌ Error deleting order: ${err.message}`)
    }
  }

  const performDuplicate = async (order) => {
    try {
      // Helper function for currency formatting
      const formatCurrency = (amount) => {
        if (typeof amount !== 'number') {
          amount = parseFloat(amount) || 0
        }
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(amount)
      }

      // For demonstration, we'll just show what would be duplicated
      let duplicateInfo = `📋 ORDER DUPLICATION PREVIEW\n`
      duplicateInfo += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
      duplicateInfo += `Original Order: #${order.id}\n`
      duplicateInfo += `New Order: #${order.id}-COPY-${Date.now()}\n`
      duplicateInfo += `Customer: ${order.customer_name || order.user?.name || 'N/A'}\n`
      duplicateInfo += `Total: ${formatCurrency(order.total_amount || order.total || 0)}\n`
      duplicateInfo += `Status: pending (reset for new order)\n`
      duplicateInfo += `Items: ${order.items?.length || order.total_items || 0} items\n`
      duplicateInfo += `\nNote: In a real implementation, this would create a new order in the database.`

      // Use showToastMessage instead of alert
      showToastMessage('Order duplication preview completed! Check console for details.', 'success')
      
      // In a real app, you would call the duplicate API here
      // await loadOrders() // Refresh the orders list
    } catch (err) {
      console.error('Error duplicating order:', err)
      showToastMessage('Error duplicating order: ' + err.message, 'error')
    }
  }

  const toggleOrderStatus = async (order) => {
    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    const currentIndex = statuses.indexOf(order.status)
    const nextStatus = statuses[(currentIndex + 1) % statuses.length]

    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')

      const response = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ status: nextStatus })
      })

      if (response.ok) {
        await loadOrders()
        showToastMessage(`Order #${order.id} status changed to ${nextStatus}`, 'success')
      } else {
        throw new Error('Failed to update order status')
      }
    } catch (err) {
      console.error('Error updating order status:', err)
      showToastMessage('Error updating order status: ' + err.message, 'error')
    }
  }

  const exportSingleOrder = async (order) => {
    try {
      // Local formatDate helper
      const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }

      // Create CSV content for single order
      let csvContent = 'Order Export\n'
      csvContent += `Order ID,${order.id}\n`
      csvContent += `Order Number,${order.order_number || 'N/A'}\n`
      csvContent += `Customer Name,${order.customer_name || 'N/A'}\n`
      csvContent += `Customer Email,${order.customer_email || 'N/A'}\n`
      csvContent += `Status,${order.status}\n`
      csvContent += `Total Amount,${order.total_amount}\n`
      csvContent += `Payment Method,${order.payment_method || 'N/A'}\n`
      csvContent += `Created At,${formatDate(order.created_at)}\n`
      csvContent += '\n'

      if (order.items && order.items.length > 0) {
        csvContent += 'Order Items\n'
        csvContent += 'Product Name,Price,Quantity,Subtotal,Size,Color\n'
        order.items.forEach(item => {
          csvContent += `"${item.product_name}",${item.product_price},${item.quantity},${item.subtotal},"${item.size || ''}","${item.color || ''}"\n`
        })
      }

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `order-${order.id}-export-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

      alert(`✅ Order #${order.id} exported successfully!\n\nFile: order-${order.id}-export-${new Date().toISOString().split('T')[0]}.csv`)
    } catch (err) {
      console.error('Error exporting order:', err)
      alert(`❌ Error exporting order: ${err.message}`)
    }
  }

  return {
    loadOrders,
    viewOrder,
    editOrder,
    exportOrders,
    performDelete,
    performDuplicate,
    toggleOrderStatus,
    exportSingleOrder
  }
}

export function useOrdersActions(showMoreActions, showConfirmModal, confirmModal, showToast, toastMessage, toastType, statusFilter, searchQuery, performDeleteFn, performDuplicateFn) {
  const applyFilters = () => {
    // Filtering is handled by computed property
  }

  const clearFilters = () => {
    statusFilter.value = ''
    searchQuery.value = ''
  }

  const toggleMoreActions = (orderId) => {
    showMoreActions.value = showMoreActions.value === orderId ? null : orderId
  }

  const showToastMessage = (message, type) => {
    toastMessage.value = message
    toastType.value = type
    showToast.value = true

    setTimeout(() => {
      showToast.value = false
    }, 3000)
  }

  const confirmAction = () => {
    if (confirmModal.value.action) {
      try {
        confirmModal.value.action()
        } catch (error) {
        console.error('❌ Error executing action:', error)
      }
    } else {
      }
    showConfirmModal.value = false
  }

  const deleteOrder = (order) => {
    confirmModal.value = {
      title: 'Delete Order',
      message: `Are you sure you want to delete Order #${order.id}? This action cannot be undone.`,
      confirmText: 'Delete',
      type: 'delete',
      action: () => {
        if (performDeleteFn && performDeleteFn.value) {
          performDeleteFn.value(order)
        } else {
          console.error('❌ performDeleteFn is not available')
        }
      }
    }
    showConfirmModal.value = true
  }

  const duplicateOrder = (order) => {
    confirmModal.value = {
      title: 'Duplicate Order',
      message: `Create a copy of Order #${order.id}?`,
      confirmText: 'Duplicate',
      type: 'info',
      action: () => {
        if (performDuplicateFn && performDuplicateFn.value) {
          performDuplicateFn.value(order)
        } else {
          console.error('❌ performDuplicateFn is not available')
        }
      },
      orderDetails: {
        customer: order.customer_name || order.user?.name || 'N/A',
        total: order.total_amount || order.total || 0,
        items: order.items?.length || order.item_count || 0
      }
    }
    showConfirmModal.value = true
  }

  const handleClickOutside = (event) => {
    if (!event.target.closest('.relative')) {
      showMoreActions.value = null
    }
  }

  return {
    applyFilters,
    clearFilters,
    toggleMoreActions,
    showToastMessage,
    confirmAction,
    deleteOrder,
    duplicateOrder,
    handleClickOutside
  }
}

export function useOrdersUtils() {
  const { formatCurrency: dashboardFormatCurrency, formatDate, getStatusClass } = useAdminDashboard()

  // Local formatCurrency as backup
  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') {
      amount = parseFloat(amount) || 0
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return {
    formatCurrency,
    formatDate,
    getStatusClass
  }
}

export function initializeOrders() {
  return {
    onMounted: (loadOrders, handleClickOutside) => {
      loadOrders()
      document.addEventListener('click', handleClickOutside)
    },
    onUnmounted: (handleClickOutside) => {
      document.removeEventListener('click', handleClickOutside)
    }
  }
}
