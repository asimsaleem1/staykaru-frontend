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
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { userAPI } from '../../api/commonAPI';

const AdminUserDetailScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserDetail();
  }, []);

  const loadUserDetail = async () => {
    try {
      setLoading(true);
      // Mock user data - replace with actual API call
      const mockUser = {
        id: userId,
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        gender: 'male',
        role: 'student',
        status: 'active',
        createdAt: '2024-10-15T09:00:00Z',
        lastLogin: '2024-12-15T14:30:00Z',
        profile: {
          dateOfBirth: '1995-05-15',
          address: '123 Main St, City, Country',
          university: 'State University',
          emergencyContact: '+1 (555) 987-6543',
        },
        stats: {
          totalBookings: 5,
          totalOrders: 23,
          totalSpent: 2450.75,
          totalReviews: 8,
        },
      };

      setUser(mockUser);
    } catch (error) {
      console.error('Error loading user detail:', error);
      Alert.alert('Error', 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = () => {
    navigation.navigate('AdminEditUser', { userId: user.id });
  };

  const handleDeactivateUser = () => {
    Alert.alert(
      'Deactivate User',
      `Are you sure you want to deactivate ${user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Deactivate', style: 'destructive', onPress: confirmDeactivate },
      ]
    );
  };

  const confirmDeactivate = async () => {
    try {
      // API call to deactivate user
      Alert.alert('Success', 'User has been deactivated');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to deactivate user');
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return theme.colors.error;
      case 'landlord':
        return theme.colors.primary;
      case 'food_provider':
        return theme.colors.warning;
      case 'student':
        return theme.colors.success;
      default:
        return theme.colors.text.secondary;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>User Details</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>User not found</Text>
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
        <Text style={styles.headerTitle}>User Details</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEditUser}
        >
          <Ionicons name="create-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Basic Info */}
        <Card style={styles.userInfoCard}>
          <View style={styles.userHeader}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={48} color={theme.colors.text.secondary} />
            </View>
            <View style={styles.userBasicInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={styles.roleContainer}>
                <Text style={[styles.roleText, { color: getRoleColor(user.role) }]}>
                  {user.role.toUpperCase()}
                </Text>
                <View style={[styles.statusDot, { 
                  backgroundColor: user.status === 'active' 
                    ? theme.colors.success 
                    : theme.colors.error 
                }]} />
                <Text style={styles.statusText}>{user.status}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Contact Information */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.infoItem}>
            <Ionicons name="call-outline" size={20} color={theme.colors.text.secondary} />
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{user.phone}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={20} color={theme.colors.text.secondary} />
            <Text style={styles.infoLabel}>Address:</Text>
            <Text style={styles.infoValue}>{user.profile.address}</Text>
          </View>
          {user.profile.university && (
            <View style={styles.infoItem}>
              <Ionicons name="school-outline" size={20} color={theme.colors.text.secondary} />
              <Text style={styles.infoLabel}>University:</Text>
              <Text style={styles.infoValue}>{user.profile.university}</Text>
            </View>
          )}
          <View style={styles.infoItem}>
            <Ionicons name="call-outline" size={20} color={theme.colors.text.secondary} />
            <Text style={styles.infoLabel}>Emergency:</Text>
            <Text style={styles.infoValue}>{user.profile.emergencyContact}</Text>
          </View>
        </Card>

        {/* Account Information */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={20} color={theme.colors.text.secondary} />
            <Text style={styles.infoLabel}>Joined:</Text>
            <Text style={styles.infoValue}>{formatDate(user.createdAt)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={20} color={theme.colors.text.secondary} />
            <Text style={styles.infoLabel}>Last Login:</Text>
            <Text style={styles.infoValue}>{formatDate(user.lastLogin)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="cake-outline" size={20} color={theme.colors.text.secondary} />
            <Text style={styles.infoLabel}>Date of Birth:</Text>
            <Text style={styles.infoValue}>
              {new Date(user.profile.dateOfBirth).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="person-outline" size={20} color={theme.colors.text.secondary} />
            <Text style={styles.infoLabel}>Gender:</Text>
            <Text style={styles.infoValue}>{user.gender}</Text>
          </View>
        </Card>

        {/* User Statistics */}
        {user.role === 'student' && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Activity Statistics</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.stats.totalBookings}</Text>
                <Text style={styles.statLabel}>Bookings</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.stats.totalOrders}</Text>
                <Text style={styles.statLabel}>Orders</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>${user.stats.totalSpent}</Text>
                <Text style={styles.statLabel}>Total Spent</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.stats.totalReviews}</Text>
                <Text style={styles.statLabel}>Reviews</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <Button
            title="Edit User"
            onPress={handleEditUser}
            style={styles.actionButton}
          />
          {user.status === 'active' && (
            <Button
              title="Deactivate User"
              onPress={handleDeactivateUser}
              variant="outline"
              style={[styles.actionButton, styles.deactivateButton]}
            />
          )}
        </View>
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
  editButton: {
    padding: theme.spacing.sm,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  userInfoCard: {
    marginBottom: theme.spacing.md,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  userBasicInfo: {
    flex: 1,
  },
  userName: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  userEmail: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleText: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '600',
    marginRight: theme.spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    textTransform: 'capitalize',
  },
  sectionCard: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  infoLabel: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
    minWidth: 80,
  },
  infoValue: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.primary,
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
  },
  actionContainer: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  actionButton: {
    marginBottom: 0,
  },
  deactivateButton: {
    borderColor: theme.colors.error,
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

export default AdminUserDetailScreen;
