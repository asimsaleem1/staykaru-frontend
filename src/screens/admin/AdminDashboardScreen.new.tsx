import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../context/AuthContext.js';
import { useNavigation } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';
import api from '../../services/api.service';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface Accommodation {
  _id: string;
  title: string;
  description: string;
  price: number;
  type: string;
  city: { name: string } | string;
  landlord: { name: string };
  amenities?: string[];
  isActive: boolean;
  isApproved: boolean;
  createdAt: string;
}

interface DashboardStats {
  totalUsers: number;
  totalAccommodations: number;
  usersByRole: {
    student: number;
    landlord: number;
    food_provider: number;
    admin: number;
    other: number;
  };
  estimatedBookings: number;
  estimatedOrders: number;
  estimatedRevenue: number;
  recentUsers: User[];
  allUsers: User[];
  accommodations: Accommodation[];
}

const AdminDashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAccommodations: 0,
    usersByRole: {
      student: 0,
      landlord: 0,
      food_provider: 0,
      admin: 0,
      other: 0
    },
    estimatedBookings: 0,
    estimatedOrders: 0,
    estimatedRevenue: 0,
    recentUsers: [],
    allUsers: [],
    accommodations: []
  });
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAccommodationModal, setShowAccommodationModal] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') {
      Alert.alert('Access Denied', 'You do not have admin privileges', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      return;
    }
  }, [user, navigation]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching admin dashboard data from backend...');
      
      const [usersResponse, accommodationsResponse] = await Promise.all([
        api.get('/users'),
        api.get('/accommodations')
      ]);

      const allUsers: User[] = usersResponse.data || [];
      const allAccommodations: Accommodation[] = accommodationsResponse.data || [];

      // Calculate user role distribution
      const usersByRole = {
        student: 0,
        landlord: 0,
        food_provider: 0,
        admin: 0,
        other: 0
      };

      allUsers.forEach(user => {
        const role = user.role?.toLowerCase();
        if (role === 'student') {
          usersByRole.student++;
        } else if (role === 'landlord') {
          usersByRole.landlord++;
        } else if (role === 'food_provider') {
          usersByRole.food_provider++;
        } else if (role === 'admin') {
          usersByRole.admin++;
        } else {
          usersByRole.other++;
        }
      });

      const estimatedBookings = allAccommodations.length * 2;
      const estimatedOrders = Math.max(usersByRole.food_provider * 5, 3);
      const estimatedRevenue = allAccommodations.reduce((total, acc) => total + (acc.price || 0), 0) * 2;

      const stats: DashboardStats = {
        totalUsers: allUsers.length,
        totalAccommodations: allAccommodations.length,
        usersByRole,
        estimatedBookings,
        estimatedOrders,
        estimatedRevenue,
        recentUsers: allUsers.slice(-5),
        allUsers,
        accommodations: allAccommodations
      };

      setDashboardStats(stats);
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      Alert.alert(
        'Error Loading Data', 
        'Failed to fetch dashboard data. Please check your connection and try again.',
        [
          { text: 'Retry', onPress: () => fetchDashboardData() },
          { text: 'OK' }
        ]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isFocused && user?.role === 'admin') {
      fetchDashboardData();
    }
  }, [isFocused, user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const StatCard = ({ title, value, subtitle, onPress, gradient = ['#3b82f6', '#1d4ed8'] }: { 
    title: string; 
    value: number; 
    subtitle: string; 
    onPress?: () => void;
    gradient?: string[];
  }) => (
    <TouchableOpacity style={[styles.statCard, { backgroundColor: gradient[0] }]} onPress={onPress}>
      <View style={styles.statCardHeader}>
        <Text style={styles.statTitle}>{title}</Text>
        <View style={[styles.statIcon, { backgroundColor: gradient[1] }]}>
          <Text style={styles.statIconText}>📊</Text>
        </View>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );

  const UserItem = ({ item }: { item: User }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userRole}>{item.role}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: item.isActive ? '#10b981' : '#ef4444' }]}>
        <Text style={styles.statusText}>{item.isActive ? 'Active' : 'Inactive'}</Text>
      </View>
    </View>
  );

  const AccommodationItem = ({ item }: { item: Accommodation }) => (
    <View style={styles.accommodationItem}>
      <Text style={styles.accommodationTitle}>{item.title}</Text>
      <Text style={styles.accommodationDescription} numberOfLines={2}>{item.description}</Text>
      <View style={styles.accommodationDetails}>
        <Text style={styles.accommodationPrice}>₹{item.price}/day</Text>
        <Text style={styles.accommodationType}>{item.type}</Text>
      </View>
      <Text style={styles.accommodationLandlord}>by {item.landlord?.name}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Manage your platform overview</Text>
        <Text style={styles.lastUpdated}>
          Last updated: {new Date().toLocaleTimeString()}
        </Text>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Card */}
        <View style={styles.section}>
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>👋 Welcome back, {user?.name || 'Admin'}!</Text>
            <Text style={styles.welcomeSubtitle}>Here's what's happening on your platform today</Text>
          </View>
        </View>

        {/* Main Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 System Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard 
              title="Total Users" 
              value={dashboardStats.totalUsers}
              subtitle="Registered users"
              onPress={() => setShowUserModal(true)}
              gradient={['#3b82f6', '#1d4ed8']}
            />
            <StatCard 
              title="Properties" 
              value={dashboardStats.totalAccommodations}
              subtitle="Listed accommodations"
              onPress={() => setShowAccommodationModal(true)}
              gradient={['#10b981', '#059669']}
            />
            <StatCard 
              title="Bookings" 
              value={dashboardStats.estimatedBookings}
              subtitle="Estimated bookings"
              gradient={['#f59e0b', '#d97706']}
            />
            <StatCard 
              title="Revenue" 
              value={dashboardStats.estimatedRevenue}
              subtitle="₹ Estimated revenue"
              gradient={['#8b5cf6', '#7c3aed']}
            />
          </View>
        </View>

        {/* User Role Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 User Distribution</Text>
          <View style={styles.roleDistribution}>
            {Object.entries(dashboardStats.usersByRole).map(([role, count]) => (
              <View key={role} style={styles.roleItem}>
                <Text style={styles.roleLabel}>{role.replace('_', ' ')}</Text>
                <Text style={styles.roleCount}>{count}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Users */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>👤 Recent Users</Text>
            <TouchableOpacity onPress={() => setShowUserModal(true)}>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </View>
          {dashboardStats.recentUsers.map((user, index) => (
            <UserItem key={user._id || index} item={user} />
          ))}
        </View>
      </ScrollView>

      {/* User Modal */}
      <Modal visible={showUserModal} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>All Users</Text>
            <TouchableOpacity onPress={() => setShowUserModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={dashboardStats.allUsers}
            keyExtractor={(item) => item._id}
            renderItem={UserItem}
            style={styles.modalList}
          />
        </View>
      </Modal>

      {/* Accommodation Modal */}
      <Modal visible={showAccommodationModal} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>All Accommodations</Text>
            <TouchableOpacity onPress={() => setShowAccommodationModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={dashboardStats.accommodations}
            keyExtractor={(item) => item._id}
            renderItem={AccommodationItem}
            style={styles.modalList}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#64748b',
    marginBottom: 4,
    fontWeight: '500',
  },
  lastUpdated: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 24,
    fontWeight: '500',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllButton: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    borderRadius: 20,
    padding: 20,
    width: '48%',
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
    opacity: 0.9,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIconText: {
    fontSize: 16,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
    fontWeight: '500',
  },
  welcomeCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
    lineHeight: 22,
  },
  roleDistribution: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  roleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  roleLabel: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  roleCount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3b82f6',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 40,
    textAlign: 'center',
  },
  userItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  accommodationItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  accommodationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  accommodationDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 20,
  },
  accommodationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  accommodationPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  accommodationType: {
    fontSize: 14,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  accommodationLandlord: {
    fontSize: 12,
    color: '#94a3b8',
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  closeButton: {
    fontSize: 24,
    color: '#64748b',
    fontWeight: '400',
  },
  modalList: {
    flex: 1,
    padding: 20,
  },
});

export default AdminDashboardScreen;
