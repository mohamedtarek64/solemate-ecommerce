import apiClient from '@/utils/apiClient'

// Axios plugin for Vue
export default {
  install(app) {
    // Make axios available globally
    app.config.globalProperties.$http = apiClient
    app.provide('$http', apiClient)
    
    // Add axios to global properties for Options API compatibility
    app.config.globalProperties.$axios = apiClient
  }
}
