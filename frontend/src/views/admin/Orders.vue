<template>
  <div class="admin-orders">
    <div class="relative flex size-full min-h-screen flex-col bg-[#1C1C1C] dark group/design-root overflow-x-hidden">
      <div class="flex flex-col lg:flex-row h-full grow">
        <!-- Sidebar -->
        <AdminSidebar />

    <!-- Main Content -->
        <main class="flex-1 p-6 md:p-8">
          <!-- Header -->
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <p class="text-white text-3xl font-bold">Orders Management</p>
              <p class="text-gray-400">Manage and track all customer orders</p>
            </div>
            <div class="flex gap-2">
              <button
                @click="loadOrders"
                :disabled="isLoading"
                class="flex items-center justify-center rounded-md h-10 px-4 bg-[#2C2C2C] text-white text-sm font-medium hover:bg-[#3A3A3A] gap-2 disabled:opacity-50"
              >
                <span class="material-symbols-outlined" :class="{ 'animate-spin': isLoading }">refresh</span>
                <span class="truncate">{{ isLoading ? 'Loading...' : 'Refresh' }}</span>
              </button>
              <button
                @click="exportOrders"
                class="flex items-center justify-center rounded-md h-10 px-4 bg-[#f97306] text-white text-sm font-medium hover:bg-[#e55a00] gap-2"
              >
                <span class="material-symbols-outlined">download</span>
                <span class="truncate">Export</span>
              </button>
            </div>
          </div>

          <!-- Filters -->
          <div class="bg-[#232323] p-6 rounded-md mb-8">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select v-model="statusFilter" @change="applyFilters" class="w-full px-3 py-2 bg-[#2C2C2C] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#f97306]">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Search</label>
                <input
                  v-model="searchQuery"
                  @input="applyFilters"
                  type="text"
                  placeholder="Order ID, Customer..."
                  class="w-full px-3 py-2 bg-[#2C2C2C] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f97306]"
                />
          </div>
              <div class="flex items-end">
                <button @click="clearFilters" class="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                  Clear Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Orders Table -->
          <div class="bg-[#232323] rounded-md overflow-hidden">
        <!-- Loading State -->
            <div v-if="isLoading" class="p-6">
              <div class="space-y-4">
                <div v-for="i in 5" :key="i" class="flex items-center space-x-4 p-4">
                  <div class="h-4 bg-gray-700 rounded w-16 animate-pulse"></div>
                  <div class="h-4 bg-gray-700 rounded w-32 animate-pulse"></div>
                  <div class="h-4 bg-gray-700 rounded w-20 animate-pulse"></div>
                  <div class="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
                  <div class="h-4 bg-gray-700 rounded w-20 animate-pulse ml-auto"></div>
                </div>
        </div>
        </div>

        <!-- Empty State -->
              <div v-else-if="filteredOrders.length === 0" class="text-center py-12 text-gray-400">
                <span class="material-symbols-outlined text-6xl mb-4">receipt_long</span>
                <p class="text-xl mb-2">No orders found</p>
                <p class="text-sm">Orders will appear here when customers make purchases</p>
        </div>

              <!-- Table -->
              <div v-else class="orders-table-container overflow-x-auto">
                <table class="w-full text-left">
                  <thead class="bg-[#2C2C2C]">
                    <tr>
                      <th class="py-4 px-6 text-sm font-medium text-gray-300">Order ID</th>
                      <th class="py-4 px-6 text-sm font-medium text-gray-300">Customer</th>
                      <th class="py-4 px-6 text-sm font-medium text-gray-300">Date</th>
                      <th class="py-4 px-6 text-sm font-medium text-gray-300">Status</th>
                      <th class="py-4 px-6 text-sm font-medium text-gray-300">Total</th>
                      <th class="py-4 px-6 text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
                  <tbody>
                    <tr v-for="order in filteredOrders" :key="order.id" class="border-b border-gray-700 hover:bg-[#2C2C2C] transition-colors">
                      <td class="py-4 px-6 text-sm text-white font-medium">#{{ order.id }}</td>
                      <td class="py-4 px-6 text-sm text-gray-300">{{ order.customer_name || 'N/A' }}</td>
                      <td class="py-4 px-6 text-sm text-gray-400">{{ formatDate(order.created_at) }}</td>
                      <td class="py-4 px-6 text-sm">
                        <span :class="getStatusClass(order.status)">{{ order.status }}</span>
                </td>
                      <td class="py-4 px-6 text-sm text-white font-medium">{{ formatCurrency(order.total_amount) }}</td>
                      <td class="py-4 px-6 text-sm">
                        <div class="flex gap-2 items-center justify-start">
                          <!-- View Button -->
                    <button
                            @click="viewOrderDetails(order)"
                            class="action-btn view-btn flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-[#f97306]/10 to-[#f97306]/20 hover:from-[#f97306]/20 hover:to-[#f97306]/30 text-[#f97306] hover:text-[#e55a00] rounded-lg transition-all duration-300 hover:transform hover:translateY(-1px) hover:shadow-lg border border-[#f97306]/20 hover:border-[#f97306]/40"
                            title="View Order Details"
                          >
                            <span class="material-symbols-outlined text-sm">visibility</span>
                            <span class="text-xs font-medium">View</span>
                    </button>

                          <!-- Edit Button -->
                    <button
                            @click="editOrderStatus(order)"
                            class="action-btn edit-btn flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-500/10 to-blue-600/20 hover:from-blue-500/20 hover:to-blue-600/30 text-blue-400 hover:text-blue-300 rounded-lg transition-all duration-300 hover:transform hover:translateY(-1px) hover:shadow-lg border border-blue-500/20 hover:border-blue-500/40"
                            title="Edit Order Status"
                          >
                            <span class="material-symbols-outlined text-sm">edit</span>
                            <span class="text-xs font-medium">Edit</span>
                          </button>

                          <!-- More Actions Dropdown -->
                          <div class="relative" style="z-index: 10;">
                    <button
                              @click="toggleMoreActions(order.id)"
                              class="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-gray-600/10 to-gray-700/20 hover:from-gray-600/20 hover:to-gray-700/30 text-gray-400 hover:text-white rounded-lg transition-all duration-300 hover:transform hover:translateY(-1px) hover:shadow-lg border border-gray-600/20 hover:border-gray-600/40"
                              title="More Actions"
                            >
                              <span class="material-symbols-outlined text-sm">more_vert</span>
                              <span class="text-xs font-medium">More</span>
                    </button>

                            <!-- Dropdown Menu -->
                            <div
                              v-if="showMoreActions === order.id"
                              class="dropdown-menu absolute right-0 top-full mt-2 w-52 bg-[#2C2C2C] border border-gray-600/50 rounded-xl shadow-2xl z-[9999] backdrop-blur-sm"
                              style="position: absolute !important;"
                            >
                              <div class="py-2">
                                <button
                                  @click="duplicateOrder(order)"
                                  class="dropdown-item flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-blue-600/20 hover:text-white transition-all duration-200 hover:translateX(2px)"
                                >
                                  <span class="material-symbols-outlined text-sm text-blue-400">content_copy</span>
                                  <span class="font-medium">Duplicate</span>
                                </button>
                                <button
                                  @click="toggleOrderStatus(order)"
                                  class="dropdown-item flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-green-600/20 hover:text-white transition-all duration-200 hover:translateX(2px)"
                                >
                                  <span class="material-symbols-outlined text-sm text-green-400">swap_horiz</span>
                                  <span class="font-medium">Toggle Status</span>
                                </button>
                                <button
                                  @click="exportSingleOrder(order)"
                                  class="dropdown-item flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-orange-600/20 hover:text-white transition-all duration-200 hover:translateX(2px)"
                                >
                                  <span class="material-symbols-outlined text-sm text-orange-400">download</span>
                                  <span class="font-medium">Export</span>
                                </button>
                                <hr class="my-2 border-gray-600/50">
                    <button
                                  @click="deleteOrder(order)"
                                  class="dropdown-item delete-btn flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-red-600/20 hover:text-red-300 transition-all duration-200 hover:translateX(2px)"
                                >
                                  <span class="material-symbols-outlined text-sm">delete</span>
                                  <span class="font-medium">Delete</span>
                    </button>
                              </div>
                            </div>
                          </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
              </div>
          </div>

          <!-- Pagination -->
          <div v-if="filteredOrders.length > 0" class="mt-6 flex justify-between items-center">
            <div class="text-sm text-gray-400">
              Showing {{ filteredOrders.length }} of {{ totalOrders }} orders
            </div>
          </div>
        </main>
      </div>
            </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-[#232323] p-6 rounded-md w-full max-w-md mx-4">
        <div class="flex items-center gap-3 mb-4">
          <div :class="confirmModal.type === 'delete' ? 'text-red-500' : 'text-blue-500'">
            <span class="material-symbols-outlined text-2xl">
              {{ confirmModal.type === 'delete' ? 'warning' : 'info' }}
            </span>
          </div>
          <h3 class="text-white text-lg font-bold">{{ confirmModal.title }}</h3>
        </div>
        <p class="text-gray-300 mb-6">{{ confirmModal.message }}</p>
        <div class="flex gap-3 justify-end">
              <button
            @click="showConfirmModal = false"
            class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
            Cancel
              </button>
              <button
            @click="confirmAction"
            :class="confirmModal.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'"
            class="px-4 py-2 text-white rounded-md transition-colors"
          >
            {{ confirmModal.confirmText }}
              </button>
            </div>
          </div>
        </div>

    <!-- Edit Order Status Modal -->
    <div v-if="showEditModal" class="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="modal-content w-full max-w-2xl bg-[#232323] rounded-xl shadow-2xl max-h-[90vh] overflow-hidden">
        <!-- Modal Header -->
        <div class="modal-header bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white relative overflow-hidden">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span class="material-symbols-outlined text-2xl">edit</span>
              </div>
              <div>
                <h2 class="text-2xl font-bold">Edit Order Status</h2>
                <p class="text-white/80">Order #{{ editingOrder?.id }}</p>
              </div>
            </div>
            <button
              @click="showEditModal = false"
              class="close-btn w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <!-- Animated background -->
          <div class="absolute inset-0 opacity-10">
            <div class="floating-shapes">
              <div class="shape shape-1"></div>
              <div class="shape shape-2"></div>
              <div class="shape shape-3"></div>
            </div>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="modal-body p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div v-if="editingOrder" class="space-y-6">
            <!-- Current Order Info -->
            <div class="current-order-info glass-effect p-6 rounded-xl">
              <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-blue-400">info</span>
                Current Order Information
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="info-item">
                  <label class="text-gray-400 text-sm">Customer Name</label>
                  <p class="text-white font-semibold">{{ editingOrder.customer_name || 'N/A' }}</p>
                </div>
                <div class="info-item">
                  <label class="text-gray-400 text-sm">Current Status</label>
                  <span :class="getStatusClass(editingOrder.status)" class="inline-block px-3 py-1 rounded-full text-sm font-medium">
                    {{ editingOrder.status.toUpperCase() }}
                  </span>
                </div>
                <div class="info-item">
                  <label class="text-gray-400 text-sm">Total Amount</label>
                  <p class="text-white font-bold text-lg">{{ formatCurrency(editingOrder.total_amount) }}</p>
                </div>
                <div class="info-item">
                  <label class="text-gray-400 text-sm">Order Date</label>
                  <p class="text-white font-semibold">{{ formatDate(editingOrder.created_at) }}</p>
                </div>
              </div>
            </div>

            <!-- Status Selection -->
            <div class="status-selection glass-effect p-6 rounded-xl">
              <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-blue-400">swap_horiz</span>
                Select New Status
              </h3>

              <!-- Status Options Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  v-for="status in availableStatuses"
                  :key="status.value"
                  @click="selectedStatus = status.value"
                  class="status-option"
                  :class="{
                    'selected': selectedStatus === status.value,
                    'current': editingOrder.status === status.value
                  }"
                >
                  <div class="status-icon">
                    <span class="material-symbols-outlined">{{ status.icon }}</span>
                  </div>
                  <div class="status-info">
                    <h4 class="status-name">{{ status.label }}</h4>
                    <p class="status-description">{{ status.description }}</p>
                  </div>
                  <div class="status-indicator">
                    <span v-if="selectedStatus === status.value" class="material-symbols-outlined text-blue-400">check_circle</span>
                    <span v-else-if="editingOrder.status === status.value" class="material-symbols-outlined text-gray-400">radio_button_checked</span>
                    <span v-else class="material-symbols-outlined text-gray-600">radio_button_unchecked</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Status Change Notes -->
            <div class="notes-section glass-effect p-6 rounded-xl">
              <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-blue-400">note</span>
                Additional Notes (Optional)
              </h3>
              <textarea
                v-model="statusNotes"
                placeholder="Add any notes about this status change..."
                class="notes-textarea w-full p-4 bg-[#2C2C2C] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="3"
              ></textarea>
            </div>

            <!-- Status History Preview -->
            <div class="status-history glass-effect p-6 rounded-xl">
              <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-blue-400">history</span>
                Status Change Preview
              </h3>
              <div class="status-timeline">
                <div class="timeline-item completed">
                  <div class="timeline-dot bg-green-500"></div>
                  <div class="timeline-content">
                    <p class="text-white font-semibold">{{ editingOrder.status.toUpperCase() }}</p>
                    <p class="text-gray-400 text-sm">{{ formatDate(editingOrder.created_at) }}</p>
                  </div>
                </div>
                <div class="timeline-item" :class="{ 'active': selectedStatus && selectedStatus !== editingOrder.status }">
                  <div class="timeline-dot" :class="selectedStatus && selectedStatus !== editingOrder.status ? 'bg-blue-500' : 'bg-gray-600'"></div>
                  <div class="timeline-content">
                    <p class="text-white font-semibold">{{ selectedStatus ? selectedStatus.toUpperCase() : 'Select Status' }}</p>
                    <p class="text-gray-400 text-sm">{{ selectedStatus && selectedStatus !== editingOrder.status ? 'Will be set now' : 'Choose a new status' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer bg-[#2C2C2C] p-6 border-t border-gray-600/30">
          <div class="flex items-center justify-between">
            <div class="text-gray-400 text-sm">
              <span v-if="selectedStatus && selectedStatus !== editingOrder.status">
                Changing from <span class="text-white font-semibold">{{ editingOrder.status }}</span> to <span class="text-white font-semibold">{{ selectedStatus }}</span>
              </span>
              <span v-else class="text-gray-500">No changes selected</span>
            </div>
            <div class="flex gap-3">
              <button
                @click="showEditModal = false"
                class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-300"
              >
                Cancel
              </button>
              <button
                @click="saveStatusChange"
                :disabled="!selectedStatus || selectedStatus === editingOrder.status"
                class="action-btn save-btn px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300 flex items-center gap-2"
              >
                <span class="material-symbols-outlined">save</span>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Details Modal -->
    <div v-if="showOrderDetailsModal" class="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="modal-content w-full max-w-4xl bg-[#232323] rounded-xl shadow-2xl max-h-[90vh] overflow-hidden">
        <!-- Modal Header -->
        <div class="modal-header bg-gradient-to-r from-[#f97306] to-[#ff8c42] p-6 text-white relative overflow-hidden">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span class="material-symbols-outlined text-2xl">receipt_long</span>
              </div>
              <div>
                <h2 class="text-2xl font-bold">Order Details</h2>
                <p class="text-white/80">Order #{{ selectedOrder?.id }}</p>
              </div>
            </div>
            <button
              @click="showOrderDetailsModal = false"
              class="close-btn w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <!-- Animated background -->
          <div class="absolute inset-0 opacity-10">
            <div class="floating-shapes">
              <div class="shape shape-1"></div>
              <div class="shape shape-2"></div>
              <div class="shape shape-3"></div>
            </div>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="modal-body p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div v-if="selectedOrder" class="space-y-6">
            <!-- Order Summary -->
            <div class="order-summary glass-effect p-6 rounded-xl">
              <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-[#f97306]">info</span>
                Order Summary
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div class="summary-item">
                  <label class="text-gray-400 text-sm">Order Number</label>
                  <p class="text-white font-semibold">#{{ selectedOrder.order_number || selectedOrder.id }}</p>
                </div>
                <div class="summary-item">
                  <label class="text-gray-400 text-sm">Status</label>
                  <span :class="getStatusClass(selectedOrder.status)" class="inline-block px-3 py-1 rounded-full text-sm font-medium">
                    {{ selectedOrder.status.toUpperCase() }}
                  </span>
                </div>
                <div class="summary-item">
                  <label class="text-gray-400 text-sm">Total Amount</label>
                  <p class="text-white font-bold text-lg">{{ formatCurrency(selectedOrder.total_amount) }}</p>
                </div>
                <div class="summary-item">
                  <label class="text-gray-400 text-sm">Payment Method</label>
                  <p class="text-white font-semibold">{{ selectedOrder.payment_method || 'N/A' }}</p>
                </div>
                <div class="summary-item">
                  <label class="text-gray-400 text-sm">Order Date</label>
                  <p class="text-white font-semibold">{{ formatDate(selectedOrder.created_at) }}</p>
                </div>
                <div class="summary-item">
                  <label class="text-gray-400 text-sm">Items Count</label>
                  <p class="text-white font-semibold">{{ selectedOrder.items?.length || 0 }} items</p>
                </div>
              </div>
            </div>

            <!-- Customer Information -->
            <div class="customer-info glass-effect p-6 rounded-xl">
              <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-[#f97306]">person</span>
                Customer Information
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="customer-item">
                  <label class="text-gray-400 text-sm">Customer Name</label>
                  <p class="text-white font-semibold">{{ selectedOrder.customer_name || 'N/A' }}</p>
                </div>
                <div class="customer-item">
                  <label class="text-gray-400 text-sm">Email</label>
                  <p class="text-white font-semibold">{{ selectedOrder.customer_email || 'N/A' }}</p>
                </div>
                <div class="customer-item">
                  <label class="text-gray-400 text-sm">Phone</label>
                  <p class="text-white font-semibold">{{ selectedOrder.customer_phone || 'N/A' }}</p>
                </div>
                <div class="customer-item">
                  <label class="text-gray-400 text-sm">Customer ID</label>
                  <p class="text-white font-semibold">{{ selectedOrder.customer_id || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <!-- Order Items -->
            <div class="order-items glass-effect p-6 rounded-xl">
              <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-[#f97306]">shopping_cart</span>
                Order Items
              </h3>
              <div v-if="selectedOrder.items && selectedOrder.items.length > 0" class="space-y-4">
                <div
                  v-for="(item, index) in selectedOrder.items"
                  :key="index"
                  class="item-card bg-[#2C2C2C] p-4 rounded-lg border border-gray-600/30 hover:border-[#f97306]/50 transition-all duration-300"
                >
                     <div class="flex items-start justify-between gap-4">
                       <!-- Product Image -->
                       <div class="product-image-container flex-shrink-0">
                         <div class="w-20 h-20 rounded-xl overflow-hidden bg-gray-700 border-2 border-gray-600/30 hover:border-[#f97306]/50 transition-all duration-300 group">
                           <img
                             v-if="item.product_image"
                             :src="item.product_image"
                             :alt="item.product_name"
                             class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                             @error="handleImageError($event)"
                           />
                           <div v-else class="w-full h-full flex items-center justify-center">
                             <span class="material-symbols-outlined text-gray-400 text-2xl group-hover:text-[#f97306] transition-colors duration-300">image</span>
                           </div>
                         </div>
                         <!-- Image loading indicator -->
                         <div v-if="!item.product_image" class="mt-1 text-center">
                           <span class="text-xs text-gray-500">No image</span>
                         </div>
                       </div>

                       <!-- Product Details -->
                       <div class="flex-1 min-w-0">
                         <div class="flex items-start justify-between">
                           <div class="flex-1">
                             <h4 class="text-white font-semibold text-lg group-hover:text-[#f97306] transition-colors duration-300">{{ item.product_name }}</h4>
                             <p class="text-gray-400 text-sm">SKU: {{ item.product_sku || 'N/A' }}</p>
                             <p v-if="item.product_brand" class="text-gray-400 text-sm">Brand: {{ item.product_brand }}</p>

                             <!-- Price and Quantity -->
                             <div class="flex items-center gap-4 mt-2">
                               <span class="text-[#f97306] font-bold text-lg">{{ formatCurrency(item.product_price) }}</span>
                               <span class="text-gray-400">× {{ item.quantity }}</span>
                               <span class="text-white font-semibold text-lg">= {{ formatCurrency(item.subtotal) }}</span>
                             </div>

                             <!-- Size and Color -->
                             <div v-if="item.size || item.color" class="flex items-center gap-4 mt-2">
                               <span v-if="item.size" class="inline-flex items-center px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-md">
                                 <span class="material-symbols-outlined text-xs mr-1">straighten</span>
                                 {{ item.size }}
                               </span>
                               <span v-if="item.color" class="inline-flex items-center px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-md">
                                 <span class="material-symbols-outlined text-xs mr-1">palette</span>
                                 {{ item.color }}
                               </span>
                             </div>

                             <!-- Product Description -->
                             <p v-if="item.product_description" class="text-gray-400 text-sm mt-2 line-clamp-2">{{ item.product_description }}</p>

                             <!-- Product Status -->
                             <div v-if="item.product_status" class="mt-2">
                               <span :class="getProductStatusClass(item.product_status)" class="inline-block px-2 py-1 rounded-full text-xs font-medium">
                                 {{ item.product_status.toUpperCase() }}
                               </span>
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>
                </div>
              </div>
              <div v-else class="text-center py-8 text-gray-400">
                <span class="material-symbols-outlined text-4xl mb-2 block">shopping_cart_off</span>
                <p>No items found in this order</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer bg-[#2C2C2C] p-6 border-t border-gray-600/30">
          <div class="flex items-center justify-between">
            <div class="text-gray-400 text-sm">
              Last updated: {{ formatDate(selectedOrder?.updated_at) }}
            </div>
            <div class="flex gap-3">
              <button
                @click="editOrderStatus(selectedOrder)"
                class="order-details-edit-btn px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden group"
              >
                <div class="edit-icon-container relative">
                  <span class="material-symbols-outlined text-lg relative z-10">edit</span>
                  <div class="edit-icon-bg absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                </div>
                <span class="font-semibold relative z-10">Edit Status</span>
                <div class="edit-btn-shine absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>
              <button
                @click="exportSingleOrder(selectedOrder)"
                class="action-btn export-btn px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300 flex items-center gap-2"
              >
                <span class="material-symbols-outlined">download</span>
                Export
              </button>
              <button
                @click="showOrderDetailsModal = false"
                class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
            </div>
          </div>
        </div>

    <!-- Toast Notification -->
    <div
      v-if="showToast"
      class="toast-notification fixed top-4 right-4 z-50 animate-slideIn"
    >
      <div
        :class="toastType === 'success' ? 'bg-green-600' : 'bg-red-600'"
        class="flex items-center gap-3 px-4 py-3 rounded-md text-white shadow-lg"
      >
        <span class="material-symbols-outlined">
          {{ toastType === 'success' ? 'check_circle' : 'error' }}
        </span>
        <span class="font-medium">{{ toastMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAdminDashboard } from '@/composables/useAdminDashboard'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
// ✅ Enhanced Admin Optimization
import { useAdminOptimization } from '@/composables/useAdminOptimization'
import VirtualScroll from '@/components/common/VirtualScroll.vue'
import performanceMonitorEnhanced from '@/utils/performanceMonitorEnhanced'
import {
  useOrdersState,
  useOrdersComputed,
  useOrdersAPI,
  useOrdersActions,
  useOrdersUtils,
  initializeOrders
} from '@/composables/admin/Orders.js'
import OptimizedLoading from '@/components/OptimizedLoading.vue'
import { usePaginatedApi } from '@/composables/useOptimizedApi.js'
import { useLoadingState } from '@/utils/loadingStates.js'
import adminService from '@/services/adminService'

// State
const {
  orders,
  isLoading,
  error,
  statusFilter,
  searchQuery,
  currentPage,
  itemsPerPage,
  showMoreActions,
  showConfirmModal,
  confirmModal,
  showToast,
  toastMessage,
  toastType
} = useOrdersState()

// Order Details Modal State
const showOrderDetailsModal = ref(false)
const selectedOrder = ref(null)

// Edit Order Modal State
const showEditModal = ref(false)
const editingOrder = ref(null)
const selectedStatus = ref('')
const statusNotes = ref('')

// Available statuses with icons and descriptions
const availableStatuses = ref([
  {
    value: 'pending',
    label: 'Pending',
    icon: 'schedule',
    description: 'Order is waiting for processing'
  },
  {
    value: 'processing',
    label: 'Processing',
    icon: 'settings',
    description: 'Order is being prepared'
  },
  {
    value: 'shipped',
    label: 'Shipped',
    icon: 'local_shipping',
    description: 'Order has been dispatched'
  },
  {
    value: 'delivered',
    label: 'Delivered',
    icon: 'check_circle',
    description: 'Order has been delivered'
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
    icon: 'cancel',
    description: 'Order has been cancelled'
  },
  {
    value: 'refunded',
    label: 'Refunded',
    icon: 'money_off',
    description: 'Order has been refunded'
  }
])

// Use optimized APIs
const {
  loading: optimizedLoading,
  data: optimizedOrders,
  loadPage: optimizedLoadPage
} = usePaginatedApi('/api/admin/orders', { perPage: 20 })

// Use loading states
const { loading: adminOrdersLoading, withLoading: withAdminOrdersLoading } = useLoadingState('admin_orders')

// Computed
const {
  totalOrders,
  pendingOrders,
  completedOrders,
  totalRevenue,
  filteredOrders
} = useOrdersComputed(orders, statusFilter, searchQuery)

// API
// Create refs for performDelete and performDuplicate to resolve circular dependency
const performDeleteRef = ref(null)
const performDuplicateRef = ref(null)

// Actions - Initialize first to get showToastMessage
const {
  applyFilters,
  clearFilters,
  toggleMoreActions,
  showToastMessage,
  confirmAction,
  deleteOrder,
  duplicateOrder,
  handleClickOutside
} = useOrdersActions(showMoreActions, showConfirmModal, confirmModal, showToast, toastMessage, toastType, statusFilter, searchQuery, performDeleteRef, performDuplicateRef)

// API Functions - Pass showToastMessage
const {
  loadOrders,
  viewOrder,
  editOrder,
  exportOrders,
  performDelete,
  performDuplicate,
  toggleOrderStatus,
  exportSingleOrder
} = useOrdersAPI(isLoading, error, orders, showToastMessage)

// Assign the actual functions to the refs
performDeleteRef.value = performDelete
performDuplicateRef.value = performDuplicate

// Enhanced View Order Function
const viewOrderDetails = async (order) => {
  try {
    const result = await adminService.getOrder(order.id)
    if (result.success) {
      selectedOrder.value = result.data
      showOrderDetailsModal.value = true
    } else {
      throw new Error('Failed to load order details')
    }
  } catch (err) {
    console.error('Error viewing order:', err)
    showToastMessage('Error loading order details: ' + err.message, 'error')
  }
}

// Enhanced Edit Order Function
const editOrderStatus = (order) => {
  editingOrder.value = order
  selectedStatus.value = order.status
  statusNotes.value = ''
  showEditModal.value = true
}

// Save Status Change Function
const saveStatusChange = async () => {
  if (!selectedStatus.value || selectedStatus.value === editingOrder.value.status) {
    return
  }

  try {
    const result = await adminService.updateOrderStatus(editingOrder.value.id, selectedStatus.value)
    if (result.success) {
      // Update the order in the local list
      const orderIndex = orders.value.findIndex(o => o.id === editingOrder.value.id)
      if (orderIndex !== -1) {
        orders.value[orderIndex].status = selectedStatus.value
      }

      showToastMessage(`Order status updated to ${selectedStatus.value}`, 'success')
      showEditModal.value = false
    } else {
      throw new Error('Failed to update order status')
    }
  } catch (err) {
    console.error('Error updating order status:', err)
    showToastMessage('Error updating order status: ' + err.message, 'error')
  }
}

// Utils
const { formatCurrency, formatDate, getStatusClass } = useOrdersUtils()

// Image error handler
const handleImageError = (event) => {
  event.target.style.display = 'none'
  event.target.nextElementSibling.style.display = 'flex'
}

// Product status class helper
const getProductStatusClass = (status) => {
  const statusClasses = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    discontinued: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800'
  }
  return statusClasses[status] || 'bg-gray-100 text-gray-800'
}

// Initialize
const { onMounted: initOrders, onUnmounted: cleanupOrders } = initializeOrders()

// ✅ Enhanced Admin Optimization
const adminOptimization = useAdminOptimization()

onMounted(async () => {
  // ✅ Start performance monitoring
  const measurement = performanceMonitorEnhanced.startMeasure('admin-orders-load', 'page-load')
  
  try {
    // Initialize orders
    await initOrders(loadOrders, handleClickOutside)
    
    // ✅ Setup lazy loading for images
    requestAnimationFrame(() => {
      const images = document.querySelectorAll('img')
      images.forEach((img, index) => {
        if (index > 5) img.loading = 'lazy'
      })
    })
    
    } finally {
    performanceMonitorEnhanced.endMeasure(measurement)
  }
})

onUnmounted(() => {
  cleanupOrders(handleClickOutside)
})
</script>

<style scoped>
@import '@/styles/admin/Orders.css';
</style>
