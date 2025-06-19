import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL of the backend API
const API_URL = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the JWT token to all requests
apiClient.interceptors.request.use(
  async (config) => {
    // Get the token from AsyncStorage
    const token = await AsyncStorage.getItem('auth_token');
    
    // If token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 (Unauthorized) and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear tokens from storage on auth error
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
      
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

// Authentication API methods
export const authAPI = {
  // Register a new user
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error);
      throw error.response?.data || error;
    }
  },
  
  // Login user
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      
      // Store the JWT token in AsyncStorage
      if (response.data.access_token) {
        await AsyncStorage.setItem('auth_token', response.data.access_token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error);
      throw error.response?.data || error;
    }
  },
  
  // Get user profile
  getProfile: async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error.response?.data || error);
      throw error.response?.data || error;
    }
  },
  
  // Logout user
  logout: async () => {
    try {
      // Remove token from AsyncStorage
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
};
