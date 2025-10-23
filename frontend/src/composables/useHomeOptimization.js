/**
 * Home Page Optimization
 * Optimizes Home page loading with preloading and caching
 */

import { ref, onMounted, onBeforeMount } from 'vue'
import advancedCache from '@/utils/advancedCache'
import performanceMonitor from '@/utils/performanceMonitorEnhanced'

export function useHomeOptimization() {
  const isLoading = ref(true)
  const error = ref(null)
  const sections = ref({
    hero: { loaded: false, data: null },
    featured: { loaded: false, data: null },
    categories: { loaded: false, data: null },
    newArrivals: { loaded: false, data: null },
    bestSellers: { loaded: false, data: null }
  })

  /**
   * Preload critical data
   */
  const preloadCriticalData = async () => {
    const measurement = performanceMonitor.startMeasure('home-preload', 'page-load')

    try {
      // Preload hero images
      const heroImages = [
        'https://assets.adidas.com/images/w_1880,f_auto,q_auto/b9724d8ce964432c830ac2065431ed31_9366/IH3083_HM3_hover.jpg'
      ]

      heroImages.forEach(url => {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'image'
        link.href = url
        document.head.appendChild(link)
      })

      // Preload fonts
      const fonts = [
        { family: 'Inter', weight: '400' },
        { family: 'Orbitron', weight: '700' }
      ]

      fonts.forEach(font => {
        const link = document.createElement('link')
        link.rel = 'preconnect'
        link.href = 'https://fonts.googleapis.com'
        document.head.appendChild(link)
      })

      performanceMonitor.endMeasure(measurement)
    } catch (err) {
      console.error('Preload error:', err)
    }
  }

  /**
   * Load section data with caching
   */
  const loadSection = async (sectionName, fetchFn) => {
    const cacheKey = `home_section_${sectionName}`
    
    // Try cache first
    const cached = advancedCache.get(cacheKey)
    if (cached) {
      sections.value[sectionName] = { loaded: true, data: cached }
      return cached
    }

    try {
      const measurement = performanceMonitor.startMeasure(`home-${sectionName}`, 'api-call')
      const data = await fetchFn()
      
      sections.value[sectionName] = { loaded: true, data }
      
      // Cache for 10 minutes
      advancedCache.set(cacheKey, data, 10 * 60 * 1000)
      
      performanceMonitor.endMeasure(measurement)
      return data
    } catch (err) {
      sections.value[sectionName] = { loaded: true, data: null }
      error.value = err
      console.error(`Error loading ${sectionName}:`, err)
      return null
    }
  }

  /**
   * Load all sections in priority order
   */
  const loadAllSections = async (fetchFunctions) => {
    const measurement = performanceMonitor.startMeasure('home-load-all', 'page-load')

    try {
      // Priority 1: Hero and Featured (critical)
      await Promise.all([
        loadSection('hero', fetchFunctions.hero),
        loadSection('featured', fetchFunctions.featured)
      ])

      // Priority 2: Categories (above fold)
      await loadSection('categories', fetchFunctions.categories)

      // Priority 3: Below fold content (lazy load)
      setTimeout(async () => {
        await Promise.all([
          loadSection('newArrivals', fetchFunctions.newArrivals),
          loadSection('bestSellers', fetchFunctions.bestSellers)
        ])
      }, 100)

      performanceMonitor.endMeasure(measurement)
    } catch (err) {
      error.value = err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Prefetch next page data
   */
  const prefetchProductsPage = () => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = '/api/products?limit=12'
    document.head.appendChild(link)
  }

  /**
   * Optimize images loading
   */
  const optimizeImages = () => {
    // Add loading="lazy" to all images below the fold
    requestAnimationFrame(() => {
      const images = document.querySelectorAll('img')
      images.forEach((img, index) => {
        if (index > 5) { // First 5 images load eagerly
          img.loading = 'lazy'
        }
      })
    })
  }

  /**
   * Setup intersection observer for lazy sections
   */
  const setupLazySections = () => {
    if (typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const section = entry.target
            section.classList.add('visible')
            observer.unobserve(section)
          }
        })
      },
      { rootMargin: '50px' }
    )

    // Observe sections
    requestAnimationFrame(() => {
      const sections = document.querySelectorAll('[data-lazy-section]')
      sections.forEach(section => observer.observe(section))
    })
  }

  /**
   * Clear home cache
   */
  const clearCache = () => {
    advancedCache.invalidatePattern('home_section_')
  }

  // Lifecycle
  onBeforeMount(() => {
    preloadCriticalData()
  })

  onMounted(() => {
    performanceMonitor.measurePageLoad('Home')
    optimizeImages()
    setupLazySections()
    
    // Prefetch after 2 seconds
    setTimeout(prefetchProductsPage, 2000)
  })

  return {
    isLoading,
    error,
    sections,
    loadSection,
    loadAllSections,
    clearCache,
    prefetchProductsPage
  }
}

