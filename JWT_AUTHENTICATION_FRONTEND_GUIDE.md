# StayKaru Frontend Migration Guide: JWT Authentication Implementation

This comprehensive guide will help you implement JWT authentication in your React Native/Expo frontend application for StayKaru. Follow these steps to ensure your app works successfully with the newly deployed JWT-based authentication backend.

## Backend API URL

The new backend is deployed at:
```
https://staykaru-backend-60ed08adb2a7.herokuapp.com
```

## 1. Update API Client Configuration

First, create or update your API client to use the JWT authentication system:

### `src/api/apiClient.js`

```javascript
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
```

## 2. Implement Authentication Context

Create or update your authentication context to manage the user state:

### `src/context/AuthContext.js`

```javascript
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../api/apiClient';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize: Check if user is already logged in
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check if token exists
        const token = await AsyncStorage.getItem('auth_token');
        
        if (token) {
          // Get user profile with token
          const profileData = await authAPI.getProfile();
          setUser(profileData.user);
          
          // Save user data for offline access
          await AsyncStorage.setItem('user_data', JSON.stringify(profileData.user));
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        // Clear any invalid tokens
        await AsyncStorage.removeItem('auth_token');
        
        // Try to load cached user data for offline access
        try {
          const userData = await AsyncStorage.getItem('user_data');
          if (userData) {
            setUser(JSON.parse(userData));
          }
        } catch (e) {
          await AsyncStorage.removeItem('user_data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Register function
  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Ensure all required fields are present
      const registerData = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone || '', // Required field
        gender: userData.gender || 'other', // Required field
        role: userData.role || 'student', // Required field
      };
      
      const response = await authAPI.register(registerData);
      
      // After registration, automatically log in
      await login({
        email: userData.email,
        password: userData.password
      });
      
      return response;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.login(credentials);
      
      // Get user profile after successful login
      const profileData = await authAPI.getProfile();
      setUser(profileData.user);
      
      // Save user data for offline access
      await AsyncStorage.setItem('user_data', JSON.stringify(profileData.user));
      
      return response;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    
    try {
      await authAPI.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    return user && user.role === role;
  };

  // Context value
  const value = {
    user,
    isLoading,
    error,
    register,
    login,
    logout,
    hasRole,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
```

## 3. Implement Login Screen

Create or update your login screen:

### `src/screens/LoginScreen.js`

```javascript
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();

  // Clear error when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Clear fields when returning to login screen
      setEmail('');
      setPassword('');
    });

    return unsubscribe;
  }, [navigation]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await login({ email, password });
      // Navigation will be handled by the navigator based on auth state
    } catch (err) {
      const errorMessage = err.message || typeof err === 'object' && err.error ? err.error : 'Please check your credentials and try again';
      Alert.alert('Login Failed', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>StayKaru</Text>
          <Text style={styles.subtitle}>Login to continue</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerText}>
              Don't have an account? <Text style={styles.registerLinkText}>Register</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    padding: 15,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#4A6572',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 16,
    color: '#666',
  },
  registerLinkText: {
    color: '#4A6572',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
```

## 4. Implement Registration Screen

Create or update your registration screen:

### `src/screens/RegisterScreen.js`

```javascript
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('male');
  const [role, setRole] = useState('student');
  
  const { register, isLoading, error } = useAuth();

  const handleRegister = async () => {
    // Basic validation
    if (!name || !email || !password || !confirmPassword || !phone) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Password strength validation
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      await register({
        name,
        email,
        password,
        phone,
        gender,
        role
      });
      
      // Navigation will be handled by auth context
      Alert.alert('Success', 'Registration successful! You are now logged in.');
    } catch (err) {
      const errorMessage = err.message || typeof err === 'object' && err.error ? err.error : 'Please try again with different credentials';
      Alert.alert('Registration Failed', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Gender</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={gender}
                onValueChange={(itemValue) => setGender(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Male" value="male" />
                <Picker.Item label="Female" value="female" />
                <Picker.Item label="Other" value="other" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Role</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={role}
                onValueChange={(itemValue) => setRole(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Student" value="student" />
                <Picker.Item label="Landlord" value="landlord" />
                <Picker.Item label="Food Provider" value="food_provider" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>Register</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginLinkText}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    padding: 15,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  picker: {
    height: 50,
  },
  registerButton: {
    backgroundColor: '#4A6572',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#666',
  },
  loginLinkText: {
    color: '#4A6572',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
```

## 5. Implement Profile Screen

Create or update your profile screen:

### `src/screens/ProfileScreen.js`

```javascript
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will be handled by auth context
    } catch (error) {
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A6572" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Not logged in</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileContainer}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{user.name ? user.name.charAt(0).toUpperCase() : '?'}</Text>
        </View>
        
        <Text style={styles.nameText}>{user.name}</Text>
        <Text style={styles.roleText}>{formatRole(user.role)}</Text>
        
        <View style={styles.infoContainer}>
          <InfoItem label="Email" value={user.email} />
          <InfoItem label="Phone" value={user.phone || 'Not provided'} />
          <InfoItem label="Gender" value={formatGender(user.gender)} />
          {user.createdAt && (
            <InfoItem label="Member Since" value={formatDate(user.createdAt)} />
          )}
        </View>
        
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const InfoItem = ({ label, value }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

// Helper functions
const formatRole = (role) => {
  if (!role) return 'User';
  
  const roles = {
    student: 'Student',
    landlord: 'Landlord',
    food_provider: 'Food Provider',
    admin: 'Administrator'
  };
  
  return roles[role] || role.charAt(0).toUpperCase() + role.slice(1);
};

const formatGender = (gender) => {
  if (!gender) return 'Not specified';
  
  const genders = {
    male: 'Male',
    female: 'Female',
    other: 'Other'
  };
  
  return genders[gender] || gender.charAt(0).toUpperCase() + gender.slice(1);
};

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch (e) {
    return dateString || 'Unknown';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#4A6572',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    width: '80%',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4A6572',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  roleText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  infoContainer: {
    width: '100%',
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    width: '40%',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  infoValue: {
    width: '60%',
    fontSize: 16,
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
```

## 6. Update App Navigation

Ensure your app navigation correctly handles authentication state:

### `src/navigation/AppNavigator.js`

```javascript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

// Auth screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// App screens
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
// Import other screens as needed

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Authentication navigator
const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// Main app navigator with tabs
const AppTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }
        // Add other icons as needed

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#4A6572',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
    {/* Add other tabs as needed */}
  </Tab.Navigator>
);

// Root navigator that switches between auth and main app
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4A6572" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={AppTabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
```

## 7. Update App Entry Point

Make sure your app entry point is using the AuthProvider:

### `App.js`

```javascript
import React from 'react';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <StatusBar barStyle="dark-content" />
      <AppNavigator />
    </AuthProvider>
  );
}
```

## 8. Add Required Dependencies

Make sure to install all the necessary dependencies:

```bash
# Using npm
npm install @react-native-async-storage/async-storage axios @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context @react-native-picker/picker @expo/vector-icons

# Using Expo
expo install @react-native-async-storage/async-storage axios @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context @react-native-picker/picker @expo/vector-icons
```

## 9. Implement a Home Screen (if needed)

If you don't already have a home screen, here's a simple implementation:

### `src/screens/HomeScreen.js`

```javascript
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';

const HomeScreen = () => {
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Hello, {user ? user.name.split(' ')[0] : 'Guest'}!
        </Text>
        <Text style={styles.welcomeText}>
          Welcome to StayKaru
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Your StayKaru App</Text>
        <Text style={styles.sectionText}>
          This is a placeholder home screen. Replace this content with your app's main features.
        </Text>
        
        {/* Add your app's main content and features here */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4A6572',
    padding: 20,
    paddingTop: 40,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  welcomeText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  sectionText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 24,
  },
});

export default HomeScreen;
```

## 10. Testing Your Implementation

1. Make sure your Expo environment is set up:
   ```bash
   # Navigate to your frontend directory
   cd D:\FYP\stekaru-frontend
   
   # Install dependencies (if you haven't already)
   npm install
   
   # Start the Expo development server
   expo start
   ```

2. Test the registration flow:
   - Navigate to the Register screen
   - Fill in all required fields
   - Submit the form
   - Verify you are redirected to the main app screen upon success

3. Test the login flow:
   - Logout if you're already logged in
   - Navigate to the Login screen
   - Enter your credentials
   - Submit the form
   - Verify you are redirected to the main app screen upon success

4. Test the profile access:
   - Navigate to your profile screen
   - Verify that your user information is correctly displayed

## Troubleshooting

If you encounter issues:

1. **Network Errors**:
   - Make sure you're using the correct backend URL: `https://staykaru-backend-60ed08adb2a7.herokuapp.com`
   - Check if your device has internet access
   - Ensure the backend is running (we've already verified it is)

2. **Authentication Errors**:
   - Ensure you're using the correct endpoints: `/auth/register`, `/auth/login`, `/auth/profile`
   - Make sure you're including the JWT token in the Authorization header for protected routes
   - Check that all required fields are being sent in the registration request

3. **Form Validation Errors**:
   - Remember that registration requires name, email, password, phone, gender, and role
   - Make sure your form validation is checking for all required fields

4. **UI/UX Issues**:
   - Check that your navigation flow works correctly based on authentication state
   - Ensure loading states are properly displayed during API calls

5. **Debug Tips**:
   - Add console.log statements to track the flow of your application
   - Use the React Native Debugger or Chrome Developer Tools to inspect network requests
   - Check the backend logs if you suspect the issue is on the server side

## Conclusion

You've now successfully migrated your frontend to use JWT authentication instead of Firebase. Your app should be able to:

1. Register new users with all required fields
2. Log in existing users
3. Access protected routes using the JWT token
4. Display user profile information
5. Log out users

The backend is running successfully on Heroku, and all authentication endpoints are working as expected. If you encounter any issues, refer to the troubleshooting section or reach out for further assistance.
