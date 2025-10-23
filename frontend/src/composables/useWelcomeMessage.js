import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'

export function useWelcomeMessage() {
  const { getApiHeaders } = useAuth()

  const welcomeData = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const welcomeMessage = computed(() => welcomeData.value?.welcome_message || '')
  const greeting = computed(() => welcomeData.value?.greeting || '')
  const userName = computed(() => welcomeData.value?.user_name || '')
  const userType = computed(() => welcomeData.value?.user_type || '')
  const userTypeMessage = computed(() => welcomeData.value?.user_type_message || '')
  const lastLogin = computed(() => welcomeData.value?.last_login || '')
  const orderCount = computed(() => welcomeData.value?.order_count || 0)
  const wishlistCount = computed(() => welcomeData.value?.wishlist_count || 0)

  const fetchWelcomeMessage = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('http://127.0.0.1:8000/api/user/welcome-message', {
        method: 'GET',
        headers: getApiHeaders()
      })

      if (!response.ok) {
        throw new Error('Failed to fetch welcome message')
      }

      const data = await response.json()

      if (data.success) {
        welcomeData.value = data.data
        } else {
        throw new Error(data.message || 'Failed to get welcome message')
      }
    } catch (err) {
      error.value = err.message
      console.error('❌ Error fetching welcome message:', err)
    } finally {
      loading.value = false
    }
  }

  const getPersonalizedMessage = () => {
    if (!welcomeData.value) return ''

    const { greeting, user_name, user_type_message } = welcomeData.value
    return `${greeting} ${user_name}! ${user_type_message}`
  }

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours()

    if (hour >= 5 && hour < 12) {
      return 'Good Morning'
    } else if (hour >= 12 && hour < 17) {
      return 'Good Afternoon'
    } else if (hour >= 17 && hour < 22) {
      return 'Good Evening'
    } else {
      return 'Welcome'
    }
  }

  const getRoleBasedMessage = (role) => {
    switch (role) {
      case 'admin':
        return 'Welcome to Admin Dashboard'
      case 'vendor':
        return 'Welcome to Vendor Panel'
      case 'customer':
      default:
        return 'Welcome to SoleMate Store'
    }
  }

  return {
    // State
    welcomeData,
    loading,
    error,

    // Computed
    welcomeMessage,
    greeting,
    userName,
    userType,
    userTypeMessage,
    lastLogin,
    orderCount,
    wishlistCount,

    // Methods
    fetchWelcomeMessage,
    getPersonalizedMessage,
    getTimeBasedGreeting,
    getRoleBasedMessage
  }
}
