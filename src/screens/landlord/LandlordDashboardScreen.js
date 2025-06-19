import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { USER_ROLES, BOOKING_STATUS } from '../../constants';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/common/Card';
import { accommodationAPI, bookingAPI } from '../../api/accommodationAPI';
import { analyticsAPI } from '../../api/commonAPI';

const LandlordDashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    properties: [],
    recentBookings: [],
    stats: {
      totalProperties: 0,
      totalBookings: 0,
      monthlyRevenue: 0,
      occupancyRate: 0,
    },
    pendingBookings: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [propertiesRes, bookingsRes, analyticsRes] = await Promise.all([
        accommodationAPI.getLandlordProperties(),
        bookingAPI.getLandlordBookings({ limit: 5 }),
        analyticsAPI.getLandlordAnalytics(),
      ]);      setDashboardData({
        properties: (propertiesRes.data || []).slice(0, 3), // Show first 3 properties
        recentBookings: (bookingsRes.data?.bookings || bookingsRes.data || []),
        stats: analyticsRes.data?.stats || analyticsRes.data || {
          totalProperties: 0,
          totalBookings: 0,
          monthlyRevenue: 0,
          occupancyRate: 0,
        },
        pendingBookings: ((bookingsRes.data?.bookings || bookingsRes.data || [])).filter(
          booking => booking.status === BOOKING_STATUS.PENDING
        ),
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleBookingAction = async (bookingId, action) => {
    const validActions = ['accept', 'reject'];
    if (!validActions.includes(action)) {
      Alert.alert('Error', 'Invalid action.');
      return;
    }

    try {
      if (action === 'accept') {
        await bookingAPI.acceptBooking(bookingId);
        Alert.alert('Success', 'Booking accepted successfully');
      } else if (action === 'reject') {
        await bookingAPI.rejectBooking(bookingId);
        Alert.alert('Success', 'Booking rejected successfully');
      }
      
      // Refresh data
      fetchDashboardData();
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      Alert.alert('Error', `Failed to ${action} booking. Please try again later.`);
    }
  };

  const renderQuickStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Ionicons name="business-outline" size={24} color={theme.colors.primary} />
        <Text style={styles.statValue}>{dashboardData.stats.totalProperties}</Text>
        <Text style={styles.statLabel}>Properties</Text>
      </View>
      
      <View style={styles.statCard}>
        <Ionicons name="calendar-outline" size={24} color={theme.colors.secondary} />
        <Text style={styles.statValue}>{dashboardData.stats.totalBookings}</Text>
        <Text style={styles.statLabel}>Bookings</Text>
      </View>
      
      <View style={styles.statCard}>
        <Ionicons name="cash-outline" size={24} color={theme.colors.success} />
        <Text style={styles.statValue}>RM {dashboardData.stats.monthlyRevenue?.toFixed(0) || 0}</Text>
        <Text style={styles.statLabel}>Revenue</Text>
      </View>
      
      <View style={styles.statCard}>
        <Ionicons name="trending-up-outline" size={24} color={theme.colors.warning} />
        <Text style={styles.statValue}>{dashboardData.stats.occupancyRate?.toFixed(1) || 0}%</Text>
        <Text style={styles.statLabel}>Occupancy</Text>
      </View>
    </View>
  );

  const renderPendingBookings = () => {
    if (dashboardData.pendingBookings.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pending Bookings</Text>          <TouchableOpacity onPress={() => navigation.navigate('Bookings')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {(dashboardData.pendingBookings || []).slice(0, 3).map((booking) => (
          <View key={booking.id} style={styles.pendingBookingCard}>
            <View style={styles.bookingInfo}>
              <Text style={styles.bookingProperty}>{booking.accommodation?.name}</Text>
              <Text style={styles.bookingGuest}>Guest: {booking.user?.name}</Text>
              <Text style={styles.bookingDates}>
                {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
              </Text>
              <Text style={styles.bookingAmount}>
                RM {(booking.totalAmount && typeof booking.totalAmount === 'number') 
                  ? booking.totalAmount.toFixed(2) 
                  : '0.00'}
              </Text>
            </View>
            
            <View style={styles.bookingActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleBookingAction(booking.id, 'reject')}
              >
                <Text style={styles.rejectButtonText}>Reject</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleBookingAction(booking.id, 'accept')}
              >
                <Text style={styles.acceptButtonText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderMyProperties = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Properties</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MyProperties')}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      {dashboardData.properties.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="business-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={styles.emptyTitle}>No Properties Yet</Text>
          <Text style={styles.emptyDescription}>Add your first property to start receiving bookings</Text>
          <Button
            title="Add Property"
            onPress={() => navigation.navigate('AddProperty')}
            style={styles.addPropertyButton}
          />
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {dashboardData.properties.map((property) => (
            <View key={property.id} style={styles.propertyCard}>
              <Card
                type="accommodation"
                data={property}
                onPress={() => navigation.navigate('PropertyDetail', { propertyId: property.id })}
                style={styles.horizontalCard}
              />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('AddProperty')}
        >
          <Ionicons name="add-circle-outline" size={32} color={theme.colors.primary} />
          <Text style={styles.quickActionText}>Add Property</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('Bookings')}
        >
          <Ionicons name="calendar-outline" size={32} color={theme.colors.secondary} />
          <Text style={styles.quickActionText}>Booking Requests</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('LandlordAnalytics')}
        >
          <Ionicons name="analytics-outline" size={32} color={theme.colors.info} />
          <Text style={styles.quickActionText}>View Analytics</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={32} color={theme.colors.warning} />
          <Text style={styles.quickActionText}>Notifications</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.headerTitle}>Landlord Dashboard</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        {renderQuickStats()}

        {/* Pending Bookings */}
        {renderPendingBookings()}

        {/* My Properties */}
        {renderMyProperties()}

        {/* Quick Actions */}
        {renderQuickActions()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  welcomeText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  notificationButton: {
    padding: theme.spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginHorizontal: theme.spacing.xs,
  },
  statValue: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
  },
  viewAllText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.medium,
  },
  pendingBookingCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingInfo: {
    flex: 1,
  },
  bookingProperty: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
  },
  bookingGuest: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  bookingDates: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  bookingAmount: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  bookingActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  acceptButton: {
    backgroundColor: theme.colors.success,
  },
  rejectButton: {
    backgroundColor: theme.colors.error,
  },
  acceptButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
  },
  rejectButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
  },
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  emptyDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  addPropertyButton: {
    backgroundColor: theme.colors.primary,
  },
  propertyCard: {
    width: 280,
    marginLeft: theme.spacing.md,
  },
  horizontalCard: {
    width: '100%',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
  },
  quickActionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
});

export default LandlordDashboardScreen;
