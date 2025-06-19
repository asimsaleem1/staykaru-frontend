import * as SecureStore from 'expo-secure-store';

const AUTH_TOKEN_KEY = 'staykaru_auth_token';
const USER_DATA_KEY = 'staykaru_user_data';

// Save authentication token
export const saveToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving auth token:', error);
    throw error;
  }
};

// Get authentication token
export const getToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Remove authentication token
export const removeToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error removing auth token:', error);
    throw error;
  }
};

// Save user data
export const saveUserData = async (userData: object): Promise<void> => {
  try {
    await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
};

// Get user data
export const getUserData = async (): Promise<any | null> => {
  try {
    const userData = await SecureStore.getItemAsync(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Remove user data
export const removeUserData = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(USER_DATA_KEY);
  } catch (error) {
    console.error('Error removing user data:', error);
    throw error;
  }
};
