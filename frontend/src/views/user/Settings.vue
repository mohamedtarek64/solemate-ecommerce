<template>
  <div class="relative flex size-full min-h-screen flex-col overflow-x-hidden">
    <!-- Header -->
    <SettingsHeader />

    <!-- Main Content -->
    <main class="container mx-auto flex-1 px-4 sm:px-6 lg:px-8 py-10">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <!-- Sidebar -->
        <SettingsSidebar @logout="handleLogout" />

        <!-- Main Content Area -->
        <div class="lg:col-span-3">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Settings Navigation -->
            <SettingsTabsNav :tabs="tabs" v-model:activeTab="activeTab" />

          <!-- Settings Content -->
          <div class="lg:col-span-2">
              <SettingsAccount
                v-if="activeTab === 'account'"
                :accountForm="accountForm"
                :isUpdating="isUpdating"
                @submit="updateAccountWrapper"
              />

              <SettingsSecurity
                v-if="activeTab === 'security'"
                :passwordForm="passwordForm"
                :isUpdating="isUpdating"
                @submit="updatePasswordWrapper"
              />

              <SettingsNotifications
                v-if="activeTab === 'notifications'"
                :notificationSettings="notificationSettings"
                :isUpdating="isUpdating"
                @save="updateNotificationsWrapper"
              />

              <SettingsPrivacy
                v-if="activeTab === 'privacy'"
                :privacySettings="privacySettings"
                :isUpdating="isUpdating"
                @save="updatePrivacyWrapper"
              />

              <SettingsDanger
                v-if="activeTab === 'danger'"
                @confirm-delete="confirmDeleteAccountWrapper"
                  />
                </div>
                </div>
              </div>
            </div>
    </main>

    <!-- Delete Account Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-[#231910] rounded-xl max-w-md w-full">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-red-500">Delete Account</h3>
            <button
              @click="showDeleteModal = false"
              class="text-[#ccaa8e] hover:text-white transition-colors"
            >
              <span class="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <div class="mb-6">
            <p class="text-[#ccaa8e] mb-4">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <p class="text-sm text-red-400">
              All your data, including orders, wishlist, and profile information will be permanently deleted.
            </p>
          </div>

          <div class="flex gap-3 justify-end">
            <button
              @click="showDeleteModal = false"
              class="px-4 py-2 text-[#ccaa8e] border border-[#4a3421] rounded-lg hover:bg-[#4a3421] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              @click="deleteAccountWrapper"
              class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Yes, Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useNotifications } from '@/composables/useNotifications'
import {
  useSettingsState,
  useSettingsAuth,
  useSettingsAPI,
  useSettingsActions,
  initializeSettings
} from '@/composables/user/Settings.js'
import ProfileDropdown from '@/components/ProfileDropdown.vue'
import SettingsHeader from '@/components/user/settings/SettingsHeader.vue'
import SettingsSidebar from '@/components/user/settings/SettingsSidebar.vue'
import SettingsTabsNav from '@/components/user/settings/SettingsTabsNav.vue'
import SettingsAccount from '@/components/user/settings/SettingsAccount.vue'
import SettingsSecurity from '@/components/user/settings/SettingsSecurity.vue'
import SettingsNotifications from '@/components/user/settings/SettingsNotifications.vue'
import SettingsPrivacy from '@/components/user/settings/SettingsPrivacy.vue'
import SettingsDanger from '@/components/user/settings/SettingsDanger.vue'

// State
const { activeTab, isUpdating, showDeleteModal, tabs, accountForm, passwordForm, notificationSettings, privacySettings } = useSettingsState()

// Auth
const { router, user, isAuthenticated, handleLogout, success, showError } = useSettingsAuth()

// API
const { loadUserData, updateAccount, updatePassword, updateNotifications, updatePrivacy, deleteAccount } = useSettingsAPI()

// Actions
const { confirmDeleteAccount } = useSettingsActions()

// Wrapper functions
const loadUserDataWrapper = () => loadUserData(isAuthenticated, router, accountForm)
const updateAccountWrapper = () => updateAccount(accountForm, isUpdating, success, showError)
const updatePasswordWrapper = () => updatePassword(passwordForm, isUpdating, success, showError)
const updateNotificationsWrapper = () => updateNotifications(notificationSettings, isUpdating, success, showError)
const updatePrivacyWrapper = () => updatePrivacy(privacySettings, isUpdating, success, showError)
const deleteAccountWrapper = () => deleteAccount(isUpdating, showDeleteModal, success, showError, handleLogout, router)
const confirmDeleteAccountWrapper = () => confirmDeleteAccount(isUpdating, showDeleteModal, success, showError, handleLogout, router)

// Initialize
const { onMounted: initSettings } = initializeSettings()

onMounted(async () => {
  await initSettings(isAuthenticated, router, loadUserDataWrapper, accountForm)
})
</script>

<style scoped>
@import '@/styles/user/Settings.css';
</style>
