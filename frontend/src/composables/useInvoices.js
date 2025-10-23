import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

export function useInvoices() {
  const authStore = useAuthStore()

  // Reactive state
  const invoices = ref([])
  const currentInvoice = ref(null)
  const statistics = ref({
    total_invoices: 0,
    paid_invoices: 0,
    unpaid_invoices: 0,
    overdue_invoices: 0,
    total_amount: 0,
    paid_amount: 0,
    unpaid_amount: 0
  })
  const loading = ref(false)
  const error = ref(null)

  // Computed properties
  const paidInvoices = computed(() =>
    invoices.value.filter(invoice => invoice.status === 'paid')
  )

  const unpaidInvoices = computed(() =>
    invoices.value.filter(invoice => ['draft', 'sent'].includes(invoice.status))
  )

  const overdueInvoices = computed(() =>
    invoices.value.filter(invoice => {
      if (invoice.status === 'paid') return false
      if (!invoice.due_date) return false
      return new Date(invoice.due_date) < new Date()
    })
  )

  // API methods
  const fetchInvoices = async (params = {}) => {
    try {
      loading.value = true
      error.value = null

      const queryParams = new URLSearchParams({
        page: params.page || 1,
        per_page: params.perPage || 20,
        ...(params.status && { status: params.status }),
        ...(params.type && { type: params.type })
      })

      const fullUrl = `${API_BASE_URL}/invoices?${queryParams}`
      // Get token from authStore or localStorage as fallback
      const token = authStore.token || localStorage.getItem('auth_token')
      + '...' : 'null')
      
      if (!token) {
        error.value = 'No authentication token found. Please login.'
        throw new Error('No authentication token found')
      }

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      ,
        hasDataData: !!(result.data && result.data.data),
        dataDataLength: result.data?.data?.length || 0
      })

      if (result.success) {
        // Handle paginated response
        const invoiceData = result.data.data || result.data || []
        invoices.value = invoiceData
        return result.data
      } else {
        throw new Error(result.message || 'Failed to fetch invoices')
      }
    } catch (err) {
      error.value = err.message
      console.error('Error fetching invoices:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchInvoice = async (invoiceId) => {
    try {
      loading.value = true
      error.value = null

      const token = authStore.token || localStorage.getItem('auth_token')
      const fullUrl = `${API_BASE_URL}/invoices/${invoiceId}`
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: headers
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      if (result.success) {
        currentInvoice.value = result.data
        return result.data
      } else {
        throw new Error(result.message || 'Failed to fetch invoice')
      }
    } catch (err) {
      error.value = err.message
      console.error('Error fetching invoice:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createInvoice = async (invoiceData) => {
    try {
      loading.value = true
      error.value = null

      const token = authStore.token || localStorage.getItem('auth_token')
      const response = await fetch(`${API_BASE_URL}/invoices/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoiceData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        // Add to local state
        invoices.value.unshift(result.data)
        return result.data
      } else {
        throw new Error(result.message || 'Failed to create invoice')
      }
    } catch (err) {
      error.value = err.message
      console.error('Error creating invoice:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createInvoiceFromOrder = async (orderId) => {
    try {
      loading.value = true
      error.value = null

      const token = authStore.token || localStorage.getItem('auth_token')
      const response = await fetch(`${API_BASE_URL}/invoices/from-order/${orderId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        // Add to local state
        invoices.value.unshift(result.data)
        return result.data
      } else {
        throw new Error(result.message || 'Failed to create invoice from order')
      }
    } catch (err) {
      error.value = err.message
      console.error('Error creating invoice from order:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const markAsPaid = async (invoiceId) => {
    try {
      const token = authStore.token || localStorage.getItem('auth_token')
      const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/paid`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        // Update local state
        const invoice = invoices.value.find(inv => inv.id === invoiceId)
        if (invoice) {
          invoice.status = 'paid'
          invoice.paid_at = new Date().toISOString()
        }

        if (currentInvoice.value && currentInvoice.value.id === invoiceId) {
          currentInvoice.value.status = 'paid'
          currentInvoice.value.paid_at = new Date().toISOString()
        }

        await fetchStatistics()
        return true
      } else {
        throw new Error(result.message || 'Failed to mark invoice as paid')
      }
    } catch (err) {
      error.value = err.message
      console.error('Error marking invoice as paid:', err)
      throw err
    }
  }

  const deleteInvoice = async (invoiceId) => {
    try {
      const token = authStore.token || localStorage.getItem('auth_token')
      const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        // Remove from local state
        invoices.value = invoices.value.filter(inv => inv.id !== invoiceId)
        if (currentInvoice.value && currentInvoice.value.id === invoiceId) {
          currentInvoice.value = null
        }
        await fetchStatistics()
        return true
      } else {
        throw new Error(result.message || 'Failed to delete invoice')
      }
    } catch (err) {
      error.value = err.message
      console.error('Error deleting invoice:', err)
      throw err
    }
  }

  const fetchStatistics = async () => {
    try {
      const token = authStore.token || localStorage.getItem('auth_token')
      const fullUrl = `${API_BASE_URL}/invoices/statistics`
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: headers
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      if (result.success) {
        statistics.value = result.data
        return result.data
      } else {
        throw new Error(result.message || 'Failed to fetch statistics')
      }
    } catch (err) {
      console.error('Error fetching invoice statistics:', err)
      return statistics.value
    }
  }

  const downloadInvoice = async (invoiceId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        return result.data
      } else {
        throw new Error(result.message || 'Failed to download invoice')
      }
    } catch (err) {
      error.value = err.message
      console.error('Error downloading invoice:', err)
      throw err
    }
  }

  const exportInvoices = () => {
    try {
      if (!invoices.value || invoices.value.length === 0) {
        alert('❌ No invoices to export!')
        return
      }

      // Create CSV content
      let csvContent = 'Invoices Export\n'
      csvContent += `Export Date,${new Date().toISOString().split('T')[0]}\n`
      csvContent += `Total Invoices,${invoices.value.length}\n`
      csvContent += '\n'

      // CSV Headers
      csvContent += 'Invoice Number,Customer Name,Customer Email,Issue Date,Due Date,Status,Amount,Amount Paid,Balance,Type,Notes\n'

      // Add invoice rows
      invoices.value.forEach(invoice => {
        const invoiceNumber = invoice.invoice_number || 'N/A'
        const customerName = (invoice.customer_name || '').replace(/"/g, '""')
        const customerEmail = invoice.customer_email || 'N/A'
        const issueDate = invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString() : 'N/A'
        const dueDate = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'
        const status = (invoice.status || 'pending').charAt(0).toUpperCase() + (invoice.status || 'pending').slice(1)
        const amount = invoice.amount || 0
        const amountPaid = invoice.amount_paid || 0
        const balance = amount - amountPaid
        const type = (invoice.type || 'standard').charAt(0).toUpperCase() + (invoice.type || 'standard').slice(1)
        const notes = (invoice.notes || '').replace(/"/g, '""').replace(/\n/g, ' ')

        csvContent += `${invoiceNumber},"${customerName}",${customerEmail},${issueDate},${dueDate},${status},${amount},${amountPaid},${balance},${type},"${notes}"\n`
      })

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoices-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      alert(`✅ Invoices exported successfully!\n\nTotal Invoices: ${invoices.value.length}\nFile: invoices-export-${new Date().toISOString().split('T')[0]}.csv`)
    } catch (err) {
      console.error('Error exporting invoices:', err)
      alert(`❌ Error exporting invoices: ${err.message}`)
    }
  }

  // Utility methods
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      draft: 'gray',
      pending: 'yellow',
      sent: 'blue',
      paid: 'green',
      cancelled: 'red'
    }
    return colors[status] || 'gray'
  }

  const getStatusText = (status) => {
    const texts = {
      draft: 'Draft',
      pending: 'Pending',
      sent: 'Sent',
      paid: 'Paid',
      cancelled: 'Cancelled'
    }
    return texts[status] || status
  }

  const getTypeText = (type) => {
    const texts = {
      sale: 'Sale Invoice',
      return: 'Return Invoice',
      partial: 'Partial Invoice',
      supplier: 'Supplier Invoice',
      expense: 'Expense Invoice'
    }
    return texts[type] || type
  }

  // Initialize
  const initialize = async () => {
    if (authStore.isAuthenticated) {
      await Promise.all([
        fetchInvoices(),
        fetchStatistics()
      ])
    }
  }

  return {
    // State
    invoices,
    currentInvoice,
    statistics,
    loading,
    error,

    // Computed
    paidInvoices,
    unpaidInvoices,
    overdueInvoices,

    // Methods
    fetchInvoices,
    fetchInvoice,
    createInvoice,
    createInvoiceFromOrder,
    markAsPaid,
    deleteInvoice,
    fetchStatistics,
    downloadInvoice,
    exportInvoices,

    // Utilities
    formatCurrency,
    formatDate,
    getStatusColor,
    getStatusText,
    getTypeText,
    initialize
  }
}
