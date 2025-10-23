// Updated: English version - v2.0
import { ref, computed } from 'vue'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

export function useDiscountCodes() {
  const discountCodes = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Load discount codes
  const loadDiscountCodes = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/admin/discount-codes`,
        {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      discountCodes.value = data.data || []
    } catch (err) {
      console.error('Error loading discount codes:', err)
      error.value = 'Failed to load discount codes'
    } finally {
      loading.value = false
    }
  }

  // Create discount code
  const createDiscountCode = async (codeData) => {
    loading.value = true
    error.value = null

    try {


      const response = await fetch(`${API_BASE_URL}/admin/discount-codes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(codeData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const data = await response.json()

      if (data.success) {
        await loadDiscountCodes()
        return data
      } else {
        throw new Error(data.message || 'Failed to create discount code')
      }
    } catch (err) {
      console.error('Error creating discount code:', err)
      error.value = 'Failed to create discount code'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update discount code
  const updateDiscountCode = async (id, codeData) => {
    loading.value = true
    error.value = null

    try {


      const response = await fetch(`${API_BASE_URL}/admin/discount-codes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(codeData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        await loadDiscountCodes()
        return data
      } else {
        throw new Error(data.message || 'Failed to update discount code')
      }
    } catch (err) {
      console.error('Error updating discount code:', err)
      error.value = 'Failed to update discount code'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete discount code
  const deleteDiscountCode = async (id) => {
    loading.value = true
    error.value = null

    try {


      const response = await fetch(`${API_BASE_URL}/admin/discount-codes/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        await loadDiscountCodes()
        return data
      } else {
        throw new Error(data.message || 'Failed to delete discount code')
      }
    } catch (err) {
      console.error('Error deleting discount code:', err)
      error.value = 'Failed to delete discount code'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Validate discount code
  const validateDiscountCode = async (code, totalAmount, productIds = [], categoryIds = []) => {
    try {
      const response = await fetch(`${API_BASE_URL}/discount-codes/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          code,
          total_amount: totalAmount,
          product_ids: productIds,
          category_ids: categoryIds
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (err) {
      console.error('Error validating discount code:', err)
      throw err
    }
  }

  // Apply discount code
  const applyDiscountCode = async (code, totalAmount, productIds = [], categoryIds = []) => {
    try {
      const response = await fetch(`${API_BASE_URL}/discount-codes/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          code,
          total_amount: totalAmount,
          product_ids: productIds,
          category_ids: categoryIds
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (err) {
      console.error('Error applying discount code:', err)
      throw err
    }
  }

  // Computed properties
  const stats = computed(() => {
    const codes = discountCodes.value
    return {
      totalCodes: codes.length,
      activeCodes: codes.filter(c => c.is_active && !isExpired(c)).length,
      totalUsage: codes.reduce((sum, c) => sum + c.used_count, 0),
      expiredCodes: codes.filter(c => isExpired(c)).length
    }
  })

  // Helper functions
  const isExpired = (code) => {
    if (!code.expires_at) return false
    return new Date(code.expires_at) < new Date()
  }

  const getStatusClass = (code) => {
    if (!code.is_active) return 'inactive'
    if (isExpired(code)) return 'expired'
    return 'active'
  }

  const getStatusText = (code) => {
    if (!code.is_active) return 'غير نشط'
    if (isExpired(code)) return 'منتهي'
    return 'نشط'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA')
  }

  return {
    discountCodes,
    loading,
    error,
    stats,
    loadDiscountCodes,
    createDiscountCode,
    updateDiscountCode,
    deleteDiscountCode,
    validateDiscountCode,
    applyDiscountCode,
    isExpired,
    getStatusClass,
    getStatusText,
    formatDate
  }
}
