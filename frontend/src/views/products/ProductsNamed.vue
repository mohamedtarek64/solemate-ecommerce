<template>
  <div class="flex min-h-screen flex-col bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] text-[#f5f5f5]" style='font-family: "Space Grotesk", "Noto Sans", sans-serif;'>

    <!-- Main Content -->
    <main class="container mx-auto flex-1 px-4 py-8 lg:px-10">
      <!-- Hero Section -->
      <div class="mb-8 flex flex-col items-center gap-6 text-center">
        <div class="flex items-center gap-4">
          <h1 class="text-5xl font-bold tracking-tighter">All Products</h1>
        </div>

        <!-- Search Bar -->
        <div class="w-full max-w-2xl">
          <div class="relative">
            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input
              v-model="filters.search"
              @input="handleSearch"
              class="form-input w-full rounded-full border-0 bg-[#262626] py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:ring-1 focus:ring-[#f97306]"
              placeholder="Search for products..."
            >
          </div>
        </div>
      </div>

      <!-- Category Tabs -->
      <div class="mb-8 flex justify-center">
        <div class="bg-[#262626] rounded-full p-2 flex gap-2">
          <button
            @click="setActiveCategory('Sneakers')"
            :class="[
              'px-6 py-3 rounded-full font-medium transition-all duration-300',
              activeCategory === 'Sneakers'
                ? 'bg-[#f97306] text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-[#333]'
            ]"
          >
            Men
          </button>
          <button
            @click="setActiveCategory('Training')"
            :class="[
              'px-6 py-3 rounded-full font-medium transition-all duration-300',
              activeCategory === 'Training'
                ? 'bg-[#f97306] text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-[#333]'
            ]"
          >
            Women
          </button>
          <button
            @click="setActiveCategory('Kids')"
            :class="[
              'px-6 py-3 rounded-full font-medium transition-all duration-300',
              activeCategory === 'Kids'
                ? 'bg-[#f97306] text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-[#333]'
            ]"
          >
            Kids
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f97306]"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-20">
        <p class="text-red-400 text-lg">{{ error }}</p>
      </div>

      <!-- Products Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
        <div
          v-for="product in products"
          :key="product.id"
          class="group bg-[#262626] rounded-2xl p-6 hover:bg-[#333] transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#f97306]/20"
        >
          <!-- Product Image -->
          <div class="relative mb-4 overflow-hidden rounded-xl">
            <img
              :src="product.image || '/images/placeholder.jpg'"
              :alt="product.name"
              class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
            >
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
              <button
                @click="viewProduct(product.id)"
                class="bg-white/20 backdrop-blur-sm text-white rounded-full p-3 hover:bg-[#f97306] transition-colors"
              >
                <span class="material-symbols-outlined">visibility</span>
              </button>
              <button
                @click="addToCart(product)"
                class="bg-white/20 backdrop-blur-sm text-white rounded-full p-3 hover:bg-[#f97306] transition-colors"
              >
                <span class="material-symbols-outlined">add_shopping_cart</span>
              </button>
            </div>
          </div>

          <!-- Product Info -->
          <div class="space-y-2">
            <h3 class="text-lg font-semibold text-white group-hover:text-[#f97306] transition-colors">
              {{ product.name }}
            </h3>
            <p class="text-gray-400 text-sm">{{ product.brand }}</p>
            <div class="flex items-center justify-between">
              <span class="text-2xl font-bold text-[#f97306]">${{ product.price }}</span>
              <div class="flex items-center gap-1">
                <span class="material-symbols-outlined text-yellow-400 text-sm">star</span>
                <span class="text-gray-400 text-sm">4.5</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination && pagination.total > perPage" class="flex justify-center">
        <div class="flex gap-2">
          <button
            v-for="page in Math.ceil(pagination.total / perPage)"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-all duration-300',
              currentPage === page
                ? 'bg-[#f97306] text-white'
                : 'bg-[#262626] text-gray-400 hover:text-white hover:bg-[#333]'
            ]"
          >
            {{ page }}
          </button>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-[#1a1a1a] border-t border-gray-800 py-8">
      <div class="container mx-auto px-4 text-center text-gray-400">
        <p>&copy; 2024 SoleMate. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useProductsSetup } from '@/composables/products/ProductsNamed.js'

// Use the products setup composable
const {
  products,
  isLoading,
  error,
  pagination,
  filters,
  searchQuery,
  suggestions,
  activeFilters,
  currentPage,
  perPage,
  setActiveCategory,
  setCategoryFilter,
  setBrandFilter,
  clearFilters,
  setSort,
  toggleColor,
  applyFilters,
  goToPage,
  viewProduct,
  addToCart,
  handleSearch
} = useProductsSetup()
</script>

<style scoped>
@import '@/styles/products/ProductsNamed.css';
</style>
