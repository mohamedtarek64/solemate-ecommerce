import { ref } from 'vue'

// OrderSuccess Composable
export function useOrderSuccess(route) {
  const user = ref({ first_name: 'U' })

  // Get order ID from route params
  const orderId = ref(route.params.orderId || '12345')

  // Mock order total - in real app, this would come from API
  const orderTotal = ref(248.37)

  // Helper functions
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return {
    user,
    orderId,
    orderTotal,
    formatDate,
    formatCurrency
  }
}
