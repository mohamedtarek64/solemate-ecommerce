<template>
  <div class="search-component">
    <!-- Search Input -->
    <div class="search-input-container">
      <div class="search-input-wrapper">
        <span class="material-symbols-outlined search-icon">search</span>
        <input
          v-model="searchQuery"
          @input="handleSearchInput"
          @focus="showSuggestions = true"
          @blur="hideSuggestions"
          @keydown.enter="performSearch"
          @keydown.escape="hideSuggestions"
          class="search-input"
          type="text"
          placeholder="Search products..."
          aria-label="Search products"
        />
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="clear-button"
          aria-label="Clear search"
        >
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <!-- Search Suggestions -->
      <div v-if="showSuggestions && suggestions.length > 0" class="suggestions-dropdown">
        <div class="suggestions-header">
          <span class="material-symbols-outlined">lightbulb</span>
          <span>Suggestions</span>
        </div>
        <div class="suggestions-list">
          <button
            v-for="(suggestion, index) in suggestions"
            :key="index"
            @click="selectSuggestion(suggestion)"
            class="suggestion-item"
          >
            <span class="material-symbols-outlined">search</span>
            <span>{{ suggestion }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Search Filters -->
    <div v-if="showFilters" class="search-filters">
      <div class="filters-header">
        <h3>Filters</h3>
        <button @click="clearFilters" class="clear-filters-btn">
          <span class="material-symbols-outlined">clear_all</span>
          Clear All
        </button>
      </div>

      <div class="filters-grid">
        <!-- Category Filter -->
        <div class="filter-group">
          <label class="filter-label">Category</label>
          <select v-model="activeFilters.category" @change="applyFilter('category', activeFilters.category)" class="filter-select">
            <option value="">All Categories</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="kids">Kids</option>
          </select>
        </div>

        <!-- Brand Filter -->
        <div class="filter-group">
          <label class="filter-label">Brand</label>
          <select v-model="activeFilters.brand" @change="applyFilter('brand', activeFilters.brand)" class="filter-select">
            <option value="">All Brands</option>
            <option v-for="brand in filters.brands" :key="brand" :value="brand">{{ brand }}</option>
          </select>
        </div>

        <!-- Price Range Filter -->
        <div class="filter-group">
          <label class="filter-label">Price Range</label>
          <div class="price-range">
            <input
              v-model.number="activeFilters.min_price"
              @change="applyFilter('min_price', activeFilters.min_price)"
              type="number"
              placeholder="Min"
              class="price-input"
            />
            <span class="price-separator">-</span>
            <input
              v-model.number="activeFilters.max_price"
              @change="applyFilter('max_price', activeFilters.max_price)"
              type="number"
              placeholder="Max"
              class="price-input"
            />
          </div>
        </div>

        <!-- Size Filter -->
        <div class="filter-group">
          <label class="filter-label">Size</label>
          <select v-model="activeFilters.size" @change="applyFilter('size', activeFilters.size)" class="filter-select">
            <option value="">All Sizes</option>
            <option v-for="size in filters.sizes" :key="size" :value="size">{{ size }}</option>
          </select>
        </div>

        <!-- Sort Filter -->
        <div class="filter-group">
          <label class="filter-label">Sort By</label>
          <select v-model="activeFilters.sort" @change="applyFilter('sort', activeFilters.sort)" class="filter-select">
            <option value="popular">Most Popular</option>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
          </select>
        </div>

        <!-- Feature Filters -->
        <div class="filter-group">
          <label class="filter-label">Features</label>
          <div class="feature-filters">
            <label class="checkbox-label">
              <input
                v-model="activeFilters.in_stock"
                @change="applyFilter('in_stock', activeFilters.in_stock)"
                type="checkbox"
                class="checkbox-input"
              />
              <span class="checkbox-text">In Stock Only</span>
            </label>
            <label class="checkbox-label">
              <input
                v-model="activeFilters.on_sale"
                @change="applyFilter('on_sale', activeFilters.on_sale)"
                type="checkbox"
                class="checkbox-input"
              />
              <span class="checkbox-text">On Sale</span>
            </label>
            <label class="checkbox-label">
              <input
                v-model="activeFilters.featured"
                @change="applyFilter('featured', activeFilters.featured)"
                type="checkbox"
                class="checkbox-input"
              />
              <span class="checkbox-text">Featured</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Search Results -->
    <div v-if="hasResults" class="search-results">
      <div class="results-header">
        <h3>Search Results</h3>
        <span class="results-count">{{ pagination.total }} products found</span>
      </div>

      <div class="results-grid">
        <div
          v-for="product in searchResults"
          :key="product.id"
          class="product-card"
          @click="viewProduct(product.id)"
        >
          <div class="product-image">
            <img :src="product.image_url || '/images/placeholder-product.jpg'" :alt="product.name" />
            <div class="product-badges">
              <span v-if="product.is_new" class="badge badge-new">New</span>
              <span v-if="product.is_sale" class="badge badge-sale">Sale</span>
              <span v-if="product.is_featured" class="badge badge-featured">Featured</span>
            </div>
          </div>
          <div class="product-info">
            <div class="product-brand">{{ product.brand }}</div>
            <h4 class="product-name">{{ product.name }}</h4>
            <div class="product-rating" v-if="product.rating">
              <div class="stars">
                <span v-for="i in 5" :key="i" class="material-symbols-outlined star">
                  {{ i <= product.rating ? 'star' : 'star_border' }}
                </span>
              </div>
              <span class="rating-text">({{ product.reviews_count || 0 }})</span>
            </div>
            <div class="product-price-container">
              <span class="product-price">${{ product.price }}</span>
              <span v-if="product.original_price && product.original_price > product.price"
                    class="product-original-price">${{ product.original_price }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          @click="previousPage"
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          <span class="material-symbols-outlined">chevron_left</span>
          Previous
        </button>

        <div class="pagination-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="['pagination-number', { active: page === currentPage }]"
          >
            {{ page }}
          </button>
        </div>

        <button
          @click="nextPage"
          :disabled="!hasMorePages"
          class="pagination-btn"
        >
          Next
          <span class="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </div>

    <!-- No Results -->
    <div v-else-if="!loading && searchQuery" class="no-results">
      <div class="no-results-icon">
        <span class="material-symbols-outlined">search_off</span>
      </div>
      <h3>No products found</h3>
      <p>Try adjusting your search terms or filters</p>
      <button @click="clearSearch" class="clear-search-btn">Clear Search</button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Searching...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSearch } from '@/composables/useSearch'
import { useSearchComponent } from '@/composables/components/SearchComponent.js'

// Props
const props = defineProps({
  showFilters: {
    type: Boolean,
    default: true
  },
  initialQuery: {
    type: String,
    default: ''
  },
  initialCategory: {
    type: String,
    default: null
  }
})

// Use composables
const router = useRouter()
const {
  searchQuery,
  searchResults,
  loading,
  error,
  suggestions,
  filters,
  pagination,
  activeFilters,
  currentPage,
  hasResults,
  hasFilters,
  totalPages,
  hasMorePages,
  search,
  getSuggestions,
  getFilters,
  applyFilter,
  clearFilters,
  setSearchQuery,
  goToPage,
  nextPage,
  previousPage,
  clearSearch
} = useSearch()

const {
  showSuggestions,
  visiblePages,
  handleSearchInput,
  performSearch,
  selectSuggestion,
  hideSuggestions,
  viewProduct,
  initializeSearch
} = useSearchComponent(props, router, {
  searchQuery,
  activeFilters,
  currentPage,
  totalPages,
  suggestions,
  setSearchQuery,
  getSuggestions,
  search
})

// Initialize
initializeSearch()
</script>

<style scoped>
@import '@/styles/components/SearchComponent.css';

</style>
