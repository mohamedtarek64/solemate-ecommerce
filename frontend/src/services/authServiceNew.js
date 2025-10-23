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
      const { access_token, token_type, user } = response.data;
      
      this.setAuthData(access_token, user);
      
      return {
        success: true,
        user,
        token: access_token,
        token_type
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  }

  // Register
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      const { access_token, token_type, user } = response.data;
      
      this.setAuthData(access_token, user);
      
      return {
        success: true,
        user,
        token: access_token,
        token_type
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
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
      const response = await api.get('/auth/profile');
      const user = response.data.user || response.data.data;
      
      this.user = user;
      localStorage.setItem('user', JSON.stringify(user));
      
      return {
        success: true,
        user
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get profile'
      };
    }
  }

  // Update profile
  async updateProfile(data) {
    try {
      const response = await api.put('/auth/profile', data);
      const user = response.data.user || response.data.data;
      
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
      const { access_token, token_type } = response.data;
      
      this.setAuthData(access_token, this.user);
      
      return {
        success: true,
        token: access_token,
        token_type
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

  // Social login
  async socialLogin(provider, accessToken) {
    try {
      const response = await api.post(`/auth/social/${provider}`, {
        access_token: accessToken
      });
      
      const { access_token, token_type, user } = response.data;
      
      this.setAuthData(access_token, user);
      
      return {
        success: true,
        user,
        token: access_token,
        token_type
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Social login failed'
      };
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send reset email'
      };
    }
  }

  // Reset password
  async resetPassword(data) {
    try {
      const response = await api.post('/auth/reset-password', data);
      
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to reset password'
      };
    }
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
