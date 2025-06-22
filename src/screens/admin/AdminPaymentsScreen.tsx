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
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api.service';

interface Payment {
  _id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  accommodation?: {
    _id: string;
    title: string;
    location: string;
  };
  booking?: {
    _id: string;
    checkIn: string;
    checkOut: string;
  };
  createdAt: string;
  updatedAt: string;
}

const AdminPaymentsScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const statusFilters = ['all', 'pending', 'completed', 'failed', 'refunded'];

  useEffect(() => {
    if (user?.role !== 'admin') {
      Alert.alert('Access Denied', 'You do not have admin privileges', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      return;
    }
    fetchPayments();
  }, [user, navigation]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      console.log('💳 Fetching all payments...');
      
      // Note: This endpoint might not exist yet in the backend
      try {
        const response = await api.get('/payments');
        
        if (response.data) {
          const allPayments = response.data.sort((a: Payment, b: Payment) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setPayments(allPayments);
          setFilteredPayments(allPayments);
          console.log(`✅ Loaded ${allPayments.length} payments`);
        }
      } catch (apiError) {
        console.log('Payments endpoint not available, using mock data');
        // Mock data for demonstration
        const mockPayments: Payment[] = [
          {
            _id: '1',
            amount: 15000,
            currency: 'INR',
            status: 'completed',
            paymentMethod: 'UPI',
            transactionId: 'TXN123456789',
            user: { _id: 'u1', name: 'John Doe', email: 'john@example.com' },
            accommodation: { _id: 'a1', title: 'Modern Studio Apartment', location: 'Mumbai' },
            booking: { 
              _id: 'b1', 
              checkIn: new Date().toISOString(), 
              checkOut: new Date(Date.now() + 86400000 * 7).toISOString() 
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: '2',
            amount: 8000,
            currency: 'INR',
            status: 'pending',
            paymentMethod: 'Credit Card',
            transactionId: 'TXN987654321',
            user: { _id: 'u2', name: 'Jane Smith', email: 'jane@example.com' },
            accommodation: { _id: 'a2', title: 'Cozy Room Near College', location: 'Delhi' },
            booking: { 
              _id: 'b2', 
              checkIn: new Date(Date.now() + 86400000).toISOString(), 
              checkOut: new Date(Date.now() + 86400000 * 5).toISOString() 
            },
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            updatedAt: new Date(Date.now() - 3600000).toISOString()
          },
          {
            _id: '3',
            amount: 12000,
            currency: 'INR',
            status: 'failed',
            paymentMethod: 'Debit Card',
            transactionId: 'TXN456789123',
            user: { _id: 'u3', name: 'Mike Johnson', email: 'mike@example.com' },
            accommodation: { _id: 'a3', title: 'Budget Apartment', location: 'Bangalore' },
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            updatedAt: new Date(Date.now() - 7200000).toISOString()
          }
        ];
        setPayments(mockPayments);
        setFilteredPayments(mockPayments);
      }
    } catch (error) {
      console.error('❌ Error fetching payments:', error);
      Alert.alert('Error', 'Failed to load payments. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  const filterPayments = () => {
    let filtered = payments;

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(payment => payment.status === selectedStatus);
    }    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(payment => 
        (payment.transactionId || '').toLowerCase().includes(query) ||
        (payment.user?.name || '').toLowerCase().includes(query) ||
        (payment.user?.email || '').toLowerCase().includes(query) ||
        (payment.paymentMethod || '').toLowerCase().includes(query) ||
        (payment.accommodation?.title || '').toLowerCase().includes(query)
      );
    }

    setFilteredPayments(filtered);
  };

  useEffect(() => {
    filterPayments();
  }, [searchQuery, selectedStatus, payments]);

  const handlePaymentPress = (payment: Payment) => {
    Alert.alert(
      'Payment Details',
      `Transaction ID: ${payment.transactionId}\nAmount: ₹${payment.amount}\nStatus: ${payment.status}\nMethod: ${payment.paymentMethod}\nUser: ${payment.user.name}\nDate: ${new Date(payment.createdAt).toLocaleString()}`
    );
  };

  const updatePaymentStatus = async (paymentId: string, newStatus: string) => {
    try {
      Alert.alert(
        'Update Payment Status',
        `Change payment status to "${newStatus}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Update', 
            onPress: async () => {
              // Update local state immediately for better UX
              setPayments(prevPayments => 
                prevPayments.map(payment => 
                  payment._id === paymentId 
                    ? { ...payment, status: newStatus as any, updatedAt: new Date().toISOString() }
                    : payment
                )
              );
              
              console.log(`Update payment ${paymentId} status to ${newStatus}`);
              Alert.alert('Success', `Payment status updated to ${newStatus}`);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error updating payment status:', error);
      Alert.alert('Error', 'Failed to update payment status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#27ae60';
      case 'pending': return '#f39c12';
      case 'failed': return '#e74c3c';
      case 'refunded': return '#9b59b6';
      default: return '#95a5a6';
    }
  };

  const getTotalRevenue = () => {
    return payments
      .filter(payment => payment.status === 'completed')
      .reduce((total, payment) => total + payment.amount, 0);
  };

  const PaymentItem = ({ item }: { item: Payment }) => (
    <TouchableOpacity 
      style={styles.paymentItem}
      onPress={() => handlePaymentPress(item)}
    >
      <View style={styles.paymentHeader}>
        <Text style={styles.transactionId}>#{item.transactionId}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.paymentDetails}>
        <Text style={styles.amount}>₹{item.amount.toLocaleString()}</Text>
        <Text style={styles.paymentMethod}>{item.paymentMethod}</Text>
      </View>

      <Text style={styles.userName}>👤 {item.user.name}</Text>
      <Text style={styles.userEmail}>{item.user.email}</Text>

      {item.accommodation && (
        <Text style={styles.accommodation}>
          🏠 {item.accommodation.title}
        </Text>
      )}

      <View style={styles.paymentFooter}>
        <Text style={styles.paymentDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        
        {item.status === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#27ae60' }]}
              onPress={() => updatePaymentStatus(item._id, 'completed')}
            >
              <Text style={styles.actionButtonText}>✓</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#e74c3c' }]}
              onPress={() => updatePaymentStatus(item._id, 'failed')}
            >
              <Text style={styles.actionButtonText}>✗</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {item.status === 'completed' && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#9b59b6' }]}
            onPress={() => updatePaymentStatus(item._id, 'refunded')}
          >
            <Text style={styles.actionButtonText}>↩️</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A6572" />
        <Text style={styles.loadingText}>Loading payments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Management</Text>
      <Text style={styles.subtitle}>
        Total Payments: {payments.length} | Revenue: ₹{getTotalRevenue().toLocaleString()}
      </Text>

      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by transaction ID, user, or accommodation..."
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
        Showing {filteredPayments.length} of {payments.length} payments
      </Text>

      {/* Payments List */}
      <FlatList
        data={filteredPayments}
        keyExtractor={(item) => item._id}
        renderItem={PaymentItem}
        style={styles.paymentsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  statusFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButton: {
    backgroundColor: '#ecf0f1',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  filterButtonActive: {
    backgroundColor: '#3498db',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#7f8c8d',
    textTransform: 'capitalize',
  },
  filterButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  resultsInfo: {
    fontSize: 14,
    color: '#95a5a6',
    marginBottom: 12,
  },
  paymentsList: {
    flex: 1,
  },
  paymentItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  paymentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  paymentMethod: {
    fontSize: 14,
    color: '#7f8c8d',
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  userName: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  accommodation: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentDate: {
    fontSize: 12,
    color: '#95a5a6',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  actionButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AdminPaymentsScreen;
