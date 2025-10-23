<template>
  <div class="create-invoice-container py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Header -->
      <div class="create-invoice-header mb-8">
        <h1 class="text-3xl font-bold">Create Invoice</h1>
        <p class="mt-2">Create a new invoice for an existing order</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="create-invoice-loading">
        <div class="create-invoice-spinner"></div>
        <p class="create-invoice-loading-text">Creating invoice...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="create-invoice-state-card create-invoice-error create-invoice-fade-in mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <span class="material-symbols-outlined create-invoice-icon create-invoice-error-icon">error</span>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium">Error</h3>
            <p class="text-sm mt-1">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Success State -->
      <div v-else-if="createdInvoice" class="create-invoice-state-card create-invoice-success create-invoice-fade-in mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <span class="material-symbols-outlined create-invoice-icon create-invoice-success-icon">check_circle</span>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium">Invoice Created Successfully</h3>
            <p class="text-sm mt-1">
              Invoice #{{ createdInvoice.invoice_number }} has been created.
            </p>
            <div class="mt-4">
              <router-link
                :to="`/invoices/${createdInvoice.id}`"
                class="create-invoice-link create-invoice-btn create-invoice-btn-success inline-flex items-center"
              >
                View Invoice
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Invoice Form -->
      <div v-else class="create-invoice-card create-invoice-shadow-lg">
        <form @submit.prevent="handleCreateInvoice" class="create-invoice-form p-6">
          <div class="create-invoice-form-grid">
            <!-- Order ID -->
            <div class="field-container">
              <label for="order_id">
                Order ID <span class="required">*</span>
              </label>
              <select
                id="order_id"
                v-model="formData.order_id"
                required
              >
                <option value="">Select an order...</option>
                <option v-for="order in orders" :key="order.id" :value="order.id">
                  Order #{{ order.order_number }} - ${{ order.total_amount }} - {{ order.status }}
                </option>
              </select>
              <p class="help-text">
                Select the order for which you want to create an invoice
              </p>
            </div>

            <!-- Due Date -->
            <div class="field-container">
              <label for="due_date">
                Due Date
              </label>
              <input
                type="date"
                id="due_date"
                v-model="formData.due_date"
                :min="minDate"
              />
              <p class="help-text">
                Leave empty to set due date 30 days from today
              </p>
            </div>

            <!-- Notes -->
            <div class="field-container">
              <label for="notes">
                Notes
              </label>
              <textarea
                id="notes"
                v-model="formData.notes"
                rows="3"
                placeholder="Additional notes for the invoice..."
              ></textarea>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="create-invoice-btn-container">
            <router-link
              to="/invoices"
              class="create-invoice-link create-invoice-btn create-invoice-btn-secondary inline-flex items-center"
            >
              Cancel
            </router-link>
            <button
              type="submit"
              :disabled="!formData.order_id || creating"
              :class="[
                'create-invoice-btn create-invoice-btn-primary inline-flex items-center',
                { 'create-invoice-btn-loading': creating }
              ]"
            >
              <span v-if="!creating">{{ creating ? 'Creating...' : 'Create Invoice' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useInvoices } from '@/composables/useInvoices'
import { useOrdersAPI } from '@/composables/user/Orders'

const router = useRouter()
const { createInvoice } = useInvoices()

// State
const loading = ref(false)
const creating = ref(false)
const error = ref(null)
const createdInvoice = ref(null)
const orders = ref([])

// Form data
const formData = ref({
  order_id: '',
  due_date: '',
  notes: ''
})

// Initialize orders API
const { loadOrders } = useOrdersAPI(loading, error)

// Computed
const minDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})

// Methods
const loadOrdersData = async () => {
  try {
    await loadOrders(orders)
    // Filter out cancelled orders
    orders.value = orders.value.filter(order => order.status !== 'cancelled')
  } catch (err) {
    console.error('Error loading orders:', err)
    error.value = 'Failed to load orders'
  }
}

const handleCreateInvoice = async () => {
  try {
    creating.value = true
    error.value = null

    // Prepare data
    const invoiceData = {
      order_id: parseInt(formData.value.order_id),
      due_date: formData.value.due_date || null,
      notes: formData.value.notes || null
    }

    // Create invoice
    const invoice = await createInvoice(invoiceData)
    createdInvoice.value = invoice

    } catch (err) {
    console.error('Error creating invoice:', err)
    error.value = err.message || 'Failed to create invoice'
  } finally {
    creating.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadOrdersData()
})
</script>

<style scoped>
@import '@/styles/invoices/CreateInvoice.css';
</style>
