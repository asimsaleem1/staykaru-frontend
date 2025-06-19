# Frontend Migration Guide: Firebase to JWT Authentication

This guide provides step-by-step instructions for migrating the StayKaru frontend from Firebase authentication to the new MongoDB/JWT-based authentication system.

## Files to Create or Update

### 1. API Client (`src/api/apiClient.js`)

Create or replace the existing API client with this implementation:

```javascript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Update this to your production API URL
const BASE_URL = 'https://api.staykaru.tech/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to every request
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 2. Auth Context (`src/context/AuthContext.js`)

Replace the existing Firebase-based AuthContext with the new JWT implementation:

```javascript
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import apiClient from '../api/apiClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });
      
      const { access_token, user } = response.data;
      
      setUserToken(access_token);
      setUserInfo(user);
      
      await AsyncStorage.setItem('userToken', access_token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(user));
      
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/register', userData);
      setIsLoading(false);
      return { success: true, data: response.data };
    } catch (error) {
      setIsLoading(false);
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setUserToken(null);
    setUserInfo(null);
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userInfo');
    setIsLoading(false);
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const userInfoString = await AsyncStorage.getItem('userInfo');
      
      if (token) {
        setUserToken(token);
        setUserInfo(JSON.parse(userInfoString));
      }
      
      setIsLoading(false);
    } catch (error) {
      console.log('isLoggedIn error', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        login, 
        logout, 
        register, 
        isLoading, 
        userToken,
        userInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
```

### 3. Login Screen (`src/screens/LoginScreen.js`)

Update or create the login screen:

```javascript
import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../context/AuthContext';
import TextInput from '../components/TextInput';

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

const LoginScreen = ({ navigation }) => {
  const { login, isLoading } = useContext(AuthContext);
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const handleLogin = async (values) => {
    const result = await login(values.email, values.password);
    if (!result.success) {
      Alert.alert('Login Failed', result.message);
    }
  };

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>StayKaru</Text>
        </View>

        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={validationSchema}
          onSubmit={handleLogin}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.formContainer}>
              <TextInput
                label="Email"
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
                error={touched.email && errors.email}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                label="Password"
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password}
                error={touched.password && errors.password}
                placeholder="Enter your password"
                secureTextEntry={secureTextEntry}
                toggleSecureEntry={toggleSecureEntry}
                isPassword
              />

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </Formik>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Register</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066cc',
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  formContainer: {
    width: '100%',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#0066cc',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#0066cc',
    borderRadius: 8,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#666',
    fontSize: 14,
  },
  registerLink: {
    color: '#0066cc',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
```

### 4. Registration Screen (`src/screens/RegisterScreen.js`)

Create or update the registration screen:

```javascript
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../context/AuthContext';
import TextInput from '../components/TextInput';
import { Picker } from '@react-native-picker/picker';

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required'),
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^[0-9]+$/, 'Must be only digits')
    .min(10, 'Must be exactly 10 digits')
    .max(10, 'Must be exactly 10 digits'),
  gender: Yup.string()
    .required('Gender is required'),
  role: Yup.string()
    .required('Role is required')
});

const RegisterScreen = ({ navigation }) => {
  const { register, isLoading } = useContext(AuthContext);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [confirmSecureTextEntry, setConfirmSecureTextEntry] = useState(true);

  const handleRegister = async (values) => {
    if (values.password !== values.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const userData = {
      name: values.name,
      email: values.email,
      password: values.password,
      phone: values.phone,
      gender: values.gender,
      role: values.role
    };

    const result = await register(userData);
    
    if (result.success) {
      Alert.alert(
        'Registration Successful',
        'Your account has been created successfully. Please login to continue.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    } else {
      Alert.alert('Registration Failed', result.message);
    }
  };

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const toggleConfirmSecureEntry = () => {
    setConfirmSecureTextEntry(!confirmSecureTextEntry);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>

        <Formik
          initialValues={{
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            phone: '',
            gender: 'male',
            role: 'user'
          }}
          validationSchema={validationSchema}
          onSubmit={handleRegister}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
            <View style={styles.formContainer}>
              <TextInput
                label="Full Name"
                onChangeText={handleChange('name')}
                onBlur={handleBlur('name')}
                value={values.name}
                error={touched.name && errors.name}
                placeholder="Enter your full name"
              />

              <TextInput
                label="Email"
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
                error={touched.email && errors.email}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                label="Password"
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password}
                error={touched.password && errors.password}
                placeholder="Enter your password"
                secureTextEntry={secureTextEntry}
                toggleSecureEntry={toggleSecureEntry}
                isPassword
              />

              <TextInput
                label="Confirm Password"
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                value={values.confirmPassword}
                error={touched.confirmPassword && errors.confirmPassword}
                placeholder="Confirm your password"
                secureTextEntry={confirmSecureTextEntry}
                toggleSecureEntry={toggleConfirmSecureEntry}
                isPassword
              />

              <TextInput
                label="Phone Number"
                onChangeText={handleChange('phone')}
                onBlur={handleBlur('phone')}
                value={values.phone}
                error={touched.phone && errors.phone}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />

              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Gender</Text>
                <View style={[styles.pickerWrapper, touched.gender && errors.gender ? styles.inputError : null]}>
                  <Picker
                    selectedValue={values.gender}
                    onValueChange={(itemValue) => setFieldValue('gender', itemValue)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Male" value="male" />
                    <Picker.Item label="Female" value="female" />
                    <Picker.Item label="Other" value="other" />
                  </Picker>
                </View>
                {touched.gender && errors.gender && (
                  <Text style={styles.errorText}>{errors.gender}</Text>
                )}
              </View>

              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Role</Text>
                <View style={[styles.pickerWrapper, touched.role && errors.role ? styles.inputError : null]}>
                  <Picker
                    selectedValue={values.role}
                    onValueChange={(itemValue) => setFieldValue('role', itemValue)}
                    style={styles.picker}
                  >
                    <Picker.Item label="User" value="user" />
                    <Picker.Item label="Landlord" value="landlord" />
                    <Picker.Item label="Food Provider" value="food_provider" />
                  </Picker>
                </View>
                {touched.role && errors.role && (
                  <Text style={styles.errorText}>{errors.role}</Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.registerButton}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.registerButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </Formik>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  pickerContainer: {
    marginBottom: 20,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 5,
  },
  registerButton: {
    backgroundColor: '#0066cc',
    borderRadius: 8,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#0066cc',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
```

### 5. App Navigation (`src/navigation/AppNavigator.js`)

Update the navigation with protected routes:

```javascript
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

// App Screens (add your existing screens here)
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
// Add other screens as needed

// Context
import { AuthContext } from '../context/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Navigator
const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

// App Tab Navigator
const AppTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0066cc',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

// Main Navigator
const AppNavigator = () => {
  const { isLoading, userToken } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {userToken ? <AppTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;
```

### 6. App Entry Point (`App.js`)

Update the main App.js file:

```javascript
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
```

## Files to Delete or Replace

Remove the following Firebase-related files:

1. Any Firebase configuration files (`firebase.js`, `firebaseConfig.js`)
2. Firebase authentication utilities
3. Any Firebase SDK initialization code

## Dependencies to Update

Update your package.json file to remove Firebase dependencies and add JWT-related ones:

```json
// Remove these dependencies:
"firebase": "^10.7.0",
"@react-native-firebase/app": "^x.x.x",
"@react-native-firebase/auth": "^x.x.x",

// Add these dependencies:
"@react-native-async-storage/async-storage": "^1.17.11",
"axios": "^1.4.0",
"formik": "^2.4.2",
"yup": "^1.2.0"
```

Run the following command to update dependencies:

```bash
npm uninstall firebase @react-native-firebase/app @react-native-firebase/auth
npm install @react-native-async-storage/async-storage axios formik yup
```

## Implementation Steps

1. Create or update the API client
2. Implement the AuthContext with JWT authentication
3. Create/update the Login and Registration screens
4. Update navigation to handle authenticated state
5. Remove all Firebase imports and code
6. Update any component that used Firebase auth
7. Test the authentication flow

## Testing the Authentication Flow

1. Run the application in development mode
2. Try to register a new account
3. Test login with the registered credentials
4. Verify that protected routes work correctly
5. Test the logout functionality
6. Verify that AsyncStorage is correctly storing and retrieving the JWT token

## Additional Notes

- Make sure to update any API endpoint URLs to match the backend (`https://api.staykaru.tech/api`)
- Update any component that previously used Firebase authentication to use the new AuthContext
- Ensure all forms use proper validation with Formik and Yup
- Consider implementing token refresh logic for long-lived sessions
- Test thoroughly on both Android and iOS platforms

By following this guide, you will have successfully migrated from Firebase authentication to the new MongoDB/JWT-based authentication system.
