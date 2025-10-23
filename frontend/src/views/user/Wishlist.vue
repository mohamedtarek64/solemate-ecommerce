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
          <button class="flex h-10 w-10 items-center justify-center rounded-full bg-[#4a3421] text-white transition-colors hover:bg-[#5a4431]">
            <span class="material-symbols-outlined text-xl">favorite_border</span>
          </button>
          <button class="flex h-10 w-10 items-center justify-center rounded-full bg-[#4a3421] text-white transition-colors hover:bg-[#5a4431]">
            <span class="material-symbols-outlined text-xl">shopping_bag</span>
          </button>
          <ProfileDropdown />
        </div>
      </div>
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
                class="flex items-center gap-3 rounded-md px-4 py-3 hover:bg-[#4a3421] text-[#ccaa8e] hover:text-white font-semibold text-sm transition-colors"
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
                class="flex items-center gap-3 rounded-md px-4 py-3 bg-orange-500 text-white font-bold text-sm"
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

        <!-- Main Content Area -->
        <div class="lg:col-span-3">
          <!-- Page Header -->
          <div class="mb-8 flex flex-wrap items-center justify-between gap-6">
            <h2 class="text-4xl font-bold tracking-tighter">My Wishlist</h2>
            <div class="flex items-center gap-4">
              <button
                v-if="wishlistItems && wishlistItems.length > 0"
                @click="shareWishlist"
                class="flex items-center gap-2 rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-700"
              >
                <span class="material-symbols-outlined text-sm">share</span>
                Share Wishlist
              </button>
              <button
                v-if="wishlistItems && wishlistItems.length > 0"
                @click="optimizedClearWishlist"
                :disabled="buttonLoadingStates['clear']"
                class="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                <span class="material-symbols-outlined text-sm">{{ buttonLoadingStates['clear'] ? 'refresh' : 'delete' }}</span>
                {{ buttonLoadingStates['clear'] ? 'Clearing...' : 'Clear All' }}
              </button>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="flex items-center justify-center py-12">
            <OptimizedLoading />
          </div>

          <!-- Error State -->
          <div v-else-if="errorMessage" class="rounded-lg border border-red-500/30 bg-red-900/20 p-6">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-red-400">error</span>
              <div>
                <h3 class="text-sm font-medium text-red-300">Error loading wishlist</h3>
                <p class="mt-1 text-sm text-red-400">{{ errorMessage }}</p>
              </div>
            </div>
            <div class="mt-4">
              <button
                @click="loadWishlist"
                class="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="!wishlistItems || wishlistItems.length === 0" class="rounded-lg border border-[#4a3421] bg-[#231910] p-12 text-center">
            <div class="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#4a3421]">
              <span class="material-symbols-outlined text-4xl text-[#ccaa8e]">favorite_border</span>
            </div>
            <h3 class="mt-4 text-lg font-medium text-white">Your wishlist is empty</h3>
            <p class="mt-2 text-sm text-[#ccaa8e]">Start adding items you love to your wishlist!</p>
            <div class="mt-6">
              <router-link
                to="/products"
                class="inline-flex items-center rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
              >
                <span class="material-symbols-outlined mr-2 text-sm">shopping_bag</span>
                Browse Products
              </router-link>
            </div>
          </div>

          <!-- Wishlist Items -->
          <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="item in wishlistItems"
              :key="item.id"
              class="group relative overflow-hidden rounded-lg border border-[#4a3421] bg-[#231910] transition-all hover:shadow-lg hover:shadow-orange-500/10"
            >
              <!-- Product Image -->
              <div class="aspect-square overflow-hidden bg-[#2d2218]">
                <img
                  :src="item.product_image || item.product?.image_url || item.product?.image || '/images/placeholder-product.jpg'"
                  :alt="item.product_name || item.product?.name || 'Product'"
                  class="h-full w-full object-cover transition-transform group-hover:scale-105"
                  @error="$event.target.src = '/images/placeholder-product.jpg'"
                />
              </div>

              <!-- Product Info -->
              <div class="p-4">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h3 class="text-lg font-medium text-white line-clamp-2">{{ item.product_name || item.product?.name || 'Unknown Product' }}</h3>
                    <p class="mt-1 text-sm text-[#ccaa8e]">{{ item.product?.brand || 'Unknown Brand' }}</p>
                    <div class="mt-2 flex items-center gap-2">
                      <span class="text-lg font-bold text-white">${{ item.product_price || item.product?.price || '0.00' }}</span>
                      <span v-if="item.original_price && item.original_price > (item.product_price || item.product?.price)" class="text-sm text-[#ccaa8e] line-through">
                        ${{ item.original_price }}
                      </span>
                    </div>
                  </div>
                  <button
                    @click="optimizedRemoveFromWishlist(item.id)"
                    :disabled="buttonLoadingStates[`remove-${item.id}`]"
                    class="flex h-8 w-8 items-center justify-center rounded-full bg-red-900/30 text-red-400 transition-colors hover:bg-red-900/50 disabled:opacity-50"
                  >
                    <span class="material-symbols-outlined text-sm">{{ buttonLoadingStates[`remove-${item.id}`] ? 'refresh' : 'favorite' }}</span>
                  </button>
                </div>

                <!-- Actions -->
                <div class="mt-4 flex gap-2">
                  <router-link
                    :to="`/products/${item.product_id || item.product?.id || 0}`"
                    class="flex-1 rounded-md bg-orange-500 px-3 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-orange-600"
                  >
                    View Details
                  </router-link>
                  <button
                    @click="optimizedAddToCart(item)"
                    :disabled="buttonLoadingStates[`cart-${item.id}`]"
                    class="flex-1 rounded-md border border-[#4a3421] bg-[#2d2218] px-3 py-2 text-sm font-medium text-[#ccaa8e] transition-colors hover:bg-[#4a3421] hover:text-white disabled:opacity-50"
                  >
                    {{ buttonLoadingStates[`cart-${item.id}`] ? 'Adding...' : 'Add to Cart' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Wishlist Stats -->
          <div v-if="wishlistItems && wishlistItems.length > 0" class="mt-8 rounded-lg border border-[#4a3421] bg-[#231910] p-6">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div class="text-center">
                <div class="text-2xl font-bold text-white">{{ wishlistItems.length }}</div>
                <div class="text-sm text-[#ccaa8e]">Items in Wishlist</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-white">${{ totalWishlistValue }}</div>
                <div class="text-sm text-[#ccaa8e]">Total Value</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-white">{{ averagePrice }}</div>
                <div class="text-sm text-[#ccaa8e]">Average Price</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Search Modal -->
    <SearchModal v-model="showSearchModal" @close="showSearchModal = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useNotifications } from '@/composables/useNotifications'
import wishlistService from '@/services/wishlistService'
import ProfileDropdown from '@/components/ProfileDropdown.vue'
import SearchModal from '@/components/search/SearchModal.vue'
import OptimizedLoading from '@/components/OptimizedLoading.vue'
// ✅ Enhanced Wishlist Optimization
import OptimizedImage from '@/components/common/OptimizedImage.vue'
import VirtualScroll from '@/components/common/VirtualScroll.vue'
import wishlistOptimizer from '@/utils/wishlistOptimizer'
import performanceMonitorEnhanced from '@/utils/performanceMonitorEnhanced'

// Composables
const router = useRouter()
const { user, logout } = useAuth()
const { showSuccess, showError } = useNotifications()

// Wishlist state
const wishlistItems = ref([])
const loading = ref(false)
const error = ref(null)
const buttonLoadingStates = ref({})

// Load wishlist items
const loadWishlist = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await wishlistService.getWishlistItems()

    if (response.success) {
      wishlistItems.value = response.data.items || []
      } else {
      error.value = response.message
    }
  } catch (err) {
    error.value = 'Failed to load wishlist'
    console.error('Error loading wishlist:', err)
  } finally {
    loading.value = false
  }
}

// Remove from wishlist
const removeFromWishlist = async (itemId) => {
  try {
    const response = await wishlistService.removeFromWishlist(itemId)

    if (response.success) {
      // Remove from local state
      wishlistItems.value = wishlistItems.value.filter(item => item.id !== itemId)
      showSuccess('Item removed from wishlist')
    } else {
      showError(response.message || 'Failed to remove item')
    }
  } catch (err) {
    showError('Failed to remove item from wishlist')
    console.error('Error removing from wishlist:', err)
  }
}

// Clear wishlist
const clearWishlist = async () => {
  try {
    const response = await wishlistService.clearWishlist()

    if (response.success) {
      wishlistItems.value = []
      showSuccess('Wishlist cleared successfully')
    } else {
      showError(response.message || 'Failed to clear wishlist')
    }
  } catch (err) {
    showError('Failed to clear wishlist')
    console.error('Error clearing wishlist:', err)
  }
}

// Add to cart (placeholder)
const addToCartFromComposable = async (item) => {
  showSuccess(`${item.product_name} added to cart`)
}

// Optimized actions with loading states
const optimizedRemoveFromWishlist = async (itemId) => {
  if (buttonLoadingStates.value[`remove-${itemId}`]) return

  buttonLoadingStates.value[`remove-${itemId}`] = true

  try {
    await removeFromWishlist(itemId)
  } finally {
    setTimeout(() => {
      buttonLoadingStates.value[`remove-${itemId}`] = false
    }, 300)
  }
}

const optimizedAddToCart = async (item) => {
  if (buttonLoadingStates.value[`cart-${item.id}`]) return

  buttonLoadingStates.value[`cart-${item.id}`] = true

  try {
    await addToCartFromComposable(item)
  } finally {
    setTimeout(() => {
      buttonLoadingStates.value[`cart-${item.id}`] = false
    }, 500)
  }
}

const optimizedClearWishlist = async () => {
  if (buttonLoadingStates.value['clear']) return

  buttonLoadingStates.value['clear'] = true

  try {
    await clearWishlist()
  } finally {
    setTimeout(() => {
      buttonLoadingStates.value['clear'] = false
    }, 1000)
  }
}

// Search modal state
const showSearchModal = ref(false)

// Handle error state
const errorMessage = computed(() => {
  if (error.value) {
    return typeof error.value === 'string' ? error.value : 'An error occurred while loading the wishlist'
  }
  return null
})

// Enhanced addToCart function
const addToCart = (item) => {
  const cartItem = {
    product_id: item.product_id || item.product?.id,
    product_name: item.product_name || item.product?.name,
    quantity: 1,
    price: item.product_price || item.product?.price,
    image: item.product_image || item.product?.image_url || item.product?.image
  }
  addToCartFromComposable(cartItem)
}

// Computed
const totalWishlistValue = computed(() => {
  if (!wishlistItems.value) return '0.00'
  return wishlistItems.value
    .reduce((total, item) => {
      const price = item.product_price || item.product?.price || 0
      return total + parseFloat(price)
    }, 0)
    .toFixed(2)
})

const averagePrice = computed(() => {
  if (!wishlistItems.value || wishlistItems.value.length === 0) return '$0.00'
  const total = parseFloat(totalWishlistValue.value)
  const average = total / wishlistItems.value.length
  return `$${average.toFixed(2)}`
})

// Methods
const shareWishlist = () => {
  if (navigator.share) {
    navigator.share({
      title: 'My SoleMate Wishlist',
      text: `Check out my wishlist on SoleMate! I have ${wishlistItems.value.length} amazing items saved.`,
      url: window.location.href
    }).catch(console.error)
  } else {
    // Fallback to clipboard
    navigator.clipboard.writeText(window.location.href).then(() => {
      showSuccess('Wishlist link copied to clipboard!')
    }).catch(() => {
      showError('Failed to copy wishlist link')
    })
  }
}

// Handle logout
const handleLogout = async () => {
  try {
    await logout()
    router.push('/')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

// Lifecycle
onMounted(async () => {
  await loadWishlist()
})
</script>

<style scoped>
@import '@/styles/wishlist/Wishlist.css';
@import '@/styles/components/OptimizedButtons.css';
</style>
