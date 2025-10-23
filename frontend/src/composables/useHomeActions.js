import { ref } from 'vue'
import LoggerService from '@/services/loggerService'
import { useRouter } from 'vue-router'
import { useAuth } from './useAuth'
import { useAuthStore } from '@/stores/auth'
import { useNotifications } from './useNotifications'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'

export function useHomeActions() {
  const router = useRouter()
  const { isAuthenticated, user, isAdmin, handleLogout: authLogout } = useAuth()
  const authStore = useAuthStore()
  const { success, error } = useNotifications()
  const cartStore = useCartStore()
  const wishlistStore = useWishlistStore()

  // UI States
  const isAddingToCart = ref(false)
  const isWishlisting = ref(false)
  const selectedSize = ref(9)

  // Handle logout
  const handleLogout = async () => {
    try {
      await authLogout()
      success('Logged out successfully!')
    } catch (err) {
      LoggerService.error('Logout error', err, 'HomeActions.handleLogout')
      error('Failed to logout. Please try again.')
    }
  }

  // Handle profile click based on user role
  const handleProfileClick = () => {
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
      router.push('/admin/dashboard')
    } else {
      router.push('/profile')
    }
  }

  // Handle add to cart
  const handleAddToCart = async (product, size = null, color = null) => {
    try {
      isAddingToCart.value = true

      if (!isAuthenticated.value) {
        router.push('/login')
        return
      }

      // Use the new cart store with API integration
      await cartStore.addToCart(product, size || selectedSize.value, color)

      success(`${product.name} added to cart!`)
    } catch (err) {
      console.error('Add to cart error:', err)
      error('Failed to add to cart. Please try again.')
    } finally {
      isAddingToCart.value = false
    }
  }

  // Handle wishlist toggle
  const handleWishlistToggle = async (product, color = null, size = null) => {
    try {
      isWishlisting.value = true

      if (!isAuthenticated.value) {
        router.push('/login')
        return
      }

      // Use the new wishlist store with API integration
      await wishlistStore.toggleWishlist(product, color, size)

      const isInWishlist = wishlistStore.isInWishlist(product.id)
      const message = isInWishlist
        ? `${product.name} added to wishlist!`
        : `${product.name} removed from wishlist!`

      success(message)
    } catch (err) {
      console.error('Wishlist toggle error:', err)
      error('Failed to update wishlist. Please try again.')
    } finally {
      isWishlisting.value = false
    }
  }

  // Handle product view
  const handleProductView = (product) => {
    router.push(`/products/${product.id}`)
  }

  // Handle category click
  const handleCategoryClick = (category) => {
    router.push(category.route)
  }

  // Handle trending category click
  const handleTrendingCategoryClick = (category) => {
    router.push(category.route)
  }

  // Handle search
  const handleSearch = (query) => {
    if (query && query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`)
    }
  }

  // Handle search suggestion click
  const handleSearchSuggestion = (suggestion) => {
    router.push(`/products?search=${encodeURIComponent(suggestion.name)}`)
  }

  // Handle size selection
  const handleSizeSelection = (size) => {
    selectedSize.value = size
  }

  // Handle hero product add to cart
  const handleHeroAddToCart = async (product) => {
    await handleAddToCart(product, selectedSize.value)
  }

  // Handle navigation
  const navigateToProducts = () => {
    router.push('/products')
  }

  const navigateToLogin = () => {
    router.push('/login')
  }

  const navigateToRegister = () => {
    router.push('/register')
  }

  // Handle external links
  const handleExternalLink = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Handle social media links
  const handleSocialMediaClick = (platform) => {
    const socialUrls = {
      facebook: 'https://facebook.com/solemate',
      instagram: 'https://instagram.com/solemate',
      twitter: 'https://twitter.com/solemate'
    }

    if (socialUrls[platform]) {
      handleExternalLink(socialUrls[platform])
    }
  }

  return {
    // State
    isAddingToCart,
    isWishlisting,
    selectedSize,

    // Auth actions
    handleLogout,
    handleProfileClick,

    // Product actions
    handleAddToCart,
    handleWishlistToggle,
    handleProductView,
    handleHeroAddToCart,
    handleSizeSelection,

    // Navigation actions
    handleCategoryClick,
    handleTrendingCategoryClick,
    handleSearch,
    handleSearchSuggestion,
    navigateToProducts,
    navigateToLogin,
    navigateToRegister,

    // External actions
    handleExternalLink,
    handleSocialMediaClick
  }
}
