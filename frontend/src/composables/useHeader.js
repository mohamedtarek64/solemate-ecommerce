/**
 * Header composable for managing header state and functionality
 */

import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { countries, getDefaultCountry, searchCountries } from '@/data/countries'

export function useHeader() {
  // Router and stores
  const router = useRouter()
  const authStore = useAuthStore()
  const cartStore = useCartStore()
  const wishlistStore = useWishlistStore()

  // Reactive data
  const searchQuery = ref('')
  const showUserMenu = ref(false)
  const showCategoryMenu = ref(false)
  const showMobileMenu = ref(false)
  const selectedCountry = reactive(getDefaultCountry())
  const countrySearch = ref('')

  // Computed properties
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const user = computed(() => authStore.user)
  const cartCount = computed(() => cartStore.itemCount)
  const wishlistCount = computed(() => wishlistStore.itemCount)

  // Filtered countries based on search
  const filteredCountries = computed(() => {
    return searchCountries(countrySearch.value)
  })

  // Methods
  const handleSearch = () => {
    if (searchQuery.value.trim()) {
      router.push({
        name: 'products',
        query: { search: searchQuery.value.trim() }
      })
    }
  }

  const toggleUserMenu = () => {
    showUserMenu.value = !showUserMenu.value
  }

  const toggleCategoryMenu = () => {
    showCategoryMenu.value = !showCategoryMenu.value
  }

  const toggleMobileMenu = () => {
    showMobileMenu.value = !showMobileMenu.value
  }

  const selectCountry = (country) => {
    selectedCountry.code = country.code
    selectedCountry.name = country.name
    selectedCountry.flag = country.flag
    selectedCountry.currency = country.currency
    selectedCountry.region = country.region
    countrySearch.value = ''
    
    // You can add logic here to update currency, shipping rates, etc.
    // Emit event or update global state if needed
    // emit('country-changed', country)
  }

  const handleLogout = async () => {
    try {
      await authStore.logout()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const closeMenus = () => {
    showUserMenu.value = false
    showCategoryMenu.value = false
    showMobileMenu.value = false
  }

  // Close menus when clicking outside
  const handleClickOutside = (event) => {
    if (!event.target.closest('.user-menu') && !event.target.closest('.category-menu')) {
      closeMenus()
    }
  }

  return {
    // Data
    searchQuery,
    showUserMenu,
    showCategoryMenu,
    showMobileMenu,
    selectedCountry,
    countrySearch,
    
    // Computed
    isAuthenticated,
    user,
    cartCount,
    wishlistCount,
    filteredCountries,
    
    // Methods
    handleSearch,
    toggleUserMenu,
    toggleCategoryMenu,
    toggleMobileMenu,
    selectCountry,
    handleLogout,
    closeMenus,
    handleClickOutside
  }
}
