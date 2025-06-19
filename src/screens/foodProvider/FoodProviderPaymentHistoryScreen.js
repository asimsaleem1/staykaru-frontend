import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/common/Card';
import { paymentAPI } from '../../api/commonAPI';

const FoodProviderPaymentHistoryScreen = ({ navigation }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, completed, pending, refunded

  useEffect(() => {
    loadPayments();
  }, [filter]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockPayments = [
        {
          id: '1',
          amount: 45.50,
          currency: 'USD',
          status: 'completed',
          paymentMethod: 'Credit Card',
          transactionId: 'TXN_F001',
          referenceType: 'order',
          referenceId: 'order_123',
          createdAt: '2024-12-15T12:30:00Z',
          order: {
            customerName: 'John Doe',
            items: [
              { name: 'Chicken Pizza', quantity: 1, price: 25.50 },
              { name: 'Garlic Bread', quantity: 2, price: 10.00 },
            ],
            deliveryAddress: '123 Main St, City',
          },
        },
        {
          id: '2',
          amount: 32.00,
          currency: 'USD',
          status: 'completed',
          paymentMethod: 'Digital Wallet',
          transactionId: 'TXN_F002',
          referenceType: 'order',
          referenceId: 'order_124',
          createdAt: '2024-12-15T11:15:00Z',
          order: {
            customerName: 'Jane Smith',
            items: [
              { name: 'Burger Combo', quantity: 1, price: 18.00 },
              { name: 'Fries', quantity: 1, price: 6.00 },
              { name: 'Coke', quantity: 2, price: 4.00 },
            ],
            deliveryAddress: '456 Oak Ave, City',
          },
        },
        {
          id: '3',
          amount: 28.75,
          currency: 'USD',
          status: 'pending',
          paymentMethod: 'Credit Card',
          transactionId: 'TXN_F003',
          referenceType: 'order',
          referenceId: 'order_125',
          createdAt: '2024-12-15T10:45:00Z',
          order: {
            customerName: 'Mike Johnson',
            items: [
              { name: 'Pasta Carbonara', quantity: 1, price: 22.75 },
              { name: 'Salad', quantity: 1, price: 6.00 },
            ],
            deliveryAddress: '789 Pine St, City',
          },
        },
        {
          id: '4',
          amount: 15.25,
          currency: 'USD',
          status: 'refunded',
          paymentMethod: 'Credit Card',
          transactionId: 'TXN_F004',
          referenceType: 'order',
          referenceId: 'order_126',
          createdAt: '2024-12-14T19:20:00Z',
          order: {
            customerName: 'Sarah Wilson',
            items: [
              { name: 'Chicken Sandwich', quantity: 1, price: 15.25 },
            ],
            deliveryAddress: '321 Elm St, City',
          },
        },
      ];

      const filteredPayments = filter === 'all' 
        ? mockPayments 
        : mockPayments.filter(payment => payment.status === filter);

      setPayments(filteredPayments);
    } catch (error) {
      console.error('Error loading payments:', error);
      Alert.alert('Error', 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPayments();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return theme.colors.success;
      case 'pending':
        return theme.colors.warning;
      case 'refunded':
        return theme.colors.error;
      case 'failed':
        return theme.colors.error;
      default:
        return theme.colors.text.secondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'refunded':
        return 'return-up-back';
      case 'failed':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const FilterButton = ({ type, label, isActive }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        isActive && styles.filterButtonActive,
      ]}
      onPress={() => setFilter(type)}
    >
      <Text
        style={[
          styles.filterButtonText,
          isActive && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const PaymentItem = ({ item }) => (
    <Card style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentInfo}>
          <Text style={styles.customerName}>Customer: {item.order.customerName}</Text>
          <Text style={styles.itemCount}>
            {item.order.items.length} item{item.order.items.length > 1 ? 's' : ''}
          </Text>
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={styles.paymentStatus}>
          <View style={styles.amountContainer}>
            <Text style={styles.amountText}>${item.amount.toFixed(2)}</Text>
            <Text style={styles.currencyText}>{item.currency}</Text>
          </View>
          <View style={styles.statusContainer}>
            <Ionicons
              name={getStatusIcon(item.status)}
              size={16}
              color={getStatusColor(item.status)}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.orderItemsTitle}>Order Items:</Text>
        {item.order.items.map((orderItem, index) => (
          <View key={index} style={styles.orderItem}>
            <Text style={styles.itemName}>
              {orderItem.quantity}x {orderItem.name}
            </Text>
            <Text style={styles.itemPrice}>${orderItem.price.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.paymentDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Payment Method:</Text>
          <Text style={styles.detailValue}>{item.paymentMethod}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Transaction ID:</Text>
          <Text style={styles.detailValue}>{item.transactionId}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Delivery Address:</Text>
          <Text style={[styles.detailValue, styles.addressText]}>
            {item.order.deliveryAddress}
          </Text>
        </View>
      </View>
    </Card>
  );

  const totalEarnings = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment History</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryValue}>${totalEarnings.toFixed(2)}</Text>
          <Text style={styles.summaryLabel}>Total Earnings</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryValue}>${pendingAmount.toFixed(2)}</Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </Card>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <FilterButton
          type="all"
          label="All"
          isActive={filter === 'all'}
        />
        <FilterButton
          type="completed"
          label="Completed"
          isActive={filter === 'completed'}
        />
        <FilterButton
          type="pending"
          label="Pending"
          isActive={filter === 'pending'}
        />
        <FilterButton
          type="refunded"
          label="Refunded"
          isActive={filter === 'refunded'}
        />
      </View>

      {/* Payments List */}
      <FlatList
        data={payments}
        keyExtractor={(item) => item.id}
        renderItem={PaymentItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="card-outline"
              size={64}
              color={theme.colors.text.secondary}
            />
            <Text style={styles.emptyTitle}>No Payments Found</Text>
            <Text style={styles.emptyText}>
              Payment history will appear here
            </Text>
          </View>
        }
      />
    </View>
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
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.text.primary,
    flex: 1,
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  summaryValue: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  summaryLabel: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: theme.colors.white,
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  paymentCard: {
    marginBottom: theme.spacing.md,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  paymentInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: theme.typography.h4.fontWeight,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  itemCount: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  dateText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
  },
  paymentStatus: {
    alignItems: 'flex-end',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing.xs,
  },
  amountText: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text.primary,
  },
  currencyText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  orderDetails: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
  },
  orderItemsTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  itemName: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  itemPrice: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  paymentDetails: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  detailValue: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.primary,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  addressText: {
    textAlign: 'right',
    flexWrap: 'wrap',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});

export default FoodProviderPaymentHistoryScreen;
