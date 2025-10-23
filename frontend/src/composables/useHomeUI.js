import { ref, onMounted, onUnmounted } from 'vue'
import LoggerService from '@/services/loggerService'

export function useHomeUI() {
  // UI States
  const isNavbarVisible = ref(true)
  const isMobileMenuOpen = ref(false)
  const isSearchOpen = ref(false)
  const searchQuery = ref('')
  const scrollProgress = ref(0)
  const isReviewPopupVisible = ref(false)

  // Navbar scroll effect
  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    isNavbarVisible.value = scrollTop < 100

    // Calculate scroll progress
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
    scrollProgress.value = (scrollTop / windowHeight) * 100
  }

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
  }

  // Toggle search
  const toggleSearch = () => {
    isSearchOpen.value = !isSearchOpen.value
    if (isSearchOpen.value) {
      // Focus search input after animation
      setTimeout(() => {
        const searchInput = document.querySelector('.search-input')
        if (searchInput) {
          searchInput.focus()
        }
      }, 100)
    }
  }

  // Close search
  const closeSearch = () => {
    isSearchOpen.value = false
    searchQuery.value = ''
  }

  // Handle search input
  const handleSearchInput = (event) => {
    searchQuery.value = event.target.value
    // Trigger search suggestions
    if (window.getSearchSuggestions) {
      window.getSearchSuggestions(searchQuery.value)
    }
  }

  // Handle search submit
  const handleSearchSubmit = (event) => {
    event.preventDefault()
    if (searchQuery.value.trim()) {
      // Search functionality placeholder
      LoggerService.userAction('Search submitted', { query: searchQuery.value })
      closeSearch()
    }
  }

  // Show review popup
  const showReviewPopup = () => {
    setTimeout(() => {
      isReviewPopupVisible.value = true
    }, 3000) // Show after 3 seconds
  }

  // Hide review popup
  const hideReviewPopup = () => {
    isReviewPopupVisible.value = false
  }

  // Close mobile menu when clicking outside
  const handleClickOutside = (event) => {
    if (isMobileMenuOpen.value && !event.target.closest('.mobile-menu')) {
      isMobileMenuOpen.value = false
    }
  }

  // Handle keyboard events
  const handleKeydown = (event) => {
    // Close search on Escape
    if (event.key === 'Escape' && isSearchOpen.value) {
      closeSearch()
    }

    // Close mobile menu on Escape
    if (event.key === 'Escape' && isMobileMenuOpen.value) {
      isMobileMenuOpen.value = false
    }

    // Open search on Ctrl+K or Cmd+K
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault()
      toggleSearch()
    }
  }

  // Initialize scroll progress indicator
  const initializeScrollProgress = () => {
    const progressElement = document.getElementById('scroll-progress')
    if (progressElement) {
      progressElement.style.transform = `rotate(${scrollProgress.value * 3.6}deg)`
    }
  }

  // Sticky navbar effect
  const initializeStickyNavbar = () => {
    const navbar = document.getElementById('navbar')
    if (navbar) {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled')
      } else {
        navbar.classList.remove('scrolled')
      }
    }
  }

  // Parallax effect for sections
  const initializeParallax = () => {
    const parallaxElements = document.querySelectorAll('.parallax')
    parallaxElements.forEach(element => {
      const speed = element.dataset.speed || 0.5
      const yPos = -(window.pageYOffset * speed)
      element.style.transform = `translateY(${yPos}px)`
    })
  }

  // Initialize animations
  const initializeAnimations = () => {
    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in')
        }
      })
    }, observerOptions)

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.animate-on-scroll')
    animateElements.forEach(el => observer.observe(el))
  }

  // Initialize all UI features
  const initializeUI = () => {
    initializeScrollProgress()
    initializeStickyNavbar()
    initializeParallax()
    initializeAnimations()
    showReviewPopup()
  }

  // Lifecycle hooks
  onMounted(() => {
    window.addEventListener('scroll', handleScroll)
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleKeydown)
    initializeUI()
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', handleKeydown)
  })

  return {
    // State
    isNavbarVisible,
    isMobileMenuOpen,
    isSearchOpen,
    searchQuery,
    scrollProgress,
    isReviewPopupVisible,

    // Actions
    toggleMobileMenu,
    toggleSearch,
    closeSearch,
    handleSearchInput,
    handleSearchSubmit,
    showReviewPopup,
    hideReviewPopup,

    // Initialization
    initializeUI
  }
}
