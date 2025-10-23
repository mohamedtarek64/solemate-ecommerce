import api from './api';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('auth_token');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  // Check if user is admin
  isAdmin() {
    return this.user?.is_admin || false;
  }

  // Get current user
  getCurrentUser() {
    return this.user;
  }

  // Get stored user (alias for getCurrentUser)
  getStoredUser() {
    return this.user;
  }

  // Get auth token
  getToken() {
    return this.token;
  }

  // Set auth data
  setAuthData(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Clear auth data
  clearAuthData() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  // Login
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data.data;

      this.setAuthData(token, user);

      return {
        success: true,
        data: {
          token,
          user
        },
        message: response.data.message || 'Login successful'
      };
    } catch (error) {
      console.error('❌ AuthService: Login error:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        errors: error.response?.data?.errors
      });

      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
        errors: error.response?.data?.errors || null
      };
    }
  }

  // Register
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data.data;

      this.setAuthData(token, user);

      return {
        success: true,
        data: {
          token,
          user
        },
        message: response.data.message || 'Registration successful'
      };
    } catch (error) {
      console.error('Registration API error:', error.response?.data)
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
        errors: error.response?.data?.errors || null
      };
    }
  }

  // Logout
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
    }
  }

  // Get user profile
  async getProfile() {
    try {
      const response = await api.get('/user/profile');
      const user = response.data.data;

      this.user = user;
      localStorage.setItem('user', JSON.stringify(user));

      return {
        success: true,
        user
      };
    } catch (error) {
      // If user account is deleted, clear auth data
      if (error.response?.status === 404 && error.response?.data?.message?.includes('deleted')) {
        this.clearAuthData();
      }

      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get profile'
      };
    }
  }

  // Update profile
  async updateProfile(data) {
    try {
      const response = await api.post('/user/profile', data);
      const user = response.data.data;

      this.user = user;
      localStorage.setItem('user', JSON.stringify(user));

      return {
        success: true,
        user
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update profile'
      };
    }
  }

  // Change password
  async changePassword(data) {
    try {
      const response = await api.put('/auth/change-password', data);

      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to change password'
      };
    }
  }

  // Refresh token
  async refreshToken() {
    try {
      const response = await api.post('/auth/refresh');
      const { token, user } = response.data.data;

      this.setAuthData(token, user);

      return {
        success: true,
        token,
        user
      };
    } catch (error) {
      this.clearAuthData();
      return {
        success: false,
        error: error.response?.data?.message || 'Token refresh failed'
      };
    }
  }

  // Check token validity
  async checkTokenValidity() {
    if (!this.token) {
      return false;
    }

    try {
      await api.get('/auth/profile');
      return true;
    } catch (error) {
      if (error.response?.status === 401) {
        this.clearAuthData();
      }
      return false;
    }
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
