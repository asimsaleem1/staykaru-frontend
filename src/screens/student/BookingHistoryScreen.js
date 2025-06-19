import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { theme } from '../../styles/theme';
import { bookingAPI } from '../../api/accommodationAPI';
import { CancellationService } from '../../services/cancellation.service';
import { BOOKING_STATUS } from '../../constants';

const BookingCard = ({ booking, onPress, onCancel }) => {
  const [cancellationRequest, setCancellationRequest] = useState(null);
  
  useEffect(() => {
    // Check if there's a local cancellation request for this booking
    const checkCancellationRequest = async () => {
      try {
        const request = await CancellationService.getCancellationRequestForBooking(booking._id);
        setCancellationRequest(request);
      } catch (error) {
        console.log('Error checking cancellation request:', error);
      }
    };
    
    checkCancellationRequest();
  }, [booking._id]);

  const getStatusColor = (status) => {
    switch (status) {
      case BOOKING_STATUS.CONFIRMED:
        return theme.colors.success;
      case BOOKING_STATUS.PENDING:
        return theme.colors.warning;
      case BOOKING_STATUS.CANCELLED:
        return theme.colors.error;
      case BOOKING_STATUS.COMPLETED:
        return theme.colors.info;
      default:
        return theme.colors.text.secondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case BOOKING_STATUS.CONFIRMED:
        return 'checkmark-circle';
      case BOOKING_STATUS.PENDING:
        return 'time';
      case BOOKING_STATUS.CANCELLED:
        return 'close-circle';
      case BOOKING_STATUS.COMPLETED:
        return 'checkmark-done-circle';
      default:
        return 'help-circle';
    }
  };

  const canCancel = booking.status === BOOKING_STATUS.PENDING || 
                   booking.status === BOOKING_STATUS.CONFIRMED;

  return (
    <Card style={styles.bookingCard} onPress={onPress}>
      <View style={styles.bookingHeader}>
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyTitle} numberOfLines={1}>
            {booking.accommodation?.title || 'Property'}
          </Text>
          <Text style={styles.propertyLocation} numberOfLines={1}>
            {booking.accommodation?.location || 'Location'}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
          <Ionicons 
            name={getStatusIcon(booking.status)} 
            size={12} 
            color={theme.colors.white} 
            style={styles.statusIcon}
          />
          <Text style={styles.statusText}>{booking.status}</Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.detailText}>
            {new Date(booking.start_date || booking.checkInDate).toLocaleDateString()} - {new Date(booking.end_date || booking.checkOutDate).toLocaleDateString()}
          </Text>
        </View>
          <View style={styles.detailRow}>
          <Ionicons name="people" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.detailText}>
            {booking.guests || booking.guest_count || 1} Guest{(booking.guests !== 1 && booking.guest_count !== 1) ? 's' : ''}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="cash" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.detailText}>${booking.totalCost || booking.total_cost || booking.price || 'N/A'}</Text>
        </View>
      </View>      <View style={styles.bookingFooter}>
        <Text style={styles.bookingDate}>
          Booked on {new Date(booking.createdAt).toLocaleDateString()}
        </Text>
        
        {cancellationRequest && (
          <View style={styles.cancellationRequestBadge}>
            <Ionicons name="time-outline" size={12} color={theme.colors.warning} />
            <Text style={styles.cancellationRequestText}>
              Cancellation Requested
            </Text>
          </View>
        )}
        
        {canCancel && !cancellationRequest && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => onCancel(booking)}
          >
            <Text style={styles.cancelButtonText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
        
        {cancellationRequest && (
          <TouchableOpacity
            style={[styles.cancelButton, styles.disabledButton]}
            onPress={() => {
              Alert.alert(
                'Cancellation Request Status',
                CancellationService.getStatusMessage(cancellationRequest),
                [{ text: 'OK' }]
              );
            }}
          >
            <Text style={[styles.cancelButtonText, styles.disabledButtonText]}>
              View Request Status
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
};

const BookingHistoryScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);  const fetchBookings = async () => {
    try {
      console.log('Fetching booking history from database...');
      const response = await bookingAPI.getMyBookings();
      console.log('Booking history API response:', response);
      
      // Handle different response structures
      let bookingsData = [];
      if (response && response.data) {
        bookingsData = Array.isArray(response.data) ? response.data : response.data.bookings || [];
      } else if (Array.isArray(response)) {
        bookingsData = response;
      } else if (response && response.bookings) {
        bookingsData = response.bookings;
      }
      
      console.log('Bookings loaded:', bookingsData.length);
      if (bookingsData.length > 0) {
        console.log('First booking:', bookingsData[0]);
      }
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'Failed to load booking history');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  }, []);  const handleCancelBooking = (booking) => {
    Alert.alert(
      'Cancel Booking',
      `Do you want to cancel your booking at ${booking.accommodation?.title}?\n\nNote: Depending on the property's policy, this may require landlord approval.`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel Booking',
          style: 'destructive',
          onPress: () => cancelBooking(booking._id),
        },
      ]
    );
  };  const cancelBooking = async (bookingId) => {
    try {
      console.log('Attempting to cancel booking:', bookingId);
      const response = await bookingAPI.cancelBooking(bookingId);
      console.log('Cancel booking response:', response);
      
      // Handle the new structured response format
      if (response && response.success) {
        if (response.type === 'request') {
          Alert.alert(
            'Cancellation Request Submitted', 
            response.message || 'Your cancellation request has been sent to the landlord. You will be notified once it is processed.',
            [{ text: 'OK', onPress: () => fetchBookings() }]
          );
        } else if (response.type === 'local' && response.requiresContact) {
          Alert.alert(
            'Cancellation Request Saved',
            response.userMessage || response.message,
            [
              { 
                text: 'Contact Support', 
                onPress: () => {
                  Alert.alert(
                    'Contact Information',
                    'Email: support@stekaru.com\nPhone: +1-800-STEKARU\n\nAlternatively, you can contact the property owner directly.',
                    [
                      { text: 'Send Email', onPress: () => Linking.openURL('mailto:support@stekaru.com?subject=Booking Cancellation Request&body=I would like to cancel my booking ID: ' + bookingId) },
                      { text: 'OK', style: 'cancel' }
                    ]
                  );
                }
              },
              { text: 'OK', style: 'cancel' }
            ]
          );
        } else {
          Alert.alert(
            'Success', 
            response.message || 'Booking cancelled successfully',
            [{ text: 'OK', onPress: () => fetchBookings() }]
          );
        }
      } else {
        // Handle legacy response format
        Alert.alert(
          'Success', 
          'Booking cancellation processed successfully',
          [{ text: 'OK', onPress: () => fetchBookings() }]
        );
      }
      
      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error('Cancel booking error:', error);
      
      // Handle structured error responses
      if (error.error === 'CANCELLATION_FAILED') {
        Alert.alert(
          'Cancellation Failed', 
          error.message || 'Unable to process cancellation at this time',
          [
            { 
              text: 'Contact Support', 
              onPress: () => {
                Alert.alert(
                  'Contact Information',
                  'Email: support@stekaru.com\nPhone: +1-800-STEKARU',
                  [
                    { text: 'Send Email', onPress: () => Linking.openURL('mailto:support@stekaru.com?subject=Booking Cancellation Issue&body=I am having trouble cancelling my booking ID: ' + bookingId) },
                    { text: 'OK', style: 'cancel' }
                  ]
                );
              }
            },
            { text: 'Try Again Later', style: 'cancel' }
          ]
        );
      } else if (error.statusCode === 400 && error.message?.includes('landlord')) {
        Alert.alert(
          'Cancellation Restricted', 
          'This booking can only be cancelled by the landlord. We recommend contacting them directly or our support team for assistance.',
          [
            { 
              text: 'Contact Support', 
              onPress: () => {
                Alert.alert(
                  'Contact Information',
                  'Email: support@stekaru.com\nPhone: +1-800-STEKARU',
                  [
                    { text: 'Send Email', onPress: () => Linking.openURL('mailto:support@stekaru.com?subject=Booking Cancellation Help&body=I need help cancelling my booking ID: ' + bookingId) },
                    { text: 'OK', style: 'cancel' }
                  ]
                );
              }
            },
            { text: 'OK', style: 'cancel' }
          ]
        );
      } else {
        // Handle generic errors
        const errorMessage = error?.userMessage || error?.message || error?.error || 'Failed to cancel booking';
        Alert.alert('Error', errorMessage, [
          { 
            text: 'Contact Support', 
            onPress: () => {
              Alert.alert(
                'Contact Information',
                'Email: support@stekaru.com\nPhone: +1-800-STEKARU',
                [
                  { text: 'Send Email', onPress: () => Linking.openURL('mailto:support@stekaru.com?subject=Booking Issue&body=I need help with my booking ID: ' + bookingId) },
                  { text: 'OK', style: 'cancel' }
                ]
              );
            }
          },
          { text: 'Try Again Later', style: 'cancel' }
        ]);
      }
    }
  };const handleBookingPress = (booking) => {
    navigation.navigate('BookingDetail', { bookingId: booking._id });
  };

  const getFilteredBookings = () => {
    if (filter === 'all') return bookings;
    return bookings.filter(booking => 
      filter === 'active' 
        ? [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.PENDING].includes(booking.status)
        : booking.status === BOOKING_STATUS.COMPLETED
    );
  };

  const renderBookingItem = ({ item }) => (
    <BookingCard
      booking={item}
      onPress={() => handleBookingPress(item)}
      onCancel={handleCancelBooking}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={64} color={theme.colors.text.secondary} />
      <Text style={styles.emptyTitle}>No Bookings Found</Text>
      <Text style={styles.emptyText}>
        {filter === 'all' 
          ? "You haven't made any bookings yet"
          : `No ${filter} bookings found`
        }
      </Text>
      <Button
        title="Browse Accommodations"
        onPress={() => navigation.navigate('Accommodations')}
        style={styles.browseButton}
      />
    </View>
  );

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      {[
        { key: 'all', label: 'All' },
        { key: 'active', label: 'Active' },
        { key: 'completed', label: 'Past' },
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

  if (loading) {
    return <LoadingSpinner />;
  }

  const filteredBookings = getFilteredBookings();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
        {renderFilterButtons()}
      </View>

      <FlatList
        data={filteredBookings}
        renderItem={renderBookingItem}
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
  bookingCard: {
    marginBottom: theme.spacing.md,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  propertyInfo: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  propertyTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  propertyLocation: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  statusIcon: {
    marginRight: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.white,
    fontWeight: theme.typography.weights.medium,
    textTransform: 'uppercase',
  },
  bookingDetails: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  detailText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
  },
  bookingDate: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
  },  cancelButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  cancelButtonText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.error,
    fontWeight: theme.typography.weights.medium,
  },
  disabledButton: {
    opacity: 0.7,
  },
  disabledButtonText: {
    color: theme.colors.text.secondary,
  },
  cancellationRequestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.warning + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  cancellationRequestText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.warning,
    fontWeight: theme.typography.weights.medium,
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

export default BookingHistoryScreen;
