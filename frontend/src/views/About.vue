<template>
  <div class="about-page">
    <!-- Navigation Header -->
    <header class="about-header">
      <div class="header-left">
        <router-link to="/" class="logo-section">
          <div class="logo-icon">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
            </svg>
          </div>
          <h2 class="logo-text">SoleMate</h2>
        </router-link>
        <div class="nav-links">
          <router-link to="/" class="nav-link">Home</router-link>
          <router-link to="/products?new=true" class="nav-link">New Arrivals</router-link>
          <router-link to="/products?category=men" class="nav-link">Men</router-link>
          <router-link to="/products?category=women" class="nav-link">Women</router-link>
          <router-link to="/products?category=kids" class="nav-link">Kids</router-link>
          <router-link to="/about" class="nav-link active">About</router-link>
          <router-link to="/contact" class="nav-link">Contact</router-link>
        </div>
      </div>
      <div class="header-right">
        <div class="search-container-wrapper">
          <SearchBar />
        </div>
        <div class="action-buttons">
          <router-link to="/wishlist" class="action-button" title="View Wishlist">
            <span class="material-symbols-outlined">favorite_border</span>
            <span v-if="wishlistCount > 0" class="cart-badge wishlist-badge">
              {{ wishlistCount > 99 ? '99+' : wishlistCount }}
            </span>
          </router-link>
          <button @click="openCart" class="action-button" title="View Cart">
            <span class="material-symbols-outlined">shopping_bag</span>
            <span v-if="cartCount > 0" class="cart-badge">
              {{ cartCount > 99 ? '99+' : cartCount }}
            </span>
          </button>
        </div>
        <ProfileDropdown />
      </div>
    </header>

    <!-- Hero Section -->
    <section class="about-hero">
      <div class="hero-background">
        <img
          src="https://assets.adidas.com/images/w_1880,f_auto,q_auto/32f939960439490da70e8fc81e3f5243_9366/IH4882_01_
          standard.jpg"
          alt="About SoleMate - Premium Footwear"
          class="hero-image"
        />
        <div class="hero-overlay"></div>
      </div>
      <div class="hero-content">
        <h1 class="hero-title">About SoleMate</h1>
        <p class="hero-subtitle">Your trusted partner in premium footwear since 2020</p>
      </div>
    </section>

    <!-- Main Content -->
    <div class="about-content">
      <!-- Our Story Section -->
      <section class="content-section story-section">
        <div class="section-container">
          <div class="section-grid">
            <div class="section-image">
              <img
                src="https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=1000"
                alt="Our Story"
                class="image-cover"
              />
            </div>
            <div class="section-text">
              <h2 class="section-title">Our Story</h2>
              <p class="section-description">
                Founded in 2020, SoleMate was born from a simple yet powerful idea: everyone deserves access to high-quality, stylish footwear that doesn't compromise on comfort or sustainability.
              </p>
              <p class="section-description">
                What started as a small online store has grown into a trusted destination for sneaker enthusiasts and casual shoppers alike. We've built our reputation on authenticity, quality, and exceptional customer service.
              </p>
              <p class="section-description">
                Today, we're proud to offer an extensive collection of premium footwear from the world's leading brands, all while maintaining our commitment to sustainable practices and ethical sourcing.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Our Mission Section -->
      <section class="content-section mission-section">
        <div class="section-container">
          <div class="section-grid reverse">
            <div class="section-text">
              <h2 class="section-title">Our Mission</h2>
              <p class="section-description">
                At SoleMate, our mission is to revolutionize the way people shop for footwear by combining cutting-edge technology with personalized service.
              </p>
              <div class="mission-points">
                <div class="mission-point">
                  <span class="mission-icon material-symbols-outlined">check_circle</span>
                  <div class="mission-text">
                    <h3>Quality First</h3>
                    <p>We partner only with authentic brands and verify every product for quality.</p>
                  </div>
                </div>
                <div class="mission-point">
                  <span class="mission-icon material-symbols-outlined">check_circle</span>
                  <div class="mission-text">
                    <h3>Customer-Centric</h3>
                    <p>Your satisfaction is our priority. We offer hassle-free returns and 24/7 support.</p>
                  </div>
                </div>
                <div class="mission-point">
                  <span class="mission-icon material-symbols-outlined">check_circle</span>
                  <div class="mission-text">
                    <h3>Sustainability</h3>
                    <p>We're committed to reducing our environmental impact through eco-friendly practices.</p>
                  </div>
                </div>
                <div class="mission-point">
                  <span class="mission-icon material-symbols-outlined">check_circle</span>
                  <div class="mission-text">
                    <h3>Innovation</h3>
                    <p>We continuously improve our platform to provide the best shopping experience.</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="section-image">
              <img
                src="https://images.unsplash.com/photo-1543508282-6319a3e2621f?q=80&w=1000"
                alt="Our Mission"
                class="image-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Our Values Section -->
      <section class="content-section values-section">
        <div class="section-container">
          <h2 class="section-title-center">Our Core Values</h2>
          <div class="values-grid">
            <div class="value-card">
              <div class="value-icon">
                <span class="material-symbols-outlined">verified</span>
              </div>
              <h3 class="value-title">Authenticity</h3>
              <p class="value-description">
                Every product we sell is 100% authentic, sourced directly from authorized distributors and verified by our team.
              </p>
            </div>
            <div class="value-card">
              <div class="value-icon">
                <span class="material-symbols-outlined">diversity_3</span>
              </div>
              <h3 class="value-title">Inclusivity</h3>
              <p class="value-description">
                We believe great footwear should be accessible to everyone, regardless of age, gender, or style preference.
              </p>
            </div>
            <div class="value-card">
              <div class="value-icon">
                <span class="material-symbols-outlined">eco</span>
              </div>
              <h3 class="value-title">Sustainability</h3>
              <p class="value-description">
                We're committed to reducing our carbon footprint through eco-friendly packaging and sustainable partnerships.
              </p>
            </div>
            <div class="value-card">
              <div class="value-icon">
                <span class="material-symbols-outlined">stars</span>
              </div>
              <h3 class="value-title">Excellence</h3>
              <p class="value-description">
                We strive for excellence in every aspect of our business, from product selection to customer service.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Statistics Section -->
      <section class="content-section stats-section">
        <div class="section-container">
          <div class="stats-grid">
            <div class="stat-card">
              <h3 class="stat-number">50K+</h3>
              <p class="stat-label">Happy Customers</p>
            </div>
            <div class="stat-card">
              <h3 class="stat-number">1000+</h3>
              <p class="stat-label">Premium Products</p>
            </div>
            <div class="stat-card">
              <h3 class="stat-number">25+</h3>
              <p class="stat-label">Top Brands</p>
            </div>
            <div class="stat-card">
              <h3 class="stat-number">98%</h3>
              <p class="stat-label">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Team Section -->
      <section class="content-section team-section">
        <div class="section-container">
          <h2 class="section-title-center">Meet Our Team</h2>
          <p class="section-subtitle-center">
            The passionate people behind SoleMate who work tirelessly to bring you the best footwear experience.
          </p>
          <div class="team-grid">
            <div class="team-card">
              <div class="team-image">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400"
                  alt="Team Member"
                />
              </div>
              <h3 class="team-name">John Anderson</h3>
              <p class="team-role">Founder & CEO</p>
            </div>
            <div class="team-card">
              <div class="team-image">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400"
                  alt="Team Member"
                />
              </div>
              <h3 class="team-name">Sarah Mitchell</h3>
              <p class="team-role">Head of Operations</p>
            </div>
            <div class="team-card">
              <div class="team-image">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400"
                  alt="Team Member"
                />
              </div>
              <h3 class="team-name">Michael Chen</h3>
              <p class="team-role">Product Manager</p>
            </div>
            <div class="team-card">
              <div class="team-image">
                <img
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400"
                  alt="Team Member"
                />
              </div>
              <h3 class="team-name">Emily Rodriguez</h3>
              <p class="team-role">Customer Success Lead</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="content-section cta-section">
        <div class="cta-container">
          <h2 class="cta-title">Ready to Find Your Perfect Pair?</h2>
          <p class="cta-description">
            Explore our collection of premium footwear and discover why thousands of customers trust SoleMate.
          </p>
          <div class="cta-buttons">
            <router-link to="/products" class="cta-button primary">
              Shop Now
              <span class="material-symbols-outlined">arrow_forward</span>
            </router-link>
            <router-link to="/contact" class="cta-button secondary">
              Contact Us
            </router-link>
          </div>
        </div>
      </section>
    </div>

    <!-- Footer -->
    <footer class="about-footer">
      <div class="footer-content">
        <div class="footer-section">
          <h3 class="footer-title">SoleMate</h3>
          <p class="footer-text">Your trusted partner in premium footwear.</p>
        </div>
        <div class="footer-section">
          <h4 class="footer-heading">Quick Links</h4>
          <router-link to="/" class="footer-link">Home</router-link>
          <router-link to="/products" class="footer-link">Shop</router-link>
          <router-link to="/about" class="footer-link">About</router-link>
          <router-link to="/contact" class="footer-link">Contact</router-link>
        </div>
        <div class="footer-section">
          <h4 class="footer-heading">Support</h4>
          <a href="#" class="footer-link">Help Center</a>
          <a href="#" class="footer-link">Returns</a>
          <a href="#" class="footer-link">Shipping Info</a>
          <a href="#" class="footer-link">Size Guide</a>
        </div>
        <div class="footer-section">
          <h4 class="footer-heading">Connect</h4>
          <div class="social-links">
            <a href="#" class="social-link">
              <span class="material-symbols-outlined">facebook</span>
            </a>
            <a href="#" class="social-link">
              <span class="material-symbols-outlined">instagram</span>
            </a>
            <a href="#" class="social-link">
              <span class="material-symbols-outlined">twitter</span>
            </a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2024 SoleMate. All rights reserved.</p>
      </div>
    </footer>

    <!-- Cart Sidebar -->
    <CartSidebar ref="cartSidebar" />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SearchBar from '@/components/search/SearchBar.vue'
import ProfileDropdown from '@/components/ProfileDropdown.vue'
import CartSidebar from '@/components/CartSidebar.vue'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'

export default {
  name: 'About',
  components: {
    SearchBar,
    ProfileDropdown,
    CartSidebar
  },
  setup() {
    const router = useRouter()
    const cartStore = useCartStore()
    const wishlistStore = useWishlistStore()
    const cartSidebar = ref(null)

    const cartCount = computed(() => cartStore.itemCount)
    const wishlistCount = computed(() => wishlistStore.items.length)

    const openCart = () => {
      if (cartSidebar.value) {
        cartSidebar.value.open()
      }
    }

    onMounted(() => {
      // Load cart and wishlist counts
      cartStore.loadCart()
      wishlistStore.loadWishlist()
    })

    return {
      cartCount,
      wishlistCount,
      openCart,
      cartSidebar
    }
  }
}
</script>

<style scoped src="@/assets/styles/about.css"></style>
