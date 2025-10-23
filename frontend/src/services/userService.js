import api from './api';

// User API endpoints
const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (profileData) => api.put('/user/profile', profileData),
  getAddresses: () => api.get('/user/addresses'),
  addAddress: (addressData) => api.post('/user/addresses', addressData),
  updateAddress: (id, addressData) => api.put(`/user/addresses/${id}`, addressData),
  deleteAddress: (id) => api.delete(`/user/addresses/${id}`),
  setDefaultAddress: (id) => api.put(`/user/addresses/${id}/default`),
  getNotifications: (params = {}) => api.get('/notifications', { params }),
  markNotificationRead: (id) => api.put(`/notifications/${id}/read`),
  getPreferences: () => api.get('/user/preferences'),
  updatePreferences: (preferences) => api.put('/user/preferences', preferences),
};

const userService = {
  // Get user profile
  async getProfile() {
    try {
      const response = await userAPI.getProfile()
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile')
    }
  },

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await userAPI.updateProfile(profileData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile')
    }
  },

  // Get user addresses
  async getAddresses() {
    try {
      const response = await userAPI.getAddresses()
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch addresses')
    }
  },

  // Add new address
  async addAddress(addressData) {
    try {
      const response = await userAPI.addAddress(addressData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add address')
    }
  },

  // Update address
  async updateAddress(addressId, addressData) {
    try {
      const response = await userAPI.updateAddress(addressId, addressData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update address')
    }
  },

  // Delete address
  async deleteAddress(addressId) {
    try {
      const response = await userAPI.deleteAddress(addressId)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete address')
    }
  },

  // Get user notifications
  async getNotifications() {
    try {
      const response = await userAPI.getNotifications()
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notifications')
    }
  },

  // Mark notification as read
  async markNotificationRead(notificationId) {
    try {
      const response = await userAPI.markNotificationRead(notificationId)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to mark notification as read')
    }
  }
}

export default userService
