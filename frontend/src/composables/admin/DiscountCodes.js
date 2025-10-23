// Discount Codes JavaScript Logic
import { ref, reactive, computed, onMounted } from 'vue'

export function useDiscountCodesState() {
  // Modal state
  const isModalOpen = ref(false)
  const isEditMode = ref(false)
  const currentCode = reactive({
    id: null,
    code: '',
    name: '',
    description: '',
    type: 'percentage',
    value: 10,
    minimum_amount: 0,
    usage_limit: 100,
    starts_at: '',
    expires_at: '',
    is_active: true
  })
  const modalError = ref('')

  // Confirmation modal state
  const showConfirmModal = ref(false)
  const codeToDelete = ref(null)

  // Toast notification state
  const showToast = ref(false)
  const toastMessage = ref('')
  const toastType = ref('success')

  // Filter state
  const searchQuery = ref('')
  const filterStatus = ref('')
  const filterType = ref('')

  // Data state
  const discountCodes = ref([])
  const loading = ref(false)
  const error = ref('')

  return {
    isModalOpen,
    isEditMode,
    currentCode,
    modalError,
    showConfirmModal,
    codeToDelete,
    showToast,
    toastMessage,
    toastType,
    searchQuery,
    filterStatus,
    filterType,
    discountCodes,
    loading,
    error
  }
}

export function useDiscountCodesComputed(discountCodes, searchQuery, filterStatus, filterType) {
  const filteredDiscountCodes = computed(() => {
    let filtered = discountCodes.value || []

    // Search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(code =>
        code.name?.toLowerCase().includes(query) ||
        code.code?.toLowerCase().includes(query) ||
        code.description?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (filterStatus.value) {
      filtered = filtered.filter(code => {
        if (filterStatus.value === 'active') return code.is_active
        if (filterStatus.value === 'inactive') return !code.is_active
        if (filterStatus.value === 'expired') {
          const now = new Date()
          const expiresAt = code.expires_at ? new Date(code.expires_at) : null
          return expiresAt && expiresAt <= now
        }
        return true
      })
    }

    // Type filter
    if (filterType.value) {
      filtered = filtered.filter(code => code.type === filterType.value)
    }

    return filtered
  })

  const totalCodes = computed(() => discountCodes.value?.length || 0)
  const activeCodes = computed(() => discountCodes.value?.filter(code => code.is_active).length || 0)
  const expiredCodes = computed(() => {
    const now = new Date()
    return discountCodes.value?.filter(code => {
      const expiresAt = code.expires_at ? new Date(code.expires_at) : null
      return expiresAt && expiresAt <= now
    }).length || 0
  })

  return {
    filteredDiscountCodes,
    totalCodes,
    activeCodes,
    expiredCodes
  }
}

export function useDiscountCodesAPI(discountCodes, loading, error) {
  const loadDiscountCodes = async () => {
    try {
      loading.value = true
      error.value = null

      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')

      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('http://127.0.0.1:8000/api/admin/discount-codes', {
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
        discountCodes.value = result.data || []
      } else {
        throw new Error(result.message || 'Failed to fetch discount codes')
      }
    } catch (err) {
      console.error('Error fetching discount codes:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const createDiscountCode = async (codeData) => {
    try {
      loading.value = true
      error.value = null

      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')

      const response = await fetch('http://127.0.0.1:8000/api/admin/discount-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(codeData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        await loadDiscountCodes() // Reload discount codes
        return result.data
      } else {
        throw new Error(result.message || 'Failed to create discount code')
      }
    } catch (err) {
      console.error('Error creating discount code:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateDiscountCode = async (codeId, codeData) => {
    try {
      loading.value = true
      error.value = null

      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')

      const response = await fetch(`http://127.0.0.1:8000/api/admin/discount-codes/${codeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(codeData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        await loadDiscountCodes() // Reload discount codes
        return result.data
      } else {
        throw new Error(result.message || 'Failed to update discount code')
      }
    } catch (err) {
      console.error('Error updating discount code:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteDiscountCodeAPI = async (codeId) => {
    try {
      loading.value = true
      error.value = null

      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')

      const response = await fetch(`http://127.0.0.1:8000/api/admin/discount-codes/${codeId}`, {
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
        await loadDiscountCodes() // Reload discount codes
        return true
      } else {
        throw new Error(result.message || 'Failed to delete discount code')
      }
    } catch (err) {
      console.error('Error deleting discount code:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loadDiscountCodes,
    createDiscountCode,
    updateDiscountCode,
    deleteDiscountCodeAPI
  }
}

export function useDiscountCodesActions() {
  const openCreateModal = (isModalOpen, isEditMode, currentCode, modalError) => {
    isEditMode.value = false
    currentCode.id = null
    currentCode.code = ''
    currentCode.name = ''
    currentCode.description = ''
    currentCode.type = 'percentage'
    currentCode.value = 10
    currentCode.minimum_amount = 0
    currentCode.usage_limit = 100
    currentCode.starts_at = ''
    currentCode.expires_at = ''
    currentCode.is_active = true
    modalError.value = ''
    isModalOpen.value = true
  }

  const openEditModal = (code, isModalOpen, isEditMode, currentCode, modalError) => {
    isEditMode.value = true
    currentCode.id = code.id
    currentCode.code = code.code
    currentCode.name = code.name
    currentCode.description = code.description || ''
    currentCode.type = code.type
    currentCode.value = code.value
    currentCode.minimum_amount = code.minimum_amount || 0
    currentCode.usage_limit = code.usage_limit || 100
    currentCode.starts_at = code.starts_at ? new Date(code.starts_at).toISOString().slice(0, 16) : ''
    currentCode.expires_at = code.expires_at ? new Date(code.expires_at).toISOString().slice(0, 16) : ''
    currentCode.is_active = code.is_active
    modalError.value = ''
    isModalOpen.value = true
  }

  const openViewModal = (code, isModalOpen, isEditMode, currentCode, modalError) => {
    // For now, just open edit modal in read-only mode
    openEditModal(code, isModalOpen, isEditMode, currentCode, modalError)
  }

  const closeModal = (isModalOpen, modalError) => {
    isModalOpen.value = false
    modalError.value = ''
  }

  const deleteDiscountCode = (id, codeToDelete, showConfirmModal) => {
    codeToDelete.value = id
    showConfirmModal.value = true
  }

  const confirmDelete = async (codeToDelete, discountCodes, showConfirmModal, showToastMessage, deleteDiscountCodeAPI) => {
    try {
      await deleteDiscountCodeAPI(codeToDelete.value)

      // Remove from local data
      const index = discountCodes.value.findIndex(c => c.id === codeToDelete.value)
      if (index !== -1) {
        discountCodes.value.splice(index, 1)
      }

      showToastMessage('Discount code deleted successfully!', 'success')
      showConfirmModal.value = false
      codeToDelete.value = null
    } catch (err) {
      showToastMessage('Failed to delete discount code: ' + err.message, 'error')
    }
  }

  const cancelDelete = (showConfirmModal, codeToDelete) => {
    showConfirmModal.value = false
    codeToDelete.value = null
  }

  const copyCode = async (code, showToastMessage) => {
    try {
      await navigator.clipboard.writeText(code)
      showToastMessage('Code copied to clipboard!', 'success')
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = code
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      showToastMessage('Code copied to clipboard!', 'success')
    }
  }

  const showToastMessage = (message, type, toastMessage, toastType, showToast) => {
    toastMessage.value = message
    toastType.value = type
    showToast.value = true

    // Auto hide after 3 seconds
    setTimeout(() => {
      showToast.value = false
    }, 3000)
  }

  return {
    openCreateModal,
    openEditModal,
    openViewModal,
    closeModal,
    deleteDiscountCode,
    confirmDelete,
    cancelDelete,
    copyCode,
    showToastMessage
  }
}

export function useDiscountCodesUtils() {
  const getStatusClass = (code) => {
    const now = new Date()
    const expiresAt = code.expires_at ? new Date(code.expires_at) : null

    if (!code.is_active) {
      return 'status-inactive'
    }

    if (expiresAt && expiresAt <= now) {
      return 'status-expired'
    }

    return 'status-active'
  }

  const formatCurrency = (amount) => {
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
      day: 'numeric'
    })
  }

  return {
    getStatusClass,
    formatCurrency,
    formatDate
  }
}
