<template>
  <div class="optimized-loading" :class="{ 'fullscreen': fullscreen }">
    <!-- Skeleton Loading -->
    <div v-if="type === 'skeleton'" class="skeleton-container">
      <div v-for="i in count" :key="i" class="skeleton-item" :class="skeletonClass">
        <div class="skeleton-line skeleton-title"></div>
        <div class="skeleton-line skeleton-subtitle"></div>
        <div class="skeleton-line skeleton-text"></div>
        <div class="skeleton-line skeleton-text short"></div>
      </div>
    </div>

    <!-- Spinner Loading -->
    <div v-else-if="type === 'spinner'" class="spinner-container">
      <div class="spinner" :class="spinnerSize">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      <p v-if="message" class="loading-message">{{ message }}</p>
    </div>

    <!-- Pulse Loading -->
    <div v-else-if="type === 'pulse'" class="pulse-container">
      <div class="pulse-dot"></div>
      <div class="pulse-dot"></div>
      <div class="pulse-dot"></div>
    </div>

    <!-- Progress Loading -->
    <div v-else-if="type === 'progress'" class="progress-container">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <p v-if="message" class="loading-message">{{ message }}</p>
    </div>

    <!-- Default Loading -->
    <div v-else class="default-loading">
      <div class="loading-spinner"></div>
      <p v-if="message" class="loading-message">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'spinner',
    validator: (value) => ['skeleton', 'spinner', 'pulse', 'progress', 'default'].includes(value)
  },
  message: {
    type: String,
    default: ''
  },
  fullscreen: {
    type: Boolean,
    default: false
  },
  count: {
    type: Number,
    default: 3
  },
  skeletonClass: {
    type: String,
    default: 'card'
  },
  spinnerSize: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  progress: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0 && value <= 100
  }
})

const loadingMessage = computed(() => {
  if (props.message) return props.message

  switch (props.type) {
    case 'skeleton': return 'Loading content...'
    case 'spinner': return 'Please wait...'
    case 'pulse': return 'Loading...'
    case 'progress': return 'Processing...'
    default: return 'Loading...'
  }
})
</script>

<style scoped>
.optimized-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  min-height: 200px;
}

.optimized-loading.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 9999;
  min-height: 100vh;
}

/* Skeleton Loading */
.skeleton-container {
  width: 100%;
  max-width: 800px;
}

.skeleton-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-item.card {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.skeleton-line {
  height: 16px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 25%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 75%);
  background-size: 200% 100%;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  animation: skeleton-shimmer 2s infinite;
}

.skeleton-title {
  width: 60%;
  height: 20px;
}

.skeleton-subtitle {
  width: 40%;
  height: 16px;
}

.skeleton-text {
  width: 100%;
}

.skeleton-text.short {
  width: 70%;
}

/* Spinner Loading */
.spinner-container {
  text-align: center;
}

.spinner {
  display: inline-block;
  position: relative;
}

.spinner.small {
  width: 24px;
  height: 24px;
}

.spinner.medium {
  width: 40px;
  height: 40px;
}

.spinner.large {
  width: 60px;
  height: 60px;
}

.spinner-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top: 3px solid #f97306;
  border-radius: 50%;
  animation: spinner-rotate 1s linear infinite;
}

.spinner-ring:nth-child(2) {
  animation-delay: -0.3s;
  border-top-color: #e06804;
}

.spinner-ring:nth-child(3) {
  animation-delay: -0.6s;
  border-top-color: #d45a03;
}

/* Pulse Loading */
.pulse-container {
  display: flex;
  gap: 8px;
  align-items: center;
}

.pulse-dot {
  width: 12px;
  height: 12px;
  background: #f97306;
  border-radius: 50%;
  animation: pulse-bounce 1.4s ease-in-out infinite both;
}

.pulse-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.pulse-dot:nth-child(2) {
  animation-delay: -0.16s;
}

/* Progress Loading */
.progress-container {
  width: 100%;
  max-width: 300px;
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f97306, #e06804);
  border-radius: 4px;
  transition: width 0.3s ease;
  animation: progress-shimmer 2s infinite;
}

/* Default Loading */
.default-loading {
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top: 4px solid #f97306;
  border-radius: 50%;
  animation: spinner-rotate 1s linear infinite;
  margin: 0 auto 1rem;
}

.loading-message {
  color: #e0e0e0;
  font-size: 1rem;
  margin: 0;
  text-align: center;
}

/* Animations */
@keyframes skeleton-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes skeleton-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes spinner-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse-bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

@keyframes progress-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .optimized-loading {
    padding: 1rem;
    min-height: 150px;
  }

  .skeleton-item {
    padding: 1rem;
  }

  .spinner.large {
    width: 40px;
    height: 40px;
  }
}
</style>
