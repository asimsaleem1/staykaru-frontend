import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { ORDER_STATUS } from '../../constants';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { orderAPI } from '../../api/foodAPI';

const OrderDetailScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getOrderById(orderId);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order detail:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive', onPress: confirmCancelOrder },
      ]
    );
  };

  const confirmCancelOrder = async () => {
    try {
      setCancelling(true);
      await orderAPI.cancelOrder(orderId);
      Alert.alert('Success', 'Order cancelled successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error cancelling order:', error);
      Alert.alert('Error', 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return theme.colors.warning;
      case ORDER_STATUS.CONFIRMED:
        return theme.colors.info;
      case ORDER_STATUS.PREPARING:
        return theme.colors.primary;
      case ORDER_STATUS.READY:
        return theme.colors.success;
      case ORDER_STATUS.DELIVERED:
        return theme.colors.success;
      case ORDER_STATUS.CANCELLED:
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const canCancelOrder = () => {
    return order?.status === ORDER_STATUS.PENDING || order?.status === ORDER_STATUS.CONFIRMED;
  };

  const handleReorder = () => {
    navigation.navigate('FoodProviderDetail', { 
      providerId: order.foodProvider.id,
      reorderItems: order.items 
    });
  };

  const handleTrackOrder = () => {
    if (order.trackingInfo) {
      Alert.alert('Order Tracking', `Your order is ${order.status.toLowerCase()}. ${order.trackingInfo}`);
    } else {
      Alert.alert('Order Tracking', `Your order is ${order.status.toLowerCase()}.`);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Order not found</Text>
          <Button title="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
        </View>

        {/* Order Status */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
            <Text style={styles.statusText}>{order.status}</Text>
          </View>
          <Text style={styles.orderId}>Order ID: {order.id}</Text>
          <Text style={styles.orderTime}>
            Ordered on {new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {/* Food Provider Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Food Provider</Text>
          <View style={styles.providerCard}>
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>{order.foodProvider?.name}</Text>
              <Text style={styles.providerLocation}>
                <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
                {order.foodProvider?.location}
              </Text>
              <Text style={styles.providerPhone}>
                <Ionicons name="call-outline" size={16} color={theme.colors.textSecondary} />
                {order.foodProvider?.phone}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items?.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.customizations && (
                  <Text style={styles.itemCustomizations}>{item.customizations}</Text>
                )}
                <Text style={styles.itemPrice}>RM {item.price?.toFixed(2)} x {item.quantity}</Text>
              </View>
              <Text style={styles.itemTotal}>RM {(item.price * item.quantity)?.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Delivery Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>
          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryType}>
              <Ionicons 
                name={order.deliveryType === 'delivery' ? 'bicycle-outline' : 'storefront-outline'} 
                size={16} 
                color={theme.colors.primary} 
              />
              {order.deliveryType === 'delivery' ? 'Delivery' : 'Pickup'}
            </Text>
            
            {order.deliveryType === 'delivery' && (
              <>
                <Text style={styles.deliveryAddress}>{order.deliveryAddress}</Text>
                <Text style={styles.deliveryTime}>
                  Estimated delivery: {order.estimatedDeliveryTime || 'TBA'}
                </Text>
              </>
            )}
            
            {order.deliveryType === 'pickup' && (
              <Text style={styles.pickupTime}>
                Pickup time: {order.pickupTime || 'TBA'}
              </Text>
            )}
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <Text style={styles.contactName}>{order.contactInfo?.name}</Text>
          <Text style={styles.contactPhone}>{order.contactInfo?.phone}</Text>
        </View>

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Subtotal</Text>
            <Text style={styles.paymentValue}>RM {order.subtotal?.toFixed(2)}</Text>
          </View>
          {order.deliveryFee > 0 && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Delivery Fee</Text>
              <Text style={styles.paymentValue}>RM {order.deliveryFee?.toFixed(2)}</Text>
            </View>
          )}
          {order.discount > 0 && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Discount</Text>
              <Text style={[styles.paymentValue, { color: theme.colors.success }]}>
                -RM {order.discount?.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={[styles.paymentRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>RM {order.totalAmount?.toFixed(2)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Payment Method</Text>
            <Text style={styles.paymentValue}>{order.paymentMethod}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Payment Status</Text>
            <Text style={[styles.paymentValue, { 
              color: order.paymentStatus === 'paid' ? theme.colors.success : theme.colors.warning 
            }]}>
              {order.paymentStatus}
            </Text>
          </View>
        </View>

        {/* Special Instructions */}
        {order.specialInstructions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Instructions</Text>
            <Text style={styles.specialInstructions}>{order.specialInstructions}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {order.status !== ORDER_STATUS.CANCELLED && order.status !== ORDER_STATUS.DELIVERED && (
            <Button
              title="Track Order"
              onPress={handleTrackOrder}
              style={styles.trackButton}
            />
          )}

          {canCancelOrder() && (
            <Button
              title={cancelling ? "Cancelling..." : "Cancel Order"}
              onPress={handleCancelOrder}
              variant="outline"
              disabled={cancelling}
              style={styles.cancelButton}
            />
          )}

          <Button
            title="Reorder"
            onPress={handleReorder}
            style={styles.reorderButton}
          />

          <Button
            title="Contact Food Provider"
            onPress={() => {
              Alert.alert('Feature Coming Soon', 'Direct messaging with food providers will be available soon!');
            }}
            style={styles.contactButton}
          />

          {order.status === ORDER_STATUS.DELIVERED && (
            <Button
              title="Leave Review"
              onPress={() => navigation.navigate('ReviewForm', { 
                type: 'order',
                targetId: order.foodProvider.id,
                orderId: order.id
              })}
              style={styles.reviewButton}
            />
          )}
        </View>
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
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
  },
  statusContainer: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.sm,
  },
  statusText: {
    color: theme.colors.white,
    fontWeight: theme.typography.weights.semiBold,
    textTransform: 'uppercase',
  },
  orderId: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  orderTime: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  section: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  providerCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
  },
  providerLocation: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginVertical: theme.spacing.xs,
  },
  providerPhone: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  itemInfo: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  itemName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
  },
  itemCustomizations: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  itemPrice: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  itemTotal: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
  },
  deliveryInfo: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  deliveryType: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  deliveryAddress: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  deliveryTime: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.medium,
  },
  pickupTime: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.medium,
  },
  contactName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
  },
  contactPhone: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  paymentLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  paymentValue: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  totalLabel: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
  },
  totalValue: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  specialInstructions: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },
  actionButtons: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  trackButton: {
    backgroundColor: theme.colors.info,
  },
  cancelButton: {
    borderColor: theme.colors.error,
    borderWidth: 1,
  },
  reorderButton: {
    backgroundColor: theme.colors.primary,
  },
  contactButton: {
    backgroundColor: theme.colors.secondary,
  },
  reviewButton: {
    backgroundColor: theme.colors.success,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
});

export default OrderDetailScreen;
