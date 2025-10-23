/**
 * Lazy Loading Composable
 * Provides optimized lazy loading for images and components
 */

import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useLazyLoad(options = {}) {
  const {
    rootMargin = '50px',
    threshold = 0.01,
    loadingClass = 'lazy-loading',
    loadedClass = 'lazy-loaded',
    errorClass = 'lazy-error'
  } = options

  const elements = ref(new Map())
  let observer = null

  /**
   * Initialize Intersection Observer
   */
  const initObserver = () => {
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(handleIntersect, {
        rootMargin,
        threshold
      })
    }
  }

  /**
   * Handle intersection
   */
  const handleIntersect = (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target
        loadElement(element)
        observer.unobserve(element)
      }
    })
  }

  /**
   * Load element (image or component)
   */
  const loadElement = (element) => {
    if (element.tagName === 'IMG') {
      loadImage(element)
    } else {
      loadComponent(element)
    }
  }

  /**
   * Load image
   */
  const loadImage = (img) => {
    const src = img.dataset.src
    const srcset = img.dataset.srcset

    img.classList.add(loadingClass)

    const tempImg = new Image()
    
    tempImg.onload = () => {
      if (src) img.src = src
      if (srcset) img.srcset = srcset
      
      img.classList.remove(loadingClass)
      img.classList.add(loadedClass)
      
      // Remove data attributes
      delete img.dataset.src
      delete img.dataset.srcset
    }

    tempImg.onerror = () => {
      img.classList.remove(loadingClass)
      img.classList.add(errorClass)
    }

    if (src) tempImg.src = src
  }

  /**
   * Load component
   */
  const loadComponent = (element) => {
    element.classList.add(loadedClass)
    const event = new CustomEvent('lazyload', {
      detail: { element }
    })
    element.dispatchEvent(event)
  }

  /**
   * Observe element
   */
  const observe = (element) => {
    if (!observer) {
      initObserver()
    }

    if (observer && element) {
      observer.observe(element)
      elements.value.set(element, true)
    }
  }

  /**
   * Unobserve element
   */
  const unobserve = (element) => {
    if (observer && element) {
      observer.unobserve(element)
      elements.value.delete(element)
    }
  }

  /**
   * Cleanup
   */
  const cleanup = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
    elements.value.clear()
  }

  // Lifecycle hooks
  onMounted(() => {
    initObserver()
  })

  onBeforeUnmount(() => {
    cleanup()
  })

  return {
    observe,
    unobserve,
    cleanup
  }
}

/**
 * Lazy Image Component Helper
 */
export function useLazyImage(src, options = {}) {
  const {
    placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"%3E%3C/svg%3E',
    fadeInDuration = 300
  } = options

  const imageRef = ref(null)
  const isLoaded = ref(false)
  const hasError = ref(false)
  const currentSrc = ref(placeholder)

  const { observe, unobserve } = useLazyLoad({
    ...options,
    loadedClass: 'fade-in'
  })

  const load = () => {
    if (!imageRef.value) return

    const img = new Image()
    
    img.onload = () => {
      currentSrc.value = src
      isLoaded.value = true
      
      // Apply fade-in effect
      if (imageRef.value) {
        imageRef.value.style.transition = `opacity ${fadeInDuration}ms ease-in-out`
        imageRef.value.style.opacity = '1'
      }
    }

    img.onerror = () => {
      hasError.value = true
    }

    img.src = src
  }

  onMounted(() => {
    if (imageRef.value) {
      imageRef.value.style.opacity = '0'
      observe(imageRef.value)
      imageRef.value.addEventListener('lazyload', load)
    }
  })

  onBeforeUnmount(() => {
    if (imageRef.value) {
      unobserve(imageRef.value)
      imageRef.value.removeEventListener('lazyload', load)
    }
  })

  return {
    imageRef,
    currentSrc,
    isLoaded,
    hasError
  }
}

/**
 * Lazy Component Loader
 */
export function useLazyComponent(loader, options = {}) {
  const {
    delay = 200,
    timeout = 10000
  } = options

  const componentRef = ref(null)
  const isLoading = ref(false)
  const isLoaded = ref(false)
  const error = ref(null)

  const { observe, unobserve } = useLazyLoad(options)

  const load = async () => {
    if (isLoading.value || isLoaded.value) return

    isLoading.value = true

    try {
      // Add minimum delay for smoother UX
      const [component] = await Promise.all([
        loader(),
        new Promise(resolve => setTimeout(resolve, delay))
      ])

      componentRef.value = component
      isLoaded.value = true
    } catch (err) {
      error.value = err
      console.error('Error loading lazy component:', err)
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => {
    if (componentRef.value) {
      observe(componentRef.value)
      componentRef.value.addEventListener('lazyload', load)
    }
  })

  onBeforeUnmount(() => {
    if (componentRef.value) {
      unobserve(componentRef.value)
      componentRef.value.removeEventListener('lazyload', load)
    }
  })

  return {
    componentRef,
    component: componentRef,
    isLoading,
    isLoaded,
    error,
    load
  }
}

