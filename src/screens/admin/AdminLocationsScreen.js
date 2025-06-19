import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import MapView, { Marker, Callout } from 'react-native-maps';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/common/Card';
import { theme } from '../../styles/theme';
import { commonAPI, adminAPI } from '../../api/commonAPI';

const AdminLocationsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const filterOptions = [
    { label: 'All Locations', value: 'all' },
    { label: 'Accommodations', value: 'accommodation' },
    { label: 'Food Providers', value: 'food_provider' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ];

  useFocusEffect(
    useCallback(() => {
      loadLocations();
    }, [])
  );

  useEffect(() => {
    filterLocations();
  }, [locations, selectedFilter, searchQuery]);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const response = await commonAPI.getAllLocations();
      if (response.success) {
        setLocations(response.data);
      }
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterLocations = () => {
    let filtered = locations;

    // Filter by type or status
    if (selectedFilter !== 'all') {
      if (['accommodation', 'food_provider'].includes(selectedFilter)) {
        filtered = filtered.filter(location => location.type === selectedFilter);
      } else if (['active', 'inactive'].includes(selectedFilter)) {
        filtered = filtered.filter(location => location.status === selectedFilter);
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(location =>
        location.name.toLowerCase().includes(query) ||
        location.address.toLowerCase().includes(query) ||
        location.city.toLowerCase().includes(query) ||
        location.state.toLowerCase().includes(query)
      );
    }

    setFilteredLocations(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLocations();
  };

  const showLocationDetails = (location) => {
    setSelectedLocation(location);
    setModalVisible(true);
  };

  const updateLocationStatus = async (locationId, status) => {
    try {
      const response = await commonAPI.updateLocationStatus(locationId, status);
      if (response.success) {
        Alert.alert('Success', `Location ${status} successfully!`);
        loadLocations();
      } else {
        Alert.alert('Error', response.message || `Failed to ${status} location`);
      }
    } catch (error) {
      console.error(`Error ${status} location:`, error);
      Alert.alert('Error', `Failed to ${status} location. Please try again.`);
    }
  };

  const getLocationTypeIcon = (type) => {
    const typeIcons = {
      accommodation: 'home',
      food_provider: 'restaurant',
    };
    return typeIcons[type] || 'location';
  };

  const getStatusColor = (status) => {
    const statusColors = {
      active: theme.colors.success,
      inactive: theme.colors.error,
      pending: theme.colors.warning,
    };
    return statusColors[status] || theme.colors.textLight;
  };

  const renderLocationCard = (location) => (
    <Card key={location.id} style={styles.locationCard}>
      <TouchableOpacity onPress={() => showLocationDetails(location)}>
        <View style={styles.locationHeader}>
          <View style={styles.locationInfo}>
            <View style={styles.locationTypeContainer}>
              <Ionicons
                name={getLocationTypeIcon(location.type)}
                size={20}
                color={theme.colors.primary}
              />
              <Text style={styles.locationType}>
                {location.type.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
            <Text style={styles.locationName}>{location.name}</Text>
            <Text style={styles.locationAddress}>{location.address}</Text>
            <Text style={styles.locationCity}>
              {location.city}, {location.state}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(location.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(location.status) }]}>
              {location.status.charAt(0).toUpperCase() + location.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.locationStats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{location.totalItems || 0}</Text>
            <Text style={styles.statLabel}>
              {location.type === 'accommodation' ? 'Properties' : 'Menu Items'}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{location.totalBookings || 0}</Text>
            <Text style={styles.statLabel}>
              {location.type === 'accommodation' ? 'Bookings' : 'Orders'}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{location.rating ? location.rating.toFixed(1) : 'N/A'}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{location.reviews || 0}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.locationActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => showLocationDetails(location)}
        >
          <Ionicons name="eye" size={16} color={theme.colors.primary} />
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>

        {location.status === 'active' ? (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => updateLocationStatus(location.id, 'deactivate')}
          >
            <Ionicons name="pause" size={16} color={theme.colors.warning} />
            <Text style={[styles.actionButtonText, { color: theme.colors.warning }]}>Deactivate</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => updateLocationStatus(location.id, 'activate')}
          >
            <Ionicons name="play" size={16} color={theme.colors.success} />
            <Text style={[styles.actionButtonText, { color: theme.colors.success }]}>Activate</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('LocationAnalytics', { locationId: location.id })}
        >
          <Ionicons name="analytics" size={16} color={theme.colors.info} />
          <Text style={[styles.actionButtonText, { color: theme.colors.info }]}>Analytics</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderMapView = () => (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: 3.1319, // Malaysia center
        longitude: 101.6841,
        latitudeDelta: 5.0,
        longitudeDelta: 5.0,
      }}
    >
      {filteredLocations.map((location) => (
        <Marker
          key={location.id}
          coordinate={{
            latitude: location.latitude || 3.1319,
            longitude: location.longitude || 101.6841,
          }}
          pinColor={getStatusColor(location.status)}
        >
          <Callout onPress={() => showLocationDetails(location)}>
            <View style={styles.calloutContainer}>
              <Text style={styles.calloutTitle}>{location.name}</Text>
              <Text style={styles.calloutSubtitle}>{location.type.replace('_', ' ')}</Text>
              <Text style={styles.calloutAddress}>{location.address}</Text>
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Location Management</Text>
        <TouchableOpacity
          style={styles.viewToggle}
          onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
        >
          <Ionicons
            name={viewMode === 'list' ? 'map' : 'list'}
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search by name, address, city, or state..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search"
        />
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterTab,
              selectedFilter === option.value && styles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter(option.value)}
          >
            <Text
              style={[
                styles.filterTabText,
                selectedFilter === option.value && styles.filterTabTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      {viewMode === 'list' ? (
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.content}>
            <View style={styles.statsContainer}>
              <Text style={styles.statsText}>
                Showing {filteredLocations.length} of {locations.length} locations
              </Text>
            </View>

            {filteredLocations.length > 0 ? (
              filteredLocations.map(renderLocationCard)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="location-outline" size={64} color={theme.colors.textLight} />
                <Text style={styles.emptyStateTitle}>No Locations Found</Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery.trim()
                    ? 'No locations match your search criteria.'
                    : 'No locations found in the selected category.'}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      ) : (
        renderMapView()
      )}

      {/* Location Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedLocation && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedLocation.name}</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Ionicons name="close" size={24} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Type</Text>
                    <Text style={styles.detailValue}>
                      {selectedLocation.type.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Address</Text>
                    <Text style={styles.detailValue}>{selectedLocation.address}</Text>
                    <Text style={styles.detailValue}>
                      {selectedLocation.city}, {selectedLocation.state}
                    </Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Status</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedLocation.status) + '20' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(selectedLocation.status) }]}>
                        {selectedLocation.status.charAt(0).toUpperCase() + selectedLocation.status.slice(1)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Contact Information</Text>
                    <Text style={styles.detailValue}>Phone: {selectedLocation.phone || 'N/A'}</Text>
                    <Text style={styles.detailValue}>Email: {selectedLocation.email || 'N/A'}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Statistics</Text>
                    <View style={styles.statsGrid}>
                      <View style={styles.statItem}>
                        <Text style={styles.statItemValue}>{selectedLocation.totalItems || 0}</Text>
                        <Text style={styles.statItemLabel}>
                          {selectedLocation.type === 'accommodation' ? 'Properties' : 'Menu Items'}
                        </Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statItemValue}>{selectedLocation.totalBookings || 0}</Text>
                        <Text style={styles.statItemLabel}>
                          {selectedLocation.type === 'accommodation' ? 'Bookings' : 'Orders'}
                        </Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statItemValue}>
                          {selectedLocation.rating ? selectedLocation.rating.toFixed(1) : 'N/A'}
                        </Text>
                        <Text style={styles.statItemLabel}>Rating</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statItemValue}>{selectedLocation.reviews || 0}</Text>
                        <Text style={styles.statItemLabel}>Reviews</Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                  <Button
                    title="Close"
                    onPress={() => setModalVisible(false)}
                    variant="outline"
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    flex: 1,
  },
  viewToggle: {
    padding: theme.spacing.sm,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  filterContainer: {
    paddingVertical: theme.spacing.sm,
  },
  filterContent: {
    paddingHorizontal: theme.spacing.md,
  },
  filterTab: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterTabActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterTabText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
  },
  filterTabTextActive: {
    color: theme.colors.white,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.md,
  },
  statsContainer: {
    marginBottom: theme.spacing.md,
  },
  statsText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
  },
  locationCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  locationInfo: {
    flex: 1,
  },
  locationTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  locationType: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
    fontWeight: theme.typography.weights.medium,
  },
  locationName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  locationAddress: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
  },
  locationCity: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
  },
  locationStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  locationActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  actionButtonText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
  },
  map: {
    flex: 1,
  },
  calloutContainer: {
    padding: theme.spacing.sm,
    maxWidth: 200,
  },
  calloutTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
  },
  calloutSubtitle: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  calloutAddress: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyStateTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  emptyStateText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    margin: theme.spacing.md,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    flex: 1,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  modalBody: {
    padding: theme.spacing.lg,
  },
  detailSection: {
    marginBottom: theme.spacing.lg,
  },
  detailLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  detailValue: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  statItemValue: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  statItemLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  modalFooter: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});

export default AdminLocationsScreen;
