<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Breadcrumb -->
    <div class="bg-white border-b border-gray-200">
      <div class="container mx-auto px-4 py-4">
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="flex items-center space-x-4">
            <li>
              <router-link to="/" class="text-gray-400 hover:text-orange-600">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
              </router-link>
            </li>
            <li>
              <div class="flex items-center">
                <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                </svg>
                <span class="ml-4 text-sm font-medium text-gray-500">Products</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>

    <div class="container mx-auto px-4 py-8">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Sidebar Filters -->
        <div class="lg:w-1/4">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Filters</h3>

            <!-- Search -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                v-model="filters.search"
                type="text"
                placeholder="Search products..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                @input="debouncedSearch"
              >
            </div>

            <!-- Categories -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Categories</label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input
                    v-model="filters.category_id"
                    type="radio"
                    value=""
                    class="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                  >
                  <span class="ml-2 text-sm text-gray-700">All Categories</span>
                </label>
                <label
                  v-for="category in categories"
                  :key="category.id"
                  class="flex items-center"
                >
                  <input
                    v-model="filters.category_id"
                    type="radio"
                    :value="category.id"
                    class="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                  >
                  <span class="ml-2 text-sm text-gray-700">{{ category.name }}</span>
                </label>
              </div>
            </div>

            <!-- Price Range -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <div class="grid grid-cols-2 gap-2">
                <input
                  v-model.number="filters.min_price"
                  type="number"
                  placeholder="Min"
                  class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                <input
                  v-model.number="filters.max_price"
                  type="number"
                  placeholder="Max"
                  class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
              </div>
            </div>

            <!-- Availability -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Availability</label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input
                    v-model="filters.in_stock"
                    type="checkbox"
                    class="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  >
                  <span class="ml-2 text-sm text-gray-700">In Stock Only</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="filters.featured"
                    type="checkbox"
                    class="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  >
                  <span class="ml-2 text-sm text-gray-700">Featured Only</span>
                </label>
              </div>
            </div>

            <!-- Clear Filters -->
            <button
              @click="clearFilters"
              class="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <!-- Main Content -->
        <div class="lg:w-3/4">
          <!-- Header -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Products</h1>
              <p class="text-gray-600 mt-1">
                {{ pagination.total }} products found
              </p>
            </div>

            <!-- Sort -->
            <div class="mt-4 sm:mt-0">
              <select
                v-model="filters.sort_by"
                class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                @change="applyFilters"
              >
                <option value="created_at">Newest First</option>
                <option value="name">Name A-Z</option>
                <option value="price">Price Low to High</option>
                <option value="price_desc">Price High to Low</option>
              </select>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>

          <!-- Products Grid -->
          <div v-else-if="products.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <ProductCard
              v-for="product in products"
              :key="product.id"
              :product="product"
              @add-to-cart="handleAddToCart"
              @add-to-wishlist="handleAddToWishlist"
            />
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No products found</h3>
            <p class="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>

          <!-- Pagination -->
          <div v-if="pagination.last_page > 1" class="mt-8 flex justify-center">
            <nav class="flex items-center space-x-2">
              <button
                @click="changePage(pagination.current_page - 1)"
                :disabled="pagination.current_page === 1"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <button
                v-for="page in visiblePages"
                :key="page"
                @click="changePage(page)"
                :class="[
                  'px-3 py-2 text-sm font-medium rounded-md',
                  page === pagination.current_page
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                ]"
              >
                {{ page }}
              </button>

              <button
                @click="changePage(pagination.current_page + 1)"
                :disabled="pagination.current_page === pagination.last_page"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ProductCard from '@/components/products/ProductCard.vue'
import { useProductList } from '@/composables/products/ProductList.js'

// Use the separated script
const {
  // Data
  products,
  pagination,
  loading,
  categories,
  filters,

  // Computed
  visiblePages,

  // Methods
  applyFilters,
  clearFilters,
  changePage,
  handleAddToCart,
  handleAddToWishlist,
  debouncedSearch
} = useProductList()
</script>

<style scoped>
@import '@/styles/products/ProductList.css';
</style>
