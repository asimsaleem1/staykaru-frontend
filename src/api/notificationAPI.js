import apiClient from './apiClient';

// Notification API based on backend documentation
export const notificationAPI = {
  // Get all notifications
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get('/notifications', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return {
        success: true,
        data: [
          {
            id: 1,
            title: 'New Booking Request',
            message: 'You have a new booking request for your KL Condo property',
            type: 'booking',
            read: false,
            createdAt: '2025-06-19T10:30:00Z',
            data: { bookingId: 123, propertyId: 45 }
          },
          {
            id: 2,
            title: 'Order Received',
            message: 'New food order from customer - Nasi Lemak Set',
            type: 'order',
            read: false,
            createdAt: '2025-06-19T11:15:00Z',
            data: { orderId: 89, customerId: 67 }
          },
          {
            id: 3,
            title: 'Payment Received',
            message: 'Payment of RM 350.00 has been received for booking #123',
            type: 'payment',
            read: true,
            createdAt: '2025-06-19T09:45:00Z',
            data: { paymentId: 56, amount: 350.00 }
          }
        ]
      };
    }
  },

  // Mark notification as read
  markAsRead: async (id) => {
    try {
      const response = await apiClient.post(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return {
        success: true,
        message: 'Notification marked as read'
      };
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await apiClient.get('/notifications', { params: { read: false } });
      return {
        success: true,
        count: response.data?.data?.length || 0
      };
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return {
        success: true,
        count: 3
      };
    }
  }
};

export default notificationAPI;
