import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  RefreshControl, 
  Alert, 
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api.service';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  gender?: string;
  isActive: boolean;
  createdAt: string;
}

interface Accommodation {
  _id: string;
  title: string;
  description: string;
  price: number;
  city: any;
  landlord: User;
  amenities: string[];
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
      console.log('🌐 API Base URL:', api.defaults.baseURL);
      
      // Fetch data from the working endpoints
      const [usersResponse, accommodationsResponse] = await Promise.all([
        api.get('/users'),
        api.get('/accommodations')
      ]);

      console.log('✅ Users API Response Status:', usersResponse.status);
      console.log('✅ Users Count:', usersResponse.data?.length || 0);
      console.log('📝 Sample User Data:', usersResponse.data?.[0]);
      
      console.log('✅ Accommodations API Response Status:', accommodationsResponse.status);
      console.log('✅ Accommodations Count:', accommodationsResponse.data?.length || 0);
      console.log('📝 Sample Accommodation Data:', accommodationsResponse.data?.[0]);

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

      console.log('📊 User Role Distribution:', usersByRole);

      // Calculate estimated metrics
      const estimatedBookings = allAccommodations.length * 2; // 2 bookings per accommodation
      const estimatedOrders = Math.max(usersByRole.food_provider * 5, 3); // 5 orders per food provider
      const estimatedRevenue = allAccommodations.reduce((total, acc) => total + (acc.price || 0), 0) * 2;

      const stats: DashboardStats = {
        totalUsers: allUsers.length,
        totalAccommodations: allAccommodations.length,
        usersByRole,
        estimatedBookings,
        estimatedOrders,
        estimatedRevenue,
        recentUsers: allUsers.slice(-5), // Last 5 users
        allUsers,
        accommodations: allAccommodations
      };

      console.log('📊 Final Dashboard Stats:', {
        totalUsers: stats.totalUsers,
        totalAccommodations: stats.totalAccommodations,
        usersByRole: stats.usersByRole,
        estimatedRevenue: stats.estimatedRevenue
      });

      setDashboardStats(stats);
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      console.error('❌ Error details:', (error as any).response ? (error as any).response.data : (error as any).message);
      
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

  const StatCard = ({ title, value, subtitle, onPress }: { 
    title: string; 
    value: string | number; 
    subtitle?: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </TouchableOpacity>
  );

  const UserItem = ({ item }: { item: User }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userRole}>Role: {item.role}</Text>
        {item.phone && <Text style={styles.userPhone}>Phone: {item.phone}</Text>}
        <Text style={styles.userStatus}>Status: {item.isActive ? 'Active' : 'Inactive'}</Text>
      </View>
    </View>
  );

  const AccommodationItem = ({ item }: { item: Accommodation }) => (
    <View style={styles.accommodationItem}>
      <Text style={styles.accommodationTitle}>{item.title}</Text>
      <Text style={styles.accommodationDescription}>{item.description}</Text>
      <Text style={styles.accommodationPrice}>Price: ₹{item.price}/day</Text>
      <Text style={styles.accommodationLandlord}>Landlord: {item.landlord?.name}</Text>
      <Text style={styles.accommodationCity}>City: {item.city?.name}</Text>
      {item.amenities && <Text style={styles.accommodationAmenities}>
        Amenities: {item.amenities.join(', ')}
      </Text>}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A6572" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>Welcome back, {user?.name || 'Admin'}</Text>
      <Text style={styles.lastUpdated}>Last updated: {new Date().toLocaleString()}</Text>

      {/* Main Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 System Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard 
            title="Total Users" 
            value={dashboardStats.totalUsers}
            subtitle="Registered users"
            onPress={() => setShowUserModal(true)}
          />
          <StatCard 
            title="Properties" 
            value={dashboardStats.totalAccommodations}
            subtitle="Listed accommodations"
            onPress={() => setShowAccommodationModal(true)}
          />
          <StatCard 
            title="Est. Bookings" 
            value={dashboardStats.estimatedBookings}
            subtitle="Based on properties"
          />
          <StatCard 
            title="Est. Revenue" 
            value={`₹${dashboardStats.estimatedRevenue.toLocaleString()}`}
            subtitle="Monthly estimate"
          />
        </View>
      </View>

      {/* User Role Distribution */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👥 User Distribution</Text>
        <View style={styles.roleDistribution}>
          <View style={styles.roleItem}>
            <Text style={styles.roleLabel}>Students</Text>
            <Text style={styles.roleCount}>{dashboardStats.usersByRole.student}</Text>
          </View>
          <View style={styles.roleItem}>
            <Text style={styles.roleLabel}>Landlords</Text>
            <Text style={styles.roleCount}>{dashboardStats.usersByRole.landlord}</Text>
          </View>
          <View style={styles.roleItem}>
            <Text style={styles.roleLabel}>Food Providers</Text>
            <Text style={styles.roleCount}>{dashboardStats.usersByRole.food_provider}</Text>
          </View>
          <View style={styles.roleItem}>
            <Text style={styles.roleLabel}>Admins</Text>
            <Text style={styles.roleCount}>{dashboardStats.usersByRole.admin}</Text>
          </View>
        </View>
      </View>

      {/* Recent Users */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🆕 Recent Users</Text>
        {dashboardStats.recentUsers.map((user, index) => (
          <View key={user._id} style={styles.recentUserItem}>
            <Text style={styles.recentUserName}>{user.name}</Text>
            <Text style={styles.recentUserRole}>{user.role}</Text>
            <Text style={styles.recentUserDate}>
              {new Date(user.createdAt).toLocaleDateString()}
            </Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowUserModal(true)}
          >
            <Text style={styles.actionButtonText}>👥 View All Users</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowAccommodationModal(true)}
          >
            <Text style={styles.actionButtonText}>🏠 View Properties</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleRefresh}
          >
            <Text style={styles.actionButtonText}>🔄 Refresh Data</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Users Modal */}
      <Modal visible={showUserModal} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>All Users ({dashboardStats.totalUsers})</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowUserModal(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
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

      {/* Accommodations Modal */}
      <Modal visible={showAccommodationModal} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>All Properties ({dashboardStats.totalAccommodations})</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowAccommodationModal(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
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
    </ScrollView>
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
    marginBottom: 4,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statTitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 4,
  },
  roleDistribution: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  roleLabel: {
    fontSize: 16,
    color: '#2c3e50',
  },
  roleCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498db',
  },
  recentUserItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  recentUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  recentUserRole: {
    fontSize: 14,
    color: '#3498db',
    flex: 1,
    textAlign: 'center',
  },
  recentUserDate: {
    fontSize: 12,
    color: '#95a5a6',
    flex: 1,
    textAlign: 'right',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    width: '48%',
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    backgroundColor: '#f8f9fa',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalList: {
    flex: 1,
    padding: 16,
  },
  userItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 14,
    color: '#3498db',
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  userPhone: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  userStatus: {
    fontSize: 12,
    color: '#27ae60',
  },
  accommodationItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#e67e22',
  },
  accommodationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  accommodationDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 6,
  },
  accommodationPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e67e22',
    marginBottom: 4,
  },
  accommodationLandlord: {
    fontSize: 14,
    color: '#3498db',
    marginBottom: 2,
  },
  accommodationCity: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  accommodationAmenities: {
    fontSize: 12,
    color: '#95a5a6',
  },
});

export default AdminDashboardScreen;
