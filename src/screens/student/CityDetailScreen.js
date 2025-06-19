import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { locationAPI, accommodationAPI, foodAPI } from '../../api/commonAPI';

const { width } = Dimensions.get('window');

const CityDetailScreen = ({ route, navigation }) => {
  const { cityId, cityName } = route.params;
  const [cityData, setCityData] = useState(null);
  const [accommodations, setAccommodations] = useState([]);
  const [foodProviders, setFoodProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCityDetails();
  }, []);

  const loadCityDetails = async () => {
    try {
      setLoading(true);
      
      // Mock city data - replace with actual API calls
      const mockCityData = {
        id: cityId,
        name: cityName,
        country: 'United States',
        population: 8419600,
        area: 783.8,
        timezone: 'EST',
        weather: {
          temperature: 18,
          condition: 'Partly Cloudy',
          icon: 'partly-sunny-outline',
        },
        description: 'A vibrant city with excellent educational institutions and diverse cultural experiences. Known for its student-friendly environment and affordable living options.',
        highlights: [
          'Top-rated universities',
          'Excellent public transportation',
          'Diverse food scene',
          'Rich cultural heritage',
          'Student-friendly neighborhoods',
        ],
        stats: {
          accommodationCount: 245,
          foodProviderCount: 156,
          averageRent: 1200,
          studentPopulation: 185000,
        },
      };

      const mockAccommodations = [
        {
          id: '1',
          title: 'Student Apartment Downtown',
          price: 800,
          rating: 4.5,
          image: 'https://via.placeholder.com/150',
          distance: 0.5,
        },
        {
          id: '2',
          title: 'Cozy Studio Near Campus',
          price: 650,
          rating: 4.2,
          image: 'https://via.placeholder.com/150',
          distance: 1.2,
        },
        {
          id: '3',
          title: 'Shared House for Students',
          price: 450,
          rating: 4.7,
          image: 'https://via.placeholder.com/150',
          distance: 2.1,
        },
      ];

      const mockFoodProviders = [
        {
          id: '1',
          name: 'Campus Café',
          cuisine: 'International',
          rating: 4.3,
          deliveryTime: 25,
          distance: 0.3,
        },
        {
          id: '2',
          name: 'Pizza Corner',
          cuisine: 'Italian',
          rating: 4.1,
          deliveryTime: 30,
          distance: 0.7,
        },
        {
          id: '3',
          name: 'Healthy Bites',
          cuisine: 'Healthy',
          rating: 4.6,
          deliveryTime: 20,
          distance: 1.0,
        },
      ];

      setCityData(mockCityData);
      setAccommodations(mockAccommodations);
      setFoodProviders(mockFoodProviders);
    } catch (error) {
      console.error('Error loading city details:', error);
      Alert.alert('Error', 'Failed to load city details');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCityDetails();
    setRefreshing(false);
  };
  const handleExploreAccommodations = () => {
    navigation.navigate('AccommodationSearch');
  };
  const handleExploreFoodProviders = () => {
    navigation.navigate('FoodProviders');
  };
  const handleAccommodationPress = (accommodation) => {
    navigation.navigate('AccommodationDetail', { id: accommodation._id || accommodation.id });
  };

  const handleFoodProviderPress = (provider) => {
    navigation.navigate('FoodProviderDetail', { 
      id: provider.id,
      provider  // Pass both for backward compatibility
    });
  };

  const StatCard = ({ icon, title, value, subtitle }) => (
    <Card style={styles.statCard}>
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={24} color={theme.colors.primary} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </Card>
  );

  const AccommodationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => handleAccommodationPress(item)}
    >
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <View style={styles.itemDetails}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color={theme.colors.warning} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <Text style={styles.distanceText}>{item.distance} km away</Text>
        </View>
      </View>
      <Text style={styles.priceText}>${item.price}/month</Text>
    </TouchableOpacity>
  );

  const FoodProviderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => handleFoodProviderPress(item)}
    >
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <View style={styles.itemDetails}>
          <Text style={styles.cuisineText}>{item.cuisine}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color={theme.colors.warning} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.deliveryText}>{item.deliveryTime} min</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!cityData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>City Details</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>City not found</Text>
        </View>
      </View>
    );
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
        <Text style={styles.headerTitle}>{cityData.name}</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* City Info */}
        <Card style={styles.cityInfoCard}>
          <View style={styles.cityHeader}>
            <View style={styles.cityTitleContainer}>
              <Text style={styles.cityTitle}>{cityData.name}</Text>
              <Text style={styles.countryText}>{cityData.country}</Text>
            </View>
            <View style={styles.weatherContainer}>
              <Ionicons 
                name={cityData.weather.icon} 
                size={24} 
                color={theme.colors.warning} 
              />
              <Text style={styles.temperatureText}>{cityData.weather.temperature}°C</Text>
            </View>
          </View>
          <Text style={styles.descriptionText}>{cityData.description}</Text>
        </Card>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatCard
            icon="people-outline"
            title="Population"
            value={(cityData.population / 1000000).toFixed(1) + 'M'}
          />
          <StatCard
            icon="school-outline"
            title="Students"
            value={(cityData.stats.studentPopulation / 1000).toFixed(0) + 'K'}
          />
          <StatCard
            icon="home-outline"
            title="Avg Rent"
            value={`$${cityData.stats.averageRent}`}
            subtitle="/month"
          />
          <StatCard
            icon="resize-outline"
            title="Area"
            value={cityData.area}
            subtitle="km²"
          />
        </View>

        {/* Highlights */}
        <Card style={styles.highlightsCard}>
          <Text style={styles.sectionTitle}>City Highlights</Text>
          {cityData.highlights.map((highlight, index) => (
            <View key={index} style={styles.highlightItem}>
              <Ionicons 
                name="checkmark-circle" 
                size={16} 
                color={theme.colors.success} 
              />
              <Text style={styles.highlightText}>{highlight}</Text>
            </View>
          ))}
        </Card>

        {/* Top Accommodations */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Accommodations</Text>
            <TouchableOpacity onPress={handleExploreAccommodations}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>          </View>
          {(accommodations || []).slice(0, 3).map((item) => (
            <AccommodationItem key={item.id} item={item} />
          ))}
        </Card>

        {/* Top Food Providers */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Food Providers</Text>
            <TouchableOpacity onPress={handleExploreFoodProviders}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {(foodProviders || []).slice(0, 3).map((item) => (
            <FoodProviderItem key={item.id} item={item} />
          ))}
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <Button
            title="Find Accommodation"
            onPress={handleExploreAccommodations}
            style={styles.actionButton}
          />
          <Button
            title="Explore Food"
            onPress={handleExploreFoodProviders}
            variant="outline"
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  cityInfoCard: {
    marginBottom: theme.spacing.md,
  },
  cityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  cityTitleContainer: {
    flex: 1,
  },
  cityTitle: {
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.h1.fontWeight,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  countryText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  temperatureText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.xs,
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  statCard: {
    width: (width - theme.spacing.md * 3) / 2,
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  statIcon: {
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  statTitle: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
  highlightsCard: {
    marginBottom: theme.spacing.md,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  highlightText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  },
  sectionCard: {
    marginBottom: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text.primary,
  },
  seeAllText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  distanceText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
  },
  cuisineText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
  },
  priceText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  deliveryText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
  },
  actionButtonsContainer: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  actionButton: {
    marginBottom: 0,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: theme.typography.h4.fontSize,
    color: theme.colors.text.secondary,
  },
});

export default CityDetailScreen;
