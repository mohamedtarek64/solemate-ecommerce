<template>
  <div class="admin-settings">
    <div class="relative flex size-full min-h-screen flex-col bg-[#1C1C1C] dark group/design-root overflow-x-hidden">
      <div class="flex flex-col lg:flex-row h-full grow">
        <!-- Sidebar -->
        <AdminSidebar />

        <!-- Main Content -->
        <main class="flex-1 p-6 md:p-8">
          <!-- Header -->
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <p class="text-white text-3xl font-bold">System Settings</p>
              <p class="text-gray-400">Configure your e-commerce platform settings</p>
            </div>
            <div class="flex gap-2">
              <button
                @click="saveSettings"
                :disabled="isLoading"
                class="flex items-center justify-center rounded-md h-10 px-4 bg-[#f97306] text-white text-sm font-medium hover:bg-[#e55a00] gap-2 disabled:opacity-50"
              >
                <span class="material-symbols-outlined" :class="{ 'animate-spin': isLoading }">save</span>
                <span class="truncate">{{ isLoading ? 'Saving...' : 'Save Changes' }}</span>
              </button>
              <button
                @click="resetSettings"
                class="flex items-center justify-center rounded-md h-10 px-4 bg-[#2C2C2C] text-white text-sm font-medium hover:bg-[#3A3A3A] gap-2"
              >
                <span class="material-symbols-outlined">refresh</span>
                <span class="truncate">Reset</span>
              </button>
            </div>
          </div>

          <!-- Settings Tabs -->
          <div class="bg-[#232323] p-6 rounded-md mb-8">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="[
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'bg-[#f97306] text-white'
                    : 'bg-[#2C2C2C] text-gray-300 hover:bg-[#3A3A3A]'
                ]"
              >
                <span class="material-symbols-outlined text-sm mr-2">{{ tab.icon }}</span>
                {{ tab.name }}
              </button>
            </div>
          </div>

          <!-- General Settings -->
          <div v-if="activeTab === 'general'" class="space-y-6">
            <div class="bg-[#232323] p-6 rounded-md">
              <h3 class="text-white text-xl font-bold mb-6">General Settings</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Store Name</label>
                  <input
                    v-model="settings.general.storeName"
                    type="text"
                    class="w-full px-3 py-2 bg-[#2C2C2C] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f97306]"
                    placeholder="Enter store name"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Store Email</label>
                  <input
                    v-model="settings.general.storeEmail"
                    type="email"
                    class="w-full px-3 py-2 bg-[#2C2C2C] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f97306]"
                    placeholder="Enter store email"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Store Phone</label>
                  <input
                    v-model="settings.general.storePhone"
                    type="tel"
                    class="w-full px-3 py-2 bg-[#2C2C2C] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f97306]"
                    placeholder="Enter store phone"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Currency</label>
                  <select
                    v-model="settings.general.currency"
                    class="w-full px-3 py-2 bg-[#2C2C2C] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#f97306]"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="EGP">EGP - Egyptian Pound</option>
                  </select>
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-300 mb-2">Store Description</label>
                  <textarea
                    v-model="settings.general.storeDescription"
                    rows="3"
                    class="w-full px-3 py-2 bg-[#2C2C2C] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f97306]"
                    placeholder="Enter store description"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Settings -->
          <div v-if="activeTab === 'payment'" class="space-y-6">
            <div class="bg-[#232323] p-6 rounded-md">
              <h3 class="text-white text-xl font-bold mb-6">Payment Settings</h3>
              <div class="space-y-6">
                <div>
                  <h4 class="text-white text-lg font-semibold mb-4">Payment Methods</h4>
                  <div class="space-y-3">
                    <label class="flex items-center gap-3 p-3 bg-[#2C2C2C] rounded-md cursor-pointer">
                      <input
                        v-model="settings.payment.methods.stripe"
                        type="checkbox"
                        class="w-4 h-4 text-[#f97306] bg-[#2C2C2C] border-gray-600 rounded focus:ring-[#f97306]"
                      />
                      <span class="material-symbols-outlined text-white">credit_card</span>
                      <span class="text-white">Stripe</span>
                    </label>
                    <label class="flex items-center gap-3 p-3 bg-[#2C2C2C] rounded-md cursor-pointer">
                      <input
                        v-model="settings.payment.methods.paypal"
                        type="checkbox"
                        class="w-4 h-4 text-[#f97306] bg-[#2C2C2C] border-gray-600 rounded focus:ring-[#f97306]"
                      />
                      <span class="material-symbols-outlined text-white">account_balance</span>
                      <span class="text-white">PayPal</span>
                    </label>
                    <label class="flex items-center gap-3 p-3 bg-[#2C2C2C] rounded-md cursor-pointer">
                      <input
                        v-model="settings.payment.methods.cashOnDelivery"
                        type="checkbox"
                        class="w-4 h-4 text-[#f97306] bg-[#2C2C2C] border-gray-600 rounded focus:ring-[#f97306]"
                      />
                      <span class="material-symbols-outlined text-white">local_atm</span>
                      <span class="text-white">Cash on Delivery</span>
                    </label>
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Tax Rate (%)</label>
                    <input
                      v-model="settings.payment.taxRate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      class="w-full px-3 py-2 bg-[#2C2C2C] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f97306]"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Shipping Cost</label>
                    <input
                      v-model="settings.payment.shippingCost"
                      type="number"
                      min="0"
                      step="0.01"
                      class="w-full px-3 py-2 bg-[#2C2C2C] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f97306]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Email Settings -->
          <div v-if="activeTab === 'email'" class="space-y-6">
            <div class="bg-[#232323] p-6 rounded-md">
              <h3 class="text-white text-xl font-bold mb-6">Email Settings</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">SMTP Host</label>
                  <input
                    v-model="settings.email.smtpHost"
                    type="text"
                    class="w-full px-3 py-2 bg-[#2C2C2C] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f97306]"
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">SMTP Port</label>
                  <input
                    v-model="settings.email.smtpPort"
                    type="number"
                    class="w-full px-3 py-2 bg-[#2C2C2C] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f97306]"
                    placeholder="587"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Email Username</label>
                  <input
                    v-model="settings.email.username"
                    type="email"
                    class="w-full px-3 py-2 bg-[#2C2C2C] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f97306]"
                    placeholder="your-email@gmail.com"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Email Password</label>
                  <input
                    v-model="settings.email.password"
                    type="password"
                    class="w-full px-3 py-2 bg-[#2C2C2C] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f97306]"
                    placeholder="Your email password"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Security Settings -->
          <div v-if="activeTab === 'security'" class="space-y-6">
            <div class="bg-[#232323] p-6 rounded-md">
              <h3 class="text-white text-xl font-bold mb-6">Security Settings</h3>
              <div class="space-y-6">
                <div>
                  <h4 class="text-white text-lg font-semibold mb-4">Password Requirements</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-300 mb-2">Minimum Length</label>
                      <input
                        v-model="settings.security.minPasswordLength"
                        type="number"
                        min="6"
                        max="20"
                        class="w-full px-3 py-2 bg-[#2C2C2C] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f97306]"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-300 mb-2">Session Timeout (minutes)</label>
                      <input
                        v-model="settings.security.sessionTimeout"
                        type="number"
                        min="5"
                        max="1440"
                        class="w-full px-3 py-2 bg-[#2C2C2C] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f97306]"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 class="text-white text-lg font-semibold mb-4">Security Features</h4>
                  <div class="space-y-3">
                    <label class="flex items-center gap-3 p-3 bg-[#2C2C2C] rounded-md cursor-pointer">
                      <input
                        v-model="settings.security.twoFactorAuth"
                        type="checkbox"
                        class="w-4 h-4 text-[#f97306] bg-[#2C2C2C] border-gray-600 rounded focus:ring-[#f97306]"
                      />
                      <span class="material-symbols-outlined text-white">security</span>
                      <span class="text-white">Enable Two-Factor Authentication</span>
                    </label>
                    <label class="flex items-center gap-3 p-3 bg-[#2C2C2C] rounded-md cursor-pointer">
                      <input
                        v-model="settings.security.loginNotifications"
                        type="checkbox"
                        class="w-4 h-4 text-[#f97306] bg-[#2C2C2C] border-gray-600 rounded focus:ring-[#f97306]"
                      />
                      <span class="material-symbols-outlined text-white">notifications</span>
                      <span class="text-white">Login Notifications</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import {
  useSettingsState,
  useSettingsData,
  useSettingsAPI,
  useSettingsActions,
  initializeSettings
} from '@/composables/admin/Settings.js'

// State
const {
  tabs,
  activeTab,
  isLoading,
  error
} = useSettingsState()

// Data
const { settings } = useSettingsData()

// API
const { saveSettings, loadSettings } = useSettingsAPI()

// Actions
const { resetSettings } = useSettingsActions()

// Initialize
const { onMounted: initSettings } = initializeSettings()

onMounted(() => {
  initSettings(loadSettings, settings)
})
</script>

<style scoped>
@import '@/styles/admin/Settings.css';
</style>
