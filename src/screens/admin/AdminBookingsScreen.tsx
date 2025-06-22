import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api, { adminAPI } from '../../services/api.service';

interface Booking {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  student?: {
    _id: string;
    name: string;
    email: string;
  };
  accommodation: {
    _id: string;
    title: string;
    location: string;
    rent: number;
  };
  landlord?: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  checkInDate?: string;
  checkOutDate?: string;
  start_date?: string;
  end_date?: string;
  totalAmount?: number;
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  updatedAt: string;
  created_at?: string; // Alternative field name for backend compatibility
}

const AdminBookingsScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
    const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const statusFilters = ['all', 'pending', 'confirmed', 'cancelled', 'completed'];

  useEffect(() => {
    if (user?.role !== 'admin') {
      Alert.alert('Access Denied', 'You do not have admin privileges', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      return;
    }
    fetchBookings();
  }, [user, navigation]);
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📋 Fetching all bookings...');
      
      const bookingsData = await adminAPI.getAllBookings();
      
      if (bookingsData) {
        // Handle both array response and object with data property
        const bookingsArray = Array.isArray(bookingsData) ? bookingsData : bookingsData.data || bookingsData.bookings || [];
        
        const allBookings = bookingsArray.sort((a: Booking, b: Booking) => 
          new Date(b.createdAt || b.created_at || Date.now()).getTime() - 
          new Date(a.createdAt || a.created_at || Date.now()).getTime()
        );
        
        setBookings(allBookings);
        setFilteredBookings(allBookings);
        console.log(`✅ Loaded ${allBookings.length} bookings from database`);
        
        // Show success message if no bookings found
        if (allBookings.length === 0) {
          console.log('ℹ️ No bookings found in the database');
        }
      } else {
        console.log('⚠️ No booking data received from API');
        setBookings([]);
        setFilteredBookings([]);
      }    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
      setError('Failed to load bookings. Please check your connection and try again.');
      setBookings([]);
      setFilteredBookings([]);
      
      // Show user-friendly error message
      if (error instanceof Error && error.message.includes('Network Error')) {
        Alert.alert('Network Error', 'Please check your internet connection and try again.');
      } else if (error instanceof Error && error.message.includes('401')) {
        Alert.alert('Authentication Error', 'Your session has expired. Please log in again.');
      } else {
        Alert.alert('Error', 'Failed to load bookings. Please try again later.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const filterBookings = () => {
    let filtered = bookings;

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(booking => booking.status === selectedStatus);
    }    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking => 
        (booking.student?.name || booking.user?.name || '').toLowerCase().includes(query) ||
        (booking.accommodation?.title || '').toLowerCase().includes(query) ||
        (booking.accommodation?.location || '').toLowerCase().includes(query) ||
        (booking.landlord?.name || '').toLowerCase().includes(query)
      );
    }

    setFilteredBookings(filtered);
  };

  useEffect(() => {
    filterBookings();
  }, [searchQuery, selectedStatus, bookings]);

  const handleBookingPress = (booking: Booking) => {
    setSelectedBooking(booking);
    setModalVisible(true);
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#10b981';
      case 'cancelled': return '#ef4444';
      case 'completed': return '#6366f1';
      default: return '#64748b';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'refunded': return '#ef4444';
      default: return '#64748b';
    }
  };

  const BookingItem = ({ item }: { item: Booking }) => (
    <TouchableOpacity 
      style={styles.bookingItem}
      onPress={() => handleBookingPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.bookingHeader}>
        <Text style={styles.bookingTitle} numberOfLines={1}>
          {item.accommodation?.title || 'Unknown Accommodation'}
        </Text>
        <View style={[styles.statusBadge, { 
          backgroundColor: getStatusColor(item.status)
        }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>      <View style={styles.bookingInfo}>
        <Text style={styles.studentName}>
          👤 {(item.student?.name || item.user?.name) || 'Unknown Student'}
        </Text>
        <Text style={styles.location}>📍 {item.accommodation?.location || 'Unknown Location'}</Text>
        <Text style={styles.landlord}>🏠 {item.landlord?.name || 'Unknown Landlord'}</Text>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>Check-in:</Text>
          <Text style={styles.dateValue}>
            {new Date(item.checkInDate || item.start_date || Date.now()).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>Check-out:</Text>
          <Text style={styles.dateValue}>
            {new Date(item.checkOutDate || item.end_date || Date.now()).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.bookingFooter}>
        <Text style={styles.amount}>PKR {item.totalAmount?.toLocaleString() || 'N/A'}</Text>
        <View style={[styles.paymentBadge, { 
          backgroundColor: getPaymentStatusColor(item.paymentStatus || 'pending')
        }]}>
          <Text style={styles.paymentText}>{item.paymentStatus || 'pending'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading bookings...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Unable to Load Bookings</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            fetchBookings();
          }}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Empty state
  if (!loading && bookings.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyTitle}>No Bookings Found</Text>
        <Text style={styles.emptyMessage}>
          There are currently no bookings in the system.
        </Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Booking Management</Text>
      <Text style={styles.subtitle}>Total Bookings: {bookings.length}</Text>

      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by student, accommodation, or landlord..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Status Filter */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by Status:</Text>
        <View style={styles.statusFilters}>
          {statusFilters.map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                selectedStatus === status && styles.filterButtonActive
              ]}
              onPress={() => setSelectedStatus(status)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedStatus === status && styles.filterButtonTextActive
              ]}>
                {status === 'all' ? 'All' : status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Results Info */}
      <Text style={styles.resultsInfo}>
        Showing {filteredBookings.length} of {bookings.length} bookings
      </Text>      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item._id}
        renderItem={BookingItem}
        style={styles.bookingsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsIcon}>🔍</Text>
            <Text style={styles.noResultsTitle}>No Bookings Found</Text>
            <Text style={styles.noResultsMessage}>
              {searchQuery ? 
                `No bookings match "${searchQuery}"` : 
                `No ${selectedStatus === 'all' ? '' : selectedStatus} bookings found`
              }
            </Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* Booking Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Booking Details</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {selectedBooking && (
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Booking Information */}
              <View style={styles.modalDetails}>
                <Text style={styles.modalLabel}>Accommodation</Text>
                <Text style={styles.modalText}>{selectedBooking.accommodation?.title}</Text>

                <Text style={styles.modalLabel}>Location</Text>
                <Text style={styles.modalText}>{selectedBooking.accommodation?.location}</Text>                <Text style={styles.modalLabel}>Student</Text>
                <Text style={styles.modalText}>
                  {(selectedBooking.student?.name || selectedBooking.user?.name)} ({(selectedBooking.student?.email || selectedBooking.user?.email)})
                </Text>

                <Text style={styles.modalLabel}>Landlord</Text>
                <Text style={styles.modalText}>
                  {selectedBooking.landlord?.name || 'Not Available'} {selectedBooking.landlord?.email ? `(${selectedBooking.landlord.email})` : ''}
                </Text>

                <Text style={styles.modalLabel}>Check-in Date</Text>
                <Text style={styles.modalText}>
                  {new Date(selectedBooking.checkInDate || selectedBooking.start_date || Date.now()).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>

                <Text style={styles.modalLabel}>Check-out Date</Text>
                <Text style={styles.modalText}>
                  {new Date(selectedBooking.checkOutDate || selectedBooking.end_date || Date.now()).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>

                <Text style={styles.modalLabel}>Total Amount</Text>
                <Text style={styles.modalText}>PKR {selectedBooking.totalAmount?.toLocaleString() || 'Not specified'}</Text>

                <Text style={styles.modalLabel}>Current Status</Text>
                <View style={[styles.statusBadge, { 
                  backgroundColor: getStatusColor(selectedBooking.status),
                  alignSelf: 'flex-start',
                  marginTop: 8
                }]}>
                  <Text style={styles.statusText}>{selectedBooking.status}</Text>
                </View>                <Text style={styles.modalLabel}>Payment Status</Text>
                <View style={[styles.paymentBadge, { 
                  backgroundColor: getPaymentStatusColor(selectedBooking.paymentStatus || 'pending'),
                  alignSelf: 'flex-start',
                  marginTop: 8
                }]}>
                  <Text style={styles.paymentText}>{selectedBooking.paymentStatus || 'pending'}</Text>
                </View>

                <Text style={styles.modalLabel}>Created</Text>
                <Text style={styles.modalText}>
                  {new Date(selectedBooking.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>              {/* Admin View - Information Only */}
              <View style={styles.modalInfo}>
                <Text style={styles.infoTitle}>📋 Admin View</Text>
                <Text style={styles.infoText}>
                  This booking information is displayed for administrative oversight only. 
                  Booking status changes are managed by accommodation owners and the system automatically.
                </Text>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ef4444',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noResultsIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  noResultsMessage: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
    fontWeight: '500',
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  statusFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#64748b',
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  resultsInfo: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    fontWeight: '500',
  },
  bookingsList: {
    flex: 1,
  },
  bookingItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  bookingInfo: {
    marginBottom: 12,
  },
  studentName: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
    fontWeight: '500',
  },
  location: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
    fontWeight: '500',
  },
  landlord: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  bookingDetails: {
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '700',
  },
  paymentBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  paymentText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  closeButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalDetails: {
    marginBottom: 30,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 22,
  },  modalInfo: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3b82f6',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});

export default AdminBookingsScreen;
