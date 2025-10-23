<template>
  <Transition name="toast">
    <div v-if="show" class="notification-toast" :class="[`toast-${type}`, { 'mobile-optimized': isMobile }]">
      <div class="toast-icon">
        <span class="material-symbols-outlined">
          {{ iconMap[type] }}
        </span>
      </div>
      <div class="toast-content">
        <div class="toast-message">{{ message }}</div>
        <div v-if="description" class="toast-description">{{ description }}</div>
        <div v-if="showCountdown" class="toast-countdown">
          <div class="countdown-bar" :style="{ animationDuration: duration + 'ms' }"></div>
        </div>
      </div>
      <button @click="close" class="toast-close">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  duration: {
    type: Number,
    default: 3000
  },
  position: {
    type: String,
    default: 'top-right',
    validator: (value) => ['top-right', 'top-left', 'top-center', 'bottom-right', 'bottom-left', 'bottom-center'].includes(value)
  },
  showCountdown: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['close'])

// State
const isMobile = ref(false)

// Icon mapping
const iconMap = {
  success: 'check_circle',
  error: 'error',
  warning: 'warning',
  info: 'info'
}

// Methods
const close = () => {
  emit('close')
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

// Lifecycle
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)

  // Auto close after duration
  if (props.duration > 0) {
    setTimeout(() => {
      close()
    }, props.duration)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.notification-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(249, 115, 22, 0.3);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  min-width: 320px;
  max-width: 400px;
  color: #f1f5f9;
  font-family: 'Inter', sans-serif;
}

.notification-toast.mobile-optimized {
  top: 10px;
  right: 10px;
  left: 10px;
  min-width: auto;
  max-width: none;
  padding: 12px;
  border-radius: 8px;
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.toast-success .toast-icon {
  color: #10b981;
}

.toast-error .toast-icon {
  color: #ef4444;
}

.toast-warning .toast-icon {
  color: #f59e0b;
}

.toast-info .toast-icon {
  color: #3b82f6;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-message {
  font-weight: 600;
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 4px;
}

.toast-description {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.4;
}

.toast-countdown {
  margin-top: 8px;
  height: 2px;
  background: rgba(148, 163, 184, 0.2);
  border-radius: 1px;
  overflow: hidden;
}

.countdown-bar {
  height: 100%;
  background: linear-gradient(90deg, #f97316, #fb923c);
  border-radius: 1px;
  animation: countdown linear;
}

@keyframes countdown {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

.toast-close {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.toast-close:hover {
  background: rgba(148, 163, 184, 0.1);
  color: #f1f5f9;
}

/* Position variants */
.notification-toast[class*="top-left"] {
  top: 20px;
  left: 20px;
  right: auto;
}

.notification-toast[class*="top-center"] {
  top: 20px;
  left: 50%;
  right: auto;
  transform: translateX(-50%);
}

.notification-toast[class*="bottom-right"] {
  top: auto;
  bottom: 20px;
  right: 20px;
}

.notification-toast[class*="bottom-left"] {
  top: auto;
  bottom: 20px;
  left: 20px;
  right: auto;
}

.notification-toast[class*="bottom-center"] {
  top: auto;
  bottom: 20px;
  left: 50%;
  right: auto;
  transform: translateX(-50%);
}

/* Mobile position adjustments */
.mobile-optimized[class*="top-left"],
.mobile-optimized[class*="top-center"],
.mobile-optimized[class*="bottom-left"],
.mobile-optimized[class*="bottom-center"] {
  top: 10px;
  right: 10px;
  left: 10px;
  bottom: auto;
  transform: none;
}

/* Animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-mobile-optimized.toast-enter-from,
.toast-mobile-optimized.toast-leave-to {
  transform: translateY(-100%);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .notification-toast {
    top: 10px;
    right: 10px;
    left: 10px;
    min-width: auto;
    max-width: none;
    padding: 12px;
    border-radius: 8px;
  }

  .toast-message {
    font-size: 13px;
  }

  .toast-description {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .notification-toast {
    top: 8px;
    right: 8px;
    left: 8px;
    padding: 10px;
  }
}
</style>
