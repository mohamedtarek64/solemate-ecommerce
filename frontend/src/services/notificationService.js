import { notificationsAPI } from './api'

class NotificationService {
  constructor() {
    this.notifications = [];
    this.unreadCount = 0;
  }

  // Get notifications
  async getNotifications(params = {}) {
    try {
      const response = await api.get('/notifications', { params })
      const data = response.data.data || response.data;
      
      this.notifications = data || [];
      this.updateUnreadCount();
      
      return {
        success: true,
        data: data,
        meta: response.data.meta
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch notifications'
      };
    }
  }

  // Mark notification as read
  async markAsRead(id) {
    try {
      const response = await api.put(`/notifications/${id}/read`)
      
      // Update local notification
      const notification = this.notifications.find(n => n.id === id);
      if (notification) {
        notification.read_at = new Date().toISOString();
      }
      this.updateUnreadCount();
      
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to mark notification as read'
      };
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const response = await api.put('/notifications/read-all')
      
      // Update local notifications
      this.notifications.forEach(notification => {
        if (!notification.read_at) {
          notification.read_at = new Date().toISOString();
        }
      });
      this.unreadCount = 0;
      
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to mark all notifications as read'
      };
    }
  }

  // Delete notification
  async deleteNotification(id) {
    try {
      const response = await api.delete(`/notifications/${id}`)
      
      // Remove from local notifications
      this.notifications = this.notifications.filter(n => n.id !== id);
      this.updateUnreadCount();
      
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete notification'
      };
    }
  }

  // Get unread count
  async getUnreadCount() {
    try {
      const response = await api.get('/notifications/unread-count')
      const count = response.data.data?.count || response.data.count || 0;
      
      this.unreadCount = count;
      
      return {
        success: true,
        count: count
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get unread count'
      };
    }
  }

  // Get notification settings
  async getSettings() {
    try {
      const response = await api.get('/notifications/settings')
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch notification settings'
      };
    }
  }

  // Update notification settings
  async updateSettings(settings) {
    try {
      const response = await api.put('/notifications/settings', settings)
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update notification settings'
      };
    }
  }

  // Update unread count locally
  updateUnreadCount() {
    this.unreadCount = this.notifications.filter(n => !n.read_at).length;
  }

  // Get notifications
  getNotifications() {
    return this.notifications;
  }

  // Get unread notifications
  getUnreadNotifications() {
    return this.notifications.filter(n => !n.read_at);
  }

  // Get read notifications
  getReadNotifications() {
    return this.notifications.filter(n => n.read_at);
  }

  // Get unread count
  getUnreadCount() {
    return this.unreadCount;
  }

  // Check if notification is read
  isNotificationRead(notification) {
    return !!notification.read_at;
  }

  // Get notification type icon
  getNotificationTypeIcon(type) {
    const iconMap = {
      'order_placed': 'shopping-bag',
      'order_shipped': 'truck',
      'order_delivered': 'check-circle',
      'order_cancelled': 'x-circle',
      'payment_successful': 'credit-card',
      'payment_failed': 'alert-circle',
      'product_back_in_stock': 'package',
      'price_drop': 'trending-down',
      'review_reminder': 'star',
      'welcome': 'user-plus',
      'promotion': 'gift',
      'system': 'settings'
    };
    return iconMap[type] || 'bell';
  }

  // Get notification type color
  getNotificationTypeColor(type) {
    const colorMap = {
      'order_placed': 'success',
      'order_shipped': 'info',
      'order_delivered': 'success',
      'order_cancelled': 'warning',
      'payment_successful': 'success',
      'payment_failed': 'danger',
      'product_back_in_stock': 'info',
      'price_drop': 'warning',
      'review_reminder': 'primary',
      'welcome': 'success',
      'promotion': 'primary',
      'system': 'secondary'
    };
    return colorMap[type] || 'primary';
  }

  // Format notification date
  formatNotificationDate(date) {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMs = now - notificationDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else {
      return notificationDate.toLocaleDateString();
    }
  }

  // Group notifications by date
  groupNotificationsByDate(notifications) {
    const grouped = {};
    
    notifications.forEach(notification => {
      const date = new Date(notification.created_at).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(notification);
    });
    
    return grouped;
  }

  // Sort notifications by date (newest first)
  sortNotificationsByDate(notifications) {
    return notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // Filter notifications by type
  filterNotificationsByType(notifications, type) {
    return notifications.filter(n => n.type === type);
  }

  // Filter notifications by read status
  filterNotificationsByReadStatus(notifications, isRead) {
    return notifications.filter(n => !!n.read_at === isRead);
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;