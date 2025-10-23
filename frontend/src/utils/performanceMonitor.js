/**
 * Performance Monitoring Utility
 * Monitors and reports performance metrics for the application
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
    this.observers = []
    this.isEnabled = true
  }

  // Start timing an operation
  startTiming(name) {
    if (!this.isEnabled) return

    const startTime = performance.now()
    this.metrics.set(name, { startTime })
  }

  // End timing and record duration
  endTiming(name) {
    if (!this.isEnabled) return null

    const metric = this.metrics.get(name)
    if (!metric) return null

    const duration = performance.now() - metric.startTime
    metric.duration = duration
    metric.endTime = performance.now()

    this.notifyObservers(name, metric)
    return duration
  }

  // Record a metric value
  recordMetric(name, value, metadata = {}) {
    if (!this.isEnabled) return

    const metric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    }

    this.metrics.set(name, metric)
    this.notifyObservers(name, metric)
  }

  // Get metric value
  getMetric(name) {
    return this.metrics.get(name)
  }

  // Get all metrics
  getAllMetrics() {
    return Object.fromEntries(this.metrics)
  }

  // Clear metrics
  clearMetrics() {
    this.metrics.clear()
  }

  // Add observer for metrics
  addObserver(callback) {
    this.observers.push(callback)
  }

  // Remove observer
  removeObserver(callback) {
    const index = this.observers.indexOf(callback)
    if (index > -1) {
      this.observers.splice(index, 1)
    }
  }

  // Notify observers
  notifyObservers(name, metric) {
    this.observers.forEach(callback => {
      try {
        callback(name, metric)
      } catch (error) {
        console.error('Performance observer error:', error)
      }
    })
  }

  // Measure function execution time
  measureFunction(name, fn, ...args) {
    this.startTiming(name)
    try {
      const result = fn(...args)

      // Handle async functions
      if (result && typeof result.then === 'function') {
        return result.finally(() => {
          this.endTiming(name)
        })
      }

      this.endTiming(name)
      return result
    } catch (error) {
      this.endTiming(name)
      throw error
    }
  }

  // Monitor page load performance
  monitorPageLoad() {
    if (!this.isEnabled || typeof window === 'undefined') return

    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0]
        if (navigation) {
          this.recordMetric('page_load_time', navigation.loadEventEnd - navigation.loadEventStart)
          this.recordMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart)
          this.recordMetric('first_byte_time', navigation.responseStart - navigation.requestStart)
          this.recordMetric('dns_lookup_time', navigation.domainLookupEnd - navigation.domainLookupStart)
        }

        // Core Web Vitals
        this.monitorCoreWebVitals()
      }, 0)
    })
  }

  // Monitor Core Web Vitals
  monitorCoreWebVitals() {
    if (!this.isEnabled || typeof window === 'undefined') return

    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      this.recordMetric('lcp', lastEntry.startTime)
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach(entry => {
        this.recordMetric('fid', entry.processingStart - entry.startTime)
      })
    }).observe({ entryTypes: ['first-input'] })

    // Cumulative Layout Shift (CLS)
    let clsValue = 0
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      this.recordMetric('cls', clsValue)
    }).observe({ entryTypes: ['layout-shift'] })
  }

  // Monitor API request performance (optimized - no console spam)
  monitorApiRequests() {
    if (!this.isEnabled || typeof window === 'undefined') return

    // Override fetch to monitor requests
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const url = args[0]
      const startTime = performance.now()

      try {
        const response = await originalFetch(...args)
        const duration = performance.now() - startTime

        // Only record successful requests or slow requests
        if (response.ok || duration > 1000) {
          this.recordMetric(`api_request_${url}`, duration, {
            url,
            status: response.status,
            success: response.ok
          })
        }

        return response
      } catch (error) {
        const duration = performance.now() - startTime

        // Only record if it's a significant error
        if (duration > 500) {
          this.recordMetric(`api_request_error_${url}`, duration, {
            url,
            error: error.message
          })
        }

        throw error
      }
    }
  }

  // Monitor memory usage
  monitorMemoryUsage() {
    if (!this.isEnabled || typeof window === 'undefined') return

    setInterval(() => {
      if ('memory' in performance) {
        const memory = performance.memory
        this.recordMetric('memory_used', memory.usedJSHeapSize)
        this.recordMetric('memory_total', memory.totalJSHeapSize)
        this.recordMetric('memory_limit', memory.jsHeapSizeLimit)
      }
    }, 30000) // Every 30 seconds
  }

  // Generate performance report
  generateReport() {
    const metrics = this.getAllMetrics()
    const report = {
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      } : null,
      metrics
    }

    return report
  }

  // Send performance report to server
  async sendReport(endpoint = '/api/performance-report') {
    if (!this.isEnabled) return

    try {
      const report = this.generateReport()
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(report)
      })
    } catch (error) {
      console.error('Failed to send performance report:', error)
    }
  }

  // Enable/disable monitoring
  setEnabled(enabled) {
    this.isEnabled = enabled
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// Initialize monitoring
if (typeof window !== 'undefined') {
  performanceMonitor.monitorPageLoad()
  performanceMonitor.monitorApiRequests()
  performanceMonitor.monitorMemoryUsage()
}

// Utility functions
export const measureTime = (name, fn, ...args) => {
  return performanceMonitor.measureFunction(name, fn, ...args)
}

export const recordMetric = (name, value, metadata) => {
  performanceMonitor.recordMetric(name, value, metadata)
}

export const startTiming = (name) => {
  performanceMonitor.startTiming(name)
}

export const endTiming = (name) => {
  return performanceMonitor.endTiming(name)
}
