<template>
  <div
    ref="containerRef"
    class="virtual-scroll-container"
    :style="containerStyle"
    @scroll="handleScroll"
  >
    <div class="virtual-scroll-spacer" :style="{ height: `${totalHeight}px` }">
      <div class="virtual-scroll-content" :style="{ transform: `translateY(${offsetY}px)` }">
        <slot
          v-for="item in visibleItems"
          :key="getItemKey(item)"
          name="item"
          :item="item"
          :index="item.__index"
        />
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="virtual-scroll-loading">
      <div class="loading-spinner"></div>
      <span>{{ loadingText }}</span>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && items.length === 0" class="virtual-scroll-empty">
      <slot name="empty">
        <p>{{ emptyText }}</p>
      </slot>
    </div>

    <!-- Load more trigger -->
    <div v-if="hasMore && !loading" ref="loadMoreRef" class="virtual-scroll-load-more">
      <slot name="load-more">
        <button class="load-more-button" @click="$emit('load-more')">
          {{ loadMoreText }}
        </button>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  itemHeight: {
    type: Number,
    default: 100,
  },
  buffer: {
    type: Number,
    default: 5,
  },
  containerHeight: {
    type: [Number, String],
    default: '100%',
  },
  itemKey: {
    type: [String, Function],
    default: 'id',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  loadingText: {
    type: String,
    default: 'Loading...',
  },
  emptyText: {
    type: String,
    default: 'No items to display',
  },
  hasMore: {
    type: Boolean,
    default: false,
  },
  loadMoreText: {
    type: String,
    default: 'Load More',
  },
  loadMoreThreshold: {
    type: Number,
    default: 200,
  },
});

const emit = defineEmits(['load-more', 'scroll']);

// Refs
const containerRef = ref(null);
const loadMoreRef = ref(null);
const scrollTop = ref(0);
const containerHeight = ref(0);

// Computed
const totalHeight = computed(() => props.items.length * props.itemHeight);

const visibleStart = computed(() => {
  const start = Math.floor(scrollTop.value / props.itemHeight) - props.buffer;
  return Math.max(0, start);
});

const visibleEnd = computed(() => {
  const itemsInView = Math.ceil(containerHeight.value / props.itemHeight);
  const end = visibleStart.value + itemsInView + props.buffer * 2;
  return Math.min(props.items.length, end);
});

const visibleItems = computed(() => {
  return props.items.slice(visibleStart.value, visibleEnd.value).map((item, index) => ({
    ...item,
    __index: visibleStart.value + index,
  }));
});

const offsetY = computed(() => {
  return visibleStart.value * props.itemHeight;
});

const containerStyle = computed(() => {
  const height =
    typeof props.containerHeight === 'number'
      ? `${props.containerHeight}px`
      : props.containerHeight;

  return {
    height,
    overflow: 'auto',
    position: 'relative',
  };
});

// Methods
const getItemKey = (item) => {
  if (typeof props.itemKey === 'function') {
    return props.itemKey(item);
  }
  return item[props.itemKey] || item.__index;
};

const handleScroll = (e) => {
  const target = e.target;
  scrollTop.value = target.scrollTop;

  emit('scroll', {
    scrollTop: target.scrollTop,
    scrollHeight: target.scrollHeight,
    clientHeight: target.clientHeight,
  });

  // Check if should load more
  if (props.hasMore && !props.loading) {
    const distanceToBottom = target.scrollHeight - (target.scrollTop + target.clientHeight);
    if (distanceToBottom < props.loadMoreThreshold) {
      emit('load-more');
    }
  }
};

const updateContainerHeight = () => {
  if (containerRef.value) {
    containerHeight.value = containerRef.value.clientHeight;
  }
};

const scrollToTop = () => {
  if (containerRef.value) {
    containerRef.value.scrollTop = 0;
  }
};

const scrollToIndex = (index) => {
  if (containerRef.value) {
    const targetScroll = index * props.itemHeight;
    containerRef.value.scrollTop = targetScroll;
  }
};

const scrollToBottom = () => {
  if (containerRef.value) {
    containerRef.value.scrollTop = totalHeight.value;
  }
};

// Watch for items changes
watch(
  () => props.items.length,
  () => {
    nextTick(() => {
      updateContainerHeight();
    });
  }
);

// Lifecycle
onMounted(() => {
  updateContainerHeight();

  // Setup resize observer
  if (typeof ResizeObserver !== 'undefined' && containerRef.value) {
    const resizeObserver = new ResizeObserver(() => {
      updateContainerHeight();
    });
    resizeObserver.observe(containerRef.value);

    onBeforeUnmount(() => {
      resizeObserver.disconnect();
    });
  }

  // Setup Intersection Observer for load more
  if (props.hasMore && loadMoreRef.value) {
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !props.loading) {
          emit('load-more');
        }
      },
      {
        threshold: 0.1,
      }
    );

    intersectionObserver.observe(loadMoreRef.value);

    onBeforeUnmount(() => {
      intersectionObserver.disconnect();
    });
  }
});

// Expose methods
defineExpose({
  scrollToTop,
  scrollToIndex,
  scrollToBottom,
  updateContainerHeight,
});
</script>

<style scoped>
.virtual-scroll-container {
  width: 100%;
  position: relative;
}

.virtual-scroll-spacer {
  position: relative;
  width: 100%;
}

.virtual-scroll-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  will-change: transform;
}

.virtual-scroll-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6b7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 0.75rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.virtual-scroll-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: #9ca3af;
  font-size: 1rem;
}

.virtual-scroll-load-more {
  display: flex;
  justify-content: center;
  padding: 1.5rem 1rem;
}

.load-more-button {
  padding: 0.75rem 2rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.load-more-button:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
}

.load-more-button:active {
  transform: translateY(0);
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .virtual-scroll-loading {
    padding: 1.5rem;
  }

  .loading-spinner {
    width: 32px;
    height: 32px;
  }

  .virtual-scroll-empty {
    padding: 2rem 1rem;
    font-size: 0.875rem;
  }

  .load-more-button {
    padding: 0.625rem 1.5rem;
    font-size: 0.875rem;
  }
}
</style>
