import { ref, onMounted, onUnmounted } from 'vue'

// Lazy Image Composable
export function useLazyImage(props) {
  const loaded = ref(false)
  const error = ref(false)
  const observer = ref(null)

  const onLoad = () => {
    loaded.value = true
  }

  const onError = () => {
    error.value = true
    loaded.value = false
  }

  const loadImage = () => {
    if (loaded.value) return

    const img = new Image()
    img.onload = () => {
      loaded.value = true
    }
    img.onerror = () => {
      error.value = true
    }
    img.src = props.src
  }

  onMounted(() => {
    // Use Intersection Observer for lazy loading
    if ('IntersectionObserver' in window) {
      observer.value = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              loadImage()
              observer.value.unobserve(entry.target)
            }
          })
        },
        {
          threshold: props.threshold,
          rootMargin: props.rootMargin
        }
      )

      observer.value.observe(document.querySelector('.lazy-image-container'))
    } else {
      // Fallback for browsers without Intersection Observer
      loadImage()
    }
  })

  onUnmounted(() => {
    if (observer.value) {
      observer.value.disconnect()
    }
  })

  return {
    loaded,
    error,
    onLoad,
    onError
  }
}
