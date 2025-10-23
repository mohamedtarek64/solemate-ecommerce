import { useRouter } from 'vue-router'
import { useNotifications } from '@/composables/useNotifications'
import ApiService from '@/services/apiService'
import { authStorage } from '@/services/storageService'
import LoggerService from '@/services/loggerService'

// Cart Page Composable
export function useCartPage() {
  const router = useRouter()
  const { success, error: showError } = useNotifications()

  // Continue shopping
  const continueShopping = () => {
    router.push('/products')
  }

  // Start shopping (from empty cart)
  const startShopping = () => {
    router.push('/products')
  }

  // Save for later
  const saveForLater = async (itemId) => {
    try {
      LoggerService.cart('Saving item for later', { itemId })

      const result = await ApiService.post('/wishlist/add', {
          item_id: itemId
      })

      if (result.success) {
        success('Item saved for later')
        LoggerService.cart('Item saved for later successfully', { itemId })
      } else {
        throw new Error(result.message || 'Failed to save item')
      }
    } catch (error) {
      LoggerService.error('Error saving item', error, 'Cart.saveForLater')
      showError('Failed to save item')
    }
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return {
    continueShopping,
    startShopping,
    saveForLater,
    formatCurrency
  }
}
