import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { BOOKING_STATUS } from '../../constants';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { bookingAPI } from '../../api/accommodationAPI';

const BookingDetailScreen = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchBookingDetail();
  }, [bookingId]);

  const fetchBookingDetail = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getBookingById(bookingId);
      setBooking(response.data);
    } catch (error) {
      console.error('Error fetching booking detail:', error);
      Alert.alert('Error', 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive', onPress: confirmCancelBooking },
      ]
    );
  };

  const confirmCancelBooking = async () => {
    try {
      setCancelling(true);
      await bookingAPI.cancelBooking(bookingId);
      Alert.alert('Success', 'Booking cancelled successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      Alert.alert('Error', 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case BOOKING_STATUS.CONFIRMED:
        return theme.colors.success;
      case BOOKING_STATUS.PENDING:
        return theme.colors.warning;
      case BOOKING_STATUS.CANCELLED:
        return theme.colors.error;
      case BOOKING_STATUS.COMPLETED:
        return theme.colors.primary;
      default:
        return theme.colors.textSecondary;
    }
  };

  const canCancelBooking = () => {
    return booking?.status === BOOKING_STATUS.PENDING || booking?.status === BOOKING_STATUS.CONFIRMED;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Booking not found</Text>
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
          <Text style={styles.headerTitle}>Booking Details</Text>
        </View>

        {/* Booking Status */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
            <Text style={styles.statusText}>{booking.status}</Text>
          </View>
          <Text style={styles.bookingId}>Booking ID: {booking.id}</Text>
        </View>

        {/* Accommodation Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accommodation</Text>
          <View style={styles.accommodationCard}>
            <Image
              source={{ uri: booking.accommodation?.images?.[0] || 'https://via.placeholder.com/150' }}
              style={styles.accommodationImage}
            />
            <View style={styles.accommodationInfo}>
              <Text style={styles.accommodationName}>{booking.accommodation?.name}</Text>
              <Text style={styles.accommodationLocation}>
                <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
                {booking.accommodation?.location}
              </Text>
              <Text style={styles.accommodationType}>{booking.accommodation?.type}</Text>
            </View>
          </View>
        </View>

        {/* Booking Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Period</Text>
          <View style={styles.dateContainer}>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Check-in</Text>
              <Text style={styles.dateValue}>
                {new Date(booking.checkInDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Check-out</Text>
              <Text style={styles.dateValue}>
                {new Date(booking.checkOutDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>
          <Text style={styles.duration}>
            Duration: {Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24))} nights
          </Text>
        </View>

        {/* Guests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guests</Text>
          <Text style={styles.guestCount}>{booking.numberOfGuests} Guest(s)</Text>
        </View>

        {/* Emergency Contact */}
        {booking.emergencyContact && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Contact</Text>
            <Text style={styles.contactName}>{booking.emergencyContact.name}</Text>
            <Text style={styles.contactPhone}>{booking.emergencyContact.phone}</Text>
          </View>
        )}

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Total Amount</Text>
            <Text style={styles.paymentAmount}>RM {booking.totalAmount?.toFixed(2)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Payment Status</Text>
            <Text style={[styles.paymentStatus, { color: booking.paymentStatus === 'paid' ? theme.colors.success : theme.colors.warning }]}>
              {booking.paymentStatus}
            </Text>
          </View>
          {booking.paymentMethod && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Payment Method</Text>
              <Text style={styles.paymentMethod}>{booking.paymentMethod}</Text>
            </View>
          )}
        </View>

        {/* Special Requests */}
        {booking.specialRequests && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Requests</Text>
            <Text style={styles.specialRequests}>{booking.specialRequests}</Text>
          </View>
        )}

        {/* Booking Created */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Created</Text>
          <Text style={styles.createdDate}>
            {new Date(booking.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {canCancelBooking() && (
            <Button
              title={cancelling ? "Cancelling..." : "Cancel Booking"}
              onPress={handleCancelBooking}
              variant="outline"
              disabled={cancelling}
              style={styles.cancelButton}
            />
          )}
          
          <Button
            title="Contact Landlord"
            onPress={() => {
              // Navigate to chat or contact screen
              Alert.alert('Feature Coming Soon', 'Direct messaging with landlords will be available soon!');
            }}
            style={styles.contactButton}
          />

          {booking.status === BOOKING_STATUS.COMPLETED && (
            <Button
              title="Leave Review"
              onPress={() => navigation.navigate('ReviewForm', { 
                type: 'accommodation',
                targetId: booking.accommodation.id,
                bookingId: booking.id
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
  bookingId: {
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
  accommodationCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  accommodationImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.sm,
  },
  accommodationInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  accommodationName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
  },
  accommodationLocation: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginVertical: theme.spacing.xs,
  },
  accommodationType: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.medium,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  dateItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginHorizontal: theme.spacing.xs,
  },
  dateLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  dateValue: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
    textAlign: 'center',
  },
  duration: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  guestCount: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
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
  paymentAmount: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  paymentStatus: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semiBold,
    textTransform: 'capitalize',
  },
  paymentMethod: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
    textTransform: 'capitalize',
  },
  specialRequests: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },
  createdDate: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  actionButtons: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  cancelButton: {
    borderColor: theme.colors.error,
    borderWidth: 1,
  },
  contactButton: {
    backgroundColor: theme.colors.primary,
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

export default BookingDetailScreen;
