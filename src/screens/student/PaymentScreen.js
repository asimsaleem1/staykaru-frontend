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
import { commonAPI } from '../../api/commonAPI';

const PaymentScreen = ({ route, navigation }) => {
  const { booking, order, accommodation, provider } = route.params;
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
  });

  const isBookingPayment = !!booking;
  const paymentItem = booking || order;
  const relatedItem = accommodation || provider;
  const paymentAmount = paymentItem?.totalCost || paymentItem?.totalAmount || 0;

  const validateCardForm = () => {
    if (!paymentData.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      Alert.alert('Invalid Card', 'Please enter a valid 16-digit card number');
      return false;
    }
    if (!paymentData.expiryDate.match(/^\d{2}\/\d{2}$/)) {
      Alert.alert('Invalid Expiry', 'Please enter expiry date in MM/YY format');
      return false;
    }
    if (!paymentData.cvv.match(/^\d{3,4}$/)) {
      Alert.alert('Invalid CVV', 'Please enter a valid 3-4 digit CVV');
      return false;
    }
    if (!paymentData.cardholderName.trim()) {
      Alert.alert('Missing Information', 'Cardholder name is required');
      return false;
    }
    return true;
  };

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    return formatted;
  };

  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handlePayment = async () => {
    if (paymentMethod === 'card' && !validateCardForm()) {
      return;
    }

    setLoading(true);
    try {
      const paymentPayload = {
        type: isBookingPayment ? 'booking' : 'order',
        itemId: paymentItem._id,
        amount: paymentAmount,
        paymentMethod,
        paymentDetails: paymentMethod === 'card' ? {
          cardNumber: paymentData.cardNumber.replace(/\s/g, ''),
          expiryDate: paymentData.expiryDate,
          cardholderName: paymentData.cardholderName,
        } : null,
      };

      const response = await commonAPI.processPayment(paymentPayload);
      
      Alert.alert(
        'Payment Successful',
        `Your payment of $${paymentAmount.toFixed(2)} has been processed successfully.`,
        [
          {
            text: 'OK',
            onPress: () => {              // Navigate to appropriate confirmation screen
              if (isBookingPayment) {
                navigation.navigate('BookingHistory');
              } else {
                navigation.navigate('OrderHistory');
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Payment Failed', error.message || 'Payment could not be processed');
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentSummary = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Payment Summary</Text>
      
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.itemTitle}>
            {isBookingPayment ? relatedItem?.title : relatedItem?.businessName}
          </Text>
          <Text style={styles.itemSubtitle}>
            {isBookingPayment ? 'Accommodation Booking' : 'Food Order'}
          </Text>
        </View>

        {isBookingPayment ? (
          <View style={styles.summaryDetails}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Check-in:</Text>
              <Text style={styles.summaryValue}>
                {new Date(booking.checkInDate).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Check-out:</Text>
              <Text style={styles.summaryValue}>
                {new Date(booking.checkOutDate).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Guests:</Text>
              <Text style={styles.summaryValue}>{booking.guests}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.summaryDetails}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items:</Text>
              <Text style={styles.summaryValue}>
                {order?.items?.length || 0} item{(order?.items?.length || 0) !== 1 ? 's' : ''}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery:</Text>
              <Text style={styles.summaryValue}>
                {order?.deliveryType === 'delivery' ? 'Home Delivery' : 'Pickup'}
              </Text>
            </View>
          </View>
        )}

        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalValue}>${paymentAmount.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );

  const renderPaymentMethods = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Payment Method</Text>
      
      <View style={styles.paymentMethods}>
        <TouchableOpacity
          style={[
            styles.paymentMethod,
            paymentMethod === 'card' && styles.paymentMethodActive,
          ]}
          onPress={() => setPaymentMethod('card')}
        >
          <Ionicons 
            name="card" 
            size={24} 
            color={paymentMethod === 'card' ? theme.colors.primary : theme.colors.text.secondary} 
          />
          <Text style={[
            styles.paymentMethodText,
            paymentMethod === 'card' && styles.paymentMethodTextActive,
          ]}>
            Credit/Debit Card
          </Text>
          <Ionicons 
            name={paymentMethod === 'card' ? 'radio-button-on' : 'radio-button-off'} 
            size={20} 
            color={paymentMethod === 'card' ? theme.colors.primary : theme.colors.text.secondary} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentMethod,
            paymentMethod === 'paypal' && styles.paymentMethodActive,
          ]}
          onPress={() => setPaymentMethod('paypal')}
        >
          <Ionicons 
            name="logo-paypal" 
            size={24} 
            color={paymentMethod === 'paypal' ? theme.colors.primary : theme.colors.text.secondary} 
          />
          <Text style={[
            styles.paymentMethodText,
            paymentMethod === 'paypal' && styles.paymentMethodTextActive,
          ]}>
            PayPal
          </Text>
          <Ionicons 
            name={paymentMethod === 'paypal' ? 'radio-button-on' : 'radio-button-off'} 
            size={20} 
            color={paymentMethod === 'paypal' ? theme.colors.primary : theme.colors.text.secondary} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentMethod,
            paymentMethod === 'wallet' && styles.paymentMethodActive,
          ]}
          onPress={() => setPaymentMethod('wallet')}
        >
          <Ionicons 
            name="wallet" 
            size={24} 
            color={paymentMethod === 'wallet' ? theme.colors.primary : theme.colors.text.secondary} 
          />
          <Text style={[
            styles.paymentMethodText,
            paymentMethod === 'wallet' && styles.paymentMethodTextActive,
          ]}>
            Digital Wallet
          </Text>
          <Ionicons 
            name={paymentMethod === 'wallet' ? 'radio-button-on' : 'radio-button-off'} 
            size={20} 
            color={paymentMethod === 'wallet' ? theme.colors.primary : theme.colors.text.secondary} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCardForm = () => {
    if (paymentMethod !== 'card') return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Card Information</Text>
        
        <Input
          label="Card Number"
          value={paymentData.cardNumber}
          onChangeText={(text) => 
            setPaymentData(prev => ({ 
              ...prev, 
              cardNumber: formatCardNumber(text) 
            }))
          }
          placeholder="1234 5678 9012 3456"
          keyboardType="numeric"
          maxLength={19}
          required
        />

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Input
              label="Expiry Date"
              value={paymentData.expiryDate}
              onChangeText={(text) => 
                setPaymentData(prev => ({ 
                  ...prev, 
                  expiryDate: formatExpiryDate(text) 
                }))
              }
              placeholder="MM/YY"
              keyboardType="numeric"
              maxLength={5}
              required
            />
          </View>
          
          <View style={styles.halfInput}>
            <Input
              label="CVV"
              value={paymentData.cvv}
              onChangeText={(text) => 
                setPaymentData(prev => ({ ...prev, cvv: text }))
              }
              placeholder="123"
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
              required
            />
          </View>
        </View>

        <Input
          label="Cardholder Name"
          value={paymentData.cardholderName}
          onChangeText={(text) => 
            setPaymentData(prev => ({ ...prev, cardholderName: text }))
          }
          placeholder="John Doe"
          autoCapitalize="words"
          required
        />

        <Input
          label="Billing Address"
          value={paymentData.billingAddress}
          onChangeText={(text) => 
            setPaymentData(prev => ({ ...prev, billingAddress: text }))
          }
          placeholder="Enter your billing address"
          multiline
          numberOfLines={3}
        />
      </View>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderPaymentSummary()}
        {renderPaymentMethods()}
        {renderCardForm()}

        <View style={styles.securityNote}>
          <Ionicons name="shield-checkmark" size={20} color={theme.colors.success} />
          <Text style={styles.securityText}>
            Your payment information is encrypted and secure
          </Text>
        </View>

        <Button
          title={`Pay $${paymentAmount.toFixed(2)}`}
          onPress={handlePayment}
          style={styles.payButton}
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
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  summaryHeader: {
    marginBottom: theme.spacing.md,
  },
  itemTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  itemSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  summaryDetails: {
    marginBottom: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  summaryLabel: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
  },
  summaryValue: {
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
  paymentMethods: {
    gap: theme.spacing.md,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  paymentMethodActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  paymentMethodText: {
    flex: 1,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.md,
  },
  paymentMethodTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.medium,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success + '20',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  securityText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  },
  payButton: {
    marginBottom: theme.spacing.xl,
  },
});

export default PaymentScreen;
