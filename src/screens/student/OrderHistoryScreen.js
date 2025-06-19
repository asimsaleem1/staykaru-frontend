import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { OrderCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { theme } from '../../styles/theme';
import { foodAPI } from '../../api/foodAPI';
import { ORDER_STATUS } from '../../constants';

const OrderHistoryScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await foodAPI.getUserOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, []);

  const handleCancelOrder = (order) => {
    Alert.alert(
      'Cancel Order',
      `Are you sure you want to cancel your order from ${order.provider?.businessName}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => cancelOrder(order._id),
        },
      ]
    );
  };

  const cancelOrder = async (orderId) => {
    try {
      await foodAPI.cancelOrder(orderId);
      Alert.alert('Success', 'Order cancelled successfully');
      fetchOrders(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel order');
    }
  };

  const handleReorder = async (order) => {
    try {
      // Navigate to the provider detail screen with the items in cart
      const orderItems = order.items.map(item => ({
        ...item.menuItem,
        quantity: item.quantity,
      }));
      
      navigation.navigate('FoodProviderDetail', {
        provider: order.provider,
        reorderItems: orderItems,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to reorder');
    }
  };

  const handleOrderPress = (order) => {
    navigation.navigate('OrderDetailScreen', { order });
  };

  const getFilteredOrders = () => {
    if (filter === 'all') return orders;
    
    switch (filter) {
      case 'active':
        return orders.filter(order => 
          [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING, ORDER_STATUS.OUT_FOR_DELIVERY].includes(order.status)
        );
      case 'completed':
        return orders.filter(order => order.status === ORDER_STATUS.DELIVERED);
      case 'cancelled':
        return orders.filter(order => order.status === ORDER_STATUS.CANCELLED);
      default:
        return orders;
    }
  };

  const renderOrderItem = ({ item }) => (
    <OrderCard
      order={item}
      onPress={() => handleOrderPress(item)}
      onCancel={() => handleCancelOrder(item)}
      onReorder={() => handleReorder(item)}
      style={styles.orderCard}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="restaurant-outline" size={64} color={theme.colors.text.secondary} />
      <Text style={styles.emptyTitle}>No Orders Found</Text>
      <Text style={styles.emptyText}>
        {filter === 'all' 
          ? "You haven't placed any orders yet"
          : `No ${filter} orders found`
        }
      </Text>
      <Button
        title="Browse Food Providers"
        onPress={() => navigation.navigate('FoodProvidersScreen')}
        style={styles.browseButton}
      />
    </View>
  );

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      {[
        { key: 'all', label: 'All' },
        { key: 'active', label: 'Active' },
        { key: 'completed', label: 'Completed' },
        { key: 'cancelled', label: 'Cancelled' },
      ].map((filterOption) => (
        <TouchableOpacity
          key={filterOption.key}
          style={[
            styles.filterButton,
            filter === filterOption.key && styles.filterButtonActive,
          ]}
          onPress={() => setFilter(filterOption.key)}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === filterOption.key && styles.filterButtonTextActive,
            ]}
          >
            {filterOption.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOrderStats = () => {
    const activeOrders = orders.filter(order => 
      [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING, ORDER_STATUS.OUT_FOR_DELIVERY].includes(order.status)
    ).length;
    
    const totalSpent = orders
      .filter(order => order.status === ORDER_STATUS.DELIVERED)
      .reduce((sum, order) => sum + order.totalAmount, 0);

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{orders.length}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{activeOrders}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>${totalSpent.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const filteredOrders = getFilteredOrders();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Order History</Text>
        {orders.length > 0 && renderOrderStats()}
        {renderFilterButtons()}
      </View>

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: theme.colors.border,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.weights.medium,
  },
  filterButtonTextActive: {
    color: theme.colors.white,
  },
  listContainer: {
    padding: theme.spacing.md,
    flexGrow: 1,
  },
  orderCard: {
    marginBottom: theme.spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  browseButton: {
    paddingHorizontal: theme.spacing.xl,
  },
});

export default OrderHistoryScreen;
