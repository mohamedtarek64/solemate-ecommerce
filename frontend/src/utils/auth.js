import authService from '../services/authService';
import router from '../router';

// Auth utilities
export const auth = {
  // Check if user is authenticated
  isAuthenticated() {
    return authService.isAuthenticated();
  },

  // Check if user is admin
  isAdmin() {
    return authService.isAdmin();
  },

  // Get current user
  getCurrentUser() {
    return authService.getCurrentUser();
  },

  // Get auth token
  getToken() {
    return authService.getToken();
  },

  // Login user
  async login(credentials) {
    const result = await authService.login(credentials);
    
    if (result.success) {
      // Redirect to intended page or dashboard
      const redirectTo = router.currentRoute.value.query.redirect || '/dashboard';
      router.push(redirectTo);
    }
    
    return result;
  },

  // Register user
  async register(userData) {
    const result = await authService.register(userData);
    
    if (result.success) {
      // Redirect to dashboard after successful registration
      router.push('/dashboard');
    }
    
    return result;
  },

  // Logout user
  async logout() {
    await authService.logout();
    
    // Redirect to login page
    router.push('/login');
  },

  // Check token validity and refresh if needed
  async checkAuth() {
    if (!authService.isAuthenticated()) {
      return false;
    }

    const isValid = await authService.checkTokenValidity();
    
    if (!isValid) {
      // Try to refresh token
      const refreshResult = await authService.refreshToken();
      
      if (!refreshResult.success) {
        // Redirect to login if refresh fails
        this.logout();
        return false;
      }
    }
    
    return true;
  },

  // Require authentication for route
  requireAuth() {
    if (!this.isAuthenticated()) {
      router.push({
        path: '/login',
        query: { redirect: router.currentRoute.value.fullPath }
      });
      return false;
    }
    return true;
  },

  // Require admin role for route
  requireAdmin() {
    if (!this.isAuthenticated()) {
      router.push({
        path: '/login',
        query: { redirect: router.currentRoute.value.fullPath }
      });
      return false;
    }

    if (!this.isAdmin()) {
      router.push('/unauthorized');
      return false;
    }
    
    return true;
  },

  // Require guest (not authenticated) for route
  requireGuest() {
    if (this.isAuthenticated()) {
      router.push('/dashboard');
      return false;
    }
    return true;
  },

  // Get user initials for avatar
  getUserInitials() {
    const user = this.getCurrentUser();
    if (!user || !user.name) return 'U';
    
    const names = user.name.split(' ');
    const initials = names.map(name => name.charAt(0).toUpperCase()).join('');
    return initials.substring(0, 2);
  },

  // Get user display name
  getUserDisplayName() {
    const user = this.getCurrentUser();
    return user?.name || 'User';
  },

  // Get user email
  getUserEmail() {
    const user = this.getCurrentUser();
    return user?.email || '';
  },

  // Check if user has specific permission
  hasPermission(permission) {
    const user = this.getCurrentUser();
    return user?.permissions?.includes(permission) || false;
  },

  // Check if user has any of the specified permissions
  hasAnyPermission(permissions) {
    return permissions.some(permission => this.hasPermission(permission));
  },

  // Check if user has all specified permissions
  hasAllPermissions(permissions) {
    return permissions.every(permission => this.hasPermission(permission));
  },

  // Format user role
  formatUserRole() {
    const user = this.getCurrentUser();
    if (!user) return 'Guest';
    
    if (user.is_admin) return 'Administrator';
    if (user.is_moderator) return 'Moderator';
    return 'Customer';
  },

  // Check if user account is active
  isAccountActive() {
    const user = this.getCurrentUser();
    return user?.is_active || false;
  },

  // Check if user email is verified
  isEmailVerified() {
    const user = this.getCurrentUser();
    return !!user?.email_verified_at;
  }
};

// Export default
export default auth;
