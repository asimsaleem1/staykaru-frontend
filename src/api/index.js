// Main API index file - exports all APIs for easy importing
export { accommodationAPI } from './accommodationAPI';
export { foodAPI, foodProviderAPI, menuItemAPI, orderAPI } from './foodAPI';
export { default as analyticsAPI } from './analyticsAPI';
export { default as locationAPI } from './locationAPI';
export { default as paymentAPI } from './paymentAPI';
export { default as notificationAPI } from './notificationAPI';
export { default as userAPI } from './userAPI';

// Legacy exports from commonAPI for backward compatibility
export { 
  adminAPI, 
  reviewAPI, 
  bookingAPI,
  commonAPI 
} from './commonAPI';

// Re-export with shorter names for convenience
export const apis = {
  accommodation: require('./accommodationAPI').accommodationAPI,
  food: require('./foodAPI').foodAPI,
  analytics: require('./analyticsAPI').default,
  location: require('./locationAPI').default,
  payment: require('./paymentAPI').default,
  notification: require('./notificationAPI').default,
  user: require('./userAPI').default,
  admin: require('./commonAPI').adminAPI,
  review: require('./commonAPI').reviewAPI,
  booking: require('./commonAPI').bookingAPI,
  common: require('./commonAPI').commonAPI
};
