import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { theme } from '../../styles/theme';
import { foodAPI } from '../../api/foodAPI';

const OrderFormScreen = ({ route, navigation }) => {
  const { provider, orderItems, total } = route.params;
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState({
    deliveryAddress: '',
    contactPhone: '',
    specialInstructions: '',
    deliveryType: 'delivery', // 'delivery' or 'pickup'
  });

  const deliveryFee = orderData.deliveryType === 'delivery' ? 3.99 : 0;
  const finalTotal = total + deliveryFee;

  const validateForm = () => {
    if (orderData.deliveryType === 'delivery' && !orderData.deliveryAddress.trim()) {
      Alert.alert('Missing Information', 'Delivery address is required');
      return false;
    }
    if (!orderData.contactPhone.trim()) {
      Alert.alert('Missing Information', 'Contact phone is required');
      return false;
    }
    return true;
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const order = {
        providerId: provider._id,
        items: orderItems.map(item => ({
          menuItemId: item._id,
          quantity: item.quantity,
          price: item.price,
        })),
        deliveryAddress: orderData.deliveryAddress,
        contactPhone: orderData.contactPhone,
        specialInstructions: orderData.specialInstructions,
        deliveryType: orderData.deliveryType,
        subtotal: total,
        deliveryFee,
        totalAmount: finalTotal,
      };

      const response = await foodAPI.createOrder(order);
      
      Alert.alert(
        'Order Placed',
        'Your order has been placed successfully. You will receive updates on its status.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('PaymentScreen', { 
              order: response.data,
              provider 
            }),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const renderOrderSummary = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Order Summary</Text>
      
      <View style={styles.providerInfo}>
        <Text style={styles.providerName}>{provider.businessName}</Text>
        <Text style={styles.providerLocation}>{provider.location}</Text>
      </View>

      {orderItems.map((item, index) => (
        <View key={index} style={styles.orderItem}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDescription} numberOfLines={1}>
              {item.description}
            </Text>
          </View>
          <View style={styles.itemQuantityPrice}>
            <Text style={styles.itemQuantity}>x{item.quantity}</Text>
            <Text style={styles.itemPrice}>
              ${(item.price * item.quantity).toFixed(2)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderDeliveryOptions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Delivery Options</Text>
      
      <View style={styles.deliveryOptions}>
        <TouchableOpacity
          style={[
            styles.deliveryOption,
            orderData.deliveryType === 'delivery' && styles.deliveryOptionActive,
          ]}
          onPress={() => setOrderData(prev => ({ ...prev, deliveryType: 'delivery' }))}
        >
          <View style={styles.deliveryOptionHeader}>
            <Ionicons 
              name="bicycle" 
              size={24} 
              color={orderData.deliveryType === 'delivery' ? theme.colors.primary : theme.colors.text.secondary} 
            />
            <Text style={[
              styles.deliveryOptionTitle,
              orderData.deliveryType === 'delivery' && styles.deliveryOptionTitleActive,
            ]}>
              Delivery
            </Text>
          </View>
          <Text style={styles.deliveryOptionSubtitle}>20-30 min • $3.99</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.deliveryOption,
            orderData.deliveryType === 'pickup' && styles.deliveryOptionActive,
          ]}
          onPress={() => setOrderData(prev => ({ ...prev, deliveryType: 'pickup' }))}
        >
          <View style={styles.deliveryOptionHeader}>
            <Ionicons 
              name="storefront" 
              size={24} 
              color={orderData.deliveryType === 'pickup' ? theme.colors.primary : theme.colors.text.secondary} 
            />
            <Text style={[
              styles.deliveryOptionTitle,
              orderData.deliveryType === 'pickup' && styles.deliveryOptionTitleActive,
            ]}>
              Pickup
            </Text>
          </View>
          <Text style={styles.deliveryOptionSubtitle}>15-20 min • Free</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContactInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Contact Information</Text>
      
      {orderData.deliveryType === 'delivery' && (
        <Input
          label="Delivery Address"
          value={orderData.deliveryAddress}
          onChangeText={(text) =>
            setOrderData(prev => ({ ...prev, deliveryAddress: text }))
          }
          placeholder="Enter your full delivery address"
          multiline
          numberOfLines={3}
          required
        />
      )}

      <Input
        label="Contact Phone"
        value={orderData.contactPhone}
        onChangeText={(text) =>
          setOrderData(prev => ({ ...prev, contactPhone: text }))
        }
        placeholder="+1234567890"
        keyboardType="phone-pad"
        required
      />

      <Input
        label="Special Instructions"
        value={orderData.specialInstructions}
        onChangeText={(text) =>
          setOrderData(prev => ({ ...prev, specialInstructions: text }))
        }
        placeholder="Any special instructions for your order..."
        multiline
        numberOfLines={3}
      />
    </View>
  );

  const renderPriceSummary = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Payment Summary</Text>
      
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Subtotal</Text>
        <Text style={styles.priceValue}>${total.toFixed(2)}</Text>
      </View>
      
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Delivery Fee</Text>
        <Text style={styles.priceValue}>
          {deliveryFee > 0 ? `$${deliveryFee.toFixed(2)}` : 'Free'}
        </Text>
      </View>
      
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Tax</Text>
        <Text style={styles.priceValue}>Included</Text>
      </View>
      
      <View style={[styles.priceRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>${finalTotal.toFixed(2)}</Text>
      </View>
    </View>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderOrderSummary()}
        {renderDeliveryOptions()}
        {renderContactInfo()}
        {renderPriceSummary()}

        <Button
          title="Place Order"
          onPress={handleSubmitOrder}
          style={styles.submitButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  providerInfo: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  providerName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  providerLocation: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  itemInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  itemName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  itemDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  itemQuantityPrice: {
    alignItems: 'flex-end',
  },
  itemQuantity: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  itemPrice: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
  },
  deliveryOptions: {
    gap: theme.spacing.md,
  },
  deliveryOption: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  deliveryOptionActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  deliveryOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  deliveryOptionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  },
  deliveryOptionTitleActive: {
    color: theme.colors.primary,
  },
  deliveryOptionSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginLeft: 32, // Icon width + margin
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  priceLabel: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
  },
  priceValue: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weights.medium,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  totalLabel: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
  },
  totalValue: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  submitButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
});

export default OrderFormScreen;
