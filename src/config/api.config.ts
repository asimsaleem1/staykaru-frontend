// API endpoints configuration for different environments
// This allows for easy switching between backend environments and provides a single place to update endpoints

export const API_BASE_URL = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api';

// Main API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    PROFILE: '/api/auth/profile',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    SOCIAL_LOGIN: '/api/auth/social-login',
    LOGOUT: '/api/auth/logout',
  },
  
  // User endpoints
  USERS: {
    LIST: '/users',
    PROFILE: '/users/me',
    DETAILS: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    STATUS: (id: string) => `/users/${id}/status`,
  },
    // Accommodation endpoints
  ACCOMMODATIONS: {
    LIST: '/accommodations',
    DETAILS: (id: string) => `/accommodations/${id}`,
    CREATE: '/accommodations',
    UPDATE: (id: string) => `/accommodations/${id}`,
    DELETE: (id: string) => `/accommodations/${id}`,
    FEATURED: '/accommodations/featured',
  },
  
  // Food provider endpoints
  FOOD_PROVIDERS: {
    LIST: '/food-providers',
    DETAILS: (id: string) => `/food-providers/${id}`,
    CREATE: '/food-providers',
    UPDATE: (id: string) => `/food-providers/${id}`,
    DELETE: (id: string) => `/food-providers/${id}`,
    STATUS: (id: string) => `/food-providers/${id}/status`,
  },
    // Admin endpoints
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    SYSTEM_STATS: '/admin/system/stats',
    USERS: '/admin/users',
    USER_STATUS: (id: string) => `/admin/users/${id}/status`,
    ACCOMMODATIONS: '/admin/accommodations',
    ACCOMMODATION_STATUS: (id: string) => `/admin/accommodations/${id}/status`,
    ACCOMMODATION_APPROVE: (id: string) => `/admin/accommodations/${id}/approve`,
    FOOD_PROVIDERS: '/admin/food-providers',
    FOOD_PROVIDER_STATUS: (id: string) => `/admin/food-providers/${id}/status`,
    FOOD_PROVIDER_APPROVE: (id: string) => `/admin/food-providers/${id}/approve`,
    BOOKINGS: '/admin/bookings',
    BOOKING: (id: string) => `/admin/bookings/${id}`,
    BOOKING_STATUS: (id: string) => `/admin/bookings/${id}/status`,
  },
    // Booking endpoints
  BOOKINGS: {
    LIST: '/bookings',
    DETAILS: (id: string) => `/bookings/${id}`,
    CREATE: '/bookings',
    UPDATE: (id: string) => `/bookings/${id}`,
    DELETE: (id: string) => `/bookings/${id}`,
    USER_BOOKINGS: (userId: string) => `/users/${userId}/bookings`,
  },
};

export default API_ENDPOINTS;
