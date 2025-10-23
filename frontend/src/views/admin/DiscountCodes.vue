<template>
  <div class="admin-dashboard">
    <div class="relative flex size-full min-h-screen flex-col bg-[#1C1C1C] dark group/design-root overflow-x-hidden">
      <div class="flex flex-col lg:flex-row h-full grow">
        
        <!-- Admin Sidebar Component -->
        <AdminSidebar />

        <!-- Main Content -->
        <main class="flex-1 p-6 md:p-8">
          
          <!-- Header -->
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <p class="text-white text-3xl font-bold">Discount Codes</p>
              <p class="text-gray-400">Create and manage promotional codes</p>
            </div>
            <div class="flex gap-2">
              <button
                v-if="!isLoggedIn"
                @click="quickLogin"
                class="flex items-center justify-center rounded-md h-10 px-4 bg-green-600 text-white text-sm font-medium hover:bg-green-700 gap-2 transition-all"
              >
                <i class="fas fa-key"></i>
                <span>Quick Login</span>
              </button>
          <button
                @click="loadCodes"
            :disabled="loading"
                class="flex items-center justify-center rounded-md h-10 px-4 bg-[#2C2C2C] text-white text-sm font-medium hover:bg-[#3A3A3A] gap-2 disabled:opacity-50 transition-all"
          >
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
                <span>{{ loading ? 'Loading...' : 'Refresh' }}</span>
          </button>
              <button
                @click="exportDiscountCodes"
                class="flex items-center justify-center rounded-md h-10 px-4 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 gap-2 transition-all hover:shadow-lg"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <span>Export</span>
          </button>
              <button
                @click="openCreate"
                class="flex items-center justify-center rounded-md h-10 px-4 bg-[#f97306] text-white text-sm font-medium hover:bg-[#e06500] gap-2 transition-all hover:shadow-lg"
              >
                <i class="fas fa-plus-circle"></i>
                <span>Add New Code</span>
              </button>
            </div>
          </div>

          <!-- Stats Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-[#232323] rounded-xl p-6 border border-[#3A3A3A] hover:border-[#f97306] transition-all">
              <div class="flex items-center justify-between mb-2">
                <span class="text-gray-400 text-sm font-medium">Total Codes</span>
                <i class="fas fa-tags text-[#f97306] text-xl"></i>
            </div>
              <p class="text-white text-3xl font-bold">{{ totalCodes }}</p>
          </div>

            <div class="bg-[#232323] rounded-xl p-6 border border-[#3A3A3A] hover:border-green-500 transition-all">
              <div class="flex items-center justify-between mb-2">
                <span class="text-gray-400 text-sm font-medium">Active Codes</span>
                <i class="fas fa-check-circle text-green-500 text-xl"></i>
            </div>
              <p class="text-white text-3xl font-bold">{{ activeCodes }}</p>
          </div>

            <div class="bg-[#232323] rounded-xl p-6 border border-[#3A3A3A] hover:border-red-500 transition-all">
              <div class="flex items-center justify-between mb-2">
                <span class="text-gray-400 text-sm font-medium">Expired</span>
                <i class="fas fa-times-circle text-red-500 text-xl"></i>
            </div>
              <p class="text-white text-3xl font-bold">{{ expiredCodes }}</p>
            </div>
            
            <div class="bg-[#232323] rounded-xl p-6 border border-[#3A3A3A] hover:border-blue-500 transition-all">
              <div class="flex items-center justify-between mb-2">
                <span class="text-gray-400 text-sm font-medium">Total Usage</span>
                <i class="fas fa-chart-line text-blue-500 text-xl"></i>
              </div>
              <p class="text-white text-3xl font-bold">{{ totalUsage }}</p>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="discount-codes-grid">
            <div v-for="i in 4" :key="i" class="code-card">
              <div class="h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
              <div class="h-6 bg-gray-700 rounded animate-pulse"></div>
              </div>
              </div>

          <!-- Error -->
          <div v-else-if="error" class="p-4 bg-red-900/20 border border-red-500 text-red-300 rounded-lg">
            <i class="fas fa-exclamation-circle"></i> {{ error }}
          </div>

          <!-- Codes Grid -->
          <div v-else class="discount-codes-grid">
            <div v-for="code in discountCodes" :key="code.id" class="code-card">
              <div class="code-header">
                <div class="code-title">{{ code.code }}</div>
                <span :class="['status-badge', code.is_active ? 'active' : 'inactive']">
                  {{ code.is_active ? 'Active' : 'Inactive' }}
                </span>
                      </div>
              <div class="code-body">
                <p class="code-name">{{ code.name }}</p>
                <p class="code-description">{{ code.description }}</p>
                <div class="code-details">
                  <span class="detail-item">
                    <i class="fas fa-percent"></i>
                    {{ code.type === 'percentage' ? code.value + '%' : '$' + code.value }}
                      </span>
                  <span class="detail-item">
                    <i class="fas fa-users"></i>
                    {{ code.used_count || 0 }}/{{ code.usage_limit }}
                      </span>
                </div>
              </div>
              
              <!-- Enhanced Actions -->
              <div class="flex gap-3 pt-4 border-t border-[#3A3A3A] mt-3">
                        <button
                  @click="copyCode(code.code)" 
                  class="group relative flex-1 py-2.5 px-4 rounded-lg bg-[#2C2C2C] hover:bg-green-500/20 border border-[#3A3A3A] hover:border-green-500 transition-all duration-200 hover:scale-105"
                  title="Copy Code"
                >
                  <i class="fas fa-copy text-xl group-hover:text-green-400 text-gray-300 transition-colors mr-2"></i>
                  <span class="text-sm font-medium text-gray-300 group-hover:text-green-400 transition-colors">Copy</span>
                  <div class="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                    Copy to Clipboard
                          </div>
                        </button>
                
                        <button
                  @click="openEdit(code)" 
                  class="group relative flex-1 py-2.5 px-4 rounded-lg bg-[#2C2C2C] hover:bg-[#f97306]/20 border border-[#3A3A3A] hover:border-[#f97306] transition-all duration-200 hover:scale-105"
                          title="Edit Code"
                        >
                  <i class="fas fa-edit text-xl group-hover:text-[#f97306] text-gray-300 transition-colors mr-2"></i>
                  <span class="text-sm font-medium text-gray-300 group-hover:text-[#f97306] transition-colors">Edit</span>
                  <div class="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                    Edit Discount Code
                          </div>
                        </button>
                
                        <button
                  @click="askDelete(code.id)" 
                  class="group relative flex-1 py-2.5 px-4 rounded-lg bg-[#2C2C2C] hover:bg-red-500/20 border border-[#3A3A3A] hover:border-red-500 transition-all duration-200 hover:scale-105"
                          title="Delete Code"
                        >
                  <i class="fas fa-trash text-xl group-hover:text-red-400 text-gray-300 transition-colors mr-2"></i>
                  <span class="text-sm font-medium text-gray-300 group-hover:text-red-400 transition-colors">Delete</span>
                  <div class="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                    Delete Permanently
                          </div>
                        </button>
                      </div>
              </div>

            <!-- Empty State -->
            <div v-if="discountCodes.length === 0" class="col-span-full text-center py-12">
              <i class="fas fa-tags text-6xl text-gray-700 mb-4"></i>
              <p class="text-xl text-gray-400 mb-4">No discount codes yet</p>
              <button @click="openCreate" class="px-6 py-3 bg-[#f97306] hover:bg-[#e06500] text-white rounded-lg font-medium transition-all inline-flex items-center gap-2">
                <i class="fas fa-plus-circle"></i>
                Create First Code
              </button>
            </div>
          </div>

          <!-- Create/Edit Modal -->
          <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div class="bg-[#232323] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" @click.stop>
              
              <div class="flex justify-between items-center p-6 border-b border-[#3A3A3A]">
                <h3 class="text-white text-xl font-bold flex items-center gap-3">
                  <i class="fas fa-plus-circle text-[#f97306]"></i>
                  {{ isEditing ? 'Edit Discount Code' : 'Create Discount Code' }}
                </h3>
                <button @click="closeModal" class="text-gray-400 hover:text-white text-2xl transition-colors">
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <form @submit.prevent="submit" class="p-6">
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <!-- Code -->
                  <div>
                    <label class="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <i class="fas fa-tag text-[#f97306]"></i>
                      Discount Code
                    </label>
                    <input
                    v-model="formData.code"
                      type="text"
                      class="w-full px-3 py-2 bg-[#2C2C2C] border border-[#3A3A3A] rounded-md text-white placeholder-gray-400 focus:border-[#f97306] focus:outline-none"
                      placeholder="e.g., SUMMER2025"
                      required
                    />
                  </div>

                  <!-- Name -->
                  <div>
                    <label class="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <i class="fas fa-signature text-[#f97306]"></i>
                      Name
                    </label>
                    <input
                      v-model="formData.name"
                      type="text"
                      class="w-full px-3 py-2 bg-[#2C2C2C] border border-[#3A3A3A] rounded-md text-white placeholder-gray-400 focus:border-[#f97306] focus:outline-none"
                      placeholder="e.g., Summer Sale"
                      required
                    />
                  </div>

                  <!-- Description -->
                  <div class="md:col-span-2">
                    <label class="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <i class="fas fa-align-left text-[#f97306]"></i>
                      Description
                    </label>
                    <textarea
                    v-model="formData.description"
                      class="w-full px-3 py-2 bg-[#2C2C2C] border border-[#3A3A3A] rounded-md text-white placeholder-gray-400 focus:border-[#f97306] focus:outline-none resize-none"
                      placeholder="Describe the offer..."
                      rows="3"
                    required
                    ></textarea>
                  </div>

                  <!-- Type -->
                  <div>
                    <label class="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <i class="fas fa-sliders-h text-[#f97306]"></i>
                      Type
                    </label>
                    <select v-model="formData.type" class="w-full px-3 py-2 bg-[#2C2C2C] border border-[#3A3A3A] rounded-md text-white focus:border-[#f97306] focus:outline-none" required>
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                    </select>
                  </div>

                  <!-- Value -->
                  <div>
                    <label class="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <i class="fas fa-dollar-sign text-[#f97306]"></i>
                      Value
                    </label>
                    <input
                      v-model.number="formData.value"
                      type="number"
                      class="w-full px-3 py-2 bg-[#2C2C2C] border border-[#3A3A3A] rounded-md text-white placeholder-gray-400 focus:border-[#f97306] focus:outline-none"
                      :placeholder="formData.type === 'percentage' ? '10' : '20.00'"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <!-- Min Amount -->
                  <div>
                    <label class="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <i class="fas fa-shopping-cart text-[#f97306]"></i>
                      Minimum Amount
                    </label>
                    <input
                      v-model.number="formData.minimum_amount"
                      type="number"
                      class="w-full px-3 py-2 bg-[#2C2C2C] border border-[#3A3A3A] rounded-md text-white placeholder-gray-400 focus:border-[#f97306] focus:outline-none"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    required
                    />
                  </div>

                  <!-- Usage Limit -->
                  <div>
                    <label class="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <i class="fas fa-hashtag text-[#f97306]"></i>
                      Usage Limit
                    </label>
                    <input
                      v-model.number="formData.usage_limit"
                      type="number"
                      class="w-full px-3 py-2 bg-[#2C2C2C] border border-[#3A3A3A] rounded-md text-white placeholder-gray-400 focus:border-[#f97306] focus:outline-none"
                      placeholder="100"
                      min="1"
                    required
                    />
                  </div>
                </div>

                <!-- Quick Presets -->
                <div class="mt-6 p-4 bg-[#2C2C2C]/50 border border-[#f97306]/20 rounded-lg">
                  <label class="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <i class="fas fa-bolt text-[#f97306]"></i>
                    Quick Presets
                  </label>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <button type="button" @click="setPreset(7)" class="px-3 py-2 bg-[#2C2C2C] hover:bg-[#f97306] border border-[#3A3A3A] hover:border-[#f97306] rounded-md text-white text-sm transition-all flex flex-col items-center gap-1">
                      <i class="fas fa-calendar-week"></i>
                      <span>1 Week</span>
                    </button>
                    <button type="button" @click="setPreset(30)" class="px-3 py-2 bg-[#2C2C2C] hover:bg-[#f97306] border border-[#3A3A3A] hover:border-[#f97306] rounded-md text-white text-sm transition-all flex flex-col items-center gap-1">
                      <i class="fas fa-calendar-alt"></i>
                      <span>1 Month</span>
                    </button>
                    <button type="button" @click="setPreset(90)" class="px-3 py-2 bg-[#2C2C2C] hover:bg-[#f97306] border border-[#3A3A3A] hover:border-[#f97306] rounded-md text-white text-sm transition-all flex flex-col items-center gap-1">
                      <i class="fas fa-calendar"></i>
                      <span>3 Months</span>
                    </button>
                    <button type="button" @click="setPreset(365)" class="px-3 py-2 bg-[#2C2C2C] hover:bg-[#f97306] border border-[#3A3A3A] hover:border-[#f97306] rounded-md text-white text-sm transition-all flex flex-col items-center gap-1">
                      <i class="fas fa-calendar-check"></i>
                      <span>1 Year</span>
                    </button>
                  </div>
                </div>

                <!-- Dates -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label class="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <i class="fas fa-calendar-start text-[#f97306]"></i>
                      Start Date & Time
                    </label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fas fa-calendar text-[#f97306]"></i>
                      </div>
                    <input
                    v-model="formData.starts_at"
                      type="datetime-local"
                        class="w-full pl-10 pr-3 py-3 bg-[#2C2C2C] border-2 border-[#3A3A3A] rounded-lg text-white focus:border-[#f97306] focus:outline-none transition-all"
                    required
                    />
                  </div>
                    <small class="mt-1 text-xs text-gray-500 flex items-center gap-1">
                      <i class="fas fa-info-circle"></i> When it becomes active
                    </small>
                </div>

                  <div>
                    <label class="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <i class="fas fa-calendar-times text-[#f97306]"></i>
                      Expiration Date & Time
                    </label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fas fa-calendar-check text-red-500"></i>
                      </div>
                    <input
                    v-model="formData.expires_at"
                      type="datetime-local"
                        class="w-full pl-10 pr-3 py-3 bg-[#2C2C2C] border-2 border-[#3A3A3A] rounded-lg text-white focus:border-[#f97306] focus:outline-none transition-all"
                    required
                    />
                  </div>
                    <small class="mt-1 text-xs text-gray-500 flex items-center gap-1">
                      <i class="fas fa-info-circle"></i> When it expires
                    </small>
                  </div>
                </div>

                <!-- Duration -->
                <div v-if="duration" class="mt-4 p-3 bg-[#f97306]/10 border border-[#f97306]/30 rounded-lg flex items-center gap-2">
                  <i class="fas fa-clock text-[#f97306]"></i>
                  <span class="text-white font-medium">Duration: {{ duration }}</span>
                </div>

                <!-- Actions -->
                <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-[#3A3A3A]">
                  <button
                    type="button"
                    @click="closeModal"
                    class="px-6 py-2.5 bg-[#2C2C2C] text-white rounded-lg hover:bg-[#3A3A3A] transition-colors flex items-center gap-2 font-medium"
                    :disabled="saving"
                  >
                    <i class="fas fa-times"></i>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="px-6 py-2.5 bg-[#f97306] text-white rounded-lg hover:bg-[#e06500] transition-all flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    :disabled="saving || !valid"
                  >
                    <i v-if="saving" class="fas fa-spinner fa-spin"></i>
                    <i v-else class="fas fa-check-circle"></i>
                    <span>{{ saving ? 'Saving...' : (isEditing ? 'Update' : 'Create Code') }}</span>
                  </button>
                </div>

              </form>
            </div>
          </div>

          <!-- Delete Confirmation -->
          <div v-if="showConfirmModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div class="bg-[#232323] rounded-xl w-full max-w-md p-6 shadow-2xl" @click.stop>
                <div class="flex items-center gap-4 mb-6">
                  <div class="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                  <i class="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
                  </div>
                  <div>
                  <h3 class="text-white text-xl font-bold">Confirm Delete</h3>
                    <p class="text-gray-400 text-sm">This action cannot be undone</p>
                  </div>
                </div>
              <p class="text-gray-300 mb-6">Are you sure you want to delete this discount code? This will permanently remove it from your system.</p>
                <div class="flex gap-3">
                <button @click="cancelDelete" class="flex-1 px-4 py-2.5 bg-[#2C2C2C] text-white rounded-lg hover:bg-[#3A3A3A] transition-colors font-medium">
                    Cancel
                  </button>
                <button @click="confirmDelete" class="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                  Delete
                  </button>
                </div>
                  </div>
                </div>

        </main>
                </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'

// Configuration
const API = 'http://127.0.0.1:8000/api'

// State
const discountCodes = ref([])
const loading = ref(false)
const error = ref(null)
const showModal = ref(false)
const showConfirmModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const toDelete = ref(null)

const formData = ref({
  code: '',
  name: '',
  description: '',
  type: 'percentage',
  value: 10,
  minimum_amount: 0,
  usage_limit: 100,
  starts_at: new Date().toISOString().slice(0, 16),
  expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  is_active: true
})

// Computed
const isLoggedIn = computed(() => !!localStorage.getItem('auth_token'))

const valid = computed(() => {
  const d = formData.value
  return !!(
    d.code?.trim() &&
    d.name?.trim() &&
    d.description?.trim() &&
    d.type &&
    d.value > 0 &&
    d.minimum_amount >= 0 &&
    d.usage_limit > 0 &&
    d.starts_at &&
    d.expires_at &&
    new Date(d.expires_at) > new Date(d.starts_at)
  )
})

const duration = computed(() => {
  const start = formData.value.starts_at
  const end = formData.value.expires_at
  if (!start || !end) return null
  
  const diff = new Date(end) - new Date(start)
  if (diff < 0) return 'Invalid'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days === 0) return `${hours}h`
  return `${days} day${days > 1 ? 's' : ''}` + (hours > 0 ? ` ${hours}h` : '')
})

// Stats
const totalCodes = computed(() => discountCodes.value.length)

const activeCodes = computed(() => {
  const now = new Date()
  return discountCodes.value.filter(code => {
    const expires = code.expires_at ? new Date(code.expires_at) : null
    return code.is_active && (!expires || expires > now)
  }).length
})

const expiredCodes = computed(() => {
  const now = new Date()
  return discountCodes.value.filter(code => {
    const expires = code.expires_at ? new Date(code.expires_at) : null
    return expires && expires <= now
  }).length
})

const totalUsage = computed(() => {
  return discountCodes.value.reduce((sum, code) => sum + (code.used_count || 0), 0)
})

// Methods
const toast = (msg, type = 'success') => {
  const el = document.createElement('div')
  el.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i><span>${msg}</span>`
  el.style.cssText = `position:fixed;top:20px;right:20px;padding:1rem 1.5rem;background:${type === 'success' ? '#10b981' : '#ef4444'};color:white;border-radius:0.5rem;box-shadow:0 4px 6px rgba(0,0,0,0.1);z-index:10000;display:flex;align-items:center;gap:0.75rem;font-weight:500;animation:slideIn 0.3s`
  document.body.appendChild(el)
  setTimeout(() => { el.style.animation = 'slideOut 0.3s'; setTimeout(() => el.remove(), 300) }, 3000)
}

const loadCodes = async () => {
  try {
    loading.value = true
    error.value = null
    
    const token = localStorage.getItem('auth_token')
    const res = await fetch(`${API}/admin/discount-codes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    const data = await res.json()
    
    if (data.success) {
      discountCodes.value = data.data || []
      } else {
      throw new Error(data.message)
    }
  } catch (err) {
    error.value = err.message
    console.error('❌', err)
    toast('Failed to load codes', 'error')
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  formData.value = {
    code: '',
    name: '',
    description: '',
    type: 'percentage',
    value: 10,
    minimum_amount: 0,
    usage_limit: 100,
    starts_at: new Date().toISOString().slice(0, 16),
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    is_active: true
  }
  isEditing.value = false
  showModal.value = true
}

const openEdit = (code) => {
  formData.value = { ...code }
  isEditing.value = true
  showModal.value = true
  
  }

const closeModal = () => {
  showModal.value = false
  isEditing.value = false
}

const setPreset = (days) => {
  const now = new Date()
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
  formData.value.starts_at = now.toISOString().slice(0, 16)
  formData.value.expires_at = future.toISOString().slice(0, 16)
  toast(`Set to ${days} days`)
}

const submit = async () => {
  if (saving.value) {
    return
  }
  
  if (!valid.value) {
    toast('Please fill all fields correctly', 'error')
    return
  }
  
  try {
    saving.value = true
    const token = localStorage.getItem('auth_token')
    
    if (!token) {
      throw new Error('Please login first')
    }

    const url = isEditing.value 
      ? `${API}/admin/discount-codes/${formData.value.id}`
      : `${API}/admin/discount-codes`
    
    const res = await fetch(url, {
      method: isEditing.value ? 'PUT' : 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(formData.value)
    })

    const result = await res.json()
    if (!res.ok) {
      throw new Error(result.message || `HTTP ${res.status}`)
    }

    if (isEditing.value) {
      // ✅ Optimistic update - update in UI immediately
      const index = discountCodes.value.findIndex(c => c.id === formData.value.id)
      if (index !== -1) {
        discountCodes.value[index] = { ...discountCodes.value[index], ...formData.value }
        }
    } else {
      // ✅ Optimistic update - add to UI immediately
      if (result.data) {
        discountCodes.value.unshift(result.data)
        }
    }

    toast(isEditing.value ? 'Updated!' : 'Created!', 'success')
    closeModal()
    
    // ✅ Background reload for data consistency
    setTimeout(() => {
      loadCodes()
    }, 100)
    
    } catch (err) {
    console.error('❌ Error:', err)
    toast(err.message || 'Failed', 'error')
  } finally {
    saving.value = false
  }
}

const copyCode = async (code) => {
  try {
    await navigator.clipboard.writeText(code)
    toast('Copied!')
  } catch {
    toast('Failed to copy', 'error')
  }
}

const askDelete = (id) => {
  toDelete.value = id
  showConfirmModal.value = true
}

const cancelDelete = () => {
  showConfirmModal.value = false
  toDelete.value = null
}

const confirmDelete = async () => {
  try {
    const token = localStorage.getItem('auth_token')
    const res = await fetch(`${API}/admin/discount-codes/${toDelete.value}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    // Handle 404 - code already deleted
    if (res.status === 404) {
      console.warn(`Discount code ${toDelete.value} not found (already deleted)`)
      toast('Code already deleted, refreshing list...', 'success')
      await loadCodes()
      cancelDelete()
      return
    }

    const result = await res.json()

    if (result.success) {
      toast('✅ Deleted successfully!', 'success')
      await loadCodes()
    } else {
      throw new Error(result.message || 'Failed to delete')
    }
  } catch (err) {
    console.error('Delete error:', err)
    toast(`❌ ${err.message || 'Failed to delete'}`, 'error')
  } finally {
    cancelDelete()
  }
}

const quickLogin = async () => {
  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'password'
      })
    })

    const data = await res.json()

    if (data.success && data.access_token) {
      localStorage.setItem('auth_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      toast('Logged in!')
      await loadCodes()
      } else {
      throw new Error('Login failed')
    }
  } catch (err) {
    console.error('❌ Login error:', err)
    toast('Login failed', 'error')
  }
}

const exportDiscountCodes = () => {
  try {
    if (!discountCodes.value || discountCodes.value.length === 0) {
      toast('No discount codes to export!', 'error')
      return
    }

    let csvContent = 'Discount Codes Export\n'
    csvContent += `Export Date,${new Date().toISOString().split('T')[0]}\n`
    csvContent += `Total Codes,${discountCodes.value.length}\n\n`
    csvContent += 'ID,Code,Name,Description,Type,Value,Minimum Amount,Usage Limit,Used Count,Status,Starts At,Expires At,Created At\n'

    discountCodes.value.forEach(code => {
      const id = code.id || 'N/A'
      const codeName = (code.code || '').replace(/"/g, '""')
      const name = (code.name || '').replace(/"/g, '""')
      const description = (code.description || '').replace(/"/g, '""')
      const type = code.type || 'percentage'
      const value = code.value || 0
      const minimumAmount = code.minimum_amount || 0
      const usageLimit = code.usage_limit || 0
      const usedCount = code.used_count || 0
      const status = code.is_active ? 'Active' : 'Inactive'
      const startsAt = code.starts_at ? new Date(code.starts_at).toLocaleDateString() : 'N/A'
      const expiresAt = code.expires_at ? new Date(code.expires_at).toLocaleDateString() : 'N/A'
      const createdAt = code.created_at ? new Date(code.created_at).toLocaleDateString() : 'N/A'

      csvContent += `${id},"${codeName}","${name}","${description}",${type},${value},${minimumAmount},${usageLimit},${usedCount},${status},${startsAt},${expiresAt},${createdAt}\n`
    })

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `discount-codes-export-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    toast(`✅ Discount codes exported successfully!\n\nTotal Codes: ${discountCodes.value.length}\nFile: discount-codes-export-${new Date().toISOString().split('T')[0]}.csv`, 'success')
    } catch (err) {
    console.error('❌ Error exporting discount codes:', err)
    toast(`❌ Error exporting discount codes: ${err.message}`, 'error')
  }
}

// Lifecycle
onMounted(() => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    loadCodes()
  }
})
</script>

<style scoped>
@import '@/styles/admin/DiscountCodes.css';
</style>


