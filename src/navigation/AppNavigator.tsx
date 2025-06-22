import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { theme } from '../styles/theme';
import { USER_ROLES } from '../constants';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';

// Common screens
import ProfileScreen from '../screens/common/ProfileScreen';
import EditProfileScreen from '../screens/common/EditProfileScreen';
import ChangePasswordScreen from '../screens/common/ChangePasswordScreen';
import NotificationsScreen from '../screens/common/NotificationsScreen';
import NotificationDetailScreen from '../screens/common/NotificationDetailScreen';
import SettingsScreen from '../screens/common/SettingsScreen';
import HelpScreen from '../screens/common/HelpScreen';
import ActivityHistoryScreen from '../screens/common/ActivityHistoryScreen';
import AboutScreen from '../screens/common/AboutScreen';
import NotificationManagementScreen from '../screens/common/NotificationManagementScreen';

// Student screens
import StudentHomeScreen from '../screens/student/StudentHomeScreen';
import StudentDashboardScreen from '../screens/student/StudentDashboardScreen';
import AccommodationSearchScreen from '../screens/student/AccommodationSearchScreen';
import AccommodationDetailScreen from '../screens/student/AccommodationDetailScreen';
import BookingFormScreen from '../screens/student/BookingFormScreen';
import BookingHistoryScreen from '../screens/student/BookingHistoryScreen';
import BookingDetailScreen from '../screens/student/BookingDetailScreen';
import FoodProvidersScreen from '../screens/student/FoodProvidersScreen';
import FoodProviderDetailScreen from '../screens/student/FoodProviderDetailScreen';
import OrderFormScreen from '../screens/student/OrderFormScreen';
import OrderHistoryScreen from '../screens/student/OrderHistoryScreen';
import OrderDetailScreen from '../screens/student/OrderDetailScreen';
import PaymentScreen from '../screens/student/PaymentScreen';
import ReviewFormScreen from '../screens/student/ReviewFormScreen';
import CitiesListScreen from '../screens/student/CitiesListScreen';
import CityDetailScreen from '../screens/student/CityDetailScreen';

// Landlord screens
import LandlordDashboardScreen from '../screens/landlord/LandlordDashboardScreen';
import MyPropertiesScreen from '../screens/landlord/MyPropertiesScreen';
import AddPropertyScreen from '../screens/landlord/AddPropertyScreen';
import EditPropertyScreen from '../screens/landlord/EditPropertyScreen';
import BookingRequestsScreen from '../screens/landlord/BookingRequestsScreen';
import LandlordAnalyticsScreen from '../screens/landlord/LandlordAnalyticsScreen';
import LandlordPaymentHistoryScreen from '../screens/landlord/LandlordPaymentHistoryScreen';

// Food Provider screens
import FoodProviderDashboardScreen from '../screens/foodProvider/FoodProviderDashboardScreen';
import MyMenuScreen from '../screens/foodProvider/MyMenuScreen';
import AddMenuItemScreen from '../screens/foodProvider/AddMenuItemScreen';
import EditMenuItemScreen from '../screens/foodProvider/EditMenuItemScreen';
import OrderRequestsScreen from '../screens/foodProvider/OrderRequestsScreen';
import FoodProviderAnalyticsScreen from '../screens/foodProvider/FoodProviderAnalyticsScreen';
import FoodProviderPaymentHistoryScreen from '../screens/foodProvider/FoodProviderPaymentHistoryScreen';

// Admin screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminLocationsScreen from '../screens/admin/AdminLocationsScreen';
import AdminUserDetailScreen from '../screens/admin/AdminUserDetailScreen';
import AdminEditUserScreen from '../screens/admin/AdminEditUserScreen';
import AdminSystemReportsScreen from '../screens/admin/AdminSystemReportsScreen';
import AdminPaymentsScreen from '../screens/admin/AdminPaymentsScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import AdminFoodProvidersScreen from '../screens/admin/AdminFoodProvidersScreen';
import AdminBookingsScreen from '../screens/admin/AdminBookingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Authentication navigator
const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
  </Stack.Navigator>
);

// Student Tab Navigator
const StudentTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: string = 'home';
        switch (route.name) {
          case 'Home':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'Accommodations':
            iconName = focused ? 'bed' : 'bed-outline';
            break;
          case 'Food':
            iconName = focused ? 'restaurant' : 'restaurant-outline';
            break;
          case 'Bookings':
            iconName = focused ? 'calendar' : 'calendar-outline';
            break;
          case 'Profile':
            iconName = focused ? 'person' : 'person-outline';
            break;
          default:
            iconName = 'home';
            break;
        }
        return <Ionicons name={iconName as any} size={size} color={color} />;
      },
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.text.secondary,
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home" component={StudentDashboardScreen} />
    <Tab.Screen name="Accommodations" component={AccommodationSearchScreen} />
    <Tab.Screen name="Food" component={FoodProvidersScreen} />
    <Tab.Screen name="Bookings" component={BookingHistoryScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// Landlord Tab Navigator
const LandlordTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: any = 'home';
        switch (route.name) {
          case 'Home':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'Properties':
            iconName = focused ? 'business' : 'business-outline';
            break;
          case 'Bookings':
            iconName = focused ? 'calendar' : 'calendar-outline';
            break;
          case 'Analytics':
            iconName = focused ? 'analytics' : 'analytics-outline';
            break;
          case 'Profile':
            iconName = focused ? 'person' : 'person-outline';
            break;
          default:
            iconName = 'home';
            break;
        }
        return <Ionicons name={iconName as any} size={size} color={color} />;
      },
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.text.secondary,
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home" component={LandlordDashboardScreen} />
    <Tab.Screen name="Properties" component={MyPropertiesScreen} />
    <Tab.Screen name="Bookings" component={BookingRequestsScreen} />
    <Tab.Screen name="Analytics" component={LandlordAnalyticsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// Food Provider Tab Navigator
const FoodProviderTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: any = 'home';
        switch (route.name) {
          case 'Home':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'Menu':
            iconName = focused ? 'restaurant' : 'restaurant-outline';
            break;
          case 'Orders':
            iconName = focused ? 'receipt' : 'receipt-outline';
            break;
          case 'Analytics':
            iconName = focused ? 'analytics' : 'analytics-outline';
            break;
          case 'Profile':
            iconName = focused ? 'person' : 'person-outline';
            break;
          default:
            iconName = 'home';
            break;
        }
        return <Ionicons name={iconName as any} size={size} color={color} />;
      },
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.text.secondary,
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home" component={FoodProviderDashboardScreen} />
    <Tab.Screen name="Menu" component={MyMenuScreen} />
    <Tab.Screen name="Orders" component={OrderRequestsScreen} />
    <Tab.Screen name="Analytics" component={FoodProviderAnalyticsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// Admin Tab Navigator
const AdminTabNavigator = () => (  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: any = 'home';
        switch (route.name) {
          case 'Dashboard':
            iconName = focused ? 'grid' : 'grid-outline';
            break;
          case 'Users':
            iconName = focused ? 'people' : 'people-outline';
            break;
          case 'Locations':
            iconName = focused ? 'location' : 'location-outline';
            break;
          case 'Food':
            iconName = focused ? 'restaurant' : 'restaurant-outline';
            break;
          case 'Bookings':
            iconName = focused ? 'calendar' : 'calendar-outline';
            break;
          case 'Reports':
            iconName = focused ? 'analytics' : 'analytics-outline';
            break;
          case 'Settings':
            iconName = focused ? 'settings' : 'settings-outline';
            break;
          default:
            iconName = 'home';
            break;
        }
        return <Ionicons name={iconName as any} size={size} color={color} />;
      },
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.text.secondary,
      headerShown: false,
    })}
  >
    <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
    <Tab.Screen name="Users" component={AdminUsersScreen} />
    <Tab.Screen name="Locations" component={AdminLocationsScreen} />
    <Tab.Screen name="Food" component={AdminFoodProvidersScreen} />
    <Tab.Screen name="Bookings" component={AdminBookingsScreen} />
    <Tab.Screen name="Reports" component={AdminSystemReportsScreen} />
    <Tab.Screen name="Settings" component={AdminSettingsScreen} />
  </Tab.Navigator>
);

// Add fallback logic to handle incorrect navigation calls
const handleNavigationFallback = (screenName: string): string => {
  const validScreens = ['Home', 'Menu', 'Orders', 'Analytics', 'Profile'];
  return validScreens.includes(screenName) ? screenName : 'Home';
};

// Update MainStackNavigator to use fallback
const MainStackNavigator = () => {
  const { user } = useAuth();

  const getTabNavigator = () => {
    switch (user?.role) {
      case USER_ROLES.LANDLORD:
        return LandlordTabNavigator;
      case USER_ROLES.FOOD_PROVIDER:
        return FoodProviderTabNavigator;
      case USER_ROLES.ADMIN:
        return AdminTabNavigator;
      default:
        return StudentTabNavigator;
    }
  };
  const TabNavigator = getTabNavigator();

  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen 
        name="MainTabs" 
        component={TabNavigator} 
        options={{ headerShown: false }}
      />
      {/* Add fallback for dynamic navigation */}
      <Stack.Screen
        name="Fallback"
        component={({ route }: { route: { params?: { screenName?: string } } }) => {
          const screenName = handleNavigationFallback(route.params?.screenName || 'Home');
          return (
            <TabNavigator />
          );
        }}
        options={{ headerShown: false }}
      />
      {/* Common Screens */}
      <Stack.Screen
        name="Notifications" 
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      <Stack.Screen 
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: 'Change Password' }}
      />
      {/* Student Screens */}
      <Stack.Screen
        name="AccommodationDetail" 
        component={AccommodationDetailScreen}
        options={{ title: 'Accommodation Details' }}
      />
      <Stack.Screen 
        name="BookingForm"
        component={BookingFormScreen}
        options={{ title: 'Book Accommodation' }}
      />
      <Stack.Screen 
        name="BookingDetail" 
        component={BookingDetailScreen}
        options={{ title: 'Booking Details' }}
      />
      <Stack.Screen 
        name="FoodProviderDetail" 
        component={FoodProviderDetailScreen}
        options={{ title: 'Restaurant Details' }}
      />
      <Stack.Screen 
        name="OrderForm" 
        component={OrderFormScreen}
        options={{ title: 'Place Order' }}
      />
      <Stack.Screen 
        name="OrderDetail" 
        component={OrderDetailScreen}
        options={{ title: 'Order Details' }}
      />
      <Stack.Screen 
        name="OrderHistory" 
        component={OrderHistoryScreen}
        options={{ title: 'Order History' }}
      />
      <Stack.Screen 
        name="Payment" 
        component={PaymentScreen}
        options={{ title: 'Payment' }}
      />
      <Stack.Screen 
        name="ReviewForm"
        component={ReviewFormScreen}
        options={{ title: 'Write Review' }}
      />
      {/* Landlord Screens */}
      <Stack.Screen
        name="AddProperty" 
        component={AddPropertyScreen}
        options={{ title: 'Add Property' }}
      />
      <Stack.Screen 
        name="EditProperty"
        component={EditPropertyScreen}
        options={{ title: 'Edit Property' }}
      />
      {/* Food Provider Screens */}
      <Stack.Screen
        name="AddMenuItem" 
        component={AddMenuItemScreen}
        options={{ title: 'Add Menu Item' }}
      />
      <Stack.Screen 
        name="EditMenuItem"
        component={EditMenuItemScreen}
        options={{ title: 'Edit Menu Item' }}
      />
      {/* Admin Screens */}
      <Stack.Screen
        name="AdminAnalytics"
        component={AdminSystemReportsScreen}
        options={{ title: 'Analytics & Reports' }}
      />
      <Stack.Screen
        name="AdminUserDetail"
        component={AdminUserDetailScreen}
        options={{ title: 'User Details' }}
      />
      <Stack.Screen
        name="AdminEditUser"
        component={AdminEditUserScreen}
        options={{ title: 'Edit User' }}
      />
      <Stack.Screen
        name="AdminPayments"
        component={AdminPaymentsScreen}
        options={{ title: 'Payment Management' }}
      />
      <Stack.Screen
        name="AdminSettings"
        component={SettingsScreen}
        options={{ title: 'System Settings' }}
      />
      <Stack.Screen
        name="AdminReports"
        component={AdminSystemReportsScreen}
        options={{ title: 'Generate Reports' }}
      />
      {/* Additional Common Screens */}
      <Stack.Screen
        name="NotificationManagement"
        component={NotificationManagementScreen}
        options={{ title: 'Notification Management' }}
      />
      <Stack.Screen
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen 
        name="Help" 
        component={HelpScreen}
        options={{ title: 'Help & Support' }}
      />
      <Stack.Screen 
        name="ActivityHistory" 
        component={ActivityHistoryScreen}
        options={{ title: 'Activity History' }}
      />
      <Stack.Screen 
        name="About" 
        component={AboutScreen}
        options={{ title: 'About' }}
      />
      <Stack.Screen 
        name="NotificationDetail"
        component={NotificationDetailScreen}
        options={{ title: 'Notification' }}
      />
      {/* Location Screens */}
      <Stack.Screen
        name="CitiesList" 
        component={CitiesListScreen}
        options={{ title: 'Cities' }}
      />
      <Stack.Screen 
        name="CityDetail"
        component={CityDetailScreen}
        options={{ title: 'City Details' }}
      />
      {/* Payment History Screens */}
      <Stack.Screen
        name="LandlordPaymentHistory" 
        component={LandlordPaymentHistoryScreen}
        options={{ title: 'Payment History' }}
      />
      <Stack.Screen 
        name="FoodProviderPaymentHistory"
        component={FoodProviderPaymentHistoryScreen}
        options={{ title: 'Payment History' }}
      />
      <Stack.Screen
        name="LocationAnalytics"
        component={AdminSystemReportsScreen}
        options={{ title: 'Location Analytics' }}
      />
    </Stack.Navigator>
  );
};

// Root navigator that switches between auth and main app
export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainStackNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
