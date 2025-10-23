<template>
  <div class="relative flex size-full min-h-screen flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 group/design-root overflow-x-hidden" style='font-family: "Inter", "Orbitron", sans-serif;'>
    <!-- Navigation -->
    <div class="fixed top-0 left-0 right-0 z-50 bg-slate-900/40 backdrop-blur-md transition-all duration-300" id="navbar">
      <header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-stone-800/50 px-4 sm:px-10 py-3">
        <router-link to="/" class="flex items-center gap-4 text-white hover:opacity-80 transition-opacity">
          <svg class="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
          </svg>
          <h2 class="text-white text-3xl font-bold tracking-tighter" style='font-family: "Orbitron", sans-serif;'>SoleMate</h2>
        </router-link>
        <div class="hidden md:flex flex-1 justify-center gap-8">
          <div class="flex items-center gap-10">
            <router-link to="/" class="relative text-white text-lg font-medium leading-normal nav-link transition-colors duration-300 hover:text-green-400">Home</router-link>
            <router-link to="/products" class="relative text-gray-400 text-lg font-medium leading-normal nav-link transition-colors duration-300 hover:text-green-400">Shop</router-link>
            <router-link to="/products?new=true" class="relative text-gray-400 text-lg font-medium leading-normal nav-link transition-colors duration-300 hover:text-green-400">New Arrivals</router-link>
            <router-link to="/products" class="relative text-gray-400 text-lg font-medium leading-normal nav-link transition-colors duration-300 hover:text-green-400">Brands</router-link>
            <router-link to="/products?category=kids" class="relative text-gray-400 text-lg font-medium leading-normal nav-link transition-colors duration-300 hover:text-green-400">Kids</router-link>
          </div>
        </div>
        <div class="hidden md:flex gap-4 items-center">
          <button @click="showSearchModal = true" class="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-gray-800 border border-transparent text-white hover:border-green-400 hover:text-green-400 transition-all duration-300">
            <span class="material-symbols-outlined">search</span>
          </button>
          <router-link to="/cart" class="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-gray-800 border border-transparent text-white hover:border-green-400 hover:text-green-400 transition-all duration-300">
            <span class="material-symbols-outlined">shopping_bag</span>
          </router-link>
          <!-- User Profile or Login/Register Buttons -->
          <div class="flex gap-2 ml-4">
            <template v-if="isAuthenticated && user">
              <!-- User Profile Dropdown Component -->
              <ProfileDropdown />
            </template>
            <template v-else-if="isAuthenticated && !user">
              <!-- Loading state -->
              <div class="flex items-center justify-center w-10 h-10 bg-gray-600 rounded-full">
                <span class="material-symbols-outlined text-lg animate-spin">refresh</span>
              </div>
            </template>
            <template v-else>
              <!-- Login/Register Buttons -->
              <router-link to="/login" class="flex items-center justify-center w-10 h-10 bg-gray-800 border border-transparent text-white hover:border-green-400 hover:text-green-400 transition-all duration-300 rounded-full" title="Login">
                <span class="material-symbols-outlined text-lg">login</span>
              </router-link>
              <router-link to="/register" class="flex items-center justify-center w-10 h-10 bg-orange-500 text-white hover:bg-orange-600 transition-all duration-300 rounded-full" title="Register">
                <span class="material-symbols-outlined text-lg">person_add</span>
              </router-link>
            </template>
          </div>
        </div>
        <div class="md:hidden flex items-center gap-2">
          <template v-if="isAuthenticated && user">
            <!-- User Profile Dropdown Component -->
            <ProfileDropdown />
          </template>
          <template v-else-if="isAuthenticated && !user">
            <!-- Loading state -->
            <div class="flex items-center justify-center w-8 h-8 bg-gray-600 rounded-full">
              <span class="material-symbols-outlined text-sm animate-spin">refresh</span>
            </div>
          </template>
          <template v-else>
            <!-- Login/Register Buttons -->
            <router-link to="/login" class="flex items-center justify-center w-8 h-8 bg-gray-800 border border-transparent text-white hover:border-green-400 hover:text-green-400 transition-all duration-300 rounded-full" title="Login">
              <span class="material-symbols-outlined text-sm">login</span>
            </router-link>
            <router-link to="/register" class="flex items-center justify-center w-8 h-8 bg-orange-500 text-white hover:bg-orange-600 transition-all duration-300 rounded-full" title="Register">
              <span class="material-symbols-outlined text-sm">person_add</span>
            </router-link>
          </template>
          <button class="text-white">
            <span class="material-symbols-outlined text-3xl">menu</span>
          </button>
        </div>
      </header>
    </div>

    <!-- Main Content -->
    <div class="layout-container flex h-full grow flex-col">
      <main class="flex-1">
      <!-- Hero Section -->
        <section class="relative h-screen flex items-center justify-center overflow-hidden text-white bg-gradient-to-br from-gray-900 to-black">
          <!-- Hero Background Image - Fixed -->
          <div class="absolute inset-0 bg-cover bg-center transition-all duration-1000"
               style="background-image: url('https://assets.adidas.com/images/w_1880,f_auto,q_auto/b9724d8ce964432c830ac2065431ed31_9366/IH3083_HM3_hover.jpg'); opacity: 0.3; background-position: center center; background-size: cover; background-repeat: no-repeat;">
          </div>

          <div class="relative z-10 text-center px-4 sm:px-20 max-w-5xl">
            <!-- Animated Badge -->
            <div class="mb-8 animate-fade-in-up">
              <span class="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold px-8 py-4 rounded-full uppercase tracking-widest shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                PREMIUM SNEAKERS COLLECTION
              </span>
            </div>

            <!-- Main Heading with Animation -->
            <h1 class="text-white text-7xl md:text-9xl font-black leading-tight tracking-tighter font-orbitron mb-8 animate-fade-in-up" style="animation-delay: 0.2s;">
              <span class="bg-gradient-to-r from-white via-orange-200 to-orange-400 bg-clip-text text-transparent">SoleMate</span>
            </h1>

            <!-- Subtitle with Better Typography -->
            <p class="text-gray-200 text-2xl md:text-3xl font-light leading-relaxed mb-12 max-w-3xl mx-auto animate-fade-in-up" style="animation-delay: 0.4s;">
              Discover the ultimate collection of
              <span class="text-orange-400 font-semibold">premium sneakers</span>.
              Style, comfort, and performance in every step.
            </p>

            <!-- Login/Register CTA or Welcome Message -->
            <div v-if="!isAuthenticated" class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <p class="text-gray-300 text-lg">Join the SoleMate Community</p>
              <div class="flex gap-3">
                <router-link to="/login" class="px-6 py-3 text-white bg-transparent border-2 border-white rounded-lg hover:bg-white hover:text-gray-900 transition-all duration-300 font-medium">
                  Login
                </router-link>
                <router-link to="/register" class="px-6 py-3 text-gray-900 bg-white rounded-lg hover:bg-gray-100 transition-all duration-300 font-medium">
                  Create Account
                </router-link>
              </div>
            </div>
            <!-- Welcome Message for Logged In Users -->
            <div v-else-if="isAuthenticated && user" class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <!-- Loading state for welcome message -->
              <div v-if="welcomeLoading" class="text-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                <p class="text-gray-300 text-lg">Loading welcome message...</p>
              </div>

              <!-- Welcome message from backend -->
              <div v-else-if="welcomeMessage && !welcomeError" class="text-center">
                <p class="text-gray-300 text-lg mb-2">{{ welcomeMessage }}</p>
                <div class="flex items-center justify-center gap-4 text-sm text-gray-400">
                  <span v-if="lastLogin">Last login: {{ lastLogin }}</span>
                  <span v-if="orderCount > 0">{{ orderCount }} orders</span>
                  <span v-if="wishlistCount > 0">{{ wishlistCount }} wishlist</span>
                </div>
              </div>

              <!-- Fallback message -->
              <div v-else class="text-center">
                <p class="text-gray-300 text-lg">
                  <span v-if="user?.role === 'admin'">Welcome back, Admin!</span>
                  <span v-else>Welcome back, {{ user?.first_name || user?.name || 'User' }}!</span>
                </p>
              </div>

              <div class="flex gap-3">
                <button @click="handleProfileClickAction" class="px-6 py-3 text-white bg-transparent border-2 border-white rounded-lg hover:bg-white hover:text-gray-900 transition-all duration-300 font-medium cursor-pointer">
                  {{ user?.role === 'admin' ? 'Admin Dashboard' : 'View Profile' }}
                </button>
                <router-link to="/products" class="px-6 py-3 text-gray-900 bg-white rounded-lg hover:bg-gray-100 transition-all duration-300 font-medium">
                  Shop Now
                </router-link>
              </div>
            </div>
            <!-- Loading state for authenticated users -->
            <div v-else-if="isAuthenticated && !user" class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <p class="text-gray-300 text-lg">Loading...</p>
              <div class="flex gap-3">
                <div class="px-6 py-3 text-white bg-transparent border-2 border-white rounded-lg">
                  <span class="material-symbols-outlined animate-spin">refresh</span>
                </div>
                <router-link to="/products" class="px-6 py-3 text-gray-900 bg-white rounded-lg hover:bg-gray-100 transition-all duration-300 font-medium">
                  Shop Now
                </router-link>
              </div>
            </div>
          </div>
        </section>

        <!-- Men Products Section (placeholder removed - moved below) -->


        <!-- Features Section -->
        <div class="py-16 px-4 sm:px-10 features-section bg-slate-800/30">
          <div class="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div class="flex items-center justify-center gap-3">
              <span class="material-symbols-outlined text-4xl text-accent-green">local_shipping</span>
              <div>
                <h4 class="font-bold text-lg">Free Shipping</h4>
                <p class="text-sm text-text-dark">On orders over $100</p>
              </div>
            </div>
            <div class="flex items-center justify-center gap-3">
              <span class="material-symbols-outlined text-4xl text-accent-green">assignment_return</span>
              <div>
                <h4 class="font-bold text-lg">Easy Returns</h4>
                <p class="text-sm text-text-dark">30-day return policy</p>
              </div>
            </div>
            <div class="flex items-center justify-center gap-3">
              <span class="material-symbols-outlined text-4xl text-accent-green">verified_user</span>
              <div>
                <h4 class="font-bold text-lg">Secure Payments</h4>
                <p class="text-sm text-text-dark">Trusted & encrypted</p>
              </div>
            </div>
            <div class="flex items-center justify-center gap-3">
              <span class="material-symbols-outlined text-4xl text-accent-green">military_tech</span>
              <div>
                <h4 class="font-bold text-lg">Authenticity Guaranteed</h4>
                <p class="text-sm text-text-dark">100% Genuine products</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Featured Products Section -->
        <section class="px-4 sm:px-20 py-16 bg-slate-800/20">
          <h2 class="text-white text-4xl font-bold leading-tight tracking-tighter px-4 pb-8 font-orbitron text-center">Featured Products</h2>

          <!-- Loading State -->
          <div v-if="featuredLoading" class="text-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p class="text-gray-300 text-lg">Loading featured products...</p>
                </div>

          <!-- Error State -->
          <div v-else-if="featuredError" class="text-center py-12">
            <div class="text-red-500 text-4xl mb-4">⚠️</div>
            <p class="text-gray-300 text-lg mb-2">Failed to load featured products</p>
            <p class="text-gray-400 text-sm">{{ featuredError }}</p>
            <button @click="loadFeaturedProducts" class="mt-4 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">Retry</button>
            </div>

          <!-- Products Grid -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div v-for="product in featuredProducts" :key="product.id" class="flex flex-col gap-4 group featured-product-card p-6 rounded-xl transition-all duration-300">
              <div class="relative w-full aspect-square bg-cover rounded-lg overflow-hidden" :style="{ backgroundImage: product.image ? `url('${product.image}')` : 'none' }">
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                  <button class="bg-white/20 backdrop-blur-sm text-white rounded-full p-3 hover:bg-primary-orange transition-colors" @click="viewFeaturedProduct(product)"><span class="material-symbols-outlined">visibility</span></button>
                  <button class="bg-white/20 backdrop-blur-sm text-white rounded-full p-3 hover:bg-primary-orange transition-colors" @click="addFeaturedToCart(product)"><span class="material-symbols-outlined">add_shopping_cart</span></button>
                </div>
                <span v-if="product.badge" class="absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded" :class="product.badge.class">{{ product.badge.text }}</span>
                <button class="absolute top-2 right-2 text-white bg-black/30 rounded-full p-2 hover:text-primary-orange transition-colors" @click="addFeaturedToWishlist(product)"><span class="material-symbols-outlined">favorite_border</span></button>
              </div>
              <div>
                <div class="flex justify-between items-center">
                  <p class="text-white text-xl font-bold line-clamp-2">{{ product.name }}</p>
                  <div class="flex items-center text-accent-green">
                    <span class="material-symbols-outlined text-lg">star</span>
                    <span class="ml-1 text-white">{{ product.rating.toFixed(1) }}</span>
                  </div>
                </div>
                <p class="text-text-dark text-base mt-2 line-clamp-2">{{ product.description }}</p>
                <div class="flex items-baseline gap-2 mt-2">
                  <p class="text-primary-orange text-xl font-bold">${{ product.price }}</p>
                  <p v-if="product.isOnSale && product.originalPrice" class="text-text-dark text-lg line-through">${{ product.originalPrice }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Featured Products Section -->
        <section class="px-4 sm:px-20 py-16 bg-slate-800/10">
          <h2 class="text-white text-4xl font-bold leading-tight tracking-tighter px-4 pb-8 text-center" style='font-family: "Orbitron", sans-serif;'>Shop by Category</h2>

          <!-- Loading State -->
          <div v-if="categoriesLoading" class="text-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p class="text-gray-300 text-lg">Loading featured products...</p>
            </div>

          <!-- Error State -->
          <div v-else-if="categoriesError" class="text-center py-12">
            <div class="text-red-500 text-4xl mb-4">⚠️</div>
            <p class="text-gray-300 text-lg mb-2">Failed to load products</p>
            <p class="text-gray-400 text-sm">{{ categoriesError }}</p>
            <button @click="loadCategories" class="mt-4 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">Retry</button>
            </div>

          <!-- Products Grid -->
          <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div v-for="category in dynamicCategories" :key="category.name" class="group cursor-pointer" @click="goToCategory(category)">
              <div class="relative overflow-hidden rounded-xl aspect-square bg-slate-800/50 backdrop-blur-sm">
                <img :src="category.image || '/placeholder-image.jpg'" :alt="category.name" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" decoding="async" fetchpriority="low">
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                <div class="absolute inset-0 bg-gradient-to-br transition-all duration-300" :class="[category.gradient, `group-hover:${category.hoverGradient}`]"></div>
                <div class="absolute bottom-4 left-4 right-4 text-white">
                  <div class="mb-2">
                    <span class="inline-block px-2 py-1 bg-orange-500/80 text-xs font-semibold rounded uppercase">{{ category.category }}</span>
                  </div>
                  <h3 class="text-lg font-bold mb-2 line-clamp-2">{{ category.name }}</h3>
                  <p class="text-sm opacity-90">{{ category.description }}</p>
                  <p v-if="category.price" class="text-orange-400 font-bold mt-2">${{ category.price }}</p>
                </div>
                <div class="absolute top-4 right-4">
                  <span class="material-symbols-outlined text-3xl text-white/80">{{ category.icon }}</span>
                </div>
                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div class="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full text-white font-semibold">
                    View Product
              </div>
            </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Men Products Section (replacing Adidas block) -->
        <section class="py-20 px-4 sm:px-20 bg-slate-800/25">
          <div class="container mx-auto">
            <div class="mb-10">
              <h2 class="text-white text-4xl font-bold tracking-tighter" style='font-family: "Orbitron", sans-serif;'>
                Men <span class="text-orange-400">Products</span>
              </h2>
            </div>

            <!-- States -->
            <div v-if="menLoading" class="text-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p class="text-gray-300 text-lg">Loading men products...</p>
            </div>
            <div v-else-if="menError" class="text-center py-12">
              <div class="text-red-500 text-4xl mb-4">⚠️</div>
              <p class="text-gray-300 text-lg mb-2">Failed to load products</p>
              <p class="text-gray-400 text-sm">{{ menError }}</p>
              <button @click="loadMenProducts" class="mt-4 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">Retry</button>
            </div>

            <!-- Scroller -->
            <div v-else class="relative">
              <!-- Fixed arrows at far edges -->
              <button class="men-edge-arrow left" @click="scrollMen('left')"><span class="material-symbols-outlined">chevron_left</span></button>
              <button class="men-edge-arrow right" @click="scrollMen('right')"><span class="material-symbols-outlined">chevron_right</span></button>
              <div ref="menScroller" class="men-scroller overflow-x-auto snap-x snap-mandatory flex gap-6 pb-4 scrollbar-hide">
                <div v-for="product in menProducts" :key="product.id" class="men-card flex-shrink-0 snap-start cursor-pointer" @click="viewMenProduct(product)">
                  <div class="men-card-image relative rounded-xl overflow-hidden">
                    <div class="absolute inset-0 bg-cover bg-center transition-all duration-500" :style="{ backgroundImage: `url('${currentProductImage(product)}')` }"></div>
                    <button class="carousel-nav left" @click.stop="onMenUserInteract(); prevImage(product)"><span class="material-symbols-outlined">chevron_left</span></button>
                    <button class="carousel-nav right" @click.stop="onMenUserInteract(); nextImage(product)"><span class="material-symbols-outlined">chevron_right</span></button>
                    <div class="carousel-dots">
                      <span v-for="(img, idx) in getProductImages(product)" :key="idx" :class="['dot', getCurrentIndex(product) === idx ? 'active' : '']"></span>
                    </div>
                  </div>
                  <div class="p-4">
                    <div class="flex items-start justify-between gap-3">
                      <h3 class="text-white text-lg font-semibold leading-snug line-clamp-2">{{ product.name }}</h3>
                      <p class="text-orange-400 text-lg font-bold shrink-0">${{ product.price }}</p>
                    </div>
                    <p class="text-text-dark text-sm mt-2 line-clamp-2">{{ product.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Trusted Brands Section -->
        <section class="py-20 px-4 sm:px-20 bg-slate-800/25">
          <div class="container mx-auto">
            <div class="text-center mb-16">
              <h2 class="text-white text-4xl font-bold tracking-tighter mb-6" style='font-family: "Orbitron", sans-serif;'>
                Trusted <span class="text-orange-400">Brands</span>
              </h2>
              <p class="text-gray-300 text-xl max-w-2xl mx-auto">
                We partner with the world's most renowned sneaker brands to bring you authentic, high-quality footwear
              </p>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
              <!-- Nike -->
              <div class="group brand-logo">
                <div class="brand-card">
                  <div class="brand-icon nike">
                    <img src="https://logos-world.net/wp-content/uploads/2020/04/Nike-Logo.png" alt="Nike Logo" class="w-20 h-10 object-contain transition-all duration-300" loading="lazy" decoding="async">
                  </div>
                </div>
              </div>

              <!-- Adidas -->
              <div class="group brand-logo">
                <div class="brand-card">
                  <div class="brand-icon adidas">
                    <img src="https://logos-world.net/wp-content/uploads/2020/04/Adidas-Logo.png" alt="Adidas Logo" class="w-20 h-10 object-contain transition-all duration-300" loading="lazy" decoding="async">
                  </div>
                </div>
              </div>

              <!-- Jordan -->
              <div class="group brand-logo">
                <div class="brand-card">
                  <div class="brand-icon jordan">
                    <span class="text-black text-xl font-bold tracking-wider">JORDAN</span>
                  </div>
                </div>
              </div>

              <!-- Puma -->
              <div class="group brand-logo">
                <div class="brand-card">
                  <div class="brand-icon puma">
                    <img src="https://logos-world.net/wp-content/uploads/2020/04/Puma-Logo.png" alt="Puma Logo" class="w-20 h-10 object-contain transition-all duration-300" loading="lazy" decoding="async">
                  </div>
                </div>
              </div>

              <!-- New Balance -->
              <div class="group brand-logo">
                <div class="brand-card">
                  <div class="brand-icon new-balance">
                    <span class="text-black text-lg font-bold tracking-wide">NEW BALANCE</span>
                  </div>
                </div>
              </div>

              <!-- Converse -->
              <div class="group brand-logo">
                <div class="brand-card">
                  <div class="brand-icon converse">
                    <span class="text-black text-xl font-bold tracking-wider">CONVERSE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Our Story Section -->
        <section class="py-20 px-4 sm:px-20 parallax" style="background-image: url('https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3')">
          <div class="container mx-auto">
            <div class="max-w-4xl mx-auto text-center text-white">
              <h2 class="text-white text-5xl font-bold tracking-tighter mb-8" style='font-family: "Orbitron", sans-serif;'>
                Our <span class="text-orange-400">Story</span>
              </h2>
              <p class="text-gray-200 text-xl leading-relaxed">
                Born from a passion for sneaker culture, SoleMate was founded to create a space where enthusiasts could find the most sought-after releases and timeless classics. We are more than a store; we are a community celebrating the art and history of footwear.
              </p>
            </div>
          </div>
        </section>

        <!-- Women Products Section -->
        <section class="py-20 px-4 sm:px-20 bg-slate-800/25">
          <div class="container mx-auto">
            <div class="mb-10">
              <h2 class="text-white text-4xl font-bold tracking-tighter" style='font-family: "Orbitron", sans-serif;'>
                Women <span class="text-orange-400">Products</span>
              </h2>
            </div>

            <!-- States -->
            <div v-if="womenLoading" class="text-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p class="text-gray-300 text-lg">Loading women products...</p>
            </div>
            <div v-else-if="womenError" class="text-center py-12">
              <div class="text-red-500 text-4xl mb-4">⚠️</div>
              <p class="text-gray-300 text-lg mb-2">Failed to load products</p>
              <p class="text-gray-400 text-sm">{{ womenError }}</p>
              <button @click="loadWomenProducts" class="mt-4 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">Retry</button>
            </div>

            <!-- Scroller -->
            <div v-else class="relative">
              <!-- Fixed arrows at far edges -->
              <button class="women-edge-arrow left" @click="scrollWomen('left')"><span class="material-symbols-outlined">chevron_left</span></button>
              <button class="women-edge-arrow right" @click="scrollWomen('right')"><span class="material-symbols-outlined">chevron_right</span></button>
              <div ref="womenScroller" class="women-scroller overflow-x-auto snap-x snap-mandatory flex gap-6 pb-4 scrollbar-hide">
                <div v-for="product in womenProducts" :key="product.id" class="women-card flex-shrink-0 snap-start cursor-pointer" @click="viewWomenProduct(product)">
                  <div class="women-card-image relative rounded-xl overflow-hidden">
                    <div class="absolute inset-0 bg-cover bg-center transition-all duration-500" :style="{ backgroundImage: `url('${currentWomenProductImage(product)}')` }"></div>
                    <button class="carousel-nav left" @click.stop="onWomenUserInteract(); prevWomenImage(product)"><span class="material-symbols-outlined">chevron_left</span></button>
                    <button class="carousel-nav right" @click.stop="onWomenUserInteract(); nextWomenImage(product)"><span class="material-symbols-outlined">chevron_right</span></button>
                    <div class="carousel-dots">
                      <span v-for="(img, idx) in getWomenProductImages(product)" :key="idx" :class="['dot', getWomenCurrentIndex(product) === idx ? 'active' : '']"></span>
                    </div>
                  </div>
                  <div class="p-4">
                    <div class="flex items-start justify-between gap-3">
                      <h3 class="text-white text-lg font-semibold leading-snug line-clamp-2">{{ product.name }}</h3>
                      <p class="text-orange-400 text-lg font-bold shrink-0">${{ product.price }}</p>
                    </div>
                    <p class="text-text-dark text-sm mt-2 line-clamp-2">{{ product.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Kids Products Section -->
        <section class="py-20 px-4 sm:px-20 bg-slate-800/25">
          <div class="container mx-auto">
            <div class="mb-10">
              <h2 class="text-white text-4xl font-bold tracking-tighter" style='font-family: "Orbitron", sans-serif;'>
                Kids <span class="text-orange-400">Products</span>
              </h2>
            </div>

            <!-- States -->
            <div v-if="kidsLoading" class="text-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p class="text-gray-300 text-lg">Loading kids products...</p>
            </div>
            <div v-else-if="kidsError" class="text-center py-12">
              <div class="text-red-500 text-4xl mb-4">⚠️</div>
              <p class="text-gray-300 text-lg mb-2">Failed to load products</p>
              <p class="text-gray-400 text-sm">{{ kidsError }}</p>
              <button @click="loadKidsProducts" class="mt-4 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">Retry</button>
            </div>

            <!-- Scroller -->
            <div v-else class="relative">
              <!-- Fixed arrows at far edges -->
              <button class="kids-edge-arrow left" @click="scrollKids('left')"><span class="material-symbols-outlined">chevron_left</span></button>
              <button class="kids-edge-arrow right" @click="scrollKids('right')"><span class="material-symbols-outlined">chevron_right</span></button>
              <div ref="kidsScroller" class="kids-scroller overflow-x-auto snap-x snap-mandatory flex gap-6 pb-4 scrollbar-hide">
                <div v-for="product in kidsProducts" :key="product.id" class="kids-card flex-shrink-0 snap-start cursor-pointer" @click="viewKidsProduct(product)">
                  <div class="kids-card-image relative rounded-xl overflow-hidden">
                    <div class="absolute inset-0 bg-cover bg-center transition-all duration-500" :style="{ backgroundImage: `url('${currentKidsProductImage(product)}')` }"></div>
                    <button class="carousel-nav left" @click.stop="onKidsUserInteract(); prevKidsImage(product)"><span class="material-symbols-outlined">chevron_left</span></button>
                    <button class="carousel-nav right" @click.stop="onKidsUserInteract(); nextKidsImage(product)"><span class="material-symbols-outlined">chevron_right</span></button>
                    <div class="carousel-dots">
                      <span v-for="(img, idx) in getKidsProductImages(product)" :key="idx" :class="['dot', getKidsCurrentIndex(product) === idx ? 'active' : '']"></span>
                    </div>
                  </div>
                  <div class="p-4">
                    <div class="flex items-start justify-between gap-3">
                      <h3 class="text-white text-lg font-semibold leading-snug line-clamp-2">{{ product.name }}</h3>
                      <p class="text-orange-400 text-lg font-bold shrink-0">${{ product.price }}</p>
                    </div>
                    <p class="text-text-dark text-sm mt-2 line-clamp-2">{{ product.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Customer Testimonials Section -->
        <section class="py-20 px-4 sm:px-20 bg-slate-800/30">
          <div class="container mx-auto">
            <div class="text-center mb-16">
              <h2 class="text-white text-5xl font-bold tracking-tighter mb-6" style='font-family: "Orbitron", sans-serif;'>
                What Our <span class="text-orange-400">Customers</span> Say
              </h2>
              <p class="text-gray-300 text-xl max-w-2xl mx-auto">
                Join thousands of satisfied customers who trust SoleMate for their sneaker needs
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <!-- Testimonial 1 -->
              <div class="group bg-black/20 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:border-orange-400/50 transition-all duration-300 hover:transform hover:scale-105">
                <div class="flex items-center gap-4 mb-6">
                  <div class="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                    A
                  </div>
                  <div>
                    <h4 class="text-white font-semibold">Ahmed Hassan</h4>
                    <div class="flex text-orange-400">
                      <span class="material-symbols-outlined text-sm">star</span>
                      <span class="material-symbols-outlined text-sm">star</span>
                      <span class="material-symbols-outlined text-sm">star</span>
                      <span class="material-symbols-outlined text-sm">star</span>
                      <span class="material-symbols-outlined text-sm">star</span>
                    </div>
                  </div>
                </div>
                <p class="text-gray-300 leading-relaxed">
                  "Amazing quality and fast shipping! The sneakers I ordered exceeded my expectations. SoleMate is now my go-to store for all sneaker needs."
                </p>
              </div>

              <!-- Testimonial 2 -->
              <div class="group bg-black/20 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:border-orange-400/50 transition-all duration-300 hover:transform hover:scale-105">
                <div class="flex items-center gap-4 mb-6">
                  <div class="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                    S
                  </div>
                  <div>
                    <h4 class="text-white font-semibold">Sarah Johnson</h4>
                    <div class="flex text-orange-400">
                      <span class="material-symbols-outlined text-sm">star</span>
                      <span class="material-symbols-outlined text-sm">star</span>
                      <span class="material-symbols-outlined text-sm">star</span>
                      <span class="material-symbols-outlined text-sm">star</span>
                      <span class="material-symbols-outlined text-sm">star</span>
                    </div>
                  </div>
                </div>
                <p class="text-gray-300 leading-relaxed">
                  "Perfect fit and incredible comfort! The customer service team was so helpful in finding the right size. Highly recommended!"
                </p>
              </div>

              <!-- Testimonial 3 -->
              <div class="group bg-black/20 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:border-orange-400/50 transition-all duration-300 hover:transform hover:scale-105">
                <div class="flex items-center gap-4 mb-6">
                  <div class="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                    M
                  </div>
                  <div>
                    <h4 class="text-white font-semibold">Mohamed Ali</h4>
                    <div class="flex text-orange-400">
                      <span class="material-symbols-outlined text-sm">star</span>
                      <span class="material-symbols-outlined text-sm">star</span>
                      <span class="material-symbols-outlined text-sm">star</span>
                      <span class="material-symbols-outlined text-sm">star</span>
                      <span class="material-symbols-outlined text-sm">star</span>
                    </div>
                  </div>
                </div>
                <p class="text-gray-300 leading-relaxed">
                  "Authentic products and competitive prices. The website is easy to navigate and the checkout process was smooth. Will definitely order again!"
                </p>
              </div>
            </div>
          </div>
        </section>

    </main>

    <!-- Footer -->
      <footer class="bg-slate-900 border-t border-slate-700/50">
        <div class="container mx-auto px-10 py-12">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div class="flex flex-col gap-4">
              <h2 class="text-white text-2xl font-bold font-orbitron">SoleMate</h2>
              <p class="text-text-dark">Your one-stop shop for the latest and greatest in sneaker culture.</p>
            </div>
            <div class="flex flex-col gap-4">
              <h3 class="text-white text-lg font-bold">Quick Links</h3>
              <router-link to="/about" class="text-text-dark hover:text-primary-orange transition-colors">About Us</router-link>
              <router-link to="/contact" class="text-text-dark hover:text-primary-orange transition-colors">Contact</router-link>
              <router-link to="/faq" class="text-text-dark hover:text-primary-orange transition-colors">FAQ</router-link>
            </div>
            <div class="flex flex-col gap-4">
              <h3 class="text-white text-lg font-bold">Legal</h3>
              <router-link to="/privacy" class="text-text-dark hover:text-primary-orange transition-colors">Privacy Policy</router-link>
              <router-link to="/terms" class="text-text-dark hover:text-primary-orange transition-colors">Terms of Service</router-link>
            </div>
            <div class="flex flex-col gap-4">
              <h3 class="text-white text-lg font-bold">Follow Us</h3>
              <div class="flex gap-4">
                <a class="text-text-dark hover:text-primary-orange transition-colors" href="#">Facebook</a>
                <a class="text-text-dark hover:text-primary-orange transition-colors" href="#">Instagram</a>
                <a class="text-text-dark hover:text-primary-orange transition-colors" href="#">Twitter</a>
              </div>
            </div>
          </div>
          <div class="border-t border-gray-700/50 mt-8 pt-8 text-center text-gray-500">
            <p>@2024 SoleMate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>

    <!-- Scroll Progress -->
    <div id="scroll-progress">
      <span class="material-symbols-outlined text-white text-2xl" id="progress-value">navigation</span>
    </div>

    <!-- Chat Button -->
    <button class="fixed bottom-6 right-24 z-50 bg-[var(--primary-orange)] text-white rounded-full p-4 shadow-lg hover:bg-orange-600 transition-colors">
      <span class="material-symbols-outlined">chat</span>
    </button>

    <!-- Review Popup -->
    <div class="fixed bottom-6 left-6 z-50 bg-slate-800/90 backdrop-blur-sm p-4 rounded-xl shadow-lg text-white flex items-center gap-3 transition-transform duration-500 translate-y-[200%]" id="review-popup">
      <div class="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center">
        <span class="material-symbols-outlined text-white">person</span>
      </div>
      <div>
        <p class="font-bold">Alex J. just bought a Retro Runner!</p>
        <p class="text-sm text-[var(--text-dark)]">15 seconds ago</p>
      </div>
    </div>

    <!-- Mobile Shop Button -->
    <div class="fixed bottom-0 left-0 right-0 md:hidden bg-slate-900/90 p-3 shadow-[0_-5px_15px_rgba(0,0,0,0.5)] z-40">
      <router-link to="/products" class="w-full flex items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-[var(--primary-orange)] text-white text-lg font-bold">
        <span class="truncate">Shop Now</span>
      </router-link>
    </div>

    <!-- Search Modal -->
    <SearchModal v-model="showSearchModal" @close="showSearchModal = false" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useNotifications } from '@/composables/useNotifications'
import { initializeHome, useHomeImages } from "@/composables/Home.js";
import ProfileDropdown from '@/components/ProfileDropdown.vue'
import SearchModal from '@/components/search/SearchModal.vue'
import { useOptimizedProducts } from '@/composables/useOptimizedApi.js'
import { useLoadingState } from '@/utils/loadingStates.js'
import { useMenProducts } from '@/composables/useMenProducts.js'
import { performanceMonitor } from '@/utils/performanceMonitor.js'
import { useWomenProducts } from '@/composables/useWomenProducts.js'
import { useKidsProducts } from '@/composables/useKidsProducts.js'
import { useAdidasProducts } from '@/composables/useAdidasProducts.js'
import { useHeroSection } from '@/composables/useHeroSection.js'
import { useFeaturedProducts } from '@/composables/useFeaturedProducts.js'
import { useNavigation } from '@/composables/useNavigation.js'
import { useCategories } from '@/composables/useCategories.js'
// ✅ Enhanced Performance Composable
import { useHomeEnhanced } from '@/composables/useHomeEnhanced.js'
import OptimizedImage from '@/components/common/OptimizedImage.vue'
// Test carousel functionality
import '@/utils/carouselTest.js'

// Use images composable
const {
  heroImage,
  featuredImages,
  categoryImages,
  instagramImages,
  imagesLoading,
  imagesError,
  loadImagesFromAPI,
  refreshImages,
  getAllImagesFromDB
} = useHomeImages()

// Use optimized products API
const {
  loading: optimizedLoading,
  data: optimizedProducts,
  loadProducts: optimizedLoadProducts
} = useOptimizedProducts()

// Use loading states
const { loading: homeLoading, withLoading: withHomeLoading } = useLoadingState('home_page')

const router = useRouter()
const { isAuthenticated, user, isAdmin, logout: authLogout, initializeAuthState } = useAuth()
const { success } = useNotifications()

// Use composables
const {
  menProducts,
  menLoading,
  menError,
  menCarouselIndex,
  menScroller,
  getProductImages,
  getCurrentIndex,
  currentProductImage,
  nextImage,
  prevImage,
  loadMenProducts,
  scrollMen,
  viewProduct: viewMenProduct,
  addToCart: addMenToCart,
  startMenAutoRotate,
  stopMenAutoRotate,
  onMenUserInteract
} = useMenProducts()

const {
  womenProducts,
  loading: womenLoading,
  error: womenError,
  womenCarouselIndex,
  womenScroller,
  getProductImages: getWomenProductImages,
  getCurrentIndex: getWomenCurrentIndex,
  currentProductImage: currentWomenProductImage,
  nextImage: nextWomenImage,
  prevImage: prevWomenImage,
  loadWomenProducts,
  scrollWomen,
  viewProduct: viewWomenProduct,
  addToCart: addWomenToCart,
  startWomenAutoRotate,
  stopWomenAutoRotate,
  onWomenUserInteract
} = useWomenProducts()

const {
  kidsProducts,
  loading: kidsLoading,
  error: kidsError,
  kidsCarouselIndex,
  kidsScroller,
  getProductImages: getKidsProductImages,
  getCurrentIndex: getKidsCurrentIndex,
  currentProductImage: currentKidsProductImage,
  nextImage: nextKidsImage,
  prevImage: prevKidsImage,
  loadKidsProducts,
  scrollKids,
  viewProduct: viewKidsProduct,
  addToCart: addKidsToCart,
  startKidsAutoRotate,
  stopKidsAutoRotate,
  onKidsUserInteract
} = useKidsProducts()

const {
  adidasProducts,
  adidasLoading,
  adidasError,
  loadAdidasProducts,
  viewProduct: viewAdidasProduct,
  addToCart: addAdidasToCart
} = useAdidasProducts()

const {
  heroImage: heroImageFromComposable,
  isAuthenticated: heroIsAuthenticated,
  user: heroUser,
  isAdmin: heroIsAdmin,
  welcomeMessage,
  greeting,
  userName,
  userType,
  userTypeMessage,
  lastLogin,
  orderCount,
  wishlistCount,
  welcomeLoading,
  welcomeError,
  fetchWelcomeMessage,
  displayName,
  profileButtonText,
  handleProfileClickAction
} = useHeroSection()

const {
  featuredProducts,
  loading: featuredLoading,
  error: featuredError,
  loadFeaturedProducts,
  viewProduct: viewFeaturedProduct,
  addToCart: addFeaturedToCart,
  addToWishlist: addFeaturedToWishlist
} = useFeaturedProducts()

const {
  categories: dynamicCategories,
  loading: categoriesLoading,
  error: categoriesError,
  loadCategories,
  goToCategory
} = useCategories()

const {
  isMenuOpen,
  isAuthenticated: navIsAuthenticated,
  user: navUser,
  isAdmin: navIsAdmin,
  toggleMenu,
  closeMenu,
  navigateTo
} = useNavigation()

// Search modal state
const showSearchModal = ref(false)

// ✅ Enhanced Performance Composable
const {
  initializeOptimized,
  setupLazyImages,
  prefetchProductsPage,
  sectionsLoaded
} = useHomeEnhanced()

// Profile click handler - using the one from useHeroSection composable

// Handle logout
const handleLogoutClick = () => handleLogout(authLogout, success)

onMounted(async () => {
  // ✅ Use Enhanced Initialization
  await initializeOptimized({
    // Critical content (highest priority)
    featured: async () => {
      await loadFeaturedProducts()
    },
    hero: async () => {
      await initializeHome(
        isAuthenticated,
        user,
        isAdmin,
        initializeAuthState,
        loadImagesFromAPI,
        getAllImagesFromDB
      )
      // Welcome message if authenticated
      if (isAuthenticated.value && user.value) {
        const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
        if (token) {
          await fetchWelcomeMessage().catch(() => {})
        }
      }
    },
    // Secondary content
    men: async () => {
      await loadMenProducts(featuredImages.value, categoryImages.value, instagramImages.value)
    },
    women: async () => {
      await loadWomenProducts(featuredImages.value, categoryImages.value, instagramImages.value)
    },
    kids: async () => {
      await loadKidsProducts(featuredImages.value, categoryImages.value, instagramImages.value)
    },
    // Lazy content
    adidas: async () => {
      await loadAdidasProducts()
    }
  })

  // ✅ Setup lazy loading for images
  setupLazyImages()

  // Start auto-rotate when products rendered
  startMenAutoRotate()
  startWomenAutoRotate()
  startKidsAutoRotate()

  // ✅ Prefetch products page for faster navigation
  prefetchProductsPage()

  })

onUnmounted(() => {
  // Cleanup if needed
  stopMenAutoRotate()
  stopWomenAutoRotate()
  stopKidsAutoRotate()
})
</script>

<style scoped>
@import "@/styles/views/Home.css";
@import "@/styles/components/ProductCarousel.css";
</style>
