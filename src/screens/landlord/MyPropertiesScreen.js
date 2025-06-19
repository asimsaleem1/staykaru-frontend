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
import { accommodationAPI } from '../../api/accommodationAPI';

const MyPropertiesScreen = ({ navigation }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await accommodationAPI.getLandlordProperties();
      setProperties(response.data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      Alert.alert('Error', 'Failed to load properties');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProperties();
  };

  const handleDeleteProperty = (propertyId) => {
    Alert.alert(
      'Delete Property',
      'Are you sure you want to delete this property? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => confirmDelete(propertyId) },
      ]
    );
  };

  const confirmDelete = async (propertyId) => {
    try {
      await accommodationAPI.deleteProperty(propertyId);
      setProperties(prev => prev.filter(p => p.id !== propertyId));
      Alert.alert('Success', 'Property deleted successfully');
    } catch (error) {
      console.error('Error deleting property:', error);
      Alert.alert('Error', 'Failed to delete property');
    }
  };

  const handleToggleAvailability = async (propertyId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'available' ? 'unavailable' : 'available';
      await accommodationAPI.updatePropertyStatus(propertyId, newStatus);
      
      setProperties(prev =>
        prev.map(p =>
          p.id === propertyId ? { ...p, status: newStatus } : p
        )
      );
      
      Alert.alert('Success', `Property marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating property status:', error);
      Alert.alert('Error', 'Failed to update property status');
    }
  };

  const renderPropertyActions = (property) => (
    <View style={styles.propertyActions}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate('EditProperty', { propertyId: property.id })}
      >
        <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => handleToggleAvailability(property.id, property.status)}
      >
        <Ionicons 
          name={property.status === 'available' ? 'eye-off-outline' : 'eye-outline'} 
          size={20} 
          color={property.status === 'available' ? theme.colors.warning : theme.colors.success} 
        />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => handleDeleteProperty(property.id)}
      >
        <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
      </TouchableOpacity>
    </View>
  );
  const renderProperty = ({ item }) => (
    <View style={styles.propertyItem}>
      <Card
        type="accommodation"
        data={item}
        onPress={() => navigation.navigate('AccommodationDetail', { id: item._id || item.id })}
        style={styles.propertyCard}
      />
      
      <View style={styles.propertyDetails}>
        <View style={styles.propertyStatus}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.status === 'available' ? theme.colors.success : theme.colors.warning }
          ]}>
            <Text style={styles.statusText}>
              {item.status === 'available' ? 'Available' : 'Unavailable'}
            </Text>
          </View>
            <Text style={styles.propertyStats}>
            {item.bookingCount || 0} bookings • RM {(item.monthlyRevenue && typeof item.monthlyRevenue === 'number') 
              ? item.monthlyRevenue.toFixed(2) 
              : '0.00'}/month
          </Text>
        </View>
        
        {renderPropertyActions(item)}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="business-outline" size={64} color={theme.colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Properties Yet</Text>
      <Text style={styles.emptyDescription}>
        Start by adding your first property to attract students looking for accommodation.
      </Text>
      <Button
        title="Add Your First Property"
        onPress={() => navigation.navigate('AddProperty')}
        style={styles.addFirstPropertyButton}
      />
    </View>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Properties</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddProperty')}
        >
          <Ionicons name="add" size={24} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      {/* Properties List */}
      <FlatList
        data={properties}
        renderItem={renderProperty}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={properties.length === 0 ? styles.emptyContainer : styles.listContainer}
        showsVerticalScrollIndicator={false}
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
  listContainer: {
    padding: theme.spacing.md,
  },
  propertyItem: {
    marginBottom: theme.spacing.lg,
  },
  propertyCard: {
    marginBottom: theme.spacing.sm,
  },
  propertyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  propertyStatus: {
    flex: 1,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.xs,
  },
  statusText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semiBold,
  },
  propertyStats: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  propertyActions: {
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
  emptyContainer: {
    flexGrow: 1,
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
  addFirstPropertyButton: {
    backgroundColor: theme.colors.primary,
  },
});

export default MyPropertiesScreen;
