# StayKaru App Features and Requirements

## Overview

StayKaru is a comprehensive platform designed to serve students, landlords, and food providers. The application allows students to find accommodation, order food, make bookings, and manage payments. Landlords can list and manage properties, while food providers can manage their menus and fulfill orders.

## User Roles

The application supports the following user roles, each with specific permissions and features:

1. **Student**: The primary user role, able to search for accommodation, make bookings, order food, and leave reviews.
2. **Landlord**: Property owners who can list, update, and manage their accommodations.
3. **Food Provider**: Restaurants and food services that can list menu items and fulfill orders.
4. **Admin**: System administrators with full access to all features and administrative functions.

## Authentication

The application uses JWT-based authentication with the following endpoints:

- `POST /auth/register`: Register a new user
- `POST /auth/login`: Log in an existing user
- `GET /auth/profile`: Get the current user's profile information

### Required Registration Fields

- `name`: Full name of the user
- `email`: Email address (must be unique)
- `password`: Password for the account
- `phone`: Phone number
- `gender`: Gender ('male', 'female', or 'other')
- `role`: User role ('student', 'landlord', 'food_provider', or 'admin')

## Feature Breakdown by Role

### 1. Common Features (All Users)

#### Profile Management
- View and edit profile information
- Change password
- View personal activity history

**Screens Required**:
- Profile Screen
- Edit Profile Screen
- Change Password Screen
- Activity History Screen

**API Endpoints**:
- `GET /auth/profile`: Get user profile
- `PUT /users/:id`: Update user profile

#### Notification System
- Receive notifications for bookings, orders, and system messages
- Mark notifications as read

**Screens Required**:
- Notifications List Screen
- Notification Detail Screen

**API Endpoints**:
- `GET /notifications`: Get all notifications for the current user
- `POST /notifications/:id/read`: Mark a notification as read

### 2. Student Features

#### Accommodation Management
- Search for accommodations by location, price, and amenities
- View accommodation details and photos
- Book accommodations
- View booking history and status
- Cancel bookings
- Pay for bookings
- Leave reviews for accommodations

**Screens Required**:
- Accommodation Search Screen
- Accommodation Filters Screen
- Accommodation Detail Screen
- Booking Form Screen
- Booking Confirmation Screen
- Booking History Screen
- Booking Detail Screen
- Payment Screen
- Review Form Screen

**API Endpoints**:
- `GET /accommodations`: List all accommodations with optional filters
- `GET /accommodations/nearby`: Find accommodations near a location
- `GET /accommodations/:id`: Get accommodation details
- `POST /bookings`: Create a new booking
- `GET /bookings/my-bookings`: Get current user's bookings
- `GET /bookings/:id`: Get booking details
- `PUT /bookings/:id/status`: Update booking status
- `POST /payments`: Create a payment
- `GET /payments/my-payments`: Get current user's payments
- `POST /reviews`: Create a review

#### Food Ordering
- Browse food providers
- View menu items
- Create food orders
- Track order status
- Pay for orders
- Leave reviews for food providers

**Screens Required**:
- Food Providers List Screen
- Food Provider Detail Screen
- Menu Items Screen
- Order Form Screen
- Order Confirmation Screen
- Order History Screen
- Order Detail Screen
- Food Payment Screen
- Food Review Form Screen

**API Endpoints**:
- `GET /food-providers`: List all food providers
- `GET /food-providers/:id`: Get food provider details
- `GET /menu-items`: Get menu items (with optional provider filter)
- `POST /orders`: Create a new order
- `GET /orders/my-orders`: Get current user's orders
- `GET /orders/:id`: Get order details

#### Location Services
- Browse cities and countries
- View nearby services

**Screens Required**:
- Cities List Screen
- City Detail Screen

**API Endpoints**:
- `GET /location/countries`: Get all countries
- `GET /location/cities`: Get all cities
- `GET /location/cities/nearby`: Find cities near a location

### 3. Landlord Features

#### Property Management
- Add new accommodations
- Update accommodation details
- Remove accommodations
- View booking requests
- Accept or reject bookings
- Manage payments

**Screens Required**:
- My Properties Screen
- Add Property Screen
- Edit Property Screen
- Property Booking Requests Screen
- Landlord Payment History Screen

**API Endpoints**:
- `POST /accommodations`: Create a new accommodation
- `PUT /accommodations/:id`: Update an accommodation
- `DELETE /accommodations/:id`: Delete an accommodation
- `GET /bookings/landlord-bookings`: Get bookings for landlord's properties

#### Analytics
- View booking statistics
- View payment reports

**Screens Required**:
- Landlord Dashboard Screen
- Booking Analytics Screen
- Payment Analytics Screen

**API Endpoints**:
- `GET /analytics/bookings`: Get booking analytics
- `GET /analytics/payments`: Get payment analytics

### 4. Food Provider Features

#### Menu Management
- Add menu items
- Update menu items
- Remove menu items
- View order requests
- Accept or reject orders
- Manage payments

**Screens Required**:
- My Menu Screen
- Add Menu Item Screen
- Edit Menu Item Screen
- Order Requests Screen
- Food Provider Payment History Screen

**API Endpoints**:
- `POST /menu-items`: Create a new menu item
- `PUT /menu-items/:id`: Update a menu item
- `DELETE /menu-items/:id`: Delete a menu item
- `GET /orders/provider-orders`: Get orders for the food provider

#### Analytics
- View order statistics
- View payment reports

**Screens Required**:
- Food Provider Dashboard Screen
- Order Analytics Screen
- Food Payment Analytics Screen

**API Endpoints**:
- `GET /analytics/orders`: Get order analytics

### 5. Admin Features

#### User Management
- View all users
- Edit user details
- Deactivate users

**Screens Required**:
- Admin Users List Screen
- Admin User Detail Screen
- Admin Edit User Screen

**API Endpoints**:
- `GET /users`: Get all users (admin only)
- `PUT /users/:id`: Update a user (admin only)
- `DELETE /users/:id`: Delete a user (admin only)

#### Content Management
- Manage countries and cities
- Approve or reject reviews

**Screens Required**:
- Admin Location Management Screen
- Admin Review Management Screen

**API Endpoints**:
- `POST /location/countries`: Create a country
- `PUT /location/countries/:id`: Update a country
- `DELETE /location/countries/:id`: Delete a country
- `POST /location/cities`: Create a city
- `PUT /location/cities/:id`: Update a city
- `DELETE /location/cities/:id`: Delete a city
- `PUT /reviews/:id/verify`: Verify a review

#### System Analytics
- View overall system statistics
- Generate reports

**Screens Required**:
- Admin Dashboard Screen
- System Reports Screen

**API Endpoints**:
- `GET /analytics/bookings`: Get booking analytics
- `GET /analytics/orders`: Get order analytics
- `GET /analytics/payments`: Get payment analytics

## Screen Flow Diagrams

### Authentication Flow

```
Login Screen → [Success] → Home Screen
          ↓
          → [New User] → Register Screen → [Success] → Home Screen
```

### Student Flow

```
Home Screen → [Accommodation] → Accommodation Search → Accommodation Detail → Booking Form → Booking Confirmation
          ↓
          → [Food] → Food Providers List → Food Provider Detail → Menu Items → Order Form → Order Confirmation
          ↓
          → [Profile] → Profile Screen → [Edit] → Edit Profile Screen
          ↓
          → [Bookings] → Booking History → Booking Detail
          ↓
          → [Orders] → Order History → Order Detail
          ↓
          → [Payments] → Payment History
          ↓
          → [Notifications] → Notification List → Notification Detail
```

### Landlord Flow

```
Home Screen → [Properties] → My Properties → [Add] → Add Property Screen
                        ↓
                        → [Edit] → Edit Property Screen
          ↓
          → [Bookings] → Landlord Booking Requests → Booking Detail
          ↓
          → [Payments] → Landlord Payment History
          ↓
          → [Analytics] → Landlord Dashboard → Booking Analytics / Payment Analytics
          ↓
          → [Profile] → Profile Screen → [Edit] → Edit Profile Screen
          ↓
          → [Notifications] → Notification List → Notification Detail
```

### Food Provider Flow

```
Home Screen → [Menu] → My Menu → [Add] → Add Menu Item Screen
                   ↓
                   → [Edit] → Edit Menu Item Screen
          ↓
          → [Orders] → Order Requests → Order Detail
          ↓
          → [Payments] → Food Provider Payment History
          ↓
          → [Analytics] → Food Provider Dashboard → Order Analytics / Payment Analytics
          ↓
          → [Profile] → Profile Screen → [Edit] → Edit Profile Screen
          ↓
          → [Notifications] → Notification List → Notification Detail
```

## Technical Details

### API Base URL

```
https://staykaru-backend-60ed08adb2a7.herokuapp.com
```

### Authentication

All authenticated requests should include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Response Format

Most API responses follow this structure:

```json
{
  "message": "Success message",
  "data": { ... } // Response data
}
```

Error responses:

```json
{
  "message": "Error message",
  "error": "Error type",
  "statusCode": 400 // HTTP status code
}
```

### Pagination

List endpoints support pagination with the following query parameters:

- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 10)

Example: `/accommodations?page=2&limit=20`

## Data Models

### User

```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "gender": "male | female | other",
  "role": "student | landlord | food_provider | admin",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Accommodation

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "price": "number",
  "landlordId": "string",
  "city": "string",
  "country": "string",
  "address": "string",
  "location": {
    "type": "Point",
    "coordinates": [longitude, latitude]
  },
  "amenities": ["string"],
  "images": ["string"],
  "availableFrom": "date",
  "availableTo": "date",
  "status": "available | booked | unavailable",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Booking

```json
{
  "id": "string",
  "accommodationId": "string",
  "userId": "string",
  "checkIn": "date",
  "checkOut": "date",
  "guests": "number",
  "totalPrice": "number",
  "status": "pending | confirmed | cancelled | completed",
  "paymentStatus": "pending | paid | refunded",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Food Provider

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "ownerId": "string",
  "city": "string",
  "country": "string",
  "address": "string",
  "location": {
    "type": "Point",
    "coordinates": [longitude, latitude]
  },
  "cuisineType": ["string"],
  "images": ["string"],
  "openingHours": {
    "monday": { "open": "time", "close": "time" },
    // Other days...
  },
  "status": "open | closed | suspended",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Menu Item

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "price": "number",
  "providerId": "string",
  "category": "string",
  "image": "string",
  "available": "boolean",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Order

```json
{
  "id": "string",
  "userId": "string",
  "providerId": "string",
  "items": [
    {
      "menuItemId": "string",
      "quantity": "number",
      "price": "number",
      "name": "string"
    }
  ],
  "totalPrice": "number",
  "deliveryAddress": "string",
  "status": "pending | confirmed | in_progress | delivered | cancelled",
  "paymentStatus": "pending | paid | refunded",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Payment

```json
{
  "id": "string",
  "userId": "string",
  "amount": "number",
  "currency": "string",
  "status": "pending | completed | failed | refunded",
  "paymentMethod": "string",
  "transactionId": "string",
  "referenceType": "booking | order",
  "referenceId": "string",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Review

```json
{
  "id": "string",
  "userId": "string",
  "targetType": "accommodation | food_provider",
  "targetId": "string",
  "rating": "number",
  "comment": "string",
  "verified": "boolean",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Notification

```json
{
  "id": "string",
  "userId": "string",
  "title": "string",
  "message": "string",
  "type": "string",
  "referenceType": "booking | order | payment",
  "referenceId": "string",
  "read": "boolean",
  "createdAt": "date",
  "updatedAt": "date"
}
```

## Development Guidelines

### Required Dependencies

```json
{
  "dependencies": {
    "@react-native-async-storage/async-storage": "^1.x.x",
    "@react-navigation/bottom-tabs": "^6.x.x",
    "@react-navigation/native": "^6.x.x",
    "@react-navigation/stack": "^6.x.x",
    "axios": "^1.x.x",
    "expo": "^49.x.x",
    "expo-image-picker": "^14.x.x",
    "expo-location": "^16.x.x",
    "expo-secure-store": "^12.x.x",
    "formik": "^2.x.x",
    "react": "18.x.x",
    "react-native": "0.72.x",
    "react-native-gesture-handler": "^2.x.x",
    "react-native-maps": "^1.x.x",
    "react-native-safe-area-context": "^4.x.x",
    "react-native-screens": "^3.x.x",
    "yup": "^1.x.x"
  }
}
```

### Style Guide

- Use a consistent color scheme throughout the app
- Primary colors: `#4A6572` (dark blue), `#F9AA33` (yellow)
- Secondary colors: `#FF6B6B` (red), `#4ECDC4` (teal)
- Font families: 'Roboto' for regular text, 'Roboto-Bold' for headings
- Form input heights should be 50px
- Buttons should have rounded corners (8px border radius)
- Use shadows for cards and raised elements

### Folder Structure

```
src/
  ├── api/
  │   ├── apiClient.js
  │   ├── authAPI.js
  │   ├── accommodationAPI.js
  │   └── ...
  ├── assets/
  │   ├── images/
  │   └── icons/
  ├── components/
  │   ├── common/
  │   │   ├── Button.js
  │   │   ├── Input.js
  │   │   └── ...
  │   ├── accommodation/
  │   └── ...
  ├── context/
  │   ├── AuthContext.js
  │   └── ...
  ├── navigation/
  │   ├── AppNavigator.js
  │   ├── AuthNavigator.js
  │   └── ...
  ├── screens/
  │   ├── auth/
  │   │   ├── LoginScreen.js
  │   │   └── RegisterScreen.js
  │   ├── student/
  │   ├── landlord/
  │   ├── foodProvider/
  │   └── admin/
  ├── utils/
  │   ├── validation.js
  │   ├── formatters.js
  │   └── ...
  └── App.js
```

## Conclusion

This document outlines the complete feature set, screens, and API endpoints for the StayKaru application. Frontend developers should follow this guide to ensure that all required functionality is implemented correctly. The app is designed to serve multiple user roles with specific features for each role, and the API endpoints are structured to support these different use cases.

For any questions or clarifications, please refer to the API documentation or contact the backend team for assistance.
