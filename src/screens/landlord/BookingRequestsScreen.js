import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { BOOKING_STATUS } from '../../constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { bookingAPI } from '../../api/accommodationAPI';

const BookingRequestsScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, cancelled

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getLandlordBookings({
        status: filter === 'all' ? undefined : filter,
      });
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'Failed to load booking requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      if (action === 'accept') {
        await bookingAPI.acceptBooking(bookingId);
        Alert.alert('Success', 'Booking accepted successfully');
      } else if (action === 'reject') {
        await bookingAPI.rejectBooking(bookingId);
        Alert.alert('Success', 'Booking rejected successfully');
      }
      
      // Refresh bookings
      fetchBookings();
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      Alert.alert('Error', `Failed to ${action} booking`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case BOOKING_STATUS.PENDING:
        return theme.colors.warning;
      case BOOKING_STATUS.CONFIRMED:
        return theme.colors.success;
      case BOOKING_STATUS.CANCELLED:
        return theme.colors.error;
      case BOOKING_STATUS.COMPLETED:
        return theme.colors.primary;
      default:
        return theme.colors.textSecondary;
    }
  };

  const renderFilterTabs = () => (
    <View style={styles.filterContainer}>
      {[
        { key: 'all', label: 'All' },
        { key: 'pending', label: 'Pending' },
        { key: 'confirmed', label: 'Confirmed' },
        { key: 'cancelled', label: 'Cancelled' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.filterTab,
            filter === tab.key && styles.activeFilterTab,
          ]}
          onPress={() => setFilter(tab.key)}
        >
          <Text style={[
            styles.filterTabText,
            filter === tab.key && styles.activeFilterTabText,
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderBookingActions = (booking) => {
    if (booking.status === BOOKING_STATUS.PENDING) {
      return (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleBookingAction(booking.id, 'reject')}
          >
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleBookingAction(booking.id, 'accept')}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <TouchableOpacity
        style={styles.viewButton}
        onPress={() => navigation.navigate('BookingDetail', { bookingId: booking.id })}
      >
        <Text style={styles.viewButtonText}>View Details</Text>
      </TouchableOpacity>
    );
  };

  const renderBooking = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.bookingInfo}>
          <Text style={styles.propertyName}>{item.accommodation?.name}</Text>
          <Text style={styles.guestName}>Guest: {item.user?.name}</Text>
          <Text style={styles.guestEmail}>{item.user?.email}</Text>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>
            {new Date(item.checkInDate).toLocaleDateString()} - {new Date(item.checkOutDate).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="people-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>{item.numberOfGuests} guest(s)</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>
            RM {(item.totalAmount && typeof item.totalAmount === 'number') 
              ? item.totalAmount.toFixed(2) 
              : '0.00'}
          </Text>
        </View>
        
        {item.specialRequests && (
          <View style={styles.detailRow}>
            <Ionicons name="chatbubble-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.detailText} numberOfLines={2}>
              {item.specialRequests}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.bookingFooter}>
        <Text style={styles.bookingDate}>
          Booked on {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        
        {renderBookingActions(item)}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={64} color={theme.colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Booking Requests</Text>
      <Text style={styles.emptyDescription}>
        {filter === 'pending' 
          ? 'No pending booking requests at the moment.'
          : 'You haven\'t received any booking requests yet. Make sure your properties are visible and attractive to students.'
        }
      </Text>
    </View>
  );

  if (loading) {
    return <LoadingSpinner />;
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
        <Text style={styles.headerTitle}>Booking Requests</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Filter Tabs */}
      {renderFilterTabs()}

      {/* Bookings List */}
      <FlatList
        data={bookings}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={bookings.length === 0 ? styles.emptyContainer : styles.listContainer}
        showsVerticalScrollIndicator={false}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
  },
  placeholder: {
    width: 40,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeFilterTab: {
    borderBottomColor: theme.colors.primary,
  },
  filterTabText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium,
  },
  activeFilterTabText: {
    color: theme.colors.primary,
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  bookingCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  bookingInfo: {
    flex: 1,
  },
  propertyName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  guestName: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  guestEmail: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semiBold,
    textTransform: 'uppercase',
  },
  bookingDetails: {
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  detailText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  bookingDate: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
  },
  actionButtons: {
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
  viewButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  viewButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
  },
  emptyContainer: {
    flexGrow: 1,
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
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptyDescription: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default BookingRequestsScreen;
