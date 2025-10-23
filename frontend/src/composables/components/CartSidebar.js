import { ref, computed } from 'vue'

// Cart Sidebar Composable
export function useCartSidebar() {
  // State
  const isOpen = ref(false)
  const items = ref([])
  const loading = ref(false)

  // Computed
  const total = computed(() => {
    return items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  })

  const itemCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  // Methods
  const close = () => {
    isOpen.value = false
  }

  const updateQuantity = (itemId, quantity) => {
    const item = items.value.find(item => item.id === itemId)
    if (item) {
      if (quantity <= 0) {
        removeItem(itemId)
      } else {
        item.quantity = quantity
      }
    }
  }

  const removeItem = (itemId) => {
    items.value = items.value.filter(item => item.id !== itemId)
  }

  return {
    isOpen,
    items,
    loading,
    total,
    itemCount,
    close,
    updateQuantity,
    removeItem
  }
}

// Legacy export for backward compatibility
export const cartSidebar = {
  // Initialize cart sidebar
  init() {
    this.setupEventListeners()
    this.loadCartItems()
    this.setupAnimations()
  },

  // Setup event listeners
  setupEventListeners() {
    // Toggle sidebar
    const toggleBtn = document.querySelector('.cart-toggle')
    if (toggleBtn) {
      toggleBtn.addEventListener('click', this.toggleSidebar.bind(this))
    }

    // Close sidebar
    const closeBtn = document.querySelector('.cart-close')
    if (closeBtn) {
      closeBtn.addEventListener('click', this.closeSidebar.bind(this))
    }

    // Backdrop click
    const backdrop = document.querySelector('.cart-backdrop')
    if (backdrop) {
      backdrop.addEventListener('click', this.closeSidebar.bind(this))
    }

    // Quantity controls
    document.addEventListener('click', this.handleQuantityChange.bind(this))

    // Remove item
    document.addEventListener('click', this.handleRemoveItem.bind(this))

    // Clear cart
    const clearBtn = document.querySelector('.clear-cart')
    if (clearBtn) {
      clearBtn.addEventListener('click', this.clearCart.bind(this))
    }

    // Checkout button
    const checkoutBtn = document.querySelector('.cart-checkout')
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', this.proceedToCheckout.bind(this))
    }

    // Continue shopping
    const continueBtn = document.querySelector('.continue-shopping')
    if (continueBtn) {
      continueBtn.addEventListener('click', this.continueShopping.bind(this))
    }
  },

  // Setup animations
  setupAnimations() {
    const sidebar = document.querySelector('.cart-sidebar')
    if (sidebar) {
      // Add slide-in animation class
      sidebar.classList.add('slide-in')
    }
  },

  // Toggle sidebar
  toggleSidebar() {
    const sidebar = document.querySelector('.cart-sidebar')
    const backdrop = document.querySelector('.cart-backdrop')

    if (sidebar && backdrop) {
      const isOpen = sidebar.classList.contains('open')

      if (isOpen) {
        this.closeSidebar()
      } else {
        this.openSidebar()
      }
    }
  },

  // Open sidebar
  openSidebar() {
    const sidebar = document.querySelector('.cart-sidebar')
    const backdrop = document.querySelector('.cart-backdrop')
    const body = document.body

    if (sidebar && backdrop) {
      sidebar.classList.add('open')
      backdrop.classList.add('active')
      body.classList.add('cart-open')

      // Load cart items when opening
      this.loadCartItems()

      // Focus management for accessibility
      sidebar.setAttribute('aria-hidden', 'false')
      const firstFocusable = sidebar.querySelector('button, input, select, textarea, a')
      if (firstFocusable) {
        firstFocusable.focus()
      }
    }
  },

  // Close sidebar
  closeSidebar() {
    const sidebar = document.querySelector('.cart-sidebar')
    const backdrop = document.querySelector('.cart-backdrop')
    const body = document.body

    if (sidebar && backdrop) {
      sidebar.classList.remove('open')
      backdrop.classList.remove('active')
      body.classList.remove('cart-open')

      // Accessibility
      sidebar.setAttribute('aria-hidden', 'true')
    }
  },

  // Load cart items
  async loadCartItems() {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      // Get current user ID
      const getCurrentUserId = () => {
        const urlParams = new URLSearchParams(window.location.search)
        const userIdFromUrl = urlParams.get('user_id')
        if (userIdFromUrl) return parseInt(userIdFromUrl)

        const storedUserId = localStorage.getItem('user_id')
        if (storedUserId) return parseInt(storedUserId)

        return 18 // Default for testing
      }

      const response = await fetch(`http://127.0.0.1:8000/api/cart/?user_id=${getCurrentUserId()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          this.cartData = {
            items: data.data.items || [],
            total: data.data.total || 0,
            count: data.data.count || 0
          }
          this.renderCartItems()
          this.updateCartSummary()
          this.updateCartCount()
        } else {
          this.showError('Failed to load cart items')
        }
      } else {
        // If not authenticated or cart is empty, initialize empty cart
        this.cartData = { items: [], total: 0, count: 0 }
        this.renderCartItems()
        this.updateCartSummary()
        this.updateCartCount()
      }
    } catch (error) {
      console.error('Error loading cart items:', error)
      // Initialize empty cart on error
      this.cartData = { items: [], total: 0, count: 0 }
      this.renderCartItems()
      this.updateCartSummary()
      this.updateCartCount()
    }
  },

  // Render cart items
  renderCartItems() {
    const itemsContainer = document.querySelector('.cart-items-list')
    if (!itemsContainer || !this.cartData) return

    if (this.cartData.items.length === 0) {
      itemsContainer.innerHTML = `
        <div class="empty-cart">
          <div class="empty-cart-icon">🛒</div>
          <p class="empty-cart-text">Your cart is empty</p>
          <button class="continue-shopping btn-primary">Continue Shopping</button>
        </div>
      `
      return
    }

    const itemsHtml = this.cartData.items.map(item => `
      <div class="cart-item" data-item-id="${item.id}">
        <div class="item-image">
          <img src="${item.image || item.product_image || '/placeholder-image.jpg'}" alt="${item.name || item.product_name || 'Product'}" loading="lazy">
        </div>

        <div class="item-details">
          <h4 class="item-name">${item.name || item.product_name || 'Loading...'}</h4>
          ${item.variant ? `<p class="item-variant">${item.variant}</p>` : ''}
          <p class="item-price">${this.formatCurrency(item.price || item.product_price || 0)}</p>
        </div>

        <div class="item-controls">
          <div class="quantity-controls">
            <button class="quantity-btn decrease" data-item-id="${item.id}">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13H5v-2h14v2z"/>
              </svg>
            </button>
            <input type="number" class="quantity-input" value="${item.cart_quantity || item.quantity}"
                   min="1" max="${item.stock || 10}" data-item-id="${item.id}">
            <button class="quantity-btn increase" data-item-id="${item.id}">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </button>
          </div>

          <div class="item-total">
            ${this.formatCurrency(item.price * (item.cart_quantity || item.quantity))}
          </div>

          <button class="remove-item" data-item-id="${item.id}" title="Remove item">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      </div>
    `).join('')

    itemsContainer.innerHTML = itemsHtml
  },

  // Update cart summary
  updateCartSummary() {
    if (!this.cartData) return

    const subtotal = this.cartData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const shipping = this.cartData.shipping_cost || 0
    const tax = this.cartData.tax || 0
    const discount = this.cartData.discount || 0
    const total = subtotal + shipping + tax - discount

    // Update subtotal
    const subtotalEl = document.querySelector('.cart-subtotal .amount')
    if (subtotalEl) {
      subtotalEl.textContent = this.formatCurrency(subtotal)
    }

    // Update shipping
    const shippingEl = document.querySelector('.cart-shipping .amount')
    if (shippingEl) {
      shippingEl.textContent = shipping === 0 ? 'Free' : this.formatCurrency(shipping)
    }

    // Update tax
    const taxEl = document.querySelector('.cart-tax .amount')
    if (taxEl) {
      taxEl.textContent = this.formatCurrency(tax)
    }

    // Update discount
    const discountEl = document.querySelector('.cart-discount .amount')
    if (discountEl) {
      if (discount > 0) {
        discountEl.textContent = `-${this.formatCurrency(discount)}`
        discountEl.parentElement.style.display = 'flex'
      } else {
        discountEl.parentElement.style.display = 'none'
      }
    }

    // Update total
    const totalEl = document.querySelector('.cart-total .amount')
    if (totalEl) {
      totalEl.textContent = this.formatCurrency(total)
    }
  },

  // Update cart count in header
  updateCartCount() {
    if (!this.cartData) return

    const count = this.cartData.items.reduce((sum, item) => sum + item.quantity, 0)
    const cartCountElements = document.querySelectorAll('.cart-count, .cart-badge')

    cartCountElements.forEach(element => {
      element.textContent = count
      element.style.display = count > 0 ? 'block' : 'none'
    })
  },

  // Handle quantity change
  handleQuantityChange(event) {
    const target = event.target
    const itemId = target.dataset.itemId

    if (!itemId) return

    if (target.classList.contains('increase')) {
      this.updateQuantity(itemId, 1)
    } else if (target.classList.contains('decrease')) {
      this.updateQuantity(itemId, -1)
    } else if (target.classList.contains('quantity-input')) {
      const newQuantity = parseInt(target.value)
      if (!isNaN(newQuantity) && newQuantity > 0) {
        this.setQuantity(itemId, newQuantity)
      }
    }
  },

  // Update quantity
  async updateQuantity(itemId, change) {
    try {
      const item = this.cartData.items.find(item => item.id == itemId)
      if (!item) return

      const newQuantity = item.quantity + change
      if (newQuantity < 1 || newQuantity > item.stock) return

      await this.setQuantity(itemId, newQuantity)
    } catch (error) {
      console.error('Error updating quantity:', error)
    }
  },

  // Set quantity - OPTIMIZED with fast API
  async setQuantity(itemId, quantity) {
    try {
      const getCurrentUserId = () => {
        const urlParams = new URLSearchParams(window.location.search)
        const userIdFromUrl = urlParams.get('user_id')
        if (userIdFromUrl) return parseInt(userIdFromUrl)

        const storedUserId = localStorage.getItem('user_id')
        if (storedUserId) return parseInt(storedUserId)

        return 18 // Default for testing
      }

      const response = await fetch('http://127.0.0.1:8000/api/cart/update-quantity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          item_id: itemId,
          quantity: quantity,
          user_id: getCurrentUserId()
        })
      })

      const data = await response.json()

      if (data.success) {
        // Update local data immediately for fast UI response
        const item = this.cartData.items.find(item => item.id == itemId)
        if (item) {
          if (data.action === 'removed') {
            this.cartData.items = this.cartData.items.filter(i => i.id != itemId)
          } else {
            item.quantity = quantity
            item.cart_quantity = quantity
          }
        }

        this.renderCartItems()
        this.updateCartSummary()
        this.updateCartCount()
        this.showSuccess(data.message || 'Quantity updated')
      } else {
        this.showError(data.message || 'Failed to update quantity')
      }
    } catch (error) {
      console.error('Error setting quantity:', error)
      this.showError('Failed to update quantity')
    }
  },

  // Handle remove item
  handleRemoveItem(event) {
    const target = event.target.closest('.remove-item')
    if (!target) return

    const itemId = target.dataset.itemId
    if (itemId) {
      this.removeItem(itemId)
    }
  },

  // Remove item
  async removeItem(itemId) {
    if (!confirm('Are you sure you want to remove this item from your cart?')) {
      return
    }

    try {
      const response = await fetch('/api/cart/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          item_id: itemId
        })
      })

      const data = await response.json()

      if (data.success) {
        this.cartData = data.cart
        this.renderCartItems()
        this.updateCartSummary()
        this.updateCartCount()
        this.showSuccess('Item removed from cart')
      } else {
        this.showError(data.message || 'Failed to remove item')
      }
    } catch (error) {
      console.error('Error removing item:', error)
      this.showError('Failed to remove item')
    }
  },

  // Clear cart
  async clearCart() {
    if (!confirm('Are you sure you want to clear your entire cart?')) {
      return
    }

    try {
      const response = await fetch('/api/cart/clear', {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        this.cartData = { items: [], total: 0 }
        this.renderCartItems()
        this.updateCartSummary()
        this.updateCartCount()
        this.showSuccess('Cart cleared successfully')
      } else {
        this.showError(data.message || 'Failed to clear cart')
      }
    } catch (error) {
      console.error('Error clearing cart:', error)
      this.showError('Failed to clear cart')
    }
  },

  // Proceed to checkout
  proceedToCheckout() {
    if (!this.cartData || this.cartData.items.length === 0) {
      this.showError('Your cart is empty')
      return
    }

    this.closeSidebar()
    window.location.href = '/checkout'
  },

  // Continue shopping
  continueShopping() {
    this.closeSidebar()
    window.location.href = '/products'
  },

  // Utility functions
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  },

  showSuccess(message) {
    // Toast notification implementation
    // Create temporary success message
    const toast = document.createElement('div')
    toast.className = 'cart-toast success'
    toast.textContent = message
    document.body.appendChild(toast)

    setTimeout(() => {
      toast.remove()
    }, 3000)
  },

  showError(message) {
    // Toast notification implementation
    console.error('Error:', message)

    // Create temporary error message
    const toast = document.createElement('div')
    toast.className = 'cart-toast error'
    toast.textContent = message
    document.body.appendChild(toast)

    setTimeout(() => {
      toast.remove()
    }, 3000)
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (typeof cartSidebar !== 'undefined') {
    cartSidebar.init()
  }
})

// Export for use in Vue components
export default cartSidebar
