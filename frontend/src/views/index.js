// Views Index - Centralized view exports
// This file provides a clean way to import views throughout the application

// Main Views
export { default as Home } from './Home.vue'
export { default as Dashboard } from './Dashboard.vue'
export { default as ApiTest } from './ApiTest.vue'
export { default as Test } from './Test.vue'

// Error Views
export { default as NotFound } from './errors/NotFound.vue'

// Auth Views
export { default as Login } from './auth/Login.vue'
export { default as LoginNew } from './auth/LoginNew.vue'
export { default as Register } from './auth/Register.vue'
export { default as ForgotPassword } from './auth/ForgotPassword.vue'
export { default as ResetPassword } from './auth/ResetPassword.vue'
export { default as TwoFactorSetup } from './auth/TwoFactorSetup.vue'
export { default as Callback } from './auth/Callback.vue'
export { default as OAuth2Callback } from './auth/OAuth2Callback.vue'

// Product Views
export { default as ProductDetail } from './products/ProductDetail.vue'
export { default as ProductList } from './products/ProductList.vue'
export { default as Products } from './products/Products.vue'

// Cart & Checkout Views
export { default as Cart } from './cart/Cart.vue'
export { default as ShoppingCart } from './cart/ShoppingCart.vue'
export { default as Checkout } from './checkout/Checkout.vue'

// Search Views
export { default as SearchResults } from './search/SearchResults.vue'
export { default as VisualSearch } from './search/VisualSearch.vue'

// Category Views
export { default as CategoryList } from './categories/CategoryList.vue'

// User Views
export { default as UserDashboard } from './user/UserDashboard.vue'
export { default as Profile } from './user/Profile.vue'
export { default as Settings } from './user/Settings.vue'
export { default as Orders } from './user/Orders.vue'
export { default as OrderDetails } from './user/OrderDetails.vue'
export { default as Wishlist } from './user/Wishlist.vue'

// Admin Views
export { default as AdminDashboard } from './admin/AdminDashboard.vue'
export { default as Analytics } from './admin/Analytics.vue'
export { default as Customers } from './admin/Customers.vue'
export { default as AdminOrders } from './admin/Orders.vue'
export { default as AdminProducts } from './admin/Products.vue'
export { default as AdminSettings } from './admin/Settings.vue'

// Vendor Views
export { default as VendorDashboard } from './vendor/Dashboard.vue'

// Order Views
export { default as OrderSuccess } from './orders/OrderSuccess.vue'

// Wishlist Views
export { default as WishlistManager } from './wishlist/WishlistManager.vue'
