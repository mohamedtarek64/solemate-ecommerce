// Authentication helper functions for ProfileDropdown

import { useRouter } from 'vue-router'
import { useNotifications } from '@/composables/useNotifications'

/**
 * Handle logout action
 * @param {Function} authLogout - Logout function from auth store
 * @param {Function} success - Success notification function
 */
export const handleLogout = async (authLogout, success) => {
  try {
    if (typeof authLogout === 'function') {
      await authLogout()
      if (typeof success === 'function') {
        success('تم تسجيل الخروج بنجاح')
      }
    } else {
      console.error('authLogout is not a function:', authLogout)
      // Fallback: clear localStorage manually
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_data')
      if (typeof success === 'function') {
        success('تم تسجيل الخروج بنجاح')
      }
    }
  } catch (error) {
    console.error('Logout error:', error)
    // Even if there's an error, clear local data
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_data')
    if (typeof success === 'function') {
      success('تم تسجيل الخروج بنجاح')
    }
  }
}

/**
 * Handle profile click action
 * @param {Boolean} isAuthenticated - Authentication status
 * @param {Object} user - User object
 * @param {Object} router - Vue router instance
 */
export const handleProfileClick = (isAuthenticated, user, router) => {
  if (!isAuthenticated) {
    router.push('/login')
    return
  }

  if (user?.role === 'admin') {
    router.push('/admin')
  } else {
    router.push('/profile')
  }
}
