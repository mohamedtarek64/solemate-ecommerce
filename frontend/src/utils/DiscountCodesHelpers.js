// Discount Codes Helper Functions

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

export const generateDiscountCode = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'active': return 'status-active';
    case 'inactive': return 'status-inactive';
    case 'expired': return 'status-expired';
    default: return 'status-inactive';
  }
};

export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to copy text:', error);
    return false;
  }
};

export const showToast = (message, type = 'success') => {
  const toastContainer = document.querySelector('.toast-container') || createToastContainer();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  toast.innerHTML = `
    <div class="toast-header">
      <span class="toast-title">${type === 'success' ? 'Success' : 'Error'}</span>
      <button class="toast-close">×</button>
    </div>
    <div class="toast-message">${message}</div>
  `;

  toastContainer.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 100);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

const createToastContainer = () => {
  const container = document.createElement('div');
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
};

export const showConfirmationModal = (title, message) => {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';

    modal.innerHTML = `
      <div class="confirm-modal">
        <div class="confirm-icon">⚠️</div>
        <h3 class="confirm-title">${title}</h3>
        <p class="confirm-message">${message}</p>
        <div class="confirm-actions">
          <button class="btn btn-secondary" data-action="cancel">Cancel</button>
          <button class="btn btn-danger" data-action="confirm">Confirm</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target.dataset.action === 'confirm') {
        document.body.removeChild(modal);
        resolve(true);
      } else if (e.target.dataset.action === 'cancel' || e.target.classList.contains('modal-overlay')) {
        document.body.removeChild(modal);
        resolve(false);
      }
    });
  });
};

export const loadDiscountCodes = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/admin/discount-codes', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error loading discount codes:', error);
    throw error;
  }
};

export const createDiscountCode = async (data) => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/admin/discount-codes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating discount code:', error);
    throw error;
  }
};

export const updateDiscountCode = async (id, data) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/admin/discount-codes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating discount code:', error);
    throw error;
  }
};

export const deleteDiscountCode = async (id) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/admin/discount-codes/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting discount code:', error);
    throw error;
  }
};

export const quickAdminLogin = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@solemate.com',
        password: 'admin123'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success && result.token) {
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error during quick admin login:', error);
    return false;
  }
};

export const getDefaultFormData = () => {
  return {
    code: '',
    description: '',
    type: 'percentage',
    value: 10,
    minimum_amount: 0,
    usage_limit: 100,
    starts_at: '',
    expires_at: '',
    is_active: true
  };
};
