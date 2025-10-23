import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useNotifications } from '@/composables/useNotifications'
import { useImages } from '@/composables/useImages'

// Use images composable
export const useHomeImages = () => {
  const {
    heroImage,
    featuredImages,
    categoryImages,
    instagramImages,
    loading: imagesLoading,
    error: imagesError,
    loadImagesFromAPI,
    refreshImages,
    getAllImagesFromDB
  } = useImages()

  return {
    heroImage,
    featuredImages,
    categoryImages,
    instagramImages,
    imagesLoading,
    imagesError,
    loadImagesFromAPI,
    refreshImages,
    getAllImagesFromDB
  }
}

// Handle logout
export const handleLogout = async (authLogout, success) => {
  try {
    await authLogout()
    success('Logged out successfully!')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// Handle profile click based on user role
export const handleProfileClick = (isAuthenticated, user, router) => {
  // Check if user is authenticated and has data
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }

  if (!user.value) {
    router.push('/login')
    return
  }

  if (user.value.role === 'admin') {
    window.location.href = '/admin/dashboard'
  } else {
    window.location.href = '/profile'
  }
}

// Initialize navbar scroll effects
export const initializeNavbarScroll = () => {
  const navbar = document.getElementById('navbar')
  if (!navbar) return

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('bg-black/80', 'border-stone-800/80')
      navbar.classList.remove('bg-black/30')
    } else {
      navbar.classList.remove('bg-black/80', 'border-stone-800/80')
      navbar.classList.add('bg-black/30')
    }
  })
}

// Initialize scroll progress
export const initializeScrollProgress = () => {
  const scrollProgress = document.getElementById('scroll-progress')
  const progressValue = document.getElementById('progress-value')

  if (!scrollProgress) return

  const calcScrollValue = () => {
    const pos = document.documentElement.scrollTop
    const calcHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
    const scrollValue = Math.round((pos * 100) / calcHeight)

    if (pos > 100) {
      scrollProgress.classList.add('visible')
    } else {
      scrollProgress.classList.remove('visible')
    }

    scrollProgress.style.background = `radial-gradient(closest-side, var(--dark-bg) 79%, transparent 80% 100%), conic-gradient(var(--primary-orange) ${scrollValue}%, var(--accent-green) ${scrollValue}%)`

    scrollProgress.addEventListener('click', () => {
      document.documentElement.scrollTop = 0
    })
  }

  window.onscroll = calcScrollValue
  window.onload = calcScrollValue
}

// Initialize review popup
export const initializeReviewPopup = () => {
  const reviewPopup = document.getElementById('review-popup')
  if (!reviewPopup) return

  setTimeout(() => {
    reviewPopup.style.transform = 'translateY(0)'
  }, 5000)

  setTimeout(() => {
    reviewPopup.style.transform = 'translateY(200%)'
  }, 10000)
}

// Override image fetching functions
export const overrideImageFunctions = () => {
  if (window.getImagesByCategory) {
    window.getImagesByCategory = () => Promise.resolve([])
  }
  if (window.getHomePageImages) {
    window.getHomePageImages = () => Promise.resolve([])
  }
  if (window.fetchHomePageImages) {
    window.fetchHomePageImages = () => Promise.resolve([])
  }

  // Override fetch to prevent image API calls
  const originalFetch = window.fetch
  window.fetch = function(url, options) {
    if (typeof url === 'string' && url.includes('/api/v1/images/category/')) {
      return Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Image API disabled' })
      })
    }
    return originalFetch.call(this, url, options)
  }
}

// Main initialization function
export const initializeHome = async (
  isAuthenticated,
  user,
  isAdmin,
  initializeAuthState,
  loadImagesFromAPI,
  getAllImagesFromDB
) => {
  // Initialize auth state from localStorage
  initializeAuthState()
  
  // Load images from database with token
  await loadImagesFromAPI()

  // Debug: Show all images from database (only if user is authenticated and admin)
  if (isAuthenticated.value && isAdmin.value) {
    try {
      await getAllImagesFromDB()
    } catch (error) {
      console.error('Error getting all images from DB:', error.message)
    }
  }
  
  // Override image functions
  overrideImageFunctions()

  // Initialize UI effects
  initializeNavbarScroll()
  initializeScrollProgress()
  initializeReviewPopup()
}
