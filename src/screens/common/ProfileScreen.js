import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../../styles/theme';
import { USER_ROLES } from '../../constants';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { userAPI } from '../../api/commonAPI';
import { useAuth } from '../../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user, isLoading, logout } = useAuth();

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to update your profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        // Upload the image to the server
        await uploadProfileImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to update profile picture');
    }
  };

  const uploadProfileImage = async (imageAsset) => {
    try {
      const formData = new FormData();
      formData.append('profileImage', {
        uri: imageAsset.uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });

      await userAPI.updateProfileImage(formData);
      
      // Refresh profile data
      await fetchUserProfile();
      
      Alert.alert('Success', 'Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload profile picture');
    }
  };
  const handleLogout = async () => {
    try {
      await logout();
      Alert.alert('Success', 'You have been logged out');
      // No need to navigate manually - the AuthContext will handle navigation
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', error.message || 'Failed to log out');
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case USER_ROLES.STUDENT:
        return 'Student';
      case USER_ROLES.LANDLORD:
        return 'Landlord';
      case USER_ROLES.FOOD_PROVIDER:
        return 'Food Provider';
      case USER_ROLES.ADMIN:
        return 'Administrator';
      default:
        return 'User';
    }
  };

  const getProfileStats = () => {
    switch (user?.role) {
      case USER_ROLES.STUDENT:
        return [
          { label: 'Bookings', value: user.stats?.bookingsCount || 0 },
          { label: 'Orders', value: user.stats?.ordersCount || 0 },
          { label: 'Reviews', value: user.stats?.reviewsCount || 0 },
        ];
      case USER_ROLES.LANDLORD:
        return [
          { label: 'Properties', value: user.stats?.propertiesCount || 0 },
          { label: 'Bookings', value: user.stats?.bookingsCount || 0 },
          { label: 'Rating', value: user.stats?.averageRating || 0 },
        ];
      case USER_ROLES.FOOD_PROVIDER:
        return [
          { label: 'Menu Items', value: user.stats?.menuItemsCount || 0 },
          { label: 'Orders', value: user.stats?.ordersCount || 0 },
          { label: 'Rating', value: user.stats?.averageRating || 0 },
        ];
      default:
        return [];
    }  };
  
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Refresh profile data when screen comes into focus
      fetchUserProfile();
      setRefreshTrigger(prev => prev + 1);
    });
    
    return unsubscribe;
  }, [navigation]);

  const fetchUserProfile = async () => {
    try {
      const profileData = await userAPI.getProfile();
      // The auth context will be updated automatically if 
      // the API call uses the same auth token
      console.log('Profile refreshed:', profileData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Not logged in</Text>
          <Button title="Login" onPress={() => navigation.navigate('Auth')} />
        </View>
      </SafeAreaView>
    );
  }

  const profileStats = getProfileStats();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handleImagePicker}>
            <Image
              source={{ 
                uri: user.profileImage || 'https://via.placeholder.com/100x100?text=User' 
              }}
              style={styles.avatar}
            />
            <View style={styles.avatarOverlay}>
              <Ionicons name="camera" size={20} color={theme.colors.white} />
            </View>
          </TouchableOpacity>
          
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{getRoleDisplayName(user.role)}</Text>
          </View>
        </View>

        {/* Profile Stats */}
        {profileStats.length > 0 && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Statistics</Text>
            <View style={styles.statsContainer}>
              {profileStats.map((stat, index) => (
                <View key={index} style={styles.statItem}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('EditProfile')}
          >            <View style={styles.menuItemLeft}>
              <Ionicons name="person-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.menuItemText}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('ChangePassword')}
          >            <View style={styles.menuItemLeft}>
              <Ionicons name="lock-closed-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.menuItemText}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Notifications')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="notifications-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.menuItemText}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('ActivityHistory')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="time-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.menuItemText}>Activity History</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Help')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.menuItemText}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('About')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="information-circle-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.menuItemText}>About StayKaru</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            style={styles.logoutButton}
          />
        </View>

        {/* App Version */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
  },
  settingsButton: {
    padding: theme.spacing.xs,
  },
  profileSection: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.surface,
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  userName: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },  userEmail: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  roleBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  roleText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
  },
  statsSection: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  menuSection: {
    paddingVertical: theme.spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  logoutSection: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  logoutButton: {
    borderColor: theme.colors.error,
    borderWidth: 1,
  },
  versionSection: {
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  versionText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
});

export default ProfileScreen;
