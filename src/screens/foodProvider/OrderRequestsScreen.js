import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/common/Card';
import { theme } from '../../styles/theme';
import { foodAPI } from '../../api/foodAPI';
import { ORDER_STATUS } from '../../constants';

const OrderRequestsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processingOrder, setProcessingOrder] = useState(null);

  const filterOptions = [
    { label: 'All Orders', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'Preparing', value: 'preparing' },
    { label: 'Ready', value: 'ready' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  useEffect(() => {
    filterOrders();
  }, [orders, selectedFilter, searchQuery]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await foodAPI.getProviderOrders();
      if (response.success) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Error', 'Failed to load orders. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filter by status
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(order => order.status === selectedFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(query) ||
        order.customer.name.toLowerCase().includes(query) ||
        order.items.some(item => item.name.toLowerCase().includes(query))
      );
    }

    setFilteredOrders(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const handleOrderAction = async (orderId, action, reason = null) => {
    const validActions = ['accept', 'reject', 'prepare', 'ready', 'complete'];
    if (!validActions.includes(action)) {
      Alert.alert('Error', 'Invalid action.');
      return;
    }

    try {
      setProcessingOrder(orderId);
      const response = await foodAPI.updateOrderStatus(orderId, action, reason);
      
      if (response.success) {
        Alert.alert('Success', `Order ${action} successfully!`);
        loadOrders();
        setModalVisible(false);
        setRejectReason('');
      } else {
        Alert.alert('Error', response.message || `Failed to ${action} order`);
      }
    } catch (error) {
      console.error(`Error ${action} order:`, error);
      Alert.alert('Error', `Failed to ${action} order. Please try again later.`);
    } finally {
      setProcessingOrder(null);
    }
  };

  const showRejectModal = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection');
      return;
    }
    handleOrderAction(selectedOrder.id, 'reject', rejectReason);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: theme.colors.warning,
      accepted: theme.colors.info,
      preparing: theme.colors.secondary,
      ready: theme.colors.success,
      completed: theme.colors.primary,
      cancelled: theme.colors.error,
      rejected: theme.colors.error,
    };
    return statusColors[status] || theme.colors.textLight;
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      pending: 'time',
      accepted: 'checkmark-circle',
      preparing: 'restaurant',
      ready: 'checkmark-done',
      completed: 'checkmark-done-circle',
      cancelled: 'close-circle',
      rejected: 'close-circle',
    };
    return statusIcons[status] || 'help-circle';
  };
  const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || !isFinite(amount) || isNaN(amount)) {
      return 'RM 0.00';
    }
    return `RM ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderOrderCard = (order) => (
    <Card key={order.id} style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
          <Text style={styles.customerName}>{order.customer.name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
          <Ionicons
            name={getStatusIcon(order.status)}
            size={16}
            color={getStatusColor(order.status)}
          />
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
        <Text style={styles.orderType}>
          {order.type === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}
        </Text>
      </View>

      <View style={styles.itemsList}>
        {order.items.map((item, index) => (
          <View key={index} style={styles.orderItem}>
            <Text style={styles.itemName}>
              {item.quantity}x {item.name}
            </Text>
            <Text style={styles.itemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.orderTotal}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>{formatCurrency(order.total)}</Text>
        </View>

        <View style={styles.orderActions}>
          {order.status === 'pending' && (
            <>
              <Button
                title="Reject"
                onPress={() => showRejectModal(order)}
                variant="outline"
                style={styles.actionButton}
                disabled={processingOrder === order.id}
              />
              <Button
                title="Accept"
                onPress={() => handleOrderAction(order.id, 'accept')}
                style={styles.actionButton}
                disabled={processingOrder === order.id}
                loading={processingOrder === order.id}
              />
            </>
          )}

          {order.status === 'accepted' && (
            <Button
              title="Start Preparing"
              onPress={() => handleOrderAction(order.id, 'prepare')}
              style={styles.fullWidthButton}
              disabled={processingOrder === order.id}
              loading={processingOrder === order.id}
            />
          )}

          {order.status === 'preparing' && (
            <Button
              title="Mark as Ready"
              onPress={() => handleOrderAction(order.id, 'ready')}
              style={styles.fullWidthButton}
              disabled={processingOrder === order.id}
              loading={processingOrder === order.id}
            />
          )}

          {order.status === 'ready' && (
            <Button
              title="Mark as Completed"
              onPress={() => handleOrderAction(order.id, 'complete')}
              style={styles.fullWidthButton}
              disabled={processingOrder === order.id}
              loading={processingOrder === order.id}
            />
          )}
        </View>
      </View>

      {order.specialInstructions && (
        <View style={styles.specialInstructions}>
          <Text style={styles.instructionsLabel}>Special Instructions:</Text>
          <Text style={styles.instructionsText}>{order.specialInstructions}</Text>
        </View>
      )}

      {order.type === 'delivery' && order.deliveryAddress && (
        <View style={styles.deliveryInfo}>
          <Text style={styles.deliveryLabel}>Delivery Address:</Text>
          <Text style={styles.deliveryText}>{order.deliveryAddress}</Text>
        </View>
      )}
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Requests</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search by order number, customer, or item..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search"
        />
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterTab,
              selectedFilter === option.value && styles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter(option.value)}
          >
            <Text
              style={[
                styles.filterTabText,
                selectedFilter === option.value && styles.filterTabTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders List */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {filteredOrders.length > 0 ? (
            filteredOrders.map(renderOrderCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={64} color={theme.colors.textLight} />
              <Text style={styles.emptyStateTitle}>No Orders Found</Text>
              <Text style={styles.emptyStateText}>
                {selectedFilter === 'all'
                  ? "You haven't received any orders yet."
                  : `No ${selectedFilter} orders found.`}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Reject Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reject Order</Text>
            <Text style={styles.modalSubtitle}>
              Please provide a reason for rejecting this order:
            </Text>
            
            <Input
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={3}
              style={styles.rejectInput}
            />

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => {
                  setModalVisible(false);
                  setRejectReason('');
                }}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Reject Order"
                onPress={handleReject}
                style={styles.modalButton}
                disabled={processingOrder === selectedOrder?.id}
                loading={processingOrder === selectedOrder?.id}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  filterContainer: {
    paddingVertical: theme.spacing.sm,
  },
  filterContent: {
    paddingHorizontal: theme.spacing.md,
  },
  filterTab: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterTabActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterTabText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
  },
  filterTabTextActive: {
    color: theme.colors.white,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.md,
  },
  orderCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
  },
  customerName: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  statusText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    marginLeft: theme.spacing.xs,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  orderDate: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
  },
  orderType: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
  },
  itemsList: {
    marginBottom: theme.spacing.md,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  itemName: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
    flex: 1,
  },
  itemPrice: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
  },
  orderFooter: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  totalLabel: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
  },
  totalAmount: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  fullWidthButton: {
    flex: 1,
  },
  specialInstructions: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.warningLight,
    borderRadius: theme.borderRadius.md,
  },
  instructionsLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  instructionsText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
  },
  deliveryInfo: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.infoLight,
    borderRadius: theme.borderRadius.md,
  },
  deliveryLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  deliveryText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyStateTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  emptyStateText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    margin: theme.spacing.md,
    width: '90%',
  },
  modalTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  modalSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.md,
  },
  rejectInput: {
    marginBottom: theme.spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
});

export default OrderRequestsScreen;
