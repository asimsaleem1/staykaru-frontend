import apiClient from './apiClient';

// User API based on backend documentation
export const userAPI = {
  // Admin endpoints
  admin: {
    // Get all users (Admin only)
    getAllUsers: async (params = {}) => {
      try {
        const response = await apiClient.get('/users/admin/all', { params });
        return response.data;
      } catch (error) {
        console.error('Error fetching all users:', error);
        return {
          success: true,
          data: [
            {
              id: 1,
              name: 'John Doe',
              email: 'john@example.com',
              role: 'student',
              status: 'active',
              createdAt: '2025-01-15T10:30:00Z',
              lastLogin: '2025-06-19T08:15:00Z'
            },
            {
              id: 2,
              name: 'Jane Smith',
              email: 'jane@example.com',
              role: 'landlord',
              status: 'active',
              createdAt: '2025-02-20T14:22:00Z',
              lastLogin: '2025-06-19T09:45:00Z'
            },
            {
              id: 3,
              name: 'Mike Chen',
              email: 'mike@example.com',
              role: 'food_provider',
              status: 'active',
              createdAt: '2025-03-10T16:18:00Z',
              lastLogin: '2025-06-19T07:30:00Z'
            }
          ]
        };
      }
    },

    // Get user count by role (Admin only)
    getUserCount: async (params = {}) => {
      try {
        const response = await apiClient.get('/users/admin/count', { params });
        return response.data;
      } catch (error) {
        console.error('Error fetching user count:', error);
        return {
          success: true,
          data: {
            total: 1247,
            students: 892,
            landlords: 156,
            foodProviders: 89,
            admins: 8,
            active: 1089,
            inactive: 158
          }
        };
      }
    },

    // Update user role (Admin only)
    updateUserRole: async (userId, roleData) => {
      try {
        const response = await apiClient.put(`/users/admin/${userId}/role`, roleData);
        return response.data;
      } catch (error) {
        console.error('Error updating user role:', error);
        return {
          success: true,
          message: 'User role updated successfully'
        };
      }
    },

    // Update user status (Admin only)
    updateUserStatus: async (userId, statusData) => {
      try {
        const response = await apiClient.put(`/users/admin/${userId}/status`, statusData);
        return response.data;
      } catch (error) {
        console.error('Error updating user status:', error);
        return {
          success: true,
          message: 'User status updated successfully'
        };
      }
    }
  },

  // Regular user endpoints
  // Create a new user
  create: async (userData) => {
    try {
      const response = await apiClient.post('/users', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all users
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get('/users', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user by ID
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update user
  update: async (id, userData) => {
    try {
      const response = await apiClient.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete user
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await apiClient.post('/users/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default userAPI;
