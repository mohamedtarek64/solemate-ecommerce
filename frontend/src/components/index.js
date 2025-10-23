// Components Index - Centralized component exports
// This file provides a clean way to import components throughout the application

// Layout Components
export { default as AppHeader } from './layout/AppHeader.vue'
export { default as AppFooter } from './layout/AppFooter.vue'
export { default as AppNavbar } from './layout/AppNavbar.vue'
export { default as OscarHeader } from './layout/OscarHeader.vue'
export { default as OscarFooter } from './layout/OscarFooter.vue'

// Product Components
export { default as ProductCard } from './products/ProductCard.vue'
export { default as ProductGallery } from './products/ProductGallery.vue'
export { default as ProductAttributes } from './products/ProductAttributes.vue'
export { default as SimilarProducts } from './products/SimilarProducts.vue'
export { default as OscarProductCard } from './products/OscarProductCard.vue'

// Cart Components
export { default as CartItem } from './cart/CartItem.vue'
export { default as CartSummary } from './cart/CartSummary.vue'
export { default as MiniCart } from './cart/MiniCart.vue'
export { default as MiniCartItem } from './cart/MiniCartItem.vue'
export { default as CartSidebar } from './CartSidebar.vue'

// Search Components
export { default as SearchBar } from './search/SearchBar.vue'
export { default as SearchModal } from './modals/SearchModal.vue'
export { default as SearchSuggestions } from './search/SearchSuggestions.vue'
export { default as FilterSidebar } from './search/FilterSidebar.vue'
export { default as SavedSearches } from './search/SavedSearches.vue'

// Visual Search Components
export { default as CameraCapture } from './search/CameraCapture.vue'
export { default as ImageUploader } from './search/ImageUploader.vue'
export { default as VisualResults } from './search/VisualResults.vue'

// Checkout Components
export { default as CheckoutSteps } from './checkout/CheckoutSteps.vue'
export { default as AddressForm } from './checkout/AddressForm.vue'
export { default as PaymentMethods } from './checkout/PaymentMethods.vue'
export { default as ShippingMethods } from './checkout/ShippingMethods.vue'
export { default as OrderReview } from './checkout/OrderReview.vue'
export { default as OrderSummary } from './checkout/OrderSummary.vue'

// Category Components
export { default as CategoryTree } from './categories/CategoryTree.vue'

// Auth Components
export { default as SocialLoginButtons } from './auth/SocialLoginButtons.vue'

// Wishlist Components
export { default as WishlistCard } from './wishlist/WishlistCard.vue'

// Modal Components
export { default as QuickViewModal } from './modals/QuickViewModal.vue'

// Section Components
export { default as HeroSection } from './sections/HeroSection.vue'
export { default as FeaturedProducts } from './sections/FeaturedProducts.vue'

// UI Components
export { default as Toast } from './ui/Toast.vue'
export { default as ScrollProgress } from './ui/ScrollProgress.vue'
export { default as NotificationContainer } from './NotificationContainer.vue'
