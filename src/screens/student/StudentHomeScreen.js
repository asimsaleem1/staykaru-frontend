import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { accommodationAPI } from '../../api/accommodationAPI';
import { foodAPI } from '../../api/foodAPI';
import { AccommodationCard, FoodProviderCard } from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { theme } from '../../styles/theme';

const StudentHomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [featuredAccommodations, setFeaturedAccommodations] = useState([]);
  const [nearbyFoodProviders, setNearbyFoodProviders] = useState([]);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      // Load featured accommodations
      const accommodationsResponse = await accommodationAPI.getAll({ 
        limit: 5, 
        status: 'available' 
      });
      setFeaturedAccommodations(accommodationsResponse || []);      // Load nearby food providers
      const foodProvidersResponse = await foodAPI.getAll({ 
        limit: 5, 
        status: 'open' 
      });
      
      // Handle different response structures for food providers
      let foodProvidersData = [];
      if (foodProvidersResponse && Array.isArray(foodProvidersResponse)) {
        foodProvidersData = foodProvidersResponse;
      } else if (foodProvidersResponse && foodProvidersResponse.data) {
        foodProvidersData = Array.isArray(foodProvidersResponse.data) 
          ? foodProvidersResponse.data 
          : foodProvidersResponse.data.providers || [];
      }
      
      console.log('Food providers loaded in home:', foodProvidersData.length);
      setNearbyFoodProviders(foodProvidersData);
    } catch (error) {
      console.error('Error loading home data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const navigateToAccommodations = () => {
    navigation.navigate('Accommodations');
  };

  const navigateToFood = () => {
    navigation.navigate('Food');
  };

  const navigateToNotifications = () => {
    navigation.navigate('Notifications');
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>
              Hello, {user?.name ? user.name.split(' ')[0] : 'Guest'}!
            </Text>
            <Text style={styles.subtitle}>Welcome to StayKaru</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={navigateToNotifications}
          >
            <Ionicons name="notifications-outline" size={24} color={theme.colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={navigateToAccommodations}
          >
            <Ionicons name="bed-outline" size={32} color={theme.colors.primary} />
            <Text style={styles.actionText}>Find Accommodation</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={navigateToFood}
          >
            <Ionicons name="restaurant-outline" size={32} color={theme.colors.primary} />
            <Text style={styles.actionText}>Order Food</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Bookings')}
          >
            <Ionicons name="calendar-outline" size={32} color={theme.colors.primary} />
            <Text style={styles.actionText}>My Bookings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Featured Accommodations */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Accommodations</Text>
          <TouchableOpacity onPress={navigateToAccommodations}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
          {featuredAccommodations.length > 0 ? (
          featuredAccommodations.map((accommodation, idx) => (
            <AccommodationCard
              key={accommodation._id || accommodation.id || idx}
              accommodation={accommodation}
              onPress={() => navigation.navigate('AccommodationDetail', { id: accommodation._id || accommodation.id })}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>No accommodations available</Text>
        )}
      </View>

      {/* Nearby Food Providers */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Restaurants</Text>
          <TouchableOpacity onPress={navigateToFood}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
          {nearbyFoodProviders.length > 0 ? (
          nearbyFoodProviders.map((provider, idx) => (
            <FoodProviderCard
              key={provider._id || provider.id || idx}
              provider={provider}
              onPress={() => navigation.navigate('FoodProviderDetail', { 
                id: provider._id || provider.id,
                provider  // Pass both for backward compatibility
              })}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>No restaurants available</Text>
        )}
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <Button
          title="View Booking History"
          onPress={() => navigation.navigate('Bookings')}
          variant="outline"
        />
        <View style={styles.spacer} />
        <Button
          title="View Order History"
          onPress={() => navigation.navigate('OrderHistory')}
          variant="outline"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingTop: 50,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: theme.typography.fontSize.title,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.large,
    color: theme.colors.white,
    opacity: 0.8,
    marginTop: theme.spacing.xs,
  },
  notificationButton: {
    padding: theme.spacing.sm,
  },
  quickActions: {
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xlarge,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.md,
    borderRadius: 12,
    width: '30%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionText: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  section: {
    padding: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  viewAllText: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    padding: theme.spacing.lg,
  },
  spacer: {
    height: theme.spacing.md,
  },
});

export default StudentHomeScreen;
