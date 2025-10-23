import { ref } from 'vue'

export function useProductActions() {
  // UI States
  const showMoreActions = ref(null)
  const showConfirmModal = ref(false)
  const confirmModal = ref({
    title: '',
    message: '',
    confirmText: '',
    type: '',
    action: null
  })
  const showToast = ref(false)
  const toastMessage = ref('')
  const toastType = ref('success')

  // UI Functions
  const toggleMoreActions = (productId) => {
    showMoreActions.value = showMoreActions.value === productId ? null : productId
  }

  const showToastMessage = (message, type = 'success') => {
    toastMessage.value = message
    toastType.value = type
    showToast.value = true

    // Auto hide after 3 seconds
    setTimeout(() => {
      showToast.value = false
    }, 3000)
  }

  const confirmAction = () => {
    if (confirmModal.value.action) {
      confirmModal.value.action()
    }
    showConfirmModal.value = false
  }

  // Product Actions
  const deleteProduct = (product, performDelete) => {
    confirmModal.value = {
      title: 'Delete Product',
      message: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      type: 'delete',
      action: () => performDelete(product)
    }
    showConfirmModal.value = true
  }

  const duplicateProduct = (product, performDuplicate) => {
    confirmModal.value = {
      title: 'Duplicate Product',
      message: `Are you sure you want to duplicate "${product.name}"? This will create a copy of the product.`,
      confirmText: 'Duplicate',
      type: 'info',
      action: () => performDuplicate(product)
    }
    showConfirmModal.value = true
  }

  const toggleProductStatus = async (product, loadProducts) => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      const newStatus = product.status === 'active' ? 'inactive' : 'active'

      const response = await fetch(`http://127.0.0.1:8000/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        await loadProducts()
        showToastMessage(`Product ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`, 'success')
      } else {
        throw new Error('Failed to update product status')
      }
    } catch (err) {
      console.error('Error updating product status:', err)
      showToastMessage('Error updating product status: ' + err.message, 'error')
    } finally {
      showMoreActions.value = null
    }
  }

  const exportSingleProduct = async (product) => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')

      const response = await fetch(`http://127.0.0.1:8000/api/admin/products/${product.id}/export`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${product.name}-export-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        showToastMessage('Product exported successfully!', 'success')
      } else {
        throw new Error('Failed to export product')
      }
    } catch (err) {
      console.error('Error exporting product:', err)
      showToastMessage('Error exporting product: ' + err.message, 'error')
    } finally {
      showMoreActions.value = null
    }
  }

  // Close dropdown when clicking outside
  const handleClickOutside = (event) => {
    if (showMoreActions.value && !event.target.closest('.relative')) {
      showMoreActions.value = null
    }
  }

  return {
    // States
    showMoreActions,
    showConfirmModal,
    confirmModal,
    showToast,
    toastMessage,
    toastType,

    // Functions
    toggleMoreActions,
    showToastMessage,
    confirmAction,
    deleteProduct,
    duplicateProduct,
    toggleProductStatus,
    exportSingleProduct,
    handleClickOutside
  }
}
