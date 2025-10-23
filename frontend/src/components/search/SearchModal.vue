<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="isOpen" class="search-modal-overlay" @click="close">
        <div class="search-modal" @click.stop>
          <div class="modal-header">
            <h3>Search Products</h3>
            <button @click="close" class="close-btn">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="modal-body">
            <SearchBar />
          </div>

          <div class="modal-footer">
            <p class="search-tip">
              <span class="material-symbols-outlined">lightbulb</span>
              <span>Tip: Try searching for brands, categories, or product names</span>
            </p>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import SearchBar from '@/components/search/SearchBar.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const isOpen = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  isOpen.value = newVal
})

watch(isOpen, (newVal) => {
  emit('update:modelValue', newVal)

  // Prevent body scroll when modal is open
  if (newVal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

const close = () => {
  isOpen.value = false
  emit('close')
}

// Handle ESC key
const handleEscape = (e) => {
  if (e.key === 'Escape' && isOpen.value) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.search-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 100px;
  z-index: 9999;
}

.search-modal {
  background: #231910;
  border: 1px solid #4a3421;
  border-radius: 16px;
  width: 90%;
  max-width: 700px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #4a3421;
}

.modal-header h3 {
  color: white;
  font-size: 20px;
  font-weight: 600;
}

.close-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #8b7355;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #2a1e12;
  color: #d4a574;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #4a3421;
}

.search-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #8b7355;
  font-size: 13px;
}

.search-tip .material-symbols-outlined {
  font-size: 18px;
  color: #d4a574;
}

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-active .search-modal,
.modal-fade-leave-active .search-modal {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .search-modal {
  transform: scale(0.9) translateY(-20px);
  opacity: 0;
}

.modal-fade-leave-to .search-modal {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .search-modal-overlay {
    padding-top: 60px;
  }

  .search-modal {
    width: 95%;
    max-width: none;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px;
  }
}
</style>
