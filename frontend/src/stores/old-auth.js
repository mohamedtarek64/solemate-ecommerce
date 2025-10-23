import { defineStore } from 'pinia';
import authService from '../services/authService';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  }),

  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated,
    isAdmin: (state) => state.user?.is_admin || false,
    userInitials: (state) => {
      if (!state.user?.name) return 'U';
      const names = state.user.name.split(' ');
      return names.map(name => name.charAt(0).toUpperCase()).join('').substring(0, 2);
    },
    userDisplayName: (state) => state.user?.name || 'User',
    userEmail: (state) => state.user?.email || '',
    isEmailVerified: (state) => !!state.user?.email_verified_at,
    isAccountActive: (state) => state.user?.is_active || false
  },

  actions: {
    // Initialize auth state from localStorage
    initializeAuth() {
      const token = localStorage.getItem('auth_token');
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      
      if (token && user) {
        this.token = token;
        this.user = user;
        this.isAuthenticated = true;
      }
    },

    // Set auth data
    setAuthData(token, user) {
      this.token = token;
      this.user = user;
      this.isAuthenticated = true;
      this.error = null;
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },

    // Clear auth data
    clearAuthData() {
      this.token = null;
      this.user = null;
      this.isAuthenticated = false;
      this.error = null;
      
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    },

    // Login
    async login(credentials) {
      this.isLoading = true;
      this.error = null;

      try {
        const result = await authService.login(credentials);
        
        if (result.success) {
          this.setAuthData(result.token, result.user);
        } else {
          this.error = result.error;
        }
        
        return result;
      } catch (error) {
        this.error = error.message || 'Login failed';
        return { success: false, error: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    // Register
    async register(userData) {
      this.isLoading = true;
      this.error = null;

      try {
        const result = await authService.register(userData);
        
        if (result.success) {
          this.setAuthData(result.token, result.user);
        } else {
          this.error = result.error;
        }
        
        return result;
      } catch (error) {
        this.error = error.message || 'Registration failed';
        return { success: false, error: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    // Logout
    async logout() {
      this.isLoading = true;

      try {
        await authService.logout();
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        this.clearAuthData();
        this.isLoading = false;
      }
    },

    // Get user profile
    async getProfile() {
      this.isLoading = true;
      this.error = null;

      try {
        const result = await authService.getProfile();
        
        if (result.success) {
          this.user = result.user;
          localStorage.setItem('user', JSON.stringify(result.user));
        } else {
          this.error = result.error;
        }
        
        return result;
      } catch (error) {
        this.error = error.message || 'Failed to get profile';
        return { success: false, error: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    // Update profile
    async updateProfile(data) {
      this.isLoading = true;
      this.error = null;

      try {
        const result = await authService.updateProfile(data);
        
        if (result.success) {
          this.user = result.user;
          localStorage.setItem('user', JSON.stringify(result.user));
        } else {
          this.error = result.error;
        }
        
        return result;
      } catch (error) {
        this.error = error.message || 'Failed to update profile';
        return { success: false, error: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    // Change password
    async changePassword(data) {
      this.isLoading = true;
      this.error = null;

      try {
        const result = await authService.changePassword(data);
        
        if (!result.success) {
          this.error = result.error;
        }
        
        return result;
      } catch (error) {
        this.error = error.message || 'Failed to change password';
        return { success: false, error: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    // Refresh token
    async refreshToken() {
      try {
        const result = await authService.refreshToken();
        
        if (result.success) {
          this.setAuthData(result.token, result.user);
        } else {
          this.clearAuthData();
        }
        
        return result;
      } catch (error) {
        this.clearAuthData();
        return { success: false, error: error.message || 'Token refresh failed' };
      }
    },

    // Check token validity
    async checkTokenValidity() {
      if (!this.token) {
        return false;
      }

      try {
        const isValid = await authService.checkTokenValidity();
        
        if (!isValid) {
          this.clearAuthData();
        }
        
        return isValid;
      } catch (error) {
        this.clearAuthData();
        return false;
      }
    },

    // Clear error
    clearError() {
      this.error = null;
    }
  }
});
