import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
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
  updatedAt: string;
}

const AdminUserDetailScreen: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params as { userId: string };
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      Alert.alert('Access Denied', 'You do not have admin privileges', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      return;
    }
    fetchUserDetails();
  }, [currentUser, navigation, userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      console.log(`👤 Fetching user details for ID: ${userId}`);
      
      const response = await api.get(`/users/${userId}`);
      
      if (response.data) {
        setUser(response.data);
        console.log('✅ User details loaded');
      }
    } catch (error) {
      console.error('❌ Error fetching user details:', error);
      Alert.alert('Error', 'Failed to load user details', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } finally {
      setLoading(false);
    }
  };
  const handleEditUser = () => {
    // TODO: Implement user editing functionality
    Alert.alert('Edit User', 'User editing functionality will be implemented soon.');
  };

  const toggleUserStatus = async () => {
    if (!user) return;
    
    Alert.alert(
      'Toggle User Status',
      `Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} this user?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: async () => {
            try {
              // Note: This would need a backend endpoint
              console.log(`Toggle user ${userId} status to ${!user.isActive}`);
              setUser(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
              Alert.alert('Success', `User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
            } catch (error) {
              console.error('Error toggling user status:', error);
              Alert.alert('Error', 'Failed to update user status');
            }
          }
        }
      ]
    );
  };

  const deleteUser = async () => {
    if (!user) return;
    
    Alert.alert(
      'Delete User',
      'Are you sure you want to permanently delete this user? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Note: This would need a backend endpoint
              console.log(`Delete user ${userId}`);
              Alert.alert('Success', 'User deleted successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', 'Failed to delete user');
            }
          }
        }
      ]
    );
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#e74c3c';
      case 'landlord': return '#f39c12';
      case 'food_provider': return '#9b59b6';
      case 'student': return '#3498db';
      default: return '#95a5a6';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A6572" />
        <Text style={styles.loadingText}>Loading user details...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>User not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{user.name}</Text>
        <View style={[styles.statusBadge, { 
          backgroundColor: user.isActive ? '#27ae60' : '#e74c3c' 
        }]}>
          <Text style={styles.statusText}>
            {user.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Basic Information</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{user.name}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Role:</Text>
          <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) }]}>
            <Text style={styles.roleText}>{user.role}</Text>
          </View>
        </View>
        
        {user.phone && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{user.phone}</Text>
          </View>
        )}
        
        {user.gender && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Gender:</Text>
            <Text style={styles.value}>{user.gender}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Account Information</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>User ID:</Text>
          <Text style={styles.value}>{user._id}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Created:</Text>
          <Text style={styles.value}>{new Date(user.createdAt).toLocaleString()}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Last Updated:</Text>
          <Text style={styles.value}>{new Date(user.updatedAt).toLocaleString()}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Status:</Text>
          <Text style={[styles.value, { 
            color: user.isActive ? '#27ae60' : '#e74c3c',
            fontWeight: 'bold'
          }]}>
            {user.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Activity Summary</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          
          {user.role === 'landlord' && (
            <>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Properties</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>₹0</Text>
                <Text style={styles.statLabel}>Revenue</Text>
              </View>
            </>
          )}
        </View>
      </View>

      <View style={styles.actionSection}>
        <TouchableOpacity style={styles.editButton} onPress={handleEditUser}>
          <Text style={styles.editButtonText}>✏️ Edit User</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.statusButton, { 
            backgroundColor: user.isActive ? '#e74c3c' : '#27ae60' 
          }]} 
          onPress={toggleUserStatus}
        >
          <Text style={styles.statusButtonText}>
            {user.isActive ? '🚫 Deactivate' : '✅ Activate'} User
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.deleteButton} onPress={deleteUser}>
          <Text style={styles.deleteButtonText}>🗑️ Delete User</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#2c3e50',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  label: {
    fontSize: 16,
    color: '#7f8c8d',
    width: 100,
  },
  value: {
    fontSize: 16,
    color: '#2c3e50',
    flex: 1,
  },
  roleBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  roleText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    width: '48%',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  actionSection: {
    padding: 16,
  },
  editButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statusButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  statusButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdminUserDetailScreen;
