import axios from 'axios';
import { LoginCredentials, RegisterData, User } from '../types/auth.types';
import { API_BASE_URL } from '../config/api.config';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to set auth token for requests
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Auth API functions
export const loginUser = async (credentials: LoginCredentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (userData: RegisterData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const getCurrentUser = async () => {
  try {
    // First try user ID from local storage or context
    const userId = localStorage.getItem('userId');
    if (userId) {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    }
    
    // If no user ID, try to get user profile from token
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (innerError) {
      // If that fails, try the legacy endpoint
      const response = await api.get('/users/profile');
      return response.data;
    }
  } catch (error) {
    console.error('Failed to get current user:', error);
    throw error;
  }
};

export const updateUserProfile = async (userData: Partial<User>) => {
  try {
    // Try using the user ID from local storage
    const userId = localStorage.getItem('userId');
    if (userId) {
      try {
        // Try PATCH first, as it's more common for partial updates
        const response = await api.patch(`/users/${userId}`, userData);
        return response.data;
      } catch (patchError) {
        // If PATCH fails, try PUT
        const response = await api.put(`/users/${userId}`, userData);
        return response.data;
      }
    }
    
    // If no user ID, try standard endpoints
    try {
      const response = await api.patch('/users/me', userData);
      return response.data;
    } catch (error) {
      // If that fails, try PUT
      try {
        const response = await api.put('/users/me', userData);
        return response.data;
      } catch (innerError) {
        // Last attempt with legacy endpoint
        const response = await api.patch('/users/profile', userData);
        return response.data;
      }
    }
  } catch (error) {
    console.error('Failed to update user profile:', error);
    throw error;
  }
};

export const verifyToken = async (token: string) => {
  const response = await api.post('/auth/verify-token', { token });
  return response.data;
};

// Admin API functions
export const adminAPI = {
  // User management
  updateUserStatus: async (userId: string, isActive: boolean) => {
    const response = await api.put(`/admin/users/${userId}/status`, { isActive });
    return response.data;
  },

  // Accommodation management
  updateAccommodationStatus: async (accommodationId: string, isActive: boolean) => {
    const response = await api.put(`/admin/accommodations/${accommodationId}/status`, { isActive });
    return response.data;
  },

  approveAccommodation: async (accommodationId: string, approvalStatus: string, isActive: boolean) => {
    const response = await api.put(`/admin/accommodations/${accommodationId}/approve`, { 
      approvalStatus, 
      isActive 
    });
    return response.data;
  },
  // Food provider management
  updateFoodProviderStatus: async (providerId: string, isActive: boolean) => {
    try {
      const response = await api.put(`/admin/food-providers/${providerId}/status`, { isActive });
      return response.data;
    } catch (error) {
      console.error(`Failed to update food provider ${providerId} status:`, error);
      // Try alternative endpoints
      try {
        const response = await api.put(`/food-providers/${providerId}/status`, { isActive });
        return response.data;
      } catch (fallbackError) {
        // Try patch method
        try {
          const response = await api.patch(`/admin/food-providers/${providerId}`, { isActive });
          return response.data;
        } catch (patchError) {
          console.error('All food provider status update endpoints failed');
          throw error; // Throw the original error
        }
      }
    }
  },

  approveFoodProvider: async (providerId: string, approvalStatus: string, isActive: boolean) => {
    try {
      const response = await api.put(`/admin/food-providers/${providerId}/approve`, { 
        approvalStatus, 
        isActive 
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to approve food provider ${providerId}:`, error);
      // Try alternative endpoints
      try {
        const response = await api.put(`/food-providers/${providerId}/approve`, { 
          approvalStatus, 
          isActive 
        });
        return response.data;
      } catch (fallbackError) {
        // Try with different payload structure
        try {
          const response = await api.patch(`/admin/food-providers/${providerId}`, { 
            status: approvalStatus,
            isActive 
          });
          return response.data;
        } catch (patchError) {
          console.error('All food provider approval endpoints failed');
          throw error; // Throw the original error
        }
      }
    }
  },

  // System reports
  getSystemStats: async () => {
    const response = await api.get('/admin/system/stats');
    return response.data;
  },

  // Booking management
  getAllBookings: async () => {
    try {
      const response = await api.get('/admin/bookings');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch all bookings:', error);
      // Try alternative endpoint if the first one fails
      try {
        const response = await api.get('/bookings');
        return response.data;
      } catch (fallbackError) {
        console.error('Failed to fetch bookings from fallback endpoint:', fallbackError);
        throw error; // Throw the original error
      }
    }
  },

  getBookingById: async (bookingId: string) => {
    try {
      const response = await api.get(`/admin/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch booking ${bookingId}:`, error);
      // Try alternative endpoint
      try {
        const response = await api.get(`/bookings/${bookingId}`);
        return response.data;
      } catch (fallbackError) {
        throw error;
      }
    }
  },

  updateBookingStatus: async (bookingId: string, status: string) => {
    try {
      const response = await api.put(`/admin/bookings/${bookingId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Failed to update booking ${bookingId} status:`, error);
      throw error;
    }
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

export default api;
