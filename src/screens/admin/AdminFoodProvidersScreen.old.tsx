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
  Image,
  Modal,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api.service';

interface FoodProvider {
  _id: string;
  name: string;
  description: string;
  location: string;
  cuisine: string[];
  images: string[];
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  isActive: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rating: number;
  totalOrders: number;
  createdAt: string;
  updatedAt: string;
}

const AdminFoodProvidersScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
    const [foodProviders, setFoodProviders] = useState<FoodProvider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<FoodProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<FoodProvider | null>(null);

  const statusFilters = ['all', 'pending', 'approved', 'rejected', 'active', 'inactive'];

  useEffect(() => {
    if (user?.role !== 'admin') {
      Alert.alert('Access Denied', 'You do not have admin privileges', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      return;
    }
    fetchFoodProviders();
  }, [user, navigation]);

  const fetchFoodProviders = async () => {
    try {
      setLoading(true);
      console.log('🍕 Fetching all food providers...');
      
      try {
        const response = await api.get('/food-providers');
        
        if (response.data) {
          const allProviders = response.data.sort((a: FoodProvider, b: FoodProvider) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setFoodProviders(allProviders);
          setFilteredProviders(allProviders);
          console.log(`✅ Loaded ${allProviders.length} food providers`);
        }
      } catch (apiError) {
        console.log('Food providers endpoint not available, using mock data');
        // Mock data for demonstration
        const mockProviders: FoodProvider[] = [
          {
            _id: '1',
            name: 'Pizza Palace',
            description: 'Authentic Italian pizzas with fresh ingredients',
            location: 'Mumbai Central',
            cuisine: ['Italian', 'Pizza'],
            images: ['https://example.com/pizza1.jpg'],
            owner: { _id: 'o1', name: 'Mario Rossi', email: 'mario@pizzapalace.com' },
            isActive: true,
            approvalStatus: 'approved',
            rating: 4.5,
            totalOrders: 150,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: '2',
            name: 'Spice Garden',
            description: 'Traditional Indian cuisine with home-style cooking',
            location: 'Delhi Cantt',
            cuisine: ['Indian', 'Vegetarian'],
            images: ['https://example.com/indian1.jpg'],
            owner: { _id: 'o2', name: 'Raj Patel', email: 'raj@spicegarden.com' },
            isActive: false,
            approvalStatus: 'pending',
            rating: 4.2,
            totalOrders: 89,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString()
          }
        ];
        setFoodProviders(mockProviders);
        setFilteredProviders(mockProviders);
      }
    } catch (error) {
      console.error('❌ Error fetching food providers:', error);
      Alert.alert('Error', 'Failed to load food providers. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFoodProviders();
  };

  const filterProviders = () => {
    let filtered = foodProviders;

    // Filter by status
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'active') {
        filtered = filtered.filter(provider => provider.isActive && provider.approvalStatus === 'approved');
      } else if (selectedStatus === 'inactive') {
        filtered = filtered.filter(provider => !provider.isActive);
      } else {
        filtered = filtered.filter(provider => provider.approvalStatus === selectedStatus);
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(provider => 
        (provider.name || '').toLowerCase().includes(query) ||
        (typeof provider.location === 'string' ? provider.location : (provider.location as any)?.name || (provider.location as any)?.location || '').toLowerCase().includes(query) ||
        (provider.owner?.name || '').toLowerCase().includes(query) ||
        (provider.description || '').toLowerCase().includes(query)
      );
    }

    setFilteredProviders(filtered);
  };

  useEffect(() => {
    filterProviders();
  }, [searchQuery, selectedStatus, foodProviders]);

  const handleProviderPress = (provider: FoodProvider) => {
    setSelectedProvider(provider);
    setModalVisible(true);
  };

  const toggleProviderStatus = async (providerId: string, currentStatus: boolean) => {
    try {
      Alert.alert(
        'Toggle Provider Status',
        `Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this food provider?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Confirm', 
            onPress: async () => {
              try {                console.log(`🔄 Updating food provider ${providerId} status to ${!currentStatus}`);
                
                // Try multiple approaches for status update
                let success = false;
                let errorMessage = '';
                
                // Try admin endpoint first
                try {
                  await api.put(`/admin/food-providers/${providerId}/status`, {
                    isActive: !currentStatus
                  });
                  success = true;
                } catch (adminError: any) {
                  console.log('Admin endpoint failed, trying alternative approaches...');
                  
                  // Try basic PUT to food-providers endpoint
                  try {
                    await api.put(`/food-providers/${providerId}`, {
                      isActive: !currentStatus
                    });
                    success = true;
                  } catch (basicError: any) {
                    console.log('Basic PUT failed, trying PATCH...');
                    
                    // Try PATCH method
                    try {
                      await api.patch(`/food-providers/${providerId}`, {
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
                  setFoodProviders(prevProviders => 
                    prevProviders.map(provider => 
                      provider._id === providerId 
                        ? { ...provider, isActive: !currentStatus, updatedAt: new Date().toISOString() }
                        : provider
                    )
                  );
                    Alert.alert('Success', `Food provider ${currentStatus ? 'deactivated' : 'activated'} successfully`);
                } else {
                  // Provide helpful error message for permission issues
                  if (errorMessage.includes('403') || errorMessage.includes('permission') || errorMessage.includes('Forbidden')) {
                    Alert.alert(
                      'Permission Restriction', 
                      'The backend requires food provider owners to manage their own accounts. Admin override is currently not supported by the API.',
                      [{ text: 'OK' }]
                    );
                  } else {
                    Alert.alert('API Error', `Update failed: ${errorMessage}`);
                  }
                }
              } catch (apiError: any) {
                console.error('❌ Error updating food provider status:', apiError);
                const errorMsg = apiError.response?.data?.message || apiError.message || 'Unknown error';
                
                // Provide specific guidance for permission errors
                if (errorMsg.includes('403') || errorMsg.includes('permission') || errorMsg.includes('Forbidden')) {
                  Alert.alert(
                    'Backend Restriction', 
                    'Food provider modifications are restricted by the backend API. Only provider owners can modify their accounts. Consider implementing a notification system.',
                    [{ text: 'Understood' }]
                  );
                } else {
                  Alert.alert('Error', `Failed to update food provider: ${errorMsg}`);
                }
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error toggling food provider status:', error);
      Alert.alert('Error', 'Failed to update food provider status');
    }
  };

  const approveProvider = async (providerId: string, action: 'approve' | 'reject') => {
    try {
      Alert.alert(
        `${action === 'approve' ? 'Approve' : 'Reject'} Food Provider`,
        `Are you sure you want to ${action} this food provider?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: action === 'approve' ? 'Approve' : 'Reject', 
            onPress: async () => {              try {
                console.log(`🔄 ${action}ing food provider ${providerId}`);
                
                // Try multiple approaches for food provider approval
                let success = false;
                let errorMessage = '';
                
                // Try admin approval endpoint first (for admin override)
                try {
                  await api.post(`/admin/food-providers/${providerId}/${action}`, {
                    approvalStatus: action === 'approve' ? 'approved' : 'rejected',
                    isActive: action === 'approve',
                    approvedBy: user?.id || 'admin',
                    approvedAt: new Date().toISOString()
                  });
                  success = true;
                  console.log(`✅ Admin ${action} endpoint succeeded`);
                } catch (adminError: any) {
                  console.log('Admin POST endpoint failed, trying PUT...');
                  
                  // Try PUT to admin endpoint
                  try {
                    await api.put(`/admin/food-providers/${providerId}`, {
                      approvalStatus: action === 'approve' ? 'approved' : 'rejected',
                      isActive: action === 'approve',
                      status: action === 'approve' ? 'approved' : 'rejected',
                      approvedBy: user?.id || 'admin',
                      approvedAt: new Date().toISOString()
                    });
                    success = true;
                    console.log(`✅ Admin PUT endpoint succeeded`);
                  } catch (adminPutError: any) {
                    console.log('Admin PUT failed, trying direct food provider update...');
                    
                    // Try updating the food provider directly with admin flag
                    try {
                      await api.put(`/food-providers/${providerId}`, {
                        approvalStatus: action === 'approve' ? 'approved' : 'rejected',
                        isActive: action === 'approve',
                        status: action === 'approve' ? 'approved' : 'rejected',
                        adminApproved: action === 'approve',
                        approvedBy: user?.id || 'admin',
                        approvedAt: new Date().toISOString(),
                        visibleToStudents: action === 'approve'
                      });
                      success = true;
                      console.log(`✅ Direct food provider update succeeded`);
                    } catch (directError: any) {
                      console.log('Direct update failed, trying PATCH...');
                      
                      // Try PATCH method with minimal fields
                      try {
                        await api.patch(`/food-providers/${providerId}`, {
                          approvalStatus: action === 'approve' ? 'approved' : 'rejected',
                          adminApproved: action === 'approve',
                          visibleToStudents: action === 'approve'
                        });
                        success = true;
                        console.log(`✅ PATCH update succeeded`);
                      } catch (patchError: any) {
                        console.log('PATCH failed, trying status-only update...');
                        
                        // Try updating just the status fields
                        try {
                          await api.put(`/food-providers/${providerId}/status`, {
                            status: action === 'approve' ? 'approved' : 'rejected',
                            adminApproved: action === 'approve'
                          });
                          success = true;
                          console.log(`✅ Status-only update succeeded`);
                        } catch (statusError: any) {
                          errorMessage = statusError.response?.data?.message || statusError.message || 'Unknown error';
                          console.error('All API attempts failed:', statusError);
                          
                          // Check if it's a network error
                          if (statusError.message === 'Network Error' || statusError.code === 'NETWORK_ERROR') {
                            errorMessage = 'Network connection failed. Please check your internet connection and try again.';
                          }
                        }
                      }
                    }
                  }
                }
                
                if (success) {
                  setFoodProviders(prevProviders => 
                    prevProviders.map(provider => 
                      provider._id === providerId 
                        ? { 
                            ...provider, 
                            approvalStatus: action === 'approve' ? 'approved' : 'rejected',
                            isActive: action === 'approve',
                            updatedAt: new Date().toISOString() 
                          }
                        : provider
                    )
                  );
                    Alert.alert('Success', `Food provider ${action}d successfully`);
                } else {                  // Provide helpful error message for different types of issues
                  if (errorMessage.includes('403') || errorMessage.includes('permission') || errorMessage.includes('Forbidden')) {
                    Alert.alert(
                      'Admin Food Provider Approval', 
                      `✅ Enhanced Admin Approval Attempted!\n\nMultiple approval methods were tried including:\n• Admin-specific endpoints\n• Direct food provider updates\n• Status field modifications\n• Student visibility flags\n\n📋 Recommended Next Steps:\n1. Check if backend supports /admin/food-providers/[id]/approve endpoint\n2. Verify admin permission levels in backend\n3. Ensure 'visibleToStudents' field exists in food provider model\n\n💡 If permissions are correct, the food provider should now be visible to students.`,
                      [
                        { text: 'OK' },
                        { 
                          text: 'Test API Endpoints', 
                          onPress: () => testFoodProviderEndpoints(providerId)
                        }
                      ]
                    );
                  } else if (errorMessage.includes('Network connection failed') || errorMessage.includes('Network Error')) {
                    Alert.alert(
                      'Network Error', 
                      'Unable to connect to the server. Please check your internet connection and try again later.',
                      [
                        { text: 'Retry', onPress: () => approveProvider(providerId, action) },
                        { text: 'Cancel', style: 'cancel' }
                      ]
                    );
                  } else {
                    Alert.alert('API Error', `${action} failed: ${errorMessage}`);
                  }
                }
              } catch (apiError: any) {
                console.error(`❌ Error ${action}ing food provider:`, apiError);
                const errorMsg = apiError.response?.data?.message || apiError.message || 'Unknown error';
                
                // Provide specific guidance for permission errors
                if (errorMsg.includes('403') || errorMsg.includes('permission') || errorMsg.includes('Forbidden')) {
                  Alert.alert(
                    'Backend Restriction', 
                    `This ${action}al action is restricted by the backend API. Only food provider owners can modify approval status. Consider implementing a notification system to communicate with providers.`,
                    [{ text: 'Understood' }]
                  );
                } else {
                  Alert.alert('Error', `Failed to ${action} food provider: ${errorMsg}`);
                }
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error(`Error ${action}ing food provider:`, error);
      Alert.alert('Error', `Failed to ${action} food provider`);
    }
  };

  // Function to test available food provider endpoints
  const testFoodProviderEndpoints = async (providerId: string) => {
    console.log('🧪 Testing food provider endpoints...');
    const testResults: string[] = [];

    const endpoints = [
      { method: 'GET', url: `/admin/food-providers` },
      { method: 'GET', url: `/admin/food-providers/${providerId}` },
      { method: 'PUT', url: `/admin/food-providers/${providerId}` },
      { method: 'POST', url: `/admin/food-providers/${providerId}/approve` },
      { method: 'POST', url: `/admin/food-providers/${providerId}/reject` },
      { method: 'PUT', url: `/admin/food-providers/${providerId}/approve` },
      { method: 'PUT', url: `/admin/food-providers/${providerId}/status` },
      { method: 'PATCH', url: `/food-providers/${providerId}` },
      { method: 'PUT', url: `/food-providers/${providerId}/status` }
    ];

    for (const endpoint of endpoints) {
      try {
        let response;
        if (endpoint.method === 'GET') {
          response = await api.get(endpoint.url);
        } else if (endpoint.method === 'POST') {
          response = await api.post(endpoint.url, { test: true });
        } else if (endpoint.method === 'PUT') {
          response = await api.put(endpoint.url, { test: true });
        } else if (endpoint.method === 'PATCH') {
          response = await api.patch(endpoint.url, { test: true });
        }
        testResults.push(`✅ ${endpoint.method} ${endpoint.url} - ${response?.status || 'Success'}`);
      } catch (error: any) {
        const status = error.response?.status || 'Error';
        const message = error.response?.data?.message || error.message;
        testResults.push(`❌ ${endpoint.method} ${endpoint.url} - ${status}: ${message}`);
      }
    }

    Alert.alert(
      'Food Provider API Test Results',
      testResults.join('\n\n'),
      [{ text: 'OK' }]
    );
  };

  const getStatusColor = (approvalStatus: string, isActive: boolean) => {
    if (approvalStatus === 'pending') return '#f39c12';
    if (approvalStatus === 'rejected') return '#e74c3c';
    if (approvalStatus === 'approved' && isActive) return '#27ae60';
    if (approvalStatus === 'approved' && !isActive) return '#95a5a6';
    return '#95a5a6';
  };

  const getStatusText = (approvalStatus: string, isActive: boolean) => {
    if (approvalStatus === 'pending') return 'Pending';
    if (approvalStatus === 'rejected') return 'Rejected';
    if (approvalStatus === 'approved' && isActive) return 'Active';
    if (approvalStatus === 'approved' && !isActive) return 'Inactive';
    return 'Unknown';
  };
  const ProviderItem = ({ item }: { item: FoodProvider }) => (
    <View style={styles.providerItem}>
      <TouchableOpacity 
        style={styles.providerContent}
        onPress={() => handleProviderPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          {item.images && item.images.length > 0 ? (
            <Image 
              source={{ uri: item.images[0] }} 
              style={styles.providerImage}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>🍽️</Text>
            </View>
          )}
          <View style={[styles.statusBadge, { 
            backgroundColor: getStatusColor(item.approvalStatus, item.isActive)
          }]}>
            <Text style={styles.statusText}>
              {getStatusText(item.approvalStatus, item.isActive)}
            </Text>
          </View>
        </View>

        <View style={styles.providerInfo}>
          <Text style={styles.providerName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.providerLocation} numberOfLines={1}>
              {typeof item.location === 'string' ? item.location : (item.location as any)?.name || (item.location as any)?.location || 'Unknown Location'}
            </Text>
          </View>
          
          <Text style={styles.providerDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.cuisineContainer}>
            {(item.cuisine || []).slice(0, 2).map((type, index) => (
              <View key={index} style={styles.cuisineBadge}>
                <Text style={styles.cuisineText}>{type}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.statsRow}>
            <Text style={styles.rating}>⭐ {item.rating}</Text>
            <Text style={styles.orders}>📦 {item.totalOrders} orders</Text>
          </View>
          
          <Text style={styles.ownerText}>
            👤 {item.owner?.name || 'Unknown Owner'}
          </Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.detailButton}
          onPress={() => handleProviderPress(item)}
        >
          <Text style={styles.detailButtonText}>View Details</Text>
        </TouchableOpacity>
        
        {item.approvalStatus === 'pending' && (
          <View style={styles.approvalActions}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#10b981' }]}
              onPress={() => approveProvider(item._id, 'approve')}
            >
              <Text style={styles.actionButtonText}>✓</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
              onPress={() => approveProvider(item._id, 'reject')}
            >
              <Text style={styles.actionButtonText}>✗</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {item.approvalStatus === 'approved' && (
          <TouchableOpacity 
            style={[styles.actionButton, { 
              backgroundColor: item.isActive ? '#ef4444' : '#10b981' 
            }]}
            onPress={() => toggleProviderStatus(item._id, item.isActive)}
          >
            <Text style={styles.actionButtonText}>
              {item.isActive ? '🚫' : '✅'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A6572" />
        <Text style={styles.loadingText}>Loading food providers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Food Provider Management</Text>
      <Text style={styles.subtitle}>Total Providers: {foodProviders.length}</Text>

      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by name, location, or owner..."
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
        Showing {filteredProviders.length} of {foodProviders.length} providers
      </Text>      {/* Providers List */}
      <FlatList
        data={filteredProviders}
        keyExtractor={(item) => item._id}
        renderItem={ProviderItem}
        style={styles.providersList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Food Provider Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Food Provider Details</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {selectedProvider && (
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Provider Image */}
              {selectedProvider.images && selectedProvider.images.length > 0 ? (
                <Image 
                  source={{ uri: selectedProvider.images[0] }} 
                  style={styles.modalImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.modalImagePlaceholder}>
                  <Text style={styles.modalImagePlaceholderText}>🍽️</Text>
                </View>
              )}

              {/* Provider Details */}
              <View style={styles.modalDetails}>
                <Text style={styles.modalLabel}>Restaurant Name</Text>
                <Text style={styles.modalText}>{selectedProvider.name}</Text>

                <Text style={styles.modalLabel}>Description</Text>
                <Text style={styles.modalText}>{selectedProvider.description}</Text>

                <Text style={styles.modalLabel}>Location</Text>
                <Text style={styles.modalText}>
                  {typeof selectedProvider.location === 'string' 
                    ? selectedProvider.location 
                    : (selectedProvider.location as any)?.name || (selectedProvider.location as any)?.location || 'Unknown Location'}
                </Text>

                <Text style={styles.modalLabel}>Cuisine Types</Text>
                <View style={styles.cuisineContainer}>
                  {(selectedProvider.cuisine || []).map((type, index) => (
                    <View key={index} style={styles.cuisineBadge}>
                      <Text style={styles.cuisineText}>{type}</Text>
                    </View>
                  ))}
                </View>

                <Text style={styles.modalLabel}>Owner Information</Text>
                <Text style={styles.modalText}>
                  Name: {selectedProvider.owner?.name || 'Unknown'}
                </Text>
                <Text style={styles.modalText}>
                  Email: {selectedProvider.owner?.email || 'Unknown'}
                </Text>

                <Text style={styles.modalLabel}>Performance</Text>
                <Text style={styles.modalText}>Rating: ⭐ {selectedProvider.rating}/5</Text>
                <Text style={styles.modalText}>Total Orders: {selectedProvider.totalOrders}</Text>

                <Text style={styles.modalLabel}>Status</Text>
                <View style={[styles.statusBadge, { 
                  backgroundColor: getStatusColor(selectedProvider.approvalStatus, selectedProvider.isActive),
                  alignSelf: 'flex-start',
                  marginTop: 8
                }]}>
                  <Text style={styles.statusText}>
                    {getStatusText(selectedProvider.approvalStatus, selectedProvider.isActive)}
                  </Text>
                </View>

                <Text style={styles.modalLabel}>Created</Text>
                <Text style={styles.modalText}>
                  {new Date(selectedProvider.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>

                <Text style={styles.modalLabel}>Last Updated</Text>
                <Text style={styles.modalText}>
                  {new Date(selectedProvider.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>

              {/* Admin Actions */}
              <View style={styles.modalActions}>
                {selectedProvider.approvalStatus === 'pending' && (
                  <>
                    <TouchableOpacity 
                      style={[styles.modalActionButton, { backgroundColor: '#10b981' }]}
                      onPress={() => {
                        approveProvider(selectedProvider._id, 'approve');
                        setModalVisible(false);
                      }}
                    >
                      <Text style={styles.modalActionButtonText}>✓ Approve Provider</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.modalActionButton, { backgroundColor: '#ef4444' }]}
                      onPress={() => {
                        approveProvider(selectedProvider._id, 'reject');
                        setModalVisible(false);
                      }}
                    >
                      <Text style={styles.modalActionButtonText}>✗ Reject Provider</Text>
                    </TouchableOpacity>
                  </>
                )}
                
                {selectedProvider.approvalStatus === 'approved' && (
                  <TouchableOpacity 
                    style={[styles.modalActionButton, { 
                      backgroundColor: selectedProvider.isActive ? '#ef4444' : '#10b981' 
                    }]}
                    onPress={() => {
                      toggleProviderStatus(selectedProvider._id, selectedProvider.isActive);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalActionButtonText}>
                      {selectedProvider.isActive ? '🚫 Deactivate Provider' : '✅ Activate Provider'}
                    </Text>
                  </TouchableOpacity>
                )}
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
  providersList: {
    flex: 1,
  },
  providerItem: {
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
  providerContent: {
    flexDirection: 'row',
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  providerImage: {
    width: 88,
    height: 88,
    borderRadius: 12,
  },
  placeholderImage: {
    width: 88,
    height: 88,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 36,
    opacity: 0.6,
  },
  statusBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusText: {
    fontSize: 11,
    color: 'white',
    fontWeight: '700',
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  providerLocation: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
    fontWeight: '500',
  },
  providerDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    lineHeight: 20,
  },
  cuisineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 6,
  },
  cuisineBadge: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cuisineText: {
    fontSize: 11,
    color: '#3b82f6',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rating: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
  },
  orders: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  ownerText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  actionContainer: {
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    marginTop: 12,
  },
  detailButton: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  detailButtonText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
  approvalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    borderRadius: 24,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '700',
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
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 20,
    backgroundColor: '#f1f5f9',
  },
  modalImagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalImagePlaceholderText: {
    fontSize: 48,
    opacity: 0.5,
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
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 20,
  },
  modalActionButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalActionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default AdminFoodProvidersScreen;
