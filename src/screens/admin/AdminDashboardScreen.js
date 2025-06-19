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
import { USER_ROLES } from '../../constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { adminAPI, analyticsAPI } from '../../api/commonAPI';

const AdminDashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 0,
      totalStudents: 0,
      totalLandlords: 0,
      totalFoodProviders: 0,
      totalAccommodations: 0,
      totalBookings: 0,
      totalOrders: 0,
      totalRevenue: 0,
    },
    recentUsers: [],
    recentReviews: [],
    systemAlerts: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Handle each API call individually to prevent one failure from breaking everything
      let stats = {
        totalUsers: 0,
        totalStudents: 0,
        totalLandlords: 0,
        totalFoodProviders: 0,
        totalAccommodations: 0,
        totalBookings: 0,
        totalOrders: 0,
        totalRevenue: 0,
      };
      let users = { users: [] };
      let reviews = { reviews: [] };
      let alerts = { alerts: [] };

      try {
        stats = await analyticsAPI.getAdminAnalytics();
      } catch (error) {
        console.log('Analytics API not available, using default values');
      }

      try {
        users = await adminAPI.getRecentUsers({ limit: 5 });
      } catch (error) {
        console.log('Recent users API not available, using empty array');
      }

      try {
        reviews = await adminAPI.getRecentReviews({ limit: 5 });
      } catch (error) {
        console.log('Recent reviews API not available, using empty array');
      }

      try {
        alerts = await adminAPI.getSystemAlerts();
      } catch (error) {
        console.log('System alerts API not available, using empty array');
      }

      setDashboardData({
        stats: stats || {
          totalUsers: 0,
          totalStudents: 0,
          totalLandlords: 0,
          totalFoodProviders: 0,
          totalAccommodations: 0,
          totalBookings: 0,
          totalOrders: 0,
          totalRevenue: 0,
        },        recentUsers: users?.users || [],
        recentReviews: reviews?.reviews || [],
        systemAlerts: alerts?.alerts || [],
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

  const renderOverviewStats = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Platform Overview</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="people-outline" size={24} color={theme.colors.primary} />
          <Text style={styles.statValue}>{dashboardData.stats?.totalUsers || 0}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="school-outline" size={24} color={theme.colors.secondary} />
          <Text style={styles.statValue}>{dashboardData.stats?.totalStudents || 0}</Text>
          <Text style={styles.statLabel}>Students</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="business-outline" size={24} color={theme.colors.info} />
          <Text style={styles.statValue}>{dashboardData.stats?.totalLandlords || 0}</Text>
          <Text style={styles.statLabel}>Landlords</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="restaurant-outline" size={24} color={theme.colors.warning} />
          <Text style={styles.statValue}>{dashboardData.stats?.totalFoodProviders || 0}</Text>
          <Text style={styles.statLabel}>Food Providers</Text>
        </View>
      </View>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="home-outline" size={24} color={theme.colors.success} />
          <Text style={styles.statValue}>{dashboardData.stats.totalAccommodations}</Text>
          <Text style={styles.statLabel}>Accommodations</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="calendar-outline" size={24} color={theme.colors.primary} />
          <Text style={styles.statValue}>{dashboardData.stats.totalBookings}</Text>
          <Text style={styles.statLabel}>Bookings</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="receipt-outline" size={24} color={theme.colors.secondary} />
          <Text style={styles.statValue}>{dashboardData.stats.totalOrders}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="cash-outline" size={24} color={theme.colors.success} />
          <Text style={styles.statValue}>RM {dashboardData.stats.totalRevenue?.toFixed(0) || 0}</Text>
          <Text style={styles.statLabel}>Total Revenue</Text>
        </View>
      </View>
    </View>
  );

  const renderSystemAlerts = () => {
    if (dashboardData.systemAlerts.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>System Alerts</Text>          <TouchableOpacity onPress={() => navigation.navigate('AdminSettings')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {(dashboardData.systemAlerts || []).slice(0, 3).map((alert, index) => (
          <View key={index} style={[styles.alertCard, { borderLeftColor: getAlertColor(alert.severity) }]}>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>{alert.title}</Text>
              <Text style={styles.alertDescription}>{alert.description}</Text>
              <Text style={styles.alertTime}>
                {new Date(alert.createdAt).toLocaleDateString()} {new Date(alert.createdAt).toLocaleTimeString()}
              </Text>
            </View>
            <Ionicons
              name={getAlertIcon(alert.severity)}
              size={24}
              color={getAlertColor(alert.severity)}
            />
          </View>
        ))}
      </View>
    );
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'high':
        return theme.colors.error;
      case 'medium':
        return theme.colors.warning;
      case 'low':
        return theme.colors.info;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'high':
        return 'warning';
      case 'medium':
        return 'alert-circle';
      case 'low':
        return 'information-circle';
      default:
        return 'notifications';
    }
  };

  const renderRecentUsers = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Users</Text>        <TouchableOpacity onPress={() => navigation.navigate('Users')}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      {dashboardData.recentUsers.length === 0 ? (
        <Text style={styles.emptyText}>No recent users</Text>
      ) : (
        dashboardData.recentUsers.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userRole}>{user.role}</Text>
            </View>
            <Text style={styles.userJoinDate}>
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </Text>
          </View>
        ))
      )}
    </View>
  );

  const renderRecentReviews = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Reviews</Text>        <TouchableOpacity onPress={() => navigation.navigate('Reviews')}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      {dashboardData.recentReviews.length === 0 ? (
        <Text style={styles.emptyText}>No recent reviews</Text>
      ) : (
        dashboardData.recentReviews.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewRating}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons
                    key={i}
                    name={i < review.rating ? 'star' : 'star-outline'}
                    size={16}
                    color={theme.colors.warning}
                  />
                ))}
              </View>
              <Text style={styles.reviewDate}>
                {new Date(review.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.reviewComment} numberOfLines={2}>
              {review.comment}
            </Text>
            <Text style={styles.reviewAuthor}>by {review.user?.name}</Text>
          </View>
        ))
      )}
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('Users')}
        >
          <Ionicons name="people-outline" size={32} color={theme.colors.primary} />
          <Text style={styles.quickActionText}>Manage Users</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('Locations')}
        >
          <Ionicons name="location-outline" size={32} color={theme.colors.secondary} />
          <Text style={styles.quickActionText}>Manage Locations</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('Reviews')}
        >
          <Ionicons name="star-outline" size={32} color={theme.colors.warning} />
          <Text style={styles.quickActionText}>Moderate Reviews</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('AdminAnalytics')}
        >
          <Ionicons name="analytics-outline" size={32} color={theme.colors.info} />
          <Text style={styles.quickActionText}>View Analytics</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('AdminSettings')}
        >
          <Ionicons name="settings-outline" size={32} color={theme.colors.textSecondary} />
          <Text style={styles.quickActionText}>System Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('AdminReports')}
        >
          <Ionicons name="document-text-outline" size={32} color={theme.colors.success} />
          <Text style={styles.quickActionText}>Generate Reports</Text>
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
            <Text style={styles.welcomeText}>Admin Dashboard</Text>
            <Text style={styles.headerTitle}>StayKaru Management</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Overview Stats */}
        {renderOverviewStats()}

        {/* System Alerts */}
        {renderSystemAlerts()}

        {/* Recent Users */}
        {renderRecentUsers()}

        {/* Recent Reviews */}
        {renderRecentReviews()}

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
  section: {
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  statsGrid: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
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
    textAlign: 'center',
  },
  alertCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
  },
  alertDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  alertTime: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  userCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
  },
  userEmail: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  userRole: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
    textTransform: 'capitalize',
  },
  userJoinDate: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
  },
  reviewCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewDate: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
  },
  reviewComment: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
    lineHeight: 18,
    marginBottom: theme.spacing.xs,
  },
  reviewAuthor: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  quickActionCard: {
    flex: 1,
    minWidth: '30%',
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
  emptyText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: theme.spacing.lg,
  },
});

export default AdminDashboardScreen;
