<template>
  <div class="lazy-image-container" :style="{ width: width, height: height }">
    <img
      v-if="loaded"
      :src="src"
      :alt="alt"
      :class="['lazy-image', imageClass]"
      :style="{ width: '100%', height: '100%', objectFit: 'cover' }"
      @load="onLoad"
      @error="onError"
    />
    <div
      v-else
      :class="['lazy-image-placeholder', placeholderClass]"
      :style="{ width: '100%', height: '100%', backgroundColor: placeholderColor }"
    >
      <div v-if="showSpinner" class="loading-spinner">
        <div class="spinner"></div>
      </div>
      <div v-else class="placeholder-content">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useLazyImage } from '@/composables/components/LazyImage.js';

// Props
const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: '',
  },
  width: {
    type: String,
    default: '100%',
  },
  height: {
    type: String,
    default: '200px',
  },
  placeholderColor: {
    type: String,
    default: '#f3f4f6',
  },
  imageClass: {
    type: String,
    default: '',
  },
  placeholderClass: {
    type: String,
    default: '',
  },
  showSpinner: {
    type: Boolean,
    default: true,
  },
  threshold: {
    type: Number,
    default: 0.1,
  },
  rootMargin: {
    type: String,
    default: '50px',
  },
});

// Use composable
const { loaded, error, onLoad, onError } = useLazyImage(props);
</script>

<style scoped>
@import '@/styles/components/LazyImage.css';
</style>
