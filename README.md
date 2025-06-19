# StayKaru Mobile App

This is the mobile frontend for the StayKaru platform, a comprehensive campus life solution that helps students find accommodation, food services, and more.

## Authentication System

The application uses a JWT-based authentication system integrated with the StayKaru backend:

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Different dashboards for students, landlords, food providers, and admins
- **Persistent Sessions**: Login state is preserved between app restarts
- **Secure API Requests**: Automatically adds authentication tokens to all API requests

## Project Structure

The project follows a modular architecture with separation of concerns:

```
stekaro-frontend/
├── assets/               # Static assets like images and fonts
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── forms/        # Form-related components
│   │   └── ui/           # UI elements
│   ├── constants/        # Application constants
│   ├── contexts/         # React contexts (AuthContext, etc.)
│   ├── hooks/            # Custom React hooks
│   ├── navigation/       # Navigation configuration
│   ├── screens/          # Screen components
│   │   ├── auth/         # Authentication screens
│   │   └── dashboard/    # Dashboard screens for different user roles
│   ├── services/         # API and other services
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
└── App.tsx              # Main application component
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/stekaro-frontend.git
cd stekaro-frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Update API URL:
   - Navigate to `src/api/apiClient.js`
   - Update the `BASE_URL` to your backend API URL (currently set to production)

### Running the App

Start the development server:
```bash
npm start
# or
yarn start
```

This will open Expo DevTools in your browser. You can then:
- Run on an Android emulator
- Run on an iOS simulator (macOS only)
- Scan the QR code with the Expo Go app on your physical device

## Features

- Authentication (Login/Register)
- Role-based dashboards:
  - Student Dashboard
  - Landlord Dashboard
  - Food Provider Dashboard
  - Admin Dashboard
- Profile Management

## Adding Dependencies

If you need to add more dependencies:

```bash
npm install package-name
# or
yarn add package-name
```

## Build for Production

To create a production build:

```bash
expo build:android
# or
expo build:ios
```

## Backend Integration

The frontend integrates with the StayKaru backend API for authentication and data management:

1. Authentication is handled via JWT tokens
2. API requests automatically include authentication headers
3. Token persistence is managed with AsyncStorage
4. Sessions are maintained across app restarts

### API Endpoints Used

- **POST /auth/register**: Register a new user
- **POST /auth/login**: Login with email and password
- **GET /auth/profile**: Get the current user's profile (protected)

### Authentication Integration

To use authentication in components:

```javascript
import { useAuth } from '../context/AuthContext';

const MyComponent = () => {
  const { login, register, logout, userInfo, isAuthenticated } = useAuth();
  
  // Use auth functions and state as needed
  // ...
};
```

[MIT License](LICENSE)
