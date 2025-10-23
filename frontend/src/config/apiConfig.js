export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
}

export const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    SOCIAL_LOGIN: '/auth/social'
  },

  // Products endpoints
  PRODUCTS: {
    LIST: '/products',
    DETAIL: '/products',
    FEATURED: '/products/featured',
    SEARCH: '/search/products',
    REVIEWS: '/products/{id}/reviews'
  },

  // Categories endpoints
  CATEGORIES: {
    LIST: '/categories',
    DETAIL: '/categories',
    PRODUCTS: '/categories/{id}/products'
  },

  // Cart endpoints
  CART: {
    GET: '/cart',
    ADD: '/cart/add',
    UPDATE: '/cart/items',
    REMOVE: '/cart/items',
    CLEAR: '/cart/clear',
    COUNT: '/cart/count'
  },

  // Orders endpoints
  ORDERS: {
    LIST: '/orders',
    DETAIL: '/orders',
    CREATE: '/orders',
    CANCEL: '/orders/{id}/cancel',
    TRACKING: '/orders/{id}/tracking'
  },

  // Wishlist endpoints
  WISHLIST: {
    GET: '/wishlist',
    ADD: '/wishlist/add',
    REMOVE: '/wishlist/remove',
    CHECK: '/wishlist/check'
  },

  // User endpoints
  USER: {
    ADDRESSES: '/user/addresses',
    PREFERENCES: '/user/preferences',
    PAYMENT_METHODS: '/user/payment-methods'
  },

  // Search endpoints
  SEARCH: {
    GLOBAL: '/search',
    SUGGESTIONS: '/search/suggestions',
    TRENDING: '/search/trending',
    POPULAR: '/search/popular'
  },

  // Payment endpoints
  PAYMENT: {
    CREATE_INTENT: '/stripe/create-payment-intent',
    CONFIRM: '/stripe/confirm-payment',
    METHODS: '/user/payment-methods'
  },

  // Notifications endpoints
  NOTIFICATIONS: {
    LIST: '/notifications',
    READ: '/notifications/{id}/read',
    READ_ALL: '/notifications/read-all',
    DELETE: '/notifications/{id}',
    UNREAD_COUNT: '/notifications/unread-count'
  },

  // Analytics endpoints
  ANALYTICS: {
    PAGE_VIEW: '/analytics/page-view',
    PRODUCT_VIEW: '/analytics/product-view',
    SEARCH: '/analytics/search',
    CART_ACTION: '/analytics/cart-action'
  },

  // Admin endpoints
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    ORDERS: '/admin/orders',
    PRODUCTS: '/admin/products',
    ANALYTICS: '/admin/analytics'
  }
}
