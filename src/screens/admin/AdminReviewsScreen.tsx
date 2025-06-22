import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api.service';

interface Review {
  _id: string;
  rating: number;
  comment: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  accommodation: {
    _id: string;
    title: string;
    location: string;
  };
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminReviewsScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState('all');

  const ratingFilters = ['all', '5', '4', '3', '2', '1'];

  useEffect(() => {
    if (user?.role !== 'admin') {
      Alert.alert('Access Denied', 'You do not have admin privileges', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      return;
    }
    fetchReviews();
  }, [user, navigation]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      console.log('⭐ Fetching all reviews...');
      
      // Note: This endpoint might not exist yet in the backend
      // For now, we'll simulate with mock data or handle the error gracefully
      try {
        const response = await api.get('/reviews');
        
        if (response.data) {
          const allReviews = response.data.sort((a: Review, b: Review) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setReviews(allReviews);
          setFilteredReviews(allReviews);
          console.log(`✅ Loaded ${allReviews.length} reviews`);
        }
      } catch (apiError) {
        console.log('Reviews endpoint not available, using mock data');
        // Mock data for demonstration
        const mockReviews: Review[] = [
          {
            _id: '1',
            rating: 5,
            comment: 'Excellent accommodation! Very clean and comfortable.',
            user: { _id: 'u1', name: 'John Doe', email: 'john@example.com' },
            accommodation: { _id: 'a1', title: 'Modern Studio Apartment', location: 'Mumbai' },
            isVisible: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: '2',
            rating: 4,
            comment: 'Good place, but could be better maintained.',
            user: { _id: 'u2', name: 'Jane Smith', email: 'jane@example.com' },
            accommodation: { _id: 'a2', title: 'Cozy Room Near College', location: 'Delhi' },
            isVisible: true,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            _id: '3',
            rating: 2,
            comment: 'Not satisfied with the cleanliness.',
            user: { _id: 'u3', name: 'Mike Johnson', email: 'mike@example.com' },
            accommodation: { _id: 'a3', title: 'Budget Apartment', location: 'Bangalore' },
            isVisible: false,
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            updatedAt: new Date(Date.now() - 172800000).toISOString()
          }
        ];
        setReviews(mockReviews);
        setFilteredReviews(mockReviews);
      }
    } catch (error) {
      console.error('❌ Error fetching reviews:', error);
      Alert.alert('Error', 'Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReviews();
  };

  const filterReviews = () => {
    let filtered = reviews;

    // Filter by rating
    if (selectedRating !== 'all') {
      filtered = filtered.filter(review => review.rating === parseInt(selectedRating));    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(review => 
        (review.comment || '').toLowerCase().includes(query) ||
        (review.user?.name || '').toLowerCase().includes(query) ||
        (review.accommodation?.title || '').toLowerCase().includes(query) ||
        (typeof review.accommodation?.location === 'string' ? review.accommodation.location : (review.accommodation?.location as any)?.name || (review.accommodation?.location as any)?.location || '').toLowerCase().includes(query)
      );
    }

    setFilteredReviews(filtered);
  };

  useEffect(() => {
    filterReviews();
  }, [searchQuery, selectedRating, reviews]);

  const handleReviewPress = (review: Review) => {
    console.log('Review selected:', review._id);
    // navigation.navigate('AdminReviewDetail', { reviewId: review._id });
  };

  const toggleReviewVisibility = async (reviewId: string, currentVisibility: boolean) => {
    try {
      Alert.alert(
        'Toggle Review Visibility',
        `Are you sure you want to ${currentVisibility ? 'hide' : 'show'} this review?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Confirm', 
            onPress: async () => {
              // Update local state immediately for better UX
              setReviews(prevReviews => 
                prevReviews.map(review => 
                  review._id === reviewId 
                    ? { ...review, isVisible: !currentVisibility }
                    : review
                )
              );
              
              // Note: This would need a backend endpoint to update review visibility
              console.log(`Toggle review ${reviewId} visibility to ${!currentVisibility}`);
              // Alert.alert('Info', 'Review visibility update feature coming soon');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error toggling review visibility:', error);
      Alert.alert('Error', 'Failed to update review visibility');
    }
  };

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const ReviewItem = ({ item }: { item: Review }) => (
    <TouchableOpacity 
      style={[
        styles.reviewItem,
        !item.isVisible && styles.hiddenReview
      ]}
      onPress={() => handleReviewPress(item)}
    >
      <View style={styles.reviewHeader}>
        <View style={styles.ratingContainer}>
          <Text style={styles.starsText}>{renderStars(item.rating)}</Text>
          <Text style={styles.ratingText}>({item.rating}/5)</Text>
        </View>
        <View style={[styles.visibilityBadge, { 
          backgroundColor: item.isVisible ? '#27ae60' : '#e74c3c' 
        }]}>
          <Text style={styles.visibilityText}>
            {item.isVisible ? 'Visible' : 'Hidden'}
          </Text>
        </View>
      </View>

      <Text style={styles.reviewComment} numberOfLines={3}>
        "{item.comment}"
      </Text>      <View style={styles.reviewDetails}>
        <Text style={styles.reviewUser}>👤 {item.user?.name || 'Unknown User'}</Text>
        <Text style={styles.reviewAccommodation}>
          🏠 {item.accommodation?.title || 'Unknown Property'}
        </Text>        <Text style={styles.reviewLocation}>
          📍 {typeof item.accommodation?.location === 'string' ? item.accommodation.location : (item.accommodation?.location as any)?.name || (item.accommodation?.location as any)?.location || 'Unknown Location'}
        </Text>
      </View>

      <View style={styles.reviewFooter}>
        <Text style={styles.reviewDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => toggleReviewVisibility(item._id, item.isVisible)}
        >
          <Text style={styles.actionButtonText}>
            {item.isVisible ? '👁️‍🗨️' : '🚫'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A6572" />
        <Text style={styles.loadingText}>Loading reviews...</Text>
      </View>
    );
  }

  const avgRating = getAverageRating();
  const ratingDist = getRatingDistribution();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Review Management</Text>
      <Text style={styles.subtitle}>
        Total Reviews: {reviews.length} | Avg Rating: {avgRating} ⭐
      </Text>

      {/* Rating Distribution */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Rating Distribution:</Text>
        <View style={styles.ratingStats}>
          {Object.entries(ratingDist).reverse().map(([rating, count]) => (
            <Text key={rating} style={styles.statItem}>
              {rating}⭐: {count}
            </Text>
          ))}
        </View>
      </View>

      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search reviews by comment, user, or accommodation..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Rating Filter */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by Rating:</Text>
        <View style={styles.ratingFilters}>
          {ratingFilters.map(rating => (
            <TouchableOpacity
              key={rating}
              style={[
                styles.filterButton,
                selectedRating === rating && styles.filterButtonActive
              ]}
              onPress={() => setSelectedRating(rating)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedRating === rating && styles.filterButtonTextActive
              ]}>
                {rating === 'all' ? 'All' : `${rating}⭐`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Results Info */}
      <Text style={styles.resultsInfo}>
        Showing {filteredReviews.length} of {reviews.length} reviews
      </Text>

      {/* Reviews List */}
      <FlatList
        data={filteredReviews}
        keyExtractor={(item) => item._id}
        renderItem={ReviewItem}
        style={styles.reviewsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 16,
  },
  statsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  ratingStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    fontSize: 14,
    color: '#7f8c8d',
    marginRight: 16,
    marginBottom: 4,
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  ratingFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButton: {
    backgroundColor: '#ecf0f1',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  filterButtonActive: {
    backgroundColor: '#f39c12',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  filterButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  resultsInfo: {
    fontSize: 14,
    color: '#95a5a6',
    marginBottom: 12,
  },
  reviewsList: {
    flex: 1,
  },
  reviewItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hiddenReview: {
    opacity: 0.6,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsText: {
    fontSize: 16,
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#f39c12',
    fontWeight: '600',
  },
  visibilityBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  visibilityText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  reviewComment: {
    fontSize: 16,
    color: '#2c3e50',
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 22,
  },
  reviewDetails: {
    marginBottom: 8,
  },
  reviewUser: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  reviewAccommodation: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  reviewLocation: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewDate: {
    fontSize: 12,
    color: '#95a5a6',
  },
  actionButton: {
    backgroundColor: '#ecf0f1',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 18,
  },
});

export default AdminReviewsScreen;
