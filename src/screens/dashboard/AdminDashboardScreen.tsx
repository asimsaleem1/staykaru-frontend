import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList
} from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import api from '../../services/api.service';

const AdminDashboardScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (user?.role !== 'admin') {
      Alert.alert('Access Denied', 'You do not have admin privileges', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  }, [user, navigation]);const fetchDashboardData = async () => {
    try {
      setLoading(true);
        // Fetch real data from backend API endpoints
      const [
        dashboardResponse,
        usersResponse,
        userCountResponse,
        bookingsResponse,
        ordersResponse,
        accommodationsResponse,
        reviewsResponse
      ] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/users/admin/all'),
        api.get('/users/admin/count'),
        api.get('/analytics/bookings'),
        api.get('/analytics/orders'),
        api.get('/accommodations'),
        api.get('/reviews')
      ]);      console.log('Dashboard API Response:', dashboardResponse.data);
      console.log('Users Response:', usersResponse.data);
      console.log('User Count Response:', userCountResponse.data);
      console.log('Bookings Response:', bookingsResponse.data);
      console.log('Orders Response:', ordersResponse.data);
      console.log('Accommodations Response:', accommodationsResponse.data);
      console.log('Reviews Response:', reviewsResponse.data);

      // Process the real data from API
      const allUsers = usersResponse.data || [];
      const userCounts = userCountResponse.data || {};
      const dashboardStats = dashboardResponse.data || {};
        // Calculate user counts by role
      const usersByRole = [
        { role: 'student', count: userCounts.students || allUsers.filter((u: any) => u.role === 'student').length },
        { role: 'landlord', count: userCounts.landlords || allUsers.filter((u: any) => u.role === 'landlord').length },
        { role: 'food_provider', count: userCounts.food_providers || allUsers.filter((u: any) => u.role === 'food_provider').length },
        { role: 'admin', count: userCounts.admins || allUsers.filter((u: any) => u.role === 'admin').length }
      ];

      const processedData = {
        counts: {
          users: dashboardStats.totalUsers || allUsers.length || 0,
          bookings: dashboardStats.totalBookings || bookingsResponse.data?.total || 0,
          orders: dashboardStats.totalOrders || ordersResponse.data?.total || 0,
          accommodations: dashboardStats.totalAccommodations || accommodationsResponse.data?.length || 0,
          reviews: dashboardStats.totalReviews || reviewsResponse.data?.length || 0,
          revenue: dashboardStats.totalRevenue || 0
        },
        distributions: {
          usersByRole: usersByRole,
          bookingsByStatus: bookingsResponse.data?.bookingsByStatus || [
            { status: 'pending', count: 0 },
            { status: 'confirmed', count: 0 },
            { status: 'cancelled', count: 0 },
            { status: 'completed', count: 0 }
          ],
          ordersByStatus: ordersResponse.data?.ordersByStatus || [
            { status: 'pending', count: 0 },
            { status: 'preparing', count: 0 },
            { status: 'ready', count: 0 },
            { status: 'delivered', count: 0 },
            { status: 'cancelled', count: 0 }
          ]
        },
        recentUsers: allUsers.slice(0, 5) || [],
        allUsers: allUsers, // Store all users for the modal
        monthlyRevenue: dashboardStats.monthlyRevenue || [],
        recentActivity: [
          ...(bookingsResponse.data?.recentBookings?.slice(0, 3).map((booking: any) => ({
            id: booking._id,
            type: 'booking',
            description: `New booking for ${booking.accommodation?.title || 'accommodation'}`,
            user: booking.user?.name || 'Unknown user',
            time: booking.createdAt,
            amount: booking.totalPrice
          })) || []),
          ...(ordersResponse.data?.recentOrders?.slice(0, 3).map((order: any) => ({
            id: order._id,
            type: 'order',
            description: `New order from ${order.foodProvider?.name || 'food provider'}`,
            user: order.user?.name || 'Unknown user',
            time: order.createdAt,
            amount: order.totalPrice
          })) || [])
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5)
      };

      setDashboardData(processedData);
      console.log('Processed Dashboard Data:', processedData);    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error details:', error.response ? error.response.data : error.message);
      Alert.alert('Connection Error', 'Failed to load real-time data from database. Showing sample data.', [
        { text: 'Retry', onPress: () => fetchDashboardData() },
        { text: 'OK' }
      ]);
        // Fallback to mock data if API fails but show that it's sample data
      setDashboardData({        counts: {
          users: 24, // Real count from database testing
          bookings: 5, // Estimated based on 3 accommodations
          orders: 3, // Estimated food orders
          accommodations: 3, // Real count from database
          reviews: 8, // Estimated reviews
          revenue: 12000 // Estimated revenue
        },
        distributions: {
          usersByRole: [
            { role: 'student', count: 16 }, // Real distribution from database
            { role: 'landlord', count: 3 },
            { role: 'food_provider', count: 1 },
            { role: 'admin', count: 2 }
          ],
          bookingsByStatus: [
            { status: 'pending', count: 2 },
            { status: 'confirmed', count: 7 },
            { status: 'cancelled', count: 1 },
            { status: 'completed', count: 2 }
          ],
          ordersByStatus: [
            { status: 'pending', count: 1 },
            { status: 'preparing', count: 2 },
            { status: 'ready', count: 1 },
            { status: 'delivered', count: 3 },
            { status: 'cancelled', count: 1 }
          ]
        },        recentUsers: [
          { _id: '1', name: 'Muhammad Asim', email: 'as@gmail.com', role: 'student', createdAt: new Date().toISOString() },
          { _id: '2', name: 'Ayesha', email: 'ayesha@gmail.com', role: 'student', createdAt: new Date().toISOString() },
          { _id: '3', name: 'Landlord User', email: 'landlord@gmail.com', role: 'landlord', createdAt: new Date().toISOString() },
          { _id: '4', name: 'Sarim', email: 'sss@gmail.com', role: 'food_provider', createdAt: new Date().toISOString() },
          { _id: '5', name: 'Admin User', email: 'assaleemofficial@gmail.com', role: 'admin', createdAt: new Date().toISOString() }
        ],
        allUsers: [
          { _id: '1', name: 'Muhammad Asim', email: 'as@gmail.com', role: 'student', createdAt: new Date().toISOString() },
          { _id: '2', name: 'Ayesha', email: 'ayesha@gmail.com', role: 'student', createdAt: new Date().toISOString() },
          { _id: '3', name: 'Landlord User', email: 'landlord@gmail.com', role: 'landlord', createdAt: new Date().toISOString() },
          { _id: '4', name: 'Sarim', email: 'sss@gmail.com', role: 'food_provider', createdAt: new Date().toISOString() },
          { _id: '5', name: 'Admin User', email: 'assaleemofficial@gmail.com', role: 'admin', createdAt: new Date().toISOString() }
        ],
        monthlyRevenue: [
          { month: 'May', revenue: 8000 },
          { month: 'Jun', revenue: 12000 }
        ],recentActivity: []
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchDashboardData();
    }
  }, [isFocused]);
  const handleUserManagement = () => {
    Alert.alert(
      'User Management',
      'Choose an action:',
      [
        {
          text: 'View All Users',
          onPress: () => setShowUserManagement(true)
        },
        {
          text: 'User Analytics',
          onPress: () => showUserStats()
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const showUserStats = () => {
    const userStats = dashboardData?.distributions?.usersByRole;
    if (userStats) {
      const statsMessage = userStats.map((role: any) => 
        `${role.role.replace('_', ' ').toUpperCase()}: ${role.count} users`
      ).join('\n');
      Alert.alert('User Statistics', statsMessage);
    }
  };
  const closeUserManagement = () => {
    setShowUserManagement(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading && !dashboardData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4b7bec" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome, {user?.name}
        </Text>
        <Text style={styles.roleText}>Admin Analytics Dashboard</Text>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >        {/* Key Metrics Section */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.cardContainer}>
            <View style={styles.metricCard}>
              <FontAwesome5 name="users" size={24} color="#4b7bec" />
              <Text style={styles.metricNumber}>{dashboardData?.counts?.users || 0}</Text>
              <Text style={styles.metricLabel}>Total Users</Text>
            </View>
            
            <View style={styles.metricCard}>
              <FontAwesome5 name="building" size={24} color="#26de81" />
              <Text style={styles.metricNumber}>{dashboardData?.counts?.accommodations || 0}</Text>
              <Text style={styles.metricLabel}>Accommodations</Text>
            </View>
            
            <View style={styles.metricCard}>
              <FontAwesome5 name="calendar-check" size={24} color="#fd9644" />
              <Text style={styles.metricNumber}>{dashboardData?.counts?.bookings || 0}</Text>
              <Text style={styles.metricLabel}>Bookings</Text>
            </View>
            
            <View style={styles.metricCard}>
              <FontAwesome5 name="shopping-cart" size={24} color="#f7b731" />
              <Text style={styles.metricNumber}>{dashboardData?.counts?.orders || 0}</Text>
              <Text style={styles.metricLabel}>Food Orders</Text>
            </View>
            
            <View style={styles.metricCard}>
              <FontAwesome5 name="star" size={24} color="#fc5c65" />
              <Text style={styles.metricNumber}>{dashboardData?.counts?.reviews || 0}</Text>
              <Text style={styles.metricLabel}>Reviews</Text>
            </View>
          </View>
          
          <View style={styles.wideCard}>
            <FontAwesome5 name="pound-sign" size={24} color="#20bf6b" />
            <Text style={styles.revenueNumber}>£{dashboardData?.counts?.revenue || 0}</Text>
            <Text style={styles.metricLabel}>Total Revenue</Text>
          </View>
        </View>

        {/* User Distribution */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>User Distribution</Text>
          <View style={styles.distributionCard}>
            {dashboardData?.distributions?.usersByRole?.map((item: any, index: number) => (
              <View key={index} style={styles.distributionItem}>
                <View style={styles.distributionInfo}>
                  <Text style={styles.distributionLabel}>{item.role.replace('_', ' ').toUpperCase()}</Text>
                  <Text style={styles.distributionCount}>{item.count} users</Text>
                </View>
                <View style={[styles.distributionBar, { width: `${(item.count / (dashboardData?.counts?.users || 1)) * 100}%` }]} />
              </View>
            ))}
          </View>
        </View>        {/* Booking Status */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Booking Status Overview</Text>
          <View style={styles.distributionCard}>
            {dashboardData?.distributions?.bookingsByStatus?.map((item: any, index: number) => (
              <View key={index} style={styles.distributionItem}>
                <View style={styles.distributionInfo}>
                  <Text style={styles.distributionLabel}>{item.status.toUpperCase()}</Text>
                  <Text style={styles.distributionCount}>{item.count} bookings</Text>
                </View>
                <View style={[
                  styles.distributionBar, 
                  { 
                    width: `${(item.count / (dashboardData?.counts?.bookings || 1)) * 100}%`,
                    backgroundColor: item.status === 'confirmed' ? '#26de81' : 
                                   item.status === 'pending' ? '#fd9644' : 
                                   item.status === 'cancelled' ? '#fc5c65' : '#4b7bec'
                  }
                ]} />
              </View>
            ))}
          </View>
        </View>

        {/* Order Status */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Order Status Overview</Text>
          <View style={styles.distributionCard}>
            {dashboardData?.distributions?.ordersByStatus?.map((item: any, index: number) => (
              <View key={index} style={styles.distributionItem}>
                <View style={styles.distributionInfo}>
                  <Text style={styles.distributionLabel}>{item.status.toUpperCase()}</Text>
                  <Text style={styles.distributionCount}>{item.count} orders</Text>
                </View>
                <View style={[
                  styles.distributionBar, 
                  { 
                    width: `${(item.count / (dashboardData?.counts?.orders || 1)) * 100}%`,
                    backgroundColor: item.status === 'delivered' ? '#26de81' : 
                                   item.status === 'ready' ? '#4b7bec' :
                                   item.status === 'preparing' ? '#fd9644' : 
                                   item.status === 'pending' ? '#f7b731' : '#fc5c65'
                  }
                ]} />
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.distributionCard}>
            {dashboardData?.recentActivity?.length > 0 ? (
              dashboardData.recentActivity.map((activity: any, index: number) => (
                <View key={index} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <FontAwesome5 
                      name={activity.type === 'booking' ? 'calendar-check' : 'shopping-cart'} 
                      size={16} 
                      color={activity.type === 'booking' ? '#4b7bec' : '#fd9644'} 
                    />
                  </View>
                  <View style={styles.activityDetails}>
                    <Text style={styles.activityDescription}>{activity.description}</Text>
                    <Text style={styles.activityUser}>by {activity.user}</Text>
                    <Text style={styles.activityTime}>
                      {new Date(activity.time).toLocaleDateString()} - £{activity.amount}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>No recent activity</Text>
            )}
          </View>
        </View>        {/* Management Quick Actions */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>User Management</Text>
          <TouchableOpacity style={styles.wideCard} onPress={handleUserManagement}>
            <FontAwesome5 name="users-cog" size={24} color="#4b7bec" />
            <Text style={styles.cardTitle}>Manage All Users</Text>
            <Text style={styles.cardDescription}>
              View, edit, and manage user accounts - {dashboardData?.counts?.users || 0} total users
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.cardContainer}>            <TouchableOpacity style={styles.actionCard} onPress={() => Alert.alert('Analytics', 'Analytics screen coming soon!')}>
              <FontAwesome5 name="chart-line" size={24} color="#26de81" />
              <Text style={styles.cardTitle}>Analytics</Text>
              <Text style={styles.cardDescription}>
                View detailed reports
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} onPress={() => Alert.alert('Properties', 'Property management coming soon!')}>
              <FontAwesome5 name="building" size={24} color="#fd9644" />
              <Text style={styles.cardTitle}>Properties</Text>
              <Text style={styles.cardDescription}>
                {dashboardData?.counts?.accommodations || 0} accommodations
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} onPress={() => Alert.alert('Bookings', 'Booking management coming soon!')}>
              <FontAwesome5 name="calendar-alt" size={24} color="#f7b731" />
              <Text style={styles.cardTitle}>Bookings</Text>
              <Text style={styles.cardDescription}>
                {dashboardData?.counts?.bookings || 0} total bookings
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => Alert.alert('Orders', 'Order management coming soon!')}>
              <FontAwesome5 name="utensils" size={24} color="#fc5c65" />
              <Text style={styles.cardTitle}>Food Orders</Text>
              <Text style={styles.cardDescription}>
                {dashboardData?.counts?.orders || 0} total orders
              </Text>
            </TouchableOpacity>
          </View>        </View>
      </ScrollView>

      {/* User Management Modal */}
      <Modal
        visible={showUserManagement}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeUserManagement}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>User Management</Text>
            <TouchableOpacity onPress={closeUserManagement} style={styles.closeButton}>
              <FontAwesome5 name="times" size={20} color="#636e72" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.userStatsContainer}>
              <Text style={styles.sectionTitle}>User Statistics</Text>
              {dashboardData?.distributions?.usersByRole?.map((role: any, index: number) => (
                <View key={index} style={styles.userStatItem}>
                  <Text style={styles.userStatLabel}>
                    {role.role.replace('_', ' ').toUpperCase()}
                  </Text>
                  <Text style={styles.userStatCount}>{role.count} users</Text>
                </View>
              ))}
            </View>            <View style={styles.recentUsersContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>All Registered Users</Text>
                <Text style={styles.totalUsersCount}>
                  Total: {dashboardData?.allUsers?.length || 0} users
                </Text>
              </View>
              
              {dashboardData?.allUsers?.length > 0 ? (
                <ScrollView style={styles.usersList} showsVerticalScrollIndicator={true}>
                  {dashboardData.allUsers.map((user: any, index: number) => (
                    <View key={user._id || index} style={styles.userItem}>
                      <View style={styles.userAvatar}>
                        <FontAwesome5 
                          name={user.role === 'student' ? 'user-graduate' : 
                               user.role === 'landlord' ? 'home' : 
                               user.role === 'food_provider' ? 'utensils' : 'user-shield'} 
                          size={20} 
                          color="#4b7bec" 
                        />
                      </View>
                      <View style={styles.userInfo}>
                        <Text style={styles.userName}>{user.name || 'Unknown User'}</Text>
                        <Text style={styles.userEmail}>{user.email || 'No email'}</Text>
                        <View style={styles.userMetadata}>
                          <Text style={[styles.userRoleBadge, { 
                            backgroundColor: user.role === 'admin' ? '#e74c3c' : 
                                           user.role === 'landlord' ? '#f39c12' : 
                                           user.role === 'food_provider' ? '#27ae60' : '#3498db'
                          }]}>
                            {user.role?.replace('_', ' ').toUpperCase() || 'USER'}
                          </Text>
                          <Text style={styles.userJoinDate}>
                            Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.userActions}>
                        <TouchableOpacity 
                          style={styles.viewButton}
                          onPress={() => Alert.alert(
                            'User Details', 
                            `Name: ${user.name || 'N/A'}\nEmail: ${user.email || 'N/A'}\nRole: ${user.role || 'N/A'}\nUser ID: ${user._id || 'N/A'}\nJoined: ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}`,
                            [
                              { text: 'OK' },
                              { text: 'Contact User', onPress: () => console.log('Contact user:', user._id) }
                            ]
                          )}
                        >
                          <FontAwesome5 name="eye" size={14} color="#4b7bec" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.editButton}
                          onPress={() => Alert.alert(
                            'Edit User', 
                            `Edit ${user.name}?`,
                            [
                              { text: 'Cancel' },
                              { text: 'Edit Role', onPress: () => console.log('Edit role for:', user._id) },
                              { text: 'View Profile', onPress: () => console.log('View profile:', user._id) }
                            ]
                          )}
                        >
                          <FontAwesome5 name="edit" size={14} color="#f39c12" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              ) : (                <View style={styles.noDataContainer}>
                  <FontAwesome5 name="users-slash" size={40} color="#95a5a6" />
                  <Text style={styles.noDataText}>No users found in database</Text>
                  <Text style={styles.noDataSubtext}>Check your internet connection or try refreshing</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  header: {
    backgroundColor: '#4b7bec',
    padding: 20,
    paddingTop: 40,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  roleText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  cardSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#2d3436',
  },  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  metricCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '48%',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '48%',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  wideCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
    color: '#2d3436',
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
    marginTop: 10,
    marginBottom: 5,
  },
  metricLabel: {
    fontSize: 14,
    color: '#636e72',
    textAlign: 'center',
  },
  revenueNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#20bf6b',
    marginTop: 10,
    marginBottom: 5,
  },
  distributionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  distributionItem: {
    marginBottom: 15,
  },
  distributionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  distributionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3436',
  },
  distributionCount: {
    fontSize: 14,
    color: '#636e72',
  },
  distributionBar: {
    height: 6,
    backgroundColor: '#4b7bec',
    borderRadius: 3,
    minWidth: 10,
  },
  cardDescription: {
    fontSize: 14,
    color: '#636e72',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#636e72',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 2,
  },
  activityUser: {
    fontSize: 12,
    color: '#636e72',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#636e72',
  },  noDataText: {
    textAlign: 'center',
    color: '#636e72',
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  userStatsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  userStatLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3436',
  },
  userStatCount: {
    fontSize: 14,
    color: '#4b7bec',
    fontWeight: 'bold',
  },
  recentUsersContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#636e72',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: '#4b7bec',
    fontWeight: '500',
  },
  userActions: {
    flexDirection: 'row',
  },  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  totalUsersCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b7bec',
  },
  usersList: {
    maxHeight: 400,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },  userRoleBadge: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
    textAlign: 'center',
    overflow: 'hidden',
  },
  userJoinDate: {
    fontSize: 11,
    color: '#95a5a6',
  },
  viewButton: {
    padding: 8,
    marginLeft: 4,
    backgroundColor: '#e3f2fd',
    borderRadius: 6,
  },
  editButton: {
    padding: 8,
    marginLeft: 4,
    backgroundColor: '#fff3e0',
    borderRadius: 6,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataSubtext: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default AdminDashboardScreen;
