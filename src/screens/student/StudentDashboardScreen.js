import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { accommodationAPI } from '../../api/accommodationAPI';
import { foodAPI } from '../../api/foodAPI';
import { bookingAPI, orderAPI } from '../../api/commonAPI';
import { locationAPI, notificationAPI } from '../../api';

const { width } = Dimensions.get('window');

const StudentDashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    quickStats: {
      activeBookings: 0,
      pendingOrders: 0,
      unreadNotifications: 0,
      totalSpent: 0
    },
    recentBookings: [],
    recentOrders: [],
    nearbyAccommodations: [],
    popularFoodProviders: [],
    notifications: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all dashboard data in parallel
      const [
        bookingsResponse,
        ordersResponse,
        accommodationsResponse,
        foodProvidersResponse,
        notificationsResponse
      ] = await Promise.all([
        bookingAPI.getMyBookings().catch(() => ({ data: [] })),
        orderAPI.getMyOrders().catch(() => ({ data: [] })),
        accommodationAPI.getAll({ limit: 5 }).catch(() => ({ data: [] })),
        foodAPI.getAll({ limit: 5 }).catch(() => ({ data: [] })),
        notificationAPI.getAll({ limit: 5 }).catch(() => ({ data: [] }))
      ]);

      const bookings = bookingsResponse.data || [];
      const orders = ordersResponse.data || [];
      const accommodations = accommodationsResponse.data || [];
      const foodProviders = foodProvidersResponse.data || [];
      const notifications = notificationsResponse.data || [];

      // Calculate quick stats
      const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;
      const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing').length;
      const unreadNotifications = notifications.filter(n => !n.read).length;
      const totalSpent = [...bookings, ...orders].reduce((sum, item) => sum + (item.totalAmount || item.amount || 0), 0);

      setDashboardData({
        quickStats: {
          activeBookings,
          pendingOrders,
          unreadNotifications,
          totalSpent
        },
        recentBookings: bookings.slice(0, 3),
        recentOrders: orders.slice(0, 3),
        nearbyAccommodations: accommodations.slice(0, 4),
        popularFoodProviders: foodProviders.slice(0, 4),
        notifications: notifications.slice(0, 3)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const renderQuickStats = () => (
    <View style={styles.quickStatsContainer}>
      <Text style={styles.sectionTitle}>Quick Overview</Text>
      <View style={styles.statsGrid}>
        <TouchableOpacity 
          style={[styles.statCard, { backgroundColor: theme.colors.primary + '15' }]}
          onPress={() => navigation.navigate('Bookings')}
        >
          <Ionicons name="bed" size={24} color={theme.colors.primary} />
          <Text style={styles.statValue}>{dashboardData.quickStats.activeBookings}</Text>
          <Text style={styles.statLabel}>Active Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.statCard, { backgroundColor: theme.colors.warning + '15' }]}
          onPress={() => navigation.navigate('OrderHistory')}
        >
          <Ionicons name="restaurant" size={24} color={theme.colors.warning} />
          <Text style={styles.statValue}>{dashboardData.quickStats.pendingOrders}</Text>
          <Text style={styles.statLabel}>Pending Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.statCard, { backgroundColor: theme.colors.info + '15' }]}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications" size={24} color={theme.colors.info} />
          <Text style={styles.statValue}>{dashboardData.quickStats.unreadNotifications}</Text>
          <Text style={styles.statLabel}>Notifications</Text>
        </TouchableOpacity>

        <View style={[styles.statCard, { backgroundColor: theme.colors.success + '15' }]}>
          <Ionicons name="cash" size={24} color={theme.colors.success} />
          <Text style={styles.statValue}>RM {dashboardData.quickStats.totalSpent.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('Accommodations')}
        >
          <Ionicons name="search" size={28} color={theme.colors.primary} />
          <Text style={styles.actionLabel}>Find Accommodation</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('Food')}
        >
          <Ionicons name="restaurant" size={28} color={theme.colors.warning} />
          <Text style={styles.actionLabel}>Order Food</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('CitiesList')}
        >
          <Ionicons name="location" size={28} color={theme.colors.info} />
          <Text style={styles.actionLabel}>Explore Cities</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('Payment')}
        >
          <Ionicons name="card" size={28} color={theme.colors.success} />
          <Text style={styles.actionLabel}>Payments</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRecentBookings = () => (
    <View style={styles.recentSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Bookings</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Bookings')}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      
      {dashboardData.recentBookings.length > 0 ? (
        dashboardData.recentBookings.map((booking, index) => (
          <Card key={index} style={styles.recentItem}>
            <TouchableOpacity 
              style={styles.recentItemContent}
              onPress={() => navigation.navigate('BookingDetail', { bookingId: booking.id })}
            >
              <View style={styles.recentItemInfo}>
                <Text style={styles.recentItemTitle}>{booking.accommodationName || 'Accommodation'}</Text>
                <Text style={styles.recentItemSubtitle}>
                  {booking.checkInDate} - {booking.checkOutDate}
                </Text>
                <Text style={styles.recentItemMeta}>
                  RM {booking.totalAmount?.toFixed(2)} • {booking.status}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </Card>
        ))
      ) : (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>No recent bookings</Text>
          <Button
            title="Find Accommodation"
            onPress={() => navigation.navigate('Accommodations')}
            style={styles.emptyButton}
          />
        </Card>
      )}
    </View>
  );

  const renderRecentOrders = () => (
    <View style={styles.recentSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Orders</Text>
        <TouchableOpacity onPress={() => navigation.navigate('OrderHistory')}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      
      {dashboardData.recentOrders.length > 0 ? (
        dashboardData.recentOrders.map((order, index) => (
          <Card key={index} style={styles.recentItem}>
            <TouchableOpacity 
              style={styles.recentItemContent}
              onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
            >
              <View style={styles.recentItemInfo}>
                <Text style={styles.recentItemTitle}>{order.restaurantName || 'Restaurant'}</Text>
                <Text style={styles.recentItemSubtitle}>
                  {order.items?.length || 0} items
                </Text>
                <Text style={styles.recentItemMeta}>
                  RM {order.totalAmount?.toFixed(2)} • {order.status}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </Card>
        ))
      ) : (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>No recent orders</Text>
          <Button
            title="Order Food"
            onPress={() => navigation.navigate('Food')}
            style={styles.emptyButton}
          />
        </Card>
      )}
    </View>
  );

  const renderNearbyAccommodations = () => (
    <View style={styles.nearbySection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Popular Accommodations</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Accommodations')}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {dashboardData.nearbyAccommodations.map((accommodation, index) => (
          <TouchableOpacity
            key={index}
            style={styles.horizontalCard}
            onPress={() => navigation.navigate('AccommodationDetail', { id: accommodation.id })}
          >
            <Card style={styles.horizontalCardContent}>
              <Text style={styles.horizontalCardTitle} numberOfLines={1}>
                {accommodation.name || 'Accommodation'}
              </Text>
              <Text style={styles.horizontalCardSubtitle} numberOfLines={1}>
                {accommodation.location || 'Location'}
              </Text>
              <Text style={styles.horizontalCardPrice}>
                RM {accommodation.pricePerNight?.toFixed(2)}/night
              </Text>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
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
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'Student'}!</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
            {dashboardData.quickStats.unreadNotifications > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {dashboardData.quickStats.unreadNotifications}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        {renderQuickStats()}

        {/* Quick Actions */}
        {renderQuickActions()}

        {/* Recent Bookings */}
        {renderRecentBookings()}

        {/* Recent Orders */}
        {renderRecentOrders()}

        {/* Nearby Accommodations */}
        {renderNearbyAccommodations()}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.white,
  },
  greeting: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  quickStatsContainer: {
    padding: 20,
    backgroundColor: theme.colors.white,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 60) / 2,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: 4,
  },
  quickActionsContainer: {
    padding: 20,
    backgroundColor: theme.colors.white,
    marginBottom: 10,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionLabel: {
    fontSize: 14,
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  recentSection: {
    padding: 20,
    backgroundColor: theme.colors.white,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  recentItem: {
    marginBottom: 10,
  },
  recentItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentItemInfo: {
    flex: 1,
  },
  recentItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  recentItemSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 2,
  },
  recentItemMeta: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginBottom: 15,
  },
  emptyButton: {
    paddingHorizontal: 20,
  },
  nearbySection: {
    backgroundColor: theme.colors.white,
    marginBottom: 10,
  },
  horizontalScroll: {
    paddingLeft: 20,
  },
  horizontalCard: {
    marginRight: 15,
    width: 200,
  },
  horizontalCardContent: {
    padding: 15,
  },
  horizontalCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  horizontalCardSubtitle: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: 8,
  },
  horizontalCardPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default StudentDashboardScreen;
