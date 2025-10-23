// Profile JavaScript Logic
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useAuthStore } from '@/stores/auth'
import { useNotifications } from '@/composables/useNotifications'

export function useProfileState() {
  // Form data
  const profileForm = reactive({
    name: '',
    email: '',
    shippingAddress: {
      address: '',
      city: '',
      state: '',
      zip: ''
    },
    billingAddress: {
      address: '',
      city: '',
      state: '',
      zip: ''
    }
  })

  // UI state
  const isLoading = ref(false)
  const sameAsShipping = ref(true)

  // Auto-save functionality
  const autoSaveToLocalStorage = () => {
    try {
      // Only save if we have at least name or email
      if (!profileForm.name && !profileForm.email) {
        return
      }
      
      localStorage.setItem('profile_form_data', JSON.stringify({
        name: profileForm.name || '',
        email: profileForm.email || '',
        shippingAddress: profileForm.shippingAddress || { address: '', city: '', state: '', zip: '' },
        billingAddress: profileForm.billingAddress || { address: '', city: '', state: '', zip: '' },
        lastUpdated: Date.now()
      }))
      } catch (error) {
      console.warn('Failed to auto-save profile data:', error)
    }
  }

  // Load from localStorage on initialization
  const loadFromLocalStorage = () => {
    try {
      const savedData = localStorage.getItem('profile_form_data')
      if (savedData) {
        const parsed = JSON.parse(savedData)
        // Only load if data is recent (within 24 hours)
        if (Date.now() - parsed.lastUpdated < 24 * 60 * 60 * 1000) {
          profileForm.name = parsed.name || ''
          profileForm.email = parsed.email || ''
          profileForm.shippingAddress = parsed.shippingAddress || { address: '', city: '', state: '', zip: '' }
          profileForm.billingAddress = parsed.billingAddress || { address: '', city: '', state: '', zip: '' }
          }
      }
    } catch (error) {
      console.warn('Failed to load profile data from localStorage:', error)
    }
  }

  return {
    profileForm,
    isLoading,
    sameAsShipping,
    autoSaveToLocalStorage,
    loadFromLocalStorage
  }
}

export function useProfileAuth() {
  const router = useRouter()
  const authStore = useAuthStore()
  const { user, isAuthenticated, handleLogout: authLogout } = useAuth()
  const { success, error: showError } = useNotifications()

  const isLoggedIn = computed(() => isAuthenticated.value)

  return {
    router,
    authStore,
    user,
    isAuthenticated,
    authLogout,
    success,
    showError,
    isLoggedIn
  }
}

export function useProfileActions() {
  // Create refs for success and error states
  const success = ref('')
  const showError = ref('')

  const toggleBillingAddress = (sameAsShipping, profileForm) => {
    if (sameAsShipping.value) {
      // Copy shipping address to billing
      profileForm.billingAddress = { ...profileForm.shippingAddress }
    }
  }

  const saveAddresses = async (shippingData, billingData) => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      // Save shipping address
      if (shippingData.address_line_1) {
        const shippingResponse = await fetch('/api/user/addresses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify(shippingData)
        })

        if (shippingResponse.ok) {
          } else {
          }
      }

      // Save billing address
      if (billingData.address_line_1) {
        const billingResponse = await fetch('/api/user/addresses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify(billingData)
        })

        if (billingResponse.ok) {
          } else {
          }
      }
    } catch (error) {
      console.error('❌ Error saving addresses:', error)
    }
  }

  const loadAddresses = async (profileForm) => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch('/api/user/addresses', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data && result.data.length > 0) {
          const addresses = result.data

          // Find shipping address (home type)
          const shippingAddr = addresses.find(addr => addr.type === 'home')
          if (shippingAddr) {
            profileForm.shippingAddress = {
              address: shippingAddr.address_line_1 || '',
              city: shippingAddr.city || '',
              state: shippingAddr.state || '',
              zip: shippingAddr.postal_code || ''
            }
            }

          // Find billing address (work type)
          const billingAddr = addresses.find(addr => addr.type === 'work')
          if (billingAddr) {
            profileForm.billingAddress = {
              address: billingAddr.address_line_1 || '',
              city: billingAddr.city || '',
              state: billingAddr.state || '',
              zip: billingAddr.postal_code || ''
            }
            }
        } else {
          // Set default empty addresses
          profileForm.shippingAddress = { address: '', city: '', state: '', zip: '' }
          profileForm.billingAddress = { address: '', city: '', state: '', zip: '' }
        }
      } else {
        // Set default empty addresses
        profileForm.shippingAddress = { address: '', city: '', state: '', zip: '' }
        profileForm.billingAddress = { address: '', city: '', state: '', zip: '' }
      }
    } catch (error) {
      console.error('❌ Error loading addresses:', error)
      // Set default empty addresses
      profileForm.shippingAddress = { address: '', city: '', state: '', zip: '' }
      profileForm.billingAddress = { address: '', city: '', state: '', zip: '' }
    }
  }

  const loadUserData = async (profileForm, user) => {
    try {
      // First, try to load from localStorage as immediate fallback
      const storedUserData = localStorage.getItem('user_data') || localStorage.getItem('user')
      const storedUser = storedUserData ? JSON.parse(storedUserData) : {}
      
      ,
        hasUser: !!localStorage.getItem('user'),
        storedUser: storedUser
      })
      
      if (storedUser.first_name || storedUser.name) {
        const firstName = storedUser.first_name || storedUser.name?.split(' ')[0] || ''
        const lastName = storedUser.last_name || storedUser.name?.split(' ').slice(1).join(' ') || ''
        
        profileForm.name = `${firstName} ${lastName}`.trim()
        profileForm.email = storedUser.email || ''
        
        } else {
        }

      // Load profile data from database using user profile endpoint
      const token = localStorage.getItem('auth_token')
      if (!token) {
        return
      }

      + '...')
      
      const response = await fetch('http://127.0.0.1:8000/api/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (response.status === 401) {
        const storedUser = JSON.parse(localStorage.getItem('user_data') || localStorage.getItem('user') || '{}')
        }

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          const userData = result.data.user || result.data

          // Fill form with data from database
          profileForm.name = `${userData.first_name || ''} ${userData.last_name || ''}`.trim()
          profileForm.email = userData.email || ''

          // Update auth store with fresh data
          if (user.value) {
            user.value.first_name = userData.first_name
            user.value.last_name = userData.last_name
            user.value.email = userData.email
            localStorage.setItem('user', JSON.stringify(user.value))
            }

          // Save to localStorage for persistence (even without Save button)
          localStorage.setItem('profile_form_data', JSON.stringify({
            name: profileForm.name,
            email: profileForm.email,
            shippingAddress: profileForm.shippingAddress,
            billingAddress: profileForm.billingAddress,
            lastUpdated: Date.now()
          }))

          // Load addresses
          await loadAddresses(profileForm)
        } else {
          }
      } else {
        // Fallback to auth user endpoint
        const authResponse = await fetch('http://127.0.0.1:8000/api/auth/user', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })

        if (authResponse.ok) {
          const authResult = await authResponse.json()
          if (authResult.success) {
            const userData = authResult.data || authResult.user
            
            // Handle both response formats
            const firstName = userData.first_name || userData.name?.split(' ')[0] || ''
            const lastName = userData.last_name || userData.name?.split(' ').slice(1).join(' ') || ''
            
            profileForm.name = `${firstName} ${lastName}`.trim()
            profileForm.email = userData.email || ''
            
            // Save to localStorage for persistence
            if (profileForm.name || profileForm.email) {
              localStorage.setItem('profile_form_data', JSON.stringify({
                name: profileForm.name,
                email: profileForm.email,
                shippingAddress: profileForm.shippingAddress,
                billingAddress: profileForm.billingAddress,
                lastUpdated: Date.now()
              }))
            }
          }
        } else {
          // Final fallback to localStorage user_data
          const storedUser = JSON.parse(localStorage.getItem('user_data') || localStorage.getItem('user') || '{}')
          if (storedUser.first_name || storedUser.name) {
            const firstName = storedUser.first_name || storedUser.name?.split(' ')[0] || ''
            const lastName = storedUser.last_name || storedUser.name?.split(' ').slice(1).join(' ') || ''
            
            profileForm.name = `${firstName} ${lastName}`.trim()
            profileForm.email = storedUser.email || ''
            
            }
        }
      }

      } catch (error) {
      console.error('❌ Error loading profile data:', error)

      // Fallback to localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      if (storedUser.first_name) {
        profileForm.name = `${storedUser.first_name || ''} ${storedUser.last_name || ''}`.trim()
        profileForm.email = storedUser.email || ''
        }
    }
  }

  const handleSubmit = async (profileForm, isLoading, success, showError, user, loadUserData) => {
    if (isLoading && isLoading.value !== undefined) {
      isLoading.value = true
    }

    try {
      // Prepare data for API
      const name = profileForm.name || ''
      const nameParts = name.trim().split(' ')
      const updateData = {
        first_name: nameParts[0] || '',
        last_name: nameParts.slice(1).join(' ') || '',
        email: profileForm.email || ''
      }

      // Prepare address data (with safe access)
      const shippingAddressData = {
        type: 'home',
        address_line_1: profileForm.shippingAddress?.address || '',
        city: profileForm.shippingAddress?.city || '',
        state: profileForm.shippingAddress?.state || '',
        postal_code: profileForm.shippingAddress?.zip || '',
        country: 'Egypt', // Default country
        is_default: true
      }

      const billingAddressData = {
        type: 'work',
        address_line_1: profileForm.billingAddress?.address || '',
        city: profileForm.billingAddress?.city || '',
        state: profileForm.billingAddress?.state || '',
        postal_code: profileForm.billingAddress?.zip || '',
        country: 'Egypt', // Default country
        is_default: false
      }

      ? 'exists' : 'missing')

      // Validate data - with better user experience
      if (!updateData.first_name || !updateData.first_name.trim()) {
        if (showError && showError.value !== undefined) {
          showError.value = 'Please enter your name'
        }
        // Don't throw error immediately, just show message and stop
        console.warn('⚠️ Validation failed: Name is required')
        return
      }
      
      if (!updateData.email || !updateData.email.trim()) {
        if (showError && showError.value !== undefined) {
          showError.value = 'Please enter your email address'
        }
        console.warn('⚠️ Validation failed: Email is required')
        return
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(updateData.email)) {
        if (showError && showError.value !== undefined) {
          showError.value = 'Please enter a valid email address'
        }
        console.warn('⚠️ Validation failed: Invalid email format')
        return
      }

      // Call backend API to update profile
      const response = await fetch('http://127.0.0.1:8000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          if (success && success.value !== undefined) {
            success.value = 'Profile updated successfully!'
          }

          // Update user data in auth store
          if (user.value) {
            user.value.first_name = updateData.first_name
            user.value.last_name = updateData.last_name
            user.value.email = updateData.email
            }

          // Update localStorage
          localStorage.setItem('user', JSON.stringify(user.value))
          // Save addresses if they have data
          await saveAddresses(shippingAddressData, billingAddressData)

          // Reload data to confirm it's saved
          await loadUserData(profileForm, user)

          } else {
          console.error('❌ API returned success: false')
          throw new Error(result.message || 'Failed to update profile')
        }
      } else {
        let errorMessage = 'Failed to update profile'
        try {
          const errorData = await response.json()
          console.error('❌ Profile update error response:', errorData)
          errorMessage = errorData.message || errorData.errors || 'Failed to update profile'
        } catch (e) {
          console.error('❌ Could not parse error response')
        }
        throw new Error(errorMessage)
      }

    } catch (error) {
      console.error('❌ Profile update error:', error)
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        profileForm: {
          name: profileForm.name,
          email: profileForm.email,
          hasShippingAddress: !!profileForm.shippingAddress,
          hasBillingAddress: !!profileForm.billingAddress
        }
      })
      if (showError && showError.value !== undefined) {
        showError.value = error.message || 'Failed to update profile. Please try again.'
      }
    } finally {
      if (isLoading && isLoading.value !== undefined) {
        isLoading.value = false
      }
    }
  }

  const handleLogout = async (authLogout, success, router, showError) => {
    try {
      await authLogout()
      if (success && success.value !== undefined) {
        success.value = 'Logged out successfully!'
      }
      router.push('/')
    } catch (error) {
      if (showError && showError.value !== undefined) {
        showError.value = 'Failed to logout. Please try again.'
      }
    }
  }

  return {
    toggleBillingAddress,
    saveAddresses,
    loadAddresses,
    loadUserData,
    handleSubmit,
    handleLogout,
    success,
    showError
  }
}

export function initializeProfile() {
  return {
    onMounted: async (authStore, user, isAuthenticated, router, loadUserData, profileForm) => {
      // Check localStorage directly first
      const storedToken = localStorage.getItem('auth_token')
      const storedUserData = localStorage.getItem('user_data') || localStorage.getItem('user')
      const storedUser = storedUserData ? JSON.parse(storedUserData) : {}
      
      )

      // Load immediately from localStorage for better UX
      if (storedUser.first_name || storedUser.name) {
        const firstName = storedUser.first_name || storedUser.name?.split(' ')[0] || ''
        const lastName = storedUser.last_name || storedUser.name?.split(' ').slice(1).join(' ') || ''
        
        profileForm.name = `${firstName} ${lastName}`.trim()
        profileForm.email = storedUser.email || ''
        
        }

      if (!storedToken) {
        router.push('/login')
        return
      }

      // Initialize auth store
      await authStore.initializeAuth()

      // Load user data from API (will update if available)
      await loadUserData(profileForm, user)

      }
  }
}
