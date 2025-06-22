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
  }, []);  // Register function
  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Ensure all required fields are present according to the backend API
      const registerData = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
    role: userData.role || 'student',
        phone: userData.phone,
        countryCode: userData.countryCode || '+92', // Required field
        gender: userData.gender,
        // Optional fields - only include if provided
        ...(userData.dateOfBirth && { dateOfBirth: userData.dateOfBirth }),
        ...(userData.university && { university: userData.university }),
        ...(userData.address && { address: userData.address })
      };
      
      const response = await authAPI.register(registerData);
      
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
    setError(null);

    try {
      await authAPI.logout();
      setUser(null);

      // Clear local storage
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
    } catch (err) {
      setError(err.message || 'Logout failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };  // Social login function
  const socialLogin = async (provider, token, role = 'student') => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Attempting social login with ${provider}...`);
      const response = await authAPI.socialLogin(provider, token, role);
      
      // Get user profile after successful social login
      const profileData = await authAPI.getProfile();
      setUser(profileData.user);
      
      // Save user data for offline access
      await AsyncStorage.setItem('user_data', JSON.stringify(profileData.user));
      
      return response;
    } catch (err) {
      console.error('Social login error:', err);
      
      // Enhanced error handling based on error response
      if (err.response?.status === 404) {
        setError('Social login is not supported by the backend. Please use email login.');
      } else if (err.response?.data?.message?.includes('configuration')) {
        setError('Social login failed: Backend OAuth configuration is incomplete. Please try again later or use email login.');
      } else if (err.message?.includes('configuration')) {
        setError('Social login failed: OAuth configuration issue. Please try again later.');
      } else {
        setError(err.message || 'Social login failed');
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.forgotPassword(email);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to send password reset email');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (token, newPassword) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.resetPassword(token, newPassword);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to reset password');
      throw err;
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
    socialLogin,
    forgotPassword,
    resetPassword,
    hasRole,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
