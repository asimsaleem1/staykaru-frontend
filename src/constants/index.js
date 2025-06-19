// App Constants
export const API_BASE_URL = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com';

export const USER_ROLES = {
  STUDENT: 'student',
  LANDLORD: 'landlord',
  FOOD_PROVIDER: 'food_provider',
  ADMIN: 'admin',
};

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

export const ACCOMMODATION_STATUS = {
  AVAILABLE: 'available',
  BOOKED: 'booked',
  UNAVAILABLE: 'unavailable',
};

export const FOOD_PROVIDER_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  SUSPENDED: 'suspended',
};

export const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

export const ROLE_OPTIONS = [
  { label: 'Student', value: USER_ROLES.STUDENT },
  { label: 'Landlord', value: USER_ROLES.LANDLORD },
  { label: 'Food Provider', value: USER_ROLES.FOOD_PROVIDER },
];

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

export const AMENITIES = [
  'WiFi',
  'Kitchen',
  'Laundry',
  'Parking',
  'Air Conditioning',
  'Heating',
  'TV',
  'Gym',
  'Pool',
  'Security',
  'Elevator',
  'Balcony',
  'Garden',
  'Pet Friendly',
];

export const CUISINE_TYPES = [
  'Italian',
  'Chinese',
  'Indian',
  'Mexican',
  'Thai',
  'Japanese',
  'American',
  'Mediterranean',
  'French',
  'Greek',
  'Korean',
  'Vietnamese',
  'Lebanese',
  'Turkish',
  'Pakistani',
  'Fast Food',
  'Vegetarian',
  'Vegan',
];

export const ACCOMMODATION_TYPES = [
  'Apartment',
  'House',
  'Room',
  'Studio',
  'Shared Room',
  'Hostel',
  'Dormitory'
];

export const ACCOMMODATION_FEATURES = [
  'Private Bathroom',
  'Shared Bathroom',
  'Kitchen Access',
  'Living Room',
  'Study Area',
  'Storage Space',
  'Bills Included',
  'Internet Included'
];

export const ACCOMMODATION_AMENITIES = [
  'WiFi',
  'Kitchen',
  'Laundry',
  'Parking',
  'Air Conditioning',
  'Heating',
  'TV',
  'Gym',
  'Pool',
  'Security',
  'Elevator',
  'Balcony',
  'Garden',
  'Pet Friendly',
  'Cleaning Service',
  'Maintenance'
];

export const FOOD_CATEGORIES = [
  'Appetizer',
  'Main Course',
  'Dessert',
  'Beverage',
  'Snack',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Side Dish',
  'Soup',
  'Salad',
  'Pizza',
  'Burger',
  'Sandwich',
  'Pasta'
];

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending'
};

// Order statuses with additional ones needed by food providers
export const ORDER_STATUS_EXTENDED = {
  ...ORDER_STATUS,
  PREPARING: 'preparing',
  READY: 'ready',
  REJECTED: 'rejected'
};
