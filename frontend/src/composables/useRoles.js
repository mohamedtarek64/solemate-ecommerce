import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export function useRoles() {
  const authStore = useAuthStore()
  
  // User roles
  const userRoles = computed(() => authStore.user?.roles || [])
  const userRoleNames = computed(() => userRoles.value.map(role => role.name))
  
  // Role checking functions
  const hasRole = (roleName) => {
    // Check if user has the role in the roles array
    if (userRoleNames.value.includes(roleName)) {
      return true
    }
    // Fallback: check the direct role property
    return authStore.user?.role === roleName
  }
  
  const hasAnyRole = (roleNames) => {
    return roleNames.some(roleName => hasRole(roleName))
  }
  
  const hasAllRoles = (roleNames) => {
    return roleNames.every(roleName => hasRole(roleName))
  }
  
  // Specific role checks
  const isAdmin = computed(() => hasRole('admin'))
  const isVendor = computed(() => hasRole('vendor'))
  const isUser = computed(() => hasRole('user') || hasRole('customer'))
  
  // Permission checks
  const canManageUsers = computed(() => isAdmin.value)
  const canManageProducts = computed(() => isAdmin.value || isVendor.value)
  const canManageOrders = computed(() => isAdmin.value || isVendor.value)
  const canViewAnalytics = computed(() => isAdmin.value)
  const canManageCategories = computed(() => isAdmin.value)
  const canManageSettings = computed(() => isAdmin.value)
  
  // Dashboard access
  const canAccessAdminDashboard = computed(() => isAdmin.value)
  const canAccessVendorDashboard = computed(() => isVendor.value)
  const canAccessUserDashboard = computed(() => isUser.value)
  
  // Navigation items based on role
  const getNavigationItems = () => {
    const baseItems = [
      {
        name: 'Home',
        href: '/',
        icon: 'home',
        roles: ['user', 'vendor', 'admin']
      },
      {
        name: 'Products',
        href: '/products',
        icon: 'shopping-bag',
        roles: ['user', 'vendor', 'admin']
      },
      {
        name: 'Categories',
        href: '/categories',
        icon: 'tag',
        roles: ['user', 'vendor', 'admin']
      }
    ]
    
    const userItems = [
      {
        name: 'My Orders',
        href: '/orders',
        icon: 'shopping-cart',
        roles: ['user']
      },
      {
        name: 'Wishlist',
        href: '/wishlist',
        icon: 'heart',
        roles: ['user']
      },
      {
        name: 'Profile',
        href: '/profile',
        icon: 'user',
        roles: ['user']
      }
    ]
    
    const vendorItems = [
      {
        name: 'Vendor Dashboard',
        href: '/vendor/dashboard',
        icon: 'chart-bar',
        roles: ['vendor']
      },
      {
        name: 'My Products',
        href: '/vendor/products',
        icon: 'package',
        roles: ['vendor']
      },
      {
        name: 'Orders',
        href: '/vendor/orders',
        icon: 'clipboard-list',
        roles: ['vendor']
      }
    ]
    
    const adminItems = [
      {
        name: 'Admin Dashboard',
        href: '/admin/dashboard',
        icon: 'cog',
        roles: ['admin']
      },
      {
        name: 'Users',
        href: '/admin/users',
        icon: 'users',
        roles: ['admin']
      },
      {
        name: 'All Products',
        href: '/admin/products',
        icon: 'package',
        roles: ['admin']
      },
      {
        name: 'All Orders',
        href: '/admin/orders',
        icon: 'clipboard-list',
        roles: ['admin']
      },
      {
        name: 'Categories',
        href: '/admin/categories',
        icon: 'tag',
        roles: ['admin']
      },
      {
        name: 'Settings',
        href: '/admin/settings',
        icon: 'cog',
        roles: ['admin']
      }
    ]
    
    let items = [...baseItems]
    
    if (isUser.value) {
      items = [...items, ...userItems]
    }
    
    if (isVendor.value) {
      items = [...items, ...vendorItems]
    }
    
    if (isAdmin.value) {
      items = [...items, ...adminItems]
    }
    
    return items.filter(item => 
      item.roles.some(role => hasRole(role))
    )
  }
  
  // Route guards
  const canAccessRoute = (routeName) => {
    const routePermissions = {
      'admin-dashboard': ['admin'],
      'admin-users': ['admin'],
      'admin-products': ['admin'],
      'admin-orders': ['admin'],
      'admin-categories': ['admin'],
      'admin-settings': ['admin'],
      'vendor-dashboard': ['vendor'],
      'vendor-products': ['vendor'],
      'vendor-orders': ['vendor'],
      'user-dashboard': ['user'],
      'user-orders': ['user'],
      'user-wishlist': ['user'],
      'user-profile': ['user']
    }
    
    const requiredRoles = routePermissions[routeName]
    if (!requiredRoles) return true // Public route
    
    return hasAnyRole(requiredRoles)
  }
  
  // Redirect based on role
  const getDefaultRedirect = () => {
    if (isAdmin.value) return '/admin/dashboard'
    if (isVendor.value) return '/vendor/dashboard'
    if (isUser.value) return '/user/dashboard'
    return '/'
  }
  
  // Role display helpers
  const getRoleDisplayName = (roleName) => {
    const displayNames = {
      'admin': 'Administrator',
      'vendor': 'Vendor',
      'user': 'User'
    }
    return displayNames[roleName] || roleName
  }
  
  const getRoleColor = (roleName) => {
    const colors = {
      'admin': 'bg-red-100 text-red-800',
      'vendor': 'bg-blue-100 text-blue-800',
      'user': 'bg-green-100 text-green-800'
    }
    return colors[roleName] || 'bg-gray-100 text-gray-800'
  }
  
  return {
    // State
    userRoles,
    userRoleNames,
    
    // Role checks
    hasRole,
    hasAnyRole,
    hasAllRoles,
    
    // Specific roles
    isAdmin,
    isVendor,
    isUser,
    
    // Permissions
    canManageUsers,
    canManageProducts,
    canManageOrders,
    canViewAnalytics,
    canManageCategories,
    canManageSettings,
    
    // Dashboard access
    canAccessAdminDashboard,
    canAccessVendorDashboard,
    canAccessUserDashboard,
    
    // Navigation
    getNavigationItems,
    
    // Route guards
    canAccessRoute,
    getDefaultRedirect,
    
    // Display helpers
    getRoleDisplayName,
    getRoleColor
  }
}
