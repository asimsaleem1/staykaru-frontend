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
import { USER_ROLES, ORDER_STATUS } from '../../constants';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/common/Card';
import { menuItemAPI, orderAPI } from '../../api/foodAPI';
import { analyticsAPI } from '../../api/commonAPI';

const FoodProviderDashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    menuItems: [],
    recentOrders: [],
    stats: {
      totalMenuItems: 0,
      totalOrders: 0,
      monthlyRevenue: 0,
      averageRating: 0,
    },
    pendingOrders: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
        const [menuRes, ordersRes, analyticsRes] = await Promise.all([
        menuItemAPI.getProviderMenuItems(),
        orderAPI.getProviderOrders({ limit: 5 }),
        analyticsAPI.getFoodProviderAnalytics('overview'),
      ]);setDashboardData({
        menuItems: (menuRes.data || []).slice(0, 3), // Show first 3 menu items
        recentOrders: ordersRes.data.orders || [],
        stats: analyticsRes.data.stats || {
          totalMenuItems: 0,
          totalOrders: 0,
          monthlyRevenue: 0,
          averageRating: 0,
        },
        pendingOrders: ordersRes.data.orders?.filter(
          order => order.status === ORDER_STATUS.PENDING || order.status === ORDER_STATUS.CONFIRMED
        ) || [],
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

  const handleOrderAction = async (orderId, action) => {
    const validActions = ['accept', 'reject', 'prepare', 'ready'];
    if (!validActions.includes(action)) {
      Alert.alert('Error', 'Invalid action.');
      return;
    }

    try {
      if (action === 'accept') {
        await orderAPI.acceptOrder(orderId);
        Alert.alert('Success', 'Order accepted successfully');
      } else if (action === 'reject') {
        await orderAPI.rejectOrder(orderId);
        Alert.alert('Success', 'Order rejected successfully');
      } else if (action === 'prepare') {
        await orderAPI.updateOrderStatus(orderId, ORDER_STATUS.PREPARING);
        Alert.alert('Success', 'Order status updated to preparing');
      } else if (action === 'ready') {
        await orderAPI.updateOrderStatus(orderId, ORDER_STATUS.READY);
        Alert.alert('Success', 'Order is ready for pickup/delivery');
      }
      
      // Refresh data
      fetchDashboardData();
    } catch (error) {
      console.error(`Error ${action}ing order:`, error);
      Alert.alert('Error', `Failed to ${action} order. Please try again later.`);
    }
  };

  const renderQuickStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Ionicons name="restaurant-outline" size={24} color={theme.colors.primary} />
        <Text style={styles.statValue}>{dashboardData.stats.totalMenuItems}</Text>
        <Text style={styles.statLabel}>Menu Items</Text>
      </View>
      
      <View style={styles.statCard}>
        <Ionicons name="receipt-outline" size={24} color={theme.colors.secondary} />
        <Text style={styles.statValue}>{dashboardData.stats.totalOrders}</Text>
        <Text style={styles.statLabel}>Orders</Text>
      </View>
      
      <View style={styles.statCard}>
        <Ionicons name="cash-outline" size={24} color={theme.colors.success} />
        <Text style={styles.statValue}>RM {dashboardData.stats.monthlyRevenue?.toFixed(0) || 0}</Text>
        <Text style={styles.statLabel}>Revenue</Text>
      </View>
      
      <View style={styles.statCard}>
        <Ionicons name="star-outline" size={24} color={theme.colors.warning} />
        <Text style={styles.statValue}>{dashboardData.stats.averageRating?.toFixed(1) || 0}</Text>
        <Text style={styles.statLabel}>Rating</Text>
      </View>
    </View>
  );

  const renderPendingOrders = () => {
    if (dashboardData.pendingOrders.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pending Orders</Text>
          <TouchableOpacity onPress={() => navigation.navigate('OrderRequests')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {(dashboardData.pendingOrders || []).slice(0, 3).map((order) => (
          <View key={order.id} style={styles.pendingOrderCard}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderNumber}>Order #{order.id}</Text>
              <Text style={styles.orderCustomer}>Customer: {order.user?.name}</Text>              <Text style={styles.orderItems}>
                {order.items?.length} item(s) • RM {(order.totalAmount && typeof order.totalAmount === 'number') 
                  ? order.totalAmount.toFixed(2) 
                  : '0.00'}
              </Text>
              <Text style={styles.orderTime}>
                {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
              </Text>
            </View>
            
            <View style={styles.orderActions}>
              {order.status === ORDER_STATUS.PENDING && (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleOrderAction(order.id, 'reject')}
                  >
                    <Text style={styles.rejectButtonText}>Reject</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => handleOrderAction(order.id, 'accept')}
                  >
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  </TouchableOpacity>
                </>
              )}
              
              {order.status === ORDER_STATUS.CONFIRMED && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.prepareButton]}
                  onPress={() => handleOrderAction(order.id, 'prepare')}
                >
                  <Text style={styles.prepareButtonText}>Start Preparing</Text>
                </TouchableOpacity>
              )}
              
              {order.status === ORDER_STATUS.PREPARING && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.readyButton]}
                  onPress={() => handleOrderAction(order.id, 'ready')}
                >
                  <Text style={styles.readyButtonText}>Mark Ready</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderMyMenu = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Menu</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MyMenu')}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      {dashboardData.menuItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="restaurant-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={styles.emptyTitle}>No Menu Items Yet</Text>
          <Text style={styles.emptyDescription}>Add your first menu item to start receiving orders</Text>
          <Button
            title="Add Menu Item"
            onPress={() => navigation.navigate('AddMenuItem')}
            style={styles.addMenuButton}
          />
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {dashboardData.menuItems.map((item) => (
            <View key={item.id} style={styles.menuCard}>
              <Card
                type="menuItem"
                data={item}
                onPress={() => navigation.navigate('EditMenuItem', { itemId: item.id })}
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
          onPress={() => navigation.navigate('AddMenuItem')}
        >
          <Ionicons name="add-circle-outline" size={32} color={theme.colors.primary} />
          <Text style={styles.quickActionText}>Add Menu Item</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('OrderRequests')}
        >
          <Ionicons name="receipt-outline" size={32} color={theme.colors.secondary} />
          <Text style={styles.quickActionText}>Order Requests</Text>
        </TouchableOpacity>        
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('Analytics')}
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
            <Text style={styles.headerTitle}>Food Provider Dashboard</Text>
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

        {/* Pending Orders */}
        {renderPendingOrders()}

        {/* My Menu */}
        {renderMyMenu()}

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
  pendingOrderCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
  },
  orderCustomer: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  orderItems: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  orderTime: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  orderActions: {
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
  prepareButton: {
    backgroundColor: theme.colors.primary,
  },
  readyButton: {
    backgroundColor: theme.colors.warning,
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
  prepareButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
  },
  readyButtonText: {
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
  addMenuButton: {
    backgroundColor: theme.colors.primary,
  },
  menuCard: {
    width: 200,
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

export default FoodProviderDashboardScreen;
