<template>

  <div class="relative flex size-full min-h-screen flex-col overflow-x-hidden">
      <!-- Header -->
      <header class="sticky top-0 z-10 bg-[#231910]/80 backdrop-blur-sm">
        <div class="container mx-auto flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#4a3421] px-4 sm:px-6 lg:px-8 py-3">
          <router-link to="/" class="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <svg class="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
            </svg>
            <h1 class="text-2xl font-bold tracking-tight">SoleMate</h1>
          </router-link>

          <nav class="hidden md:flex items-center gap-8">
            <router-link to="/products?new=true" class="text-sm font-medium hover:text-orange-500 transition-colors">New Arrivals</router-link>
            <router-link to="/products?category=men" class="text-sm font-medium hover:text-orange-500 transition-colors">Men</router-link>
            <router-link to="/products?category=women" class="text-sm font-medium hover:text-orange-500 transition-colors">Women</router-link>
            <router-link to="/products?category=kids" class="text-sm font-medium hover:text-orange-500 transition-colors">Kids</router-link>
          </nav>

          <div class="flex items-center gap-2">
            <button @click="showSearchModal = true" class="flex h-10 w-10 items-center justify-center rounded-full bg-[#4a3421] text-white transition-colors hover:bg-[#5a4431]">
              <span class="material-symbols-outlined text-xl">search</span>
            </button>
            <router-link to="/wishlist" class="flex h-10 w-10 items-center justify-center rounded-full bg-[#4a3421] text-white transition-colors hover:bg-[#5a4431]">
              <span class="material-symbols-outlined text-xl">favorite_border</span>
            </router-link>
            <router-link to="/cart" class="flex h-10 w-10 items-center justify-center rounded-full bg-[#4a3421] text-white transition-colors hover:bg-[#5a4431]">
              <span class="material-symbols-outlined text-xl">shopping_bag</span>
            </router-link>
            <ProfileDropdown />
          </div>
        </div>

        <!-- Search Modal -->
        <SearchModal v-model="showSearchModal" @close="showSearchModal = false" />
      </header>

      <!-- Main Content -->
      <main class="container mx-auto flex-1 px-4 sm:px-6 lg:px-8 py-10">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <!-- Sidebar -->
          <aside class="lg:col-span-1">
            <div class="bg-[#231910] rounded-xl p-6">
              <h2 class="text-3xl font-bold mb-8">My Account</h2>
              <nav class="flex flex-col space-y-2">
                <router-link
                  to="/profile"
                  class="flex items-center gap-3 rounded-md px-4 py-3 bg-orange-500 text-white font-bold text-sm"
                >
                  <span class="material-symbols-outlined">person</span>
                  <span>Profile</span>
                </router-link>
                <router-link
                  to="/orders"
                  class="flex items-center gap-3 rounded-md px-4 py-3 hover:bg-[#4a3421] text-[#ccaa8e] hover:text-white font-semibold text-sm transition-colors"
                >
                  <span class="material-symbols-outlined">receipt_long</span>
                  <span>Orders</span>
                </router-link>
                <router-link
                  to="/wishlist"
                  class="flex items-center gap-3 rounded-md px-4 py-3 hover:bg-[#4a3421] text-[#ccaa8e] hover:text-white font-semibold text-sm transition-colors"
                >
                  <span class="material-symbols-outlined">favorite_border</span>
                  <span>Wishlist</span>
                </router-link>
                <router-link
                  to="/settings"
                  class="flex items-center gap-3 rounded-md px-4 py-3 hover:bg-[#4a3421] text-[#ccaa8e] hover:text-white font-semibold text-sm transition-colors"
                >
                  <span class="material-symbols-outlined">settings</span>
                  <span>Settings</span>
                </router-link>
                <div class="border-t border-[#4a3421] my-4"></div>
                <button
                  @click="handleLogout"
                  class="flex items-center gap-3 rounded-md px-4 py-3 hover:bg-[#4a3421] text-[#ccaa8e] hover:text-white font-semibold text-sm transition-colors"
                >
                  <span class="material-symbols-outlined">logout</span>
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </aside>

          <!-- Profile Content -->
          <div class="lg:col-span-3">
            <div class="bg-[#231910] rounded-xl p-8">
              <h3 class="text-2xl font-bold mb-6">Personal Information</h3>

              <!-- Success Message -->
              <div v-if="success" class="mb-4 p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
                <p class="text-green-400">{{ success }}</p>
              </div>

              <!-- Error Message -->
              <div v-if="showError" class="mb-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                <p class="text-red-400">{{ showError }}</p>
              </div>

              <!-- Info Message for Empty Profile -->
              <div v-if="!profileForm.name && !profileForm.email && !isLoading" class="mb-4 p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
                <div class="flex items-start">
                  <span class="material-symbols-outlined text-blue-400 mr-3">info</span>
                  <div>
                    <p class="text-blue-400 font-semibold mb-1">Welcome! Please complete your profile</p>
                    <p class="text-blue-300 text-sm">Fill in your information below to get started. All changes are saved automatically.</p>
                  </div>
                </div>
              </div>

              <form @submit.prevent="submitForm" class="space-y-6">
                <!-- Personal Information -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-[#ccaa8e] mb-2" for="name">
                      Name <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="profileForm.name"
                      class="form-input"
                      id="name"
                      placeholder="Enter your name"
                      type="text"
                      required
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-[#ccaa8e] mb-2" for="email">
                      Email Address <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="profileForm.email"
                      class="form-input"
                      id="email"
                      placeholder="Enter your email"
                      type="email"
                      required
                    />
                  </div>
                </div>

                <!-- Shipping Address -->
                <div class="border-t border-[#4a3421] pt-6">
                  <h3 class="text-2xl font-bold mb-6">Shipping Address</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="md:col-span-2">
                      <label class="block text-sm font-medium text-[#ccaa8e] mb-2" for="shipping-address">Address</label>
                      <input
                        v-model="profileForm.shippingAddress.address"
                        class="form-input"
                        id="shipping-address"
                        placeholder="123 Sneaker Lane"
                        type="text"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-[#ccaa8e] mb-2" for="shipping-city">City</label>
                      <input
                        v-model="profileForm.shippingAddress.city"
                        class="form-input"
                        id="shipping-city"
                        placeholder="Footwearville"
                        type="text"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-[#ccaa8e] mb-2" for="shipping-state">State / Province</label>
                      <input
                        v-model="profileForm.shippingAddress.state"
                        class="form-input"
                        id="shipping-state"
                        placeholder="CA"
                        type="text"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-[#ccaa8e] mb-2" for="shipping-zip">Zip / Postal Code</label>
                      <input
                        v-model="profileForm.shippingAddress.zip"
                        class="form-input"
                        id="shipping-zip"
                        placeholder="90210"
                        type="text"
                      />
                    </div>
                  </div>
                </div>

                <!-- Billing Address -->
                <div class="border-t border-[#4a3421] pt-6">
                  <div class="flex items-center justify-between mb-6">
                    <h3 class="text-2xl font-bold">Billing Address</h3>
                    <label class="flex items-center space-x-2 cursor-pointer">
                      <input
                        v-model="sameAsShipping"
                        @change="toggleBillingAddress"
                        class="form-checkbox h-4 w-4 rounded bg-[#4a3421] border-[#6a4a2f] text-orange-500 focus:ring-orange-500"
                        type="checkbox"
                      />
                      <span class="text-sm text-[#ccaa8e]">Same as shipping</span>
                    </label>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="md:col-span-2">
                      <label class="block text-sm font-medium text-[#ccaa8e] mb-2" for="billing-address">Address</label>
                      <input
                        v-model="profileForm.billingAddress.address"
                        :disabled="sameAsShipping"
                        class="form-input"
                        id="billing-address"
                        placeholder="123 Sneaker Lane"
                        type="text"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-[#ccaa8e] mb-2" for="billing-city">City</label>
                      <input
                        v-model="profileForm.billingAddress.city"
                        :disabled="sameAsShipping"
                        class="form-input"
                        id="billing-city"
                        placeholder="Footwearville"
                        type="text"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-[#ccaa8e] mb-2" for="billing-state">State / Province</label>
                      <input
                        v-model="profileForm.billingAddress.state"
                        :disabled="sameAsShipping"
                        class="form-input"
                        id="billing-state"
                        placeholder="CA"
                        type="text"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-[#ccaa8e] mb-2" for="billing-zip">Zip / Postal Code</label>
                      <input
                        v-model="profileForm.billingAddress.zip"
                        :disabled="sameAsShipping"
                        class="form-input"
                        id="billing-zip"
                        placeholder="90210"
                        type="text"
                      />
                    </div>
                  </div>
                </div>

                <!-- Save Button -->
                <div class="flex justify-end pt-4">
                  <button
                    type="submit"
                    :disabled="isLoading"
                    class="flex min-w-[120px] items-center justify-center rounded-lg bg-orange-500 px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span v-if="isLoading" class="flex items-center">
                      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </span>
                    <span v-else>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  </template>

  <script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import SearchModal from '@/components/search/SearchModal.vue'
import { useAuth } from '@/composables/useAuth'
import { useAuthStore } from '@/stores/auth'
import { useNotifications } from '@/composables/useNotifications'
import { useProfileState, useProfileAuth, useProfileActions, initializeProfile } from '@/composables/user/Profile.js'
import ProfileDropdown from '@/components/ProfileDropdown.vue'
// ✅ Enhanced Profile Optimization
import { useProfileOptimization } from '@/composables/useProfileOptimization'
import OptimizedImage from '@/components/common/OptimizedImage.vue'
import advancedCache from '@/utils/advancedCache'
import performanceMonitorEnhanced from '@/utils/performanceMonitorEnhanced'

// Search modal state
const showSearchModal = ref(false)

// State
const { profileForm, isLoading, sameAsShipping, autoSaveToLocalStorage, loadFromLocalStorage } = useProfileState()

// Auth
const { router, authStore, user, isAuthenticated, authLogout, isLoggedIn } = useProfileAuth()

// Actions
const {
  toggleBillingAddress: toggleBilling,
  saveAddresses,
  loadAddresses,
  loadUserData,
  handleSubmit: submitForm,
  handleLogout: logout,
  success,
  showError
} = useProfileActions()

// Wrapper functions
const toggleBillingAddress = () => toggleBilling(sameAsShipping, profileForm)
const handleSubmit = () => submitForm(profileForm, isLoading, success, showError, user, loadUserData)
const handleLogout = () => logout(authLogout, success, router, showError)

// Initialize
const { onMounted: initProfile } = initializeProfile()

// ✅ Enhanced Profile Optimization
const userId = computed(() => authStore.user?.id)
const profileOptimization = useProfileOptimization(userId)

// Auto-save watchers
watch(profileForm, () => {
  autoSaveToLocalStorage()
}, { deep: true })

watch(sameAsShipping, () => {
  autoSaveToLocalStorage()
})

onMounted(async () => {
  // ✅ Start performance monitoring
  const measurement = performanceMonitorEnhanced.startMeasure('profile-page-load', 'page-load')
  
  try {
    // Load from localStorage first (immediate data)
    loadFromLocalStorage()
    
    // Initialize profile
    await initProfile(authStore, user, isAuthenticated, router, loadUserData, profileForm)
    
    // ✅ Setup lazy loading for images
    requestAnimationFrame(() => {
      const images = document.querySelectorAll('img')
      images.forEach((img, index) => {
        if (index > 1) img.loading = 'lazy'
      })
    })
    
    } finally {
    performanceMonitorEnhanced.endMeasure(measurement)
  }
})
</script>

<style scoped>
@import "@/styles/user/Profile.css";
</style>
