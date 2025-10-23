<template>
  <div class="invoice-detail-page">
    <!-- Navigation Header -->
    <header class="invoice-header">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <router-link to="/" class="text-2xl font-bold text-primary">
            SoleMate
          </router-link>

          <!-- Search Bar -->
          <div class="flex-1 max-w-2xl mx-8">
            <SearchBar />
          </div>

          <!-- Right Side Actions -->
          <div class="flex items-center gap-4">
            <!-- Cart Icon -->
            <button
              @click="toggleCart"
              class="relative p-2 hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Shopping Cart"
            >
              <span class="material-symbols-outlined text-2xl">shopping_bag</span>
              <span
                v-if="cartStore.totalItems > 0"
                class="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
              >
                {{ cartStore.totalItems }}
              </span>
            </button>

            <!-- Profile Dropdown -->
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>

    <div class="max-w-4xl mx-auto pt-20">
      <!-- Page Header -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <router-link
                to="/invoices"
                class="inline-flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
              </router-link>
              <div>
                <h1 class="text-2xl font-bold text-gray-900">Invoice Details</h1>
                <p class="text-sm text-gray-600 mt-1">View and manage invoice information</p>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <button
                @click="refreshInvoice"
                class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Invoice Detail Component -->
      <InvoiceDetail />
    </div>

    <!-- Cart Sidebar -->
    <CartSidebar
      :isOpen="isCartOpen"
      @close="closeCart"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import InvoiceDetail from '@/components/invoices/InvoiceDetail.vue'
import ProfileDropdown from '@/components/ProfileDropdown.vue'
import CartSidebar from '@/components/CartSidebar.vue'
import SearchBar from '@/components/search/SearchBar.vue'
import { useInvoices } from '@/composables/useInvoices'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const { fetchInvoice } = useInvoices()
const cartStore = useCartStore()

// Cart state
const isCartOpen = ref(false)

// Methods
const refreshInvoice = async () => {
  // Get invoice ID from route params
  const invoiceId = route.params.id
  if (invoiceId) {
    await fetchInvoice(invoiceId)
  }
}

const toggleCart = () => {
  isCartOpen.value = !isCartOpen.value
}

const closeCart = () => {
  isCartOpen.value = false
}
</script>

<style scoped>
@import '@/styles/invoices/Invoices.css';
</style>
