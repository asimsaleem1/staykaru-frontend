import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { notificationAPI } from '../../api/commonAPI';

const NotificationDetailScreen = ({ route, navigation }) => {
  const { notificationId } = route.params;
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotificationDetail();
  }, []);

  const loadNotificationDetail = async () => {
    try {
      setLoading(true);
      // Mock notification data - replace with actual API call
      const mockNotification = {
        id: notificationId,
        title: 'Booking Confirmed',
        message: 'Your booking for Sunset Villa has been confirmed by the landlord. Check-in date: December 20, 2024. Please ensure you arrive between 2 PM and 6 PM for smooth check-in process.',
        type: 'booking',
        referenceType: 'booking',
        referenceId: 'booking_123',
        read: false,
        createdAt: '2024-12-15T10:30:00Z',
        additionalData: {
          propertyName: 'Sunset Villa',
          checkIn: '2024-12-20',
          checkOut: '2024-12-25',
          guests: 2,
          totalPrice: 150,
        },
      };

      setNotification(mockNotification);

      // Mark as read if not already read
      if (!mockNotification.read) {
        await notificationAPI.markAsRead(notificationId);
      }
    } catch (error) {
      console.error('Error loading notification detail:', error);
      Alert.alert('Error', 'Failed to load notification details');
    } finally {
      setLoading(false);
    }
  };

  const handleActionPress = () => {
    if (!notification) return;

    // Navigate to relevant screen based on notification type
    switch (notification.referenceType) {
      case 'booking':
        navigation.navigate('BookingDetail', { bookingId: notification.referenceId });
        break;
      case 'order':
        navigation.navigate('OrderDetail', { orderId: notification.referenceId });
        break;
      case 'payment':
        navigation.navigate('Payment', { paymentId: notification.referenceId });
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return 'home-outline';
      case 'order':
        return 'restaurant-outline';
      case 'payment':
        return 'card-outline';
      case 'system':
        return 'information-circle-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'booking':
        return theme.colors.primary;
      case 'order':
        return theme.colors.warning;
      case 'payment':
        return theme.colors.success;
      case 'system':
        return theme.colors.info;
      default:
        return theme.colors.text.secondary;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!notification) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notification</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Notification not found</Text>
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
        <Text style={styles.headerTitle}>Notification</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notification Icon and Type */}
        <View style={styles.iconContainer}>
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: getNotificationColor(notification.type) + '20' },
            ]}
          >
            <Ionicons
              name={getNotificationIcon(notification.type)}
              size={48}
              color={getNotificationColor(notification.type)}
            />
          </View>
        </View>

        {/* Notification Title */}
        <Text style={styles.title}>{notification.title}</Text>

        {/* Notification Date */}
        <Text style={styles.date}>{formatDate(notification.createdAt)}</Text>

        {/* Notification Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.message}>{notification.message}</Text>
        </View>

        {/* Additional Data (if available) */}
        {notification.additionalData && (
          <View style={styles.additionalDataContainer}>
            <Text style={styles.additionalDataTitle}>Details:</Text>
            {notification.type === 'booking' && (
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Property:</Text>
                  <Text style={styles.detailValue}>
                    {notification.additionalData.propertyName}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Check-in:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(notification.additionalData.checkIn).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Check-out:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(notification.additionalData.checkOut).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Guests:</Text>
                  <Text style={styles.detailValue}>
                    {notification.additionalData.guests}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Total:</Text>
                  <Text style={styles.detailValue}>
                    ${notification.additionalData.totalPrice}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Action Button */}
        {notification.referenceId && (
          <View style={styles.actionContainer}>
            <Button
              title="View Details"
              onPress={handleActionPress}
              style={styles.actionButton}
            />
          </View>
        )}
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
  iconContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  date: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  messageContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  message: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.primary,
    lineHeight: 24,
  },
  additionalDataContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  additionalDataTitle: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: theme.typography.h4.fontWeight,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  detailsContainer: {
    gap: theme.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  detailLabel: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  actionContainer: {
    marginTop: theme.spacing.lg,
  },
  actionButton: {
    marginBottom: theme.spacing.xl,
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

export default NotificationDetailScreen;
