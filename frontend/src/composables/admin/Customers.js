// Admin Customers JavaScript Logic
import { ref, computed, onMounted } from 'vue'
import { useAdminDashboard } from '@/composables/useAdminDashboard'

export function useCustomersState() {
  // Customers data
  const customers = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const statusFilter = ref('')
  const searchQuery = ref('')

  return {
    customers,
    isLoading,
    error,
    statusFilter,
    searchQuery
  }
}

export function useCustomersComputed(customers, statusFilter, searchQuery) {
  const totalCustomers = computed(() => customers.value.length)
  const activeCustomers = computed(() => customers.value.filter(customer => customer.status === 'active' || !customer.status).length)
  const newCustomers = computed(() => {
    const thisMonth = new Date()
    thisMonth.setDate(1)
    return customers.value.filter(customer => new Date(customer.created_at) >= thisMonth).length
  })
  const totalOrders = computed(() => customers.value.reduce((sum, customer) => sum + (customer.orders_count || 0), 0))

  const filteredCustomers = computed(() => {
    let filtered = customers.value

    if (statusFilter.value) {
      filtered = filtered.filter(customer => customer.status === statusFilter.value)
    }

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(customer =>
        customer.first_name?.toLowerCase().includes(query) ||
        customer.last_name?.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.id.toString().includes(query)
      )
    }

    return filtered
  })

  return {
    totalCustomers,
    activeCustomers,
    newCustomers,
    totalOrders,
    filteredCustomers
  }
}

export function useCustomersAPI(customers, isLoading, error) {
  const loadCustomers = async () => {
    try {
      isLoading.value = true
      error.value = null

      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')

      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('/api/admin/customers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        customers.value = result.data || []
      } else {
        throw new Error(result.message || 'Failed to fetch customers')
      }
    } catch (err) {
      console.error('Error fetching customers:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const viewCustomer = async (customer) => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')

      const response = await fetch(`/api/admin/users/${customer.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          const customerDetails = result.data

          // Local formatDate function
          const formatDate = (dateString) => {
            if (!dateString) return 'N/A'
            const date = new Date(dateString)
            return date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          }

          const detailsText = `
Customer #${customerDetails.id}
Name: ${customerDetails.first_name} ${customerDetails.last_name}
Email: ${customerDetails.email}
Phone: ${customerDetails.phone || 'N/A'}
Orders: ${customerDetails.orders_count || 0}
Status: ${customerDetails.status || 'active'}
Joined: ${formatDate(customerDetails.created_at)}
          `.trim()

          alert(detailsText)
        }
      } else {
        throw new Error('Failed to load customer details')
      }
    } catch (err) {
      console.error('Error viewing customer:', err)
      alert('Error loading customer details: ' + err.message)
    }
  }

  const editCustomer = async (customer) => {
    const newStatus = prompt('Enter new status (active, inactive, banned):', customer.status || 'active')
    if (newStatus && newStatus !== (customer.status || 'active')) {
      try {
        const token = localStorage.getItem('auth_token') || localStorage.getItem('token')

        const response = await fetch(`/api/admin/users/${customer.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        })

        if (response.ok) {
          await loadCustomers()
          alert(`Customer ${customer.first_name} ${customer.last_name} status updated to ${newStatus}`)
        } else {
          throw new Error('Failed to update customer')
        }
      } catch (err) {
        console.error('Error updating customer:', err)
        alert('Error updating customer: ' + err.message)
      }
    }
  }

  const deleteCustomer = async (customer) => {
    if (confirm(`Are you sure you want to delete customer "${customer.first_name} ${customer.last_name}"?`)) {
      try {
        const token = localStorage.getItem('auth_token') || localStorage.getItem('token')

        const response = await fetch(`/api/admin/users/${customer.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })

        if (response.ok) {
          await loadCustomers()
          alert(`Customer ${customer.first_name} ${customer.last_name} deleted successfully`)
        } else {
          throw new Error('Failed to delete customer')
        }
      } catch (err) {
        console.error('Error deleting customer:', err)
        alert('Error deleting customer: ' + err.message)
      }
    }
  }

  const exportCustomers = async () => {
    try {
      if (customers.value.length === 0) {
        alert('❌ No customers to export!')
        return
      }

      // Local formatDate function
      const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      }

      // Create CSV content
      let csvContent = 'Customers Export\n'
      csvContent += `Export Date,${new Date().toISOString().split('T')[0]}\n`
      csvContent += `Total Customers,${customers.value.length}\n`
      csvContent += '\n'

      // CSV Headers
      csvContent += 'ID,First Name,Last Name,Email,Phone,Status,Total Orders,Total Spent,Joined Date,Last Order Date\n'

      // Add customer rows
      customers.value.forEach(customer => {
        const firstName = (customer.first_name || '').replace(/"/g, '""')
        const lastName = (customer.last_name || '').replace(/"/g, '""')
        const email = customer.email || 'N/A'
        const phone = customer.phone || 'N/A'
        const status = (customer.status || 'active').charAt(0).toUpperCase() + (customer.status || 'active').slice(1)
        const ordersCount = customer.orders_count || 0
        const totalSpent = customer.total_spent || 0
        const joinedDate = formatDate(customer.created_at)
        const lastOrderDate = customer.last_order_date ? formatDate(customer.last_order_date) : 'N/A'

        csvContent += `${customer.id},"${firstName}","${lastName}",${email},${phone},${status},${ordersCount},${totalSpent},${joinedDate},${lastOrderDate}\n`
      })

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `customers-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      alert(`✅ Customers exported successfully!\n\nTotal Customers: ${customers.value.length}\nFile: customers-export-${new Date().toISOString().split('T')[0]}.csv`)
    } catch (err) {
      console.error('Error exporting customers:', err)
      alert(`❌ Error exporting customers: ${err.message}`)
    }
  }

  return {
    loadCustomers,
    viewCustomer,
    editCustomer,
    deleteCustomer,
    exportCustomers
  }
}

export function useCustomersActions() {
  const filterCustomers = () => {
    // Filtering is handled by computed property
  }

  const searchCustomers = () => {
    // Searching is handled by computed property
  }

  return {
    filterCustomers,
    searchCustomers
  }
}

export function useCustomersUtils() {
  const { formatCurrency, formatDate, getStatusClass } = useAdminDashboard()

  return {
    formatCurrency,
    formatDate,
    getStatusClass
  }
}

export function initializeCustomers() {
  return {
    onMounted: (loadCustomers) => {
      loadCustomers()
    }
  }
}
