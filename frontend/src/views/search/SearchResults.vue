<template>
  <div class="search-results-page">
    <!-- Header with Search Bar -->
    <header class="search-header">
      <div class="container">
        <div class="header-content">
          <router-link to="/" class="logo">
            <div class="logo-icon">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
              </svg>
            </div>
            <h2>SoleMate</h2>
          </router-link>

          <SearchBar class="header-search" />

          <div class="header-actions">
            <router-link to="/wishlist" class="action-btn">
              <span class="material-symbols-outlined">favorite</span>
            </router-link>
            <router-link to="/cart" class="action-btn">
              <span class="material-symbols-outlined">shopping_cart</span>
            </router-link>
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="search-main">
      <div class="container">
        <!-- Search Info -->
        <div class="search-info">
          <h1 class="search-title">
            Search Results for "<span class="query-text">{{ searchQuery }}</span>"
          </h1>
          <p class="results-count">{{ totalResults }} products found</p>
        </div>

        <div class="content-wrapper">
          <!-- Filters Sidebar -->
          <aside class="filters-sidebar">
            <div class="filters-header">
              <h3>Filters</h3>
              <button @click="clearAllFilters" class="clear-btn">Clear All</button>
            </div>

            <!-- Price Range -->
            <div class="filter-section">
              <h4>Price Range</h4>
              <div class="price-inputs">
                <input
                  v-model="filters.minPrice"
                  type="number"
                  placeholder="Min"
                  @change="applyFilters"
                  class="price-input"
                />
                <span>-</span>
                <input
                  v-model="filters.maxPrice"
                  type="number"
                  placeholder="Max"
                  @change="applyFilters"
                  class="price-input"
                />
              </div>
            </div>

            <!-- Brands -->
            <div v-if="availableFilters.brands.length > 0" class="filter-section">
              <h4>Brands</h4>
              <div class="filter-options">
                <label
                  v-for="brand in availableFilters.brands"
                  :key="brand"
                  class="filter-option"
                >
                  <input
                    type="checkbox"
                    :value="brand"
                    v-model="filters.brands"
                    @change="applyFilters"
                  />
                  <span>{{ brand }}</span>
                </label>
              </div>
            </div>

            <!-- Categories -->
            <div v-if="availableFilters.categories.length > 0" class="filter-section">
              <h4>Categories</h4>
              <div class="filter-options">
                <label
                  v-for="category in availableFilters.categories"
                  :key="category"
                  class="filter-option"
                >
                  <input
                    type="checkbox"
                    :value="category"
                    v-model="filters.categories"
                    @change="applyFilters"
                  />
                  <span>{{ category }}</span>
                </label>
              </div>
            </div>

            <!-- Gender -->
            <div class="filter-section">
              <h4>Gender</h4>
              <div class="filter-options">
                <label class="filter-option">
                  <input type="checkbox" value="Men" v-model="filters.gender" @change="applyFilters" />
                  <span>Men</span>
                </label>
                <label class="filter-option">
                  <input type="checkbox" value="Women" v-model="filters.gender" @change="applyFilters" />
                  <span>Women</span>
                </label>
                <label class="filter-option">
                  <input type="checkbox" value="Kids" v-model="filters.gender" @change="applyFilters" />
                  <span>Kids</span>
                </label>
              </div>
            </div>
          </aside>

          <!-- Products Grid -->
          <div class="products-section">
            <!-- Sort Options -->
            <div class="sort-bar">
              <span class="sort-label">Sort by:</span>
              <select v-model="filters.sort" @change="applyFilters" class="sort-select">
                <option value="relevance">Relevance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="loading-state">
              <div class="spinner-large"></div>
              <p>Searching products...</p>
            </div>

            <!-- Products Grid -->
            <div v-else-if="products.length > 0" class="products-grid">
              <div
                v-for="product in products"
                :key="`${product.table_source}-${product.id}`"
                class="product-card"
              >
                <div class="product-image">
                  <img :src="product.image_url" :alt="product.name" @error="handleImageError" />
                  <span class="product-badge">{{ product.gender }}</span>
                </div>
                <div class="product-info">
                  <p class="product-brand">{{ product.brand }}</p>
                  <h3 class="product-name">{{ product.name }}</h3>
                  <p class="product-category">{{ product.category }}</p>
                  <div class="product-footer">
                    <span class="product-price">${{ product.price }}</span>
                    <div class="product-actions">
                      <button @click="viewProduct(product)" class="action-icon" title="View Details">
                        <span class="material-symbols-outlined">visibility</span>
                      </button>
                      <button @click="addToCart(product)" class="action-icon" title="Add to Cart">
                        <span class="material-symbols-outlined">shopping_cart</span>
                      </button>
                      <button @click="addToWishlist(product)" class="action-icon" title="Add to Wishlist">
                        <span class="material-symbols-outlined">favorite_border</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- No Results -->
            <div v-else class="no-results">
              <span class="material-symbols-outlined">search_off</span>
              <h3>No products found</h3>
              <p>Try adjusting your search or filters</p>
              <button @click="clearAllFilters" class="retry-btn">Clear Filters</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SearchBar from '@/components/search/SearchBar.vue'
import ProfileDropdown from '@/components/ProfileDropdown.vue'
import { searchProducts } from '@/services/search/searchService'

const route = useRoute()
const router = useRouter()

const searchQuery = ref('')
const products = ref([])
const totalResults = ref(0)
const loading = ref(false)
const filters = ref({
  minPrice: 0,
  maxPrice: 999999,
  brands: [],
  categories: [],
  gender: [],
  sort: 'relevance'
})

const availableFilters = ref({
  brands: [],
  categories: [],
  priceRange: { min: 0, max: 0 }
})

// Perform search
const performSearch = async () => {
  const query = route.query.q
  if (!query) {
    router.push('/products')
    return
  }

  searchQuery.value = query
  loading.value = true

  try {
    const data = await searchProducts({
      query,
      minPrice: filters.value.minPrice,
      maxPrice: filters.value.maxPrice,
      brand: filters.value.brands.join(','),
      category: filters.value.categories.join(','),
      sort: filters.value.sort
    })

    if (data.success) {
      let results = data.data.products

      // Apply gender filter on frontend
      if (filters.value.gender.length > 0) {
        results = results.filter(p => filters.value.gender.includes(p.gender))
      }

      products.value = results
      totalResults.value = results.length

      // Update available filters
      availableFilters.value = {
        brands: data.data.filters.brands || [],
        categories: data.data.filters.categories || [],
        priceRange: data.data.filters.price_range || { min: 0, max: 0 }
      }
    }
  } catch (error) {
    console.error('Search error:', error)
  } finally {
    loading.value = false
  }
}

// Apply filters
const applyFilters = () => {
  performSearch()
}

// Clear all filters
const clearAllFilters = () => {
  filters.value = {
    minPrice: 0,
    maxPrice: 999999,
    brands: [],
    categories: [],
    gender: [],
    sort: 'relevance'
  }
  performSearch()
}

// Handle image error
const handleImageError = (event) => {
  event.target.src = '/images/placeholder-product.jpg'
}

// View product
const viewProduct = (product) => {
  router.push(`/products/${product.id}`)
}

// Add to cart
const addToCart = (product) => {
  // TODO: Implement add to cart
}

// Add to wishlist
const addToWishlist = (product) => {
  // TODO: Implement add to wishlist
}

// Watch route changes
watch(() => route.query.q, () => {
  if (route.path === '/search') {
    performSearch()
  }
})

onMounted(() => {
  performSearch()
})
</script>

<style scoped>
@import '@/styles/search/SearchResults.css';

/* Additional styles */
.search-results-page {
  min-height: 100vh;
  background: #0f0a06;
}

.search-header {
  background: #231910;
  border-bottom: 1px solid #4a3421;
  padding: 16px 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  text-decoration: none;
  font-size: 24px;
  font-weight: bold;
  flex-shrink: 0;
}

.logo-icon {
  width: 40px;
  height: 40px;
  color: #d4a574;
}

.header-search {
  flex: 1;
  max-width: 600px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #2a1e12;
  color: #ccaa8e;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #4a3421;
  color: #d4a574;
}

.search-main {
  padding: 32px 0;
}

.search-info {
  margin-bottom: 32px;
}

.search-title {
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin-bottom: 8px;
}

.query-text {
  color: #d4a574;
}

.results-count {
  color: #8b7355;
  font-size: 16px;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 32px;
}

/* Filters */
.filters-sidebar {
  background: #231910;
  border: 1px solid #4a3421;
  border-radius: 12px;
  padding: 24px;
  height: fit-content;
  position: sticky;
  top: 100px;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #4a3421;
}

.filters-header h3 {
  color: white;
  font-size: 20px;
  font-weight: 600;
}

.clear-btn {
  background: transparent;
  border: none;
  color: #d4a574;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.clear-btn:hover {
  background: #2a1e12;
}

.filter-section {
  margin-bottom: 24px;
}

.filter-section h4 {
  color: #ccaa8e;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-input {
  flex: 1;
  padding: 8px 12px;
  background: #2a1e12;
  border: 1px solid #4a3421;
  border-radius: 6px;
  color: white;
  font-size: 14px;
}

.price-inputs span {
  color: #8b7355;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.filter-option:hover {
  background: #2a1e12;
}

.filter-option input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

/* Products */
.products-section {
  flex: 1;
}

.sort-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background: #231910;
  border: 1px solid #4a3421;
  border-radius: 8px;
}

.sort-label {
  color: #ccaa8e;
  font-size: 14px;
  font-weight: 500;
}

.sort-select {
  padding: 8px 12px;
  background: #2a1e12;
  border: 1px solid #4a3421;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  cursor: pointer;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #8b7355;
}

.spinner-large {
  width: 48px;
  height: 48px;
  border: 4px solid #4a3421;
  border-top-color: #d4a574;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.product-card {
  background: #231910;
  border: 1px solid #4a3421;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
  border-color: #d4a574;
}

.product-image {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: #2a1e12;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 6px 12px;
  background: rgba(212, 165, 116, 0.9);
  color: #231910;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
}

.product-info {
  padding: 16px;
}

.product-brand {
  color: #8b7355;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.product-name {
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-category {
  color: #8b7355;
  font-size: 13px;
  margin-bottom: 12px;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #4a3421;
}

.product-price {
  color: #d4a574;
  font-size: 20px;
  font-weight: 700;
}

.product-actions {
  display: flex;
  gap: 8px;
}

.action-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2a1e12;
  border: 1px solid #4a3421;
  border-radius: 6px;
  color: #ccaa8e;
  cursor: pointer;
  transition: all 0.2s;
}

.action-icon:hover {
  background: #d4a574;
  color: #231910;
  border-color: #d4a574;
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.no-results .material-symbols-outlined {
  font-size: 80px;
  color: #4a3421;
  margin-bottom: 24px;
}

.no-results h3 {
  color: white;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.no-results p {
  color: #8b7355;
  font-size: 16px;
  margin-bottom: 24px;
}

.retry-btn {
  padding: 12px 24px;
  background: #d4a574;
  color: #231910;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #ccaa8e;
}

/* Responsive */
@media (max-width: 1024px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }

  .filters-sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .header-search {
    display: none;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }
}
</style>
