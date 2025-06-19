import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/common/Card';
import { theme } from '../../styles/theme';
import { commonAPI } from '../../api/commonAPI';

const AdminReviewsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionReason, setActionReason] = useState('');

  const filterOptions = [
    { label: 'All Reviews', value: 'all' },
    { label: 'Accommodation', value: 'accommodation' },
    { label: 'Food Provider', value: 'food_provider' },
    { label: 'Approved', value: 'approved' },
    { label: 'Pending', value: 'pending' },
    { label: 'Flagged', value: 'flagged' },
    { label: 'Removed', value: 'removed' },
  ];

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await commonAPI.getAllReviews();
      setReviews(response.reviews || []);
      setFilteredReviews(response.reviews || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
      Alert.alert('Error', 'Failed to load reviews');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadReviews();
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = reviews.filter(review =>
      review.content.toLowerCase().includes(text.toLowerCase()) ||
      review.user.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredReviews(filtered);
  };

  const handleFilter = (filterValue) => {
    setSelectedFilter(filterValue);
    let filtered = [...reviews];

    if (filterValue !== 'all') {
      filtered = reviews.filter(review => review.status === filterValue);
    }

    if (searchQuery) {
      filtered = filtered.filter(review =>
        review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredReviews(filtered);
  };

  const handleActionPress = (review, type) => {
    setSelectedReview(review);
    setActionType(type);
    setActionReason('');
    setModalVisible(true);
  };

  const handleAction = async () => {
    if (!actionReason) {
      Alert.alert('Error', 'Please provide a reason for this action');
      return;
    }

    try {
      setLoading(true);
      let response;

      switch (actionType) {
        case 'approve':
          response = await commonAPI.approveReview(selectedReview.id, actionReason);
          break;
        case 'flag':
          response = await commonAPI.flagReview(selectedReview.id, actionReason);
          break;
        case 'remove':
          response = await commonAPI.removeReview(selectedReview.id, actionReason);
          break;
        default:
          throw new Error('Invalid action type');
      }

      Alert.alert('Success', response.message || 'Review updated successfully');
      setModalVisible(false);
      loadReviews();
    } catch (error) {
      console.error('Error handling review action:', error);
      Alert.alert('Error', error.message || 'Failed to update review');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reviews Management</Text>
        <Input
          placeholder="Search reviews..."
          value={searchQuery}
          onChangeText={handleSearch}
          style={styles.searchInput}
          leftIcon={<Ionicons name="search" size={20} color={theme.colors.text} />}
        />
      </View>

      <ScrollView 
        horizontal 
        style={styles.filterContainer}
        showsHorizontalScrollIndicator={false}
      >
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterButton,
              selectedFilter === option.value && styles.filterButtonActive
            ]}
            onPress={() => handleFilter(option.value)}
          >
            <Text style={[
              styles.filterButtonText,
              selectedFilter === option.value && styles.filterButtonTextActive
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {filteredReviews.length === 0 ? (
          <Text style={styles.emptyText}>No reviews found</Text>
        ) : (
          filteredReviews.map((review) => (
            <Card key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{review.user.name}</Text>
                  <Text style={styles.reviewDate}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.ratingContainer}>
                  {[...Array(5)].map((_, index) => (
                    <Ionicons
                      key={index}
                      name={index < review.rating ? 'star' : 'star-outline'}
                      size={16}
                      color={theme.colors.warning}
                    />
                  ))}
                </View>
              </View>

              <Text style={styles.reviewContent}>{review.content}</Text>

              <View style={styles.reviewFooter}>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{review.status}</Text>
                </View>
                <View style={styles.actionButtons}>
                  {review.status === 'pending' && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => handleActionPress(review, 'approve')}
                    >
                      <Text style={styles.actionButtonText}>Approve</Text>
                    </TouchableOpacity>
                  )}
                  {review.status !== 'removed' && (
                    <>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.flagButton]}
                        onPress={() => handleActionPress(review, 'flag')}
                      >
                        <Text style={styles.actionButtonText}>Flag</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.removeButton]}
                        onPress={() => handleActionPress(review, 'remove')}
                      >
                        <Text style={styles.actionButtonText}>Remove</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {actionType === 'approve' ? 'Approve Review' :
               actionType === 'flag' ? 'Flag Review' :
               'Remove Review'}
            </Text>
            <Text style={styles.modalSubtitle}>
              Please provide a reason for this action:
            </Text>
            <Input
              value={actionReason}
              onChangeText={setActionReason}
              placeholder="Enter reason..."
              multiline
              numberOfLines={4}
              style={styles.reasonInput}
            />
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setModalVisible(false)}
                style={[styles.modalButton, { backgroundColor: theme.colors.grey }]}
              />
              <Button
                title="Confirm"
                onPress={handleAction}
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  header: {
    padding: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16
  },
  searchInput: {
    marginTop: 8
  },
  filterContainer: {
    paddingVertical: 8
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary
  },
  filterButtonText: {
    color: theme.colors.text
  },
  filterButtonTextActive: {
    color: theme.colors.background
  },
  content: {
    flex: 1
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20
  },
  reviewCard: {
    marginVertical: 8,
    marginHorizontal: 16
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  userInfo: {
    flexDirection: 'column'
  },
  userName: {
    fontWeight: 'bold'
  },
  reviewDate: {
    fontSize: 12,
    color: theme.colors.grey
  },
  ratingContainer: {
    flexDirection: 'row'
  },
  reviewContent: {
    marginVertical: 8
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: theme.colors.grey
  },
  statusText: {
    color: theme.colors.background
  },
  actionButtons: {
    flexDirection: 'row'
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  approveButton: {
    backgroundColor: theme.colors.success
  },
  flagButton: {
    backgroundColor: theme.colors.warning
  },
  removeButton: {
    backgroundColor: theme.colors.danger
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalContent: {
    width: '80%',
    padding: 16,
    backgroundColor: theme.colors.background,
    borderRadius: 8
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  modalSubtitle: {
    marginVertical: 8
  },
  reasonInput: {
    borderColor: theme.colors.grey,
    borderWidth: 1,
    borderRadius: 4,
    padding: 8
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4
  }
});

export default AdminReviewsScreen;
