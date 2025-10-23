<template>
  <div class="search-bar-container" ref="searchContainer">
    <!-- Search Input -->
    <div class="search-input-wrapper">
      <span class="material-symbols-outlined search-icon">search</span>
      <input
        v-model="searchQuery"
        @input="() => handleInput(searchQuery)"
        @focus="openSuggestions"
        @keydown.enter="() => navigateToSearch()"
        @keydown.down.prevent="navigateSuggestions(1)"
        @keydown.up.prevent="navigateSuggestions(-1)"
        @keydown.esc="closeSuggestions"
        type="text"
        class="search-input"
        placeholder="Search for products, brands, categories..."
        aria-label="Search products"
      />

      <!-- Clear Button -->
      <button
        v-if="searchQuery"
        @click="clearSearch"
        class="clear-button"
        aria-label="Clear search"
      >
        <span class="material-symbols-outlined">close</span>
      </button>

      <!-- Loading Indicator -->
      <div v-if="loading" class="loading-spinner">
        <div class="spinner"></div>
      </div>
    </div>

    <!-- Suggestions Dropdown -->
    <transition name="fade-slide">
      <div
        v-if="showSuggestions && (suggestions.length > 0 || searchQuery.length > 0)"
        class="suggestions-dropdown"
      >
        <!-- Suggestions List -->
        <div v-if="suggestions.length > 0" class="suggestions-list">
          <div class="suggestions-header">
            <span class="material-symbols-outlined">search</span>
            <span>Products ({{ suggestions.length }})</span>
          </div>
          <button
            v-for="(suggestion, index) in suggestions"
            :key="`${suggestion.table_source}-${suggestion.id}`"
            @click="selectSuggestion(suggestion)"
            @mouseenter="selectedIndex = index"
            :class="['suggestion-item', 'suggestion-item-enhanced', { active: selectedIndex === index }]"
          >
            <!-- Product Image -->
            <div class="suggestion-image">
              <img :src="suggestion.image_url" :alt="suggestion.name" @error="handleImageError" />
              <span class="gender-badge">{{ suggestion.gender }}</span>
            </div>

            <!-- Product Details -->
            <div class="suggestion-content">
              <span class="suggestion-name">{{ suggestion.name }}</span>
              <span class="suggestion-meta">
                <span class="brand-tag">{{ suggestion.brand }}</span>
                <span class="category-tag">{{ suggestion.category }}</span>
              </span>
              <span class="suggestion-price">${{ parseFloat(suggestion.price).toFixed(2) }}</span>
            </div>

            <!-- Arrow Icon -->
            <span class="material-symbols-outlined arrow-icon">arrow_forward</span>
          </button>
        </div>

        <!-- No Results -->
        <div v-else-if="searchQuery.length > 2 && !loading" class="no-results">
          <span class="material-symbols-outlined">search_off</span>
          <p>No suggestions found</p>
          <button @click="navigateToSearch" class="search-anyway-btn">
            Search for "{{ searchQuery }}"
          </button>
        </div>

        <!-- Popular Searches (when empty) -->
        <div v-else-if="popularSearches.length > 0 && searchQuery.length === 0" class="popular-searches">
          <div class="suggestions-header">
            <span class="material-symbols-outlined">local_fire_department</span>
            <span>Popular Products</span>
          </div>
          <button
            v-for="(popular, index) in popularSearches"
            :key="`popular-${popular.table_source}-${popular.id}`"
            @click="selectSuggestion(popular)"
            :class="['suggestion-item', 'suggestion-item-enhanced']"
          >
            <!-- Product Image -->
            <div class="suggestion-image">
              <img :src="popular.image_url" :alt="popular.name" @error="handleImageError" />
              <span class="gender-badge">{{ popular.gender }}</span>
            </div>

            <!-- Product Details -->
            <div class="suggestion-content">
              <span class="suggestion-name">{{ popular.name }}</span>
              <span class="suggestion-meta">
                <span class="brand-tag">{{ popular.brand }}</span>
                <span class="category-tag">{{ popular.category }}</span>
              </span>
              <span class="suggestion-price">${{ parseFloat(popular.price).toFixed(2) }}</span>
            </div>

            <!-- Arrow Icon -->
            <span class="material-symbols-outlined arrow-icon">arrow_forward</span>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useSearch } from '@/composables/search/useSearch'

// Use search composable
const {
  searchQuery,
  suggestions,
  popularSearches,
  loading,
  showSuggestions,
  selectedIndex,
  handleInput,
  fetchPopularSearches,
  navigateToSearch,
  navigateSuggestions,
  selectSuggestion,
  clearSearch,
  closeSuggestions,
  openSuggestions,
  cleanup
} = useSearch()

// Template ref
const searchContainer = ref(null)

// Handle image error
const handleImageError = (event) => {
  event.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&auto=format&q=80'
}

// Click outside handler
const handleClickOutside = (event) => {
  if (searchContainer.value && !searchContainer.value.contains(event.target)) {
    closeSuggestions()
  }
}

// Lifecycle
onMounted(() => {
  fetchPopularSearches()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  cleanup()
})
</script>

<style scoped>
@import '@/styles/search/SearchBar.css';
</style>
