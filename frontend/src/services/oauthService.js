import api from './api'

export const oauthService = {
  // Google OAuth
  async googleAuth() {
    try {
      const response = await api.get('/auth/google')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to initiate Google auth')
    }
  },

  // Facebook OAuth
  async facebookAuth() {
    try {
      const response = await api.get('/auth/facebook')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to initiate Facebook auth')
    }
  },

  // Apple OAuth
  async appleAuth() {
    try {
      const response = await api.get('/auth/apple')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to initiate Apple auth')
    }
  },

  // Handle OAuth callback
  async handleCallback(provider, code, state) {
    try {
      const response = await api.post(`/auth/${provider}/callback`, { code, state })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to handle OAuth callback')
    }
  },

  // Link OAuth account
  async linkAccount(provider, code, state) {
    try {
      const response = await api.post(`/auth/${provider}/link`, { code, state })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to link OAuth account')
    }
  },

  // Unlink OAuth account
  async unlinkAccount(provider) {
    try {
      const response = await api.delete(`/auth/${provider}/unlink`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to unlink OAuth account')
    }
  },

  // Get linked accounts
  async getLinkedAccounts() {
    try {
      const response = await api.get('/auth/linked-accounts')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get linked accounts')
    }
  }
}