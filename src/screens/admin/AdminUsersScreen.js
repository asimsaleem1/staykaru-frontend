import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/common/Card';
import { theme } from '../../styles/theme';
import { commonAPI, adminAPI } from '../../api/commonAPI';
import { USER_ROLES, USER_STATUS } from '../../constants';

const AdminUsersScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [processingUser, setProcessingUser] = useState(null);

  const filterOptions = [
    { label: 'All Users', value: 'all' },
    { label: 'Students', value: 'student' },
    { label: 'Landlords', value: 'landlord' },
    { label: 'Food Providers', value: 'food_provider' },
    { label: 'Admins', value: 'admin' },
    { label: 'Active', value: 'active' },
    { label: 'Suspended', value: 'suspended' },
    { label: 'Banned', value: 'banned' },
  ];

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [])
  );

  useEffect(() => {
    filterUsers();
  }, [users, selectedFilter, searchQuery]);
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers();
      if (response.success) {
        setUsers(response.data);
      } else {
        setUsers(response.users || response || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by role or status
    if (selectedFilter !== 'all') {
      if (['student', 'landlord', 'food_provider', 'admin'].includes(selectedFilter)) {
        filtered = filtered.filter(user => user.role === selectedFilter);
      } else if (['active', 'suspended', 'banned'].includes(selectedFilter)) {
        filtered = filtered.filter(user => user.status === selectedFilter);
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const showActionModal = (user, action) => {
    setSelectedUser(user);
    setActionType(action);
    setModalVisible(true);
  };

  const handleUserAction = async () => {
    const validActions = ['suspend', 'ban', 'activate'];
    if (!validActions.includes(actionType)) {
      Alert.alert('Error', 'Invalid action.');
      return;
    }

    if ((actionType === 'suspend' || actionType === 'ban') && !actionReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for this action');
      return;
    }

    try {
      setProcessingUser(selectedUser.id);
      const response = await commonAPI.updateUserStatus(selectedUser.id, actionType, actionReason);
      
      if (response.success) {
        Alert.alert('Success', `User ${actionType}ed successfully!`);
        loadUsers();
        setModalVisible(false);
        setActionReason('');
      } else {
        Alert.alert('Error', response.message || `Failed to ${actionType} user`);
      }
    } catch (error) {
      console.error(`Error ${actionType} user:`, error);
      Alert.alert('Error', `Failed to ${actionType} user. Please try again later.`);
    } finally {
      setProcessingUser(null);
    }
  };

  const getUserStatusColor = (status) => {
    const statusColors = {
      active: theme.colors.success,
      suspended: theme.colors.warning,
      banned: theme.colors.error,
      pending: theme.colors.info,
    };
    return statusColors[status] || theme.colors.textLight;
  };

  const getUserRoleIcon = (role) => {
    const roleIcons = {
      student: 'school',
      landlord: 'home',
      food_provider: 'restaurant',
      admin: 'shield-checkmark',
    };
    return roleIcons[role] || 'person';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderUserCard = (user) => (
    <Card key={user.id} style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            {user.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: getUserStatusColor(user.status) + '20' }]}>
                <Ionicons 
                  name={getUserRoleIcon(user.role)} 
                  size={24} 
                  color={getUserStatusColor(user.status)} 
                />
              </View>
            )}
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            {user.phone && <Text style={styles.userPhone}>{user.phone}</Text>}
          </View>
        </View>
        <View style={styles.userBadges}>
          <View style={[styles.roleBadge, { backgroundColor: theme.colors.primary + '20' }]}>
            <Text style={[styles.roleText, { color: theme.colors.primary }]}>
              {user.role.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getUserStatusColor(user.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getUserStatusColor(user.status) }]}>
              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.userMetrics}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{user.totalBookings || 0}</Text>
          <Text style={styles.metricLabel}>Bookings</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{user.totalOrders || 0}</Text>
          <Text style={styles.metricLabel}>Orders</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{user.rating ? user.rating.toFixed(1) : 'N/A'}</Text>
          <Text style={styles.metricLabel}>Rating</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{formatDate(user.createdAt)}</Text>
          <Text style={styles.metricLabel}>Joined</Text>
        </View>
      </View>

      <View style={styles.userActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('AdminUserDetail', { userId: user.id })}
        >
          <Ionicons name="eye" size={16} color={theme.colors.primary} />
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>

        {user.status === 'active' && (
          <>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => showActionModal(user, 'suspend')}
              disabled={processingUser === user.id}
            >
              <Ionicons name="pause" size={16} color={theme.colors.warning} />
              <Text style={[styles.actionButtonText, { color: theme.colors.warning }]}>Suspend</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => showActionModal(user, 'ban')}
              disabled={processingUser === user.id}
            >
              <Ionicons name="ban" size={16} color={theme.colors.error} />
              <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>Ban</Text>
            </TouchableOpacity>
          </>
        )}

        {user.status === 'suspended' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => showActionModal(user, 'activate')}
            disabled={processingUser === user.id}
          >
            <Ionicons name="play" size={16} color={theme.colors.success} />
            <Text style={[styles.actionButtonText, { color: theme.colors.success }]}>Activate</Text>
          </TouchableOpacity>
        )}

        {user.status === 'banned' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => showActionModal(user, 'unban')}
            disabled={processingUser === user.id}
          >
            <Ionicons name="checkmark" size={16} color={theme.colors.success} />
            <Text style={[styles.actionButtonText, { color: theme.colors.success }]}>Unban</Text>
          </TouchableOpacity>
        )}
      </View>

      {processingUser === user.id && (
        <View style={styles.processingOverlay}>
          <LoadingSpinner size="small" />
        </View>
      )}
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Management</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search"
        />
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterTab,
              selectedFilter === option.value && styles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter(option.value)}
          >
            <Text
              style={[
                styles.filterTabText,
                selectedFilter === option.value && styles.filterTabTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Users List */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              Showing {filteredUsers.length} of {users.length} users
            </Text>
          </View>

          {filteredUsers.length > 0 ? (
            filteredUsers.map(renderUserCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color={theme.colors.textLight} />
              <Text style={styles.emptyStateTitle}>No Users Found</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery.trim()
                  ? 'No users match your search criteria.'
                  : 'No users found in the selected category.'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {actionType.charAt(0).toUpperCase() + actionType.slice(1)} User
            </Text>
            <Text style={styles.modalSubtitle}>
              Are you sure you want to {actionType} {selectedUser?.name}?
            </Text>
            
            {(actionType === 'suspend' || actionType === 'ban') && (
              <Input
                placeholder="Enter reason..."
                value={actionReason}
                onChangeText={setActionReason}
                multiline
                numberOfLines={3}
                style={styles.reasonInput}
              />
            )}

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => {
                  setModalVisible(false);
                  setActionReason('');
                }}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title={`${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`}
                onPress={handleUserAction}
                style={styles.modalButton}
                disabled={processingUser === selectedUser?.id}
                loading={processingUser === selectedUser?.id}
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
    backgroundColor: theme.colors.background,
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
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  filterContainer: {
    paddingVertical: theme.spacing.sm,
  },
  filterContent: {
    paddingHorizontal: theme.spacing.md,
  },
  filterTab: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterTabActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterTabText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
  },
  filterTabTextActive: {
    color: theme.colors.white,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.md,
  },
  statsContainer: {
    marginBottom: theme.spacing.md,
  },
  statsText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
  },
  userCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    position: 'relative',
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarContainer: {
    marginRight: theme.spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.full,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
  },
  userEmail: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  userPhone: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  userBadges: {
    alignItems: 'flex-end',
  },
  roleBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xs,
  },
  roleText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
  },
  userMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
  },
  metricLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  actionButtonText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyStateTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  emptyStateText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    margin: theme.spacing.md,
    width: '90%',
  },
  modalTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  modalSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.md,
  },
  reasonInput: {
    marginBottom: theme.spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
});

export default AdminUsersScreen;
