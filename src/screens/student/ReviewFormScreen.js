import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { reviewAPI } from '../../api/commonAPI';

const ReviewFormScreen = ({ route, navigation }) => {
  const { type, targetId, bookingId, orderId } = route.params;
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('Required', 'Please select a rating');
      return;
    }

    if (reviewText.trim().length < 10) {
      Alert.alert('Required', 'Please write at least 10 characters for your review');
      return;
    }

    try {
      setSubmitting(true);
      
      const reviewData = {
        rating,
        comment: reviewText.trim(),
        type,
        targetId,
        ...(bookingId && { bookingId }),
        ...(orderId && { orderId }),
      };

      await reviewAPI.create(reviewData);
      
      Alert.alert(
        'Success',
        'Your review has been submitted successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={32}
              color={star <= rating ? theme.colors.warning : theme.colors.border}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getRatingText = (rating) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Select a rating';
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'accommodation':
        return 'Rate Accommodation';
      case 'foodProvider':
        return 'Rate Food Provider';
      case 'order':
        return 'Rate Order';
      default:
        return 'Write Review';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'accommodation':
        return 'How was your stay? Your feedback helps other students find great accommodations.';
      case 'foodProvider':
        return 'How was the food and service? Your review helps other students discover great food options.';
      case 'order':
        return 'How was your order? Rate the food quality, delivery time, and overall experience.';
      default:
        return 'Share your experience to help other students make informed decisions.';
    }
  };

  if (submitting) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getTitle()}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Description */}
          <Text style={styles.description}>{getDescription()}</Text>

          {/* Rating Section */}
          <View style={styles.ratingSection}>
            <Text style={styles.sectionTitle}>Rating</Text>
            {renderStars()}
            <Text style={styles.ratingText}>{getRatingText(rating)}</Text>
          </View>

          {/* Review Text Section */}
          <View style={styles.reviewSection}>
            <Text style={styles.sectionTitle}>Your Review</Text>
            <TextInput
              style={styles.reviewInput}
              placeholder={`Share your experience...`}
              placeholderTextColor={theme.colors.textSecondary}
              value={reviewText}
              onChangeText={setReviewText}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.characterCount}>
              {reviewText.length}/500 characters
            </Text>
          </View>

          {/* Review Guidelines */}
          <View style={styles.guidelinesSection}>
            <Text style={styles.guidelinesTitle}>Review Guidelines</Text>
            <View style={styles.guideline}>
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
              <Text style={styles.guidelineText}>Be honest and constructive</Text>
            </View>
            <View style={styles.guideline}>
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
              <Text style={styles.guidelineText}>Focus on your experience</Text>
            </View>
            <View style={styles.guideline}>
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
              <Text style={styles.guidelineText}>Be respectful and appropriate</Text>
            </View>
            <View style={styles.guideline}>
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
              <Text style={styles.guidelineText}>Help other students make informed decisions</Text>
            </View>
          </View>

          {/* Submit Button */}
          <View style={styles.submitSection}>
            <Button
              title="Submit Review"
              onPress={handleSubmitReview}
              disabled={rating === 0 || reviewText.trim().length < 10}
              style={styles.submitButton}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
  },
  content: {
    padding: theme.spacing.md,
  },
  description: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  starButton: {
    padding: theme.spacing.xs,
    marginHorizontal: theme.spacing.xs,
  },
  ratingText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.primary,
  },
  reviewSection: {
    marginBottom: theme.spacing.xl,
  },
  reviewInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    height: 120,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  characterCount: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'right',
    marginTop: theme.spacing.xs,
  },
  guidelinesSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  guidelinesTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  guideline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  guidelineText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  submitSection: {
    marginTop: theme.spacing.md,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
  },
});

export default ReviewFormScreen;
