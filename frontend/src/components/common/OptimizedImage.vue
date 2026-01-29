<template>
  <div class="optimized-image-wrapper" :class="wrapperClass">
    <img
      ref="imageRef"
      :src="currentSrc"
      :alt="alt"
      :class="['optimized-image', imageClass, { 'is-loaded': isLoaded, 'has-error': hasError }]"
      :loading="lazyLoad ? 'lazy' : 'eager'"
      @load="handleLoad"
      @error="handleError"
    />

    <!-- Loading skeleton -->
    <div v-if="!isLoaded && !hasError" class="image-skeleton">
      <div class="skeleton-shimmer"></div>
    </div>

    <!-- Error fallback -->
    <div v-if="hasError" class="image-error">
      <svg
        class="error-icon"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <span v-if="showErrorText">{{ errorText }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default:
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23f0f0f0"/%3E%3C/svg%3E',
  },
  lazyLoad: {
    type: Boolean,
    default: true,
  },
  fadeInDuration: {
    type: Number,
    default: 300,
  },
  imageClass: {
    type: String,
    default: '',
  },
  wrapperClass: {
    type: String,
    default: '',
  },
  showErrorText: {
    type: Boolean,
    default: false,
  },
  errorText: {
    type: String,
    default: 'Image failed to load',
  },
  observerOptions: {
    type: Object,
    default: () => ({
      rootMargin: '50px',
      threshold: 0.01,
    }),
  },
});

const emit = defineEmits(['load', 'error']);

// State
const imageRef = ref(null);
const isLoaded = ref(false);
const hasError = ref(false);
const currentSrc = ref(props.placeholder);
const observer = ref(null);

// Start loading image
const loadImage = () => {
  if (isLoaded.value || hasError.value) return;

  const img = new Image();

  img.onload = () => {
    currentSrc.value = props.src;
    // isLoaded will be set by @load event
  };

  img.onerror = () => {
    hasError.value = true;
    emit('error', new Error('Failed to load image'));
  };

  img.src = props.src;
};

// Handle image load
const handleLoad = () => {
  isLoaded.value = true;
  emit('load');
};

// Handle image error
const handleError = () => {
  hasError.value = true;
  emit('error', new Error('Image load error'));
};

// Initialize Intersection Observer for lazy loading
const initObserver = () => {
  if (!props.lazyLoad || typeof IntersectionObserver === 'undefined') {
    loadImage();
    return;
  }

  observer.value = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        loadImage();
        if (observer.value) {
          observer.value.disconnect();
        }
      }
    });
  }, props.observerOptions);

  if (imageRef.value) {
    observer.value.observe(imageRef.value);
  }
};

// Cleanup observer
const cleanup = () => {
  if (observer.value) {
    observer.value.disconnect();
    observer.value = null;
  }
};

// Watch for src changes
watch(
  () => props.src,
  () => {
    isLoaded.value = false;
    hasError.value = false;
    currentSrc.value = props.placeholder;
    initObserver();
  }
);

// Lifecycle
onMounted(() => {
  initObserver();
});

onBeforeUnmount(() => {
  cleanup();
});
</script>

<style scoped>
.optimized-image-wrapper {
  position: relative;
  overflow: hidden;
  background-color: #f0f0f0;
}

.optimized-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.optimized-image.is-loaded {
  opacity: 1;
}

.optimized-image.has-error {
  display: none;
}

/* Loading Skeleton */
.image-skeleton {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #f0f0f0;
  overflow: hidden;
}

.skeleton-shimmer {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 20%, #f0f0f0 40%, #f0f0f0 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Error State */
.image-error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
  color: #9ca3af;
}

.error-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 8px;
  opacity: 0.5;
}

.image-error span {
  font-size: 14px;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .error-icon {
    width: 32px;
    height: 32px;
  }

  .image-error span {
    font-size: 12px;
  }
}
</style>
