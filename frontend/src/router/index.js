import { createRouter, createWebHistory } from 'vue-router'
import {
  requireAuth,
  requireGuest,
  requireAdmin,
  requireVendor,
  requireUser,
  dashboardRedirect
} from './guards'
import { globalBeforeEach } from './guards'

// Performance optimization: Lazy load routes
const lazyLoad = (component) => () => import(`@/views/${component}.vue`)

// Import views - Critical routes (loaded immediately)
import Home from '@/views/Home.vue'
import Login from '@/views/auth/Login.vue'
import Register from '@/views/auth/Register.vue'
import NotFound from '@/views/errors/NotFound.vue'
import Products from '@/views/products/Products.vue'

// Lazy load non-critical routes for better performance
const Callback = () => import('@/views/auth/Callback.vue')
const ProductDetail = () => import('@/views/products/ProductDetail.vue')
const Cart = () => import('@/views/cart/Cart.vue')
const Checkout = () => import('@/views/checkout/Checkout.vue')
const OrderSuccess = () => import('@/views/checkout/OrderSuccess.vue')

// Admin views (lazy loaded)
const AdminDashboard = () => import('@/views/admin/AdminDashboard.vue')
const AdminOrders = () => import('@/views/admin/Orders.vue')
const AdminCustomers = () => import('@/views/admin/Customers.vue')
const AdminAnalytics = () => import('@/views/admin/Analytics.vue')
const AdminSettings = () => import('@/views/admin/Settings.vue')
const DiscountCodes = () => import('@/views/admin/DiscountCodes.vue')

// User views (lazy loaded)
const Profile = () => import('@/views/user/Profile/Profile.vue')
const Orders = () => import('@/views/user/Orders/Orders.vue')
const OrderDetails = () => import('@/views/user/OrderDetails.vue')
const Wishlist = () => import('@/views/user/Wishlist.vue')
const Settings = () => import('@/views/user/Settings.vue')
const UserDashboard = () => import('@/views/user/UserDashboard/UserDashboard.vue')

// Other views (lazy loaded)
const ApiTest = () => import('@/views/ApiTest.vue')
const Notifications = () => import('@/views/notifications/Notifications.vue')
const NotificationSettings = () => import('@/views/notifications/NotificationSettings.vue')

// Import new Vue 3 components
import App from '@/App.vue'

// About page
const About = () => import('@/views/About.vue')

const routes = [
  // New Vue 3 App (SoleMate) - Main route
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'SoleMate - Premium Sneakers',
      requiresAuth: false
    }
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: {
      title: 'About Us - SoleMate',
      requiresAuth: false
    }
  },
  {
    path: '/solemate',
    name: 'SoleMateApp',
    component: Home,
    meta: {
      title: 'SoleMate - Premium Sneakers',
      requiresAuth: false
    }
  },

  // Original E-commerce routes
  {
    path: '/ecommerce',
    name: 'EcommerceHome',
    component: Home,
    meta: {
      title: 'E-Commerce Home',
      requiresAuth: false
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: 'Login',
      requiresAuth: false,
      guestOnly: true
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
      title: 'Register',
      requiresAuth: false,
      guestOnly: true
    }
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: Callback,
    meta: {
      title: 'Authentication Callback',
      requiresAuth: false
    }
  },
  {
    path: '/products',
    name: 'Products',
    component: Products,
    meta: {
      title: 'Products',
      requiresAuth: false
    }
  },
  {
    path: '/search',
    name: 'SearchResults',
    component: () => import('@/views/search/SearchResults.vue'),
    meta: {
      title: 'Search Results',
      requiresAuth: false
    }
  },
  {
    path: '/payment/success',
    name: 'PaymentSuccess',
    component: () => import('@/views/payment/PaymentSuccess.vue'),
    meta: {
      title: 'Payment Successful',
      requiresAuth: true
    }
  },
  {
    path: '/products/:id',
    name: 'ProductDetail',
    component: ProductDetail,
    meta: {
      title: 'Product Details',
      requiresAuth: false
    }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: Cart,
    meta: {
      title: 'Shopping Cart',
      requiresAuth: false
    }
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: Checkout,
    meta: {
      title: 'Checkout',
      requiresAuth: true
    }
  },
  {
    path: '/order-success/:orderId',
    name: 'OrderSuccess',
    component: OrderSuccess,
    meta: {
      title: 'Order Success',
      requiresAuth: true
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: {
      title: 'Profile',
      requiresAuth: true
    }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: Orders,
    meta: {
      title: 'My Orders',
      requiresAuth: true
    }
  },
  {
    path: '/orders/:id',
    name: 'OrderDetails',
    component: OrderDetails,
    meta: {
      title: 'Order Details',
      requiresAuth: true
    }
  },
  {
    path: '/wishlist',
    name: 'Wishlist',
    component: Wishlist,
    meta: {
      title: 'Wishlist',
      requiresAuth: true
    },
    beforeEnter: requireUser
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: {
      title: 'Settings',
      requiresAuth: true
    },
    beforeEnter: requireUser
  },

  // Dashboard routes
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: UserDashboard,
    meta: {
      title: 'Dashboard',
      requiresAuth: true
    },
    beforeEnter: dashboardRedirect
  },
  {
    path: '/user/dashboard',
    name: 'UserDashboard',
    component: UserDashboard,
    meta: {
      title: 'User Dashboard',
      requiresAuth: true
    },
    beforeEnter: requireUser
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: {
      title: 'Admin Dashboard',
      requiresAuth: true
    },
    beforeEnter: requireAdmin
  },
  {
    path: '/admin/orders',
    name: 'AdminOrders',
    component: AdminOrders,
    meta: {
      title: 'Admin Orders',
      requiresAuth: true
    },
    beforeEnter: requireAdmin
  },
  {
    path: '/admin/customers',
    name: 'AdminCustomers',
    component: AdminCustomers,
    meta: {
      title: 'Admin Customers',
      requiresAuth: true
    },
    beforeEnter: requireAdmin
  },
  {
    path: '/admin/analytics',
    name: 'AdminAnalytics',
    component: AdminAnalytics,
    meta: {
      title: 'Admin Analytics',
      requiresAuth: true
    },
    beforeEnter: requireAdmin
  },
  {
    path: '/admin/settings',
    name: 'AdminSettings',
    component: AdminSettings,
    meta: {
      title: 'Admin Settings',
      requiresAuth: true
    },
    beforeEnter: requireAdmin
  },
  {
    path: '/admin/discount-codes',
    name: 'DiscountCodes',
    component: DiscountCodes,
    meta: {
      title: 'Discount Codes Management',
      requiresAuth: true
    },
    beforeEnter: requireAdmin
  },
  {
    path: '/admin/products',
    name: 'AdminProducts',
    component: () => import('@/views/admin/Products.vue').catch(() => {
      console.error('Failed to load Products.vue')
      return { template: '<div>Error loading products page</div>' }
    }),
    meta: {
      title: 'Admin Products',
      requiresAuth: true
    },
    beforeEnter: requireAdmin
  },
  {
    path: '/admin/orders',
    name: 'AdminOrders',
    component: () => import('@/views/admin/Orders.vue'),
    meta: {
      title: 'Admin Orders',
      requiresAuth: true
    },
    beforeEnter: requireAdmin
  },
  {
    path: '/api-test',
    name: 'ApiTest',
    component: ApiTest,
    meta: {
      title: 'API Test',
      requiresAuth: false
    }
  },

  // Notification routes
  {
    path: '/notifications',
    name: 'Notifications',
    component: Notifications,
    meta: {
      title: 'Notifications',
      requiresAuth: true
    },
    beforeEnter: requireUser
  },
  {
    path: '/notifications/settings',
    name: 'NotificationSettings',
    component: NotificationSettings,
    meta: {
      title: 'Notification Settings',
      requiresAuth: true
    },
    beforeEnter: requireUser
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: 'Page Not Found',
      requiresAuth: false
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})


// Navigation guards
router.beforeEach(globalBeforeEach)


export default router
