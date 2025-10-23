<template>
  <div class="relative">
    <button
      @click="toggleProfileDropdown"
      class="flex items-center justify-center w-10 h-10 bg-orange-500 text-white hover:bg-orange-600 transition-all duration-300 rounded-full relative cursor-pointer"
      :title="user?.role === 'admin' ? 'Admin Dashboard' : 'User Profile'"
    >
      <span class="material-symbols-outlined text-lg">{{ user?.role === 'admin' ? 'admin_panel_settings' : 'person' }}</span>
      <!-- Admin indicator -->
      <div v-if="user?.role === 'admin'" class="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
    </button>

    <!-- Profile Dropdown Menu -->
    <div v-if="showProfileDropdown" class="profile-dropdown absolute right-0 top-16 w-64 bg-[#231910] border border-[#4a3421] rounded-lg shadow-xl z-[9999]">
      <!-- User Info Header -->
      <div class="px-4 py-3 border-b border-[#4a3421]">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-r from-[#d4a574] to-[#ccaa8e] rounded-full flex items-center justify-center">
            <span class="material-symbols-outlined text-[#231910] text-lg">{{ user?.role === 'admin' ? 'admin_panel_settings' : 'person' }}</span>
          </div>
          <div>
            <p class="text-white font-medium">{{ user?.name || user?.email || 'User' }}</p>
            <p class="text-[#ccaa8e] text-sm">{{ user?.role === 'admin' ? 'Administrator' : 'Customer' }}</p>
          </div>
        </div>
      </div>

      <!-- Menu Items -->
      <div class="py-2">
        <!-- Dashboard - Only show for Admin -->
        <router-link v-if="user?.role === 'admin'" to="/dashboard" @click="closeProfileDropdown" class="dropdown-item">
          <span class="material-symbols-outlined">dashboard</span>
          <span>Dashboard</span>
        </router-link>

        <!-- Profile -->
        <router-link to="/profile" @click="closeProfileDropdown" class="dropdown-item">
          <span class="material-symbols-outlined">person</span>
          <span>Profile</span>
        </router-link>

        <!-- Orders -->
        <router-link to="/orders" @click="closeProfileDropdown" class="dropdown-item">
          <span class="material-symbols-outlined">receipt_long</span>
          <span>Orders</span>
        </router-link>

        <!-- Wishlist -->
        <router-link to="/wishlist" @click="closeProfileDropdown" class="dropdown-item">
          <span class="material-symbols-outlined">favorite</span>
          <span>Wishlist</span>
        </router-link>

        <!-- Invoices -->
        <router-link to="/invoices" @click="closeProfileDropdown" class="dropdown-item">
          <span class="material-symbols-outlined">receipt</span>
          <span>Invoices</span>
        </router-link>

        <!-- Settings -->
        <router-link to="/settings" @click="closeProfileDropdown" class="dropdown-item">
          <span class="material-symbols-outlined">settings</span>
          <span>Settings</span>
        </router-link>

        <!-- Admin Panel - Only show for Admin (Removed as requested) -->
        <!-- Admin can access admin features through Dashboard -->
      </div>

      <!-- Logout -->
      <div class="border-t border-[#4a3421] py-2">
        <button @click="handleLogoutClick" class="dropdown-item logout-item">
          <span class="material-symbols-outlined">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { handleLogout } from '@/utils/authHelpers'
import { handleProfileClick } from '@/utils/profileHelpers'
import { useNotifications } from '@/composables/useNotifications'

const router = useRouter()
const { user, logout: authLogout } = useAuth()
const { success } = useNotifications()

// Profile dropdown state
const showProfileDropdown = ref(false)

// Profile dropdown functions
const toggleProfileDropdown = () => {
  showProfileDropdown.value = !showProfileDropdown.value
}

const closeProfileDropdown = () => {
  showProfileDropdown.value = false
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (showProfileDropdown.value && !event.target.closest('.relative')) {
    showProfileDropdown.value = false
  }
}

// Handle logout
const handleLogoutClick = async () => {
  await handleLogout(authLogout, success)
  closeProfileDropdown()
  router.push('/')
}

// Handle profile click
const handleProfileClickAction = () => {
  handleProfileClick(true, user, router)
  closeProfileDropdown()
}

// Add click outside listener
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Profile Dropdown Styles - Dark Theme */
.profile-dropdown {
  animation: slideDown 0.3s ease-out;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5), 0 0 30px rgba(212, 165, 116, 0.1);
}

.profile-dropdown::before {
  content: '';
  position: absolute;
  top: -8px;
  right: 20px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid #4a3421;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #ffffff;
  text-decoration: none;
  transition: all 0.2s ease;
  border-radius: 6px;
  margin: 2px 8px;
  cursor: pointer;
  border: none;
  background: transparent;
  width: calc(100% - 16px);
  font-size: 14px;
}

.dropdown-item:hover {
  background: linear-gradient(to right, rgba(212, 165, 116, 0.15), rgba(204, 170, 142, 0.15));
  color: #d4a574;
  transform: translateX(4px);
  border-left: 3px solid #d4a574;
  padding-left: 13px;
}

.dropdown-item .material-symbols-outlined {
  font-size: 20px;
  width: 20px;
  height: 20px;
  color: #ccaa8e;
  transition: color 0.2s ease;
}

.dropdown-item:hover .material-symbols-outlined {
  color: #d4a574;
}

.admin-item {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2));
  color: #10b981;
  margin: 4px 8px;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.admin-item .material-symbols-outlined {
  color: #10b981;
}

.admin-item:hover {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.3));
  color: #34d399;
  border-color: #10b981;
}

.admin-item:hover .material-symbols-outlined {
  color: #34d399;
}

.logout-item {
  color: #ef4444;
}

.logout-item .material-symbols-outlined {
  color: #ef4444;
}

.logout-item:hover {
  background: linear-gradient(to right, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.15));
  color: #f87171;
  border-left-color: #ef4444;
}

.logout-item:hover .material-symbols-outlined {
  color: #f87171;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .profile-dropdown {
    width: 280px;
    right: -10px;
  }
}

/* Smooth transitions */
.profile-dropdown * {
  transition: all 0.2s ease;
}
</style>
