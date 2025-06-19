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
import { notificationAPI } from '../../api/commonAPI';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getAll();
      
      // Handle different response structures
      let notificationsData = [];
      let unreadCountData = 0;
      
      if (response && response.data) {
        // If response has data property
        notificationsData = response.data.notifications || response.data || [];
        unreadCountData = response.data.unreadCount || 0;
      } else if (Array.isArray(response)) {
        // If response is directly an array
        notificationsData = response;
        unreadCountData = response.filter(n => !n.isRead).length;
      } else if (response && Array.isArray(response.notifications)) {
        // If response has notifications property
        notificationsData = response.notifications;
        unreadCountData = response.unreadCount || response.notifications.filter(n => !n.isRead).length;
      }
      
      setNotifications(notificationsData);
      setUnreadCount(unreadCountData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      
      // If the endpoint doesn't exist, provide mock data for now
      if (error.response?.status === 404 || error.message?.includes('404')) {
        console.warn('Notifications endpoint not found, using mock data');
        const mockNotifications = [
          {
            id: '1',
            title: 'Welcome to StayKaru!',
            message: 'Thank you for joining our platform. Explore accommodations and food options.',
            type: 'info',
            isRead: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            title: 'Profile Completion',
            message: 'Complete your profile to get better recommendations.',
            type: 'reminder',
            isRead: true,
            createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          },
        ];
        
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
        return;
      }
      
      // Provide more specific error messages
      let errorMessage = 'Failed to load notifications';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.error) {
        errorMessage = error.error;
      }
      
      Alert.alert('Error', errorMessage);
      
      // Set empty data on error
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };
  const markAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      ));
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      
      // For mock data or missing endpoint, still update local state
      if (error.response?.status === 404 || error.message?.includes('404')) {
        console.warn('Mark as read endpoint not found, updating locally only');
        
        setNotifications(prev => prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        ));
        
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
  };
  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      
      // Update local state
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
      
      Alert.alert('Success', 'All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      
      // For mock data or missing endpoint, still update local state
      if (error.response?.status === 404 || error.message?.includes('404')) {
        console.warn('Mark all as read endpoint not found, updating locally only');
        
        setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
        setUnreadCount(0);
        
        Alert.alert('Success', 'All notifications marked as read (local only)');
      } else {
        Alert.alert('Error', 'Failed to mark all notifications as read');
      }
    }
  };

  const deleteNotification = async (notificationId) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => confirmDelete(notificationId) },
      ]
    );
  };
  const confirmDelete = async (notificationId) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      
      // Update local state
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      
      // Update unread count if deleted notification was unread
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));      }
      
      Alert.alert('Success', 'Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      
      // For mock data or missing endpoint, still update local state
      if (error.response?.status === 404 || error.message?.includes('404')) {
        console.warn('Delete notification endpoint not found, updating locally only');
        
        const deletedNotification = notifications.find(n => n.id === notificationId);
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        
        if (deletedNotification && !deletedNotification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        
        Alert.alert('Success', 'Notification deleted (local only)');
      } else {
        Alert.alert('Error', 'Failed to delete notification');
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return 'bed-outline';
      case 'order':
        return 'restaurant-outline';
      case 'payment':
        return 'card-outline';
      case 'message':
        return 'chatbubble-outline';
      case 'review':
        return 'star-outline';
      case 'system':
        return 'information-circle-outline';
      case 'promotion':
        return 'gift-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'booking':
        return theme.colors.primary;
      case 'order':
        return theme.colors.secondary;
      case 'payment':
        return theme.colors.success;
      case 'message':
        return theme.colors.info;
      case 'review':
        return theme.colors.warning;
      case 'system':
        return theme.colors.textSecondary;
      case 'promotion':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const notificationDate = new Date(timestamp);
    const diffMs = now - notificationDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return notificationDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: notificationDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const handleNotificationPress = (notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'booking':
        if (notification.data?.bookingId) {
          navigation.navigate('BookingDetail', { bookingId: notification.data.bookingId });
        }
        break;
      case 'order':
        if (notification.data?.orderId) {
          navigation.navigate('OrderDetail', { orderId: notification.data.orderId });
        }
        break;
      case 'payment':
        navigation.navigate('PaymentHistory');
        break;
      case 'message':
        navigation.navigate('Messages');
        break;
      case 'review':
        if (notification.data?.reviewId) {
          navigation.navigate('ReviewDetail', { reviewId: notification.data.reviewId });
        }
        break;
      default:
        // Show notification detail in modal or alert
        Alert.alert(notification.title, notification.body);
        break;
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.isRead && styles.unreadNotification
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={getNotificationIcon(item.type)}
              size={20}
              color={getNotificationColor(item.type)}
            />
          </View>
          <View style={styles.notificationText}>
            <Text style={[styles.notificationTitle, !item.isRead && styles.unreadTitle]}>
              {item.title}
            </Text>
            <Text style={styles.notificationBody}>{item.body}</Text>
            <Text style={styles.notificationTime}>
              {formatTimestamp(item.createdAt)}
            </Text>
          </View>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
      </View>
      
      {/* Actions */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteNotification(item.id)}
      >
        <Ionicons name="trash-outline" size={16} color={theme.colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="notifications-outline" size={64} color={theme.colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptyDescription}>
        You'll see notifications about your bookings, orders, and account activity here.
      </Text>
    </View>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={markAllAsRead}
          >
            <Text style={styles.markAllText}>Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={notifications.length === 0 ? styles.emptyContainer : null}
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
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
  },
  unreadBadge: {
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: theme.spacing.sm,
  },
  unreadBadgeText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semiBold,
  },
  markAllButton: {
    padding: theme.spacing.xs,
  },
  markAllText: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  unreadNotification: {
    backgroundColor: theme.colors.surface,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  notificationText: {
    flex: 1,
  },  notificationTitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  unreadTitle: {
    fontWeight: theme.typography.weights.semiBold,
  },
  notificationBody: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: theme.spacing.xs,
  },
  notificationTime: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginLeft: theme.spacing.sm,
  },
  deleteButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },  emptyTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptyDescription: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

// Add default export for compatibility with stack navigation
export default NotificationsScreen;
