/**
 * Performance Plugin
 * Automatically applies optimizations across the app
 */

import performanceMonitor from '@/utils/performanceMonitorEnhanced'
import { initImageOptimizations } from '@/utils/imageOptimizationHelper'
import advancedCache from '@/utils/advancedCache'

export default {
  install(app, options = {}) {
    const {
      enableMonitoring = true,
      enableImageOptimization = true,
      enableAutoCache = true,
      logStats = false
    } = options

    // 1. Setup Performance Monitoring
    if (enableMonitoring) {
      // Enable monitoring in development
      if (import.meta.env.DEV) {
        performanceMonitor.setEnabled(true)
      }

      // Add global performance monitor
      app.config.globalProperties.$perf = performanceMonitor

      // Track route changes
      app.config.globalProperties.$router?.afterEach((to, from) => {
        performanceMonitor.measurePageLoad(to.name || to.path)
      })
    }

    // 2. Setup Image Optimization
    if (enableImageOptimization) {
      // Initialize on mount
      app.mixin({
        mounted() {
          if (this.$el && typeof this.$el.querySelectorAll === 'function') {
            // Optimize images in component
            requestAnimationFrame(() => {
              initImageOptimizations()
            })
          }
        }
      })
    }

    // 3. Setup Auto Cache Management
    if (enableAutoCache) {
      // Clear expired cache every 5 minutes
      setInterval(() => {
        advancedCache.clearExpired()
      }, 5 * 60 * 1000)

      // Add global cache access
      app.config.globalProperties.$cache = advancedCache
    }

    // 4. Add Global Performance Methods
    app.config.globalProperties.$performance = {
      // Measure function execution time
      measure: async (name, fn) => {
        return await performanceMonitor.measureApiCall(name, fn)
      },
      
      // Get stats
      getStats: () => {
        return performanceMonitor.getStats()
      },
      
      // Clear cache
      clearCache: (pattern) => {
        if (pattern) {
          advancedCache.invalidatePattern(pattern)
        } else {
          advancedCache.clear()
        }
      },
      
      // Log report
      logReport: () => {
        performanceMonitor.logReport()
      }
    }

    // 5. Log Stats in Development
    if (logStats && import.meta.env.DEV) {
      // Log stats after 5 seconds
      setTimeout(() => {
        console.group('📊 Performance Stats')
        console.log('Cache:', advancedCache.getStats())
        console.log('Performance:', performanceMonitor.getStats())
        console.groupEnd()
      }, 5000)
    }

    // 6. Expose to window for debugging
    if (import.meta.env.DEV) {
      window.__performancePlugin__ = {
        monitor: performanceMonitor,
        cache: advancedCache,
        getStats: () => ({
          cache: advancedCache.getStats(),
          performance: performanceMonitor.getStats()
        })
      }
    }

    console.log('✅ Performance Plugin Initialized')
  }
}

