import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import { locationAPI } from '../../api/commonAPI';

const CitiesListScreen = ({ navigation }) => {
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCities();
  }, []);

  useEffect(() => {
    filterCities();
  }, [searchQuery, cities]);

  const loadCities = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockCities = [
        {
          id: '1',
          name: 'New York',
          country: 'United States',
          population: 8419600,
          accommodationCount: 245,
          foodProviderCount: 156,
        },
        {
          id: '2',
          name: 'London',
          country: 'United Kingdom',
          population: 8982000,
          accommodationCount: 189,
          foodProviderCount: 203,
        },
        {
          id: '3',
          name: 'Paris',
          country: 'France',
          population: 2161000,
          accommodationCount: 167,
          foodProviderCount: 142,
        },
        {
          id: '4',
          name: 'Tokyo',
          country: 'Japan',
          population: 13929286,
          accommodationCount: 298,
          foodProviderCount: 287,
        },
        {
          id: '5',
          name: 'Sydney',
          country: 'Australia',
          population: 5312000,
          accommodationCount: 134,
          foodProviderCount: 98,
        },
        {
          id: '6',
          name: 'Toronto',
          country: 'Canada',
          population: 2930000,
          accommodationCount: 156,
          foodProviderCount: 112,
        },
        {
          id: '7',
          name: 'Berlin',
          country: 'Germany',
          population: 3669000,
          accommodationCount: 178,
          foodProviderCount: 134,
        },
        {
          id: '8',
          name: 'Amsterdam',
          country: 'Netherlands',
          population: 873000,
          accommodationCount: 89,
          foodProviderCount: 76,
        },
      ];

      setCities(mockCities);
    } catch (error) {
      console.error('Error loading cities:', error);
      Alert.alert('Error', 'Failed to load cities');
    } finally {
      setLoading(false);
    }
  };

  const filterCities = () => {
    if (!searchQuery.trim()) {
      setFilteredCities(cities);
      return;
    }

    const filtered = cities.filter(
      (city) =>
        city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.country.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCities(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCities();
    setRefreshing(false);
  };

  const handleCityPress = (city) => {
    navigation.navigate('CityDetail', { cityId: city.id, cityName: city.name });
  };

  const formatPopulation = (population) => {
    if (population >= 1000000) {
      return `${(population / 1000000).toFixed(1)}M`;
    } else if (population >= 1000) {
      return `${(population / 1000).toFixed(0)}K`;
    }
    return population.toString();
  };

  const CityItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleCityPress(item)}>
      <Card style={styles.cityCard}>
        <View style={styles.cityHeader}>
          <View style={styles.cityInfo}>
            <Text style={styles.cityName}>{item.name}</Text>
            <Text style={styles.countryName}>{item.country}</Text>
          </View>
          <View style={styles.populationContainer}>
            <Ionicons name="people-outline" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.populationText}>{formatPopulation(item.population)}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="home-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.statText}>{item.accommodationCount} Accommodations</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="restaurant-outline" size={16} color={theme.colors.warning} />
            <Text style={styles.statText}>{item.foodProviderCount} Food Providers</Text>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cities</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search cities or countries..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search-outline"
          style={styles.searchInput}
        />
      </View>

      {/* Cities List */}
      <FlatList
        data={filteredCities}
        keyExtractor={(item) => item.id}
        renderItem={CityItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="location-outline"
              size={64}
              color={theme.colors.text.secondary}
            />
            <Text style={styles.emptyTitle}>No Cities Found</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Try different search terms' : 'No cities available'}
            </Text>
          </View>
        }
      />
    </View>
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
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.text.primary,
    flex: 1,
  },
  searchContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchInput: {
    marginBottom: 0,
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  cityCard: {
    marginBottom: theme.spacing.md,
    position: 'relative',
  },
  cityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  cityInfo: {
    flex: 1,
  },
  cityName: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  countryName: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
  },
  populationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  populationText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
    fontWeight: '500',
  },
  actionContainer: {
    position: 'absolute',
    right: theme.spacing.md,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});

export default CitiesListScreen;
