// Admin Dashboard JavaScript functionality
export const adminDashboard = {
  // Initialize dashboard
  init() {
    this.setupEventListeners()
    this.loadDashboardData()
    this.setupCharts()
  },

  // Setup event listeners
  setupEventListeners() {
    // Toggle sidebar
    const sidebarToggle = document.querySelector('.sidebar-toggle')
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', this.toggleSidebar)
    }

    // Refresh data buttons
    const refreshButtons = document.querySelectorAll('.refresh-data')
    refreshButtons.forEach(button => {
      button.addEventListener('click', this.refreshData)
    })

    // Export buttons
    const exportButtons = document.querySelectorAll('.export-data')
    exportButtons.forEach(button => {
      button.addEventListener('click', this.exportData)
    })
  },

  // Toggle sidebar
  toggleSidebar() {
    const sidebar = document.querySelector('.admin-sidebar')
    const mainContent = document.querySelector('.admin-main-content')
    
    sidebar.classList.toggle('collapsed')
    mainContent.classList.toggle('expanded')
  },

  // Load dashboard data
  async loadDashboardData() {
    try {
      // Load statistics
      await this.loadStatistics()
      
      // Load recent orders
      await this.loadRecentOrders()
      
      // Load top products
      await this.loadTopProducts()
      
      // Load sales chart data
      await this.loadSalesData()
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      this.showError('Failed to load dashboard data')
    }
  },

  // Load statistics
  async loadStatistics() {
    try {
      const response = await fetch('/api/admin/statistics')
      const data = await response.json()
      
      if (data.success) {
        this.updateStatistics(data.statistics)
      }
    } catch (error) {
      console.error('Error loading statistics:', error)
    }
  },

  // Update statistics display
  updateStatistics(stats) {
    const elements = {
      totalOrders: document.querySelector('.stat-total-orders'),
      totalRevenue: document.querySelector('.stat-total-revenue'),
      totalCustomers: document.querySelector('.stat-total-customers'),
      totalProducts: document.querySelector('.stat-total-products')
    }

    if (elements.totalOrders) {
      elements.totalOrders.textContent = stats.totalOrders || 0
    }
    if (elements.totalRevenue) {
      elements.totalRevenue.textContent = this.formatCurrency(stats.totalRevenue || 0)
    }
    if (elements.totalCustomers) {
      elements.totalCustomers.textContent = stats.totalCustomers || 0
    }
    if (elements.totalProducts) {
      elements.totalProducts.textContent = stats.totalProducts || 0
    }
  },

  // Load recent orders
  async loadRecentOrders() {
    try {
      const response = await fetch('/api/admin/orders/recent')
      const data = await response.json()
      
      if (data.success) {
        this.updateRecentOrders(data.orders)
      }
    } catch (error) {
      console.error('Error loading recent orders:', error)
    }
  },

  // Update recent orders display
  updateRecentOrders(orders) {
    const ordersContainer = document.querySelector('.recent-orders-container')
    if (!ordersContainer) return

    const ordersHtml = orders.map(order => `
      <div class="order-item">
        <div class="order-info">
          <div class="order-id">#${order.id}</div>
          <div class="order-customer">${order.customer_name}</div>
          <div class="order-date">${this.formatDate(order.created_at)}</div>
        </div>
        <div class="order-status">
          <span class="status-badge status-${order.status}">${order.status}</span>
        </div>
        <div class="order-total">${this.formatCurrency(order.total)}</div>
      </div>
    `).join('')

    ordersContainer.innerHTML = ordersHtml
  },

  // Load top products
  async loadTopProducts() {
    try {
      const response = await fetch('/api/admin/products/top')
      const data = await response.json()
      
      if (data.success) {
        this.updateTopProducts(data.products)
      }
    } catch (error) {
      console.error('Error loading top products:', error)
    }
  },

  // Update top products display
  updateTopProducts(products) {
    const productsContainer = document.querySelector('.top-products-container')
    if (!productsContainer) return

    const productsHtml = products.map((product, index) => `
      <div class="product-item">
        <div class="product-rank">${index + 1}</div>
        <div class="product-info">
          <div class="product-name">${product.name}</div>
          <div class="product-sales">${product.sales_count} sales</div>
        </div>
        <div class="product-revenue">${this.formatCurrency(product.revenue)}</div>
      </div>
    `).join('')

    productsContainer.innerHTML = productsHtml
  },

  // Setup charts
  setupCharts() {
    // Initialize sales chart
    this.initSalesChart()
    
    // Initialize orders chart
    this.initOrdersChart()
  },

  // Initialize sales chart
  initSalesChart() {
    const ctx = document.getElementById('salesChart')
    if (!ctx) return

    // Chart.js implementation would go here
    },

  // Initialize orders chart
  initOrdersChart() {
    const ctx = document.getElementById('ordersChart')
    if (!ctx) return

    // Chart.js implementation would go here
    },

  // Load sales data
  async loadSalesData() {
    try {
      const response = await fetch('/api/admin/sales/chart-data')
      const data = await response.json()
      
      if (data.success) {
        this.updateSalesChart(data.chartData)
      }
    } catch (error) {
      console.error('Error loading sales data:', error)
    }
  },

  // Update sales chart
  updateSalesChart(chartData) {
    // Chart.js update would go here
    },

  // Refresh data
  async refreshData(event) {
    const button = event.target
    const originalText = button.textContent
    
    button.textContent = 'Refreshing...'
    button.disabled = true
    
    try {
      await this.loadDashboardData()
      this.showSuccess('Data refreshed successfully')
    } catch (error) {
      this.showError('Failed to refresh data')
    } finally {
      button.textContent = originalText
      button.disabled = false
    }
  },

  // Export data
  exportData(event) {
    const button = event.target
    const dataType = button.dataset.type || 'all'
    
    // Implementation for exporting data
    this.showSuccess(`Exporting ${dataType} data...`)
  },

  // Utility functions
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  },

  formatDate(dateString) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString))
  },

  showSuccess(message) {
    // Toast notification implementation
    },

  showError(message) {
    // Toast notification implementation
    console.error('Error:', message)
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  adminDashboard.init()
})
