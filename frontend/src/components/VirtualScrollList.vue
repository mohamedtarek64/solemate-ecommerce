<template>
  <div
    ref="container"
    class="virtual-scroll-container"
    @scroll="handleScroll"
  >
    <div
      class="virtual-scroll-spacer"
      :style="{ height: totalHeight + 'px' }"
    >
      <div
        class="virtual-scroll-content"
        :style="{ transform: `translateY(${offsetY}px)` }"
      >
        <div
          v-for="item in visibleItems"
          :key="getItemKey(item)"
          class="virtual-scroll-item"
          :style="{ height: itemHeight + 'px' }"
        >
          <slot
            :item="item"
            :index="getItemIndex(item)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

export default {
  name: 'VirtualScrollList',
  props: {
    items: {
      type: Array,
      required: true
    },
    itemHeight: {
      type: Number,
      default: 200
    },
    containerHeight: {
      type: Number,
      default: 400
    },
    overscan: {
      type: Number,
      default: 5
    }
  },
  setup(props) {
    const container = ref(null)
    const scrollTop = ref(0)

    const totalHeight = computed(() => props.items.length * props.itemHeight)

    const startIndex = computed(() => {
      return Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.overscan)
    })

    const endIndex = computed(() => {
      const visibleCount = Math.ceil(props.containerHeight / props.itemHeight)
      return Math.min(
        props.items.length - 1,
        startIndex.value + visibleCount + props.overscan * 2
      )
    })

    const visibleItems = computed(() => {
      return props.items.slice(startIndex.value, endIndex.value + 1)
    })

    const offsetY = computed(() => startIndex.value * props.itemHeight)

    const getItemKey = (item) => {
      return item.id || item.key || JSON.stringify(item)
    }

    const getItemIndex = (item) => {
      return props.items.indexOf(item)
    }

    const handleScroll = (event) => {
      scrollTop.value = event.target.scrollTop
    }

    const scrollToItem = (index) => {
      if (container.value) {
        container.value.scrollTop = index * props.itemHeight
      }
    }

    return {
      container,
      scrollTop,
      totalHeight,
      visibleItems,
      offsetY,
      getItemKey,
      getItemIndex,
      handleScroll,
      scrollToItem
    }
  }
}
</script>

<style scoped>
.virtual-scroll-container {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.virtual-scroll-spacer {
  position: relative;
}

.virtual-scroll-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.virtual-scroll-item {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
