import { ref, reactive, onMounted, onUnmounted } from 'vue'

export function useMonitoring() {
  const monitoringState = reactive({
    performance: null,
    business: null,
    health: null,
    dashboard: null,
    loading: false,
    error: null,
    lastUpdate: null
  })

  const isMonitoringActive = ref(false)
  const updateInterval = ref(null)

  /**
   * Track user behavior
   */
  const trackUserBehavior = async (action, context = {}) => {
    try {
      const userId = localStorage.getItem('user_data') ? JSON.parse(localStorage.getItem('user_data')).id : null

      const response = await fetch('http://127.0.0.1:8000/api/monitoring/track-behavior', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          action,
          context: {
            ...context,
            page_url: window.location.href,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`
          }
        })
      })

      if (!response.ok) {
        console.warn('Failed to track user behavior:', response.statusText)
      }
    } catch (error) {
      console.warn('Error tracking user behavior:', error)
    }
  }

  /**
   * Get performance metrics
   */
  const getPerformanceMetrics = async () => {
    try {
      monitoringState.loading = true

      const response = await fetch('http://127.0.0.1:8000/api/monitoring/performance', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        monitoringState.performance = data.data
        monitoringState.lastUpdate = new Date().toISOString()
      }
    } catch (error) {
      monitoringState.error = error.message
    } finally {
      monitoringState.loading = false
    }
  }

  /**
   * Get business metrics
   */
  const getBusinessMetrics = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/monitoring/business', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        monitoringState.business = data.data
      }
    } catch (error) {
      console.warn('Failed to get business metrics:', error)
    }
  }

  /**
   * Get system health
   */
  const getSystemHealth = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/monitoring/health', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        monitoringState.health = data.data
      }
    } catch (error) {
      console.warn('Failed to get system health:', error)
    }
  }

  /**
   * Get dashboard data
   */
  const getDashboardData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/monitoring/dashboard', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        monitoringState.dashboard = data.data
      }
    } catch (error) {
      console.warn('Failed to get dashboard data:', error)
    }
  }

  /**
   * Start monitoring
   */
  const startMonitoring = (intervalMs = 30000) => {
    if (isMonitoringActive.value) return

    isMonitoringActive.value = true

    // Initial data fetch
    getPerformanceMetrics()
    getBusinessMetrics()
    getSystemHealth()
    getDashboardData()

    // Set up periodic updates
    updateInterval.value = setInterval(() => {
      getPerformanceMetrics()
      getBusinessMetrics()
      getSystemHealth()
    }, intervalMs)
  }

  /**
   * Stop monitoring
   */
  const stopMonitoring = () => {
    if (updateInterval.value) {
      clearInterval(updateInterval.value)
      updateInterval.value = null
    }
    isMonitoringActive.value = false
  }

  /**
   * Track page view
   */
  const trackPageView = (pageName) => {
    trackUserBehavior('page_view', {
      page_name: pageName,
      referrer: document.referrer,
      session_duration: performance.now()
    })
  }

  /**
   * Track product view
   */
  const trackProductView = (productId, productName) => {
    trackUserBehavior('product_view', {
      product_id: productId,
      product_name: productName
    })
  }

  /**
   * Track search
   */
  const trackSearch = (query, resultsCount) => {
    trackUserBehavior('search', {
      query,
      results_count: resultsCount
    })
  }

  /**
   * Track add to cart
   */
  const trackAddToCart = (productId, productName, price) => {
    trackUserBehavior('add_to_cart', {
      product_id: productId,
      product_name: productName,
      price
    })
  }

  /**
   * Track checkout start
   */
  const trackCheckoutStart = (cartValue, itemCount) => {
    trackUserBehavior('checkout_start', {
      cart_value: cartValue,
      item_count: itemCount
    })
  }

  /**
   * Track purchase
   */
  const trackPurchase = (orderId, totalAmount, itemCount) => {
    trackUserBehavior('purchase', {
      order_id: orderId,
      total_amount: totalAmount,
      item_count: itemCount
    })
  }

  /**
   * Track user registration
   */
  const trackRegistration = (userId, email) => {
    trackUserBehavior('registration', {
      user_id: userId,
      email: email
    })
  }

  /**
   * Track user login
   */
  const trackLogin = (userId, email) => {
    trackUserBehavior('login', {
      user_id: userId,
      email: email
    })
  }

  /**
   * Track user logout
   */
  const trackLogout = (userId) => {
    trackUserBehavior('logout', {
      user_id: userId
    })
  }

  /**
   * Track error
   */
  const trackError = (error, context = {}) => {
    trackUserBehavior('error', {
      error_message: error.message,
      error_stack: error.stack,
      ...context
    })
  }

  /**
   * Track performance metrics
   */
  const trackPerformance = () => {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0]
      const paint = performance.getEntriesByType('paint')

      const metrics = {
        page_load_time: navigation.loadEventEnd - navigation.loadEventStart,
        dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        first_paint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        first_contentful_paint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
      }

      trackUserBehavior('performance_metrics', metrics)
    }
  }

  // Auto-start monitoring on mount
  onMounted(() => {
    // Track page load performance
    setTimeout(trackPerformance, 1000)

    // Start monitoring if user is authenticated
    const token = localStorage.getItem('auth_token')
    if (token) {
      startMonitoring()
    }
  })

  // Cleanup on unmount
  onUnmounted(() => {
    stopMonitoring()
  })

  return {
    // State
    monitoringState,
    isMonitoringActive,

    // Methods
    trackUserBehavior,
    trackPageView,
    trackProductView,
    trackSearch,
    trackAddToCart,
    trackCheckoutStart,
    trackPurchase,
    trackRegistration,
    trackLogin,
    trackLogout,
    trackError,
    trackPerformance,
    getPerformanceMetrics,
    getBusinessMetrics,
    getSystemHealth,
    getDashboardData,
    startMonitoring,
    stopMonitoring
  }
}

export function useMonitoring() {
  const monitoringState = reactive({
    performance: null,
    business: null,
    health: null,
    dashboard: null,
    loading: false,
    error: null,
    lastUpdate: null
  })

  const isMonitoringActive = ref(false)
  const updateInterval = ref(null)

  /**
   * Track user behavior
   */
  const trackUserBehavior = async (action, context = {}) => {
    try {
      const userId = localStorage.getItem('user_data') ? JSON.parse(localStorage.getItem('user_data')).id : null

      const response = await fetch('http://127.0.0.1:8000/api/monitoring/track-behavior', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          action,
          context: {
            ...context,
            page_url: window.location.href,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`
          }
        })
      })

      if (!response.ok) {
        console.warn('Failed to track user behavior:', response.statusText)
      }
    } catch (error) {
      console.warn('Error tracking user behavior:', error)
    }
  }

  /**
   * Get performance metrics
   */
  const getPerformanceMetrics = async () => {
    try {
      monitoringState.loading = true

      const response = await fetch('http://127.0.0.1:8000/api/monitoring/performance', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        monitoringState.performance = data.data
        monitoringState.lastUpdate = new Date().toISOString()
      }
    } catch (error) {
      monitoringState.error = error.message
    } finally {
      monitoringState.loading = false
    }
  }

  /**
   * Get business metrics
   */
  const getBusinessMetrics = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/monitoring/business', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        monitoringState.business = data.data
      }
    } catch (error) {
      console.warn('Failed to get business metrics:', error)
    }
  }

  /**
   * Get system health
   */
  const getSystemHealth = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/monitoring/health', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        monitoringState.health = data.data
      }
    } catch (error) {
      console.warn('Failed to get system health:', error)
    }
  }

  /**
   * Get dashboard data
   */
  const getDashboardData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/monitoring/dashboard', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        monitoringState.dashboard = data.data
      }
    } catch (error) {
      console.warn('Failed to get dashboard data:', error)
    }
  }

  /**
   * Start monitoring
   */
  const startMonitoring = (intervalMs = 30000) => {
    if (isMonitoringActive.value) return

    isMonitoringActive.value = true

    // Initial data fetch
    getPerformanceMetrics()
    getBusinessMetrics()
    getSystemHealth()
    getDashboardData()

    // Set up periodic updates
    updateInterval.value = setInterval(() => {
      getPerformanceMetrics()
      getBusinessMetrics()
      getSystemHealth()
    }, intervalMs)
  }

  /**
   * Stop monitoring
   */
  const stopMonitoring = () => {
    if (updateInterval.value) {
      clearInterval(updateInterval.value)
      updateInterval.value = null
    }
    isMonitoringActive.value = false
  }

  /**
   * Track page view
   */
  const trackPageView = (pageName) => {
    trackUserBehavior('page_view', {
      page_name: pageName,
      referrer: document.referrer,
      session_duration: performance.now()
    })
  }

  /**
   * Track product view
   */
  const trackProductView = (productId, productName) => {
    trackUserBehavior('product_view', {
      product_id: productId,
      product_name: productName
    })
  }

  /**
   * Track search
   */
  const trackSearch = (query, resultsCount) => {
    trackUserBehavior('search', {
      query,
      results_count: resultsCount
    })
  }

  /**
   * Track add to cart
   */
  const trackAddToCart = (productId, productName, price) => {
    trackUserBehavior('add_to_cart', {
      product_id: productId,
      product_name: productName,
      price
    })
  }

  /**
   * Track checkout start
   */
  const trackCheckoutStart = (cartValue, itemCount) => {
    trackUserBehavior('checkout_start', {
      cart_value: cartValue,
      item_count: itemCount
    })
  }

  /**
   * Track purchase
   */
  const trackPurchase = (orderId, totalAmount, itemCount) => {
    trackUserBehavior('purchase', {
      order_id: orderId,
      total_amount: totalAmount,
      item_count: itemCount
    })
  }

  /**
   * Track user registration
   */
  const trackRegistration = (userId, email) => {
    trackUserBehavior('registration', {
      user_id: userId,
      email: email
    })
  }

  /**
   * Track user login
   */
  const trackLogin = (userId, email) => {
    trackUserBehavior('login', {
      user_id: userId,
      email: email
    })
  }

  /**
   * Track user logout
   */
  const trackLogout = (userId) => {
    trackUserBehavior('logout', {
      user_id: userId
    })
  }

  /**
   * Track error
   */
  const trackError = (error, context = {}) => {
    trackUserBehavior('error', {
      error_message: error.message,
      error_stack: error.stack,
      ...context
    })
  }

  /**
   * Track performance metrics
   */
  const trackPerformance = () => {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0]
      const paint = performance.getEntriesByType('paint')

      const metrics = {
        page_load_time: navigation.loadEventEnd - navigation.loadEventStart,
        dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        first_paint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        first_contentful_paint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
      }

      trackUserBehavior('performance_metrics', metrics)
    }
  }

  // Auto-start monitoring on mount
  onMounted(() => {
    // Track page load performance
    setTimeout(trackPerformance, 1000)

    // Start monitoring if user is authenticated
    const token = localStorage.getItem('auth_token')
    if (token) {
      startMonitoring()
    }
  })

  // Cleanup on unmount
  onUnmounted(() => {
    stopMonitoring()
  })

  return {
    // State
    monitoringState,
    isMonitoringActive,

    // Methods
    trackUserBehavior,
    trackPageView,
    trackProductView,
    trackSearch,
    trackAddToCart,
    trackCheckoutStart,
    trackPurchase,
    trackRegistration,
    trackLogin,
    trackLogout,
    trackError,
    trackPerformance,
    getPerformanceMetrics,
    getBusinessMetrics,
    getSystemHealth,
    getDashboardData,
    startMonitoring,
    stopMonitoring
  }
}

export function useMonitoring() {
  const monitoringState = reactive({
    performance: null,
    business: null,
    health: null,
    dashboard: null,
    loading: false,
    error: null,
    lastUpdate: null
  })

  const isMonitoringActive = ref(false)
  const updateInterval = ref(null)

  /**
   * Track user behavior
   */
  const trackUserBehavior = async (action, context = {}) => {
    try {
      const userId = localStorage.getItem('user_data') ? JSON.parse(localStorage.getItem('user_data')).id : null

      const response = await fetch('http://127.0.0.1:8000/api/monitoring/track-behavior', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          action,
          context: {
            ...context,
            page_url: window.location.href,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`
          }
        })
      })

      if (!response.ok) {
        console.warn('Failed to track user behavior:', response.statusText)
      }
    } catch (error) {
      console.warn('Error tracking user behavior:', error)
    }
  }

  /**
   * Get performance metrics
   */
  const getPerformanceMetrics = async () => {
    try {
      monitoringState.loading = true

      const response = await fetch('http://127.0.0.1:8000/api/monitoring/performance', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        monitoringState.performance = data.data
        monitoringState.lastUpdate = new Date().toISOString()
      }
    } catch (error) {
      monitoringState.error = error.message
    } finally {
      monitoringState.loading = false
    }
  }

  /**
   * Get business metrics
   */
  const getBusinessMetrics = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/monitoring/business', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        monitoringState.business = data.data
      }
    } catch (error) {
      console.warn('Failed to get business metrics:', error)
    }
  }

  /**
   * Get system health
   */
  const getSystemHealth = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/monitoring/health', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        monitoringState.health = data.data
      }
    } catch (error) {
      console.warn('Failed to get system health:', error)
    }
  }

  /**
   * Get dashboard data
   */
  const getDashboardData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/monitoring/dashboard', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        monitoringState.dashboard = data.data
      }
    } catch (error) {
      console.warn('Failed to get dashboard data:', error)
    }
  }

  /**
   * Start monitoring
   */
  const startMonitoring = (intervalMs = 30000) => {
    if (isMonitoringActive.value) return

    isMonitoringActive.value = true

    // Initial data fetch
    getPerformanceMetrics()
    getBusinessMetrics()
    getSystemHealth()
    getDashboardData()

    // Set up periodic updates
    updateInterval.value = setInterval(() => {
      getPerformanceMetrics()
      getBusinessMetrics()
      getSystemHealth()
    }, intervalMs)
  }

  /**
   * Stop monitoring
   */
  const stopMonitoring = () => {
    if (updateInterval.value) {
      clearInterval(updateInterval.value)
      updateInterval.value = null
    }
    isMonitoringActive.value = false
  }

  /**
   * Track page view
   */
  const trackPageView = (pageName) => {
    trackUserBehavior('page_view', {
      page_name: pageName,
      referrer: document.referrer,
      session_duration: performance.now()
    })
  }

  /**
   * Track product view
   */
  const trackProductView = (productId, productName) => {
    trackUserBehavior('product_view', {
      product_id: productId,
      product_name: productName
    })
  }

  /**
   * Track search
   */
  const trackSearch = (query, resultsCount) => {
    trackUserBehavior('search', {
      query,
      results_count: resultsCount
    })
  }

  /**
   * Track add to cart
   */
  const trackAddToCart = (productId, productName, price) => {
    trackUserBehavior('add_to_cart', {
      product_id: productId,
      product_name: productName,
      price
    })
  }

  /**
   * Track checkout start
   */
  const trackCheckoutStart = (cartValue, itemCount) => {
    trackUserBehavior('checkout_start', {
      cart_value: cartValue,
      item_count: itemCount
    })
  }

  /**
   * Track purchase
   */
  const trackPurchase = (orderId, totalAmount, itemCount) => {
    trackUserBehavior('purchase', {
      order_id: orderId,
      total_amount: totalAmount,
      item_count: itemCount
    })
  }

  /**
   * Track user registration
   */
  const trackRegistration = (userId, email) => {
    trackUserBehavior('registration', {
      user_id: userId,
      email: email
    })
  }

  /**
   * Track user login
   */
  const trackLogin = (userId, email) => {
    trackUserBehavior('login', {
      user_id: userId,
      email: email
    })
  }

  /**
   * Track user logout
   */
  const trackLogout = (userId) => {
    trackUserBehavior('logout', {
      user_id: userId
    })
  }

  /**
   * Track error
   */
  const trackError = (error, context = {}) => {
    trackUserBehavior('error', {
      error_message: error.message,
      error_stack: error.stack,
      ...context
    })
  }

  /**
   * Track performance metrics
   */
  const trackPerformance = () => {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0]
      const paint = performance.getEntriesByType('paint')

      const metrics = {
        page_load_time: navigation.loadEventEnd - navigation.loadEventStart,
        dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        first_paint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        first_contentful_paint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
      }

      trackUserBehavior('performance_metrics', metrics)
    }
  }

  // Auto-start monitoring on mount
  onMounted(() => {
    // Track page load performance
    setTimeout(trackPerformance, 1000)

    // Start monitoring if user is authenticated
    const token = localStorage.getItem('auth_token')
    if (token) {
      startMonitoring()
    }
  })

  // Cleanup on unmount
  onUnmounted(() => {
    stopMonitoring()
  })

  return {
    // State
    monitoringState,
    isMonitoringActive,

    // Methods
    trackUserBehavior,
    trackPageView,
    trackProductView,
    trackSearch,
    trackAddToCart,
    trackCheckoutStart,
    trackPurchase,
    trackRegistration,
    trackLogin,
    trackLogout,
    trackError,
    trackPerformance,
    getPerformanceMetrics,
    getBusinessMetrics,
    getSystemHealth,
    getDashboardData,
    startMonitoring,
    stopMonitoring
  }
}

export function useMonitoring() {
  const monitoringState = reactive({
    performance: null,
    business: null,
    health: null,
    dashboard: null,
    loading: false,
    error: null,
    lastUpdate: null
  })

  const isMonitoringActive = ref(false)
  const updateInterval = ref(null)

  /**
   * Track user behavior
   */
  const trackUserBehavior = async (action, context = {}) => {
    try {
      const userId = localStorage.getItem('user_data') ? JSON.parse(localStorage.getItem('user_data')).id : null

      const response = await fetch('http://127.0.0.1:8000/api/monitoring/track-behavior', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          action,
          context: {
            ...context,
            page_url: window.location.href,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`
          }
        })
      })

      if (!response.ok) {
        console.warn('Failed to track user behavior:', response.statusText)
      }
    } catch (error) {
      console.warn('Error tracking user behavior:', error)
    }
  }

  /**
   * Get performance metrics
   */
  const getPerformanceMetrics = async () => {
    try {
      monitoringState.loading = true

      const response = await fetch('http://127.0.0.1:8000/api/monitoring/performance', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        monitoringState.performance = data.data
        monitoringState.lastUpdate = new Date().toISOString()
      }
    } catch (error) {
      monitoringState.error = error.message
    } finally {
      monitoringState.loading = false
    }
  }

  /**
   * Get business metrics
   */
  const getBusinessMetrics = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/monitoring/business', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        monitoringState.business = data.data
      }
    } catch (error) {
      console.warn('Failed to get business metrics:', error)
    }
  }

  /**
   * Get system health
   */
  const getSystemHealth = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/monitoring/health', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        monitoringState.health = data.data
      }
    } catch (error) {
      console.warn('Failed to get system health:', error)
    }
  }

  /**
   * Get dashboard data
   */
  const getDashboardData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/monitoring/dashboard', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        monitoringState.dashboard = data.data
      }
    } catch (error) {
      console.warn('Failed to get dashboard data:', error)
    }
  }

  /**
   * Start monitoring
   */
  const startMonitoring = (intervalMs = 30000) => {
    if (isMonitoringActive.value) return

    isMonitoringActive.value = true

    // Initial data fetch
    getPerformanceMetrics()
    getBusinessMetrics()
    getSystemHealth()
    getDashboardData()

    // Set up periodic updates
    updateInterval.value = setInterval(() => {
      getPerformanceMetrics()
      getBusinessMetrics()
      getSystemHealth()
    }, intervalMs)
  }

  /**
   * Stop monitoring
   */
  const stopMonitoring = () => {
    if (updateInterval.value) {
      clearInterval(updateInterval.value)
      updateInterval.value = null
    }
    isMonitoringActive.value = false
  }

  /**
   * Track page view
   */
  const trackPageView = (pageName) => {
    trackUserBehavior('page_view', {
      page_name: pageName,
      referrer: document.referrer,
      session_duration: performance.now()
    })
  }

  /**
   * Track product view
   */
  const trackProductView = (productId, productName) => {
    trackUserBehavior('product_view', {
      product_id: productId,
      product_name: productName
    })
  }

  /**
   * Track search
   */
  const trackSearch = (query, resultsCount) => {
    trackUserBehavior('search', {
      query,
      results_count: resultsCount
    })
  }

  /**
   * Track add to cart
   */
  const trackAddToCart = (productId, productName, price) => {
    trackUserBehavior('add_to_cart', {
      product_id: productId,
      product_name: productName,
      price
    })
  }

  /**
   * Track checkout start
   */
  const trackCheckoutStart = (cartValue, itemCount) => {
    trackUserBehavior('checkout_start', {
      cart_value: cartValue,
      item_count: itemCount
    })
  }

  /**
   * Track purchase
   */
  const trackPurchase = (orderId, totalAmount, itemCount) => {
    trackUserBehavior('purchase', {
      order_id: orderId,
      total_amount: totalAmount,
      item_count: itemCount
    })
  }

  /**
   * Track user registration
   */
  const trackRegistration = (userId, email) => {
    trackUserBehavior('registration', {
      user_id: userId,
      email: email
    })
  }

  /**
   * Track user login
   */
  const trackLogin = (userId, email) => {
    trackUserBehavior('login', {
      user_id: userId,
      email: email
    })
  }

  /**
   * Track user logout
   */
  const trackLogout = (userId) => {
    trackUserBehavior('logout', {
      user_id: userId
    })
  }

  /**
   * Track error
   */
  const trackError = (error, context = {}) => {
    trackUserBehavior('error', {
      error_message: error.message,
      error_stack: error.stack,
      ...context
    })
  }

  /**
   * Track performance metrics
   */
  const trackPerformance = () => {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0]
      const paint = performance.getEntriesByType('paint')

      const metrics = {
        page_load_time: navigation.loadEventEnd - navigation.loadEventStart,
        dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        first_paint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        first_contentful_paint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
      }

      trackUserBehavior('performance_metrics', metrics)
    }
  }

  // Auto-start monitoring on mount
  onMounted(() => {
    // Track page load performance
    setTimeout(trackPerformance, 1000)

    // Start monitoring if user is authenticated
    const token = localStorage.getItem('auth_token')
    if (token) {
      startMonitoring()
    }
  })

  // Cleanup on unmount
  onUnmounted(() => {
    stopMonitoring()
  })

  return {
    // State
    monitoringState,
    isMonitoringActive,

    // Methods
    trackUserBehavior,
    trackPageView,
    trackProductView,
    trackSearch,
    trackAddToCart,
    trackCheckoutStart,
    trackPurchase,
    trackRegistration,
    trackLogin,
    trackLogout,
    trackError,
    trackPerformance,
    getPerformanceMetrics,
    getBusinessMetrics,
    getSystemHealth,
    getDashboardData,
    startMonitoring,
    stopMonitoring
  }
}

export function useMonitoring() {
  const monitoringState = reactive({
    performance: null,
    business: null,
    health: null,
    dashboard: null,
    loading: false,
    error: null,
    lastUpdate: null
  })

  const isMonitoringActive = ref(false)
  const updateInterval = ref(null)

  /**
   * Track user behavior
   */
  const trackUserBehavior = async (action, context = {}) => {
    try {
      const userId = localStorage.getItem('user_data') ? JSON.parse(localStorage.getItem('user_data')).id : null

      const response = await fetch('http://127.0.0.1:8000/api/monitoring/track-behavior', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          action,
          context: {
            ...context,
            page_url: window.location.href,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`
          }
        })
      })

      if (!response.ok) {
        console.warn('Failed to track user behavior:', response.statusText)
      }
    } catch (error) {
      console.warn('Error tracking user behavior:', error)
    }
  }

  /**
   * Get performance metrics
   */
  const getPerformanceMetrics = async () => {
    try {
      monitoringState.loading = true

      const response = await fetch('http://127.0.0.1:8000/api/monitoring/performance', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        monitoringState.performance = data.data
        monitoringState.lastUpdate = new Date().toISOString()
      }
    } catch (error) {
      monitoringState.error = error.message
    } finally {
      monitoringState.loading = false
    }
  }

  /**
   * Get business metrics
   */
  const getBusinessMetrics = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/monitoring/business', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        monitoringState.business = data.data
      }
    } catch (error) {
      console.warn('Failed to get business metrics:', error)
    }
  }

  /**
   * Get system health
   */
  const getSystemHealth = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/monitoring/health', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        monitoringState.health = data.data
      }
    } catch (error) {
      console.warn('Failed to get system health:', error)
    }
  }

  /**
   * Get dashboard data
   */
  const getDashboardData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/monitoring/dashboard', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        monitoringState.dashboard = data.data
      }
    } catch (error) {
      console.warn('Failed to get dashboard data:', error)
    }
  }

  /**
   * Start monitoring
   */
  const startMonitoring = (intervalMs = 30000) => {
    if (isMonitoringActive.value) return

    isMonitoringActive.value = true

    // Initial data fetch
    getPerformanceMetrics()
    getBusinessMetrics()
    getSystemHealth()
    getDashboardData()

    // Set up periodic updates
    updateInterval.value = setInterval(() => {
      getPerformanceMetrics()
      getBusinessMetrics()
      getSystemHealth()
    }, intervalMs)
  }

  /**
   * Stop monitoring
   */
  const stopMonitoring = () => {
    if (updateInterval.value) {
      clearInterval(updateInterval.value)
      updateInterval.value = null
    }
    isMonitoringActive.value = false
  }

  /**
   * Track page view
   */
  const trackPageView = (pageName) => {
    trackUserBehavior('page_view', {
      page_name: pageName,
      referrer: document.referrer,
      session_duration: performance.now()
    })
  }

  /**
   * Track product view
   */
  const trackProductView = (productId, productName) => {
    trackUserBehavior('product_view', {
      product_id: productId,
      product_name: productName
    })
  }

  /**
   * Track search
   */
  const trackSearch = (query, resultsCount) => {
    trackUserBehavior('search', {
      query,
      results_count: resultsCount
    })
  }

  /**
   * Track add to cart
   */
  const trackAddToCart = (productId, productName, price) => {
    trackUserBehavior('add_to_cart', {
      product_id: productId,
      product_name: productName,
      price
    })
  }

  /**
   * Track checkout start
   */
  const trackCheckoutStart = (cartValue, itemCount) => {
    trackUserBehavior('checkout_start', {
      cart_value: cartValue,
      item_count: itemCount
    })
  }

  /**
   * Track purchase
   */
  const trackPurchase = (orderId, totalAmount, itemCount) => {
    trackUserBehavior('purchase', {
      order_id: orderId,
      total_amount: totalAmount,
      item_count: itemCount
    })
  }

  /**
   * Track user registration
   */
  const trackRegistration = (userId, email) => {
    trackUserBehavior('registration', {
      user_id: userId,
      email: email
    })
  }

  /**
   * Track user login
   */
  const trackLogin = (userId, email) => {
    trackUserBehavior('login', {
      user_id: userId,
      email: email
    })
  }

  /**
   * Track user logout
   */
  const trackLogout = (userId) => {
    trackUserBehavior('logout', {
      user_id: userId
    })
  }

  /**
   * Track error
   */
  const trackError = (error, context = {}) => {
    trackUserBehavior('error', {
      error_message: error.message,
      error_stack: error.stack,
      ...context
    })
  }

  /**
   * Track performance metrics
   */
  const trackPerformance = () => {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0]
      const paint = performance.getEntriesByType('paint')

      const metrics = {
        page_load_time: navigation.loadEventEnd - navigation.loadEventStart,
        dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        first_paint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        first_contentful_paint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
      }

      trackUserBehavior('performance_metrics', metrics)
    }
  }

  // Auto-start monitoring on mount
  onMounted(() => {
    // Track page load performance
    setTimeout(trackPerformance, 1000)

    // Start monitoring if user is authenticated
    const token = localStorage.getItem('auth_token')
    if (token) {
      startMonitoring()
    }
  })

  // Cleanup on unmount
  onUnmounted(() => {
    stopMonitoring()
  })

  return {
    // State
    monitoringState,
    isMonitoringActive,

    // Methods
    trackUserBehavior,
    trackPageView,
    trackProductView,
    trackSearch,
    trackAddToCart,
    trackCheckoutStart,
    trackPurchase,
    trackRegistration,
    trackLogin,
    trackLogout,
    trackError,
    trackPerformance,
    getPerformanceMetrics,
    getBusinessMetrics,
    getSystemHealth,
    getDashboardData,
    startMonitoring,
    stopMonitoring
  }
}
