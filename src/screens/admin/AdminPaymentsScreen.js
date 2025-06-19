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
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/common/Card';
import { paymentAPI } from '../../api/paymentAPI';

const AdminPaymentsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalAmount: 0,
    successfulPayments: 0,
    failedPayments: 0,
    pendingPayments: 0
  });

  const filterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Completed', value: 'completed' },
    { label: 'Pending', value: 'pending' },
    { label: 'Failed', value: 'failed' },
    { label: 'Refunded', value: 'refunded' }
  ];

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, selectedFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.getAll();
      const paymentsData = response.data || [];
      setPayments(paymentsData);
      
      // Calculate stats
      const stats = {
        totalPayments: paymentsData.length,
        totalAmount: paymentsData.reduce((sum, payment) => sum + (payment.amount || 0), 0),
        successfulPayments: paymentsData.filter(p => p.status === 'completed').length,
        failedPayments: paymentsData.filter(p => p.status === 'failed').length,
        pendingPayments: paymentsData.filter(p => p.status === 'pending').length
      };
      setStats(stats);
    } catch (error) {
      console.error('Error fetching payments:', error);
      Alert.alert('Error', 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPayments();
    setRefreshing(false);
  };

  const filterPayments = () => {
    let filtered = [...payments];
    
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === selectedFilter);
    }
    
    setFilteredPayments(filtered);
  };

  const handleVerifyPayment = async (payment) => {
    try {
      const response = await paymentAPI.verify(payment.transactionId);
      if (response.success) {
        Alert.alert('Success', 'Payment verified successfully');
        await fetchPayments();
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      Alert.alert('Error', 'Failed to verify payment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return theme.colors.success;
      case 'pending': return theme.colors.warning;
      case 'failed': return theme.colors.error;
      case 'refunded': return theme.colors.info;
      default: return theme.colors.text.secondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'failed': return 'close-circle';
      case 'refunded': return 'return-up-back';
      default: return 'help-circle';
    }
  };

  const renderStatsCard = (title, value, icon, color) => (
    <View style={[styles.statsCard, { borderLeftColor: color }]}>
      <View style={styles.statsContent}>
        <View style={styles.statsInfo}>
          <Text style={styles.statsTitle}>{title}</Text>
          <Text style={styles.statsValue}>{value}</Text>
        </View>
        <Ionicons name={icon} size={24} color={color} />
      </View>
    </View>
  );

  const renderFilterTabs = () => (
    <View style={styles.filterContainer}>
      <FlatList
        data={filterOptions}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedFilter === item.value && styles.activeFilterTab,
            ]}
            onPress={() => setSelectedFilter(item.value)}
          >
            <Text style={[
              styles.filterTabText,
              selectedFilter === item.value && styles.activeFilterTabText,
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.value}
        contentContainerStyle={styles.filterTabs}
      />
    </View>
  );

  const renderPaymentItem = ({ item }) => (
    <Card style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentId}>#{item.transactionId}</Text>
          <Text style={styles.paymentUser}>{item.userName}</Text>
          <Text style={styles.paymentType}>{item.type} payment</Text>
        </View>
        <View style={styles.paymentAmount}>
          <Text style={styles.amountText}>RM {item.amount?.toFixed(2)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Ionicons 
              name={getStatusIcon(item.status)} 
              size={12} 
              color={theme.colors.white} 
            />
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.paymentDetails}>
        <Text style={styles.paymentMethod}>Method: {item.method}</Text>
        <Text style={styles.paymentDate}>
          {new Date(item.createdAt).toLocaleDateString()} at{' '}
          {new Date(item.createdAt).toLocaleTimeString()}
        </Text>
      </View>

      <View style={styles.paymentActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('PaymentDetail', { paymentId: item.id })}
        >
          <Ionicons name="eye-outline" size={16} color={theme.colors.primary} />
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>
        
        {item.status === 'pending' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.verifyButton]}
            onPress={() => handleVerifyPayment(item)}
          >
            <Ionicons name="checkmark-outline" size={16} color={theme.colors.success} />
            <Text style={[styles.actionButtonText, { color: theme.colors.success }]}>Verify</Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payment Management</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <Ionicons name="refresh" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        {renderStatsCard('Total', stats.totalPayments, 'card', theme.colors.primary)}
        {renderStatsCard('Amount', `RM ${stats.totalAmount.toFixed(2)}`, 'cash', theme.colors.success)}
        {renderStatsCard('Success', stats.successfulPayments, 'checkmark-circle', theme.colors.success)}
        {renderStatsCard('Failed', stats.failedPayments, 'close-circle', theme.colors.error)}
      </View>

      {/* Filter Tabs */}
      {renderFilterTabs()}

      {/* Payments List */}
      <FlatList
        data={filteredPayments}
        renderItem={renderPaymentItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={64} color={theme.colors.text.secondary} />
            <Text style={styles.emptyText}>No payments found</Text>
            <Text style={styles.emptySubtext}>Payments will appear here once processed</Text>
          </View>
        }
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
    padding: 20,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  refreshButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    backgroundColor: theme.colors.white,
  },
  statsCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 15,
    margin: 5,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsInfo: {
    flex: 1,
  },
  statsTitle: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  filterContainer: {
    backgroundColor: theme.colors.white,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterTabs: {
    paddingHorizontal: 15,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activeFilterTab: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterTabText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  activeFilterTabText: {
    color: theme.colors.white,
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
  },
  paymentCard: {
    marginBottom: 15,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentId: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  paymentUser: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 2,
  },
  paymentType: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textTransform: 'capitalize',
  },
  paymentAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    color: theme.colors.white,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  paymentDetails: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 10,
    marginBottom: 10,
  },
  paymentMethod: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  paymentDate: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  paymentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    gap: 4,
  },
  verifyButton: {
    borderColor: theme.colors.success,
  },
  actionButtonText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginTop: 20,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default AdminPaymentsScreen;
