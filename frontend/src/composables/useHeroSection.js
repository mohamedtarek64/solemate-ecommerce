import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useWelcomeMessage } from '@/composables/useWelcomeMessage.js'
import { handleProfileClick } from '@/utils/authHelpers.js'

export function useHeroSection() {
  const router = useRouter()
  const { isAuthenticated, user, isAdmin } = useAuth()

  // Use welcome message composable
  const {
    welcomeMessage,
    greeting,
    userName,
    userType,
    userTypeMessage,
    lastLogin,
    orderCount,
    wishlistCount,
    loading: welcomeLoading,
    error: welcomeError,
    fetchWelcomeMessage
  } = useWelcomeMessage()

  // Hero image state
  const heroImage = ref(null)

  // Profile click handler
  const handleProfileClickAction = () => {
    handleProfileClick(user.value, isAdmin.value, router)
  }

  // Computed properties
  const displayName = computed(() => {
    if (!user.value) return 'User'
    return user.value.first_name || user.value.name || 'User'
  })

  const profileButtonText = computed(() => {
    if (!user.value) return 'View Profile'
    return user.value.role === 'admin' ? 'Admin Dashboard' : 'View Profile'
  })

  return {
    // State
    heroImage,
    isAuthenticated,
    user,
    isAdmin,

    // Welcome message
    welcomeMessage,
    greeting,
    userName,
    userType,
    userTypeMessage,
    lastLogin,
    orderCount,
    wishlistCount,
    welcomeLoading,
    welcomeError,
    fetchWelcomeMessage,

    // Computed
    displayName,
    profileButtonText,

    // Methods
    handleProfileClickAction
  }
}
