// Admin Settings JavaScript Logic
import { ref, reactive, onMounted } from 'vue'

export function useSettingsState() {
  // Settings tabs
  const tabs = ref([
    { id: 'general', name: 'General', icon: 'settings' },
    { id: 'payment', name: 'Payment', icon: 'payment' },
    { id: 'email', name: 'Email', icon: 'email' },
    { id: 'security', name: 'Security', icon: 'security' }
  ])

  const activeTab = ref('general')
  const isLoading = ref(false)
  const error = ref(null)

  return {
    tabs,
    activeTab,
    isLoading,
    error
  }
}

export function useSettingsData() {
  // Settings data
  const settings = reactive({
    general: {
      storeName: 'SoleMate',
      storeEmail: 'admin@solemate.com',
      storePhone: '+1 (555) 123-4567',
      currency: 'USD',
      storeDescription: 'Premium sneakers and athletic footwear for every lifestyle.'
    },
    payment: {
      methods: {
        stripe: true,
        paypal: false,
        cashOnDelivery: true
      },
      taxRate: 8.5,
      shippingCost: 15.00
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      username: '',
      password: ''
    },
    security: {
      minPasswordLength: 8,
      sessionTimeout: 60,
      twoFactorAuth: false,
      loginNotifications: true
    }
  })

  return {
    settings
  }
}

export function useSettingsAPI() {
  const saveSettings = async (settings) => {
    try {
      isLoading.value = true

      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')

      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('http://127.0.0.1:8000/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(settings.value)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          alert('Settings saved successfully!')
        } else {
          throw new Error(result.message || 'Failed to save settings')
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

    } catch (err) {
      console.error('Error saving settings:', err)
      error.value = err.message
      alert('Error saving settings: ' + err.message)
    } finally {
      isLoading.value = false
    }
  }

  const loadSettings = async (settings) => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')

      if (!token) {
        return
      }

      const response = await fetch('http://127.0.0.1:8000/api/admin/settings', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          // Update settings with data from API
          if (result.data.general) Object.assign(settings.general, result.data.general)
          if (result.data.payment) Object.assign(settings.payment, result.data.payment)
          if (result.data.email) Object.assign(settings.email, result.data.email)
          if (result.data.security) Object.assign(settings.security, result.data.security)
        }
      } else {
        }
    } catch (err) {
      console.error('Error loading settings:', err)
    }
  }

  return {
    saveSettings,
    loadSettings
  }
}

export function useSettingsActions() {
  const resetSettings = (settings) => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      // Reset to default values
      Object.assign(settings.general, {
        storeName: 'SoleMate',
        storeEmail: 'admin@solemate.com',
        storePhone: '+1 (555) 123-4567',
        currency: 'USD',
        storeDescription: 'Premium sneakers and athletic footwear for every lifestyle.'
      })

      Object.assign(settings.payment.methods, {
        stripe: true,
        paypal: false,
        cashOnDelivery: true
      })

      settings.payment.taxRate = 8.5
      settings.payment.shippingCost = 15.00

      alert('Settings reset to default values!')
    }
  }

  return {
    resetSettings
  }
}

export function initializeSettings() {
  return {
    onMounted: (loadSettings, settings) => {
      loadSettings(settings)
    }
  }
}
