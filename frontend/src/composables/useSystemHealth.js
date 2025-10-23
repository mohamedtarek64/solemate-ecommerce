/**
 * System Health Composable
 * Easy access to health check and error monitoring
 */

import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import healthCheckService from '@/services/healthCheckService'
import globalErrorHandler from '@/utils/globalErrorHandler'

export function useSystemHealth() {
  const healthStatus = ref(null)
  const isHealthy = ref(true)
  const errors = ref([])
  const checkInterval = ref(null)

  /**
   * Check system health
   */
  const checkHealth = async () => {
    try {
      const status = await healthCheckService.checkHealth()
      healthStatus.value = status
      isHealthy.value = status.status === 'healthy'
      return status
    } catch (error) {
      isHealthy.value = false
      return null
    }
  }

  /**
   * Get error stats
   */
  const getErrorStats = () => {
    return globalErrorHandler.getStats()
  }

  /**
   * Get recent errors
   */
  const getRecentErrors = (count = 10) => {
    errors.value = globalErrorHandler.getRecentErrors(count)
    return errors.value
  }

  /**
   * Clear errors
   */
  const clearErrors = () => {
    globalErrorHandler.clearErrors()
    errors.value = []
  }

  /**
   * Get system status
   */
  const getSystemStatus = () => {
    return healthCheckService.getSystemStatus()
  }

  /**
   * Check if backend is reachable
   */
  const isBackendReachable = async () => {
    return await healthCheckService.isBackendReachable()
  }

  // Computed
  const errorCount = computed(() => errors.value.length)
  const hasErrors = computed(() => errors.value.length > 0)
  const systemStatus = computed(() => getSystemStatus())

  return {
    // State
    healthStatus,
    isHealthy,
    errors,
    
    // Computed
    errorCount,
    hasErrors,
    systemStatus,
    
    // Methods
    checkHealth,
    getErrorStats,
    getRecentErrors,
    clearErrors,
    getSystemStatus,
    isBackendReachable
  }
}

