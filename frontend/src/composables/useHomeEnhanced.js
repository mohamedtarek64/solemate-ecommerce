/**
 * Enhanced Home Composable
 * Integrates all optimizations with existing Home.vue structure
 */

import { ref, onMounted } from 'vue'
import advancedCache from '@/utils/advancedCache'
import performanceMonitor from '@/utils/performanceMonitorEnhanced'

export function useHomeEnhanced() {
  const isInitializing = ref(true)
  const sectionsLoaded = ref({
    critical: false,    // Hero + Featured
    secondary: false,   // Categories + Men/Women/Kids
    lazy: false        // Adidas + Additional content
  })

  /**
   * Preload critical resources
   */
  const preloadCriticalResources = () => {
    // Preload hero image
    const heroImg = new Image()
    heroImg.src = 'https://assets.adidas.com/images/w_1880,f_auto,q_auto/b9724d8ce964432c830ac2065431ed31_9366/IH3083_HM3_hover.jpg'

    // Preconnect to API
    const preconnect = document.createElement('link')
    preconnect.rel = 'preconnect'
    preconnect.href = 'http://127.0.0.1:8000'
    document.head.appendChild(preconnect)
  }

  /**
   * Load critical content first
   */
  const loadCriticalContent = async (loadFunctions) => {
    const measurement = performanceMonitor.startMeasure('home-critical', 'page-load')

    try {
      // Load Featured Products (most important)
      const criticalTasks = []
      
      if (loadFunctions.featured) {
        criticalTasks.push(loadFunctions.featured())
      }
      
      if (loadFunctions.hero) {
        criticalTasks.push(loadFunctions.hero())
      }

      await Promise.all(criticalTasks)
      sectionsLoaded.value.critical = true
      
      performanceMonitor.endMeasure(measurement)
    } catch (error) {
      console.error('Error loading critical content:', error)
      performanceMonitor.endMeasure(measurement)
    }
  }

  /**
   * Load secondary content
   */
  const loadSecondaryContent = async (loadFunctions) => {
    const measurement = performanceMonitor.startMeasure('home-secondary', 'page-load')

    try {
      const secondaryTasks = []
      
      // Categories
      if (loadFunctions.categories) {
        secondaryTasks.push(loadFunctions.categories())
      }
      
      // Men Products
      if (loadFunctions.men) {
        secondaryTasks.push(loadFunctions.men())
      }
      
      // Women Products
      if (loadFunctions.women) {
        secondaryTasks.push(loadFunctions.women())
      }
      
      // Kids Products
      if (loadFunctions.kids) {
        secondaryTasks.push(loadFunctions.kids())
      }

      await Promise.all(secondaryTasks)
      sectionsLoaded.value.secondary = true
      
      performanceMonitor.endMeasure(measurement)
    } catch (error) {
      console.error('Error loading secondary content:', error)
      performanceMonitor.endMeasure(measurement)
    }
  }

  /**
   * Load lazy content (below fold)
   */
  const loadLazyContent = async (loadFunctions) => {
    const measurement = performanceMonitor.startMeasure('home-lazy', 'page-load')

    try {
      // Delay to prioritize above-fold content
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const lazyTasks = []
      
      if (loadFunctions.adidas) {
        lazyTasks.push(loadFunctions.adidas())
      }

      await Promise.all(lazyTasks)
      sectionsLoaded.value.lazy = true
      
      performanceMonitor.endMeasure(measurement)
    } catch (error) {
      console.error('Error loading lazy content:', error)
      performanceMonitor.endMeasure(measurement)
    }
  }

  /**
   * Initialize home page with optimized loading
   */
  const initializeOptimized = async (loadFunctions) => {
    const measurement = performanceMonitor.startMeasure('home-init', 'page-load')

    try {
      // Preload critical resources
      preloadCriticalResources()

      // Phase 1: Critical content (Featured + Hero)
      await loadCriticalContent(loadFunctions)

      // Phase 2: Secondary content (Categories + Product Sections)
      loadSecondaryContent(loadFunctions)

      // Phase 3: Lazy content (Adidas + Additional)
      loadLazyContent(loadFunctions)

      performanceMonitor.endMeasure(measurement)
    } catch (error) {
      console.error('Error initializing home:', error)
      performanceMonitor.endMeasure(measurement)
    } finally {
      isInitializing.value = false
    }
  }

  /**
   * Setup lazy loading for images
   */
  const setupLazyImages = () => {
    if (typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target
            const src = img.dataset.src
            if (src) {
              img.src = src
              img.classList.add('loaded')
              observer.unobserve(img)
            }
          }
        })
      },
      { rootMargin: '100px' }
    )

    requestAnimationFrame(() => {
      const lazyImages = document.querySelectorAll('img[data-src]')
      lazyImages.forEach(img => observer.observe(img))
    })
  }

  /**
   * Prefetch products page
   */
  const prefetchProductsPage = () => {
    setTimeout(() => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = '/products'
      document.head.appendChild(link)
    }, 2000)
  }

  /**
   * Get performance stats
   */
  const getPerformanceStats = () => {
    return performanceMonitor.getStats()
  }

  return {
    isInitializing,
    sectionsLoaded,
    initializeOptimized,
    setupLazyImages,
    prefetchProductsPage,
    getPerformanceStats,
    loadCriticalContent,
    loadSecondaryContent,
    loadLazyContent
  }
}

