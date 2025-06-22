import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api, { adminAPI } from '../../services/api.service';

interface FoodProvider {
  _id: string;
  name: string;
  description: string;
  location: string | { name?: string; location?: string; _id?: string; country?: string };
  cuisine: string[];
  images: string[];
  owner?: {
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

interface StatusFilter {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const statusFilters: StatusFilter[] = [
  { key: 'all', label: 'All', icon: 'restaurant', color: '#6366f1' },
  { key: 'pending', label: 'Pending', icon: 'time', color: '#f59e0b' },
  { key: 'approved', label: 'Approved', icon: 'checkmark-circle', color: '#10b981' },
  { key: 'rejected', label: 'Rejected', icon: 'close-circle', color: '#ef4444' },
  { key: 'active', label: 'Active', icon: 'flash', color: '#10b981' },
  { key: 'inactive', label: 'Inactive', icon: 'pause-circle', color: '#6b7280' },
];

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
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'loading'>('loading');

  useEffect(() => {
    if (user?.role !== 'admin') {
      Alert.alert('Access Denied', 'You do not have admin privileges', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      return;
    }
    fetchFoodProviders();
  }, [user, navigation]);

  useEffect(() => {
    filterProviders();
  }, [foodProviders, selectedStatus, searchQuery]);

  const fetchFoodProviders = async () => {
    try {
      setNetworkStatus('loading');
      console.log('🍕 Fetching all food providers...');
      
      try {
        const response = await api.get('/food-providers');
        
        if (response.data) {
          const allProviders = response.data.sort((a: FoodProvider, b: FoodProvider) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setFoodProviders(allProviders);
          setFilteredProviders(allProviders);
          setNetworkStatus('online');
          console.log(`✅ Loaded ${allProviders.length} food providers`);
        }
      } catch (apiError) {
        console.log('Food providers endpoint not available, using mock data');
        setNetworkStatus('offline');
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
          },
          {
            _id: '3',
            name: 'Burger Junction',
            description: 'American-style burgers and fries',
            location: 'Bangalore HSR Layout',
            cuisine: ['American', 'Fast Food'],
            images: ['https://example.com/burger1.jpg'],
            owner: { _id: 'o3', name: 'John Doe', email: 'john@burgerjunction.com' },
            isActive: true,
            approvalStatus: 'rejected',
            rating: 3.8,
            totalOrders: 45,
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            updatedAt: new Date(Date.now() - 172800000).toISOString()
          }
        ];
        setFoodProviders(mockProviders);
        setFilteredProviders(mockProviders);
      }
    } catch (error) {
      console.error('❌ Error fetching food providers:', error);
      setNetworkStatus('offline');
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
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(provider => 
        (provider.name || '').toLowerCase().includes(query) ||
        (typeof provider.location === 'string' ? provider.location : '').toLowerCase().includes(query) ||
        (provider.cuisine || []).some(c => c.toLowerCase().includes(query)) ||
        (provider.owner?.name || '').toLowerCase().includes(query)
      );
    }

    setFilteredProviders(filtered);
  };  // Handle food provider actions (approve, reject, activate, deactivate)
  // Note: These endpoints are not yet implemented in the backend API
  // The backend currently only supports reading food provider data
  // TODO: Remove this comment when backend implements the action endpoints
  const handleProviderAction = async (providerId: string, action: 'approve' | 'reject' | 'activate' | 'deactivate') => {
    try {
      console.log(`Attempting to ${action} food provider ${providerId}...`);
      
      let message = '';

      // Note: These API calls will currently fail with 404 errors
      // This is a placeholder for when the backend implements these features
      switch (action) {
        case 'approve':
          await adminAPI.approveFoodProvider(providerId, 'approved', true);
          message = 'Food provider approved successfully';
          break;
        case 'reject':
          await adminAPI.approveFoodProvider(providerId, 'rejected', false);
          message = 'Food provider rejected successfully';
          break;
        case 'activate':
          await adminAPI.updateFoodProviderStatus(providerId, true);
          message = 'Food provider activated successfully';
          break;
        case 'deactivate':
          await adminAPI.updateFoodProviderStatus(providerId, false);
          message = 'Food provider deactivated successfully';
          break;
      }

      Alert.alert('Success', message);
      await fetchFoodProviders(); // Refresh the list
        } catch (error: any) {
      console.error(`Error ${action}ing food provider:`, error);
        // More specific error handling
      if (error?.response?.status === 404) {
        Alert.alert(
          'Feature Not Available', 
          `The ${action} food provider feature is not yet implemented in the backend. The food provider management endpoints are currently being developed.`,
          [
            { text: 'OK', style: 'default' },
            { 
              text: 'View Details', 
              onPress: () => {
                // Show the provider details instead
                const provider = foodProviders.find(p => p._id === providerId);
                if (provider) {
                  setSelectedProvider(provider);
                  setModalVisible(true);
                }
              }
            }
          ]
        );
      } else if (error?.response?.status === 401) {
        Alert.alert('Authentication Error', 'Your session has expired. Please log in again.');
      } else if (error?.response?.status === 403) {
        Alert.alert('Access Denied', 'You do not have permission to perform this action.');
      } else if (error?.request) {
        Alert.alert('Network Error', 'Please check your internet connection and try again.');
      } else {
        Alert.alert('Error', `An unexpected error occurred while trying to ${action} the food provider.`);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'rejected': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const openProviderDetails = (provider: FoodProvider) => {
    setSelectedProvider(provider);
    setModalVisible(true);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={14} color="#fbbf24" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={14} color="#fbbf24" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={14} color="#d1d5db" />
      );
    }

    return stars;
  };

  const ProviderCard = ({ item }: { item: FoodProvider }) => (
    <TouchableOpacity 
      style={styles.providerCard}
      onPress={() => openProviderDetails(item)}
    >
      {/* Header */}
      <View style={styles.providerCardHeader}>
        <View style={styles.providerImageContainer}>
          {item.images && item.images.length > 0 ? (
            <Image source={{ uri: item.images[0] }} style={styles.providerImage} />
          ) : (
            <View style={[styles.providerImage, styles.placeholderImage]}>
              <Ionicons name="restaurant" size={24} color="#94a3b8" />
            </View>
          )}
        </View>        <View style={styles.providerMainInfo}>
          <Text style={styles.providerName}>{item.name}</Text>
          <Text style={styles.providerLocation} numberOfLines={1}>
            <Ionicons name="location" size={12} color="#64748b" /> {typeof item.location === 'string' ? item.location : item.location?.name || item.location?.location || 'Unknown Location'}
          </Text>
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {renderStars(item.rating)}
            </View>
            <Text style={styles.ratingText}>({item.rating})</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.approvalStatus) }]}>
          <Ionicons 
            name={getStatusIcon(item.approvalStatus) as keyof typeof Ionicons.glyphMap} 
            size={12} 
            color="white" 
          />
          <Text style={styles.statusText}>{item.approvalStatus}</Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.providerCardBody}>
        <Text style={styles.providerDescription} numberOfLines={2}>
          {item.description}        </Text>
        <View style={styles.cuisineContainer}>
          {(item.cuisine || []).slice(0, 3).map((cuisine, index) => (
            <View key={index} style={styles.cuisineTag}>
              <Text style={styles.cuisineText}>{cuisine}</Text>
            </View>
          ))}
          {(item.cuisine || []).length > 3 && (
            <Text style={styles.moreText}>+{(item.cuisine || []).length - 3} more</Text>
          )}
        </View>        <View style={styles.ownerInfo}>
          <Ionicons name="person" size={14} color="#64748b" />
          <Text style={styles.ownerText}>{item.owner?.name || 'Unknown Owner'}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.providerCardFooter}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="basket" size={14} color="#64748b" />
            <Text style={styles.statText}>{item.totalOrders} orders</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons 
              name={item.isActive ? "flash" : "pause"} 
              size={14} 
              color={item.isActive ? "#10b981" : "#ef4444"} 
            />
            <Text style={styles.statText}>{item.isActive ? 'Active' : 'Inactive'}</Text>
          </View>
        </View>
        <Text style={styles.joinDate}>
          Added {formatDate(item.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#f59e0b', '#f97316']}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingTitle}>Loading Food Providers</Text>
          <Text style={styles.loadingText}>Fetching restaurant data...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#f59e0b', '#f97316']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Food Providers</Text>
            <Text style={styles.headerSubtitle}>
              {filteredProviders.length} of {foodProviders.length} providers
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
            placeholder="Search providers..."
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
          <Text style={styles.filtersTitle}>Filter by Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filtersContainer}>
              {statusFilters.map((status) => (
                <TouchableOpacity
                  key={status.key}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: selectedStatus === status.key ? status.color : '#f1f5f9',
                      borderWidth: 1,
                      borderColor: selectedStatus === status.key ? status.color : '#e2e8f0',
                    }
                  ]}
                  onPress={() => setSelectedStatus(status.key)}
                >
                  <Ionicons 
                    name={status.icon} 
                    size={16} 
                    color={selectedStatus === status.key ? 'white' : '#64748b'} 
                  />
                  <Text style={[
                    styles.filterChipText,
                    { color: selectedStatus === status.key ? 'white' : '#64748b' }
                  ]}>
                    {status.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Providers List */}
        {filteredProviders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant" size={64} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No Food Providers Found</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Try adjusting your search' : 'No providers match the selected filters'}
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
            {filteredProviders.map((provider) => (
              <ProviderCard key={provider._id} item={provider} />
            ))}
          </ScrollView>
        )}
      </View>

      {/* Provider Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        {selectedProvider && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedProvider.name}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              {/* Provider Image */}
              {selectedProvider.images && selectedProvider.images.length > 0 && (
                <Image 
                  source={{ uri: selectedProvider.images[0] }} 
                  style={styles.modalImage} 
                />
              )}
              
              {/* Provider Info */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Description</Text>
                <Text style={styles.modalText}>{selectedProvider.description}</Text>
              </View>              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Location</Text>
                <Text style={styles.modalText}>{typeof selectedProvider.location === 'string' ? selectedProvider.location : selectedProvider.location?.name || selectedProvider.location?.location || 'Unknown Location'}</Text>
              </View><View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Cuisine Types</Text>
                <View style={styles.cuisineContainer}>
                  {(selectedProvider.cuisine || []).map((cuisine, index) => (
                    <View key={index} style={styles.cuisineTag}>
                      <Text style={styles.cuisineText}>{cuisine}</Text>
                    </View>
                  ))}
                </View>
              </View>              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Owner Details</Text>
                <Text style={styles.modalText}>Name: {selectedProvider.owner?.name || 'Unknown'}</Text>
                <Text style={styles.modalText}>Email: {selectedProvider.owner?.email || 'Unknown'}</Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Statistics</Text>
                <Text style={styles.modalText}>Rating: {selectedProvider.rating}/5</Text>
                <Text style={styles.modalText}>Total Orders: {selectedProvider.totalOrders}</Text>
                <Text style={styles.modalText}>Status: {selectedProvider.approvalStatus}</Text>
                <Text style={styles.modalText}>Active: {selectedProvider.isActive ? 'Yes' : 'No'}</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtonsContainer}>
                {selectedProvider.approvalStatus === 'pending' && (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#dcfce7' }]}
                      onPress={() => {
                        handleProviderAction(selectedProvider._id, 'approve');
                        setModalVisible(false);
                      }}
                    >
                      <Ionicons name="checkmark" size={16} color="#16a34a" />
                      <Text style={[styles.actionButtonText, { color: '#16a34a' }]}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#fee2e2' }]}
                      onPress={() => {
                        handleProviderAction(selectedProvider._id, 'reject');
                        setModalVisible(false);
                      }}
                    >
                      <Ionicons name="close" size={16} color="#dc2626" />
                      <Text style={[styles.actionButtonText, { color: '#dc2626' }]}>Reject</Text>
                    </TouchableOpacity>
                  </>
                )}
                
                {selectedProvider.approvalStatus === 'approved' && (
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: selectedProvider.isActive ? '#fee2e2' : '#dcfce7' }
                    ]}
                    onPress={() => {
                      handleProviderAction(
                        selectedProvider._id, 
                        selectedProvider.isActive ? 'deactivate' : 'activate'
                      );
                      setModalVisible(false);
                    }}
                  >
                    <Ionicons 
                      name={selectedProvider.isActive ? "pause" : "play"} 
                      size={16} 
                      color={selectedProvider.isActive ? '#dc2626' : '#16a34a'} 
                    />
                    <Text style={[
                      styles.actionButtonText,
                      { color: selectedProvider.isActive ? '#dc2626' : '#16a34a' }
                    ]}>
                      {selectedProvider.isActive ? 'Deactivate' : 'Activate'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        )}
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
  providerCard: {
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
  providerCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  providerImageContainer: {
    marginRight: 16,
  },
  providerImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  placeholderImage: {
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerMainInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  providerLocation: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  ratingText: {
    fontSize: 12,
    color: '#64748b',
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
    color: 'white',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  providerCardBody: {
    gap: 12,
  },
  providerDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  cuisineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  cuisineTag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cuisineText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  moreText: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ownerText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  providerCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  joinDate: {
    fontSize: 12,
    color: '#94a3b8',
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
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 4,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AdminFoodProvidersScreen;
