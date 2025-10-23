import { ref, onMounted, onUnmounted } from 'vue'

export function useScroll() {
  const scrollY = ref(0)
  const scrollDirection = ref('down')
  const scrollProgress = ref(0)
  const isScrolling = ref(false)
  const lastScrollY = ref(0)

  const updateScroll = () => {
    scrollY.value = window.scrollY
    
    // Calculate scroll progress (0 to 100)
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight
    scrollProgress.value = Math.round((scrollY.value / documentHeight) * 100)
    
    // Determine scroll direction
    if (scrollY.value > lastScrollY.value) {
      scrollDirection.value = 'down'
    } else {
      scrollDirection.value = 'up'
    }
    
    lastScrollY.value = scrollY.value
    isScrolling.value = true
    
    // Reset scrolling flag after a delay
    clearTimeout(scrollTimeout)
    scrollTimeout = setTimeout(() => {
      isScrolling.value = false
    }, 150)
  }

  let scrollTimeout

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const scrollToElement = (elementId, offset = 0) => {
    const element = document.getElementById(elementId)
    if (element) {
      const elementPosition = element.offsetTop - offset
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
  }

  const scrollToSection = (sectionName) => {
    const section = document.querySelector(`[data-section="${sectionName}"]`)
    if (section) {
      const sectionPosition = section.offsetTop - 80 // Account for navbar height
      window.scrollTo({
        top: sectionPosition,
        behavior: 'smooth'
      })
    }
  }

  const isElementInViewport = (element, threshold = 0.1) => {
    if (!element) return false
    
    const rect = element.getBoundingClientRect()
    const windowHeight = window.innerHeight || document.documentElement.clientHeight
    
    return (
      rect.top <= windowHeight * (1 - threshold) &&
      rect.bottom >= windowHeight * threshold
    )
  }

  const isElementFullyInViewport = (element) => {
    if (!element) return false
    
    const rect = element.getBoundingClientRect()
    const windowHeight = window.innerHeight || document.documentElement.clientHeight
    const windowWidth = window.innerWidth || document.documentElement.clientWidth
    
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= windowHeight &&
      rect.right <= windowWidth
    )
  }

  onMounted(() => {
    window.addEventListener('scroll', updateScroll, { passive: true })
    updateScroll() // Initial call
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', updateScroll)
    if (scrollTimeout) {
      clearTimeout(scrollTimeout)
    }
  })

  return {
    scrollY,
    scrollDirection,
    scrollProgress,
    isScrolling,
    scrollToTop,
    scrollToElement,
    scrollToSection,
    isElementInViewport,
    isElementFullyInViewport
  }
}
