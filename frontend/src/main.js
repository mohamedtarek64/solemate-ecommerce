import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import './assets/styles/globals.css'
import './styles/mobile-global.css'

// Import performance utilities
import { performanceMonitor } from './utils/performanceMonitor'
// Import enhanced performance plugin
import PerformancePlugin from './plugins/performancePlugin'
import { initImageOptimizations } from './utils/imageOptimizationHelper'
// ✅ Import Global Error Handler and Health Check
import globalErrorHandler from './utils/globalErrorHandler'
import healthCheckService from './services/healthCheckService'

// Enhanced fetch wrapper with API router support
const originalFetch = window.fetch
window.fetch = async function(url, options) {
  // Block image API calls immediately
  if (typeof url === 'string' && url.includes('/api/v1/images/category/')) {
    console.log('Blocked image API call:', url)
    return Promise.resolve({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Image API disabled' })
    })
  }

  // Use Laravel API directly (no router needed)
  // Laravel routes are properly configured in api.php

  // Use original fetch for all other API calls
  return originalFetch.call(this, url, options)
}

// Override image fetching functions
window.getImagesByCategory = () => Promise.resolve([])
window.getHomePageImages = () => Promise.resolve([])
window.fetchHomePageImages = () => Promise.resolve([])

// Create Vue app
const app = createApp(App)

// Create Pinia store with optimizations
const pinia = createPinia()

// Performance optimizations
pinia.use(({ store }) => {
  // Add performance monitoring
  const originalAction = store.$patch
  store.$patch = function(patch) {
    const start = performance.now()
    const result = originalAction.call(this, patch)
    const end = performance.now()
    if (end - start > 10) { // Log slow operations
      console.warn(`Slow store operation: ${store.$id} took ${end - start}ms`)
    }
    return result
  }
})

// Use Pinia FIRST (before router)
app.use(pinia)

// Use Router SECOND (after pinia)
app.use(router)

// Use Performance Plugin THIRD (for automatic optimizations)
app.use(PerformancePlugin, {
  enableMonitoring: true,
  enableImageOptimization: true,
  enableAutoCache: true,
  logStats: import.meta.env.DEV
})

// Use Toast
app.use(Toast, {
  position: 'top-right',
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
})

// Mount the app
app.mount('#app')

// Initialize image optimizations after mount
requestAnimationFrame(() => {
  initImageOptimizations()
})

// ⚠️ Service Worker DISABLED temporarily to fix port issues
// Register Service Worker for performance optimization
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js')
//       .then(registration => {
//         console.log('SW registered: ', registration)
//       })
//       .catch(registrationError => {
//         console.log('SW registration failed: ', registrationError)
//       })
//   })
// }

// Remove loading spinner after app is mounted
const loadingSpinner = document.querySelector('.loading-spinner')
if (loadingSpinner) {
  loadingSpinner.remove()
}

// ✅ Start Health Check Monitoring
healthCheckService.startMonitoring(60000) // Check every minute

// ✅ Add global error handler callback
globalErrorHandler.onError((error) => {
  // You can add custom logic here (e.g., send to analytics)
  if (import.meta.env.DEV) {
    console.log('📝 Error logged:', error.message)
  }
})

// ✅ Expose global utilities
app.config.globalProperties.$errorHandler = globalErrorHandler
app.config.globalProperties.$healthCheck = healthCheckService

// Log performance stats after 3 seconds (in development)
if (import.meta.env.DEV) {
  setTimeout(() => {
    console.log('📊 Performance Stats Available:')
    console.log('  - Type: window.__performancePlugin__.getStats()')
    console.log('  - Or use: app.config.globalProperties.$performance.logReport()')
    console.log('  - Errors: window.__errorHandler__.getStats()')
    console.log('  - Health: window.__healthCheck__.getStatus()')
  }, 3000)
}

// ✅ Enhanced Global Error Handler
app.config.errorHandler = (err, vm, info) => {
  // Use global error handler
  globalErrorHandler.handleVueError(err, vm, info)
  
  // Also log to console in development
  if (import.meta.env.DEV) {
    console.error('Vue Error:', err)
    console.error('Component:', vm)
    console.error('Info:', info)
  }
}

// Global warning handler
app.config.warnHandler = (msg, vm, trace) => {
  console.warn('Vue Warning:', msg)
  console.warn('Component:', vm)
  console.warn('Trace:', trace)
}

// Global properties
app.config.globalProperties.$log = console.log
app.config.globalProperties.$warn = console.warn
app.config.globalProperties.$error = console.error

// Development mode configuration
if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
  console.log('🔧 Development mode: Real API enabled')

  // Reduce console noise in development
  const originalConsoleLog = console.log
  console.log = function(...args) {
    if (args[0] && args[0].includes && args[0].includes('🔍 TokenManager')) {
      // Reduce token manager debug noise - only show important logs
      if (args[0].includes('setToken') || args[0].includes('setUser') || args[0].includes('clearAuth')) {
        originalConsoleLog.apply(console, args)
      }
      return
    }
    originalConsoleLog.apply(console, args)
  }

  // Performance monitoring
  app.config.performance = true

  // Devtools
  app.config.devtools = true
}

// Global directives
app.directive('focus', {
  mounted(el) {
    el.focus()
  }
})

app.directive('click-outside', {
  mounted(el, binding) {
    el.clickOutsideEvent = function(event) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
})

// Global mixins
app.mixin({
  methods: {
    $formatPrice(price) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(price)
    },
    $formatDate(date) {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(new Date(date))
    },
    $debounce(func, wait) {
      let timeout
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout)
          func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
      }
    },
    $throttle(func, limit) {
      let inThrottle
      return function executedFunction(...args) {
        if (!inThrottle) {
          func.apply(this, args)
          inThrottle = true
          setTimeout(() => inThrottle = false, limit)
        }
      }
    }
  }
})

// Global filters (Vue 3 doesn't have filters, but we can use methods)
app.config.globalProperties.$filters = {
  currency(value, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(value)
  },
  date(value, format = 'long') {
    const options = {
      long: { year: 'numeric', month: 'long', day: 'numeric' },
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      time: { hour: '2-digit', minute: '2-digit' }
    }
    return new Intl.DateTimeFormat('en-US', options[format]).format(new Date(value))
  },
  truncate(value, length = 100) {
    if (value.length <= length) return value
    return value.substring(0, length) + '...'
  },
  capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1)
  },
  pluralize(value, singular, plural) {
    return value === 1 ? singular : plural
  }
}

// Service Worker registration disabled and unregistered
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister()
      console.log('Service Worker unregistered')
    }
  })
}

// PWA installation prompt
let deferredPrompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e
  // You can show a custom install button here
})

// PWA install handler
window.addEventListener('appinstalled', () => {
  console.log('PWA was installed')
  deferredPrompt = null
})

// Export for testing
export default app
