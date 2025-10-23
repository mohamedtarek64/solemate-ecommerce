import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import advancedCache from '@/utils/advancedCache'
import performanceMonitorEnhanced from '@/utils/performanceMonitorEnhanced'
import globalErrorHandler from '@/utils/globalErrorHandler'

export function useCheckoutOptimization() {
  const router = useRouter()
  
  // Performance monitoring
  const performanceStats = ref({
    pageLoadTime: 0,
    cartLoadTime: 0,
    orderProcessingTime: 0,
    paymentProcessingTime: 0,
    totalCheckoutTime: 0
  })

  // Cache configurations
  const cacheConfig = {
    cart: { ttl: 5 * 60 * 1000 }, // 5 minutes
    shippingMethods: { ttl: 30 * 60 * 1000 }, // 30 minutes
    paymentMethods: { ttl: 60 * 60 * 1000 }, // 1 hour
    userData: { ttl: 15 * 60 * 1000 }, // 15 minutes
    orderSummary: { ttl: 2 * 60 * 1000 } // 2 minutes
  }

  // Optimized cart loading
  const loadCartOptimized = async (userId) => {
    const cacheKey = `cart_${userId}`
    const startTime = Date.now()
    
    try {
      // Try cache first
      const cachedCart = await advancedCache.get(cacheKey)
      if (cachedCart) {
        performanceStats.value.cartLoadTime = Date.now() - startTime
        return cachedCart
      }

      // Load from API
      const response = await fetch(`http://127.0.0.1:8000/api/cart/?user_id=${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const cartData = await response.json()
      
      // Cache the result
      await advancedCache.set(cacheKey, cartData, cacheConfig.cart.ttl)
      
      performanceStats.value.cartLoadTime = Date.now() - startTime
      return cartData
    } catch (error) {
      console.error('❌ Error loading cart:', error)
      globalErrorHandler.handleError(error, { context: 'checkout-cart-load' })
      throw error
    }
  }

  // Optimized shipping methods loading
  const loadShippingMethodsOptimized = async () => {
    const cacheKey = 'shipping_methods'
    
    try {
      // Try cache first
      const cachedMethods = await advancedCache.get(cacheKey)
      if (cachedMethods) {
        return cachedMethods
      }

      // Mock shipping methods (in real app, this would be an API call)
      const shippingMethods = [
        { id: 'standard', name: 'Standard Shipping', cost: 10, estimatedDays: '5-7' },
        { id: 'express', name: 'Express Shipping', cost: 20, estimatedDays: '2-3' },
        { id: 'overnight', name: 'Overnight Shipping', cost: 35, estimatedDays: '1' }
      ]

      // Cache the result
      await advancedCache.set(cacheKey, shippingMethods, cacheConfig.shippingMethods.ttl)
      
      return shippingMethods
    } catch (error) {
      console.error('❌ Error loading shipping methods:', error)
      globalErrorHandler.handleError(error, { context: 'checkout-shipping-load' })
      throw error
    }
  }

  // Optimized user data loading
  const loadUserDataOptimized = async () => {
    const cacheKey = 'user_profile'
    
    try {
      // Try cache first
      const cachedUser = await advancedCache.get(cacheKey)
      if (cachedUser) {
        return cachedUser
      }

      // Load from API
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      if (!token) {
        console.warn('⚠️ No authentication token found')
        return null
      }

      const response = await fetch('http://127.0.0.1:8000/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        console.warn(`⚠️ User API returned status: ${response.status}`)
        return null
      }

      const userData = await response.json()
      
      // Cache the result
      await advancedCache.set(cacheKey, userData, cacheConfig.userData.ttl)
      
      return userData
    } catch (error) {
      console.warn('⚠️ Could not load user data:', error.message)
      // Don't throw error, just return null for graceful degradation
      return null
    }
  }

  // Optimized order processing
  const processOrderOptimized = async (orderData) => {
    const startTime = Date.now()
    
    try {
      // Optimistic UI update
      const response = await fetch('http://127.0.0.1:8000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        // Clear related caches
        await clearCheckoutCaches()
        
        performanceStats.value.orderProcessingTime = Date.now() - startTime
        return result
      } else {
        throw new Error(result.message || 'Failed to create order')
      }
    } catch (error) {
      console.error('❌ Error processing order:', error)
      globalErrorHandler.handleError(error, { context: 'checkout-order-process' })
      throw error
    }
  }

  // Optimized payment processing
  const processPaymentOptimized = async (paymentData) => {
    const startTime = Date.now()
    
    try {
      // This would integrate with your payment service
      const response = await fetch('http://127.0.0.1:8000/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(paymentData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      performanceStats.value.paymentProcessingTime = Date.now() - startTime
      return result
    } catch (error) {
      console.error('❌ Error processing payment:', error)
      globalErrorHandler.handleError(error, { context: 'checkout-payment-process' })
      throw error
    }
  }

  // Clear checkout-related caches
  const clearCheckoutCaches = async () => {
    try {
      const userId = localStorage.getItem('user_id')
      await Promise.all([
        advancedCache.delete(`cart_${userId}`),
        advancedCache.delete('user_profile'),
        advancedCache.delete('order_summary'),
        advancedCache.delete('shipping_methods')
      ])
      } catch (error) {
      console.warn('⚠️ Error clearing checkout caches:', error)
    }
  }

  // Preload critical data
  const preloadCheckoutData = async (userId) => {
    const startTime = Date.now()
    
    try {
      // Preload in parallel
      const [cartData, userData, shippingMethods] = await Promise.allSettled([
        loadCartOptimized(userId),
        loadUserDataOptimized(),
        loadShippingMethodsOptimized()
      ])

      // Handle results
      const results = {
        cart: cartData.status === 'fulfilled' ? cartData.value : null,
        user: userData.status === 'fulfilled' ? userData.value : null,
        shippingMethods: shippingMethods.status === 'fulfilled' ? shippingMethods.value : []
      }

      performanceStats.value.pageLoadTime = Date.now() - startTime
      return results
    } catch (error) {
      console.error('❌ Error preloading checkout data:', error)
      globalErrorHandler.handleError(error, { context: 'checkout-preload' })
      throw error
    }
  }

  // Optimized cart clearing
  const clearCartOptimized = async (userId) => {
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/cart/clear?user_id=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      // Clear cart cache
      await advancedCache.delete(`cart_${userId}`)
      
      return result
    } catch (error) {
      console.error('❌ Error clearing cart:', error)
      globalErrorHandler.handleError(error, { context: 'checkout-cart-clear' })
      throw error
    }
  }

  // Computed performance metrics
  const performanceMetrics = computed(() => ({
    totalCheckoutTime: performanceStats.value.pageLoadTime + 
                      performanceStats.value.cartLoadTime + 
                      performanceStats.value.orderProcessingTime + 
                      performanceStats.value.paymentProcessingTime,
    averageLoadTime: (performanceStats.value.pageLoadTime + performanceStats.value.cartLoadTime) / 2,
    cacheHitRate: advancedCache.getStats().hitRate,
    memoryUsage: advancedCache.getStats().memorySize
  }))

  return {
    // Performance stats
    performanceStats,
    performanceMetrics,
    
    // Optimized methods
    loadCartOptimized,
    loadShippingMethodsOptimized,
    loadUserDataOptimized,
    processOrderOptimized,
    processPaymentOptimized,
    preloadCheckoutData,
    clearCartOptimized,
    clearCheckoutCaches,
    
    // Cache management
    cacheConfig
  }
}
