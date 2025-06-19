import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import { theme } from '../../styles/theme';

const SettingsScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState({
    notifications: {
      push: true,
      email: true,
      sms: false,
      bookingUpdates: true,
      orderUpdates: true,
      promotions: false,
    },
    privacy: {
      profileVisible: true,
      showEmail: false,
      showPhone: false,
      allowLocationTracking: true,
    },
    app: {
      darkMode: false,
      language: 'en',
      autoLogout: false,
      biometricAuth: false,
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const updateSetting = (category, key, value) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value,
      },
    };
    saveSettings(newSettings);
  };

  const clearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data and may slow down the app temporarily. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear specific cache keys (keep user auth and settings)
              const keysToKeep = ['userToken', 'appSettings', 'userProfile'];
              const allKeys = await AsyncStorage.getAllKeys();
              const keysToRemove = allKeys.filter(key => !keysToKeep.includes(key));
              await AsyncStorage.multiRemove(keysToRemove);
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  const resetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'This will reset all settings to default values. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const defaultSettings = {
              notifications: {
                push: true,
                email: true,
                sms: false,
                bookingUpdates: true,
                orderUpdates: true,
                promotions: false,
              },
              privacy: {
                profileVisible: true,
                showEmail: false,
                showPhone: false,
                allowLocationTracking: true,
              },
              app: {
                darkMode: false,
                language: 'en',
                autoLogout: false,
                biometricAuth: false,
              },
            };
            saveSettings(defaultSettings);
            Alert.alert('Success', 'Settings reset to default');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const renderToggleItem = (title, subtitle, category, key, icon) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={20} color={theme.colors.primary} />
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Switch
        value={settings[category][key]}
        onValueChange={(value) => updateSetting(category, key, value)}
        trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
        thumbColor={settings[category][key] ? theme.colors.primary : theme.colors.surface}
      />
    </View>
  );

  const renderNavigationItem = (title, subtitle, icon, onPress, showArrow = true) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={20} color={theme.colors.primary} />
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <View style={styles.content}>
          {/* Account Section */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            
            {renderNavigationItem(
              'Edit Profile',
              'Update your personal information',
              'person-outline',
              () => navigation.navigate('EditProfile')
            )}
            
            {renderNavigationItem(
              'Change Password',
              'Update your account password',
              'lock-closed-outline',
              () => navigation.navigate('ChangePassword')
            )}
            
            {renderToggleItem(
              'Biometric Authentication',
              'Use fingerprint or face ID to login',
              'app',
              'biometricAuth',
              'finger-print-outline'
            )}
          </Card>

          {/* Notifications Section */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            
            {renderToggleItem(
              'Push Notifications',
              'Receive notifications on your device',
              'notifications',
              'push',
              'notifications-outline'
            )}
            
            {renderToggleItem(
              'Email Notifications',
              'Receive notifications via email',
              'notifications',
              'email',
              'mail-outline'
            )}
            
            {renderToggleItem(
              'SMS Notifications',
              'Receive notifications via SMS',
              'notifications',
              'sms',
              'chatbox-outline'
            )}
            
            {user?.role === 'student' && (
              <>
                {renderToggleItem(
                  'Booking Updates',
                  'Get notified about booking status changes',
                  'notifications',
                  'bookingUpdates',
                  'calendar-outline'
                )}
                
                {renderToggleItem(
                  'Order Updates',
                  'Get notified about order status changes',
                  'notifications',
                  'orderUpdates',
                  'receipt-outline'
                )}
              </>
            )}
            
            {renderToggleItem(
              'Promotions & Offers',
              'Receive promotional notifications',
              'notifications',
              'promotions',
              'gift-outline'
            )}
          </Card>

          {/* Privacy Section */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy</Text>
            
            {renderToggleItem(
              'Profile Visibility',
              'Make your profile visible to others',
              'privacy',
              'profileVisible',
              'eye-outline'
            )}
            
            {renderToggleItem(
              'Show Email',
              'Display email in your public profile',
              'privacy',
              'showEmail',
              'mail-outline'
            )}
            
            {renderToggleItem(
              'Show Phone',
              'Display phone number in your public profile',
              'privacy',
              'showPhone',
              'call-outline'
            )}
            
            {renderToggleItem(
              'Location Tracking',
              'Allow app to access your location',
              'privacy',
              'allowLocationTracking',
              'location-outline'
            )}
          </Card>

          {/* App Settings Section */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>App Settings</Text>
            
            {renderToggleItem(
              'Dark Mode',
              'Use dark theme (coming soon)',
              'app',
              'darkMode',
              'moon-outline'
            )}
            
            {renderNavigationItem(
              'Language',
              'English (EN)',
              'language-outline',
              () => Alert.alert('Coming Soon', 'Multiple languages will be supported soon!')
            )}
            
            {renderToggleItem(
              'Auto Logout',
              'Automatically logout after inactivity',
              'app',
              'autoLogout',
              'log-out-outline'
            )}
          </Card>

          {/* Support Section */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            
            {renderNavigationItem(
              'Help Center',
              'Get help and support',
              'help-circle-outline',
              () => navigation.navigate('Help')
            )}
            
            {renderNavigationItem(
              'About',
              'App version and information',
              'information-circle-outline',
              () => navigation.navigate('About')
            )}
            
            {renderNavigationItem(
              'Contact Support',
              'Get in touch with our team',
              'mail-outline',
              () => Alert.alert('Contact Support', 'Email: support@staykaru.com\nPhone: +60 12-345-6789')
            )}
          </Card>

          {/* Data & Storage Section */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Data & Storage</Text>
            
            {renderNavigationItem(
              'Clear Cache',
              'Free up storage space',
              'trash-outline',
              clearCache,
              false
            )}
            
            {renderNavigationItem(
              'Reset Settings',
              'Reset all settings to default',
              'refresh-outline',
              resetSettings,
              false
            )}
          </Card>

          {/* Logout Section */}
          <Card style={[styles.section, styles.logoutSection]}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out" size={20} color={theme.colors.error} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </Card>

          {/* App Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>StayKaru v1.0.0</Text>
            <Text style={styles.versionSubtext}>© 2024 StayKaru. All rights reserved.</Text>
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
  scrollContainer: {
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
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
  },
  content: {
    padding: theme.spacing.md,
  },
  section: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  settingTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
  },
  settingSubtitle: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  logoutSection: {
    borderWidth: 1,
    borderColor: theme.colors.error + '30',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
  },
  logoutText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.error,
    marginLeft: theme.spacing.sm,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  versionText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
  },
  versionSubtext: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
});

export default SettingsScreen;
