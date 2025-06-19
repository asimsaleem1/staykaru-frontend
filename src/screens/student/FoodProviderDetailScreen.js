import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { MenuItemCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { theme } from '../../styles/theme';
import { foodAPI } from '../../api/foodAPI';

const FoodProviderDetailScreen = ({ route, navigation }) => {
  const { provider: initialProvider, providerId, id } = route.params || {};
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState({});
  const [provider, setProvider] = useState(initialProvider || null);
  const [error, setError] = useState(null);

  const fetchProviderDetails = useCallback(async () => {
    try {
      // Try all possible ID sources
      const providerId = initialProvider?._id || initialProvider?.id || id || route.params?.id;
      
      if (!providerId) {
        console.error('Navigation params:', route.params);
        throw new Error('Provider ID not found. Please ensure the provider ID is passed correctly.');
      }

      const response = await foodAPI.getById(providerId);
      if (!response?.data) {
        throw new Error('Failed to load provider data');
      }
      
      const providerData = response.data;
      setProvider(providerData);
      if (providerData.menuItems?.length > 0) {
        setMenuItems(providerData.menuItems);
      }
      return providerData;
    } catch (error) {
      console.error('Error fetching provider details:', error);
      setError(error.message || 'Failed to load provider information');
      throw error;
    }
  }, [initialProvider, id, route.params]);
  const fetchMenuItems = useCallback(async (id) => {
    // Only fetch menu items if we don't already have them
    if (!menuItems?.length) {
      try {
        const response = await foodAPI.getMenuItems(id);
        setMenuItems(response.data || []);
      } catch (error) {
        console.warn('Could not fetch menu items:', error);
        // Don't show error to user, just set empty menu
        setMenuItems([]);
      }
    }
  }, [menuItems?.length]);

  const loadData = useCallback(async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) {
      setLoading(true);
    }
    setError(null);
    
    try {
      const providerData = await fetchProviderDetails();
      
      if (!providerData?._id) {
        throw new Error('Invalid provider data received');
      }

      // Only fetch menu items separately if they weren't included in provider data      // Set menu items from provider data or fetch them separately
      setMenuItems(providerData.menuItems || providerData.menu || []);

      // If no menu items in provider data, try to fetch them
      if (!providerData.menuItems?.length && !providerData.menu?.length) {
        await fetchMenuItems(providerData._id);
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to load provider data';
      console.error('Error loading provider:', errorMessage);
      Alert.alert(
        'Error',
        errorMessage,
        [
          { 
            text: 'Go Back', 
            onPress: () => navigation.goBack() 
          },
          { 
            text: 'Try Again', 
            onPress: () => loadData(true) 
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  }, [fetchProviderDetails, fetchMenuItems, navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData(false);
    setRefreshing(false);
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getUniqueCategories = () => {
    const categories = [...new Set(menuItems.map(item => item.category))];
    return [{ id: 'all', name: 'All' }, ...categories.map(cat => ({ id: cat, name: cat }))];
  };

  const getFilteredMenuItems = () => {
    if (selectedCategory === 'all') return menuItems;
    return menuItems.filter(item => item.category === selectedCategory);
  };

  const addToCart = (item) => {
    setCart(prev => ({
      ...prev,
      [item._id]: (prev[item._id] || 0) + 1,
    }));
  };

  const removeFromCart = (item) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[item._id] > 1) {
        newCart[item._id]--;
      } else {
        delete newCart[item._id];
      }
      return newCart;
    });
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [itemId, quantity]) => {
      const item = menuItems.find(item => item._id === itemId);
      return total + (item ? item.price * quantity : 0);
    }, 0);
  };

  const getCartItemCount = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };

  const handleProceedToOrder = () => {
    const orderItems = Object.entries(cart).map(([itemId, quantity]) => {
      const item = menuItems.find(item => item._id === itemId);
      return { ...item, quantity };
    });

    navigation.navigate('OrderFormScreen', {
      provider,
      orderItems,
      total: getCartTotal(),
    });
  };

  const renderRating = () => {
    if (!provider) return null;

    return (
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={16} color={theme.colors.primary} />
        <Text style={styles.rating}>
          {typeof provider.rating === 'number' ? provider.rating.toFixed(1) : 'N/A'}
        </Text>
        <Text style={styles.ratingCount}>
          {typeof provider.ratingCount === 'number' && provider.ratingCount > 0 
            ? `(${provider.ratingCount} reviews)` 
            : '(No reviews yet)'}
        </Text>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.providerInfo}>
        <Text style={styles.providerName}>{provider?.name || 'Unknown Provider'}</Text>
        {renderRating()}
        
        <View style={styles.detailItem}>
          <Ionicons name="location" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.detailText}>
            {provider?.address || 'Address not available'}
          </Text>
        </View>
          
        <View style={styles.detailItem}>
          <Ionicons name="call" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.detailText}>
            {provider?.contactPhone || 'Phone not available'}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Ionicons name="time" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.detailText}>
            {provider?.deliveryTime || 'Delivery time not available'}
          </Text>
        </View>

        {provider?.description && (
          <Text style={styles.description}>{provider.description}</Text>
        )}
      </View>
    </View>
  );

  const renderNoMenuItems = () => (
    <View style={styles.noMenuContainer}>
      <Ionicons name="restaurant-outline" size={48} color={theme.colors.text.secondary} />
      <Text style={styles.noMenuText}>No menu items available</Text>
      <Text style={styles.noMenuSubText}>This provider hasn't added any items yet</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (error || !provider) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Provider not found'}</Text>
        <Button
          title="Try Again"
          onPress={() => loadData()}
          style={styles.retryButton}
        />
      </SafeAreaView>
    );
  }

  const filteredMenuItems = getFilteredMenuItems();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderHeader()}
        {menuItems.length > 0 ? (
          <>
            {renderCategoryFilter()}
            <View style={styles.menuContainer}>
              {getFilteredMenuItems().map((item) => (
                <MenuItemCard
                  key={item._id}
                  item={item}
                  quantity={cart[item._id] || 0}
                  onAdd={() => addToCart(item)}
                  onRemove={() => removeFromCart(item)}
                />
              ))}
            </View>
          </>
        ) : renderNoMenuItems()}
      </ScrollView>

      {Object.keys(cart).length > 0 && (
        <View style={styles.cartFooter}>
          <View style={styles.cartInfo}>
            <Text style={styles.cartItemCount}>
              {Object.values(cart).reduce((a, b) => a + b, 0)} items
            </Text>
            <Text style={styles.cartTotal}>
              ${getCartTotal().toFixed(2)}
            </Text>
          </View>
          <Button
            title="View Cart"
            onPress={() => {
              navigation.navigate('Cart', {
                cart,
                menuItems,
                provider,
              });
            }}
            style={styles.viewCartButton}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    width: 200,
  },
  header: {
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  providerInfo: {
    marginBottom: 16,
  },
  providerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rating: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  ratingCount: {
    marginLeft: 4,
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  description: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 8,
    lineHeight: 20,
  },
  categoryContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  categoryButtonTextActive: {
    color: theme.colors.surface,
  },
  menuContainer: {
    padding: 16,
  },
  cartFooter: {
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartInfo: {
    flex: 1,
  },
  cartItemCount: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  cartTotal: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  viewCartButton: {
    width: 120,
    marginLeft: 16,
  },
  noMenuContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 32,
  },
  noMenuText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginTop: 16,
  },
  noMenuSubText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default FoodProviderDetailScreen;
