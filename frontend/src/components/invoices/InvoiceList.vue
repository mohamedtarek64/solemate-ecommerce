<template>
  <div class="invoice-list">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Invoices</h1>
            <p class="text-sm text-gray-600 mt-1">Manage all your invoices</p>
          </div>
          <div class="flex items-center space-x-3">
            <!-- Filter Dropdown -->
            <select
              v-model="selectedStatus"
              @change="handleFilterChange"
              class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <!-- Type Filter -->
            <select
              v-model="selectedType"
              @change="handleFilterChange"
              class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="sale">Sale Invoice</option>
              <option value="return">Return Invoice</option>
              <option value="partial">Partial Invoice</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="px-6 py-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-blue-50 rounded-lg p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-blue-600">Total Invoices</p>
                <p class="text-2xl font-bold text-blue-900">{{ statistics.total_invoices }}</p>
              </div>
            </div>
          </div>

          <div class="bg-green-50 rounded-lg p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-green-600">Paid</p>
                <p class="text-2xl font-bold text-green-900">{{ statistics.paid_invoices }}</p>
              </div>
            </div>
          </div>

          <div class="bg-yellow-50 rounded-lg p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-yellow-600">Unpaid</p>
                <p class="text-2xl font-bold text-yellow-900">{{ statistics.unpaid_invoices }}</p>
              </div>
            </div>
          </div>

          <div class="bg-red-50 rounded-lg p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-red-600">Overdue</p>
                <p class="text-2xl font-bold text-red-900">{{ statistics.overdue_invoices }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Invoices Table -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <!-- Loading State -->
      <div v-if="loading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="text-sm text-gray-500 mt-2">Loading invoices...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-8 text-center">
        <div class="text-red-500 text-sm">{{ error }}</div>
        <button
          @click="fetchInvoices"
          class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="invoices.length === 0" class="p-8 text-center">
        <div class="text-gray-400 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No Invoices</h3>
        <p class="text-gray-500">No invoices have been created yet</p>
      </div>

      <!-- Invoices List -->
      <div v-else class="overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice Number
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="invoice in invoices"
              :key="invoice.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ invoice.invoice_number }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ formatDate(invoice.created_at) }}
                </div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-900">
                  {{ getTypeText(invoice.type) }}
                </span>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ formatCurrency(invoice.total_amount) }}
                </div>
                <div v-if="invoice.discount_amount > 0" class="text-sm text-green-600">
                  Discount: {{ formatCurrency(invoice.discount_amount) }}
                </div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getStatusBadgeClass(invoice.status)"
                >
                  {{ getStatusText(invoice.status) }}
                </span>
                <div v-if="isOverdue(invoice)" class="text-xs text-red-600 mt-1">
                  Overdue
                </div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ invoice.due_date ? formatDate(invoice.due_date) : '-' }}
              </td>

              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <button
                    @click="viewInvoice(invoice.id)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    View
                  </button>

                  <button
                    v-if="invoice.status !== 'paid'"
                    @click="markAsPaid(invoice.id)"
                    class="text-green-600 hover:text-green-900"
                  >
                    Pay
                  </button>

                  <button
                    @click="downloadInvoice(invoice.id)"
                    class="text-gray-600 hover:text-gray-900"
                  >
                    Download
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination && pagination.last_page > 1" class="px-6 py-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Showing {{ pagination.from }} to {{ pagination.to }} of {{ pagination.total }} invoices
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="goToPage(pagination.current_page - 1)"
              :disabled="pagination.current_page === 1"
              class="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>

            <span class="px-3 py-1 text-sm text-gray-700">
              Page {{ pagination.current_page }} of {{ pagination.last_page }}
            </span>

            <button
              @click="goToPage(pagination.current_page + 1)"
              :disabled="pagination.current_page === pagination.last_page"
              class="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useInvoices } from '@/composables/useInvoices'

// Composables
const router = useRouter()
const {
  invoices,
  statistics,
  loading,
  error,
  fetchInvoices,
  fetchStatistics,
  markAsPaid,
  downloadInvoice,
  formatCurrency,
  formatDate,
  getStatusText,
  getTypeText,
  getStatusColor
} = useInvoices()

// Local state
const selectedStatus = ref('')
const selectedType = ref('')
const pagination = ref(null)

// Methods
const handleFilterChange = async () => {
  await fetchInvoices({
    status: selectedStatus.value || undefined,
    type: selectedType.value || undefined
  })
}

const viewInvoice = (invoiceId) => {
  router.push(`/invoices/${invoiceId}`)
}

const isOverdue = (invoice) => {
  if (invoice.status === 'paid' || !invoice.due_date) return false
  return new Date(invoice.due_date) < new Date()
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

const goToPage = async (page) => {
  await fetchInvoices({
    page,
    status: selectedStatus.value || undefined,
    type: selectedType.value || undefined
  })
}

// Initialize
onMounted(async () => {
  await Promise.all([
    fetchInvoices(),
    fetchStatistics()
  ])
  })
</script>

<style scoped>
@import '@/styles/invoices/Invoices.css';
</style>
