import React, { useState, useEffect, useCallback } from 'react';
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
  ActivityIndicator,
  Dimensions,
  Platform,
  StatusBar
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/api.config';

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
  totalFoodProviders: number;
  activeFoodProviders: number;
  pendingFoodProviders: number;
  confirmedBookings: number;
  usersByRole: {
    student: number;
    landlord: number;
    food_provider: number;
    admin: number;
    other: number;
  };estimatedBookings: number;
  estimatedOrders: number;
  estimatedRevenue: number;
  recentUsers: User[];
  allUsers: User[];
  accommodations: Accommodation[];
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const AdminDashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
    const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAccommodations: 0,
    totalFoodProviders: 0,
    activeFoodProviders: 0,
    pendingFoodProviders: 0,
    confirmedBookings: 0,
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
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    if (user?.role !== 'admin') {
      Alert.alert('Access Denied', 'You do not have admin privileges', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      return;
    }
  }, [user, navigation]);  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setNetworkStatus('checking');
      console.log('🔄 Fetching admin dashboard data from backend...');
      console.log('🌐 API Base URL:', api.defaults.baseURL);
        // Create an array of API requests with fallback options
      const requests = [
        // Users - try directly with the correct endpoint
        api.get('/users').catch(() => ({ data: [] })),
        
        // Accommodations
        api.get('/accommodations').catch(() => ({ data: [] })),
        
        // Food providers
        api.get('/food-providers').catch(() => ({ data: [] }))
      ];
        // Execute all requests with proper error handling
      const [usersResponse, accommodationsResponse, foodProvidersResponse] = await Promise.all(requests);

      console.log('✅ Users API Response:', usersResponse?.data ? `${usersResponse.data.length} records found` : 'Failed');
      console.log('✅ Accommodations API Response:', accommodationsResponse?.data ? `${accommodationsResponse.data.length} records found` : 'Failed');
      console.log('✅ Food Providers API Response:', foodProvidersResponse?.data ? `${foodProvidersResponse.data.length} records found` : 'Failed');

      const allUsers: User[] = usersResponse?.data || [];
      const allAccommodations: Accommodation[] = accommodationsResponse?.data || [];
      const allFoodProviders: any[] = foodProvidersResponse?.data || [];

      console.log('✅ Users Count:', allUsers.length);
      console.log('✅ Accommodations Count:', allAccommodations.length);
      console.log('✅ Food Providers Count:', allFoodProviders.length);

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
      });      console.log('📊 User Role Distribution:', usersByRole);

      // Calculate food provider metrics
      const activeFoodProviders = allFoodProviders.filter(provider => 
        provider.isActive && provider.approvalStatus === 'approved'
      ).length;
      const pendingFoodProviders = allFoodProviders.filter(provider => 
        provider.approvalStatus === 'pending'
      ).length;

      // Calculate estimated metrics
      const estimatedBookings = allAccommodations.length * 2; // 2 bookings per accommodation
      const confirmedBookings = Math.floor(estimatedBookings * 0.6); // 60% confirmed rate
      const estimatedOrders = Math.max(activeFoodProviders * 5, 3); // 5 orders per active food provider
      const estimatedRevenue = allAccommodations.reduce((total, acc) => total + (acc.price || 0), 0) * 2;

      console.log('🍕 Food Provider Stats:', {
        total: allFoodProviders.length,
        active: activeFoodProviders,
        pending: pendingFoodProviders
      });

      const stats: DashboardStats = {
        totalUsers: allUsers.length,
        totalAccommodations: allAccommodations.length,
        totalFoodProviders: allFoodProviders.length,
        activeFoodProviders,
        pendingFoodProviders,
        confirmedBookings,
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
      });      setDashboardStats(stats);
    } catch (error) {
      setNetworkStatus('offline');
      console.error('❌ Error fetching dashboard data:', error);
      console.error('❌ Error details:', (error as any).response ? (error as any).response.data : (error as any).message);
      
      // Provide more specific error messages based on error type
      const errorMessage = (error as any).response?.status === 404 
        ? 'API endpoints not found. The backend may not support these admin features yet.'
        : (error as any).response?.status === 403
        ? 'You do not have permission to access admin data.'
        : (error as any).response?.status === 401
        ? 'Your session has expired. Please login again.'
        : 'Failed to fetch dashboard data. Please check your connection and try again.';
      
      Alert.alert(
        'Dashboard Error', 
        errorMessage,
        [
          { text: 'Retry', onPress: () => fetchDashboardData() },
          { text: 'OK' }
        ]
      );
    } finally {      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused && user?.role === 'admin') {
      fetchDashboardData();
    }
  }, [isFocused, user, fetchDashboardData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };
  const StatCard = ({ title, value, subtitle, onPress, icon, gradient }: { 
    title: string; 
    value: string | number; 
    subtitle?: string;
    onPress?: () => void;
    icon?: keyof typeof Ionicons.glyphMap;
    gradient?: string[];
  }) => (
    <TouchableOpacity style={[styles.statCard, { width: CARD_WIDTH }]} onPress={onPress}>
      <LinearGradient
        colors={gradient || ['#667eea', '#764ba2'] as any}
        style={styles.statCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.statCardContent}>
          <View style={styles.statCardHeader}>
            {icon && (
              <View style={styles.statCardIconContainer}>
                <Ionicons name={icon} size={24} color="white" />
              </View>
            )}
            <Text style={styles.statTitle}>{title}</Text>
          </View>
          <Text style={styles.statValue}>{value}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const NetworkStatusIndicator = () => (
    <View style={styles.networkIndicator}>
      <View style={[
        styles.networkDot, 
        { backgroundColor: networkStatus === 'online' ? '#27ae60' : networkStatus === 'offline' ? '#e74c3c' : '#f39c12' }
      ]} />
      <Text style={styles.networkText}>
        {networkStatus === 'online' ? 'Online' : networkStatus === 'offline' ? 'Offline' : 'Checking...'}
      </Text>
    </View>
  );

  const QuickActionCard = ({ title, icon, onPress, color }: {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    color: string;
  }) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="white" />
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
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
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.loadingGradient}
        >
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingTitle}>StayKaru Admin</Text>
            <Text style={styles.loadingText}>Loading Dashboard...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <Text style={styles.headerSubtitle}>Welcome back, {user?.name || 'Admin'}</Text>
          </View>
          <NetworkStatusIndicator />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }      >
        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.lastUpdated}>Last updated: {new Date().toLocaleString()}</Text>

          {/* Enhanced Statistics Cards */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 System Overview</Text>
            <View style={styles.statsGrid}>
              <StatCard 
                title="Total Users" 
                value={dashboardStats.totalUsers}
                subtitle="Registered users"
                icon="people"
                gradient={['#667eea', '#764ba2']}
                onPress={() => setShowUserModal(true)}
              />
              <StatCard 
                title="Properties" 
                value={dashboardStats.totalAccommodations}
                subtitle="Listed accommodations"
                icon="home"
                gradient={['#f093fb', '#f5576c']}
                onPress={() => setShowAccommodationModal(true)}
              />
              <StatCard 
                title="Est. Bookings" 
                value={dashboardStats.estimatedBookings}
                subtitle="Based on properties"
                icon="calendar"
                gradient={['#4facfe', '#00f2fe']}
              />
              <StatCard 
                title="Est. Revenue" 
                value={`PKR ${dashboardStats.estimatedRevenue.toLocaleString()}`}
                subtitle="Monthly estimate"
                icon="card"
                gradient={['#43e97b', '#38f9d7']}
              />            </View>
          </View>

          {/* Food Provider Statistics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🍕 Food Provider Analytics</Text>
            <View style={styles.statsGrid}>
              <StatCard 
                title="Food Providers" 
                value={dashboardStats.totalFoodProviders}
                subtitle="Total registered"
                icon="restaurant"
                gradient={['#ff9a9e', '#fecfef']}
                onPress={() => navigation.navigate('AdminFoodProviders' as never)}
              />
              <StatCard 
                title="Active Providers" 
                value={dashboardStats.activeFoodProviders}
                subtitle="Approved & active"
                icon="checkmark-circle"
                gradient={['#a8edea', '#fed6e3']}
                onPress={() => navigation.navigate('AdminFoodProviders' as never)}
              />
              <StatCard 
                title="Pending Approval" 
                value={dashboardStats.pendingFoodProviders}
                subtitle="Awaiting review"
                icon="time"
                gradient={['#ffecd2', '#fcb69f']}
                onPress={() => navigation.navigate('AdminFoodProviders' as never)}
              />
              <StatCard 
                title="Confirmed Bookings" 
                value={dashboardStats.confirmedBookings}
                subtitle="Active reservations"
                icon="calendar-outline"
                gradient={['#a8caba', '#5d4e75']}
                onPress={() => navigation.navigate('AdminBookings' as never)}
              />
            </View>
          </View>

          {/* Enhanced User Role Distribution */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👥 User Distribution</Text>
            <View style={styles.roleDistributionCard}>
              <View style={styles.roleGrid}>
                <View style={[styles.roleItem, { borderLeftColor: '#3498db' }]}>
                  <Ionicons name="school" size={20} color="#3498db" />
                  <View style={styles.roleInfo}>
                    <Text style={styles.roleLabel}>Students</Text>
                    <Text style={[styles.roleCount, { color: '#3498db' }]}>{dashboardStats.usersByRole.student}</Text>
                  </View>
                </View>
                <View style={[styles.roleItem, { borderLeftColor: '#e67e22' }]}>
                  <Ionicons name="business" size={20} color="#e67e22" />
                  <View style={styles.roleInfo}>
                    <Text style={styles.roleLabel}>Landlords</Text>
                    <Text style={[styles.roleCount, { color: '#e67e22' }]}>{dashboardStats.usersByRole.landlord}</Text>
                  </View>
                </View>
                <View style={[styles.roleItem, { borderLeftColor: '#27ae60' }]}>
                  <Ionicons name="restaurant" size={20} color="#27ae60" />
                  <View style={styles.roleInfo}>
                    <Text style={styles.roleLabel}>Food Providers</Text>
                    <Text style={[styles.roleCount, { color: '#27ae60' }]}>{dashboardStats.usersByRole.food_provider}</Text>
                  </View>
                </View>
                <View style={[styles.roleItem, { borderLeftColor: '#9b59b6' }]}>
                  <Ionicons name="shield-checkmark" size={20} color="#9b59b6" />
                  <View style={styles.roleInfo}>
                    <Text style={styles.roleLabel}>Admins</Text>
                    <Text style={[styles.roleCount, { color: '#9b59b6' }]}>{dashboardStats.usersByRole.admin}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Recent Users with Enhanced Design */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🆕 Recent Users</Text>
            <View style={styles.recentUsersContainer}>
              {dashboardStats.recentUsers.map((user, index) => (
                <View key={user._id} style={styles.recentUserCard}>
                  <View style={styles.recentUserAvatar}>
                    <Ionicons name="person" size={20} color="white" />
                  </View>
                  <View style={styles.recentUserDetails}>
                    <Text style={styles.recentUserName}>{user.name}</Text>
                    <Text style={styles.recentUserRole}>{user.role}</Text>
                    <Text style={styles.recentUserDate}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={[styles.userStatusBadge, { backgroundColor: user.isActive ? '#27ae60' : '#e74c3c' }]}>
                    <Text style={styles.userStatusText}>{user.isActive ? 'Active' : 'Inactive'}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Enhanced Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <QuickActionCard
                title="View Users"
                icon="people"
                color="#667eea"
                onPress={() => setShowUserModal(true)}
              />
              <QuickActionCard
                title="View Properties"
                icon="home"
                color="#f5576c"
                onPress={() => setShowAccommodationModal(true)}
              />
              <QuickActionCard
                title="System Reports"
                icon="analytics"
                color="#4facfe"
                onPress={() => {/* Navigate to reports */}}
              />
              <QuickActionCard
                title="Refresh Data"
                icon="refresh"
                color="#43e97b"                onPress={handleRefresh}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Enhanced Users Modal */}
      <Modal visible={showUserModal} animationType="slide" statusBarTranslucent>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.modalHeader}
          >
            <Text style={styles.modalTitle}>All Users ({dashboardStats.totalUsers})</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowUserModal(false)}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </LinearGradient>
          <FlatList
            data={dashboardStats.allUsers}
            keyExtractor={(item) => item._id}
            renderItem={UserItem}
            style={styles.modalList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>

      {/* Enhanced Accommodations Modal */}
      <Modal visible={showAccommodationModal} animationType="slide" statusBarTranslucent>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#f093fb', '#f5576c']}
            style={styles.modalHeader}
          >
            <Text style={styles.modalTitle}>All Properties ({dashboardStats.totalAccommodations})</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowAccommodationModal(false)}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </LinearGradient>
          <FlatList
            data={dashboardStats.accommodations}
            keyExtractor={(item) => item._id}
            renderItem={AccommodationItem}
            style={styles.modalList}
            showsVerticalScrollIndicator={false}
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
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  networkIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  networkText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  statCardGradient: {
    borderRadius: 16,
  },
  statCardContent: {
    padding: 20,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statCardIconContainer: {
    marginRight: 12,
  },
  statTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  roleDistributionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  roleGrid: {
    gap: 16,
  },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  roleInfo: {
    marginLeft: 16,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleLabel: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '600',
  },
  roleCount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  recentUsersContainer: {
    gap: 12,
  },
  recentUserCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  recentUserAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  recentUserDetails: {
    flex: 1,
  },
  recentUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  recentUserRole: {
    fontSize: 14,
    color: '#64748b',
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  recentUserDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  userStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  userStatusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: (width - 56) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalList: {
    flex: 1,
    padding: 20,
  },
  userItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#667eea',
    marginBottom: 4,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  userPhone: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  userStatus: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '600',
  },
  accommodationItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f5576c',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  accommodationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  accommodationDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    lineHeight: 20,
  },
  accommodationPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f5576c',
    marginBottom: 4,
  },
  accommodationLandlord: {
    fontSize: 14,
    color: '#667eea',
    marginBottom: 4,
    fontWeight: '600',
  },
  accommodationCity: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  accommodationAmenities: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 16,
  },
});

export default AdminDashboardScreen;
