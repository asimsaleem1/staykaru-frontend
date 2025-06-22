import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FoodProviderCard } from '../../components/common/Card';
import { theme } from '../../styles/theme';
import { foodAPI } from '../../api/foodAPI';
import { CUISINE_TYPES } from '../../constants';

const FoodProvidersScreen = ({ navigation }) => {
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchFoodProviders();
  }, []);

  useEffect(() => {
    filterProviders();
  }, [providers, searchQuery, selectedCategory]);  const fetchFoodProviders = async () => {
    try {
      console.log('Fetching approved food providers from database...');
      
      // Only fetch admin-approved food providers for students
      const params = {
        status: 'approved',
        adminApproved: true,
        visibleToStudents: true,
        isActive: true
      };
      
      const response = await foodAPI.getAll(params);
      console.log('Food providers API response:', response);
      
      // Handle different response structures
      let providersData = [];
      if (response && response.data) {
        providersData = Array.isArray(response.data) ? response.data : response.data.providers || [];
      } else if (Array.isArray(response)) {
        providersData = response;
      } else if (response && response.providers) {
        providersData = response.providers;
      }
      
      // Filter out invalid providers and ensure only approved ones
      const validProviders = providersData.filter(provider => 
        provider && 
        typeof provider === 'object' && 
        (provider.businessName || provider.name) &&
        (provider.approvalStatus === 'approved' || provider.status === 'approved') &&
        provider.adminApproved !== false &&
        provider.visibleToStudents !== false
      );
      
      console.log('Valid approved food providers loaded:', validProviders.length);
      console.log('First provider:', validProviders[0]);
      setProviders(validProviders);
    } catch (error) {
      console.error('Error fetching food providers:', error);
      Alert.alert('Error', 'Failed to load food providers. Please try again later.');
      setProviders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFoodProviders();
    setRefreshing(false);
  }, []);  const filterProviders = () => {
    if (!providers || !Array.isArray(providers)) {
      setFilteredProviders([]);
      return;
    }    // Start with valid providers only
    let filtered = providers.filter(provider => 
      provider && 
      typeof provider === 'object' && 
      (provider.businessName || provider.name) !== undefined && 
      (provider.businessName || provider.name) !== null
    );

    // Filter by search query
    if (searchQuery && searchQuery.trim()) {
      filtered = filtered.filter(provider => {
        if (!provider) return false;
        const businessName = provider.businessName || provider.name || '';
        const cuisine = provider.cuisine || provider.cuisineType || provider.cuisine_type || '';
        const location = provider.location || '';
        
        return businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
               cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
               location.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(provider => {
        if (!provider || !provider.cuisine) return false;
        return provider.cuisine.toLowerCase() === selectedCategory.toLowerCase();
      });
    }

    setFilteredProviders(filtered || []);
  };
  const handleProviderPress = (provider) => {
    navigation.navigate('FoodProviderDetail', { 
      provider,
      id: provider._id || provider.id  // Add explicit ID
    });
  };const renderProviderItem = ({ item }) => {
    if (!item || !item._id) return null;
    
    console.log('Rendering provider:', item.name || item.businessName);
    
    return (
      <FoodProviderCard
        provider={item}
        onPress={() => handleProviderPress(item)}
        style={styles.providerCard}
      />
    );
  };

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Ionicons 
          name="search" 
          size={20} 
          color={theme.colors.text.secondary} 
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search food providers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={theme.colors.text.secondary}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
          >
            <Ionicons name="close" size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );  const renderCategoryFilter = () => {
    const categories = [
      { id: 'all', name: 'All' },
      ...CUISINE_TYPES.filter(cuisine => cuisine && typeof cuisine === 'string')
        .map(cuisine => ({ id: cuisine.toLowerCase(), name: cuisine }))
    ];

    return (
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item.id && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === item.id && styles.categoryButtonTextActive,
                ]}              >
                {String(item.name || 'Unknown')}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoryList}
        />
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons 
        name="restaurant-outline" 
        size={64} 
        color={theme.colors.text.secondary} 
      />
      <Text style={styles.emptyTitle}>No Food Providers Found</Text>
      <Text style={styles.emptyText}>
        {searchQuery || selectedCategory !== 'all'
          ? 'Try adjusting your search or filters'
          : 'No food providers available in your area'
        }
      </Text>
    </View>
  );

  const renderListHeader = () => (
    <View>
      {renderSearchBar()}
      {renderCategoryFilter()}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''} found
        </Text>
        <TouchableOpacity style={styles.mapViewButton}>
          <Ionicons name="map" size={16} color={theme.colors.primary} />
          <Text style={styles.mapViewText}>Map View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Food Providers</Text>
      </View>      <FlatList
        data={filteredProviders}
        renderItem={renderProviderItem}
        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  searchContainer: {
    padding: theme.spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
  },
  clearButton: {
    padding: theme.spacing.xs,
  },
  categoryContainer: {
    paddingVertical: theme.spacing.sm,
  },
  categoryList: {
    paddingHorizontal: theme.spacing.md,
  },
  categoryButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryButtonText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.weights.medium,
  },
  categoryButtonTextActive: {
    color: theme.colors.white,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  resultsCount: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  mapViewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  mapViewText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.medium,
  },
  listContainer: {
    flexGrow: 1,
  },
  providerCard: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
  },
  emptyTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});

export default FoodProvidersScreen;
