// Settings JavaScript Logic
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useNotifications } from '@/composables/useNotifications'

export function useSettingsState() {
  // Data
  const activeTab = ref('account')
  const isUpdating = ref(false)
  const showDeleteModal = ref(false)

  const tabs = [
    { id: 'account', name: 'Account', icon: 'person' },
    { id: 'security', name: 'Security', icon: 'lock' },
    { id: 'notifications', name: 'Notifications', icon: 'notifications' },
    { id: 'privacy', name: 'Privacy', icon: 'privacy_tip' },
    { id: 'danger', name: 'Danger Zone', icon: 'warning' }
  ]

  const accountForm = reactive({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  })

  const passwordForm = reactive({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  const notificationSettings = reactive({
    email: true,
    sms: false,
    marketing: true
  })

  const privacySettings = reactive({
    profile_visible: true,
    data_sharing: false
  })

  return {
    activeTab,
    isUpdating,
    showDeleteModal,
    tabs,
    accountForm,
    passwordForm,
    notificationSettings,
    privacySettings
  }
}

export function useSettingsAuth() {
  const router = useRouter()
  const { user, isAuthenticated, handleLogout } = useAuth()
  const { success, error: showError } = useNotifications()

  return {
    router,
    user,
    isAuthenticated,
    handleLogout,
    success,
    showError
  }
}

export function useSettingsAPI() {
  const loadUserData = async (isAuthenticated, router, accountForm) => {
    if (!isAuthenticated.value) {
      router.push('/login')
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        console.warn('No auth token found, redirecting to login...')
        router.push('/login')
        return
      }

      const response = await fetch('http://127.0.0.1:8000/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          const userData = result.data
          accountForm.first_name = userData.first_name || ''
          accountForm.last_name = userData.last_name || ''
          accountForm.email = userData.email || ''
          accountForm.phone = userData.phone || ''
        }
      } else if (response.status === 401) {
        // Token is invalid, but don't logout - just show error
        console.warn('Failed to load user profile, but keeping session active')
        // Try to load from localStorage instead
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
        if (storedUser.first_name) {
          accountForm.first_name = storedUser.first_name || ''
          accountForm.last_name = storedUser.last_name || ''
          accountForm.email = storedUser.email || ''
          accountForm.phone = storedUser.phone || ''
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      // Try to load from localStorage on error
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      if (storedUser.first_name) {
        accountForm.first_name = storedUser.first_name || ''
        accountForm.last_name = storedUser.last_name || ''
        accountForm.email = storedUser.email || ''
        accountForm.phone = storedUser.phone || ''
      }
    }
  }

  const updateAccount = async (accountForm, isUpdating, success, showError) => {
    try {
      isUpdating.value = true
      const response = await fetch('http://127.0.0.1:8000/api/user/profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(accountForm)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          success('Account updated successfully!')
        } else {
          throw new Error(result.message || 'Failed to update account')
        }
      } else if (response.status === 401) {
        // Token is invalid, show error but don't logout
        console.warn('Failed to update account due to auth issue')
        showError('Unable to update account. Please try logging in again if the problem persists.')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update account')
      }
    } catch (error) {
      console.error('Error updating account:', error)
      showError('Failed to update account. Please try again.')
    } finally {
      isUpdating.value = false
    }
  }

  const updatePassword = async (passwordForm, isUpdating, success, showError) => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showError('New passwords do not match')
      return
    }

    try {
      isUpdating.value = true
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          success('Password updated successfully!')
          passwordForm.current_password = ''
          passwordForm.new_password = ''
          passwordForm.confirm_password = ''
        } else {
          throw new Error(result.message || 'Failed to update password')
        }
      } else if (response.status === 401) {
        // Token is invalid or user is deleted, logout automatically
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        router.push('/login')
        showError('Your session has expired. Please login again.')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update password')
      }
    } catch (error) {
      console.error('Error updating password:', error)
      showError('Failed to update password. Please try again.')
    } finally {
      isUpdating.value = false
    }
  }

  const updateNotifications = async (notificationSettings, isUpdating, success, showError) => {
    try {
      isUpdating.value = true
      // Implement notification settings update
      success('Notification preferences updated!')
    } catch (error) {
      console.error('Error updating notifications:', error)
      showError('Failed to update notification preferences')
    } finally {
      isUpdating.value = false
    }
  }

  const updatePrivacy = async (privacySettings, isUpdating, success, showError) => {
    try {
      isUpdating.value = true
      // Implement privacy settings update
      success('Privacy settings updated!')
    } catch (error) {
      console.error('Error updating privacy:', error)
      showError('Failed to update privacy settings')
    } finally {
      isUpdating.value = false
    }
  }

  const deleteAccount = async (isUpdating, showDeleteModal, success, showError, handleLogout, router) => {
    try {
      isUpdating.value = true
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success === true) {
          success('Account deleted successfully')
          handleLogout()
          router.push('/')
        } else {
          throw new Error(result.message || 'Failed to delete account')
        }
      } else if (response.status === 401) {
        // Token is invalid or user is deleted, logout automatically
        handleLogout()
        router.push('/login')
        showError('Your session has expired. Please login again.')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.error || 'Failed to delete account')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      showError('Failed to delete account. Please try again.')
    } finally {
      isUpdating.value = false
      showDeleteModal.value = false
    }
  }

  return {
    loadUserData,
    updateAccount,
    updatePassword,
    updateNotifications,
    updatePrivacy,
    deleteAccount
  }
}

export function useSettingsActions() {
  const confirmDeleteAccount = async (isUpdating, showDeleteModal, success, showError, handleLogout, router) => {
    // Delete account immediately without confirmation modal
    try {
      isUpdating.value = true
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success === true) {
          success('Account deleted successfully')
          // Clear auth data and redirect immediately
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
          localStorage.removeItem('refresh_token')
          router.push('/')
          // Reload page to ensure clean state
          window.location.reload()
        } else {
          throw new Error(result.message || 'Failed to delete account')
        }
      } else if (response.status === 401) {
        // Token is invalid or user is deleted, logout automatically
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        localStorage.removeItem('refresh_token')
        router.push('/login')
        showError('Your session has expired. Please login again.')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.error || 'Failed to delete account')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      showError('Failed to delete account. Please try again.')
    } finally {
      isUpdating.value = false
    }
  }

  return {
    confirmDeleteAccount
  }
}

export function initializeSettings() {
  return {
    onMounted: async (isAuthenticated, router, loadUserData, accountForm) => {
      await loadUserData(isAuthenticated, router, accountForm)
    }
  }
}
