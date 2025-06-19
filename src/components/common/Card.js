import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

const Card = ({ children, style, onPress, ...props }) => {
  const CardComponent = onPress ? TouchableOpacity : View;
  
  return (
    <CardComponent
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

const AccommodationCard = ({ accommodation, onPress }) => {
  // Safety check for accommodation object
  if (!accommodation || typeof accommodation !== 'object') {
    return (
      <Card style={styles.accommodationCard}>
        <View style={styles.placeholderImage}>
          <Ionicons name="home-outline" size={40} color={theme.colors.text.secondary} />
        </View>
        <View style={styles.accommodationContent}>
          <Text style={styles.accommodationTitle}>Invalid property data</Text>
        </View>
      </Card>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return theme.colors.success;
      case 'occupied':
        return theme.colors.error;
      case 'maintenance':
        return theme.colors.warning;
      default:
        return theme.colors.text.secondary;
    }
  };

  return (
    <Card style={styles.accommodationCard} onPress={onPress}>
      {accommodation.images && accommodation.images.length > 0 ? (
        <Image
          source={{ uri: accommodation.images[0] }}
          style={styles.accommodationImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholderImage}>
          <Ionicons name="home-outline" size={40} color={theme.colors.text.secondary} />
        </View>
      )}
        <View style={styles.accommodationContent}>
        <Text style={styles.accommodationTitle} numberOfLines={2}>
          {String(accommodation.title || 'Untitled Property')}
        </Text>
        
        <View style={styles.accommodationLocationContainer}>
          <Ionicons name="location-outline" size={14} color={theme.colors.text.secondary} />
          <Text style={styles.accommodationLocation} numberOfLines={1}>
            {String(accommodation.location || accommodation.city?.name || accommodation.city || 'Location not specified')}
          </Text>
        </View>
        
        <View style={styles.accommodationDetails}>
          <Text style={styles.accommodationPrice}>
            RM {String(accommodation.price || '0')}/month
          </Text>
          
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(accommodation.status) }]}>
            <Text style={styles.statusText}>
              {String(accommodation.status || 'unknown')}
            </Text>
          </View>
        </View>
        
        {(accommodation.rating !== undefined && accommodation.rating !== null) && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color={theme.colors.warning} />
            <Text style={styles.ratingText}>
              {Number(accommodation.rating).toFixed(1)} ({accommodation.reviewCount || 0} reviews)
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
};

const FoodProviderCard = ({ provider, onPress }) => {
  // Safety check for provider object
  if (!provider || typeof provider !== 'object') {
    return (
      <Card style={styles.foodProviderCard}>
        <View style={styles.placeholderLogo}>
          <Ionicons name="restaurant-outline" size={30} color={theme.colors.text.secondary} />
        </View>
        <View style={styles.providerContent}>
          <Text style={styles.providerName}>Invalid restaurant data</Text>
        </View>
      </Card>
    );
  }
  const getStatusColor = (status) => {
    if (!status) return theme.colors.text.secondary;
    
    switch (String(status).toLowerCase()) {
      case 'open':
      case 'active':
      case 'true':
        return theme.colors.success;
      case 'closed':
      case 'inactive':
      case 'false':
        return theme.colors.error;
      case 'busy':
        return theme.colors.warning;
      default:
        return theme.colors.text.secondary;
    }
  };

  // Determine status based on provider data
  const getProviderStatus = (provider) => {
    if (provider.is_active === true) return 'open';
    if (provider.is_active === false) return 'closed';
    if (provider.status) return provider.status;
    return 'unknown';
  };

  const providerStatus = getProviderStatus(provider);

  return (
    <Card style={styles.foodProviderCard} onPress={onPress}>
      {provider.logo ? (
        <Image
          source={{ uri: provider.logo }}
          style={styles.providerLogo}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholderLogo}>
          <Ionicons name="restaurant-outline" size={30} color={theme.colors.text.secondary} />
        </View>
      )}
        <View style={styles.providerContent}>
        <Text style={styles.providerName} numberOfLines={1}>
          {String(provider.businessName || provider.name || 'Unnamed Restaurant')}
        </Text>
        
        <Text style={styles.providerCuisine} numberOfLines={1}>
          {String(provider.cuisineType || provider.cuisine_type || provider.cuisine || 'Cuisine not specified')}
        </Text>
        
        <View style={styles.providerDetails}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={theme.colors.warning} />
            <Text style={styles.ratingText}>
              {(provider.rating !== undefined && provider.rating !== null) 
                ? Number(provider.rating).toFixed(1) 
                : 'N/A'}
            </Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(providerStatus) }]}>
            <Text style={styles.statusText}>
              {String(providerStatus)}
            </Text>
          </View>
        </View>
        
        {provider.deliveryTime && (
          <View style={styles.deliveryTimeContainer}>
            <Ionicons name="time-outline" size={14} color={theme.colors.text.secondary} />
            <Text style={styles.deliveryTime}>
              {String(provider.deliveryTime)} mins
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
};

const BookingCard = ({ booking, onPress }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return theme.colors.success;
      case 'pending':
        return theme.colors.warning;
      case 'cancelled':
        return theme.colors.error;
      case 'completed':
        return theme.colors.primary;
      default:
        return theme.colors.text.secondary;
    }
  };

  return (
    <Card style={styles.bookingCard} onPress={onPress}>      <View style={styles.bookingHeader}>
        <Text style={styles.bookingTitle} numberOfLines={1}>
          {booking.accommodationTitle || 'Accommodation Booking'}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
          <Text style={styles.statusText}>
            {booking.status || 'unknown'}
          </Text>
        </View>
      </View>
        <View style={styles.bookingDateContainer}>
        <Ionicons name="calendar-outline" size={14} color={theme.colors.text.secondary} />
        <Text style={styles.bookingDate}>
          {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
        </Text>
      </View>
        <View style={styles.bookingDetails}>
        <Text style={styles.bookingPrice}>
          RM {booking.totalAmount || '0'}
        </Text>
        <Text style={styles.bookingId}>
          #{booking.id || 'N/A'}
        </Text>
      </View>
    </Card>
  );
};

const OrderCard = ({ order, onPress }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return theme.colors.success;
      case 'preparing':
        return theme.colors.warning;
      case 'cancelled':
        return theme.colors.error;
      case 'on-the-way':
        return theme.colors.info;
      default:
        return theme.colors.text.secondary;
    }
  };

  return (
    <Card style={styles.orderCard} onPress={onPress}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderProvider} numberOfLines={1}>
          {order.providerName}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>
            {order.status}
          </Text>
        </View>
      </View>
      
      <Text style={styles.orderItems} numberOfLines={2}>
        {order.items?.map(item => item.name).join(', ')}
      </Text>
      
      <View style={styles.orderDetails}>
        <Text style={styles.orderTotal}>
          RM {order.totalAmount}
        </Text>
        <Text style={styles.orderDate}>
          {new Date(order.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </Card>
  );
};

const MenuItemCard = ({ menuItem, onPress, onEdit, onDelete }) => {
  // Safety check for menuItem object
  if (!menuItem || typeof menuItem !== 'object') {
    return (
      <Card style={styles.menuItemCard}>
        <View style={styles.placeholderItemImage}>
          <Ionicons name="fast-food-outline" size={30} color={theme.colors.text.secondary} />
        </View>
        <View style={styles.menuItemContent}>
          <Text style={styles.menuItemName}>Invalid menu item data</Text>
        </View>
      </Card>
    );
  }

  const getAvailabilityColor = (isAvailable) => {
    return isAvailable ? theme.colors.success : theme.colors.error;
  };

  return (
    <Card style={styles.menuItemCard} onPress={onPress}>
      {menuItem.image ? (
        <Image
          source={{ uri: menuItem.image }}
          style={styles.menuItemImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholderItemImage}>
          <Ionicons name="fast-food-outline" size={30} color={theme.colors.text.secondary} />
        </View>
      )}
      
      <View style={styles.menuItemContent}>
        <View style={styles.menuItemHeader}>
          <Text style={styles.menuItemName} numberOfLines={1}>
            {String(menuItem.name || 'Unnamed Item')}
          </Text>
          
          <View style={[styles.availabilityBadge, { backgroundColor: getAvailabilityColor(menuItem.isAvailable !== false) }]}>
            <Text style={styles.availabilityText}>
              {menuItem.isAvailable !== false ? 'Available' : 'Out of Stock'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.menuItemDescription} numberOfLines={2}>
          {String(menuItem.description || 'No description available')}
        </Text>
        
        <View style={styles.menuItemDetails}>
          <Text style={styles.menuItemPrice}>
            RM {String(menuItem.price || '0')}
          </Text>
          
          {menuItem.category && (
            <Text style={styles.menuItemCategory}>
              {String(menuItem.category)}
            </Text>
          )}
        </View>
        
        {(onEdit || onDelete) && (
          <View style={styles.menuItemActions}>
            {onEdit && (
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => onEdit(menuItem)}
              >
                <Ionicons name="pencil-outline" size={16} color={theme.colors.surface} />
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
            
            {onDelete && (
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => onDelete(menuItem)}
              >
                <Ionicons name="trash-outline" size={16} color={theme.colors.surface} />
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  // Accommodation Card Styles
  accommodationCard: {
    padding: 0,
    overflow: 'hidden',
  },
  accommodationImage: {
    width: '100%',
    height: 160,
  },
  placeholderImage: {
    width: '100%',
    height: 160,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accommodationContent: {
    padding: theme.spacing.medium,
  },
  accommodationTitle: {
    fontSize: theme.typography.sizes.medium,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,    marginBottom: theme.spacing.small,
  },
  accommodationLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
  },  accommodationLocation: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  accommodationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  accommodationPrice: {
    fontSize: theme.typography.sizes.medium,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  
  // Food Provider Card Styles
  foodProviderCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerLogo: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.medium,
    marginRight: theme.spacing.medium,
  },
  placeholderLogo: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.medium,
  },
  providerContent: {
    flex: 1,
  },  providerName: {
    fontSize: theme.typography.sizes.medium,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  providerCuisine: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.small,
  },  providerDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  deliveryTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },  deliveryTime: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  
  // Booking Card Styles
  bookingCard: {},
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  bookingTitle: {
    flex: 1,
    fontSize: theme.typography.sizes.medium,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,    marginRight: theme.spacing.small,
  },
  bookingDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
  },  bookingDate: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  bookingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingPrice: {
    fontSize: theme.typography.sizes.medium,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  bookingId: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text.secondary,
  },
  
  // Order Card Styles
  orderCard: {},
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  orderProvider: {
    flex: 1,
    fontSize: theme.typography.sizes.medium,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginRight: theme.spacing.small,
  },
  orderItems: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.medium,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotal: {
    fontSize: theme.typography.sizes.medium,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },  orderDate: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text.secondary,  },
  
  // Menu Item Card Styles
  menuItemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.medium,
    marginRight: theme.spacing.medium,
  },
  placeholderItemImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.medium,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  menuItemName: {
    flex: 1,
    fontSize: theme.typography.sizes.medium,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginRight: theme.spacing.small,
  },
  menuItemDescription: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.small,
  },
  menuItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
  },
  menuItemPrice: {
    fontSize: theme.typography.sizes.medium,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  menuItemCategory: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
  availabilityBadge: {
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.small,
  },
  availabilityText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.surface,
  },
  menuItemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.small,
    marginLeft: theme.spacing.small,
  },
  editButton: {
    backgroundColor: theme.colors.info,
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
  },
  actionButtonText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.surface,
    marginLeft: theme.spacing.xs,
  },
  
  // Shared Styles
  statusBadge: {
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.small,
  },
  statusText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.surface,
    textTransform: 'capitalize',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },  ratingText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
});

export default Card;
export { AccommodationCard, FoodProviderCard, BookingCard, OrderCard, MenuItemCard };
