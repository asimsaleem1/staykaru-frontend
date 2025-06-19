import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/common/Card';
import { commonAPI } from '../../api/commonAPI';

const ActivityHistoryScreen = ({ navigation }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, bookings, orders, reviews

  useEffect(() => {
    loadActivityHistory();
  }, [filter]);

  const loadActivityHistory = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockActivities = [
        {
          id: '1',
          type: 'booking',
          title: 'Accommodation Booked',
          description: 'Sunset Villa - Room A1',
          date: '2024-12-15T10:30:00Z',
          status: 'confirmed',
          icon: 'home-outline',
          color: theme.colors.success,
        },
        {
          id: '2',
          type: 'order',
          title: 'Food Order Placed',
          description: 'Pizza Palace - 2 items',
          date: '2024-12-14T18:45:00Z',
          status: 'delivered',
          icon: 'restaurant-outline',
          color: theme.colors.primary,
        },
        {
          id: '3',
          type: 'review',
          title: 'Review Submitted',
          description: 'Rated Ocean View Hostel - 4 stars',
          date: '2024-12-13T14:20:00Z',
          status: 'published',
          icon: 'star-outline',
          color: theme.colors.warning,
        },
        {
          id: '4',
          type: 'booking',
          title: 'Booking Cancelled',
          description: 'Mountain Lodge - Room B2',
          date: '2024-12-12T09:15:00Z',
          status: 'cancelled',
          icon: 'home-outline',
          color: theme.colors.error,
        },
        {
          id: '5',
          type: 'order',
          title: 'Food Order Completed',
          description: 'Burger House - 3 items',
          date: '2024-12-11T19:30:00Z',
          status: 'completed',
          icon: 'restaurant-outline',
          color: theme.colors.success,
        },
      ];

      const filteredActivities = filter === 'all' 
        ? mockActivities 
        : mockActivities.filter(activity => activity.type === filter);

      setActivities(filteredActivities);
    } catch (error) {
      console.error('Error loading activity history:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadActivityHistory();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
      case 'delivered':
      case 'completed':
      case 'published':
        return theme.colors.success;
      case 'pending':
        return theme.colors.warning;
      case 'cancelled':
      case 'failed':
        return theme.colors.error;
      default:
        return theme.colors.text.secondary;
    }
  };

  const FilterButton = ({ type, label, isActive }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        isActive && styles.filterButtonActive,
      ]}
      onPress={() => setFilter(type)}
    >
      <Text
        style={[
          styles.filterButtonText,
          isActive && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const ActivityItem = ({ item }) => (
    <Card style={styles.activityCard}>
      <View style={styles.activityHeader}>
        <View style={styles.activityIconContainer}>
          <Ionicons
            name={item.icon}
            size={24}
            color={item.color}
          />
        </View>
        <View style={styles.activityInfo}>
          <Text style={styles.activityTitle}>{item.title}</Text>
          <Text style={styles.activityDescription}>{item.description}</Text>
          <Text style={styles.activityDate}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.activityStatus}>
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(item.status) },
            ]}
          >
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return <LoadingSpinner />;
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
        <Text style={styles.headerTitle}>Activity History</Text>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <FilterButton
          type="all"
          label="All"
          isActive={filter === 'all'}
        />
        <FilterButton
          type="booking"
          label="Bookings"
          isActive={filter === 'booking'}
        />
        <FilterButton
          type="order"
          label="Orders"
          isActive={filter === 'order'}
        />
        <FilterButton
          type="review"
          label="Reviews"
          isActive={filter === 'review'}
        />
      </View>

      {/* Activity List */}
      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        renderItem={ActivityItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="time-outline"
              size={64}
              color={theme.colors.text.secondary}
            />
            <Text style={styles.emptyTitle}>No Activity Found</Text>
            <Text style={styles.emptyText}>
              Your activity history will appear here
            </Text>
          </View>
        }
      />
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: theme.colors.white,
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  activityCard: {
    marginBottom: theme.spacing.md,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  activityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: theme.typography.h4.fontWeight,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  activityDescription: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  activityDate: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
  },
  activityStatus: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});

export default ActivityHistoryScreen;
