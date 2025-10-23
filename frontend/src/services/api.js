import axios from 'axios'
import { API_CONFIG } from '@/config/api'

// Create axios instance
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth data and redirect
      console.warn('401 error detected - clearing auth data:', error.response?.data)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      localStorage.removeItem('refresh_token')

      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  // Login
  login: (credentials) => api.post('/auth/login', credentials),

  // Register
  register: (userData) => api.post('/auth/register', userData),

  // Logout
  logout: () => api.post('/auth/logout'),

  // Get user profile
  getProfile: () => api.get('/auth/profile'),

  // Update profile
  updateProfile: (data) => api.put('/auth/profile', data),

  // Change password
  changePassword: (data) => api.put('/auth/change-password', data),

  // Refresh token
  refreshToken: () => api.post('/auth/refresh'),
};

// Products API
export const productsAPI = {
  // Get all products
  getProducts: (params = {}) => api.get('/products', { params }),

  // Get product by ID
  getProduct: (id) => api.get(`/products/${id}`),

  // Get featured products
  getFeaturedProducts: () => api.get('/products/featured'),

  // Get products by category
  getProductsByCategory: (categoryId, params = {}) =>
    api.get(`/products/category/${categoryId}`, { params }),

  // Search products
  searchProducts: (query, params = {}) =>
    api.get('/products/search', { params: { q: query, ...params } }),

  // Get product reviews
  getProductReviews: (productId, params = {}) =>
    api.get(`/products/${productId}/reviews`, { params }),

  // Add product review
  addProductReview: (productId, reviewData) =>
    api.post(`/products/${productId}/reviews`, reviewData),
};

// Categories API
export const categoriesAPI = {
  // Get all categories
  getCategories: () => api.get('/categories'),

  // Get category by ID
  getCategory: (id) => api.get(`/categories/${id}`),

  // Get category products
  getCategoryProducts: (id, params = {}) =>
    api.get(`/categories/${id}/products`, { params }),
};

// Cart API
export const cartAPI = {
  // Get cart items
  getCart: () => api.get('/cart'),

  // Add item to cart
  addToCart: (productId, quantity = 1) =>
    api.post('/cart/add', { product_id: productId, quantity }),

  // Update cart item
  updateCartItem: (itemId, quantity) => {
    const userId = parseInt(localStorage.getItem('user_id')) || 18
    return api.put(`/cart/items/${itemId}`, {
      quantity,
      user_id: userId
    })
  },

  // Remove item from cart
  removeFromCart: (itemId) => {
    const userId = parseInt(localStorage.getItem('user_id')) || 18
    return api.delete(`/cart/items/${itemId}?user_id=${userId}`)
  },

  // Clear cart
  clearCart: () => api.delete('/cart/clear'),

  // Get cart count
  getCartCount: () => api.get('/cart/count'),
};

// Orders API
export const ordersAPI = {
  // Get user orders
  getOrders: (params = {}) => api.get('/orders', { params }),

  // Get order by ID
  getOrder: (id) => api.get(`/orders/${id}`),

  // Create order
  createOrder: (orderData) => api.post('/orders', orderData),

  // Cancel order
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),

  // Get order tracking
  getOrderTracking: (id) => api.get(`/orders/${id}/tracking`),
};

// Wishlist API
export const wishlistAPI = {
  // Get wishlist
  getWishlist: () => api.get('/wishlist'),

  // Add to wishlist
  addToWishlist: (productId) => api.post('/wishlist/add', { product_id: productId }),

  // Remove from wishlist
  removeFromWishlist: (productId) => api.delete(`/wishlist/remove/${productId}`),

  // Check if product is in wishlist
  isInWishlist: (productId) => api.get(`/wishlist/check/${productId}`),
};

// User API
export const userAPI = {
  // Get user addresses
  getAddresses: () => api.get('/user/addresses'),

  // Add address
  addAddress: (addressData) => api.post('/user/addresses', addressData),

  // Update address
  updateAddress: (id, addressData) => api.put(`/user/addresses/${id}`, addressData),

  // Delete address
  deleteAddress: (id) => api.delete(`/user/addresses/${id}`),

  // Set default address
  setDefaultAddress: (id) => api.put(`/user/addresses/${id}/default`),

  // Get user preferences
  getPreferences: () => api.get('/user/preferences'),

  // Update preferences
  updatePreferences: (preferences) => api.put('/user/preferences', preferences),
};

// Notifications API
export const notificationsAPI = {
  // Get notifications
  getNotifications: (params = {}) => api.get('/notifications', { params }),

  // Mark notification as read
  markAsRead: (id) => api.put(`/notifications/${id}/read`),

  // Mark all as read
  markAllAsRead: () => api.put('/notifications/read-all'),

  // Delete notification
  deleteNotification: (id) => api.delete(`/notifications/${id}`),

  // Get unread count
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

// Search API
export const searchAPI = {
  // Global search
  search: (query, params = {}) => api.get('/search', { params: { q: query, ...params } }),

  // Get search suggestions
  getSuggestions: (query) => api.get('/search/suggestions', { params: { q: query } }),

  // Get trending searches
  getTrending: () => api.get('/search/trending'),

  // Get popular searches
  getPopular: () => api.get('/search/popular'),
};

// Payment API
export const paymentAPI = {
  // Create payment intent
  createPaymentIntent: (orderData) => api.post('/payment/create-intent', orderData),

  // Confirm payment
  confirmPayment: (paymentData) => api.post('/payment/confirm', paymentData),

  // Get payment methods
  getPaymentMethods: () => api.get('/payment/methods'),

  // Add payment method
  addPaymentMethod: (methodData) => api.post('/payment/methods', methodData),

  // Remove payment method
  removePaymentMethod: (id) => api.delete(`/payment/methods/${id}`),
};

// Analytics API
export const analyticsAPI = {
  // Track page view
  trackPageView: (data) => api.post('/analytics/page-view', data),

  // Track product view
  trackProductView: (productId) => api.post('/analytics/product-view', { product_id: productId }),

  // Track search
  trackSearch: (query) => api.post('/analytics/search', { query }),

  // Track cart action
  trackCartAction: (action, data) => api.post('/analytics/cart-action', { action, ...data }),
};

// Admin API
export const adminAPI = {
  // Dashboard stats
  getDashboardStats: () => api.get('/admin/dashboard'),

  // Get all users
  getUsers: (params = {}) => api.get('/admin/users', { params }),

  // Get user details
  getUser: (id) => api.get(`/admin/users/${id}`),

  // Update user
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),

  // Get all orders
  getOrders: (params = {}) => api.get('/admin/orders', { params }),

  // Update order status
  updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),

  // Get all products
  getProducts: (params = {}) => api.get('/admin/products', { params }),

  // Create product
  createProduct: (data) => api.post('/admin/products', data),

  // Update product
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),

  // Delete product
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),

  // Get analytics
  getAnalytics: (params = {}) => api.get('/admin/analytics', { params }),
};

export default api
