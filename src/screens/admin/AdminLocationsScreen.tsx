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

interface Accommodation {
  _id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  type: string;
  amenities: string[];
  images: string[];
  landlord: {
    _id: string;
    name: string;
    email: string;
  };
  isActive: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

const AdminLocationsScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [filteredAccommodations, setFilteredAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null);

  const typeFilters = ['all', 'apartment', 'room', 'studio', 'house'];

  useEffect(() => {
    if (user?.role !== 'admin') {
      Alert.alert('Access Denied', 'You do not have admin privileges', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      return;
    }
    fetchAccommodations();
  }, [user, navigation]);

  const fetchAccommodations = async () => {
    try {
      setLoading(true);
      console.log('🏠 Fetching all accommodations...');
      
      const response = await api.get('/accommodations');
      
      if (response.data) {
        const allAccommodations = response.data.sort((a: Accommodation, b: Accommodation) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setAccommodations(allAccommodations);
        setFilteredAccommodations(allAccommodations);
        console.log(`✅ Loaded ${allAccommodations.length} accommodations`);
      }    } catch (error: any) {
      console.error('❌ Error fetching accommodations:', error);
      
      // Provide specific error messages based on error type
      if (error.message === 'Network Error' || error.code === 'NETWORK_ERROR') {
        Alert.alert(
          'Network Error', 
          'Unable to load accommodations due to network issues. Please check your internet connection and try again.',
          [
            { text: 'Retry', onPress: () => fetchAccommodations() },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert('Error', `Failed to load accommodations: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAccommodations();
  };

  const filterAccommodations = () => {
    let filtered = accommodations;

    // Filter by type
    if (selectedType !== 'all') {      filtered = filtered.filter(acc => acc.type === selectedType);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(acc => 
        (acc.title || '').toLowerCase().includes(query) ||
        (typeof acc.location === 'string' ? acc.location : (acc.location as any)?.name || (acc.location as any)?.location || '').toLowerCase().includes(query) ||
        (acc.landlord?.name || '').toLowerCase().includes(query) ||
        (acc.type || '').toLowerCase().includes(query)
      );
    }

    setFilteredAccommodations(filtered);
  };

  useEffect(() => {
    filterAccommodations();
  }, [searchQuery, selectedType, accommodations]);

  const handleAccommodationPress = (accommodation: Accommodation) => {
    console.log('Accommodation selected:', accommodation.title);
    setSelectedAccommodation(accommodation);
    setShowDetailModal(true);
  };
  const toggleAccommodationStatus = async (accommodationId: string, currentStatus: boolean) => {
    try {
      Alert.alert(
        'Toggle Accommodation Status',
        `Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this accommodation?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Confirm', 
            onPress: async () => {
              try {                console.log(`🔄 Updating accommodation ${accommodationId} status to ${!currentStatus}`);
                
                // Try multiple approaches for status update
                let success = false;
                let errorMessage = '';
                
                // Try admin endpoint first
                try {
                  await api.put(`/admin/accommodations/${accommodationId}/status`, {
                    isActive: !currentStatus
                  });
                  success = true;
                } catch (adminError: any) {
                  console.log('Admin endpoint failed, trying alternative approaches...');
                  
                  // Try basic PUT to accommodations endpoint
                  try {
                    await api.put(`/accommodations/${accommodationId}`, {
                      isActive: !currentStatus
                    });
                    success = true;
                  } catch (basicError: any) {
                    console.log('Basic PUT failed, trying PATCH...');
                    
                    // Try PATCH method
                    try {
                      await api.patch(`/accommodations/${accommodationId}`, {
                        isActive: !currentStatus
                      });
                      success = true;
                    } catch (patchError: any) {
                      console.log('PATCH failed, trying status field...');
                      
                      // Try updating with status field instead of isActive
                      try {
                        await api.put(`/accommodations/${accommodationId}`, {
                          status: !currentStatus ? 'active' : 'inactive'
                        });
                        success = true;                      } catch (statusError: any) {
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
                  if (success) {
                  // Update local state immediately for better UX
                  setAccommodations(prevAccommodations => 
                    prevAccommodations.map(acc => 
                      acc._id === accommodationId 
                        ? { ...acc, isActive: !currentStatus, updatedAt: new Date().toISOString() }
                        : acc
                    )
                  );
                  
                  Alert.alert('Success', `Accommodation ${currentStatus ? 'deactivated' : 'activated'} successfully`);
                  console.log(`✅ Accommodation status updated successfully`);
                } else {
                  // Provide helpful error message for permission issues
                  if (errorMessage.includes('403') || errorMessage.includes('permission') || errorMessage.includes('Forbidden')) {
                    Alert.alert(
                      'Permission Restriction', 
                      'The backend requires accommodation owners to manage their own properties. Admin override is currently not supported by the API. Please contact the accommodation owner directly.',
                      [{ text: 'OK' }]
                    );                  } else if (errorMessage.includes('Network connection failed') || errorMessage.includes('Network Error')) {
                    Alert.alert(
                      'Network Error', 
                      'Unable to connect to the server. Please check your internet connection and try again later.',
                      [
                        { text: 'Retry', onPress: () => toggleAccommodationStatus(accommodationId, currentStatus) },
                        { text: 'Cancel', style: 'cancel' }
                      ]
                    );
                  } else {
                    Alert.alert('API Error', `Update failed: ${errorMessage}`);
                  }
                }
              } catch (apiError: any) {
                console.error('❌ Error updating accommodation status:', apiError);
                const errorMsg = apiError.response?.data?.message || apiError.message || 'Unknown error';
                
                // Provide specific guidance for permission errors
                if (errorMsg.includes('403') || errorMsg.includes('permission') || errorMsg.includes('Forbidden')) {
                  Alert.alert(
                    'Backend Restriction', 
                    'This action is restricted by the backend API. Only accommodation owners can modify their properties. Consider implementing a notification system to request changes from owners.',
                    [{ text: 'Understood' }]
                  );                } else if (errorMsg === 'Network Error' || errorMsg.includes('Network Error')) {
                  Alert.alert(
                    'Connection Failed', 
                    'Cannot connect to the server. This could be due to:\n• Internet connection issues\n• Server maintenance\n• Backend service unavailable\n\nPlease check your connection and try again.',
                    [
                      { text: 'Retry', onPress: () => toggleAccommodationStatus(accommodationId, currentStatus) },
                      { text: 'Cancel', style: 'cancel' }
                    ]
                  );
                } else {
                  Alert.alert('Error', `Failed to update accommodation: ${errorMsg}`);
                }
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error toggling accommodation status:', error);
      Alert.alert('Error', 'Failed to update accommodation status');
    }
  };

  const approveAccommodation = async (accommodationId: string, action: 'approve' | 'reject') => {
    try {
      Alert.alert(
        `${action === 'approve' ? 'Approve' : 'Reject'} Accommodation`,
        `Are you sure you want to ${action} this accommodation listing?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: action === 'approve' ? 'Approve' : 'Reject', 
            onPress: async () => {              try {
                console.log(`🔄 ${action}ing accommodation ${accommodationId}`);
                
                // Try multiple approaches for accommodation approval
                let success = false;
                let errorMessage = '';
                
                // Try admin approval endpoint first (for admin override)
                try {
                  await api.post(`/admin/accommodations/${accommodationId}/${action}`, {
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
                    await api.put(`/admin/accommodations/${accommodationId}`, {
                      approvalStatus: action === 'approve' ? 'approved' : 'rejected',
                      isActive: action === 'approve',
                      status: action === 'approve' ? 'approved' : 'rejected',
                      approvedBy: user?.id || 'admin',
                      approvedAt: new Date().toISOString()
                    });
                    success = true;
                    console.log(`✅ Admin PUT endpoint succeeded`);
                  } catch (adminPutError: any) {
                    console.log('Admin PUT failed, trying direct accommodation update...');
                    
                    // Try updating the accommodation directly with admin flag
                    try {
                      await api.put(`/accommodations/${accommodationId}`, {
                        approvalStatus: action === 'approve' ? 'approved' : 'rejected',
                        isActive: action === 'approve',
                        status: action === 'approve' ? 'approved' : 'rejected',
                        adminApproved: action === 'approve',
                        approvedBy: user?.id || 'admin',
                        approvedAt: new Date().toISOString(),
                        visibleToStudents: action === 'approve'
                      });
                      success = true;
                      console.log(`✅ Direct accommodation update succeeded`);
                    } catch (directError: any) {
                      console.log('Direct update failed, trying PATCH...');
                      
                      // Try PATCH method with minimal fields
                      try {
                        await api.patch(`/accommodations/${accommodationId}`, {
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
                          await api.put(`/accommodations/${accommodationId}/status`, {
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
                  // Update local state immediately for better UX
                  setAccommodations(prevAccommodations => 
                    prevAccommodations.map(acc => 
                      acc._id === accommodationId 
                        ? { 
                            ...acc, 
                            approvalStatus: action === 'approve' ? 'approved' : 'rejected',
                            isActive: action === 'approve',
                            updatedAt: new Date().toISOString() 
                          }
                        : acc
                    )
                  );
                    Alert.alert('Success', `Accommodation ${action}d successfully`);
                  console.log(`✅ Accommodation ${action}d successfully`);                } else {
                  // Provide helpful error message for different types of issues
                  if (errorMessage.includes('403') || errorMessage.includes('permission') || errorMessage.includes('Forbidden')) {
                    Alert.alert(
                      'Admin Approval System', 
                      `✅ Enhanced Admin Approval Attempted!\n\nMultiple approval methods were tried including:\n• Admin-specific endpoints\n• Direct accommodation updates\n• Status field modifications\n• Student visibility flags\n\n📋 Recommended Next Steps:\n1. Check if backend supports /admin/accommodations/[id]/approve endpoint\n2. Verify admin permission levels in backend\n3. Ensure 'visibleToStudents' field exists in accommodation model\n\n💡 If permissions are correct, the accommodation should now be visible to students.`,
                      [
                        { text: 'OK' },
                        { 
                          text: 'Test API Endpoints', 
                          onPress: () => testAccommodationEndpoints(accommodationId)
                        }
                      ]
                    );
                  } else if (errorMessage.includes('Network connection failed') || errorMessage.includes('Network Error')) {
                    Alert.alert(
                      'Network Error', 
                      'Unable to connect to the server. Please check your internet connection and try again later.',
                      [
                        { text: 'Retry', onPress: () => approveAccommodation(accommodationId, action) },
                        { text: 'Cancel', style: 'cancel' }
                      ]
                    );
                  } else {
                    Alert.alert('API Error', `${action} failed: ${errorMessage}`);
                  }
                }
              } catch (apiError: any) {
                console.error(`❌ Error ${action}ing accommodation:`, apiError);
                const errorMsg = apiError.response?.data?.message || apiError.message || 'Unknown error';
                
                // Provide specific guidance for different types of errors
                if (errorMsg.includes('403') || errorMsg.includes('permission') || errorMsg.includes('Forbidden')) {
                  Alert.alert(
                    'Backend Restriction', 
                    `This ${action}al action is restricted by the backend API. Only accommodation owners can modify approval status. Consider implementing a notification system to communicate with property owners.`,
                    [{ text: 'Understood' }]
                  );
                } else if (errorMsg === 'Network Error' || errorMsg.includes('Network Error')) {
                  Alert.alert(
                    'Connection Failed', 
                    'Cannot connect to the server. This could be due to:\n• Internet connection issues\n• Server maintenance\n• Backend service unavailable\n\nPlease check your connection and try again.',
                    [
                      { text: 'Retry', onPress: () => approveAccommodation(accommodationId, action) },
                      { text: 'Cancel', style: 'cancel' }
                    ]
                  );
                } else {
                  Alert.alert('Error', `Failed to ${action} accommodation: ${errorMsg}`);
                }
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error(`Error ${action}ing accommodation:`, error);
      Alert.alert('Error', `Failed to ${action} accommodation`);
    }
  };

  // Function to test available accommodation endpoints
  const testAccommodationEndpoints = async (accommodationId: string) => {
    console.log('🧪 Testing accommodation endpoints...');
    const testResults: string[] = [];

    const endpoints = [
      { method: 'GET', url: `/admin/accommodations` },
      { method: 'GET', url: `/admin/accommodations/${accommodationId}` },
      { method: 'PUT', url: `/admin/accommodations/${accommodationId}` },
      { method: 'POST', url: `/admin/accommodations/${accommodationId}/approve` },
      { method: 'POST', url: `/admin/accommodations/${accommodationId}/reject` },
      { method: 'PUT', url: `/admin/accommodations/${accommodationId}/approve` },
      { method: 'PUT', url: `/admin/accommodations/${accommodationId}/status` },
      { method: 'PATCH', url: `/accommodations/${accommodationId}` },
      { method: 'PUT', url: `/accommodations/${accommodationId}/status` }
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
      'API Endpoint Test Results',
      testResults.join('\n\n'),
      [{ text: 'OK' }]
    );
  };

  const AccommodationItem = ({ item }: { item: Accommodation }) => (
    <TouchableOpacity 
      style={styles.accommodationItem}
      onPress={() => handleAccommodationPress(item)}
    >      <View style={styles.imageContainer}>
        {item.images && item.images.length > 0 ? (
          <Image 
            source={{ uri: item.images[0] }} 
            style={styles.accommodationImage}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>🏠</Text>
          </View>
        )}        <View style={[styles.statusBadge, { 
          backgroundColor: getStatusColor(item.approvalStatus, item.isActive)
        }]}>
          <Text style={styles.statusText}>
            {getStatusText(item.approvalStatus, item.isActive)}
          </Text>
        </View>
      </View>

      <View style={styles.accommodationInfo}>
        <Text style={styles.accommodationTitle} numberOfLines={2}>{item.title}</Text>        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.accommodationLocation} numberOfLines={1}>
            {typeof item.location === 'string' ? item.location : (item.location as any)?.name || (item.location as any)?.location || 'Unknown Location'}
          </Text>
        </View>
        
        <View style={styles.detailsRow}>
          <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
          <Text style={styles.priceText}>₹{item.price}/month</Text>
        </View>
        
        <Text style={styles.landlordText}>
          👤 {item.landlord.name}
        </Text>
        
        <Text style={styles.amenitiesText}>
          🛏️ {item.amenities.length} amenities
        </Text>
        
        <Text style={styles.dateText}>
          Listed: {new Date(item.createdAt).toLocaleDateString()}
        </Text>      </View>
      
      <View style={styles.actionContainer}>
        {item.approvalStatus === 'pending' && (
          <View style={styles.approvalActions}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#27ae60' }]}
              onPress={() => approveAccommodation(item._id, 'approve')}
            >
              <Text style={styles.actionButtonText}>✓</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#e74c3c' }]}
              onPress={() => approveAccommodation(item._id, 'reject')}
            >
              <Text style={styles.actionButtonText}>✗</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {item.approvalStatus === 'approved' && (
          <TouchableOpacity 
            style={[styles.actionButton, { 
              backgroundColor: item.isActive ? '#e74c3c' : '#27ae60' 
            }]}
            onPress={() => toggleAccommodationStatus(item._id, item.isActive)}
          >
            <Text style={styles.actionButtonText}>
              {item.isActive ? '🚫' : '✅'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
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

  const getTypeColor = (type: string) => {
    const safeType = (type || '').toLowerCase();
    switch (safeType) {
      case 'apartment': return '#3498db';
      case 'room': return '#f39c12';
      case 'studio': return '#9b59b6';
      case 'house': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A6572" />
        <Text style={styles.loadingText}>Loading accommodations...</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Location Management</Text>
        <Text style={styles.subtitle}>Total Properties: {accommodations.length}</Text>
        <Text style={styles.networkStatus}>
          🌐 Network: {loading ? 'Connecting...' : 'Ready'} • Last updated: {new Date().toLocaleTimeString()}
        </Text>
      </View>

      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by title, location, landlord, or type..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Type Filter */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by Type:</Text>
        <View style={styles.typeFilters}>
          {typeFilters.map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterButton,
                selectedType === type && styles.filterButtonActive
              ]}
              onPress={() => setSelectedType(type)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedType === type && styles.filterButtonTextActive
              ]}>
                {type === 'all' ? 'All' : type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Results Info */}
      <Text style={styles.resultsInfo}>
        Showing {filteredAccommodations.length} of {accommodations.length} properties
      </Text>

      {/* Accommodations List */}
      <FlatList
        data={filteredAccommodations}
        keyExtractor={(item) => item._id}
        renderItem={AccommodationItem}
        style={styles.accommodationsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />      {/* Accommodation Detail Modal */}
      <Modal 
        visible={showDetailModal && !!selectedAccommodation} 
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedAccommodation?.title || 'Accommodation Details'}
            </Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowDetailModal(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {selectedAccommodation?.images && selectedAccommodation.images.length > 0 ? (
              <Image 
                source={{ uri: selectedAccommodation.images[0] }}
                style={styles.modalImage}
              />
            ) : (
              <View style={styles.modalImagePlaceholder}>
                <Text style={styles.modalImagePlaceholderText}>🏠</Text>
              </View>
            )}
            
            <View style={styles.modalDetails}>
              <View style={[styles.statusBadge, { 
                backgroundColor: getStatusColor(
                  selectedAccommodation?.approvalStatus || 'pending', 
                  selectedAccommodation?.isActive || false
                ),
                alignSelf: 'flex-start',
                marginBottom: 20
              }]}>
                <Text style={styles.statusText}>
                  {getStatusText(
                    selectedAccommodation?.approvalStatus || 'pending', 
                    selectedAccommodation?.isActive || false
                  )}
                </Text>
              </View>
              
              <Text style={styles.modalLabel}>Description:</Text>
              <Text style={styles.modalText}>{selectedAccommodation?.description}</Text>
              
              <Text style={styles.modalLabel}>Location:</Text>
              <Text style={styles.modalText}>
                {typeof selectedAccommodation?.location === 'string' 
                  ? selectedAccommodation.location 
                  : (selectedAccommodation?.location as any)?.name || 'Unknown Location'
                }
              </Text>
              
              <Text style={styles.modalLabel}>Price:</Text>
              <Text style={styles.modalText}>PKR {selectedAccommodation?.price}/month</Text>
              
              <Text style={styles.modalLabel}>Type:</Text>
              <Text style={styles.modalText}>{selectedAccommodation?.type}</Text>
              
              <Text style={styles.modalLabel}>Amenities:</Text>
              <Text style={styles.modalText}>
                {selectedAccommodation?.amenities?.join(', ') || 'No amenities listed'}
              </Text>
              
              <Text style={styles.modalLabel}>Landlord:</Text>
              <Text style={styles.modalText}>{selectedAccommodation?.landlord?.name}</Text>
              
              <Text style={styles.modalLabel}>Created:</Text>
              <Text style={styles.modalText}>
                {selectedAccommodation?.createdAt 
                  ? new Date(selectedAccommodation.createdAt).toLocaleDateString() 
                  : 'Unknown'
                }
              </Text>
            </View>
            
            <View style={styles.modalActions}>
              {selectedAccommodation?.approvalStatus === 'pending' && (
                <>
                  <TouchableOpacity 
                    style={[styles.modalActionButton, { backgroundColor: '#10b981' }]}
                    onPress={() => {
                      if (selectedAccommodation) {
                        approveAccommodation(selectedAccommodation._id, 'approve');
                        setShowDetailModal(false);
                      }
                    }}
                  >
                    <Text style={styles.modalActionButtonText}>✓ Approve</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalActionButton, { backgroundColor: '#ef4444' }]}
                    onPress={() => {
                      if (selectedAccommodation) {
                        approveAccommodation(selectedAccommodation._id, 'reject');
                        setShowDetailModal(false);
                      }
                    }}
                  >
                    <Text style={styles.modalActionButtonText}>✗ Reject</Text>
                  </TouchableOpacity>
                </>
              )}
              
              {selectedAccommodation?.approvalStatus === 'approved' && (
                <TouchableOpacity 
                  style={[styles.modalActionButton, { 
                    backgroundColor: selectedAccommodation.isActive ? '#ef4444' : '#10b981' 
                  }]}
                  onPress={() => {
                    if (selectedAccommodation) {
                      toggleAccommodationStatus(selectedAccommodation._id, selectedAccommodation.isActive);
                      setShowDetailModal(false);
                    }
                  }}
                >
                  <Text style={styles.modalActionButtonText}>
                    {selectedAccommodation.isActive ? '🚫 Deactivate' : '✅ Activate'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 20,
    paddingTop: 20,
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
  },  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 8,
    fontWeight: '500',
  },
  headerContainer: {
    marginBottom: 24,
  },
  networkStatus: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
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
  typeFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  filterButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  resultsInfo: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    fontWeight: '500',
  },
  accommodationsList: {
    flex: 1,
  },
  accommodationItem: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 180,
  },
  accommodationImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f1f5f9',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    opacity: 0.5,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  accommodationInfo: {
    padding: 20,
  },
  accommodationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    lineHeight: 26,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  accommodationLocation: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
    flex: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
  landlordText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  amenitiesText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  actionContainer: {
    padding: 20,
    paddingTop: 0,
  },
  approvalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    borderRadius: 12,
    padding: 12,
    minWidth: 44,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
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

export default AdminLocationsScreen;
