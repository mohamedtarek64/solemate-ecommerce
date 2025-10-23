import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotifications } from '@/composables/useNotifications'

// TwoFactorSetup Composable
export function useTwoFactorSetup() {
  const router = useRouter()
  const authStore = useAuthStore()
  const { success, error } = useNotifications()

  // State
  const loading = ref(false)
  const twoFactorEnabled = ref(false)
  const showRecoveryCodes = ref(false)
  const qrCodeUrl = ref('')
  const recoveryCodes = ref([])
  const verificationCode = ref('')

  // Load two-factor status
  const loadTwoFactorStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/user/two-factor-status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        twoFactorEnabled.value = data.enabled
        if (!data.enabled) {
          await generateQRCode()
        }
      }
    } catch (err) {
      console.error('Failed to load two-factor status:', err)
      error('Failed to load two-factor authentication status')
    }
  }

  // Generate QR code
  const generateQRCode = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/user/two-factor/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        qrCodeUrl.value = data.qr_code_url
      } else {
        throw new Error('Failed to generate QR code')
      }
    } catch (err) {
      console.error('Failed to generate QR code:', err)
      error('Failed to generate QR code')
    }
  }

  // Verify two-factor setup
  const verifyTwoFactor = async () => {
    if (loading.value) return

    if (!verificationCode.value || verificationCode.value.length !== 6) {
      error('Please enter a valid 6-digit code')
      return
    }

    loading.value = true

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/user/two-factor/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          code: verificationCode.value
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Invalid verification code')
      }

      twoFactorEnabled.value = true
      recoveryCodes.value = data.recovery_codes
      showRecoveryCodes.value = true
      success('Two-factor authentication enabled successfully!')

    } catch (err) {
      console.error('Two-factor verification error:', err)
      error(err.message || 'Failed to verify two-factor authentication')
    } finally {
      loading.value = false
    }
  }

  // Complete setup
  const completeSetup = () => {
    showRecoveryCodes.value = false
    router.push('/profile')
  }

  // View recovery codes
  const viewRecoveryCodes = () => {
    showRecoveryCodes.value = true
  }

  // Download recovery codes
  const downloadRecoveryCodes = () => {
    const codesText = recoveryCodes.value.join('\n')
    const blob = new Blob([codesText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'recovery-codes.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    success('Recovery codes downloaded successfully!')
  }

  // Disable two-factor
  const disableTwoFactor = async () => {
    if (loading.value) return

    if (!confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return
    }

    loading.value = true

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/user/two-factor/disable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        twoFactorEnabled.value = false
        showRecoveryCodes.value = false
        qrCodeUrl.value = ''
        recoveryCodes.value = []
        verificationCode.value = ''
        success('Two-factor authentication disabled successfully!')
        await generateQRCode()
      } else {
        const data = await response.json()
        throw new Error(data.message || 'Failed to disable two-factor authentication')
      }
    } catch (err) {
      console.error('Disable two-factor error:', err)
      error(err.message || 'Failed to disable two-factor authentication')
    } finally {
      loading.value = false
    }
  }

  // Initialize
  onMounted(() => {
    loadTwoFactorStatus()
  })

  return {
    loading,
    twoFactorEnabled,
    showRecoveryCodes,
    qrCodeUrl,
    recoveryCodes,
    verificationCode,
    verifyTwoFactor,
    completeSetup,
    viewRecoveryCodes,
    downloadRecoveryCodes,
    disableTwoFactor
  }
}
