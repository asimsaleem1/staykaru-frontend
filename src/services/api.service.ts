import axios from 'axios';
import { LoginCredentials, RegisterData, User } from '../types/auth.types';

// Create axios instance with base URL - Remove /api since backend doesn't have global prefix
const api = axios.create({
  baseURL: 'https://staykaru-backend.herokuapp.com', // Updated: removed /api
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
  const response = await api.get('/users/profile'); // Updated: users instead of user
  return response.data;
};

export const verifyToken = async (token: string) => {
  const response = await api.post('/auth/verify-token', { token });
  return response.data;
};

export default api;
