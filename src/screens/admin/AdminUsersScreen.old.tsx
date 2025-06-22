import React, { useState, useEffect, useCallback } from 'react';
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
  Dimensions,
  Platform,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api.service';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  gender?: string;
  isActive: boolean;  createdAt: string;
}

const { width } = Dimensions.get('window');

const AdminUsersScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  const roleFilters = [
    { key: 'all', label: 'All Users', icon: 'people' as keyof typeof Ionicons.glyphMap, color: '#667eea' },
    { key: 'student', label: 'Students', icon: 'school' as keyof typeof Ionicons.glyphMap, color: '#3498db' },
    { key: 'landlord', label: 'Landlords', icon: 'business' as keyof typeof Ionicons.glyphMap, color: '#e67e22' },
    { key: 'food_provider', label: 'Food Providers', icon: 'restaurant' as keyof typeof Ionicons.glyphMap, color: '#27ae60' },
    { key: 'admin', label: 'Admins', icon: 'shield-checkmark' as keyof typeof Ionicons.glyphMap, color: '#9b59b6' }
  ];

  useEffect(() => {
    if (user?.role !== 'admin') {
      Alert.alert('Access Denied', 'You do not have admin privileges', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      return;
    }
    fetchUsers();
  }, [user, navigation, fetchUsers]);
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setNetworkStatus('checking');
      console.log('📋 Fetching all users...');
      
      const response = await api.get('/users');
      
      setNetworkStatus('online');
      if (response.data) {
        const allUsers = response.data.sort((a: User, b: User) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setUsers(allUsers);
        setFilteredUsers(allUsers);
        console.log(`✅ Loaded ${allUsers.length} users`);
      }
    } catch (error) {
      setNetworkStatus('offline');
      console.error('❌ Error fetching users:', error);
      Alert.alert('Network Error', 'Failed to load users. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };
  const filterUsers = useCallback(() => {
    let filtered = users;

    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        (user.name || '').toLowerCase().includes(query) ||
        (user.email || '').toLowerCase().includes(query) ||
        (user.role || '').toLowerCase().includes(query)
      );
    }

    setFilteredUsers(filtered);
  }, [users, selectedRole, searchQuery]);
  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const handleUserPress = (user: User) => {
    // Navigate to user detail screen
    console.log('User selected:', user.name);
    // navigation.navigate('AdminUserDetail', { userId: user._id });
  };
  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      Alert.alert(
        'Toggle User Status',
        `Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Confirm', 
            onPress: async () => {
              try {                console.log(`🔄 Updating user ${userId} status to ${!currentStatus}`);
                
                // Try multiple approaches for user status update
                let success = false;
                let errorMessage = '';
                
                // Try admin endpoint first
                try {
                  await api.put(`/admin/users/${userId}/status`, {
                    isActive: !currentStatus
                  });
                  success = true;
                } catch (adminError: any) {
                  console.log('Admin endpoint failed, trying alternative approaches...');
                  
                  // Try basic PUT to users endpoint
                  try {
                    await api.put(`/users/${userId}`, {
                      isActive: !currentStatus
                    });
                    success = true;
                  } catch (basicError: any) {
                    console.log('Basic PUT failed, trying PATCH...');
                    
                    // Try PATCH method
                    try {
                      await api.patch(`/users/${userId}`, {
                        isActive: !currentStatus
                      });
                      success = true;
                    } catch (patchError: any) {
                      errorMessage = patchError.response?.data?.message || patchError.message || 'Unknown error';
                      console.error('All API attempts failed:', patchError);
                    }
                  }
                }
                
                if (success) {
                  // Update local state immediately for better UX
                  setUsers(prevUsers => 
                    prevUsers.map(user => 
                      user._id === userId 
                        ? { ...user, isActive: !currentStatus, updatedAt: new Date().toISOString() }
                        : user
                    )
                  );
                    Alert.alert('Success', `User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
                  console.log(`✅ User status updated successfully`);
                } else {
                  // Provide helpful error message for permission issues
                  if (errorMessage.includes('403') || errorMessage.includes('permission') || errorMessage.includes('Forbidden')) {
                    Alert.alert(
                      'Permission Restriction', 
                      'The backend may require specific admin privileges to modify user accounts. This action might not be supported by the current API configuration.',
                      [{ text: 'OK' }]
                    );
                  } else {
                    Alert.alert('API Error', `Update failed: ${errorMessage}`);
                  }
                }
              } catch (apiError: any) {
                console.error('❌ Error updating user status:', apiError);
                const errorMsg = apiError.response?.data?.message || apiError.message || 'Unknown error';
                
                // Provide specific guidance for permission errors
                if (errorMsg.includes('403') || errorMsg.includes('permission') || errorMsg.includes('Forbidden')) {
                  Alert.alert(
                    'Access Restricted', 
                    'User account modifications may be restricted by the backend for security reasons. Please check admin privileges or contact system administrator.',
                    [{ text: 'Understood' }]
                  );
                } else {
                  Alert.alert('Error', `Failed to update user: ${errorMsg}`);
                }
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error toggling user status:', error);
      Alert.alert('Error', 'Failed to update user status');
    }
  };

  const UserItem = ({ item }: { item: User }) => (
    <TouchableOpacity 
      style={styles.userItem}
      onPress={() => handleUserPress(item)}
    >
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <Text style={styles.userName}>{item.name}</Text>          <View style={[styles.statusBadge, { 
            backgroundColor: item.isActive ? '#10b981' : '#ef4444' 
          }]}>
            <Text style={styles.statusText}>
              {item.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.userEmail}>{item.email}</Text>
        
        <View style={styles.userDetails}>
          <View style={[styles.roleBadge, { 
            backgroundColor: getRoleColor(item.role) 
          }]}>
            <Text style={styles.roleText}>{item.role}</Text>
          </View>
          {item.phone && (
            <Text style={styles.userPhone}>📞 {item.phone}</Text>
          )}
        </View>
        
        <Text style={styles.userDate}>
          Joined: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => toggleUserStatus(item._id, item.isActive)}
      >
        <Text style={styles.actionButtonText}>
          {item.isActive ? '🚫' : '✅'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#ef4444';
      case 'landlord': return '#f59e0b';
      case 'food_provider': return '#8b5cf6';
      case 'student': return '#3b82f6';
      default: return '#64748b';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A6572" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Management</Text>
      <Text style={styles.subtitle}>Total Users: {users.length}</Text>

      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search users by name, email, or role..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Role Filter */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by Role:</Text>
        <View style={styles.roleFilters}>
          {roleFilters.map(role => (
            <TouchableOpacity
              key={role}
              style={[
                styles.filterButton,
                selectedRole === role && styles.filterButtonActive
              ]}
              onPress={() => setSelectedRole(role)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedRole === role && styles.filterButtonTextActive
              ]}>
                {role === 'all' ? 'All' : role.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Results Info */}
      <Text style={styles.resultsInfo}>
        Showing {filteredUsers.length} of {users.length} users
      </Text>

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item._id}
        renderItem={UserItem}
        style={styles.usersList}
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
    fontSize: 14,
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
  content: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1e293b',
  },
  clearButton: {
    padding: 4,
  },
  filtersSection: {
    marginBottom: 20,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userMainInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  userCardBody: {
    gap: 12,
  },
  userInfoRow: {
    flexDirection: 'row',
    gap: 16,
  },
  userInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userInfoText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  userCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  joinDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export default AdminUsersScreen;
