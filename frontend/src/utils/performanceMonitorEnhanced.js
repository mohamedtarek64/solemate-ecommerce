/**
 * Enhanced Performance Monitor
 * Tracks and reports application performance metrics
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoads: [],
      apiCalls: [],
      componentRenders: [],
      userInteractions: [],
      errors: []
    }
    
    this.thresholds = {
      pageLoad: 3000,       // 3 seconds
      apiCall: 1000,        // 1 second
      componentRender: 16,  // 16ms (60fps)
      interaction: 100      // 100ms
    }
    
    this.maxMetrics = 100 // Keep only last 100 of each type
    this.isEnabled = import.meta.env.PROD ? false : true // Only in development by default
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled) {
    this.isEnabled = enabled
  }

  /**
   * Start measuring
   */
  startMeasure(name, type = 'custom') {
    if (!this.isEnabled) return
    
    const mark = `${name}-start`
    performance.mark(mark)
    
    return {
      name,
      type,
      mark,
      startTime: performance.now()
    }
  }

  /**
   * Start timing (compatibility method)
   */
  startTiming(name) {
    return this.startMeasure(name, 'custom')
  }

  /**
   * End measuring
   */
  endMeasure(measurement) {
    if (!this.isEnabled || !measurement) return null
    
    const endMark = `${measurement.name}-end`
    performance.mark(endMark)
    
    try {
      performance.measure(
        measurement.name,
        measurement.mark,
        endMark
      )
      
      const measure = performance.getEntriesByName(measurement.name)[0]
      const duration = measure ? measure.duration : performance.now() - measurement.startTime
      
      const metric = {
        name: measurement.name,
        type: measurement.type,
        duration: Math.round(duration * 100) / 100,
        timestamp: Date.now(),
        exceeded: this.checkThreshold(measurement.type, duration)
      }
      
      this.recordMetric(measurement.type, metric)
      
      return duration
    } catch (err) {
      console.warn('Performance measure failed:', err)
      return performance.now() - measurement.startTime
    }
  }

  /**
   * End timing (compatibility method)
   */
  endTiming(name) {
    const measurement = { name, mark: `${name}-start`, startTime: 0, type: 'custom' }
    return this.endMeasure(measurement)
  }

  /**
   * Check if duration exceeds threshold
   */
  checkThreshold(type, duration) {
    const typeKey = {
      'page-load': 'pageLoad',
      'api-call': 'apiCall',
      'component-render': 'componentRender',
      'interaction': 'interaction'
    }[type] || 'pageLoad'
    
    return duration > this.thresholds[typeKey]
  }

  /**
   * Record metric
   */
  recordMetric(type, metric) {
    const typeKey = {
      'page-load': 'pageLoads',
      'api-call': 'apiCalls',
      'component-render': 'componentRenders',
      'interaction': 'userInteractions'
    }[type] || 'pageLoads'
    
    this.metrics[typeKey].push(metric)
    
    // Keep only last N metrics
    if (this.metrics[typeKey].length > this.maxMetrics) {
      this.metrics[typeKey] = this.metrics[typeKey].slice(-this.maxMetrics)
    }
    
    // Log if exceeded threshold
    if (metric.exceeded) {
      console.warn(`⚠️ Performance: ${metric.name} took ${metric.duration}ms (threshold: ${this.thresholds[typeKey]}ms)`)
    }
  }

  /**
   * Measure page load
   */
  measurePageLoad(pageName) {
    if (!this.isEnabled) return
    
    const measurement = this.startMeasure(pageName, 'page-load')
    
    // Measure on next tick
    requestAnimationFrame(() => {
      this.endMeasure(measurement)
    })
  }

  /**
   * Measure API call
   */
  async measureApiCall(name, apiCallFn) {
    if (!this.isEnabled) {
      return await apiCallFn()
    }
    
    const measurement = this.startMeasure(name, 'api-call')
    
    try {
      const result = await apiCallFn()
      this.endMeasure(measurement)
      return result
    } catch (error) {
      this.endMeasure(measurement)
      this.recordError(name, error)
      throw error
    }
  }

  /**
   * Measure component render
   */
  measureRender(componentName, renderFn) {
    if (!this.isEnabled) {
      return renderFn()
    }
    
    const measurement = this.startMeasure(componentName, 'component-render')
    const result = renderFn()
    
    requestAnimationFrame(() => {
      this.endMeasure(measurement)
    })
    
    return result
  }

  /**
   * Measure user interaction
   */
  measureInteraction(actionName, actionFn) {
    if (!this.isEnabled) {
      return actionFn()
    }
    
    const measurement = this.startMeasure(actionName, 'interaction')
    
    try {
      const result = actionFn()
      
      if (result instanceof Promise) {
        return result.finally(() => {
          this.endMeasure(measurement)
        })
      }
      
      this.endMeasure(measurement)
      return result
    } catch (error) {
      this.endMeasure(measurement)
      throw error
    }
  }

  /**
   * Record error
   */
  recordError(context, error) {
    this.metrics.errors.push({
      context,
      message: error.message,
      stack: error.stack,
      timestamp: Date.now()
    })
    
    if (this.metrics.errors.length > this.maxMetrics) {
      this.metrics.errors = this.metrics.errors.slice(-this.maxMetrics)
    }
  }

  /**
   * Get Web Vitals
   */
  getWebVitals() {
    if (typeof window === 'undefined' || !window.performance) {
      return null
    }

    const navigation = performance.getEntriesByType('navigation')[0]
    const paint = performance.getEntriesByType('paint')
    
    return {
      // First Contentful Paint
      fcp: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
      
      // Largest Contentful Paint (requires observer)
      lcp: this.getLCP(),
      
      // Time to Interactive
      tti: navigation?.domInteractive || 0,
      
      // First Input Delay (requires observer)
      fid: this.getFID(),
      
      // Cumulative Layout Shift (requires observer)
      cls: this.getCLS(),
      
      // Total Blocking Time
      tbt: this.getTBT(navigation),
      
      // DOM Content Loaded
      dcl: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0,
      
      // Load Complete
      loadComplete: navigation?.loadEventEnd || 0
    }
  }

  /**
   * Get Largest Contentful Paint
   */
  getLCP() {
    // This would require PerformanceObserver
    // Simplified version
    return 0
  }

  /**
   * Get First Input Delay
   */
  getFID() {
    // This would require PerformanceObserver
    return 0
  }

  /**
   * Get Cumulative Layout Shift
   */
  getCLS() {
    // This would require PerformanceObserver
    return 0
  }

  /**
   * Get Total Blocking Time
   */
  getTBT(navigation) {
    if (!navigation) return 0
    
    const fcp = navigation.domContentLoadedEventEnd
    const tti = navigation.domInteractive
    
    return Math.max(0, tti - fcp)
  }

  /**
   * Get statistics
   */
  getStats() {
    const calculateStats = (metrics) => {
      if (metrics.length === 0) return { avg: 0, min: 0, max: 0, count: 0 }
      
      const durations = metrics.map(m => m.duration)
      return {
        avg: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
        min: Math.min(...durations),
        max: Math.max(...durations),
        count: metrics.length,
        exceeded: metrics.filter(m => m.exceeded).length
      }
    }
    
    return {
      pageLoads: calculateStats(this.metrics.pageLoads),
      apiCalls: calculateStats(this.metrics.apiCalls),
      componentRenders: calculateStats(this.metrics.componentRenders),
      userInteractions: calculateStats(this.metrics.userInteractions),
      errors: this.metrics.errors.length,
      webVitals: this.getWebVitals()
    }
  }

  /**
   * Get detailed report
   */
  getReport() {
    return {
      stats: this.getStats(),
      recentMetrics: {
        pageLoads: this.metrics.pageLoads.slice(-10),
        apiCalls: this.metrics.apiCalls.slice(-10),
        componentRenders: this.metrics.componentRenders.slice(-10),
        userInteractions: this.metrics.userInteractions.slice(-10),
        errors: this.metrics.errors.slice(-10)
      },
      thresholds: this.thresholds
    }
  }

  /**
   * Log report to console
   */
  logReport() {
    const report = this.getReport()
    console.group('📊 Performance Report')
    console.table(report.stats)
    console.groupEnd()
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics = {
      pageLoads: [],
      apiCalls: [],
      componentRenders: [],
      userInteractions: [],
      errors: []
    }
  }

  /**
   * Export metrics as JSON
   */
  exportMetrics() {
    return JSON.stringify(this.getReport(), null, 2)
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor()

// Expose to window for debugging
if (typeof window !== 'undefined') {
  window.__performanceMonitor__ = performanceMonitor
  }

export default performanceMonitor
export { performanceMonitor }

