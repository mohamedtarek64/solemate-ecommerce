
<template>
  <div class="flex min-h-screen flex-col bg-[#0f0a06] text-white" style='font-family: "Space Grotesk", "Noto Sans", sans-serif;'>

    <!-- Header Navigation -->
    <header class="bg-[#231910] border-b border-[#4a3421] sticky top-0 z-50 backdrop-blur-sm">
      <div class="container mx-auto px-4 lg:px-10">
        <div class="flex items-center justify-between h-20">
          <!-- Logo -->
          <router-link to="/" class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-[#d4a574] to-[#ccaa8e] rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-[#231910]" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
              </svg>
            </div>
            <span class="text-2xl font-bold text-white">SoleMate</span>
          </router-link>

          <!-- Navigation Links -->
          <nav class="hidden md:flex items-center gap-6">
            <button @click="handleCategoryClick('new')" class="text-[#ccaa8e] hover:text-[#d4a574] transition-colors text-sm font-medium">New Arrivals</button>
            <button @click="handleCategoryClick('men')" class="text-[#ccaa8e] hover:text-[#d4a574] transition-colors text-sm font-medium">Men</button>
            <button @click="handleCategoryClick('women')" class="text-[#ccaa8e] hover:text-[#d4a574] transition-colors text-sm font-medium">Women</button>
            <button @click="handleCategoryClick('kids')" class="text-[#ccaa8e] hover:text-[#d4a574] transition-colors text-sm font-medium">Kids</button>
          </nav>

          <!-- User Actions -->
          <div class="flex items-center gap-2">
            <!-- Wishlist -->
            <router-link to="/wishlist" class="flex h-10 w-10 items-center justify-center rounded-full bg-[#4a3421] text-[#ccaa8e] hover:bg-[#5a4431] hover:text-[#d4a574] transition-colors">
              <span class="material-symbols-outlined text-lg">favorite</span>
            </router-link>

            <!-- Shopping Cart -->
            <router-link to="/cart" class="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#4a3421] text-[#ccaa8e] hover:bg-[#5a4431] hover:text-[#d4a574] transition-colors">
              <span class="material-symbols-outlined text-lg">shopping_bag</span>
              <div v-if="cartItemsCount > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-[#d4a574] rounded-full flex items-center justify-center">
                <span class="text-[#231910] text-xs font-bold">{{ cartItemsCount }}</span>
              </div>
            </router-link>

            <!-- User Profile Dropdown -->
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>

    <!-- Compact Hero Section -->
    <section class="hero-section py-12 lg:py-16 relative overflow-hidden min-h-[40vh] flex items-center bg-gradient-to-br from-[#231910] to-[#1a120c]">
      <!-- Enhanced Background Effects -->
      <div class="absolute inset-0">
        <!-- Main gradient overlay -->
        <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#d4a574]/5 via-transparent to-[#ccaa8e]/3"></div>

        <!-- Animated orbs -->
        <div class="absolute top-20 left-10 w-60 h-60 bg-[#d4a574]/8 rounded-full blur-3xl animate-pulse floating-element"></div>
        <div class="absolute bottom-20 right-10 w-72 h-72 bg-[#ccaa8e]/6 rounded-full blur-3xl animate-pulse floating-element" style="animation-delay: 1s;"></div>

        <!-- Grid pattern overlay -->
        <div class="absolute inset-0 opacity-[0.02]" style="background-image: radial-gradient(circle at 1px 1px, #d4a574 1px, transparent 0); background-size: 50px 50px;"></div>
      </div>

      <div class="container mx-auto px-4 lg:px-10 relative z-10">
        <div class="hero-content flex flex-col items-center gap-12 text-center">
          <!-- Hero Badge -->
          <div class="inline-flex items-center gap-2 bg-gradient-to-r from-[#d4a574]/10 to-[#ccaa8e]/8 backdrop-blur-sm border border-[#4a3421] rounded-full px-6 py-2 animate-fade-in-up">
            <span class="material-symbols-outlined text-[#d4a574] text-sm">star</span>
            <span class="text-[#d4a574] font-semibold text-sm">Premium Collection</span>
          </div>

          <!-- Hero Title -->
          <div class="flex flex-col items-center gap-8 animate-fade-in-up" style="animation-delay: 0.2s;">
            <div class="relative">
              <h1 class="hero-title text-4xl lg:text-6xl font-bold tracking-tight leading-none relative z-10">
                STEP INTO
                <span class="block gradient-text-animated">LEGEND</span>
              </h1>
            </div>

            <div class="max-w-4xl">
              <p class="hero-subtitle text-xl lg:text-2xl leading-relaxed font-light mb-3">
                Where Style Meets Innovation
              </p>
              <p class="text-base lg:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Discover our exclusive collection of premium footwear crafted for the modern lifestyle.
              </p>
            </div>
          </div>

          <!-- Enhanced Search Bar -->
          <div class="w-full max-w-2xl animate-fade-in-up" style="animation-delay: 0.4s;">
            <SearchBar />
          </div>

          <!-- Enhanced Category Tabs -->
          <div class="flex flex-wrap items-center justify-center gap-4 animate-fade-in-up" style="animation-delay: 0.6s;">
            <button
              @click="setActiveCategory('men')"
              :class="[
                'category-tab rounded-xl px-6 py-3 font-semibold text-lg transition-all duration-300 hover:scale-105',
                activeCategory === 'men'
                  ? 'active scale-105'
                  : 'hover:scale-105'
              ]"
            >
              <span class="material-symbols-outlined mr-2 text-xl">man</span>
              Men's Collection
            </button>
            <button
              @click="setActiveCategory('women')"
              :class="[
                'category-tab rounded-xl px-6 py-3 font-semibold text-lg transition-all duration-300 hover:scale-105',
                activeCategory === 'women'
                  ? 'active scale-105'
                  : 'hover:scale-105'
              ]"
            >
              <span class="material-symbols-outlined mr-2 text-xl">woman</span>
              Women's Collection
            </button>
            <button
              @click="setActiveCategory('kids')"
              :class="[
                'category-tab rounded-xl px-6 py-3 font-semibold text-lg transition-all duration-300 hover:scale-105',
                activeCategory === 'kids'
                  ? 'active scale-105'
                  : 'hover:scale-105'
              ]"
            >
              <span class="material-symbols-outlined mr-2 text-xl">child_care</span>
              Kids Collection
            </button>
          </div>

          <!-- Enhanced Stats -->
          <div class="flex flex-wrap items-center justify-center gap-8 mt-6 animate-fade-in-up" style="animation-delay: 0.8s;">
            <div class="text-center group">
              <div class="text-[#d4a574] text-3xl font-bold mb-1 group-hover:scale-110 transition-transform duration-300">{{ products.length }}+</div>
              <div class="text-[#8b7355] text-sm font-medium">Products</div>
            </div>
            <div class="w-px h-8 bg-[#4a3421]"></div>
            <div class="text-center group">
              <div class="text-[#d4a574] text-3xl font-bold mb-1 group-hover:scale-110 transition-transform duration-300">50+</div>
              <div class="text-[#8b7355] text-sm font-medium">Brands</div>
            </div>
            <div class="w-px h-8 bg-[#4a3421]"></div>
            <div class="text-center group">
              <div class="text-[#d4a574] text-3xl font-bold mb-1 group-hover:scale-110 transition-transform duration-300">24/7</div>
              <div class="text-[#8b7355] text-sm font-medium">Support</div>
            </div>
          </div>

          <!-- Call to Action -->
          <div class="flex flex-wrap items-center justify-center gap-4 mt-6 animate-fade-in-up" style="animation-delay: 1s;">
            <button
              @click="handleShopNow"
              class="apply-filters-btn px-6 py-3 rounded-xl font-semibold text-lg hover:scale-105 transition-all duration-300"
            >
              <span class="material-symbols-outlined mr-2 text-xl">shopping_bag</span>
              Shop Now
            </button>
            <button
              @click="handleWatchCollection"
              class="clear-filters-btn px-6 py-3 rounded-xl font-semibold text-lg hover:scale-105 transition-all duration-300"
            >
              <span class="material-symbols-outlined mr-2 text-xl">play_circle</span>
              Watch Collection
            </button>
          </div>
      </div>
      </div>

      <!-- Floating Elements -->
      <div class="absolute top-20 left-20 w-4 h-4 bg-[#f97306] rounded-full animate-bounce opacity-60"></div>
      <div class="absolute top-40 right-32 w-6 h-6 bg-[#ff6b35] rounded-full animate-bounce opacity-40" style="animation-delay: 0.5s;"></div>
      <div class="absolute bottom-32 left-32 w-3 h-3 bg-[#f97306] rounded-full animate-bounce opacity-50" style="animation-delay: 1s;"></div>
    </section>

    <!-- Main Content -->
    <main class="container mx-auto flex-1 px-4 py-6 lg:px-10 relative">
      <!-- Background Effects for Products Section -->
      <div class="absolute inset-0 pointer-events-none">
        <!-- Subtle gradient overlay -->
        <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#f97306]/2 via-transparent to-[#ff6b35]/1"></div>

        <!-- Subtle orbs -->
        <div class="absolute top-20 left-10 w-40 h-40 bg-[#f97306]/3 rounded-full blur-3xl animate-pulse floating-element"></div>
        <div class="absolute bottom-20 right-10 w-48 h-48 bg-[#ff6b35]/2 rounded-full blur-3xl animate-pulse floating-element" style="animation-delay: 1s;"></div>
        <div class="absolute top-1/3 right-1/4 w-32 h-32 bg-[#f97306]/2 rounded-full blur-3xl animate-pulse floating-element" style="animation-delay: 2s;"></div>

        <!-- Subtle central glow -->
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-radial from-[#f97306]/1 to-transparent rounded-full"></div>

        <!-- Subtle grid pattern overlay -->
        <div class="absolute inset-0 opacity-[0.01]" style="background-image: radial-gradient(circle at 1px 1px, #f97306 1px, transparent 0); background-size: 50px 50px;"></div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <!-- Enhanced Filters Sidebar -->
        <aside class="filter-section space-y-6 lg:col-span-1 p-6 rounded-2xl relative">
          <!-- Filter Header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined gradient-text text-2xl">tune</span>
              <h2 class="text-2xl font-bold gradient-text">Filters</h2>
            </div>
            <!-- Active Filters Badge -->
            <span 
              v-if="activeFiltersCount > 0" 
              class="bg-gradient-to-r from-[#f97306] to-[#ff6b35] text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse"
            >
              {{ activeFiltersCount }}
            </span>
          </div>

          <div class="space-y-6">
            <!-- Search Filter -->
            <div class="space-y-3">
              <label class="flex items-center gap-2">
                <span class="material-symbols-outlined text-gray-400">search</span>
                <span class="text-sm font-semibold text-gray-300">Search Products</span>
              </label>
              <div class="relative">
                <input
                  v-model="filters.search"
                  @input="handleFilterChange"
                  type="text"
                  placeholder="Search by name..."
                  class="form-select w-full rounded-xl py-3 px-4 pr-10"
                />
                <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  search
                </span>
              </div>
            </div>

            <!-- Brand Filter -->
            <div class="space-y-3">
              <label class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-gray-400">branding_watermark</span>
                  <span class="text-sm font-semibold text-gray-300">Brand</span>
                </div>
                <button 
                  v-if="filters.brand"
                  @click="filters.brand = ''; handleFilterChange()"
                  class="text-xs text-[#f97306] hover:text-[#ff6b35] transition-colors"
                >
                  Clear
                </button>
              </label>
              <select
                v-model="filters.brand"
                @change="handleFilterChange"
                class="form-select w-full rounded-xl py-3 px-4 transition-all duration-300 hover:border-[#f97306]"
              >
                <option value="">All Brands</option>
                <option v-for="brand in brands" :key="brand" :value="brand">{{ brand }}</option>
              </select>
            </div>

            <!-- Price Range with Visual Indicator -->
            <div class="space-y-3">
              <label class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-gray-400">attach_money</span>
                  <span class="text-sm font-semibold text-gray-300">Price Range</span>
                </div>
                <button 
                  v-if="filters.price !== 500"
                  @click="filters.price = 500; handleFilterChange()"
                  class="text-xs text-[#f97306] hover:text-[#ff6b35] transition-colors"
                >
                  Reset
                </button>
              </label>
              <div class="space-y-4">
                <div class="relative">
                  <input
                    v-model="filters.price"
                    @input="handleFilterChange"
                    class="w-full h-3 cursor-pointer appearance-none rounded-lg bg-gradient-to-r from-[#262626] to-[#1e1e1e] accent-[#f97306]"
                    max="500"
                    min="0"
                    type="range"
                  />
                  <!-- Price Indicator -->
                  <div 
                    class="absolute top-[-30px] bg-gradient-to-r from-[#f97306] to-[#ff6b35] text-white text-xs font-bold px-2 py-1 rounded transition-all duration-200"
                    :style="{ left: `calc(${(filters.price / 500) * 100}% - 20px)` }"
                  >
                    ${{ filters.price }}
                  </div>
                </div>
                <div class="flex justify-between items-center text-sm">
                  <span class="text-gray-400">$0</span>
                  <div class="flex items-center gap-2">
                    <span class="text-gray-400">Max:</span>
                    <span class="gradient-text font-bold text-lg">${{ filters.price || 500 }}</span>
                  </div>
                  <span class="text-gray-400">$500+</span>
                </div>
              </div>
            </div>

            <!-- Category Filter -->
            <div class="space-y-3">
              <label class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-gray-400">category</span>
                  <span class="text-sm font-semibold text-gray-300">Category</span>
                </div>
                <button 
                  v-if="filters.category"
                  @click="filters.category = ''; handleFilterChange()"
                  class="text-xs text-[#f97306] hover:text-[#ff6b35] transition-colors"
                >
                  Clear
                </button>
              </label>
              <select
                v-model="filters.category"
                @change="handleFilterChange"
                class="form-select w-full rounded-xl py-3 px-4 transition-all duration-300 hover:border-[#f97306]"
              >
                <option value="">All Categories</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Filter Actions -->
          <div class="space-y-3 pt-4 border-t border-gray-700">
            <button
              @click="applyFilters"
              class="apply-filters-btn w-full rounded-xl py-4 font-bold text-white text-lg transition-all duration-300 hover:scale-105"
              :disabled="isLoading || productsLoading"
            >
              <span v-if="!isLoading && !productsLoading" class="material-symbols-outlined mr-2">check</span>
              <span v-else class="material-symbols-outlined mr-2 animate-spin">refresh</span>
              {{ isLoading || productsLoading ? 'Loading...' : 'Apply Filters' }}
            </button>
            <button
              @click="clearFilters"
              class="clear-filters-btn w-full rounded-xl py-3 font-semibold transition-all duration-300 hover:scale-105"
              :disabled="activeFiltersCount === 0"
            >
              <span class="material-symbols-outlined mr-2">refresh</span>
              Clear All Filters
            </button>
          </div>

          <!-- Active Filters Summary -->
          <div v-if="activeFiltersCount > 0" class="pt-4 border-t border-gray-700">
            <div class="text-xs text-gray-400 mb-2">Active Filters:</div>
            <div class="flex flex-wrap gap-2">
              <span v-if="filters.search" class="filter-tag">
                Search: {{ filters.search }}
                <button @click="filters.search = ''; handleFilterChange()" class="ml-1 hover:text-red-400">×</button>
              </span>
              <span v-if="filters.brand" class="filter-tag">
                Brand: {{ filters.brand }}
                <button @click="filters.brand = ''; handleFilterChange()" class="ml-1 hover:text-red-400">×</button>
              </span>
              <span v-if="filters.category" class="filter-tag">
                Category
                <button @click="filters.category = ''; handleFilterChange()" class="ml-1 hover:text-red-400">×</button>
              </span>
              <span v-if="filters.price !== 500" class="filter-tag">
                Max: ${{ filters.price }}
                <button @click="filters.price = 500; handleFilterChange()" class="ml-1 hover:text-red-400">×</button>
              </span>
            </div>
          </div>
        </aside>

        <!-- Enhanced Products Section -->
        <section class="lg:col-span-3">
          <!-- Enhanced Header with Sort -->
          <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
            <div class="flex items-center gap-4">
              <h2 class="text-4xl font-bold tracking-tighter gradient-text">
                {{ activeCategory ? `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}'s Collection` : 'All Products' }}
              </h2>
              <span class="px-3 py-1 bg-gradient-to-r from-[#f97306] to-[#ff6b35] text-white text-sm font-semibold rounded-full">
                {{ products.length }} Products
              </span>
            </div>

            <div class="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0a0a0a] to-[#1a1a1a] p-2 border border-gray-700">
              <span class="material-symbols-outlined text-gray-400 mr-2">sort</span>
              <button
                v-for="sortOption in sortOptions"
                :key="sortOption.value"
                @click="setSort(sortOption.value)"
                :class="[
                  'filter-button rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300',
                  filters.sort === sortOption.value
                    ? 'active'
                    : 'hover:scale-105'
                ]"
              >
                {{ sortOption.label }}
              </button>
            </div>
          </div>

          <!-- Optimized Loading State -->
          <OptimizedLoading
            v-if="isLoading || productsLoading || optimizedLoading"
            type="skeleton"
            :count="8"
            skeleton-class="product-card"
            message="Loading products..."
          />

          <!-- Error State -->
          <div v-else-if="error" class="empty-state mt-8 text-center py-16 rounded-2xl">
            <div class="text-red-400 mb-6 text-xl">
              <span class="material-symbols-outlined text-4xl mb-2 block">error</span>
              {{ error }}
            </div>
            <button
              @click="loadProducts"
              class="apply-filters-btn px-6 py-3 rounded-xl font-semibold"
            >
              <span class="material-symbols-outlined mr-2">refresh</span>
              Try Again
            </button>
          </div>

          <!-- Enhanced Products Grid with Performance Optimization -->
          <div v-else-if="products.length > 0" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
               :style="{ contain: 'layout style paint' }">
            <div
              v-for="(product, index) in products"
              :key="product.id"
              class="product-card group relative flex flex-col rounded-2xl p-4 animate-fade-in-scale"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <!-- Product Image -->
              <div class="aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] cursor-pointer relative" @click="viewProduct(product.id)">
                <img
                  :alt="product.name"
                  :src="product.image_url || product.image || '/images/placeholder-product.jpg'"
                  class="product-image h-full w-full object-cover object-center"
                  loading="lazy"
                  decoding="async"
                  @error="$event.target.src = '/images/placeholder-product.jpg'"
                />

                <!-- Product Overlay -->
                <div class="product-overlay rounded-xl">
                  <div class="product-actions">
                    <button
                      @click.stop="viewProduct(product.id)"
                      class="product-action-btn"
                      title="View Product"
                    >
                      <span class="material-symbols-outlined text-xl">visibility</span>
                    </button>
                  </div>
                </div>

                <!-- Product Badge -->
                <div v-if="product.is_featured" class="absolute top-3 left-3 bg-gradient-to-r from-[#d4a574] to-[#ccaa8e] text-[#231910] text-xs font-bold px-2 py-1 rounded-full">
                  Featured
                </div>
              </div>

              <!-- Product Info -->
              <div class="mt-4 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs text-gray-400 font-medium uppercase tracking-wide">{{ product.brand }}</span>
                  <div class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-yellow-400 text-sm">star</span>
                    <span class="text-sm text-gray-400">4.5</span>
                  </div>
                </div>

                <h3 class="text-lg font-semibold text-white line-clamp-2 group-hover:text-[#d4a574] transition-colors">
                  {{ product.name }}
                </h3>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-xl font-bold text-[#d4a574]">${{ product.price }}</span>
                    <span v-if="product.original_price && product.original_price > product.price" class="text-sm text-gray-400 line-through">
                      ${{ product.original_price }}
                    </span>
                  </div>
                  <span class="text-xs text-gray-400">{{ product.category }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Enhanced Empty State -->
          <div v-else class="empty-state mt-8 text-center py-20 rounded-2xl">
            <div class="text-gray-400 mb-6">
              <span class="material-symbols-outlined text-6xl mb-4 block opacity-50">inventory_2</span>
              <div class="text-2xl font-semibold mb-2">No products found</div>
              <p class="text-gray-500">Try adjusting your search or filter criteria to find what you're looking for.</p>
            </div>
            <button
              @click="clearFilters"
              class="apply-filters-btn px-6 py-3 rounded-xl font-semibold"
            >
              <span class="material-symbols-outlined mr-2">refresh</span>
              Clear All Filters
            </button>
          </div>

          <!-- Enhanced Pagination -->
          <div v-if="pagination.last_page > 1" class="mt-16 flex items-center justify-center">
            <nav class="flex items-center space-x-2 bg-gradient-to-r from-[#0a0a0a] to-[#1a1a1a] p-2 rounded-xl border border-gray-700">
              <button
                @click="goToPage(pagination.current_page - 1)"
                :disabled="pagination.current_page === 1"
                class="pagination-button rounded-lg p-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="material-symbols-outlined">chevron_left</span>
              </button>

              <button
                v-for="page in visiblePages"
                :key="page"
                @click="goToPage(page)"
                :class="[
                  'pagination-button flex size-10 items-center justify-center rounded-lg text-sm font-medium transition-all duration-300',
                  page === pagination.current_page
                    ? 'active'
                    : 'hover:scale-105'
                ]"
              >
                {{ page }}
              </button>

              <button
                @click="goToPage(pagination.current_page + 1)"
                :disabled="pagination.current_page === pagination.last_page"
                class="pagination-button rounded-lg p-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="material-symbols-outlined">chevron_right</span>
              </button>
            </nav>
          </div>
        </section>
      </div>
    </main>

    <!-- Footer -->
    <footer class="mt-12 bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] backdrop-blur-sm">
      <div class="container mx-auto px-4 py-6 lg:px-10">
        <div class="grid grid-cols-2 gap-6 md:grid-cols-4">
          <div>
            <h3 class="font-semibold text-white mb-3">Shop</h3>
            <ul class="space-y-2 text-sm text-gray-400">
              <li><router-link to="/products?new=true" class="hover:text-[#f97306] transition-colors">New Arrivals</router-link></li>
              <li><router-link to="/products?category=men" class="hover:text-[#f97306] transition-colors">Men</router-link></li>
              <li><router-link to="/products?category=women" class="hover:text-[#f97306] transition-colors">Women</router-link></li>
              <li><router-link to="/products?category=kids" class="hover:text-[#f97306] transition-colors">Kids</router-link></li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-white mb-3">About</h3>
            <ul class="space-y-2 text-sm text-gray-400">
              <li><a class="hover:text-[#f97306] transition-colors" href="#">Our Story</a></li>
              <li><a class="hover:text-[#f97306] transition-colors" href="#">Careers</a></li>
              <li><a class="hover:text-[#f97306] transition-colors" href="#">Press</a></li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-white mb-3">Support</h3>
            <ul class="space-y-2 text-sm text-gray-400">
              <li><a class="hover:text-[#f97306] transition-colors" href="#">FAQ</a></li>
              <li><a class="hover:text-[#f97306] transition-colors" href="#">Contact Us</a></li>
              <li><a class="hover:text-[#f97306] transition-colors" href="#">Shipping & Returns</a></li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-white mb-3">Follow Us</h3>
            <div class="flex space-x-3">
              <a class="text-gray-400 hover:text-[#f97306] transition-colors" href="#">
                <svg aria-hidden="true" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path clip-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" fill-rule="evenodd"></path>
                </svg>
              </a>
              <a class="text-gray-400 hover:text-[#f97306] transition-colors" href="#">
                <svg aria-hidden="true" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a class="text-gray-400 hover:text-[#f97306] transition-colors" href="#">
                <svg aria-hidden="true" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path clip-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 012.712 2.712c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-2.712 2.712c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.013-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-2.712-2.712c-.247-.636-.416-1.363-.465-2.427C2.013 14.784 2 14.43 2 12s.013-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 012.712-2.712c.636-.247 1.363.416 2.427.465C9.53 2.013 9.884 2 12.315 2zM12 7a5 5 0 100 10 5 5 0 000-10zm0-2a7 7 0 110 14 7 7 0 010-14zm6.406-2.11a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" fill-rule="evenodd"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div class="mt-6 border-t border-gray-800 pt-6 text-center text-sm text-gray-400">
          <p>© 2025 SoleMate. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>

import { ref, computed, nextTick } from 'vue'
import { useNotifications } from '@/composables/useNotifications'
import useProductsSetup from '@/composables/products/Products.js'
import OptimizedLoading from '@/components/OptimizedLoading.vue'
import { useOptimizedProducts, useDebouncedApi } from '@/composables/useOptimizedApi.js'
import { useLoadingState } from '@/utils/loadingStates.js'
import { debounce } from '@/utils/performance.js'
import ProfileDropdown from '@/components/ProfileDropdown.vue'
import SearchBar from '@/components/search/SearchBar.vue'
import { useWishlistStore } from '@/stores/wishlist'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { getColorNameFromHex } from '@/utils/colorMapping'
// ✅ Enhanced Performance Components
import OptimizedImage from '@/components/common/OptimizedImage.vue'
import VirtualScroll from '@/components/common/VirtualScroll.vue'
import advancedCache from '@/utils/advancedCache'
import performanceMonitorEnhanced from '@/utils/performanceMonitorEnhanced'

// Use the products setup composable
const {
  products,
  isLoading,
  error,
  pagination,
  filters,
  activeCategory,
  selectedColors,
  brands,
  sizes,
  colors,
  categories,
  sortOptions,
  visiblePages,
  user,
  isAuthenticated,
  loadProducts,
  handleSearch,
  handleFilterChange,
  setActiveCategory,
  setCategoryFilter,
  setBrandFilter,
  clearFilters,
  setSort,
  toggleColor,
  applyFilters,
  goToPage,
  viewProduct,
  addToCart
} = useProductsSetup()

// Initialize stores
const wishlistStore = useWishlistStore()
const cartStore = useCartStore()
const authStore = useAuthStore()

// Performance optimizations
const buttonLoadingStates = ref({})
const tabSwitching = ref(false)

// Cart count (memoized)
const cartItemsCount = computed(() => cartStore.items.length)

// Wishlist items set for O(1) lookup
const wishlistItemIds = computed(() => new Set(wishlistStore.items.map(item => item.product_id)))

// Debounced wishlist toggle with loading state
const toggleWishlist = async (productId) => {
  if (buttonLoadingStates.value[productId]) return // Prevent double clicks

  if (!authStore.user) {
    success('Please login to add items to wishlist!')
    return
  }

  buttonLoadingStates.value[productId] = true

  try {
    const product = products.value.find(p => p.id === productId)
    if (!product) {
      console.error('Product not found:', productId)
      return
    }

    // Get user ID from localStorage
    const userId = localStorage.getItem('user_id') || localStorage.getItem('auth_token')
    if (!userId) {
      success('Please login to add items to wishlist!')
      return
    }

    // O(1) lookup instead of O(n)
    const isInWishlist = wishlistItemIds.value.has(productId)

    if (isInWishlist) {
      await wishlistStore.removeFromWishlist(productId)
      success('Removed from wishlist!')
    } else {
      // Prepare product data for wishlist
      const productData = {
        product_id: productId,
        product_table: product.source_table || 'products_men',
        color: '',
        size: '',
        user_id: userId
      }
      
      await wishlistStore.addToWishlist(productData)
      success('Added to wishlist!')
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error)
    success('Error updating wishlist!')
  } finally {
    // Clear loading state after a short delay to prevent spam
    setTimeout(() => {
      buttonLoadingStates.value[productId] = false
    }, 500)
  }
}

// Debounced add to cart with loading state
const addToCartEnhanced = async (productId) => {
  if (buttonLoadingStates.value[`cart-${productId}`]) return // Prevent double clicks

  buttonLoadingStates.value[`cart-${productId}`] = true

  try {
    const product = products.value.find(p => p.id === productId)
    if (!product) {
      console.error('Product not found:', productId)
      return
    }

    // Get user ID from localStorage
    const userId = localStorage.getItem('user_id') || localStorage.getItem('auth_token')
    if (!userId) {
      success('Please login to add items to cart!')
      return
    }

    // Validate product before sending to cart store
    if (!product || !product.id) {
      console.error('❌ Products.vue: Invalid product object!', {
        product,
        productId: product?.id,
        productKeys: product ? Object.keys(product) : 'product is null/undefined'
      })
      success('Error: Invalid product data!')
      return
    }

    await cartStore.addToCart(
      product, // Pass the full product object as first parameter
      '', // selectedSize (empty for now)
      '', // selectedColor (empty for now)
      1, // quantity
      userId // user_id
    )

    success(`Added ${product.name} to cart!`)
  } catch (error) {
    console.error('Error adding to cart:', error)
    success('Error adding to cart!')
  } finally {
    // Clear loading state after a short delay
    setTimeout(() => {
      buttonLoadingStates.value[`cart-${productId}`] = false
    }, 500)
  }
}

// Call to Action functions
const handleShopNow = () => {
  // Scroll to products section
  const productsSection = document.querySelector('.lg\\:col-span-3')
  if (productsSection) {
    productsSection.scrollIntoView({ behavior: 'smooth' })
  }
}

const handleWatchCollection = () => {
  // TODO: Implement video modal or redirect to video
  success('Opening collection video...')
}

// Use optimized products API with caching
const {
  loading: optimizedLoading,
  data: optimizedProducts,
  loadProducts: optimizedLoadProducts,
  searchProducts: optimizedSearchProducts
} = useOptimizedProducts()

// Use debounced API for search with shorter delay for better UX
const { loading: searchLoading } = useDebouncedApi(200)

// API call optimization with request deduplication
const pendingRequests = new Map()

const optimizedApiCall = async (url, options = {}) => {
  const key = `${url}-${JSON.stringify(options)}`

  // Return existing promise if request is already pending
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)
  }

  const promise = fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    }
  }).then(response => {
    pendingRequests.delete(key)
    return response.json()
  }).catch(error => {
    pendingRequests.delete(key)
    throw error
  })

  pendingRequests.set(key, promise)
  return promise
}

// Use loading states
const { loading: productsLoading, withLoading: withProductsLoading } = useLoadingState('products_page')

// Additional imports for notifications
const { success } = useNotifications()

// Header search functionality
const headerSearchQuery = ref('')

// Helper function to get color names
const getColorName = (color) => {
  return getColorNameFromHex(color).charAt(0).toUpperCase() + getColorNameFromHex(color).slice(1)
}

// Computed property for active filters count
const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.value.search) count++
  if (filters.value.brand) count++
  if (filters.value.category) count++
  if (filters.value.price !== 500) count++
  return count
})

        const handleHeaderSearch = debounce(async () => {
          if (headerSearchQuery.value.trim()) {
            filters.search = headerSearchQuery.value
            await handleSearch()
            // Scroll to products section with optimized timing
            requestAnimationFrame(() => {
              const productsSection = document.querySelector('.lg\\:col-span-3')
              if (productsSection) {
                productsSection.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
                })
              }
            })
          }
        }, 200)

        // Optimized category switching with smooth transitions
        const handleCategoryClick = async (category) => {
          if (tabSwitching.value) return // Prevent rapid switching

          tabSwitching.value = true

          try {
            // Use nextTick for smooth UI updates
            await nextTick()
            setActiveCategory(category)

            // Smooth scroll with requestAnimationFrame for better performance
            requestAnimationFrame(() => {
              const productsSection = document.querySelector('.lg\\:col-span-3')
              if (productsSection) {
                productsSection.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
                })
              }
            })
          } finally {
            // Allow tab switching again after a short delay
            setTimeout(() => {
              tabSwitching.value = false
            }, 300)
          }
        }
</script>

<style scoped>
@import '@/styles/products/Products.css';
</style>
