<template>
  <div class="wishlist-manager-page">
    <div class="container mx-auto px-4 py-8">
      <div class="wishlist-header">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">My Wishlists</h1>
        <p class="text-gray-600">Manage your saved products and create new wishlists</p>
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>

      <div v-else class="wishlist-content">
        <!-- Create New Wishlist -->
        <div class="mb-8">
          <button
            @click="showCreateForm = true"
            class="btn-primary"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Create New Wishlist
          </button>
        </div>

        <!-- Create Wishlist Form -->
        <div v-if="showCreateForm" class="mb-8">
          <CreateWishlistForm
            @created="handleWishlistCreated"
            @cancelled="showCreateForm = false"
          />
        </div>

        <!-- Wishlists Grid -->
        <div v-if="wishlists.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <WishlistCard
            v-for="wishlist in wishlists"
            :key="wishlist.id"
            :wishlist="wishlist"
            @edit="handleEditWishlist"
            @delete="handleDeleteWishlist"
            @share="handleShareWishlist"
            @view="handleViewWishlist"
          />
        </div>

        <!-- Empty State -->
        <div v-else class="empty-wishlists">
          <div class="text-center py-12">
            <div class="text-gray-400 mb-4">
              <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No wishlists yet</h3>
            <p class="text-gray-600 mb-4">Create your first wishlist to start saving products</p>
            <button
              @click="showCreateForm = true"
              class="btn-primary"
            >
              Create Wishlist
            </button>
          </div>
        </div>

        <!-- Wishlist Analytics -->
        <div v-if="analytics" class="mt-12">
          <WishlistAnalytics :analytics="analytics" />
        </div>
      </div>
    </div>

    <!-- Edit Wishlist Modal -->
    <EditWishlistModal
      v-if="editingWishlist"
      :wishlist="editingWishlist"
      @updated="handleWishlistUpdated"
      @closed="editingWishlist = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useWishlistManager, useWishlistHandlers, initializeWishlistManager } from '@/composables/wishlist/WishlistManager.js'
import CreateWishlistForm from '@/components/wishlist/CreateWishlistForm.vue'
import WishlistCard from '@/components/wishlist/WishlistCard.vue'
import EditWishlistModal from '@/components/wishlist/EditWishlistModal.vue'
import WishlistAnalytics from '@/components/wishlist/WishlistAnalytics.vue'

const {
  wishlists,
  loading,
  analytics,
  loadWishlists,
  loadAnalytics,
  deleteWishlist,
  shareWishlist
} = useWishlistManager()

const {
  showCreateForm,
  editingWishlist,
  handleWishlistCreated: handleCreated,
  handleEditWishlist,
  handleWishlistUpdated: handleUpdated,
  handleDeleteWishlist: handleDelete,
  handleShareWishlist: handleShare,
  handleViewWishlist
} = useWishlistHandlers()

const handleWishlistCreated = () => handleCreated(loadWishlists, loadAnalytics)
const handleWishlistUpdated = () => handleUpdated(loadWishlists, loadAnalytics)
const handleDeleteWishlist = (wishlistId) => handleDelete(wishlistId, deleteWishlist, loadWishlists, loadAnalytics)
const handleShareWishlist = (wishlistId) => handleShare(wishlistId, shareWishlist)

const { onMounted: initWishlistManager } = initializeWishlistManager()

onMounted(async () => {
  await initWishlistManager(loadWishlists, loadAnalytics)
})
</script>

<style scoped>
@import '@/styles/wishlist/WishlistManager.css';
</style>
