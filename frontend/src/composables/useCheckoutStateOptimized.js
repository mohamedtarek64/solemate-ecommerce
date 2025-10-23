import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import advancedCache from '@/utils/advancedCache'
import performanceMonitorEnhanced from '@/utils/performanceMonitorEnhanced'
import globalErrorHandler from '@/utils/globalErrorHandler'
import { calculateOrderSummary, calculateShippingCost } from '@/utils/orderCalculations'

export function useCheckoutStateOptimized() {
  const router = useRouter()
  // const cartStore = useCartStore() // ❌ Moved to functions to avoid Pinia timing issues

  // Checkout state
  const currentStep = ref(1)
  const isLoading = ref(false)
  const isProcessing = ref(false)
  
  // Form data
  const shippingData = ref({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'US'
  })

  const paymentData = ref({
    method: 'stripe',
    customerName: '',
    customerEmail: ''
  })

  // Cart and order data
  const cartItems = ref([])
  const shippingCost = ref(0)
  const discountAmount = ref(0)
  const orderSummary = ref({
    subtotal: 0,
    shipping: 0,
    tax: 0,
    discount: 0,
    total: 0
  })

  // User data
  const user = ref(null)
  const isAuthenticated = ref(false)

  // Performance tracking
  const performanceMetrics = ref({
    stepTransitions: [],
    formSaves: 0,
    cacheHits: 0,
    apiCalls: 0
  })

  // Auto-save functionality
  const autoSaveEnabled = ref(true)
  const lastSaveTime = ref(0)
  const saveInterval = 30000 // 30 seconds

  // Initialize checkout state
  const initializeCheckout = async () => {
    const startTime = Date.now()
    
    try {
      // Load user data
      await loadUserData()
      
      // Pre-fill shipping data if user is authenticated
      if (user.value) {
        prefillShippingData()
      }
      
      // Load cart items
      await loadCartItems()
      
      // Calculate order summary (with safety check)
      calculateOrderSummaryFunc()
      
      // Start auto-save
      if (autoSaveEnabled.value) {
        startAutoSave()
      }
      
      const initTime = Date.now() - startTime
      } catch (error) {
      console.error('❌ Error initializing checkout:', error)
      globalErrorHandler.handleError(error, { context: 'checkout-init' })
      
      // Set safe defaults on error
      cartItems.value = []
      orderSummary.value = {
        subtotal: 0,
        shipping: 0,
        tax: 0,
        discount: 0,
        total: 0
      }
      
      throw error
    }
  }

  // Load user data
  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      if (!token) {
        console.warn('⚠️ No authentication token found')
        isAuthenticated.value = false
        return
      }

      // Try cache first
      const cachedUser = await advancedCache.get('user_profile')
      if (cachedUser) {
        user.value = cachedUser.data?.user || cachedUser.user
        isAuthenticated.value = true
        performanceMetrics.value.cacheHits++
        return
      }

      // Load from API
      const response = await fetch('http://127.0.0.1:8000/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        const userData = await response.json()
        user.value = userData.data?.user || userData.user
        isAuthenticated.value = true
        
        // Cache user data
        await advancedCache.set('user_profile', userData, 15 * 60 * 1000)
        performanceMetrics.value.apiCalls++
        } else {
        console.warn('⚠️ Failed to load user data from API:', response.status, response.statusText)
        isAuthenticated.value = false
        // Don't show error to user, just continue with guest checkout
      }
    } catch (error) {
      console.warn('⚠️ Could not load user data:', error.message)
      isAuthenticated.value = false
      // Don't show error to user, just continue with guest checkout
    }
  }

  // Pre-fill shipping data
  const prefillShippingData = () => {
    if (!user.value) return

    shippingData.value = {
      firstName: user.value.first_name || '',
      lastName: user.value.last_name || '',
      email: user.value.email || '',
      phone: user.value.phone || '',
      address: '',
      city: '',
      zipCode: '',
      country: 'US'
    }

    // Update payment data
    paymentData.value.customerName = `${user.value.first_name || ''} ${user.value.last_name || ''}`.trim()
    paymentData.value.customerEmail = user.value.email || ''

    }

  // Load cart items
  const loadCartItems = async () => {
    try {
      const userId = localStorage.getItem('user_id')
      if (!userId) {
        console.warn('⚠️ No user ID found, initializing empty cart')
        cartItems.value = []
        return
      }

      // Try cache first
      const cacheKey = `cart_${userId}`
      const cachedCart = await advancedCache.get(cacheKey)
      if (cachedCart) {
        const cartData = cachedCart.data || cachedCart
        cartItems.value = Array.isArray(cartData) ? cartData : []
        performanceMetrics.value.cacheHits++
        return
      }

      // Load from API
      const response = await fetch(`http://127.0.0.1:8000/api/cart/?user_id=${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const cartData = await response.json()
        const items = cartData.data || cartData
        cartItems.value = Array.isArray(items) ? items : []
        
        // Cache cart data
        await advancedCache.set(cacheKey, cartItems.value, 5 * 60 * 1000)
        performanceMetrics.value.apiCalls++
        } else {
        console.warn('⚠️ Failed to load cart from API, initializing empty cart')
        cartItems.value = []
      }
    } catch (error) {
      console.error('❌ Error loading cart items:', error)
      cartItems.value = []
    }
  }

  // Calculate order summary
  const calculateOrderSummaryFunc = () => {
    // Safety check for cartItems
    if (!cartItems.value || !Array.isArray(cartItems.value)) {
      console.warn('⚠️ cartItems is not an array, setting default values')
      orderSummary.value = {
        subtotal: 0,
        shipping: 0,
        tax: 0,
        discount: 0,
        total: 0
      }
      return
    }

    const subtotal = cartItems.value.reduce((sum, item) => {
      return sum + (parseFloat(item.price || item.product_price || 0) * (item.quantity || item.cart_quantity || 1))
    }, 0)

    const shipping = shippingCost.value || calculateShippingCost(subtotal)
    const discount = discountAmount.value || 0

    // Use unified calculation
    orderSummary.value = calculateOrderSummary(subtotal, shipping, discount)

    }

  // Step navigation
  const nextStep = () => {
    if (currentStep.value < 4) {
      const measurement = performanceMonitorEnhanced.startMeasure(`step-${currentStep.value}-to-${currentStep.value + 1}`, 'navigation')
      
      currentStep.value++
      
      performanceMetrics.value.stepTransitions.push({
        from: currentStep.value - 1,
        to: currentStep.value,
        timestamp: Date.now(),
        duration: measurement.end()
      })
      
      }
  }

  const previousStep = () => {
    if (currentStep.value > 1) {
      const measurement = performanceMonitorEnhanced.startMeasure(`step-${currentStep.value}-to-${currentStep.value - 1}`, 'navigation')
      
      currentStep.value--
      
      performanceMetrics.value.stepTransitions.push({
        from: currentStep.value + 1,
        to: currentStep.value,
        timestamp: Date.now(),
        duration: measurement.end()
      })
      
      }
  }

  const goToStep = (step) => {
    if (step >= 1 && step <= 4) {
      const measurement = performanceMonitorEnhanced.startMeasure(`step-${currentStep.value}-to-${step}`, 'navigation')
      
      currentStep.value = step
      
      performanceMetrics.value.stepTransitions.push({
        from: currentStep.value,
        to: step,
        timestamp: Date.now(),
        duration: measurement.end()
      })
      
      }
  }

  // Auto-save functionality
  const saveCheckoutState = async () => {
    try {
      const stateData = {
        currentStep: currentStep.value,
        shippingData: shippingData.value,
        paymentData: paymentData.value,
        timestamp: Date.now()
      }

      await advancedCache.set('checkout_state', stateData, 60 * 60 * 1000) // 1 hour
      lastSaveTime.value = Date.now()
      performanceMetrics.value.formSaves++
      
      } catch (error) {
      console.warn('⚠️ Error auto-saving checkout state:', error)
    }
  }

  const startAutoSave = () => {
    setInterval(() => {
      if (autoSaveEnabled.value) {
        saveCheckoutState()
      }
    }, saveInterval)
  }

  const loadSavedState = async () => {
    try {
      const savedState = await advancedCache.get('checkout_state')
      if (savedState) {
        currentStep.value = savedState.currentStep || 1
        shippingData.value = { ...shippingData.value, ...savedState.shippingData }
        paymentData.value = { ...paymentData.value, ...savedState.paymentData }
        
        }
    } catch (error) {
      console.warn('⚠️ Error loading saved checkout state:', error)
    }
  }

  // Clear checkout state
  const clearCheckoutState = async () => {
    try {
      await advancedCache.delete('checkout_state')
      currentStep.value = 1
      shippingData.value = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        country: 'US'
      }
      paymentData.value = {
        method: 'stripe',
        customerName: '',
        customerEmail: ''
      }
      
      } catch (error) {
      console.warn('⚠️ Error clearing checkout state:', error)
    }
  }

  // Computed properties
  const canProceedToNext = computed(() => {
    switch (currentStep.value) {
      case 1: // Shipping
        return shippingData.value.firstName && 
               shippingData.value.lastName && 
               shippingData.value.email &&
               shippingData.value.address
      case 2: // Payment
        return paymentData.value.method
      case 3: // Review
        return true
      case 4: // Confirmation
        return false
      default:
        return false
    }
  })

  const isLastStep = computed(() => currentStep.value === 4)
  const isFirstStep = computed(() => currentStep.value === 1)

  // Watch for changes and auto-save
  watch([shippingData, paymentData], () => {
    if (autoSaveEnabled.value) {
      saveCheckoutState()
    }
  }, { deep: true })

  // Performance monitoring
  const getPerformanceReport = () => {
    return {
      ...performanceMetrics.value,
      cacheHitRate: performanceMetrics.value.cacheHits / (performanceMetrics.value.cacheHits + performanceMetrics.value.apiCalls),
      averageStepTransitionTime: performanceMetrics.value.stepTransitions.reduce((sum, transition) => sum + transition.duration, 0) / performanceMetrics.value.stepTransitions.length
    }
  }

  return {
    // State
    currentStep,
    isLoading,
    isProcessing,
    shippingData,
    paymentData,
    cartItems,
    shippingCost,
    discountAmount,
    orderSummary,
    user,
    isAuthenticated,
    performanceMetrics,
    
    // Computed
    canProceedToNext,
    isLastStep,
    isFirstStep,
    
    // Methods
    initializeCheckout,
    nextStep,
    previousStep,
    goToStep,
    calculateOrderSummary: calculateOrderSummaryFunc,
    saveCheckoutState,
    loadSavedState,
    clearCheckoutState,
    getPerformanceReport,
    
    // Auto-save
    autoSaveEnabled,
    startAutoSave
  }
}
