import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  Alert,
  Dimensions,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { accommodationAPI } from '../../api/accommodationAPI';
import { reviewAPI } from '../../api/commonAPI';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { theme as importedTheme } from '../../styles/theme';

// Fallback theme object in case the imported one is undefined
const theme = importedTheme || {
  colors: {
    primary: '#4A6572',
    secondary: '#F9AA33',
    white: '#FFFFFF',
    background: '#FFFFFF',
    backgroundSecondary: '#F5F5F5',
    backgroundCard: '#FFFFFF',
    text: {
      primary: '#333333',
      secondary: '#666666',
      light: '#999999',
    },
    gray: {
      light: '#F5F5F5',
      medium: '#E0E0E0',
      dark: '#666666',
    },
    success: '#4ECDC4',
  },
  typography: {
    fontSize: {
      small: 12,
      medium: 14,
      large: 16,
      xlarge: 18,
      title: 24,
      heading: 28,
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semiBold: '600',
      bold: '700',
    },
    lineHeight: {
      large: 24,
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    medium: 8,
  },
  shadows: {
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
  }
};

console.log("Theme in AccommodationDetailScreen:", theme);

const { width } = Dimensions.get('window');

const AccommodationDetailScreen = ({ route, navigation }) => {
  // Access the ID safely with fallbacks
  console.log('AccommodationDetailScreen route params:', route?.params);
  const id = route?.params?.id || route?.params?.accommodationId;
  console.log('AccommodationDetailScreen ID:', id);
  
  const [accommodation, setAccommodation] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  useEffect(() => {
    if (id) {
      loadAccommodationDetails();
      loadReviews();
    } else {
      setLoading(false);
      Alert.alert('Error', 'Accommodation ID not provided.');
    }
  }, [id]);
  const loadAccommodationDetails = async () => {
    try {
      console.log('Loading accommodation details for ID:', id);
      const response = await accommodationAPI.getById(id);
      console.log('Accommodation API response:', response);
      
      // Handle different response structures
      let accommodationData = null;
      if (response.data) {
        accommodationData = response.data;
      } else if (response.accommodation) {
        accommodationData = response.accommodation;
      } else if (response) {
        accommodationData = response;
      }
        console.log('Processed accommodation data:', accommodationData);
      console.log('Accommodation fields:', {
        title: accommodationData?.title,
        price: accommodationData?.price,
        city: accommodationData?.city,
        status: accommodationData?.status,
        amenities: accommodationData?.amenities
      });
      setAccommodation(accommodationData);
    } catch (error) {
      console.error('Error loading accommodation details:', error);
      console.error('Error details:', JSON.stringify(error));
      Alert.alert('Error', 'Failed to load accommodation details.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await reviewAPI.getByTarget('accommodation', id);
      setReviews(response.data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };
  const handleBookNow = () => {
    navigation.navigate('BookingForm', { accommodation });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this accommodation: ${accommodation.title} in ${accommodation.city}, ${accommodation.country}`,
        title: accommodation.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  const renderImageGallery = () => {
    if (!accommodation.images || accommodation.images.length === 0) {
      return (
        <View style={styles.placeholderImage}>
          <Ionicons name="image-outline" size={48} color={theme.colors.gray.medium} />
        </View>
      );
    }

    return (
      <View style={styles.imageContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentImageIndex(index);
          }}
        >
          {accommodation.images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image }}
              style={styles.accommodationImage}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
        
        {/* Image indicators */}
        <View style={styles.imageIndicators}>
          {accommodation.images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentImageIndex && styles.activeIndicator
              ]}
            />
          ))}
        </View>

        {/* Share button */}
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color={theme.colors.white} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderAmenities = () => {
    if (!accommodation.amenities || accommodation.amenities.length === 0) {
      return <Text style={styles.noAmenitiesText}>No amenities listed</Text>;
    }    const displayedAmenities = showAllAmenities 
      ? accommodation.amenities 
      : (accommodation.amenities || []).slice(0, 6);

    return (
      <View>
        <View style={styles.amenitiesGrid}>
          {displayedAmenities.map((amenity, index) => (
            <View key={index} style={styles.amenityItem}>
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
              <Text style={styles.amenityText}>{amenity}</Text>
            </View>
          ))}
        </View>
        
        {accommodation.amenities.length > 6 && (
          <TouchableOpacity
            style={styles.showMoreButton}
            onPress={() => setShowAllAmenities(!showAllAmenities)}
          >
            <Text style={styles.showMoreText}>
              {showAllAmenities ? 'Show Less' : `Show ${accommodation.amenities.length - 6} More`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderReviews = () => {
    if (reviews.length === 0) {
      return <Text style={styles.noReviewsText}>No reviews yet</Text>;
    }

    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    return (
      <View>        <View style={styles.reviewsHeader}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={20} color={theme.colors.secondary} />
            <Text style={styles.averageRating}>{averageRating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({reviews.length} reviews)</Text>
          </View>
        </View>
        
        {(reviews || []).slice(0, 3).map((review) => (
          <View key={review.id} style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewerName}>{review.user?.name || 'Anonymous'}</Text>
              <View style={styles.reviewRating}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons
                    key={i}
                    name={i < review.rating ? 'star' : 'star-outline'}
                    size={14}
                    color={theme.colors.secondary}
                  />
                ))}
              </View>
            </View>
            <Text style={styles.reviewComment}>{review.comment}</Text>
            <Text style={styles.reviewDate}>
              {new Date(review.createdAt).toLocaleDateString()}
            </Text>
          </View>
        ))}
        
        {reviews.length > 3 && (
          <TouchableOpacity style={styles.viewAllReviewsButton}>
            <Text style={styles.viewAllReviewsText}>View All Reviews</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!accommodation) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Accommodation not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        {renderImageGallery()}

        {/* Content */}
        <View style={styles.content}>
          {/* Title and Location */}          <View style={styles.header}>
            <Text style={styles.title}>{accommodation.title || 'Untitled Property'}</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={16} color={theme.colors.gray.dark} />
              <Text style={styles.location}>
                {accommodation.address || 'Address not provided'}, {accommodation.city?.name || accommodation.city || 'City not specified'}, {accommodation.country?.name || accommodation.country || 'Country not specified'}
              </Text>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${accommodation.price || '0'}</Text>
            <Text style={styles.priceUnit}>per night</Text>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{accommodation.description || 'No description available'}</Text>
          </View>          {/* Amenities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            {renderAmenities()}
          </View>

          {/* Booking Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Booking Options</Text>
            <View style={styles.bookingOptionCard}>
              <View style={styles.bookingOptionHeader}>
                <Text style={styles.bookingOptionTitle}>
                  {accommodation.type || 'Standard Room'}
                </Text>
                <Text style={styles.bookingOptionPrice}>
                  ${accommodation.price || '0'}/night
                </Text>
              </View>
              
              <View style={styles.bookingOptionDetails}>
                <View style={styles.bookingOptionRow}>
                  <Ionicons name="people-outline" size={16} color={theme.colors.text.secondary} />
                  <Text style={styles.bookingOptionText}>
                    Max {accommodation.maxGuests || accommodation.capacity || '2'} guests
                  </Text>
                </View>
                
                {accommodation.bedrooms && (
                  <View style={styles.bookingOptionRow}>
                    <Ionicons name="bed-outline" size={16} color={theme.colors.text.secondary} />
                    <Text style={styles.bookingOptionText}>
                      {accommodation.bedrooms} bedroom{accommodation.bedrooms > 1 ? 's' : ''}
                    </Text>
                  </View>
                )}
                
                {accommodation.bathrooms && (
                  <View style={styles.bookingOptionRow}>
                    <Ionicons name="water-outline" size={16} color={theme.colors.text.secondary} />
                    <Text style={styles.bookingOptionText}>
                      {accommodation.bathrooms} bathroom{accommodation.bathrooms > 1 ? 's' : ''}
                    </Text>
                  </View>
                )}
              </View>
                <View style={styles.bookingOptionFooter}>
                <View style={styles.statusIndicator}>
                  <View style={[styles.statusDot, { 
                    backgroundColor: (accommodation.status === 'available' || !accommodation.status) ? theme.colors.success : theme.colors.error 
                  }]} />
                  <Text style={styles.statusText}>
                    {accommodation.status === 'available' || !accommodation.status ? 'Available' : 'Not Available'}
                  </Text>
                </View>
                
                <Button
                  title="Select This Option"
                  onPress={handleBookNow}
                  size="small"
                  disabled={accommodation.status && accommodation.status !== 'available'}
                />
              </View>
            </View>
          </View>          {/* Availability */}
          {(accommodation.availableFrom || accommodation.availableTo || accommodation.availability) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Availability</Text>
              <View style={styles.availabilityContainer}>
                {accommodation.availableFrom && (
                  <View style={styles.availabilityItem}>
                    <Text style={styles.availabilityLabel}>Available From:</Text>
                    <Text style={styles.availabilityValue}>
                      {new Date(accommodation.availableFrom).toLocaleDateString()}
                    </Text>
                  </View>
                )}
                {accommodation.availableTo && (
                  <View style={styles.availabilityItem}>
                    <Text style={styles.availabilityLabel}>Available To:</Text>
                    <Text style={styles.availabilityValue}>
                      {new Date(accommodation.availableTo).toLocaleDateString()}
                    </Text>
                  </View>
                )}
                {accommodation.availability && Array.isArray(accommodation.availability) && (
                  <View style={styles.availabilityItem}>
                    <Text style={styles.availabilityLabel}>Available Dates:</Text>
                    <Text style={styles.availabilityValue}>
                      {accommodation.availability.length} dates available
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Reviews */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            {renderReviews()}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>        <View style={styles.bottomPriceContainer}>
          <Text style={styles.bottomPrice}>${accommodation.price || '0'}</Text>
          <Text style={styles.bottomPriceUnit}>per night</Text>
        </View>        <Button
          title="Book Now"
          onPress={handleBookNow}
          style={styles.bookButton}
          disabled={accommodation.status && accommodation.status !== 'available'}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  accommodationImage: {
    width,
    height: 300,
  },
  placeholderImage: {
    width,
    height: 300,
    backgroundColor: theme.colors.gray.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: theme.spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.white,
    opacity: 0.5,
    marginHorizontal: 4,
  },
  activeIndicator: {
    opacity: 1,
  },
  shareButton: {
    position: 'absolute',
    top: 50,
    right: theme.spacing.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: theme.spacing.sm,
    borderRadius: 25,
  },  content: {
    padding: theme.spacing.md,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.heading,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing.lg,
  },
  price: {
    fontSize: theme.typography.fontSize.title,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  priceUnit: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.bold,    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.large,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: theme.spacing.sm,
  },
  amenityText: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.xs,
  },
  noAmenitiesText: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.text.light,
    fontStyle: 'italic',
  },
  showMoreButton: {
    marginTop: theme.spacing.sm,
  },  showMoreText: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  availabilityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  availabilityItem: {
    flex: 1,
  },
  availabilityLabel: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  availabilityValue: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  reviewsHeader: {
    marginBottom: theme.spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  averageRating: {
    fontSize: theme.typography.fontSize.large,    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.xs,
  },
  reviewCount: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  reviewItem: {
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  reviewerName: {
    fontSize: theme.typography.fontSize.medium,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: theme.typography.fontSize.medium,    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  reviewDate: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.light,
  },
  noReviewsText: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.text.light,
    fontStyle: 'italic',
  },
  viewAllReviewsButton: {
    marginTop: theme.spacing.sm,
  },  viewAllReviewsText: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.backgroundCard,
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray.light,
    ...theme.shadows.medium,
  },
  bottomPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bottomPrice: {
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  bottomPriceUnit: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },  bookButton: {
    flex: 0.6,
  },
  bookingOptionCard: {
    backgroundColor: theme.colors.backgroundCard,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.gray.light,
    ...theme.shadows.medium,
  },
  bookingOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  bookingOptionTitle: {
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
  },
  bookingOptionPrice: {
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  bookingOptionDetails: {
    marginBottom: theme.spacing.md,
  },
  bookingOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  bookingOptionText: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
  },
  bookingOptionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: theme.typography.fontSize.large,
    color: theme.colors.textSecondary,
  },
});

export default AccommodationDetailScreen;
