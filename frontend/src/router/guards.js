import authService from '../services/authService'
import TokenManager from '../utils/tokenManager'

// Route guards
export const authGuard = (to, from, next) => {
  if (TokenManager.isAuthenticated()) {
    next()
  } else {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }
}

export const guestGuard = (to, from, next) => {
  if (TokenManager.isAuthenticated()) {
    next('/dashboard')
  } else {
    next()
  }
}

// Cache for admin guard to reduce repeated calls
let lastAuthCheck = { timestamp: 0, result: null }
const AUTH_CACHE_DURATION = 5000 // 5 seconds cache

export const adminGuard = (to, from, next) => {
  const now = Date.now()

  // Use cached result if recent
  if (now - lastAuthCheck.timestamp < AUTH_CACHE_DURATION && lastAuthCheck.result) {
    if (lastAuthCheck.result.isAdmin) {
      console.log('✅ Admin access granted (cached)')
      return next()
    }
  }

  const isAuthenticated = TokenManager.isAuthenticated()
  const isAdmin = TokenManager.isAdmin()

  const result = {
    path: to.path,
    isAuthenticated,
    isAdmin,
    token: !!TokenManager.getToken(),
    user: TokenManager.getUser()?.parsed
  }

  // Cache the result
  lastAuthCheck = {
    timestamp: now,
    result: result
  }

  console.log('🔍 adminGuard called:', result)

  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to login')
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else if (!isAdmin) {
    console.log('❌ Not admin, redirecting to unauthorized')
    next('/unauthorized')
  } else {
    console.log('✅ Admin access granted')
    next()
  }
}

// Global navigation guard
export const globalBeforeEach = async (to, from, next) => {
  try {
    // Check if route requires authentication
    if (to.matched.some(record => record.meta.requiresAuth)) {
      if (!TokenManager.isAuthenticated()) {
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
        return
      }

      // Check if token needs refresh
      if (TokenManager.needsRefresh()) {
        try {
          const refreshResult = await authService.refreshToken()
          if (!refreshResult.success) {
            console.warn('Token refresh failed; preserving session and redirecting to login')
            next({
              path: '/login',
              query: { redirect: to.fullPath }
            })
            return
          }
        } catch (error) {
          console.error('Token refresh failed:', error)
          // Preserve session; only redirect to login without clearing local auth
          next({
            path: '/login',
            query: { redirect: to.fullPath }
          })
          return
        }
      }
    }

    // Check if route requires admin
    if (to.matched.some(record => record.meta.requiresAdmin)) {
      if (!TokenManager.isAuthenticated()) {
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
        return
      }

      if (!TokenManager.isAdmin()) {
        next('/unauthorized')
        return
      }
    }

    // Check if route requires guest (not authenticated)
    if (to.matched.some(record => record.meta.requiresGuest)) {
      if (TokenManager.isAuthenticated()) {
        next('/dashboard')
        return
      }
    }

    // Check for role-based access
    if (to.meta.roles && to.meta.roles.length > 0) {
      const userRole = TokenManager.getUserRole()

      if (!to.meta.roles.includes(userRole)) {
        next('/unauthorized')
        return
      }
    }

    // Check for permission-based access
    if (to.meta.permissions && to.meta.permissions.length > 0) {
      const user = TokenManager.getUser()
      const userPermissions = user?.permissions || []

      const hasPermission = to.meta.permissions.some(permission =>
        userPermissions.includes(permission)
      )

      if (!hasPermission && !TokenManager.isAdmin()) {
        next('/unauthorized')
        return
      }
    }

    next()
  } catch (error) {
    console.error('Navigation guard error:', error)
    next('/error')
  }
}

// Helper function to check route access
export const canAccessRoute = (route) => {
  // Check authentication requirement
  if (route.meta?.requiresAuth && !TokenManager.isAuthenticated()) {
    return false
  }

  // Check admin requirement
  if (route.meta?.requiresAdmin && !TokenManager.isAdmin()) {
    return false
  }

  // Check guest requirement
  if (route.meta?.requiresGuest && TokenManager.isAuthenticated()) {
    return false
  }

  // Check role requirements
  if (route.meta?.roles && route.meta.roles.length > 0) {
    const userRole = TokenManager.getUserRole()
    if (!route.meta.roles.includes(userRole)) {
      return false
    }
  }

  // Check permission requirements
  if (route.meta?.permissions && route.meta.permissions.length > 0) {
    const user = TokenManager.getUser()
    const userPermissions = user?.permissions || []

    const hasPermission = route.meta.permissions.some(permission =>
      userPermissions.includes(permission)
    )

    if (!hasPermission && !TokenManager.isAdmin()) {
      return false
    }
  }

  return true
}

// Dashboard redirect guard
export const dashboardRedirect = (to, from, next) => {
  if (TokenManager.isAuthenticated()) {
    const userRole = TokenManager.getUserRole()
    if (userRole === 'admin') {
      next('/admin/dashboard')
    } else if (userRole === 'vendor') {
      next('/vendor/dashboard')
    } else {
      next('/user/dashboard')
    }
  } else {
    next('/login')
  }
}

// Alias functions for compatibility
export const requireAuth = authGuard
export const requireGuest = guestGuard
export const requireAdmin = adminGuard
export const requireVendor = (to, from, next) => {
  if (TokenManager.isAuthenticated() && TokenManager.getUserRole() === 'vendor') {
    next()
  } else {
    next('/login')
  }
}
export const requireUser = (to, from, next) => {
  if (TokenManager.isAuthenticated()) {
    next()
  } else {
    next('/login')
  }
}

export default {
  authGuard,
  guestGuard,
  adminGuard,
  globalBeforeEach,
  canAccessRoute,
  dashboardRedirect,
  requireAuth,
  requireGuest,
  requireAdmin,
  requireVendor,
  requireUser
}
