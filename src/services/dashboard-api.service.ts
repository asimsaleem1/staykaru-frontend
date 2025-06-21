import api from './api.service';

/**
 * Enhanced API Service for Role-Based Dashboards
 * Based on the comprehensive implementation guide for StayKaru platform
 */

export class DashboardApiService {
  
  // Student Dashboard APIs
  static student = {
    getDashboard: async () => {
      try {
        const [bookingsResponse, ordersResponse] = await Promise.all([
          api.get('/bookings/my-bookings'),
          api.get('/orders/my-orders')
        ]);
        
        const bookings = bookingsResponse.data || [];
        const orders = ordersResponse.data || [];
        
        return {
          stats: {
            totalBookings: bookings.length,
            totalOrders: orders.length,
            activeBookings: bookings.filter((b: any) => b.status === 'confirmed').length,
            pendingOrders: orders.filter((o: any) => ['placed', 'preparing'].includes(o.status)).length
          },
          bookings: bookings.slice(0, 5),
          orders: orders.slice(0, 5)
        };
      } catch (error) {
        console.error('Student dashboard API error:', error);
        throw error;
      }
    },
    
    getBookings: async (status?: string) => {
      const url = status ? `/bookings/my-bookings?status=${status}` : '/bookings/my-bookings';
      return api.get(url);
    },
    
    getOrders: async (status?: string) => {
      const url = status ? `/orders/my-orders?status=${status}` : '/orders/my-orders';
      return api.get(url);
    },
    
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data: any) => api.put('/users/profile', data)
  };

  // Landlord Dashboard APIs
  static landlord = {
    getDashboard: async () => {
      try {
        const [dashboardResponse, propertiesResponse, bookingsResponse] = await Promise.all([
          api.get('/accommodations/landlord/dashboard'),
          api.get('/accommodations/landlord/my-accommodations'),
          api.get('/accommodations/landlord/bookings')
        ]);
        
        return {
          summary: dashboardResponse.data,
          properties: propertiesResponse.data || [],
          recentBookings: bookingsResponse.data?.slice(0, 5) || []
        };
      } catch (error) {
        console.error('Landlord dashboard API error:', error);
        throw error;
      }
    },
    
    getProperties: () => api.get('/accommodations/landlord/my-accommodations'),
    getProperty: (id: string) => api.get(`/accommodations/${id}`),
    createProperty: (data: any) => api.post('/accommodations', data),
    updateProperty: (id: string, data: any) => api.put(`/accommodations/${id}`, data),
    deleteProperty: (id: string) => api.delete(`/accommodations/${id}`),
    
    getBookings: (status?: string) => {
      const url = status ? `/accommodations/landlord/bookings?status=${status}` : '/accommodations/landlord/bookings';
      return api.get(url);
    },
    
    updateBookingStatus: (bookingId: string, status: string) => 
      api.put(`/bookings/${bookingId}/status`, { status }),
    
    getAnalytics: (period = 'month') => 
      api.get(`/accommodations/landlord/analytics?period=${period}`),
      
    getCalendar: (propertyId?: string) => {
      const url = propertyId ? `/accommodations/landlord/calendar/${propertyId}` : '/accommodations/landlord/calendar';
      return api.get(url);
    }
  };

  // Food Provider Dashboard APIs
  static foodProvider = {
    getDashboard: async () => {
      try {
        const [dashboardResponse, restaurantsResponse, ordersResponse] = await Promise.all([
          api.get('/food-providers/owner/dashboard'),
          api.get('/food-providers/owner/my-providers'),
          api.get('/food-providers/owner/orders')
        ]);
        
        return {
          summary: dashboardResponse.data,
          restaurants: restaurantsResponse.data || [],
          recentOrders: ordersResponse.data?.slice(0, 10) || []
        };
      } catch (error) {
        console.error('Food provider dashboard API error:', error);
        throw error;
      }
    },
    
    // Restaurant Management
    getRestaurants: () => api.get('/food-providers/owner/my-providers'),
    getRestaurant: (id: string) => api.get(`/food-providers/${id}`),
    createRestaurant: (data: any) => api.post('/food-providers', data),
    updateRestaurant: (id: string, data: any) => api.put(`/food-providers/${id}`, data),
    deleteRestaurant: (id: string) => api.delete(`/food-providers/${id}`),
    
    // Menu Management
    getMenuItems: (providerId: string) => api.get(`/food-providers/owner/menu-items/${providerId}`),
    createMenuItem: (providerId: string, item: any) => 
      api.post(`/food-providers/owner/menu-items/${providerId}`, item),
    updateMenuItem: (providerId: string, itemId: string, updates: any) => 
      api.put(`/food-providers/owner/menu-items/${providerId}/${itemId}`, updates),
    deleteMenuItem: (providerId: string, itemId: string) => 
      api.delete(`/food-providers/owner/menu-items/${providerId}/${itemId}`),
    
    // Order Management
    getOrders: (providerId?: string, status?: string) => {
      let url = '/food-providers/owner/orders';
      if (providerId) url += `/${providerId}`;
      if (status) url += `?status=${status}`;
      return api.get(url);
    },
    
    updateOrderStatus: (orderId: string, status: string) => 
      api.put(`/orders/${orderId}/status`, { status }),
    
    // Analytics
    getAnalytics: (period = 'month') => 
      api.get(`/food-providers/owner/analytics?period=${period}`),
      
    getSalesReport: (startDate: string, endDate: string) => 
      api.get(`/food-providers/owner/sales?start=${startDate}&end=${endDate}`),
      
    getPopularItems: (providerId?: string) => {
      const url = providerId ? `/food-providers/owner/popular-items/${providerId}` : '/food-providers/owner/popular-items';
      return api.get(url);
    }
  };

  // Admin Dashboard APIs
  static admin = {
    getDashboard: async () => {
      try {
        const [
          dashboardResponse,
          usersResponse,
          accommodationsResponse,
          foodProvidersResponse,
          ordersResponse,
          bookingsResponse,
          analyticsResponse
        ] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/users'),
          api.get('/admin/accommodations'),
          api.get('/admin/food-providers'),
          api.get('/admin/orders'),
          api.get('/admin/bookings'),
          api.get('/admin/analytics')
        ]);

        // Process comprehensive analytics
        const users = usersResponse.data || [];
        const accommodations = accommodationsResponse.data || [];
        const foodProviders = foodProvidersResponse.data || [];
        const orders = ordersResponse.data || [];
        const bookings = bookingsResponse.data || [];

        // Calculate distributions
        const usersByRole = [
          { role: 'student', count: users.filter((u: any) => u.role === 'student').length },
          { role: 'landlord', count: users.filter((u: any) => u.role === 'landlord').length },
          { role: 'food_provider', count: users.filter((u: any) => u.role === 'food_provider').length },
          { role: 'admin', count: users.filter((u: any) => u.role === 'admin').length }
        ];

        const bookingsByStatus = [
          { status: 'pending', count: bookings.filter((b: any) => b.status === 'pending').length },
          { status: 'confirmed', count: bookings.filter((b: any) => b.status === 'confirmed').length },
          { status: 'cancelled', count: bookings.filter((b: any) => b.status === 'cancelled').length },
          { status: 'completed', count: bookings.filter((b: any) => b.status === 'completed').length }
        ];

        const ordersByStatus = [
          { status: 'placed', count: orders.filter((o: any) => o.status === 'placed').length },
          { status: 'preparing', count: orders.filter((o: any) => o.status === 'preparing').length },
          { status: 'ready', count: orders.filter((o: any) => o.status === 'ready').length },
          { status: 'delivered', count: orders.filter((o: any) => o.status === 'delivered').length },
          { status: 'cancelled', count: orders.filter((o: any) => o.status === 'cancelled').length }
        ];

        // Calculate revenue
        const bookingRevenue = bookings.reduce((sum: number, booking: any) => 
          sum + (booking.totalAmount || 0), 0);
        const orderRevenue = orders.reduce((sum: number, order: any) => 
          sum + (order.total_price || 0), 0);

        return {
          counts: {
            users: users.length,
            accommodations: accommodations.length,
            foodProviders: foodProviders.length,
            bookings: bookings.length,
            orders: orders.length,
            revenue: bookingRevenue + orderRevenue
          },
          distributions: {
            usersByRole,
            bookingsByStatus,
            ordersByStatus
          },
          recentActivity: [
            ...users.slice(-5).map((user: any) => ({
              type: 'user_registration',
              description: `${user.name} registered as ${user.role}`,
              timestamp: user.createdAt,
              user: user.name,
              id: user._id
            })),
            ...bookings.slice(-3).map((booking: any) => ({
              type: 'booking_created',
              description: `New booking for ${booking.accommodation?.title || 'accommodation'}`,
              timestamp: booking.createdAt,
              user: booking.user?.name || 'Unknown',
              id: booking._id
            })),
            ...orders.slice(-3).map((order: any) => ({
              type: 'order_placed',
              description: `Order placed at ${order.restaurant?.name || 'restaurant'}`,
              timestamp: order.createdAt,
              user: order.user?.name || 'Unknown',
              id: order._id
            }))
          ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10),
          users: users.slice(0, 20),
          rawData: {
            users,
            accommodations,
            foodProviders,
            orders,
            bookings,
            analytics: analyticsResponse.data
          }
        };
      } catch (error) {
        console.error('Admin dashboard API error:', error);
        throw error;
      }
    },

    // User Management
    getUsers: (role?: string, status?: string) => {
      let url = '/admin/users';
      const params = [];
      if (role) params.push(`role=${role}`);
      if (status) params.push(`status=${status}`);
      if (params.length > 0) url += `?${params.join('&')}`;
      return api.get(url);
    },
    
    getUser: (id: string) => api.get(`/admin/users/${id}`),
    updateUser: (id: string, updates: any) => api.put(`/admin/users/${id}`, updates),
    deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
    suspendUser: (id: string) => api.put(`/admin/users/${id}/suspend`),
    activateUser: (id: string) => api.put(`/admin/users/${id}/activate`),
    changeUserRole: (id: string, role: string) => api.put(`/admin/users/${id}/role`, { role }),

    // Content Management
    getAllAccommodations: () => api.get('/admin/accommodations'),
    approveAccommodation: (id: string) => api.put(`/admin/accommodations/${id}/approve`),
    rejectAccommodation: (id: string, reason: string) => 
      api.put(`/admin/accommodations/${id}/reject`, { reason }),
    
    getAllFoodProviders: () => api.get('/admin/food-providers'),
    approveFoodProvider: (id: string) => api.put(`/admin/food-providers/${id}/approve`),
    rejectFoodProvider: (id: string, reason: string) => 
      api.put(`/admin/food-providers/${id}/reject`, { reason }),

    // Order & Booking Management
    getAllOrders: () => api.get('/admin/orders'),
    getAllBookings: () => api.get('/admin/bookings'),
    resolveDispute: (id: string, resolution: any) => 
      api.put(`/admin/disputes/${id}/resolve`, resolution),

    // Analytics & Reports
    getSystemAnalytics: () => api.get('/admin/analytics'),
    getUserAnalytics: () => api.get('/admin/analytics/users'),
    getRevenueAnalytics: () => api.get('/admin/analytics/revenue'),
    getBookingAnalytics: () => api.get('/admin/analytics/bookings'),
    getOrderAnalytics: () => api.get('/admin/analytics/orders'),
    
    generateReport: (type: string, startDate: string, endDate: string) => 
      api.get(`/admin/reports/${type}?start=${startDate}&end=${endDate}`),

    // System Settings
    getSystemSettings: () => api.get('/admin/settings'),
    updateSystemSettings: (settings: any) => api.put('/admin/settings', settings),
    
    // Content Moderation
    getAllReviews: () => api.get('/admin/reviews'),
    moderateReview: (id: string, action: 'approve' | 'reject', reason?: string) => 
      api.put(`/admin/reviews/${id}/moderate`, { action, reason })
  };

  // Common utilities
  static utils = {
    uploadImage: (file: any, category: 'accommodation' | 'food' | 'profile') => {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('category', category);
      
      return api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },

    search: (query: string, type: 'accommodations' | 'restaurants' | 'users') => 
      api.get(`/search/${type}?q=${encodeURIComponent(query)}`),

    getNotifications: () => api.get('/notifications'),
    markNotificationRead: (id: string) => api.put(`/notifications/${id}/read`),
    
    reportIssue: (data: any) => api.post('/support/report', data),
    getFeedback: () => api.get('/support/feedback'),
    
    // Real-time updates
    subscribeToUpdates: (userRole: string, callback: (data: any) => void) => {
      // WebSocket implementation would go here
      console.log(`Subscribing to real-time updates for ${userRole}`);
    }
  };
}

export default DashboardApiService;
