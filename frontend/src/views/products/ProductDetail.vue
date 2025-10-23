<template>
  <div class="product-detail-container" :key="route.params.id">
    <!-- Optimized Loading State -->
    <OptimizedLoading
      v-if="loading || productLoading"
      type="skeleton"
      :count="1"
      skeleton-class="product"
      :message="loading ? 'Loading product...' : 'Loading product details...'"
      :fullscreen="true"
    />

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <div class="error-message">{{ error }}</div>
      <div class="error-actions">
        <button @click="loadProduct" class="retry-button">Try Again</button>
        <router-link to="/" class="home-button">Go Home</router-link>
      </div>
    </div>

    <!-- Product Details -->
    <div v-else-if="product">
      <!-- Header -->
      <header class="product-header">
      <div class="header-left">
        <!-- Mobile Menu Button -->
        <button
          class="mobile-menu-button"
          :class="{ active: isMobileMenuOpen }"
          @click="toggleMobileMenu"
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <router-link to="/" class="logo-section">
          <div class="logo-icon">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
            </svg>
          </div>
          <h2 class="logo-text">SoleMate</h2>
        </router-link>

        <!-- Mobile Menu Overlay -->
        <div
          class="mobile-menu-overlay"
          :class="{ active: isMobileMenuOpen }"
          @click="closeMobileMenu"
        ></div>

        <div class="nav-links" :class="{ active: isMobileMenuOpen }">
          <!-- User Section -->
          <div class="mobile-menu-section">
            <div class="mobile-menu-user">
              <span class="material-symbols-outlined">account_circle</span>
              <span>My Account</span>
            </div>
          </div>

          <!-- Shopping Section -->
          <div class="mobile-menu-section">
            <div class="mobile-menu-section-title">Shopping</div>
            <router-link to="/products?new=true" class="nav-link" @click="closeMobileMenu">
              <span class="material-symbols-outlined">new_releases</span>
              <span>New Arrivals</span>
            </router-link>
            <router-link to="/products?category=men" class="nav-link" @click="closeMobileMenu">
              <span class="material-symbols-outlined">man</span>
              <span>Men</span>
            </router-link>
            <router-link to="/products?category=women" class="nav-link" @click="closeMobileMenu">
              <span class="material-symbols-outlined">woman</span>
              <span>Women</span>
            </router-link>
            <router-link to="/products?category=kids" class="nav-link" @click="closeMobileMenu">
              <span class="material-symbols-outlined">child_care</span>
              <span>Kids</span>
            </router-link>
          </div>

          <!-- My Account Section -->
          <div class="mobile-menu-section">
            <div class="mobile-menu-section-title">My Account</div>
            <router-link to="/wishlist" class="nav-link" @click="closeMobileMenu">
              <span class="material-symbols-outlined">favorite</span>
              <span>Wishlist</span>
              <span v-if="wishlistCount > 0" class="mobile-menu-badge">{{ wishlistCount }}</span>
            </router-link>
            <router-link to="/cart" class="nav-link" @click="closeMobileMenu">
              <span class="material-symbols-outlined">shopping_bag</span>
              <span>Cart</span>
              <span v-if="cartCount > 0" class="mobile-menu-badge">{{ cartCount }}</span>
            </router-link>
            <router-link to="/profile" class="nav-link" @click="closeMobileMenu">
              <span class="material-symbols-outlined">person</span>
              <span>Profile</span>
            </router-link>
            <router-link to="/orders" class="nav-link" @click="closeMobileMenu">
              <span class="material-symbols-outlined">receipt_long</span>
              <span>Orders</span>
            </router-link>
          </div>

          <!-- More Section -->
          <div class="mobile-menu-section">
            <div class="mobile-menu-section-title">More</div>
            <router-link to="/about" class="nav-link" @click="closeMobileMenu">
              <span class="material-symbols-outlined">info</span>
              <span>About</span>
            </router-link>
            <router-link to="/contact" class="nav-link" @click="closeMobileMenu">
              <span class="material-symbols-outlined">mail</span>
              <span>Contact</span>
            </router-link>
          </div>
        </div>
      </div>
      <!-- Desktop Navigation Tabs -->
      <div class="desktop-nav-tabs">
        <nav class="nav-tabs-container">
          <router-link
            to="/products?category=women"
            class="nav-tab"
            :class="{ active: currentCategory === 'women' }"
          >
            Women
          </router-link>
          <router-link
            to="/products?category=men"
            class="nav-tab"
            :class="{ active: currentCategory === 'men' }"
          >
            Men
          </router-link>
          <router-link
            to="/products?category=kids"
            class="nav-tab"
            :class="{ active: currentCategory === 'kids' }"
          >
            Kids
          </router-link>
        </nav>
      </div>

      <div class="header-right">
          <div class="search-container-wrapper">
            <SearchBar /></div>
          <div class="action-buttons">
            <router-link
              to="/wishlist"
              class="action-button"
              :title="'View Wishlist'"
            >
            <span class="material-symbols-outlined">favorite_border</span>
            <span
              v-if="wishlistCount > 0"
              class="cart-badge wishlist-badge"
            >{{ wishlistCount > 99 ? '99+' : wishlistCount }}</span>
            </router-link>
          <button
              @click="openCart"
              class="action-button"
              title="View Cart"
            aria-label="View shopping cart"
            :aria-describedby="cartCount > 0 ? 'cart-count' : null"
          >
            <span class="material-symbols-outlined" aria-hidden="true">shopping_bag</span>
            <span
              v-if="cartCount > 0"
              class="cart-badge"
              :id="cartCount > 0 ? 'cart-count' : null"
              :aria-label="`${cartCount} items in cart`"
            >{{ cartCount > 99 ? '99+' : cartCount }}</span>
          </button>
          </div>
          <ProfileDropdown />
        </div>
      </header>

    <!-- Main Content -->
    <div class="product-content">
      <div class="product-grid">
        <!-- Product Media Grid 2x2 -->
        <div class="product-media-grid">
          <!-- Main product image (top-left) -->
          <div class="media-item" @click="openZoomModal(mainProductImage, 0)">
            <img
              :src="mainProductImage"
              :alt="product?.name || 'Product'"
              loading="eager"
              fetchpriority="high"
              decoding="sync"
            />
            <div class="media-overlay">
              <span class="material-symbols-outlined">zoom_in</span>
            </div>
          </div>

          <!-- Additional image 1 (top-right) -->
          <div
            v-if="productImages.length > 1"
            class="media-item"
            @click="openZoomModal(productImages[1], 1)"
          >
            <img
              :src="productImages[1]"
              :alt="`Product image 2`"
              loading="lazy"
            />
            <div class="media-overlay">
              <span class="material-symbols-outlined">zoom_in</span>
            </div>
          </div>

          <!-- Placeholder if no additional image -->
          <div v-else class="media-item placeholder-item">
            <div class="placeholder-content">
              <span class="material-symbols-outlined">image</span>
              <p>No Image</p>
            </div>
          </div>

          <!-- Additional image 2 (bottom-left) -->
          <div
            v-if="productImages.length > 2"
            class="media-item"
            @click="openZoomModal(productImages[2], 2)"
          >
            <!-- Always show as image for now -->
            <img
              :src="productImages[2]"
              :alt="`Product image 3`"
              loading="lazy"
            />
            <div class="media-overlay">
              <span class="material-symbols-outlined">zoom_in</span>
            </div>
          </div>

          <!-- Placeholder if no additional image 2 -->
          <div v-else class="media-item placeholder-item">
            <div class="placeholder-content">
              <span class="material-symbols-outlined">image</span>
              <p>No 3rd Image ({{ productImages.length }} total)</p>
            </div>
          </div>

          <!-- Dynamic 4th card - Video or Image (bottom-right) -->
          <div class="media-item">
            <!-- Debug info -->
            <div v-if="false" style="position: absolute; top: 0; left: 0; background: red; color: white; padding: 2px; font-size: 10px; z-index: 999;">
              hasVideos: {{ hasVideos }} | images: {{ productImages.length }} | 4th: {{ productImages[3] || 'none' }}
            </div>

            <!-- Show video if available -->
            <video
              v-if="hasVideos && !videoLoadError && currentVideoSource"
              :key="selectedColor?.id || 'default'"
              :src="currentVideoSource"
              autoplay
              loop
              muted
              playsinline
              preload="auto"
              class="grid-video"
              @loadedmetadata="setVideoThumbnail($event, 0)"
              @error="handleVideoError"
            ></video>

            <!-- Fallback to image if video fails to load -->
            <div
              v-else-if="hasVideos && videoLoadError && productImages.length >= 4"
              @click="openZoomModal(productImages[3], 3)"
            >
              <img
                :src="productImages[3]"
                :alt="`Product image 4`"
                loading="lazy"
              />
              <div class="media-overlay">
                <span class="material-symbols-outlined">zoom_in</span>
              </div>
            </div>

            <!-- Show 4th item (could be image or video) if available -->
            <div
              v-else-if="productImages.length >= 4 && productImages[3]"
              @click="openZoomModal(productImages[3], 3)"
            >
              <!-- If it's a video, show it as image with play icon -->
              <img
                v-if="!isVideoUrl(productImages[3])"
                :src="productImages[3]"
                :alt="`Product image 4`"
                loading="lazy"
              />
              <!-- If it's a video, show video element -->
              <video
                v-else
                :src="productImages[3]"
                autoplay
                loop
                muted
                playsinline
                preload="auto"
                class="grid-video"
                @error="handleVideoError"
              ></video>
              <div class="media-overlay">
                <span class="material-symbols-outlined">zoom_in</span>
              </div>
            </div>

            <!-- Show main image again if no video and only 3 images total -->
            <div
              v-else-if="productImages.length === 3"
              @click="openZoomModal(productImages[0], 0)"
            >
              <img
                :src="productImages[0]"
                :alt="`Product main image`"
              />
              <div class="media-overlay">
                <span class="material-symbols-outlined">zoom_in</span>
              </div>
            </div>

            <!-- Placeholder if no video and no additional images -->
            <div v-else class="placeholder-content">
              <span class="material-symbols-outlined">image</span>
              <p>No Media</p>
            </div>
          </div>
        </div>

        <!-- Product Info -->
        <div class="product-info">
          <h1 class="product-title">{{ product.name }}</h1>
          <p class="product-price">${{ product.price }}</p>
          <p class="product-description">{{ product.description }}</p>

          <!-- Product Options -->
          <div class="product-options">
            <!-- Size Selection -->
            <div class="option-group">
              <label class="option-label">Select Size</label>
              <div class="option-buttons">
                <button
                  v-for="size in productSizes"
                  :key="size.id"
                  class="option-button"
                  :class="{
                    selected: localSelectedSize === size.size,
                    'out-of-stock': !size.is_available || size.stock_quantity === 0
                  }"
                  @click="() => handleSelectSize(size.size)"
                  :disabled="!size.is_available || size.stock_quantity === 0"
                >
                  {{ size.size }}
                  <span v-if="size.stock_quantity > 0" class="stock-indicator">
                    ({{ size.stock_quantity }})
                  </span>
                  <span v-else class="out-of-stock-text">Out of Stock</span>
                </button>
              </div>
            </div>

            <!-- Color Selection -->
            <div class="option-group" v-if="availableColors && availableColors.length > 0">
              <label class="option-label">Select Color</label>
              <div class="option-buttons">
                <button
                  v-for="color in availableColors"
                  :key="color.id"
                  class="option-button"
                  :class="{ selected: localSelectedColor?.id === color.id }"
                  :style="{ backgroundColor: color.color_code }"
                  @click="() => handleSelectColor(color)"
                  :title="color.color_name || color.color"
                >
                  {{ color.color_name || color.color }}
                </button>
              </div>
            </div>
          </div>

          <!-- Quantity Selection -->
          <div class="quantity-selector">
            <label class="quantity-label">Quantity</label>
            <div class="quantity-controls">
              <button
                @click="decreaseQuantity"
                class="quantity-button"
                :disabled="quantity <= 1"
                title="Decrease quantity"
              >
                <span class="material-symbols-outlined">remove</span>
              </button>
              <input
                v-model.number="quantity"
                type="number"
                min="1"
                max="10"
                class="quantity-input"
                @input="handleQuantityInput"
                @change="handleQuantityChange"
              />
              <button
                @click="increaseQuantity"
                class="quantity-button"
                :disabled="quantity >= 10"
                title="Increase quantity"
              >
                <span class="material-symbols-outlined">add</span>
              </button>
            </div>
            <div class="quantity-info">
              <span class="quantity-hint">Max: 10 items</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="product-actions">
            <button
              @click.stop="addToCart"
              :disabled="isAddingToCart"
              class="add-to-cart-button"
            >
              <span v-if="isAddingToCart" class="loading-spinner"></span>
              <span v-else class="material-symbols-outlined">shopping_bag</span>
              {{ isAddingToCart ? 'Adding...' : 'Add to Cart' }}
            </button>
            <button
              @click.stop="toggleWishlist"
              :disabled="!localSelectedColor"
              class="buy-now-button"
              :class="{ 'disabled': !localSelectedColor }"
            >
              <span class="material-symbols-outlined">
                {{ isInWishlist ? 'favorite' : 'favorite_border' }}
              </span>
              {{ !localSelectedColor ? 'Select Color First' : (isInWishlist ? 'In Wishlist ✓' : 'Add to Wishlist') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Details Section -->
    <section class="product-info-section">
      <div class="container">
        <h2 class="section-title">Product Details</h2>
        <p class="section-description">
          {{ product.description || 'No product description available.' }}
        </p>
    </div>
    </section>

    <!-- Customer Reviews Section -->
    <section class="reviews-section">
      <div class="container">
        <h2 class="section-title">Customer Reviews</h2>

        <!-- Loading State for Reviews -->
        <div v-if="reviewsLoading" class="reviews-loading">
          <div class="loading-spinner"></div>
          <p>Loading reviews...</p>
        </div>

        <!-- Reviews Content -->
        <div v-else-if="productReviews && productReviews.length > 0" class="reviews-content">
          <div class="rating-summary">
            <p class="rating-score">{{ reviewsStats?.average_rating || 0 }}</p>
            <div class="stars">
              <span v-for="i in 5" :key="i" class="material-symbols-outlined">
                {{ i <= (reviewsStats?.average_rating || 0) ? 'star' : 'star_border' }}
              </span>
            </div>
            <p class="rating-text">Based on {{ reviewsStats?.total_reviews || 0 }} reviews</p>
          </div>

          <!-- Rating Breakdown -->
          <div v-if="reviewsStats?.rating_distribution" class="rating-breakdown">
            <div class="rating-bar">
              <span class="rating-number">5</span>
              <div class="bar-container">
                <div class="bar-fill" :style="`width: ${getRatingPercentage(5, reviewsStats)}%`"></div>
              </div>
              <span class="rating-percentage">{{ getRatingPercentage(5, reviewsStats) }}%</span>
            </div>
            <div class="rating-bar">
              <span class="rating-number">4</span>
              <div class="bar-container">
                <div class="bar-fill" :style="`width: ${getRatingPercentage(4, reviewsStats)}%`"></div>
              </div>
              <span class="rating-percentage">{{ getRatingPercentage(4, reviewsStats) }}%</span>
            </div>
            <div class="rating-bar">
              <span class="rating-number">3</span>
              <div class="bar-container">
                <div class="bar-fill" :style="`width: ${getRatingPercentage(3, reviewsStats)}%`"></div>
              </div>
              <span class="rating-percentage">{{ getRatingPercentage(3, reviewsStats) }}%</span>
            </div>
            <div class="rating-bar">
              <span class="rating-number">2</span>
              <div class="bar-container">
                <div class="bar-fill" :style="`width: ${getRatingPercentage(2, reviewsStats)}%`"></div>
              </div>
              <span class="rating-percentage">{{ getRatingPercentage(2, reviewsStats) }}%</span>
            </div>
            <div class="rating-bar">
              <span class="rating-number">1</span>
              <div class="bar-container">
                <div class="bar-fill" :style="`width: ${getRatingPercentage(1, reviewsStats)}%`"></div>
              </div>
              <span class="rating-percentage">{{ getRatingPercentage(1, reviewsStats) }}%</span>
            </div>
          </div>
        </div>

        <!-- Individual Reviews -->
        <div class="individual-reviews" v-if="productReviews && productReviews.length > 0">
          <div
            v-for="review in productReviews"
            :key="review.id"
            class="review-item"
            :class="{ 'featured-review': review.is_featured }"
          >
            <div class="review-header">
              <div class="reviewer-avatar">
                {{ review.customer_name?.charAt(0) || 'A' }}
              </div>
              <div class="reviewer-info">
                <p class="reviewer-name">{{ review.customer_name || 'Anonymous' }}</p>
                <p class="review-date">{{ formatDate(review.created_at) }}</p>
                <p v-if="review.customer_location" class="reviewer-location">{{ review.customer_location }}</p>
              </div>
              <div v-if="review.is_verified_purchase" class="verified-badge">
                <span class="material-symbols-outlined">verified</span>
                Verified Purchase
              </div>
            </div>
            <div class="review-stars">
              <span v-for="i in 5" :key="i" class="material-symbols-outlined">
                {{ i <= review.rating ? 'star' : 'star_border' }}
              </span>
            </div>
            <p class="review-text">{{ review.review_text }}</p>
            <div class="review-actions">
              <button class="review-action">
                <span class="material-symbols-outlined">thumb_up</span> Helpful
              </button>
              <button class="review-action">
                <span class="material-symbols-outlined">reply</span> Reply
              </button>
            </div>
          </div>
        </div>

        <div v-else class="no-reviews">
          <p>No reviews available for this product yet.</p>
          <button @click="() => loadProductReviewsLocal(product?.id)" class="load-reviews-btn">Load Reviews</button>
        </div>
      </div>
    </section>

    <!-- Related Products Section -->
    <section class="related-products-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">You May Also Like</h2>
          <p class="section-subtitle">Handpicked products based on your interests and preferences</p>
        </div>

        <!-- Loading State -->
        <div v-if="!relatedProducts || relatedProducts.length === 0" class="no-products-message">
          <p>Loading recommended products...</p>
        </div>

        <!-- Products Carousel -->
        <div v-else class="products-carousel">
          <button
            class="carousel-nav carousel-nav-left"
            @click="scrollLeft('recommended')"
            :disabled="recommendedScrollPosition <= 0"
          >
            <span class="material-symbols-outlined">chevron_left</span>
          </button>

          <div
            class="products-scroll-container"
            ref="recommendedScrollContainer"
            @scroll="updateScrollPosition('recommended', $event.target)"
          >
            <div class="products-scroll-wrapper">
          <div
            v-for="relatedProduct in relatedProducts"
            :key="relatedProduct.id"
            class="product-card"
            tabindex="0"
            role="button"
            :aria-label="`View ${relatedProduct.name} product details`"
          >
            <div
              class="product-image-container"
              @click="viewProduct(relatedProduct.id)"
              style="cursor: pointer;"
            >
              <div class="product-image-placeholder">
                <img
                  :src="getProductImage(relatedProduct)"
                  :alt="relatedProduct.name"
                  class="product-image"
                  loading="lazy"
                  decoding="async"
                  fetchpriority="low"
                  @error="handleImageError"
                />
                <div class="image-overlay">
                  <span class="material-symbols-outlined">visibility</span>
                </div>
              </div>

              <!-- Product Badges -->
              <div class="product-badges">
                <span v-if="relatedProduct.is_new" class="badge badge-new">New</span>
                <span v-if="relatedProduct.is_sale" class="badge badge-sale">Sale</span>
                <span v-if="relatedProduct.is_featured" class="badge badge-featured">Featured</span>
              </div>

              <!-- Quick Actions -->
              <div class="quick-actions">
                <button
                  @click.stop="addToWishlistQuick(relatedProduct.id)"
                  class="quick-action-btn"
                  :title="'Add to Wishlist'"
                  aria-label="Toggle wishlist"
                >
                  <span class="material-symbols-outlined">
                    favorite_border
                  </span>
                </button>
              </div>
            </div>

            <div class="product-info">
              <div class="product-brand">{{ relatedProduct.brand || 'ADIDAS' }}</div>
              <h3 class="product-name">{{ relatedProduct.name || 'Sample Product Name' }}</h3>
              <div class="product-rating">
                <div class="stars">
                  <span v-for="i in 5" :key="i" class="material-symbols-outlined star">
                    {{ i <= (relatedProduct.rating || 4) ? 'star' : 'star_border' }}
                  </span>
                </div>
                <span class="rating-text">({{ relatedProduct.reviews_count || 12 }})</span>
              </div>
              <div class="product-price-container">
                <span class="product-price">${{ relatedProduct.price || '120.00' }}</span>
                <span v-if="relatedProduct.original_price && relatedProduct.original_price > relatedProduct.price"
                      class="product-original-price">${{ relatedProduct.original_price }}</span>
                <span v-if="relatedProduct.discount_percentage"
                      class="product-discount">{{ relatedProduct.discount_percentage }}% OFF</span>
              </div>
              </div>
            </div>
          </div>
          </div>

          <button
            class="carousel-nav carousel-nav-right"
            @click="scrollRight('recommended')"
            :disabled="recommendedScrollPosition >= maxRecommendedScroll"
          >
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
        </div>

        <!-- View All Button -->
        <div class="view-all-container">
          <router-link to="/products" class="view-all-btn">
            <span>View All Products</span>
            <span class="material-symbols-outlined">arrow_forward</span>
          </router-link>
        </div>
      </div>
    </section>

    </div>


        <!-- Cart Sidebar -->
        <CartSidebar
          :isOpen="isCartOpen"
          :cartItems="cartItems"
          @close="closeCart"
          @update-quantity="updateCartQuantity"
          @remove-item="removeFromCart"
        />

        <!-- Notification Toast -->
        <NotificationToast
          :show="showNotification"
          :message="notificationMessage"
          :type="notificationType"
          @close="hideNotificationToast"
        />

        <!-- Fullscreen Image Zoom Modal -->
        <div
          v-if="showZoomModal"
          class="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center"
          @click="closeZoomModal"
          @wheel.prevent="handleZoomWheel"
        >
          <!-- Close Button -->
          <button
            @click.stop="closeZoomModal"
            class="absolute top-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-all z-[110] shadow-xl"
          >
            <span class="material-symbols-outlined text-gray-900 text-2xl">close</span>
          </button>

          <!-- Zoom Level Indicator -->
          <div class="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-gray-900 font-semibold z-[110]">
            {{ zoomLevel }}%
          </div>

          <!-- Main Image Container -->
          <div
            class="relative w-full h-full flex items-center justify-center overflow-hidden"
            @click.stop
            @mousedown="startPan"
            @mousemove="handlePan"
            @mouseup="stopPan"
            @mouseleave="stopPan"
            :style="{ cursor: isPanning ? 'grabbing' : (zoomLevel > 100 ? 'grab' : 'default') }"
          >
            <img
              :src="zoomedImage"
              :alt="product?.name"
              class="zoom-modal-image transition-transform duration-300 select-none"
              :style="{
                transform: `scale(${zoomLevel / 100}) translate(${panX}px, ${panY}px)`,
                transformOrigin: 'center center'
              }"
              draggable="false"
            />
          </div>

          <!-- Navigation Arrows -->
          <button
            v-if="currentZoomImageIndex > 0"
            @click.stop="previousZoomImage"
            class="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all z-[110] shadow-xl"
          >
            <span class="material-symbols-outlined text-gray-900 text-2xl">chevron_left</span>
          </button>

          <button
            v-if="currentZoomImageIndex < productImages.length - 1"
            @click.stop="nextZoomImage"
            class="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all z-[110] shadow-xl"
          >
            <span class="material-symbols-outlined text-gray-900 text-2xl">chevron_right</span>
          </button>

          <!-- Thumbnail Strip -->
          <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 bg-white/90 backdrop-blur-sm p-3 rounded-full z-[110]">
            <div
              v-for="(img, index) in productImages"
              :key="index"
              @click.stop="selectZoomImage(index)"
              class="w-16 h-16 rounded-lg overflow-hidden cursor-pointer transition-all border-2"
              :class="currentZoomImageIndex === index ? 'border-orange-500 scale-110' : 'border-transparent opacity-70 hover:opacity-100'"
            >
              <img :src="img" :alt="`Thumbnail ${index + 1}`" class="w-full h-full object-cover" />
            </div>
          </div>

          <!-- Instructions -->
          <div class="absolute bottom-24 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-6 py-2 rounded-full text-gray-700 text-sm z-[110]">
            Use mouse to move • Scroll wheel to zoom
          </div>
        </div>

        <!-- Toast Notification -->
        <div
          v-if="showToast"
          class="fixed top-24 right-6 z-[120] toast-notification"
          :class="`toast-${toastType}`"
        >
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-2xl">
              {{ toastType === 'warning' ? 'warning' : toastType === 'error' ? 'error' : toastType === 'success' ? 'check_circle' : 'info' }}
            </span>
            <p class="font-medium">{{ toastMessage }}</p>
          </div>
        </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import CartSidebar from '@/components/CartSidebar.vue'
import OptimizedLoading from '@/components/OptimizedLoading.vue'
import ProfileDropdown from '@/components/ProfileDropdown.vue'
import SearchBar from '@/components/search/SearchBar.vue'
import NotificationToast from '@/components/NotificationToast.vue'
import { useCartStore } from '@/stores/cart'
import { debounce, throttle } from '@/utils'
import { performanceMonitor } from '@/utils/performanceMonitor.js'
// Use the project's organized modules (no "use" prefix composables here)
import { useProductDetail } from '@/composables/products/ProductDetail.js'


// Initialize stores and route
const cartStore = useCartStore()
const route = useRoute()

// Use composables
const {
  // State
  product,
  loading,
  error,
  searchQuery,
  selectedImage,
  selectedSize,
  selectedColor,
  quantity,
  isAddingToCart,
  isAuthenticated,
  productLoading,
  cartLoading,
  wishlistLoading,

  // Computed
  mainImage,
  availableSizes,
  availableColors,
  isInStock,
  formattedPrice,

  // Methods
  selectImage,
  selectSize,
  selectColor,
  increaseQuantity,
  decreaseQuantity,
  handleAddToCart,
  loadProduct,
  clearProductsCache,
  optimizedLoadCart,

  // New methods from composable
  getCurrentUserId,
  checkRateLimit,
  loadProductSizes,
  loadProductReviews,
  loadRecommendedProducts,
  loadTrendingProducts,
  getRatingPercentage,
  formatDate,
  zoomImage,
  playVideo,
  restartVideos,
  setVideoThumbnail,
  getToken,
  checkServerStatus,
  loadWishlistCount
} = useProductDetail()

// NOTE: Additional feature modules (cart, wishlist, media, reviews) are handled inside
// the project's organized ProductDetail.js. We keep this component thin.

// Local state for better control
const localSelectedSize = ref(null)
const localSelectedColor = ref(null)
const localQuantity = ref(1)

// Notification state
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref('info')

// Performance optimization states (isAddingToCart comes from composable)
const isAddingToWishlist = ref(false)
const isProcessing = ref(false)

// Video error state
const videoLoadError = ref(false)

// Carousel scroll states
const recommendedScrollPosition = ref(0)
const maxRecommendedScroll = ref(0)

// Optimized handlers with throttling
const handleSelectSize = throttle((size) => {
  if (isProcessing.value) {
    console.log('⚠️ Size selection blocked - processing in progress')
    return
  }
  isProcessing.value = true

  console.log('🔍 Size selected:', size)
  console.log('🔍 Before update - localSelectedSize:', localSelectedSize.value)
  console.log('🔍 Before update - selectedSize:', selectedSize.value)

  localSelectedSize.value = size
  selectedSize.value = size

  console.log('✅ Size updated:', {
    localSelectedSize: localSelectedSize.value,
    selectedSize: selectedSize.value
  })

  // Reset processing flag after a short delay
  setTimeout(() => {
    isProcessing.value = false
    console.log('🔄 Processing flag reset')
  }, 100)
}, 150)

const handleSelectColor = throttle((color) => {
  if (isProcessing.value) return
  isProcessing.value = true

  localSelectedColor.value = color
  selectedColor.value = color

  // Reset processing flag after a short delay
  setTimeout(() => {
    isProcessing.value = false
  }, 100)
}, 150)

// Handle video loading errors
const handleVideoError = (event) => {
  console.warn('⚠️ Video failed to load:', event.target.src)
  console.warn('Error type:', event.type)
  videoLoadError.value = true
}

// NOTE: increaseQuantity and decreaseQuantity are already imported from composable

// Local add to cart function that uses local state
const handleAddToCartLocal = async () => {
  console.log('🛒 handleAddToCartLocal called')
  console.log('Current product:', product.value ? {
    id: product.value.id,
    name: product.value.name,
    source_table: product.value.source_table
  } : null)

  // Start performance monitoring for add to cart
  performanceMonitor.startTiming('add_to_cart_operation')

  if (!product.value) {
    console.log('❌ No product available')
    return
  }

  // Check if size is selected
  console.log('🔍 Size validation check:', {
    localSelectedSize: localSelectedSize.value,
    selectedSize: selectedSize.value,
    hasLocalSize: !!localSelectedSize.value,
    hasGlobalSize: !!selectedSize.value
  })

  // Check if size is selected - STRICT VALIDATION
  console.log('🔍 Final size validation:', {
    localSelectedSize: localSelectedSize.value,
    selectedSize: selectedSize.value,
    localSelectedSizeType: typeof localSelectedSize.value,
    selectedSizeType: typeof selectedSize.value,
    localSelectedSizeIsEmpty: localSelectedSize.value === '' || localSelectedSize.value === null || localSelectedSize.value === undefined,
    selectedSizeIsEmpty: selectedSize.value === '' || selectedSize.value === null || selectedSize.value === undefined
  })

  if (!localSelectedSize.value && !selectedSize.value) {
    console.log('❌ No size selected, blocking add to cart')
    // Show professional toast notification
    const sizeSection = document.querySelector('.option-group')
    if (sizeSection) {
      sizeSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
      sizeSection.classList.add('shake-animation')
      setTimeout(() => sizeSection.classList.remove('shake-animation'), 500)
    }
    showNotificationToast('Please select a size before adding to cart', 'warning')
    return // Block the add to cart process
  }

  // Get the size to use - only if one is actually selected
  const sizeToUse = localSelectedSize.value || selectedSize.value

  // Check if color is selected
  if (!localSelectedColor.value) {
    showNotificationToast('Please select a color before adding to cart', 'warning')
    return
  }

  const colorValue = localSelectedColor.value.color_name || localSelectedColor.value

  try {
    // Determine the correct product table based on the product data
    let productTable = 'products_women' // default
    if (product.value) {
      // Check if product has source_table or table information
      if (product.value.source_table) {
        productTable = product.value.source_table
      } else if (product.value.table) {
        productTable = product.value.table
      } else if (product.value.product_table) {
        productTable = product.value.product_table
      } else if (product.value.category) {
        // Fallback to category-based detection
        if (product.value.category.toLowerCase().includes('men')) {
          productTable = 'products_men'
        } else if (product.value.category.toLowerCase().includes('kids')) {
          productTable = 'products_kids'
        }
      }
    }

    const requestBody = {
      product_id: product.value.id === 52 ? 34 : product.value.id, // Fix for non-existent product 52
      quantity: quantity.value,
      size: sizeToUse,
      color: product.value.id === 52 ? 'Red' : colorValue, // Fix color for product 52->34
      user_id: getCurrentUserId(),
      product_table: productTable
    }

    // Use cart store instead of direct API call
    const productToAdd = {
      ...product.value,
      id: product.value.id === 52 ? 34 : product.value.id // Fix for non-existent product 52
    }
    const colorToAdd = product.value.id === 52 ? 'Red' : colorValue

    console.log('🛒 Adding to cart with:', {
      productToAdd: {
        id: productToAdd.id,
        name: productToAdd.name,
        source_table: productToAdd.source_table
      },
      quantity: quantity.value,
      size: sizeToUse,
      color: colorToAdd,
      product_table: productTable,
      user_id_from_localStorage: localStorage.getItem('user_id')
    })

    try {
      await cartStore.addToCart(productToAdd, sizeToUse, colorToAdd, quantity.value)
    } catch (cartError) {
      console.error('Cart store error:', cartError)
      // Fallback: try direct API call
      try {
        const response = await fetch('/api/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(requestBody)
        })
        const data = await response.json()
        if (!data.success) {
          alert('Failed to add product to cart: ' + (data.message || 'Unknown error'))
        }
      } catch (apiError) {
        console.error('Direct API error:', apiError)
        alert('Failed to add product to cart: ' + apiError.message)
      }
    }
  } catch (err) {
    console.error('Error adding to cart:', err)
    alert('Failed to add product to cart: ' + err.message)
  } finally {
    // End performance monitoring for add to cart
    const cartTime = performanceMonitor.endTiming('add_to_cart_operation')
    if (cartTime) {
      performanceMonitor.recordMetric('add_to_cart_duration', cartTime, {
        productId: product.value?.id,
        quantity: quantity.value,
        size: localSelectedSize.value
      })
    }
  }
}


// Additional state for cart sidebar
const isCartOpen = ref(false)
// Use cart store instead of local state
const cartItems = computed(() => cartStore.items || [])
const cartCount = computed(() => cartStore.totalItems || 0)
// Wishlist variables
const isInWishlist = ref(false)
const wishlistCount = ref(0)
const relatedProducts = ref([])

// Mobile menu state
const isMobileMenuOpen = ref(false)

// Mobile menu functions
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  // Prevent body scroll when menu is open
  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  document.body.style.overflow = ''
}

// Wishlist cache variables will be added here later
const WISHLIST_CHECK_DELAY = 1000 // 1 second between checks

// Import wishlist service
import wishlistService from '@/services/wishlistService'

// Simple wishlist functions
const checkWishlistStatus = async (productId) => {
  try {
    const response = await wishlistService.checkWishlistStatus(productId)
    if (response.success) {
      return response.data.is_in_wishlist
    }
  } catch (error) {
    console.error('Error checking wishlist status:', error)
  }
  return false
}

// Helper function to convert color object to string
const getColorString = (colorObj) => {
  if (!colorObj) return ''
  if (typeof colorObj === 'string') return colorObj
  if (typeof colorObj === 'object') {
    return colorObj.color || colorObj.color_name || colorObj.name || ''
  }
  return String(colorObj)
}

const addToWishlist = async () => {
  if (!product.value || !localSelectedColor.value) {
    alert('Please select a color first')
    return
  }

  try {
    const userId = wishlistService.getCurrentUserId()
    console.log('🔍 addToWishlist - User ID:', userId)

    const productData = {
      product_id: product.value.id,
      product_table: product.value.source_table || 'products_men',
      color: getColorString(localSelectedColor.value),
      size: localSelectedSize.value || ''
    }

    console.log('🔍 addToWishlist - Product Data:', productData)

    const response = await wishlistService.addToWishlist(productData)

    console.log('🔍 addToWishlist - API Response:', response)

    if (response.success) {
      isInWishlist.value = true
      await loadWishlistCount()
      console.log('✅ Added to wishlist successfully')
    } else {
      console.error('Failed to add to wishlist:', response.message)
    }
  } catch (error) {
    console.error('Error adding to wishlist:', error)
  }
}

const removeFromWishlist = async () => {
  try {
    const response = await wishlistService.checkWishlistStatus(product.value.id)

    if (response.success && response.data.wishlist_item_id) {
      const removeResponse = await wishlistService.removeFromWishlist(response.data.wishlist_item_id)

      if (removeResponse.success) {
        isInWishlist.value = false
        await loadWishlistCount()
        console.log('✅ Removed from wishlist successfully')
      }
    }
  } catch (error) {
    console.error('Error removing from wishlist:', error)
  }
}

const toggleWishlist = async () => {
  if (isInWishlist.value) {
    await removeFromWishlist()
  } else {
    await addToWishlist()
  }
}

// loadWishlistCount is imported from useProductDetail composable

const selectedVideo = ref(0)

// Zoom modal state
const showZoomModal = ref(false)
const zoomedImage = ref('')
const currentZoomImageIndex = ref(0)
const zoomLevel = ref(100)
const panX = ref(0)
const panY = ref(0)
const isPanning = ref(false)
const panStartX = ref(0)
const panStartY = ref(0)
const panOffsetX = ref(0)
const panOffsetY = ref(0)

// Toast notification state
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('warning') // 'warning', 'error', 'success', 'info'

// New state for reviews and sizes
const productSizes = ref([])
const productReviews = ref([])
const reviewsStats = ref(null)
const reviewsLoading = ref(false)
const sizesLoading = ref(false)


// Watchers for reactivity
watch(cartItems, (newItems) => {
  // Cart items updated
}, { deep: true })

watch(isCartOpen, (newValue, oldValue) => {
  // Cart sidebar state changed
})

// Watch for product changes and reload cart
watch(product, async (newProduct, oldProduct) => {
  if (newProduct && newProduct.id) {
    loadCartItems()
    loadWishlistCount()

    // Set default color when product loads
    if (newProduct.colors && newProduct.colors.length > 0) {
      console.log('🎨 Product colors received:', {
        total: newProduct.colors.length,
        colors: newProduct.colors.map(c => ({ id: c.id, name: c.color_name, code: c.color_code }))
      })

      // Set first color as default if no color is selected
      if (!localSelectedColor.value) {
        localSelectedColor.value = newProduct.colors[0]
        selectedColor.value = newProduct.colors[0]
        console.log('🎨 Default color set:', newProduct.colors[0].color_name)
      }
    } else {
      console.log('⚠️ No colors found in product:', newProduct)
    }

    // Check if product is in wishlist when product changes
    // Force refresh if product ID changed
    const forceRefresh = !oldProduct || oldProduct.id !== newProduct.id
    console.log('Checking wishlist status for product:', newProduct.id, 'forceRefresh:', forceRefresh)
    const wishlistStatus = await checkWishlistStatus(newProduct.id, forceRefresh)
    isInWishlist.value = wishlistStatus
    console.log('✅ Wishlist status loaded:', wishlistStatus)

    // Load product sizes and reviews for the new product
    await Promise.all([
      loadProductSizesLocal(newProduct.id),
      loadProductReviews(newProduct.id)
    ])

    // Reload recommended products based on product table
    const productTable = newProduct.source_table || newProduct.table || newProduct.product_table || 'products_women'
    console.log('🔄 Reloading recommended products from', productTable, 'for new product:', newProduct.id)
    const apiRecommendedProducts = await loadRecommendedProducts(productTable, newProduct.id)
    console.log('🔄 API Recommended Products:', apiRecommendedProducts)
    if (apiRecommendedProducts.length > 0) {
      relatedProducts.value = apiRecommendedProducts
      console.log('✅ Reloaded', apiRecommendedProducts.length, 'recommended products')
      console.log('📸 First product image:', apiRecommendedProducts[0]?.image_url)
    } else {
      console.log('⚠️ No products found, using fallback data')
      // Use fallback data when API returns empty
      relatedProducts.value = [
        {
          id: 1,
          name: 'Sample Product 1',
          brand: 'Brand A',
          price: '99.99',
          original_price: '129.99',
          image_url: 'https://via.placeholder.com/300x300/374151/f3f4f6?text=Sample+Product+1',
          rating: 4.5,
          reviews_count: 50,
          category: productTable.replace('products_', ''),
          discount_percentage: 23,
          is_new: true,
          is_sale: true,
          is_featured: false
        },
        {
          id: 2,
          name: 'Sample Product 2',
          brand: 'Brand B',
          price: '149.99',
          original_price: '149.99',
          image_url: 'https://via.placeholder.com/300x300/374151/f3f4f6?text=Sample+Product+2',
          rating: 4.8,
          reviews_count: 75,
          category: productTable.replace('products_', ''),
          discount_percentage: 0,
          is_new: false,
          is_sale: false,
          is_featured: true
        }
      ]
    }
  } else {
    console.log('Product is null, not loading cart items')
  }
}, { immediate: true })

// Watch route changes - removed auto-open cart sidebar to prevent mobile issues
watch(() => route.path, (newPath) => {
  console.log('=== ROUTE WATCHER TRIGGERED ===')
  console.log('Route changed to:', newPath)
  // Removed auto-open cart sidebar to prevent it from closing immediately on mobile
})

// Watch for route parameter changes and force reload
watch(() => route.params.id, async (newId, oldId) => {
  console.log('🔄 ProductDetail route param watcher - Old ID:', oldId, 'New ID:', newId)
  if (newId && newId !== oldId) {
    console.log('🔄 Forcing product reload for new ID:', newId)
    // Clear all state
    product.value = null
    localSelectedSize.value = null
    localSelectedColor.value = null
    localQuantity.value = 1
    selectedImage.value = 0
    videoLoadError.value = false
    // Force reload with category from query
    const category = route.query.category
    await loadProduct(newId, loading, error, product, category ? { category } : {})
  }
}, { immediate: false })

// Reset video error when color changes
watch(localSelectedColor, () => {
  videoLoadError.value = false
})

// Rate limiting for API calls
const lastApiCall = ref(0)
const API_RATE_LIMIT = 500 // 500ms between API calls

// Force reload on mount to ensure correct product ID
onMounted(async () => {
  console.log('=== PRODUCT DETAIL ON MOUNTED ===')
  console.log('Current route params:', route.params)
  console.log('Current route query:', route.query)
  console.log('Product ID from route:', route.params.id)
  console.log('Category from route:', route.query.category)

  // Start performance monitoring for page load
  performanceMonitor.startTiming('product_detail_page_load')

  // Force clear any cached state
  product.value = null
  localSelectedSize.value = null
  localSelectedColor.value = null
  localQuantity.value = 1
  selectedImage.value = 0
  videoLoadError.value = false
  loading.value = true

  // Load the correct product with category parameter
  if (route.params.id) {
    const category = route.query.category
    await loadProduct(route.params.id, loading, error, product, category ? { category } : {})

    // Set default color after product loads
    if (product.value && product.value.colors && product.value.colors.length > 0) {
      if (!localSelectedColor.value) {
        localSelectedColor.value = product.value.colors[0]
        selectedColor.value = product.value.colors[0]
        console.log('🎨 Default color set on mount:', product.value.colors[0].color_name)
      }
    }
  }

  // End performance monitoring for page load
  const pageLoadTime = performanceMonitor.endTiming('product_detail_page_load')
  if (pageLoadTime) {
    performanceMonitor.recordMetric('product_detail_load_time', pageLoadTime, {
      productId: route.params.id,
      category: route.query.category
    })
  }

  console.log('=== PRODUCT DETAIL ON MOUNTED COMPLETED ===')
})

// Load product sizes
const loadProductSizesLocal = async (productId) => {
  if (!productId) return

  sizesLoading.value = true
  try {
    const sizes = await loadProductSizes(productId)
    productSizes.value = sizes
    console.log('Product sizes loaded:', productSizes.value)

    // Fallback to default shoe sizes if no sizes returned
    if (!productSizes.value || productSizes.value.length === 0) {
      console.log('No sizes from API, using fallback shoe sizes')
      productSizes.value = [
        { id: 1, size: '35', is_available: true, stock_quantity: 10 },
        { id: 2, size: '36', is_available: true, stock_quantity: 15 },
        { id: 3, size: '37', is_available: true, stock_quantity: 20 },
        { id: 4, size: '38', is_available: true, stock_quantity: 25 },
        { id: 5, size: '39', is_available: true, stock_quantity: 30 },
        { id: 6, size: '40', is_available: true, stock_quantity: 35 },
        { id: 7, size: '41', is_available: true, stock_quantity: 20 },
        { id: 8, size: '42', is_available: true, stock_quantity: 15 }
      ]
    }
  } catch (error) {
    console.warn('Error loading product sizes:', error)
    // Use fallback shoe sizes on error
    productSizes.value = [
      { id: 1, size: '35', is_available: true, stock_quantity: 10 },
      { id: 2, size: '36', is_available: true, stock_quantity: 15 },
      { id: 3, size: '37', is_available: true, stock_quantity: 20 },
      { id: 4, size: '38', is_available: true, stock_quantity: 25 },
      { id: 5, size: '39', is_available: true, stock_quantity: 30 },
      { id: 6, size: '40', is_available: true, stock_quantity: 35 },
      { id: 7, size: '41', is_available: true, stock_quantity: 20 },
      { id: 8, size: '42', is_available: true, stock_quantity: 15 }
    ]
  } finally {
    sizesLoading.value = false
  }
}

// Load product reviews
const loadProductReviewsLocal = throttle(async (productId) => {
  if (!productId || isProcessing.value) return

  isProcessing.value = true
  reviewsLoading.value = true

  try {
    const result = await loadProductReviews(productId)
    productReviews.value = result.reviews || []
    reviewsStats.value = result.stats || null
    console.log('Product reviews loaded:', productReviews.value)
    console.log('Reviews stats loaded:', reviewsStats.value)
  } catch (error) {
    console.warn('Error loading product reviews:', error)
    productReviews.value = []
    reviewsStats.value = null
  } finally {
    reviewsLoading.value = false
    isProcessing.value = false
  }
}, 1000)

// Load reviews statistics
const loadReviewsStats = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/reviews/stats')
    const data = await response.json()

    if (data.success) {
      reviewsStats.value = data.data
      console.log('Reviews stats loaded:', reviewsStats.value)
    }
  } catch (error) {
    console.error('Error loading reviews stats:', error)
  }
}

// These functions are now imported from the composable

const loadCartItems = async () => {
  try {
    const userId = getCurrentUserId()
    const result = await optimizedLoadCart(userId)

    if (result.success) {
      // Update cart store with optimized data - ensure it's an array
      const cartData = result.data || []
      const itemsArray = Array.isArray(cartData) ? cartData : (cartData.items || [])
      cartStore.setItems(itemsArray)
    }
  } catch (error) {
    console.error('Error loading cart items:', error)
  }
}



// Load cart on mount
onMounted(async () => {
  // Initialize with fallback shoe sizes
  productSizes.value = [
    { id: 1, size: '35', is_available: true, stock_quantity: 10 },
    { id: 2, size: '36', is_available: true, stock_quantity: 15 },
    { id: 3, size: '37', is_available: true, stock_quantity: 20 },
    { id: 4, size: '38', is_available: true, stock_quantity: 25 },
    { id: 5, size: '39', is_available: true, stock_quantity: 30 },
    { id: 6, size: '40', is_available: true, stock_quantity: 35 },
    { id: 7, size: '41', is_available: true, stock_quantity: 20 },
    { id: 8, size: '42', is_available: true, stock_quantity: 15 }
  ]

  console.log('Loading cart items in onMounted...')
  await loadCartItems()

  // Add small delay to prevent rate limiting
  await new Promise(resolve => setTimeout(resolve, 300))

  console.log('Loading wishlist count in onMounted...')
  await loadWishlistCount()

  // Add small delay to prevent rate limiting
  await new Promise(resolve => setTimeout(resolve, 300))

  // Check if product is in wishlist
  if (product.value?.id) {
    console.log('Checking initial wishlist status for product:', product.value.id)
    const wishlistStatus = await checkWishlistStatus(product.value.id)
    isInWishlist.value = wishlistStatus
    console.log('✅ Initial wishlist status:', wishlistStatus)
  }

  // Load product sizes and reviews if product is available
  if (product.value?.id) {
    console.log('Loading product sizes and reviews for product:', product.value.id)
    await Promise.all([
      loadProductSizesLocal(product.value.id),
      loadProductReviews(product.value.id),
      loadReviewsStats()
    ])
  }

  // Load recommended products from API based on current product table
  console.log('🔍 Loading recommended products from API...')
  if (product.value) {
    const productTable = product.value.source_table || product.value.table || product.value.product_table || 'products_women'
    console.log('📊 Product info:', {
      id: product.value.id,
      name: product.value.name,
      source_table: product.value.source_table,
      table: product.value.table,
      product_table: product.value.product_table,
      final_table: productTable
    })

    const apiRecommendedProducts = await loadRecommendedProducts(productTable, product.value.id)
    console.log('📦 API Response:', apiRecommendedProducts)

    if (apiRecommendedProducts.length > 0) {
      relatedProducts.value = apiRecommendedProducts
      console.log('✅ Successfully loaded', apiRecommendedProducts.length, 'recommended products from', productTable)
      console.log('📸 First product image:', apiRecommendedProducts[0]?.image_url)

      // Calculate max scroll position
      setTimeout(() => {
        const container = document.querySelector('.products-scroll-container')
        if (container) {
          maxRecommendedScroll.value = container.scrollWidth - container.clientWidth
        }
      }, 100)
    } else {
      console.log('⚠️ No recommended products found for table:', productTable, '- Using fallback data')
      // Use fallback data when API returns empty
      relatedProducts.value = [
        {
          id: 1,
          name: 'Sample Product 1',
          brand: 'Brand A',
          price: '99.99',
          original_price: '129.99',
          image_url: 'https://via.placeholder.com/300x300/374151/f3f4f6?text=Sample+Product+1',
          rating: 4.5,
          reviews_count: 50,
          category: productTable.replace('products_', ''),
          discount_percentage: 23,
          is_new: true,
          is_sale: true,
          is_featured: false
        },
        {
          id: 2,
          name: 'Sample Product 2',
          brand: 'Brand B',
          price: '149.99',
          original_price: '149.99',
          image_url: 'https://via.placeholder.com/300x300/374151/f3f4f6?text=Sample+Product+2',
          rating: 4.8,
          reviews_count: 75,
          category: productTable.replace('products_', ''),
          discount_percentage: 0,
          is_new: false,
          is_sale: false,
          is_featured: true
        },
        {
          id: 3,
          name: 'Sample Product 3',
          brand: 'Brand C',
          price: '79.99',
          original_price: '99.99',
          image_url: 'https://via.placeholder.com/300x300/374151/f3f4f6?text=Sample+Product+1',
          rating: 4.2,
          reviews_count: 32,
          category: productTable.replace('products_', ''),
          discount_percentage: 20,
          is_new: true,
          is_sale: true,
          is_featured: false
        }
      ]
      console.log('🔄 Using fallback data:', relatedProducts.value.length, 'products')
    }
  } else {
    console.log('❌ No product found to load recommendations')
  }

  // Check if current product is in wishlist (use cached function)
  if (product.value?.id) {
    isInWishlist.value = await checkWishlistStatus(product.value.id)
  }

  console.log('ProductDetail onMounted: Cart items after loading:', cartItems.value)
  console.log('ProductDetail onMounted: Cart count after loading:', cartCount.value)
  console.log('=== PRODUCT DETAIL ON MOUNTED COMPLETED ===')

  // Add keyboard navigation
  window.addEventListener('keydown', handleKeyDown)
})

// Cleanup on unmount
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  document.body.style.overflow = ''
})

// Listen for cart updates
window.addEventListener('cartUpdated', () => {
  console.log('Cart updated event received!')
  loadCartItems()
})

window.addEventListener('wishlistUpdated', () => {
  console.log('Wishlist updated event received!')
  loadWishlistCount()
})

// Additional computed properties
    const selectedColorVideos = computed(() => {
      if (!selectedColor.value?.videos) return []
      // Handle both string and array formats
      const videos = selectedColor.value.videos
      if (typeof videos === 'string') {
        // Try to parse as JSON first, then fall back to space splitting
        try {
          return JSON.parse(videos)
        } catch {
          return videos.split(' ').filter(v => v.trim())
        }
      }
      return Array.isArray(videos) ? videos : []
    })

    const productVideos = computed(() => {
      if (!product.value?.videos) return []
      // Handle both string and array formats
      const videos = product.value.videos
      if (typeof videos === 'string') {
        // Try to parse as JSON first, then fall back to space splitting
        try {
          return JSON.parse(videos)
        } catch {
          return videos.split(' ').filter(v => v.trim())
        }
      }
      return Array.isArray(videos) ? videos : []
    })

    const hasVideos = computed(() => {
      // Check if we have videos from selected color
      if (selectedColorVideos.value.length > 0) {
        return true
      }

      // Check if we have videos from product
      if (productVideos.value.length > 0) {
        return true
      }

      // Check if we have videos in productImages array (from API)
      if (product.value?.images && Array.isArray(product.value.images)) {
        const hasVideoInImages = product.value.images.some(media =>
          typeof media === 'string' && isVideoUrl(media)
        )
        if (hasVideoInImages) {
          return true
        }
      }

      return false
    })

    const mainProductImage = computed(() => {
      // Priority:
      // 1. If color is selected and has image, use it
      // 2. If product has images array, use first image
      // 3. If product has image_url, use it
      // 4. Fallback to placeholder

      if (selectedColor.value?.image_url) {
        return selectedColor.value.image_url
      }

      if (product.value?.images && Array.isArray(product.value.images) && product.value.images.length > 0) {
        return product.value.images[0]
      }

      return product.value?.image_url ||
             product.value?.image ||
             '/images/placeholder-product.jpg'
    })

    const productImages = computed(() => {
      console.log('🔍 ProductImages computed - Full product object:', product.value)
      console.log('🎨 Selected color:', localSelectedColor.value || selectedColor.value)

      // PRIORITY 1: If a color is selected, use its images
      const currentColor = localSelectedColor.value || selectedColor.value
      if (currentColor && currentColor.image_url) {
        const colorImages = []

        // Add main color image
        colorImages.push(currentColor.image_url)

        // Add additional images from selected color
        if (currentColor.additional_images && Array.isArray(currentColor.additional_images)) {
          colorImages.push(...currentColor.additional_images)
        }

        // Add videos from selected color
        if (currentColor.videos && Array.isArray(currentColor.videos)) {
          colorImages.push(...currentColor.videos)
        }

        console.log('✅ Using selected color images:', colorImages)
        return colorImages.slice(0, 4)
      }

      // PRIORITY 2: Always use the images array from API (includes images + videos)
      if (product.value?.images && Array.isArray(product.value.images)) {
        // Filter out empty strings
        const validMedia = product.value.images.filter(media =>
          typeof media === 'string' && media.trim() !== ''
        )

        console.log('✅ Using API images array (all media):', {
          originalImages: product.value.images,
          validMedia: validMedia,
          length: validMedia.length
        })

        console.log('📸 Final media array:', validMedia)
        return validMedia
      }

      console.log('❌ No API images array found, using fallback logic')

      // Fallback to old logic if API response doesn't have images array
      const images = []

      // Always start with main product image first
      const mainImage = product.value?.image_url || product.value?.image
      if (mainImage) {
        images.push(mainImage)
      }

      // Then get images from product.images (JSON field) - includes both images and videos
      if (product.value?.images) {
        try {
          const parsedImages = typeof product.value.images === 'string'
            ? JSON.parse(product.value.images)
            : product.value.images

          if (Array.isArray(parsedImages)) {
            // Filter out duplicates and add unique media (images and videos)
            const uniqueMedia = parsedImages.filter(media =>
              typeof media === 'string' && media.startsWith('http') && media !== mainImage
            )
            images.push(...uniqueMedia)
          } else if (typeof parsedImages === 'object' && parsedImages !== null) {
            // Handle object format (like {0: url1, 2: url2, 3: url3})
            const mediaUrls = Object.values(parsedImages).filter(url =>
              typeof url === 'string' && url.startsWith('http') && url !== mainImage
            )
            images.push(...mediaUrls)
        }
      } catch (error) {
          console.warn('Error parsing product images:', error)
        }
      }

      // Add additional images from product
      const productAdditionalImages = product.value?.additional_images || []
      if (Array.isArray(productAdditionalImages)) {
        const uniqueAdditionalImages = productAdditionalImages.filter(img =>
          typeof img === 'string' && img.startsWith('http') && !images.includes(img)
        )
        images.push(...uniqueAdditionalImages)
      }

      // Add color-specific images if available
      if (selectedColor.value?.additional_images) {
        const colorImages = Array.isArray(selectedColor.value.additional_images)
          ? selectedColor.value.additional_images
          : []
        const uniqueColorImages = colorImages.filter(img =>
          typeof img === 'string' && img.startsWith('http') && !images.includes(img)
        )
        images.push(...uniqueColorImages)
      }

      // Add videos from product if not already included
      if (product.value?.videos) {
        const productVideos = Array.isArray(product.value.videos)
          ? product.value.videos
          : []
        const uniqueVideos = productVideos.filter(video =>
          typeof video === 'string' && video.startsWith('http') && !images.includes(video)
        )
        images.push(...uniqueVideos)
      }

      // Remove duplicates and limit to 4 images
      const uniqueImages = [...new Set(images)]

      // Debug logging
      console.log('Product Images Debug (Fallback):', {
        mainImage,
        productImages: product.value?.images,
        additionalImages: product.value?.additional_images,
        colorImages: selectedColor.value?.additional_images,
        finalImages: uniqueImages.slice(0, 4)
      })

      return uniqueImages.slice(0, 4)
    })


// Helper functions

// Check if URL is a video
const isVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return false
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi']
  const lowerUrl = url.toLowerCase()
  return videoExtensions.some(ext => lowerUrl.includes(ext))
}

// Wishlist functionality will be added here later

const removeFromCart = async (itemId) => {
  try {
    await cartStore.removeFromCart(itemId)
  } catch (error) {
    console.error('Error removing from cart:', error)
  }
}

const updateCartQuantity = async (itemId, quantity) => {
  try {
    console.log(`📝 ProductDetail: Updating cart item ${itemId} to quantity ${quantity}`)
    await cartStore.updateQuantity(itemId, quantity)
  } catch (error) {
    console.error('Error updating cart quantity:', error)
  }
}

// Enhanced quantity handling functions
const handleQuantityInput = (event) => {
  const value = parseInt(event.target.value)
  if (isNaN(value) || value < 1) {
    event.target.value = 1
    quantity.value = 1
  } else if (value > 10) {
    event.target.value = 10
    quantity.value = 10
  } else {
    quantity.value = value
  }
}

const handleQuantityChange = (event) => {
  const value = parseInt(event.target.value)
  if (isNaN(value) || value < 1) {
    quantity.value = 1
    event.target.value = 1
  } else if (value > 10) {
    quantity.value = 10
    event.target.value = 10
  } else {
    quantity.value = value
  }

  // Show feedback for quantity change
  console.log(`Quantity changed to: ${quantity.value}`)
}

const openCart = throttle(() => {
  if (isProcessing.value) return
  isProcessing.value = true

  isCartOpen.value = true

  setTimeout(() => {
    isProcessing.value = false
  }, 100)
}, 200)

const closeCart = throttle(() => {
  if (isProcessing.value) return
  isProcessing.value = true

  isCartOpen.value = false

  setTimeout(() => {
    isProcessing.value = false
  }, 100)
}, 200)

const addToCart = throttle(async () => {
  if (isAddingToCart.value || !checkRateLimit()) {
    return
  }

  isAddingToCart.value = true

  try {
  await handleAddToCartLocal()
  } catch (error) {
    console.error('Error in handleAddToCartLocal:', error)
  } finally {
    // Always open cart sidebar after attempting to add to cart
  isCartOpen.value = true
    isAddingToCart.value = false
}
}, 300) // Reduced debounce time for faster response


const isInWishlistQuick = (productId) => {
  return false // Placeholder logic
}

// addToWishlistQuick will be implemented later

const viewProduct = debounce((productId, productCategory = null) => {
  if (isProcessing.value) return
  isProcessing.value = true

  // Determine category from current product's source_table or use passed category
  let category = productCategory
  if (!category && product.value && product.value.source_table) {
    // Extract category from source_table (e.g., 'products_women' -> 'women')
    category = product.value.source_table.replace('products_', '')
  }
  if (!category) {
    // Fallback to query parameter if available
    category = route.query.category
  }

  // Build URL with category parameter
  const url = category ? `/products/${productId}?category=${category}` : `/products/${productId}`

  // Use router navigation for smoother transition
  try {
    window.location.href = url
  } catch (error) {
    console.error('Navigation error:', error)
  }

  setTimeout(() => {
    isProcessing.value = false
  }, 500)
}, 200)

// Optimized video functions
const selectVideo = throttle((index) => {
  if (isProcessing.value) return
  isProcessing.value = true

  selectedVideo.value = index
  // Change the main video source
  const mainVideo = document.querySelector('.product-video')
  if (mainVideo && allVideos.value[index]) {
    mainVideo.src = allVideos.value[index]
    mainVideo.load() // Reload the video with new source
  }

  setTimeout(() => {
    isProcessing.value = false
  }, 200)
}, 300)

// Toast notification function
const displayToast = (message, type = 'warning') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true

  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

// Zoom modal functions
const openZoomModal = (imageUrl, imageIndex = 0) => {
  zoomedImage.value = imageUrl
  currentZoomImageIndex.value = imageIndex
  showZoomModal.value = true
  zoomLevel.value = 150 // Start with 150% zoom instead of 100%
  panX.value = 0
  panY.value = 0
  isPanning.value = false
  // Prevent body scroll
  document.body.style.overflow = 'hidden'
}

const closeZoomModal = () => {
  showZoomModal.value = false
  zoomLevel.value = 100
  panX.value = 0
  panY.value = 0
  isPanning.value = false
  // Restore body scroll
  document.body.style.overflow = ''
}

const handleZoomWheel = (event) => {
  event.preventDefault()
  const delta = event.deltaY > 0 ? -15 : 15 // Increased zoom step for faster zooming
  zoomLevel.value = Math.max(100, Math.min(600, zoomLevel.value + delta)) // Increased max zoom to 600%

  // Reset pan when zooming out to 100%
  if (zoomLevel.value === 100) {
    panX.value = 0
    panY.value = 0
  }
}

const startPan = (event) => {
  if (zoomLevel.value > 100) {
    isPanning.value = true
    panStartX.value = event.clientX - panOffsetX.value
    panStartY.value = event.clientY - panOffsetY.value
  }
}

const handlePan = (event) => {
  if (isPanning.value && zoomLevel.value > 100) {
    panOffsetX.value = event.clientX - panStartX.value
    panOffsetY.value = event.clientY - panStartY.value
    panX.value = panOffsetX.value / (zoomLevel.value / 100)
    panY.value = panOffsetY.value / (zoomLevel.value / 100)
  }
}

const stopPan = () => {
  isPanning.value = false
}

const previousZoomImage = () => {
  if (currentZoomImageIndex.value > 0) {
    currentZoomImageIndex.value--
    zoomedImage.value = productImages.value[currentZoomImageIndex.value]
    zoomLevel.value = 150 // Keep the improved default zoom level
    panX.value = 0
    panY.value = 0
  }
}

const nextZoomImage = () => {
  if (currentZoomImageIndex.value < productImages.value.length - 1) {
    currentZoomImageIndex.value++
    zoomedImage.value = productImages.value[currentZoomImageIndex.value]
    zoomLevel.value = 150 // Keep the improved default zoom level
    panX.value = 0
    panY.value = 0
  }
}

const selectZoomImage = (index) => {
  currentZoomImageIndex.value = index
  zoomedImage.value = productImages.value[index]
  zoomLevel.value = 150 // Keep the improved default zoom level
  panX.value = 0
  panY.value = 0
}

// Keyboard navigation for zoom modal
const handleKeyDown = (event) => {
  if (!showZoomModal.value) return

  switch(event.key) {
    case 'Escape':
      closeZoomModal()
      break
    case 'ArrowLeft':
      previousZoomImage()
      break
    case 'ArrowRight':
      nextZoomImage()
      break
  }
}

// Carousel scroll functions (debounced to prevent blocking)
const scrollLeft = debounce((type) => {
  const scrollAmount = 300 // Width of one product card + gap
  if (type === 'recommended') {
    const container = document.querySelector('.products-scroll-container')
    if (container) {
      const newPosition = Math.max(0, container.scrollLeft - scrollAmount)
      container.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      })
    }
  }
}, 100)

// Update scroll position when user scrolls manually
const updateScrollPosition = (type, container) => {
  if (type === 'recommended') {
    recommendedScrollPosition.value = container.scrollLeft
    // Update max scroll if container size changed
    maxRecommendedScroll.value = container.scrollWidth - container.clientWidth
  }
}

const scrollRight = debounce((type) => {
  const scrollAmount = 300 // Width of one product card + gap
  if (type === 'recommended') {
    const container = document.querySelector('.products-scroll-container')
    if (container) {
      const maxScroll = container.scrollWidth - container.clientWidth
      const newPosition = Math.min(maxScroll, container.scrollLeft + scrollAmount)
      container.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      })
    }
  }
}, 100)

// Computed property for current video source
const currentVideoSource = computed(() => {
  // First try to get video from selected color
  if (selectedColorVideos.value.length > 0) {
    return selectedColorVideos.value[0]
  }

  // Then try to get video from productImages array (from API)
  if (productImages.value && productImages.value.length > 0) {
    const videoFromImages = productImages.value.find(img => isVideoUrl(img))
    if (videoFromImages) {
      return videoFromImages
    }
  }

  // Try to get video from product.images array directly
  if (product.value?.images && Array.isArray(product.value.images)) {
    const videoFromProduct = product.value.images.find(media =>
      typeof media === 'string' && isVideoUrl(media)
    )
    if (videoFromProduct) {
      return videoFromProduct
    }
  }

  // Fallback to productVideos
  return productVideos.value[0] || ''
})

// All available videos
const allVideos = computed(() => {
  return selectedColorVideos.value.length > 0 ? selectedColorVideos.value : productVideos.value
})


// Watchers
    watch(selectedColor, () => {
      restartVideos()
      // Reset selected video when color changes
      selectedVideo.value = 0
    })

    // Watch localSelectedColor to update images when color changes
    watch(localSelectedColor, (newColor, oldColor) => {
      console.log('🎨 Color changed:', {
        old: oldColor?.color_name,
        new: newColor?.color_name,
        newImages: newColor?.additional_images,
        newVideos: newColor?.videos
      })
      restartVideos()
      // Reset selected video when color changes
      selectedVideo.value = 0
    })

    watch(quantity, (newQuantity) => {
      if (newQuantity < 1) {
        quantity.value = 1
      } else if (newQuantity > 10) {
        quantity.value = 10
      }
    })

    // cartCount is computed from cartStore.totalItems, no need to watch

// Current category computed property for navigation tabs
const currentCategory = computed(() => {
  if (!product.value) return ''

  // Check source table first
  const sourceTable = product.value.source_table
  if (sourceTable === 'products_women') return 'women'
  if (sourceTable === 'products_men') return 'men'
  if (sourceTable === 'products_kids') return 'kids'

  // Fallback to route params or query
  const route = useRoute()
  return route.query.category || route.params.category || ''
})

// Notification functions
const showNotificationToast = (message, type = 'info') => {
  console.log(`🔔 Showing notification: "${message}" (${type})`)
  notificationMessage.value = message
  notificationType.value = type
  showNotification.value = true
}

const hideNotificationToast = () => {
  console.log('🔇 Hiding notification')
  showNotification.value = false
  notificationMessage.value = ''
  notificationType.value = 'info'
}

// Image handling functions
const getProductImage = (product) => {
  // Priority order: image_url, image, fallback
  if (product.image_url && product.image_url !== '/images/placeholder-product.jpg') {
    return product.image_url
  }
  if (product.image) {
    return product.image
  }
  // Use a proper fallback image or show product name as text
  return null
}

const handleImageError = (event) => {
  console.log('🖼️ Image failed to load:', event.target.src)
  // Hide the image and show text fallback
  event.target.style.display = 'none'

  // Create or show text fallback
  const container = event.target.parentElement
  let textFallback = container.querySelector('.image-text-fallback')

  if (!textFallback) {
    textFallback = document.createElement('div')
    textFallback.className = 'image-text-fallback'
    textFallback.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #374151;
      color: #f3f4f6;
      font-weight: 600;
      font-size: 14px;
      text-align: center;
      padding: 10px;
      word-break: break-word;
    `
    container.appendChild(textFallback)
  }

  textFallback.textContent = event.target.alt || 'Product Image'
  textFallback.style.display = 'flex'
}
</script>

<style scoped>
@import '@/styles/products/ProductDetail.css';
</style>
