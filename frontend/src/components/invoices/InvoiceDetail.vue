<template>
  <div class="invoice-detail">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center min-h-64">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <div class="text-red-500 text-lg mb-4">{{ error }}</div>
        <button
          @click="loadInvoice"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
    </div>

    <!-- Invoice Content -->
    <div v-else-if="invoice" class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Invoice #{{ invoice.invoice_number }}</h1>
              <p class="text-sm text-gray-600 mt-1">{{ getTypeText(invoice.type) }}</p>
            </div>
            <div class="text-right">
              <span
                class="inline-flex px-3 py-1 text-sm font-semibold rounded-full"
                :class="getStatusBadgeClass(invoice.status)"
              >
                {{ getStatusText(invoice.status) }}
              </span>
              <p class="text-sm text-gray-500 mt-1">
                {{ formatDate(invoice.created_at) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Invoice Info -->
        <div class="px-6 py-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Customer Info -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-3">Customer Information</h3>
              <div class="space-y-2">
                <p class="text-sm text-gray-600">
                  <span class="font-medium">Name:</span> {{ invoice.user?.name || 'Not specified' }}
                </p>
                <p class="text-sm text-gray-600">
                  <span class="font-medium">Email:</span> {{ invoice.user?.email || 'Not specified' }}
                </p>
                <p v-if="invoice.user?.phone" class="text-sm text-gray-600">
                  <span class="font-medium">Phone:</span> {{ invoice.user.phone }}
                </p>
              </div>
            </div>

            <!-- Invoice Details -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-3">Invoice Details</h3>
              <div class="space-y-2">
                <p class="text-sm text-gray-600">
                  <span class="font-medium">Invoice Number:</span> {{ invoice.invoice_number }}
                </p>
                <p class="text-sm text-gray-600">
                  <span class="font-medium">Created Date:</span> {{ formatDate(invoice.created_at) }}
                </p>
                <p v-if="invoice.due_date" class="text-sm text-gray-600">
                  <span class="font-medium">Due Date:</span> {{ formatDate(invoice.due_date) }}
                </p>
                <p v-if="invoice.paid_at" class="text-sm text-gray-600">
                  <span class="font-medium">Payment Date:</span> {{ formatDate(invoice.paid_at) }}
                </p>
                <p v-if="invoice.order" class="text-sm text-gray-600">
                  <span class="font-medium">Order Number:</span> {{ invoice.order.order_number }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Invoice Items -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Invoice Items</h2>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in invoice.items" :key="item.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ item.product_name }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-600">
                    {{ item.description || '-' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ item.quantity }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ formatCurrency(item.unit_price) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ formatCurrency(item.total_price) }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Invoice Summary -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div class="px-6 py-4">
          <div class="flex justify-end">
            <div class="w-64">
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Subtotal:</span>
                  <span class="font-medium">{{ formatCurrency(invoice.subtotal) }}</span>
                </div>

                <div v-if="invoice.discount_amount > 0" class="flex justify-between text-sm">
                  <span class="text-gray-600">Discount:</span>
                  <span class="font-medium text-green-600">-{{ formatCurrency(invoice.discount_amount) }}</span>
                </div>

                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Tax:</span>
                  <span class="font-medium">{{ formatCurrency(invoice.tax_amount) }}</span>
                </div>

                <div class="border-t border-gray-200 pt-2">
                  <div class="flex justify-between">
                    <span class="text-lg font-semibold text-gray-900">Total:</span>
                    <span class="text-lg font-bold text-gray-900">{{ formatCurrency(invoice.total_amount) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div v-if="invoice.notes" class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Notes</h3>
        </div>
        <div class="px-6 py-4">
          <p class="text-sm text-gray-600 whitespace-pre-wrap">{{ invoice.notes }}</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <button
                @click="downloadInvoice"
                class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Download PDF
              </button>

              <button
                @click="printInvoice"
                class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                </svg>
                Print
              </button>
            </div>

            <div v-if="invoice.status !== 'paid'" class="flex items-center space-x-3">
              <button
                @click="markAsPaid"
                :disabled="markingAsPaid"
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ markingAsPaid ? 'Processing...' : 'Confirm Payment' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '@/styles/invoices/Invoices.css';
</style>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useInvoices } from '@/composables/useInvoices'

// Composables
const route = useRoute()
const {
  currentInvoice: invoice,
  loading,
  error,
  fetchInvoice,
  markAsPaid: markAsPaidAPI,
  downloadInvoice: downloadInvoiceAPI,
  formatCurrency,
  formatDate,
  getStatusText,
  getTypeText
} = useInvoices()

// Local state
const markingAsPaid = ref(false)

// Methods
const loadInvoice = async () => {
  const invoiceId = route.params.id
  if (invoiceId) {
    await fetchInvoice(invoiceId)
  }
}

const markAsPaid = async () => {
  try {
    markingAsPaid.value = true
    await markAsPaidAPI(invoice.value.id)
    // Show success message
    } catch (err) {
    console.error('Error marking invoice as paid:', err)
  } finally {
    markingAsPaid.value = false
  }
}

const downloadInvoice = async () => {
  try {
    const result = await downloadInvoiceAPI(invoice.value.id)
    if (result.pdf_url) {
      window.open(result.pdf_url, '_blank')
    } else {
      // Handle case where PDF generation is not implemented
      }
  } catch (err) {
    console.error('Error downloading invoice:', err)
  }
}

const printInvoice = () => {
  window.print()
}

const getStatusBadgeClass = (status) => {
  const classes = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

// Initialize
onMounted(() => {
  loadInvoice()
})
</script>

<style scoped>
@import '@/styles/invoices/Invoices.css';

@media print {
  .no-print {
    display: none !important;
  }
}
</style>
