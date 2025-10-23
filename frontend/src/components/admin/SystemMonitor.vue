<template>
  <div class="system-monitor">
    <h3 class="monitor-title">System Health</h3>
    
    <!-- Overall Status -->
    <div class="status-card" :class="statusClass">
      <div class="status-indicator">
        <span class="status-dot" :class="statusClass"></span>
        <span class="status-text">{{ statusText }}</span>
      </div>
      <div class="status-time">
        Last check: {{ lastCheckTime }}
      </div>
    </div>

    <!-- Health Checks -->
    <div v-if="healthStatus" class="health-checks">
      <!-- Database -->
      <div class="check-item">
        <span class="check-label">Database</span>
        <span class="check-status" :class="getCheckClass(healthStatus.checks?.database?.status)">
          {{ healthStatus.checks?.database?.status || 'unknown' }}
        </span>
        <span v-if="healthStatus.checks?.database?.response_time" class="check-time">
          {{ healthStatus.checks?.database?.response_time }}
        </span>
      </div>

      <!-- Cache -->
      <div class="check-item">
        <span class="check-label">Cache</span>
        <span class="check-status" :class="getCheckClass(healthStatus.checks?.cache?.status)">
          {{ healthStatus.checks?.cache?.status || 'unknown' }}
        </span>
        <span v-if="healthStatus.checks?.cache?.response_time" class="check-time">
          {{ healthStatus.checks?.cache?.response_time }}
        </span>
      </div>

      <!-- Queue -->
      <div class="check-item">
        <span class="check-label">Queue</span>
        <span class="check-status" :class="getCheckClass(healthStatus.checks?.queue?.status)">
          {{ healthStatus.checks?.queue?.status || 'unknown' }}
        </span>
      </div>
    </div>

    <!-- Performance Metrics -->
    <div v-if="healthStatus?.performance" class="performance-metrics">
      <h4 class="metrics-title">Performance</h4>
      <div class="metric-item">
        <span class="metric-label">Response Time:</span>
        <span class="metric-value">{{ healthStatus.performance.execution_time }}</span>
      </div>
      <div class="metric-item">
        <span class="metric-label">Memory Usage:</span>
        <span class="metric-value">{{ healthStatus.performance.memory_usage }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="monitor-actions">
      <button @click="refreshHealth" class="refresh-btn" :disabled="isChecking">
        <span v-if="!isChecking">🔄 Refresh</span>
        <span v-else>⏳ Checking...</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useSystemHealth } from '@/composables/useSystemHealth'

const {
  healthStatus,
  isHealthy,
  checkHealth,
  systemStatus
} = useSystemHealth()

const isChecking = ref(false)
const lastCheckTime = ref('Never')

// Computed
const statusClass = computed(() => {
  if (!healthStatus.value) return 'unknown'
  return healthStatus.value.status === 'healthy' ? 'healthy' : 'unhealthy'
})

const statusText = computed(() => {
  if (!healthStatus.value) return 'Unknown'
  return healthStatus.value.status?.toUpperCase() || 'UNKNOWN'
})

// Methods
const refreshHealth = async () => {
  isChecking.value = true
  try {
    await checkHealth()
    updateLastCheckTime()
  } finally {
    isChecking.value = false
  }
}

const updateLastCheckTime = () => {
  const now = new Date()
  lastCheckTime.value = now.toLocaleTimeString()
}

const getCheckClass = (status) => {
  if (status === 'up') return 'check-up'
  if (status === 'down') return 'check-down'
  return 'check-unknown'
}

// Auto-refresh every minute
let autoRefreshInterval = null

onMounted(() => {
  refreshHealth()
  
  autoRefreshInterval = setInterval(() => {
    refreshHealth()
  }, 60000) // Every minute
})

onBeforeUnmount(() => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval)
  }
})
</script>

<style scoped>
.system-monitor {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.monitor-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.status-card {
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  border: 2px solid;
}

.status-card.healthy {
  background: #ecfdf5;
  border-color: #10b981;
}

.status-card.unhealthy {
  background: #fef2f2;
  border-color: #ef4444;
}

.status-card.unknown {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-dot.healthy {
  background: #10b981;
}

.status-dot.unhealthy {
  background: #ef4444;
}

.status-dot.unknown {
  background: #9ca3af;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-text {
  font-weight: 600;
  font-size: 0.875rem;
}

.status-time {
  font-size: 0.75rem;
  color: #6b7280;
}

.health-checks {
  margin: 1rem 0;
}

.check-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.check-label {
  font-weight: 500;
  color: #374151;
}

.check-status {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.check-status.check-up {
  background: #d1fae5;
  color: #065f46;
}

.check-status.check-down {
  background: #fee2e2;
  color: #991b1b;
}

.check-status.check-unknown {
  background: #e5e7eb;
  color: #6b7280;
}

.check-time {
  font-size: 0.75rem;
  color: #9ca3af;
}

.performance-metrics {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.metrics-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.875rem;
}

.metric-label {
  color: #6b7280;
}

.metric-value {
  font-weight: 600;
  color: #1f2937;
}

.monitor-actions {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.refresh-btn {
  width: 100%;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: #2563eb;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

