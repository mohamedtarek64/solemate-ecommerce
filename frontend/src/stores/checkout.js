import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { checkoutService } from '@/services/checkoutService'

export const useCheckoutStore = defineStore('checkout', () => {
  // State
  const cart = ref(null)
  const addresses = ref([])
  const shippingMethods = ref([])
  const paymentMethods = ref([])
  const selectedShippingAddress = ref(null)
  const selectedShippingMethod = ref(null)
  const selectedPaymentMethod = ref(null)
  const orderTotals = ref({
    subtotal: 0,
    shipping: 0,
    tax: 0,
    discount: 0,
    total: 0
  })
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const hasValidShippingAddress = computed(() => !!selectedShippingAddress.value)
  const hasValidShippingMethod = computed(() => !!selectedShippingMethod.value)
  const hasValidPaymentMethod = computed(() => !!selectedPaymentMethod.value)
  const isCheckoutValid = computed(() => 
    hasValidShippingAddress.value && 
    hasValidShippingMethod.value && 
    hasValidPaymentMethod.value
  )

  // Actions
  const getCheckoutData = async () => {
    try {
      loading.value = true
      error.value = null
      
      const response = await checkoutService.getCheckoutData()
      
      if (response.success) {
        cart.value = response.data.cart
        addresses.value = response.data.addresses
        shippingMethods.value = response.data.shipping_methods
        paymentMethods.value = response.data.payment_methods
        
        // Set default selections
        if (addresses.value.length > 0) {
          selectedShippingAddress.value = addresses.value[0]
        }
        
        return response
      } else {
        throw new Error(response.message || 'Failed to load checkout data')
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const calculateTotals = async (data) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await checkoutService.calculateTotals(data)
      
      if (response.success) {
        orderTotals.value = {
          subtotal: response.data.subtotal,
          shipping: response.data.shipping_cost,
          tax: response.data.tax_amount,
          discount: response.data.discount_amount,
          total: response.data.total
        }
        
        return response
      } else {
        throw new Error(response.message || 'Failed to calculate totals')
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const processOrder = async (orderData) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await checkoutService.processOrder(orderData)
      
      if (response.success) {
        // Clear checkout data after successful order
        clearCheckoutData()
        
        return response
      } else {
        throw new Error(response.message || 'Failed to process order')
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const getShippingMethods = async (locationData) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await checkoutService.getShippingMethods(locationData)
      
      if (response.success) {
        shippingMethods.value = response.data
        return response
      } else {
        throw new Error(response.message || 'Failed to load shipping methods')
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const validateCoupon = async (couponCode) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await checkoutService.validateCoupon(couponCode)
      
      if (response.success) {
        return response
      } else {
        throw new Error(response.message || 'Invalid coupon code')
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createAddress = async (addressData) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await checkoutService.createAddress(addressData)
      
      if (response.success) {
        addresses.value.push(response.data)
        return response
      } else {
        throw new Error(response.message || 'Failed to create address')
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateAddress = async (addressId, addressData) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await checkoutService.updateAddress(addressId, addressData)
      
      if (response.success) {
        const index = addresses.value.findIndex(addr => addr.id === addressId)
        if (index !== -1) {
          addresses.value[index] = response.data
        }
        return response
      } else {
        throw new Error(response.message || 'Failed to update address')
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteAddress = async (addressId) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await checkoutService.deleteAddress(addressId)
      
      if (response.success) {
        addresses.value = addresses.value.filter(addr => addr.id !== addressId)
        
        // If deleted address was selected, clear selection
        if (selectedShippingAddress.value?.id === addressId) {
          selectedShippingAddress.value = null
        }
        
        return response
      } else {
        throw new Error(response.message || 'Failed to delete address')
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const selectShippingAddress = (address) => {
    selectedShippingAddress.value = address
  }

  const selectShippingMethod = (method) => {
    selectedShippingMethod.value = method
  }

  const selectPaymentMethod = (method) => {
    selectedPaymentMethod.value = method
  }

  const clearCheckoutData = () => {
    cart.value = null
    addresses.value = []
    shippingMethods.value = []
    paymentMethods.value = []
    selectedShippingAddress.value = null
    selectedShippingMethod.value = null
    selectedPaymentMethod.value = null
    orderTotals.value = {
      subtotal: 0,
      shipping: 0,
      tax: 0,
      discount: 0,
      total: 0
    }
    error.value = null
  }

  const reset = () => {
    clearCheckoutData()
    loading.value = false
  }

  return {
    // State
    cart,
    addresses,
    shippingMethods,
    paymentMethods,
    selectedShippingAddress,
    selectedShippingMethod,
    selectedPaymentMethod,
    orderTotals,
    loading,
    error,
    
    // Getters
    hasValidShippingAddress,
    hasValidShippingMethod,
    hasValidPaymentMethod,
    isCheckoutValid,
    
    // Actions
    getCheckoutData,
    calculateTotals,
    processOrder,
    getShippingMethods,
    validateCoupon,
    createAddress,
    updateAddress,
    deleteAddress,
    selectShippingAddress,
    selectShippingMethod,
    selectPaymentMethod,
    clearCheckoutData,
    reset
  }
})
