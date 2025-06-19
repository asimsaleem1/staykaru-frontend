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
import { notificationAPI } from '../../api/notificationAPI';

const NotificationManagementScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);

  const filterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Unread', value: 'unread' },
    { label: 'Read', value: 'read' },
    { label: 'Booking', value: 'booking' },
    { label: 'Order', value: 'order' },
    { label: 'Payment', value: 'payment' }
  ];

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, selectedFilter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const [notificationsResponse, unreadResponse] = await Promise.all([
        notificationAPI.getAll(),
        notificationAPI.getUnreadCount()
      ]);
      
      setNotifications(notificationsResponse.data || []);
      setUnreadCount(unreadResponse.count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const filterNotifications = () => {
    let filtered = [...notifications];
    
    switch (selectedFilter) {
      case 'unread':
        filtered = filtered.filter(notification => !notification.read);
        break;
      case 'read':
        filtered = filtered.filter(notification => notification.read);
        break;
      case 'booking':
      case 'order':
      case 'payment':
        filtered = filtered.filter(notification => notification.type === selectedFilter);
        break;
      default:
        break;
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    setFilteredNotifications(filtered);
  };

  const handleMarkAsRead = async (notification) => {
    try {
      if (!notification.read) {
        await notificationAPI.markAsRead(notification.id);
        
        // Update local state
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      
      // Mark all unread notifications as read
      await Promise.all(
        unreadNotifications.map(notification => 
          notificationAPI.markAsRead(notification.id)
        )
      );
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
      
      Alert.alert('Success', 'All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking': return 'bed';
      case 'order': return 'restaurant';
      case 'payment': return 'card';
      case 'review': return 'star';
      case 'system': return 'settings';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'booking': return theme.colors.primary;
      case 'order': return theme.colors.warning;
      case 'payment': return theme.colors.success;
      case 'review': return theme.colors.info;
      case 'system': return theme.colors.text.secondary;
      default: return theme.colors.primary;
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const renderFilterTabs = () => (
    <View style={styles.filterContainer}>
      <FlatList
        data={filterOptions}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedFilter === item.value && styles.activeFilterTab,
            ]}
            onPress={() => setSelectedFilter(item.value)}
          >
            <Text style={[
              styles.filterTabText,
              selectedFilter === item.value && styles.activeFilterTabText,
            ]}>
              {item.label}
              {item.value === 'unread' && unreadCount > 0 && (
                <Text style={styles.unreadBadge}> ({unreadCount})</Text>
              )}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.value}
        contentContainerStyle={styles.filterTabs}
      />
    </View>
  );

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleMarkAsRead(item)}
      style={styles.notificationTouchable}
    >
      <Card style={[
        styles.notificationCard,
        !item.read && styles.unreadCard
      ]}>
        <View style={styles.notificationContent}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: getNotificationColor(item.type) + '20' }
          ]}>
            <Ionicons 
              name={getNotificationIcon(item.type)} 
              size={20} 
              color={getNotificationColor(item.type)} 
            />
          </View>
          
          <View style={styles.notificationBody}>
            <View style={styles.notificationHeader}>
              <Text style={[
                styles.notificationTitle,
                !item.read && styles.unreadTitle
              ]}>
                {item.title}
              </Text>
              <Text style={styles.notificationTime}>
                {formatTimeAgo(item.createdAt)}
              </Text>
            </View>
            
            <Text style={styles.notificationMessage} numberOfLines={2}>
              {item.message}
            </Text>
            
            <View style={styles.notificationFooter}>
              <Text style={[
                styles.notificationTag,
                { color: getNotificationColor(item.type) }
              ]}>
                {item.type.toUpperCase()}
              </Text>
              {!item.read && <View style={styles.unreadDot} />}
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>
            {unreadCount} unread of {notifications.length} total
          </Text>
        </View>
        {unreadCount > 0 && (
          <Button
            title="Mark All Read"
            onPress={handleMarkAllAsRead}
            variant="outline"
            style={styles.markAllButton}
          />
        )}
      </View>

      {/* Filter Tabs */}
      {renderFilterTabs()}

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={64} color={theme.colors.text.secondary} />
            <Text style={styles.emptyText}>No notifications</Text>
            <Text style={styles.emptySubtext}>
              {selectedFilter === 'all' 
                ? 'You\'ll see notifications here when they arrive'
                : `No ${selectedFilter} notifications found`
              }
            </Text>
          </View>
        }
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
    padding: 20,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  markAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterContainer: {
    backgroundColor: theme.colors.white,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterTabs: {
    paddingHorizontal: 15,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activeFilterTab: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterTabText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  activeFilterTabText: {
    color: theme.colors.white,
    fontWeight: '600',
  },
  unreadBadge: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 20,
  },
  notificationTouchable: {
    marginBottom: 10,
  },
  notificationCard: {
    padding: 16,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '05',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationBody: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
    marginRight: 8,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  notificationTime: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  notificationMessage: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTag: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginTop: 20,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default NotificationManagementScreen;
