# 🔐 Frontend Agent Prompt - Login & Registration Implementation

## 🎯 TASK OVERVIEW
Create complete **Login and Registration screens** for the StayKaru React Native mobile app with full backend integration and database connectivity.

## 🔗 BACKEND API STATUS
✅ **Authentication APIs are LIVE and TESTED** on: `https://staykaru-backend-60ed08adb2a7.herokuapp.com`

## 📋 WHAT TO IMPLEMENT

### 🚪 LOGIN PAGE

**API Endpoint:**
```javascript
POST /auth/login
Content-Type: application/json

// Request Body:
{
  "email": "user@example.com",
  "password": "password123"
}

// Response (Success - 200/201):
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id_here",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "student",
    "isActive": true,
    "createdAt": "2025-06-19T00:00:00.000Z"
  },
  "expires_in": 86400
}

// Response (Error - 401):
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

**Login Screen Features:**
- Email and password input fields with validation
- "Remember Me" toggle to save login credentials
- "Forgot Password" link (for future implementation)
- Social login buttons (Google, Facebook) - UI only for now
- Form validation with error messages
- Loading state during authentication
- Auto-redirect based on user role after successful login

### 📝 REGISTRATION PAGE

**API Endpoint:**
```javascript
POST /auth/register
Content-Type: application/json

// Request Body:
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "role": "student",
  "phone": "+92300123456",
  "dateOfBirth": "1995-05-15",
  "gender": "male",
  "university": "University of Punjab",
  "address": {
    "street": "123 Main Street",
    "city": "Lahore",
    "state": "Punjab",
    "zipCode": "54000",
    "country": "Pakistan"
  }
}

// Response (Success - 201):
{
  "message": "User registered successfully",
  "user": {
    "_id": "new_user_id",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "student",
    "isActive": true,
    "createdAt": "2025-06-19T00:00:00.000Z"
  }
}

// Response (Error - 400):
{
  "statusCode": 400,
  "message": ["email must be a valid email", "password must be longer than 6 characters"],
  "error": "Bad Request"
}
```

**Registration Screen Features:**
- Multi-step registration form (3-4 steps)
- Personal information: Name, Email, Phone, Date of Birth, Gender
- Account details: Password, Confirm Password, Role selection
- Address information: Street, City, State, Zip Code, Country  
- University/Institution selection (for students)
- Terms and conditions acceptance checkbox
- Form validation with real-time error messages
- Progress indicator for multi-step form
- Back/Next navigation between steps

## 🔧 TECHNICAL IMPLEMENTATION

### API Service Layer
```javascript
// services/authService.js
const API_BASE_URL = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com';

export const authService = {
  // Login function
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      return data;
    } catch (error) {
      throw new Error(error.message || 'Network error');
    }
  },

  // Registration function
  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      return data;
    } catch (error) {
      throw new Error(error.message || 'Network error');
    }
  },

  // Save user session
  saveUserSession: async (authData) => {
    try {
      await AsyncStorage.setItem('access_token', authData.access_token);
      await AsyncStorage.setItem('refresh_token', authData.refresh_token);
      await AsyncStorage.setItem('user_data', JSON.stringify(authData.user));
    } catch (error) {
      console.error('Error saving user session:', error);
    }
  },

  // Get saved session
  getUserSession: async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const userData = await AsyncStorage.getItem('user_data');
      
      if (token && userData) {
        return {
          access_token: token,
          user: JSON.parse(userData)
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user session:', error);
      return null;
    }
  },

  // Logout function
  logout: async () => {
    try {
      await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_data']);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
};
```

### Form Validation Schema
```javascript
// utils/validationSchemas.js
export const loginValidation = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  password: {
    required: true,
    minLength: 6,
    message: 'Password must be at least 6 characters long'
  }
};

export const registrationValidation = {
  name: {
    required: true,
    minLength: 2,
    pattern: /^[a-zA-Z\s]+$/,
    message: 'Name must contain only letters and spaces'
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: 'Password must contain uppercase, lowercase, number and special character'
  },
  confirmPassword: {
    required: true,
    matchField: 'password',
    message: 'Passwords do not match'
  },
  phone: {
    required: true,
    pattern: /^(\+92|0)?[0-9]{10}$/,
    message: 'Please enter a valid Pakistani phone number'
  }
};
```

### State Management (Redux/Context)
```javascript
// context/AuthContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        user: action.payload.user, 
        token: action.payload.access_token,
        isAuthenticated: true 
      };
    case 'LOGIN_ERROR':
      return { ...state, loading: false, error: action.payload, isAuthenticated: false };
    case 'REGISTER_START':
      return { ...state, loading: true, error: null };
    case 'REGISTER_SUCCESS':
      return { ...state, loading: false, registrationSuccess: true };
    case 'REGISTER_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, token: null, isAuthenticated: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    registrationSuccess: false
  });

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authService.login(credentials);
      await authService.saveUserSession(response);
      dispatch({ type: 'LOGIN_SUCCESS', payload: response });
      return response;
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message });
      throw error;
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'REGISTER_START' });
    try {
      const response = await authService.register(userData);
      dispatch({ type: 'REGISTER_SUCCESS', payload: response });
      return response;
    } catch (error) {
      dispatch({ type: 'REGISTER_ERROR', payload: error.message });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

## 🎨 UI/UX REQUIREMENTS

### Design Specifications
- **Color Scheme**: Primary blue (#2196F3), white background, gray accents
- **Typography**: Clean, readable fonts with proper hierarchy
- **Layout**: Centered forms with consistent spacing and padding
- **Animations**: Smooth transitions between screens and form steps
- **Responsive**: Adapt to different screen sizes and orientations

### Login Screen UI Elements
```javascript
// components/LoginScreen.js structure
const LoginScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header with logo and welcome text */}
      <View style={styles.header}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.welcomeText}>Welcome to StayKaru</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
      </View>

      {/* Login form */}
      <View style={styles.form}>
        <TextInput 
          placeholder="Email Address"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
        <TextInput 
          placeholder="Password"
          secureTextEntry={true}
          style={styles.input}
        />
        
        {/* Remember me and forgot password */}
        <View style={styles.optionsRow}>
          <CheckBox title="Remember Me" />
          <TouchableOpacity>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Login button */}
        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginButtonText}>Sign In</Text>
        </TouchableOpacity>

        {/* Social login buttons */}
        <View style={styles.socialLogin}>
          <Text style={styles.orText}>Or continue with</Text>
          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton}>
              <Image source={googleIcon} style={styles.socialIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Image source={facebookIcon} style={styles.socialIcon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Register link */}
        <View style={styles.registerLink}>
          <Text>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
```

### Registration Screen UI Elements
```javascript
// components/RegistrationScreen.js structure - Multi-step form
const RegistrationScreen = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.stepText}>Step {currentStep} of {totalSteps}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: `${(currentStep/totalSteps) * 100}%` }]} />
        </View>
      </View>

      {/* Step content */}
      <ScrollView style={styles.formContainer}>
        {currentStep === 1 && <PersonalInfoStep />}
        {currentStep === 2 && <AccountDetailsStep />}
        {currentStep === 3 && <AddressInfoStep />}
        {currentStep === 4 && <ReviewStep />}
      </ScrollView>

      {/* Navigation buttons */}
      <View style={styles.navigationButtons}>
        {currentStep > 1 && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setCurrentStep(currentStep - 1)}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={handleNextStep}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === totalSteps ? 'Create Account' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
```

## 🔄 USER FLOW IMPLEMENTATION

### Login Flow
```
App Launch → Check Saved Session → [If Exists] Auto Login → Role-based Dashboard
            ↓ [If Not Exists]
            Login Screen → Enter Credentials → Validate → API Call → 
            Save Session → Role-based Navigation
```

### Registration Flow
```
Registration Screen → Step 1: Personal Info → Step 2: Account Details → 
Step 3: Address Info → Step 4: Review & Submit → API Call → 
Success Message → Navigate to Login Screen
```

### Error Handling Flow
```
API Error → Display User-friendly Message → Allow Retry → 
Log Error for Debugging → Provide Support Contact
```

## 📱 SCREEN NAVIGATION

### Navigation Setup
```javascript
// navigation/AuthNavigator.js
import { createStackNavigator } from '@react-navigation/stack';

const AuthStack = createStackNavigator();

export const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegistrationScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
};

// navigation/AppNavigator.js
export const AppNavigator = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <RoleBasedNavigator userRole={user.role} />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};
```

## 🛡️ SECURITY FEATURES

### Input Validation
- Real-time validation with error messages
- Sanitize input data before sending to API
- Prevent injection attacks through proper encoding
- Rate limiting for login attempts (client-side)

### Password Security
- Minimum 8 characters with complexity requirements
- Show/hide password toggle
- Password strength indicator
- Confirm password matching validation

### Data Protection
- Secure token storage using AsyncStorage
- Automatic token refresh mechanism
- Logout on token expiration
- Clear sensitive data on app backgrounding

## 🚀 IMPLEMENTATION CHECKLIST

### Required Components
- [ ] **LoginScreen** - Main login interface
- [ ] **RegistrationScreen** - Multi-step registration
- [ ] **AuthContext** - State management for authentication
- [ ] **AuthService** - API integration functions
- [ ] **ValidationUtils** - Form validation helpers
- [ ] **LoadingComponent** - Loading states and spinners
- [ ] **ErrorComponent** - Error display and handling
- [ ] **InputComponent** - Reusable form inputs

### Required Dependencies
```json
{
  "@react-native-async-storage/async-storage": "^1.19.0",
  "react-native-vector-icons": "^10.0.0",
  "react-native-elements": "^3.4.3",
  "react-hook-form": "^7.45.0",
  "yup": "^1.2.0"
}
```

### Testing Requirements
- Unit tests for authentication functions
- Integration tests for API calls
- UI tests for form validation
- End-to-end tests for complete user flows

## 📋 DELIVERABLES

**Create these files:**
- `screens/auth/LoginScreen.js`
- `screens/auth/RegistrationScreen.js`
- `services/authService.js`
- `context/AuthContext.js`
- `utils/validation.js`
- `components/auth/` (form components)
- `navigation/AuthNavigator.js`

**Features to implement:**
- ✅ Email/password login with validation
- ✅ Multi-step registration form
- ✅ Form validation with error messages
- ✅ API integration with error handling
- ✅ Token storage and session management
- ✅ Role-based navigation after login
- ✅ Loading states and user feedback
- ✅ Responsive design for all screen sizes

## 🎯 SUCCESS CRITERIA
- Users can successfully register and login
- Form validation works correctly
- API calls are properly handled
- User sessions are saved and restored
- Navigation works based on user roles
- Error messages are user-friendly
- UI is responsive and accessible

**Start with the LoginScreen first, then implement the multi-step RegistrationScreen. Focus on proper API integration and state management throughout the implementation.**
