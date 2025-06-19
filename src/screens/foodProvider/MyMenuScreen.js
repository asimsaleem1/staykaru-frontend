import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { menuItemAPI } from '../../api/foodAPI';

const MyMenuScreen = ({ navigation }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, available, unavailable
  const [error, setError] = useState(null); // New state for error handling

  useEffect(() => {
    fetchMenuItems();
  }, [filter]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error state
      const response = await menuItemAPI.getProviderMenuItems({
        status: filter === 'all' ? undefined : filter,
      });
      setMenuItems(response.data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setError('Failed to load menu items. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMenuItems();
    setRefreshing(false);
  };

  const handleDeleteItem = (itemId) => {
    Alert.alert(
      'Delete Menu Item',
      'Are you sure you want to delete this menu item? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => confirmDelete(itemId) },
      ]
    );
  };

  const confirmDelete = async (itemId) => {
    try {
      await menuItemAPI.deleteMenuItem(itemId);
      setMenuItems(prev => prev.filter(item => item.id !== itemId));
      Alert.alert('Success', 'Menu item deleted successfully');
    } catch (error) {
      console.error('Error deleting menu item:', error);
      Alert.alert('Error', 'Failed to delete menu item');
    }
  };

  const handleToggleAvailability = async (itemId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'available' ? 'unavailable' : 'available';
      await menuItemAPI.updateMenuItemStatus(itemId, newStatus);
      
      setMenuItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, status: newStatus } : item
        )
      );
      
      Alert.alert('Success', `Menu item marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating menu item status:', error);
      Alert.alert('Error', 'Failed to update menu item status');
    }
  };

  const renderFilterTabs = () => (
    <View style={styles.filterContainer}>
      {[
        { key: 'all', label: 'All Items' },
        { key: 'available', label: 'Available' },
        { key: 'unavailable', label: 'Unavailable' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.filterTab,
            filter === tab.key && styles.activeFilterTab,
          ]}
          onPress={() => setFilter(tab.key)}
        >
          <Text style={[
            styles.filterTabText,
            filter === tab.key && styles.activeFilterTabText,
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderMenuItemActions = (item) => (
    <View style={styles.itemActions}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate('EditMenuItem', { itemId: item.id })}
      >
        <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => handleToggleAvailability(item.id, item.status)}
      >
        <Ionicons 
          name={item.status === 'available' ? 'eye-off-outline' : 'eye-outline'} 
          size={20} 
          color={item.status === 'available' ? theme.colors.warning : theme.colors.success} 
        />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => handleDeleteItem(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
      </TouchableOpacity>
    </View>
  );

  const renderMenuItem = ({ item }) => (
    <View style={styles.menuItemCard}>
      <View style={styles.itemContent}>
        <Card
          type="menuItem"
          data={item}
          onPress={() => navigation.navigate('EditMenuItem', { itemId: item.id })}
          style={styles.menuCard}
        />
        
        <View style={styles.itemDetails}>
          <View style={styles.itemInfo}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: item.status === 'available' ? theme.colors.success : theme.colors.warning }
              ]}>
                <Text style={styles.statusText}>
                  {item.status === 'available' ? 'Available' : 'Unavailable'}
                </Text>
              </View>
            </View>
            
            <Text style={styles.itemCategory}>{item.category}</Text>            <Text style={styles.itemPrice}>
              RM {(item.price && typeof item.price === 'number') 
                ? item.price.toFixed(2) 
                : '0.00'}
            </Text>
            
            <View style={styles.itemStats}>
              <Text style={styles.statText}>
                {item.orderCount || 0} orders • {(item.averageRating && typeof item.averageRating === 'number') 
                  ? item.averageRating.toFixed(1) 
                  : '0.0'} ⭐
              </Text>
            </View>
          </View>
          
          {renderMenuItemActions(item)}
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="restaurant-outline" size={64} color={theme.colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Menu Items</Text>
      <Text style={styles.emptyDescription}>
        {filter === 'all' 
          ? 'Start building your menu by adding your first dish or beverage.'
          : `No ${filter} menu items found.`
        }
      </Text>
      {filter === 'all' && (
        <Button
          title="Add Your First Item"
          onPress={() => navigation.navigate('AddMenuItem')}
          style={styles.addFirstItemButton}
        />
      )}
    </View>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Menu</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddMenuItem')}
        >
          <Ionicons name="add" size={24} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Filter Tabs */}
      {renderFilterTabs()}

      {/* Menu Items List */}
      <FlatList
        data={menuItems}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeFilterTab: {
    borderBottomColor: theme.colors.primary,
  },
  filterTabText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium,
  },
  activeFilterTabText: {
    color: theme.colors.primary,
  },
  menuItemCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemContent: {
    flexDirection: 'row',
  },
  menuCard: {
    width: 100,
    marginRight: theme.spacing.md,
  },
  itemDetails: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  itemName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semiBold,
  },
  itemCategory: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  itemPrice: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  itemStats: {
    marginTop: theme.spacing.xs,
  },
  statText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  itemActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptyDescription: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  addFirstItemButton: {
    backgroundColor: theme.colors.primary,
  },
  errorContainer: {
    padding: 10,
    backgroundColor: theme.colors.errorBackground,
    borderRadius: 5,
    marginVertical: 10,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    fontSize: 14,
  },
});

export default MyMenuScreen;
