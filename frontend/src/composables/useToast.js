import { ref } from 'vue'

const toasts = ref([])
let toastId = 0

export function useToast() {
  const showToast = (message, type = 'info', duration = 5000) => {
    const id = ++toastId
    const toast = {
      id,
      message,
      type,
      duration,
      removing: false,
      createdAt: Date.now()
    }
    
    toasts.value.push(toast)
    
    // Auto remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
    
    return id
  }
  
  const removeToast = (id) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      // Mark as removing for animation
      toasts.value[index].removing = true
      
      // Remove after animation completes
      setTimeout(() => {
        const currentIndex = toasts.value.findIndex(toast => toast.id === id)
        if (currentIndex > -1) {
          toasts.value.splice(currentIndex, 1)
        }
      }, 300)
    }
  }
  
  const clearAllToasts = () => {
    toasts.value = []
  }
  
  // Success toast shorthand
  const showSuccess = (message, duration = 4000) => {
    return showToast(message, 'success', duration)
  }
  
  // Error toast shorthand
  const showError = (message, duration = 6000) => {
    return showToast(message, 'error', duration)
  }
  
  // Warning toast shorthand
  const showWarning = (message, duration = 5000) => {
    return showToast(message, 'warning', duration)
  }
  
  // Info toast shorthand
  const showInfo = (message, duration = 4000) => {
    return showToast(message, 'info', duration)
  }
  
  return {
    toasts,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    clearAllToasts
  }
}
