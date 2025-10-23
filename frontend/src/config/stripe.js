// Stripe Configuration
export const STRIPE_CONFIG = {
  // This should be moved to .env file in production
  PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51S7EBnKDUj7pEum7RSuudwZIalWri0OrVjRbcMd57LvYH2uWFaTLvUojyC1FhYZYQSUjsIXIcxDR8Cuj4XymQT8R00TZU1Oia7',

  // API Endpoints
  ENDPOINTS: {
    CONFIG: '/api/stripe/config',
    CREATE_PAYMENT_INTENT: '/api/stripe/create-payment-intent',
    CONFIRM_PAYMENT: '/api/stripe/confirm-payment'
  },

  // Currency and locale
  CURRENCY: 'usd',
  LOCALE: 'en'
}

// Helper function to get API base URL
export const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
}
