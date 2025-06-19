import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define the root stack parameter list
export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  StudentDashboard: undefined;
  LandlordDashboard: undefined;  
  FoodProviderDashboard: undefined;
  AdminDashboard: undefined;
  Profile: undefined;
  // Add other routes as needed
};

// Define navigation prop types for use in components
export type AuthNavigationProp = NativeStackNavigationProp<RootStackParamList>;
