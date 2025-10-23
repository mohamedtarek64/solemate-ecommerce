/**
 * Health Check Service
 * Monitors backend health and system status
 */

import apiClient from '@/utils/apiClient'
import performanceMonitorEnhanced from '@/utils/performanceMonitorEnhanced'

class HealthCheckService {
  constructor() {
    this.healthStatus = null
    this.lastCheck = null
    this.checkInterval = null
    this.isHealthy = true
  }

  /**
   * Check backend health
   */
  async checkHealth() {
    const measurement = performanceMonitorEnhanced.startMeasure('health-check', 'api-call')

    try {
      const response = await fetch('http://127.0.0.1:8000/api/health', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      const data = await response.json()
      
      this.healthStatus = data
      this.lastCheck = Date.now()
      this.isHealthy = data.status === 'healthy'

      performanceMonitorEnhanced.endMeasure(measurement)

      return data
    } catch (error) {
      this.isHealthy = false
      this.healthStatus = {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      }

      performanceMonitorEnhanced.endMeasure(measurement)
      
      console.error('Health check failed:', error)
      return this.healthStatus
    }
  }

  /**
   * Get metrics from backend
   */
  async getMetrics() {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/metrics', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      return await response.json()
    } catch (error) {
      console.error('Failed to get metrics:', error)
      return null
    }
  }

  /**
   * Start periodic health checks
   */
  startMonitoring(interval = 60000) {
    // Initial check
    this.checkHealth()

    // Periodic checks
    this.checkInterval = setInterval(() => {
      this.checkHealth()
    }, interval)

    console.log('Health monitoring started')
  }

  /**
   * Stop health monitoring
   */
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
      }
  }

  /**
   * Get current health status
   */
  getStatus() {
    return {
      isHealthy: this.isHealthy,
      status: this.healthStatus,
      lastCheck: this.lastCheck,
      timeSinceLastCheck: this.lastCheck ? Date.now() - this.lastCheck : null
    }
  }

  /**
   * Check if backend is reachable
   */
  async isBackendReachable() {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/status', {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })
      return response.ok
    } catch (error) {
      return false
    }
  }

  /**
   * Get system status summary
   */
  getSystemStatus() {
    if (!this.healthStatus) {
      return {
        overall: 'unknown',
        message: 'No health check performed yet'
      }
    }

    const checks = this.healthStatus.checks || {}
    const allHealthy = Object.values(checks).every(check => check.status === 'up')

    return {
      overall: allHealthy ? 'healthy' : 'degraded',
      database: checks.database?.status || 'unknown',
      cache: checks.cache?.status || 'unknown',
      queue: checks.queue?.status || 'unknown',
      performance: this.healthStatus.performance,
      lastCheck: this.lastCheck
    }
  }

  /**
   * Show health notification
   */
  notifyHealthIssue(toast) {
    if (!this.isHealthy && toast) {
      toast.error('Backend service is experiencing issues. Some features may not work.', {
        timeout: 5000
      })
    }
  }
}

// Create singleton instance
const healthCheckService = new HealthCheckService()

// Expose to window for debugging
if (typeof window !== 'undefined') {
  window.__healthCheck__ = healthCheckService
}

export default healthCheckService

