import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api.service';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  gender?: string;
}

interface UserRole {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const userRoles: UserRole[] = [
  { key: 'all', label: 'All Users', icon: 'people', color: '#6366f1' },
  { key: 'student', label: 'Students', icon: 'school', color: '#10b981' },
  { key: 'landlord', label: 'Landlords', icon: 'business', color: '#f59e0b' },
  { key: 'food_provider', label: 'Food Providers', icon: 'restaurant', color: '#ef4444' },
  { key: 'admin', label: 'Admins', icon: 'shield-checkmark', color: '#8b5cf6' },
];

const AdminUsersScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'loading'>('loading');

  const fetchUsers = useCallback(async () => {
    try {
      setNetworkStatus('loading');
      console.log('📋 Fetching all users...');
      
      const response = await api.get('/users');
      
      if (response.data) {
        const allUsers = response.data.sort((a: User, b: User) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setUsers(allUsers);
        setFilteredUsers(allUsers);
        setNetworkStatus('online');
        console.log(`✅ Loaded ${allUsers.length} users`);
      } else {
        throw new Error('No data received');
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      setNetworkStatus('offline');
      Alert.alert('Network Error', 'Failed to load users. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role !== 'admin') {
      Alert.alert('Access Denied', 'You do not have admin privileges', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      return;
    }
    fetchUsers();
  }, [user, navigation, fetchUsers]);

  useEffect(() => {
    let filtered = users;

    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.phone && user.phone.includes(query))
      );
    }

    setFilteredUsers(filtered);
  }, [users, selectedRole, searchQuery]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers();
  }, [fetchUsers]);
  const handleUserAction = async (userId: string, action: 'activate' | 'deactivate') => {
    try {
      const endpoint = action === 'activate' ? `/users/${userId}/activate` : `/users/${userId}/deactivate`;
      const response = await api.put(endpoint);
      
      if (response.data && response.status === 200) {
        Alert.alert('Success', `User ${action}d successfully`);
        fetchUsers();
      } else {
        throw new Error(`Failed to ${action} user`);
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      Alert.alert('Error', `Failed to ${action} user. Please try again.`);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? '#10b981' : '#ef4444';
  };

  const getRoleColor = (role: string) => {
    const roleConfig = userRoles.find(r => r.key === role);
    return roleConfig?.color || '#6b7280';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUserInitials = (name: string) => {
    const words = name.split(' ');
    if (words.length >= 2) {
      return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const UserCard = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      {/* Header */}
      <View style={styles.userCardHeader}>
        <View style={[styles.userAvatar, { backgroundColor: getRoleColor(item.role) }]}>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
            {getUserInitials(item.name)}
          </Text>
        </View>
        <View style={styles.userMainInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.isActive) }]}>
          <Text style={styles.statusText}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.userCardBody}>
        <View style={styles.userInfoRow}>
          <View style={styles.userInfoItem}>
            <Ionicons name="briefcase" size={16} color="#64748b" />
            <Text style={styles.userInfoText}>{item.role.replace('_', ' ')}</Text>
          </View>
          {item.phone && (
            <View style={styles.userInfoItem}>
              <Ionicons name="call" size={16} color="#64748b" />
              <Text style={styles.userInfoText}>{item.phone}</Text>
            </View>
          )}
        </View>
        {item.gender && (
          <View style={styles.userInfoRow}>
            <View style={styles.userInfoItem}>
              <Ionicons name="person" size={16} color="#64748b" />
              <Text style={styles.userInfoText}>{item.gender}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.userCardFooter}>
        <Text style={styles.joinDate}>
          Joined {formatDate(item.createdAt)}
        </Text>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: item.isActive ? '#fee2e2' : '#dcfce7' }
          ]}
          onPress={() => handleUserAction(item._id, item.isActive ? 'deactivate' : 'activate')}
        >
          <Ionicons 
            name={item.isActive ? "pause" : "play"} 
            size={12} 
            color={item.isActive ? '#dc2626' : '#16a34a'} 
          />
          <Text style={[
            styles.actionButtonText,
            { color: item.isActive ? '#dc2626' : '#16a34a' }
          ]}>
            {item.isActive ? 'Deactivate' : 'Activate'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingTitle}>Loading Users</Text>
          <Text style={styles.loadingText}>Fetching user data...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>User Management</Text>
            <Text style={styles.headerSubtitle}>
              {filteredUsers.length} of {users.length} users
            </Text>
          </View>
          <View style={styles.networkIndicator}>
            <View 
              style={[
                styles.networkDot, 
                { backgroundColor: networkStatus === 'online' ? '#10b981' : '#ef4444' }
              ]} 
            />
            <Text style={styles.networkText}>
              {networkStatus === 'loading' ? 'Syncing...' : networkStatus}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#64748b" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94a3b8"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <View style={styles.filtersSection}>
          <Text style={styles.filtersTitle}>Filter by Role</Text>
          <View style={styles.filtersContainer}>
            {userRoles.map((role) => (
              <TouchableOpacity
                key={role.key}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: selectedRole === role.key ? role.color : '#f1f5f9',
                    borderWidth: 1,
                    borderColor: selectedRole === role.key ? role.color : '#e2e8f0',
                  }
                ]}
                onPress={() => setSelectedRole(role.key)}
              >
                <Ionicons 
                  name={role.icon} 
                  size={16} 
                  color={selectedRole === role.key ? 'white' : '#64748b'} 
                />
                <Text style={[
                  styles.filterChipText,
                  { color: selectedRole === role.key ? 'white' : '#64748b' }
                ]}>
                  {role.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Users List */}
        {filteredUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people" size={64} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No Users Found</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Try adjusting your search' : 'No users match the selected filters'}
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            showsVerticalScrollIndicator={false}
          >
            {filteredUsers.map((user) => (
              <UserCard key={user._id} item={user} />
            ))}
          </ScrollView>
        )}
      </View>
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
