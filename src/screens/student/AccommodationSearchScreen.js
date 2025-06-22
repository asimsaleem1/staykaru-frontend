import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Alert,
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { accommodationAPI } from '../../api/accommodationAPI';
import { AccommodationCard } from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { theme } from '../../styles/theme';
import { AMENITIES } from '../../constants';

const AccommodationSearchScreen = ({ navigation }) => {
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    city: '',
    amenities: [],
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadAccommodations();
  }, []);

  const loadAccommodations = async (reset = true) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      }      const params = {
        page: reset ? 1 : page,
        limit: 10,
        status: 'approved', // Only show admin-approved accommodations
        adminApproved: true, // Ensure admin has approved the accommodation
        visibleToStudents: true, // Only show items visible to students
        isActive: true // Only show active accommodations
      };if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      // TODO: Fix city filtering - API expects MongoDB ObjectId, not city name
      // if (filters.city.trim()) {
      //   params.city = filters.city.trim();
      // }

      if (filters.minPrice) {
        params.minPrice = parseFloat(filters.minPrice);
      }

      if (filters.maxPrice) {
        params.maxPrice = parseFloat(filters.maxPrice);
      }

      if (filters.amenities.length > 0) {
        params.amenities = filters.amenities.join(',');
      }      const response = await accommodationAPI.getAll(params);
      console.log('Accommodation API Response:', response);
      
      // Handle different response structures
      let newAccommodations = [];
      if (response.data) {
        newAccommodations = Array.isArray(response.data) ? response.data : response.data.accommodations || [];
      } else if (Array.isArray(response)) {
        newAccommodations = response;
      }
      
      console.log('Accommodations loaded:', newAccommodations.length);

      if (reset) {
        setAccommodations(newAccommodations);
      } else {
        setAccommodations(prev => [...prev, ...newAccommodations]);
      }

      setHasMore(newAccommodations.length === 10);
      if (!reset) {
        setPage(prev => prev + 1);
      }    } catch (error) {
      console.error('Error loading accommodations:', error);
      console.error('Error details:', JSON.stringify(error));
      Alert.alert('Error', 'Failed to load accommodations. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    loadAccommodations(true);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAccommodations(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadAccommodations(false);
    }
  };

  const toggleAmenity = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      city: '',
      amenities: [],
    });
    setSearchQuery('');
  };
  const renderAccommodation = ({ item }) => (
    <AccommodationCard
      accommodation={item}
      onPress={() => navigation.navigate('AccommodationDetail', { id: item._id || item.id })}
    />
  );

  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <View style={styles.filtersContainer}>
        <Input
          label="City"
          value={filters.city}
          onChangeText={(text) => setFilters(prev => ({ ...prev, city: text }))}
          placeholder="Enter city name"
        />
        
        <View style={styles.priceFilters}>
          <View style={styles.priceInput}>
            <Input
              label="Min Price"
              value={filters.minPrice}
              onChangeText={(text) => setFilters(prev => ({ ...prev, minPrice: text }))}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.priceInput}>
            <Input
              label="Max Price"
              value={filters.maxPrice}
              onChangeText={(text) => setFilters(prev => ({ ...prev, maxPrice: text }))}
              placeholder="1000"
              keyboardType="numeric"
            />
          </View>
        </View>

        <Text style={styles.amenitiesLabel}>Amenities</Text>
        <View style={styles.amenitiesContainer}>
          {AMENITIES.map((amenity) => (
            <TouchableOpacity
              key={amenity}
              style={[
                styles.amenityChip,
                filters.amenities.includes(amenity) && styles.amenityChipSelected
              ]}
              onPress={() => toggleAmenity(amenity)}
            >
              <Text style={[
                styles.amenityText,
                filters.amenities.includes(amenity) && styles.amenityTextSelected
              ]}>
                {amenity}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.filterButtons}>
          <Button
            title="Clear Filters"
            onPress={clearFilters}
            variant="outline"
            style={styles.filterButton}
          />
          <Button
            title="Apply Filters"
            onPress={handleSearch}
            style={styles.filterButton}
          />
        </View>
      </View>
    );
  };

  if (loading && accommodations.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchContainer}>
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search accommodations..."
            leftIcon="search-outline"
            style={styles.searchInput}
          />
          <TouchableOpacity
            style={styles.filterToggle}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons 
              name={showFilters ? "close" : "options-outline"} 
              size={24} 
              color={theme.colors.primary} 
            />
          </TouchableOpacity>
        </View>
        
        <Button
          title="Search"
          onPress={handleSearch}
          size="small"
          style={styles.searchButton}
        />
      </View>

      {/* Filters */}
      {renderFilters()}

      {/* Results */}      <FlatList
        data={accommodations}
        renderItem={renderAccommodation}
        keyExtractor={(item) => item._id || item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="bed-outline" size={64} color={theme.colors.gray.medium} />
            <Text style={styles.emptyText}>No accommodations found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search criteria</Text>
          </View>
        )}
        ListFooterComponent={() => 
          loading && accommodations.length > 0 ? <LoadingSpinner /> : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  searchHeader: {
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray.light,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginRight: theme.spacing.sm,
    marginBottom: 0,
  },
  filterToggle: {
    padding: theme.spacing.sm,
    borderRadius: 8,
    backgroundColor: theme.colors.gray.light,
  },
  searchButton: {
    marginTop: theme.spacing.sm,
  },
  filtersContainer: {
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray.light,
  },
  priceFilters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceInput: {
    flex: 0.48,
  },
  amenitiesLabel: {
    fontSize: theme.typography.fontSize.medium,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  amenityChip: {
    backgroundColor: theme.colors.gray.light,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  amenityChipSelected: {
    backgroundColor: theme.colors.primary,
  },
  amenityText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.primary,
  },
  amenityTextSelected: {
    color: theme.colors.white,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flex: 0.48,
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
  },
  emptySubtext: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.text.light,
    marginTop: theme.spacing.xs,
  },
});

export default AccommodationSearchScreen;
