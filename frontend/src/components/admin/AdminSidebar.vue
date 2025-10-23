<template>
  <aside class="flex flex-col w-full lg:w-64 bg-[#232323] p-6 shrink-0 overflow-y-auto min-h-screen">
    <div class="flex flex-col gap-y-6">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 cursor-pointer" @click="goToHome">
          <div class="w-10 h-10 bg-gradient-to-br from-[#f97306] to-[#ff8c42] rounded-lg flex items-center justify-center shadow-lg logo-container">
            <span class="material-symbols-outlined text-white text-xl font-bold">home</span>
          </div>
          <h1 class="text-white text-xl font-bold leading-normal hover:text-[#f97306] transition-colors duration-200">SoleMate</h1>
        </div>
        <ProfileDropdown />
      </div>
      <nav ref="navRef" class="relative flex flex-col gap-2">
        <!-- Animated indicator with CSS transforms -->
        <div
          class="nav-indicator"
          :class="{ 'active': isActive(items[currentIndex]?.to) }"
        ></div>

        <router-link
          v-for="(item, idx) in items"
          :key="item.to"
          :to="item.to"
          ref="setItemRef"
          class="nav-item relative overflow-hidden"
          :class="{ 'active': isActive(item.to) }"
          @mouseenter="currentIndex = idx"
          @focus="currentIndex = idx"
          @mouseleave="currentIndex = getActiveIndex()"
        >
          <span class="material-symbols-outlined">{{ item.icon }}</span>
          <p class="text-sm font-medium leading-normal">{{ item.label }}</p>
          <!-- Hover effect overlay -->
          <div class="nav-item-overlay"></div>
        </router-link>
      </nav>

      <!-- Action Buttons Section -->
      <div class="mt-auto pt-6 border-t border-gray-700">
        <div class="flex flex-col gap-3">
          <!-- Add Product Button -->
          <button
            @click="addProduct"
            class="add-product-btn flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#f97306] to-[#ff8c42] hover:from-[#e55a00] hover:to-[#f97306] text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden group"
          >
            <span class="material-symbols-outlined text-lg relative z-10">add</span>
            <span class="text-sm font-semibold relative z-10">Add Product</span>
            <div class="btn-shine absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </button>

          <!-- Logout Button -->
          <button
            @click="showLogoutModal = true"
            class="logout-btn flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden group"
          >
            <span class="material-symbols-outlined text-lg relative z-10">logout</span>
            <span class="text-sm font-semibold relative z-10">Logout</span>
            <div class="btn-shine absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </button>
        </div>
      </div>
    </div>
  </aside>

  <!-- Logout Confirmation Modal -->
  <div v-if="showLogoutModal" class="logout-modal-overlay" @click="closeLogoutModal">
    <div class="logout-modal" @click.stop>
      <div class="logout-modal-header">
        <div class="logout-icon-container">
          <span class="material-symbols-outlined logout-icon">logout</span>
        </div>
        <h3 class="logout-modal-title">Confirm Logout</h3>
        <p class="logout-modal-message">Are you sure you want to logout? You will need to login again to access the admin panel.</p>
      </div>

      <div class="logout-modal-actions">
        <button @click="closeLogoutModal" class="logout-cancel-btn">
          <span class="material-symbols-outlined">close</span>
          Cancel
        </button>
        <button @click="confirmLogout" class="logout-confirm-btn">
          <span class="material-symbols-outlined">logout</span>
          Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref, watch, computed } from 'vue'
import ProfileDropdown from '@/components/ProfileDropdown.vue'

const route = useRoute()
const router = useRouter()

// items config
const items = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/admin/products', label: 'Products', icon: 'inventory_2' },
  { to: '/admin/orders', label: 'Orders', icon: 'receipt_long' },
  { to: '/admin/customers', label: 'Customers', icon: 'group' },
  { to: '/admin/analytics', label: 'Analytics', icon: 'analytics' },
  { to: '/admin/discount-codes', label: 'Discount Codes', icon: 'sell' },
  { to: '/admin/settings', label: 'Settings', icon: 'settings' },
]

// current index for animation
const currentIndex = ref(0)

// logout modal state
const showLogoutModal = ref(false)

// active helpers
const isActive = (path) => route.path.startsWith(path)
const getActiveIndex = () => items.findIndex(item => isActive(item.to))

// update current index when route changes
watch(() => route.path, () => {
  currentIndex.value = getActiveIndex()
})

// Go to Home function
const goToHome = () => {
  router.push('/')
}

// Add Product function
const addProduct = () => {
  router.push('/admin/products')
  // Emit event to parent component to open add product modal
  setTimeout(() => {
    const event = new CustomEvent('openAddProductModal')
    window.dispatchEvent(event)
  }, 100)
}

// Logout modal functions
const closeLogoutModal = () => {
  showLogoutModal.value = false
}

const confirmLogout = () => {
  // Clear authentication data
  localStorage.removeItem('auth_token')
  localStorage.removeItem('token')
  localStorage.removeItem('user')

  // Close modal
  showLogoutModal.value = false

  // Redirect to login page
  router.push('/login')
}

onMounted(() => {
  currentIndex.value = getActiveIndex()
})
</script>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24
}

/* Navigation indicator with smooth CSS animation */
.nav-indicator {
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 44px;
  background: linear-gradient(135deg, #f97306 0%, #ff8c42 100%);
  border-radius: 0 4px 4px 0;
  transform: translateY(0);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
  box-shadow: 0 2px 8px rgba(249, 115, 6, 0.3);
}

.nav-indicator.active {
  transform: translateY(var(--indicator-y, 0));
  box-shadow: 0 4px 12px rgba(249, 115, 6, 0.5);
}

/* Navigation items */
.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin: 2px 0;
  border-radius: 8px;
  color: #9ca3af;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  overflow: hidden;
}

.nav-item:hover {
  color: #ffffff;
  background: rgba(58, 58, 58, 0.6);
  transform: translateX(4px);
}

.nav-item.active {
  color: #ffffff;
  background: rgba(249, 115, 6, 0.15);
  transform: translateX(8px);
}

.nav-item.active .material-symbols-outlined {
  color: #f97306;
  transform: scale(1.1);
}

/* Hover overlay effect */
.nav-item-overlay {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(249, 115, 6, 0.1), transparent);
  transition: left 0.6s ease;
}

.nav-item:hover .nav-item-overlay {
  left: 100%;
}

/* Icon animations */
.nav-item .material-symbols-outlined {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 20px;
}

.nav-item:hover .material-symbols-outlined {
  transform: scale(1.15) rotate(5deg);
  color: #f97306;
}

.nav-item.active .material-symbols-outlined {
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1.1);
    filter: brightness(1);
  }
  50% {
    transform: scale(1.2);
    filter: brightness(1.2);
  }
}

/* Text animations */
.nav-item p {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
}

.nav-item:hover p {
  font-weight: 600;
  letter-spacing: 0.025em;
}

.nav-item.active p {
  font-weight: 700;
  color: #f97306;
}

/* Action Buttons Styling */
.add-product-btn,
.logout-btn {
  position: relative;
  border: 2px solid transparent;
  box-shadow:
    0 4px 15px rgba(0, 0, 0, 0.2),
    0 0 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.add-product-btn::before,
.logout-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent);
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.add-product-btn:hover::before,
.logout-btn:hover::before {
  opacity: 1;
}

.add-product-btn:hover,
.logout-btn:hover {
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow:
    0 8px 25px rgba(0, 0, 0, 0.3),
    0 0 30px rgba(0, 0, 0, 0.15);
}

.add-product-btn:active,
.logout-btn:active {
  transform: translateY(1px) scale(1.02);
  box-shadow:
    0 4px 15px rgba(0, 0, 0, 0.2),
    0 0 20px rgba(0, 0, 0, 0.1);
}

/* Button Shine Effect */
.btn-shine {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(
    110deg,
    transparent 25%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 75%
  );
}

/* Icon animations for buttons */
.add-product-btn .material-symbols-outlined,
.logout-btn .material-symbols-outlined {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.add-product-btn:hover .material-symbols-outlined {
  transform: scale(1.1) rotate(90deg);
}

.logout-btn:hover .material-symbols-outlined {
  transform: scale(1.1) rotate(-90deg);
}

/* Pulse animation for active buttons */
@keyframes buttonPulse {
  0%, 100% {
    box-shadow:
      0 4px 15px rgba(0, 0, 0, 0.2),
      0 0 20px rgba(0, 0, 0, 0.1);
  }
  50% {
    box-shadow:
      0 4px 15px rgba(0, 0, 0, 0.3),
      0 0 25px rgba(0, 0, 0, 0.15);
  }
}

.add-product-btn:hover {
  animation: buttonPulse 2s ease-in-out infinite;
}

.logout-btn:hover {
  animation: buttonPulse 2s ease-in-out infinite;
}

/* Logout Modal Styles */
.logout-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: modalFadeIn 0.3s ease-out;
}

.logout-modal {
  background: linear-gradient(135deg, #2a2a2a 0%, #1e1e1e 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 32px;
  max-width: 420px;
  width: 90%;
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  animation: modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.logout-modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #f97306, #ff8c42, #f97306);
  background-size: 200% 100%;
  animation: shimmer 3s ease-in-out infinite;
}

.logout-modal-header {
  text-align: center;
  margin-bottom: 24px;
}

.logout-icon-container {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow:
    0 8px 20px rgba(220, 38, 38, 0.3),
    0 0 0 4px rgba(220, 38, 38, 0.1);
}

.logout-icon-container::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: linear-gradient(45deg, #dc2626, #ef4444, #dc2626);
  z-index: -1;
  animation: iconPulse 2s ease-in-out infinite;
}

.logout-icon {
  font-size: 36px;
  color: white;
  animation: iconRotate 0.8s ease-out;
}

.logout-modal-title {
  color: #ffffff;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #ffffff 0%, #f97306 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logout-modal-message {
  color: #a1a1aa;
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
}

.logout-modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.logout-cancel-btn,
.logout-confirm-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  min-width: 120px;
  justify-content: center;
}

.logout-cancel-btn {
  background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-cancel-btn:hover {
  background: linear-gradient(135deg, #4b5563 0%, #6b7280 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(75, 85, 99, 0.3);
}

.logout-confirm-btn {
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
  color: #ffffff;
  border: 1px solid rgba(220, 38, 38, 0.3);
}

.logout-confirm-btn:hover {
  background: linear-gradient(135deg, #b91c1c 0%, #dc2626 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(220, 38, 38, 0.4);
}

.logout-confirm-btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.logout-cancel-btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(75, 85, 99, 0.2);
}

/* Modal Animations */
@keyframes modalFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes iconRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes iconPulse {
  0%, 100% {
    opacity: 0.8;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Responsive Design */
@media (max-width: 480px) {
  .logout-modal {
    margin: 20px;
    padding: 24px;
    max-width: none;
  }

  .logout-modal-actions {
    flex-direction: column;
  }

  .logout-cancel-btn,
  .logout-confirm-btn {
    width: 100%;
  }
}

/* Dynamic indicator positioning */
.nav-item:nth-child(1) { --indicator-y: 0px; }
.nav-item:nth-child(2) { --indicator-y: 48px; }
.nav-item:nth-child(3) { --indicator-y: 96px; }
.nav-item:nth-child(4) { --indicator-y: 144px; }
.nav-item:nth-child(5) { --indicator-y: 192px; }
.nav-item:nth-child(6) { --indicator-y: 240px; }
.nav-item:nth-child(7) { --indicator-y: 288px; }
.nav-item:nth-child(8) { --indicator-y: 336px; }

/* Logo styling */
.logo-container {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo-container:hover {
  transform: scale(1.05) rotate(5deg);
  box-shadow: 0 8px 20px rgba(249, 115, 6, 0.3);
}

.logo-container .material-symbols-outlined {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo-container:hover .material-symbols-outlined {
  transform: scale(1.1);
  filter: brightness(1.2);
}

/* Logo container hover effect */
.logo-container:hover {
  background: linear-gradient(135deg, #ff8c42 0%, #f97306 100%);
}

/* Logo text hover effect */
.cursor-pointer:hover h1 {
  color: #f97306 !important;
}
</style>
