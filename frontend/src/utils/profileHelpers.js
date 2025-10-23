// Profile helper functions for ProfileDropdown

import { useRouter } from 'vue-router'

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
