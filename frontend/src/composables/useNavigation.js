import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

export function useNavigation() {
  const router = useRouter()
  const { isAuthenticated, user, isAdmin } = useAuth()

  // Navigation state
  const isMenuOpen = ref(false)

  // Navigation methods
  const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value
  }

  const closeMenu = () => {
    isMenuOpen.value = false
  }

  const navigateTo = (route) => {
    router.push(route)
    closeMenu()
  }

  return {
    // State
    isMenuOpen,
    isAuthenticated,
    user,
    isAdmin,

    // Methods
    toggleMenu,
    closeMenu,
    navigateTo
  }
}
