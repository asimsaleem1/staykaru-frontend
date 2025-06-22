import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext.js';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api.service';

interface AppSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  autoApproveAccommodations: boolean;
  maxImagesPerAccommodation: number;
  minPasswordLength: number;
  sessionTimeoutMinutes: number;
}

const AdminSettingsScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  
  const [settings, setSettings] = useState<AppSettings>({
    pushNotifications: true,
    emailNotifications: true,
    autoApproveAccommodations: false,
    maxImagesPerAccommodation: 5,
    minPasswordLength: 8,
    sessionTimeoutMinutes: 60,
  });
  
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (key: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      console.log('💾 Saving admin settings...');
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasChanges(false);
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Admin Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🚪 Admin logging out...');
              
              try {
                await api.post('/auth/logout');
              } catch (logoutError) {
                console.log('Logout API call failed, proceeding with local cleanup');
              }
              
              await logout();
              console.log('✅ Admin logout successful');
              
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' as never }],
              });
              
            } catch (error) {
              console.error('❌ Error during logout:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const clearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          onPress: () => {
            console.log('🧹 Clearing cache...');
            Alert.alert('Success', 'Cache cleared successfully');
          }
        }
      ]
    );
  };

  const exportData = () => {
    Alert.alert(
      'Export Data',
      'This will export all app data. This may take a while.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Export', 
          onPress: () => {
            console.log('📤 Exporting data...');
            Alert.alert('Info', 'Data export feature coming soon');
          }
        }
      ]
    );
  };

  const SettingCard = ({ icon, title, subtitle, children }: {
    icon: string;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
  }) => (
    <View style={styles.settingCard}>
      <View style={styles.settingHeader}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingIcon}>{icon}</Text>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>{title}</Text>
            {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
          </View>
        </View>
        {children}
      </View>
    </View>
  );

  const ActionCard = ({ icon, title, subtitle, onPress, danger = false }: {
    icon: string;
    title: string;
    subtitle: string;
    onPress: () => void;
    danger?: boolean;
  }) => (
    <TouchableOpacity 
      style={[styles.actionCard, danger && styles.dangerCard]} 
      onPress={onPress}
    >
      <View style={styles.actionInfo}>
        <Text style={styles.actionIcon}>{icon}</Text>
        <View style={styles.actionText}>
          <Text style={[styles.actionTitle, danger && styles.dangerText]}>{title}</Text>
          <Text style={styles.actionSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Text style={[styles.chevron, danger && styles.dangerText]}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Admin Settings</Text>
        <Text style={styles.subtitle}>Manage application settings and preferences</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Profile</Text>
          <View style={styles.profileCard}>
            <View style={styles.profileInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'A'}</Text>
              </View>
              <View style={styles.profileDetails}>
                <Text style={styles.profileName}>{user?.name || 'Admin User'}</Text>
                <Text style={styles.profileEmail}>{user?.email || 'admin@staykarru.com'}</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>Administrator</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Application Settings</Text>
          
          <SettingCard 
            icon="🔔" 
            title="Push Notifications"
            subtitle="Receive push notifications for important updates"
          >
            <Switch
              value={settings.pushNotifications}
              onValueChange={(value) => handleSettingChange('pushNotifications', value)}
              trackColor={{ false: '#e2e8f0', true: '#3b82f6' }}
              thumbColor={settings.pushNotifications ? '#ffffff' : '#f1f5f9'}
            />
          </SettingCard>

          <SettingCard 
            icon="📧" 
            title="Email Notifications"
            subtitle="Receive email alerts for system events"
          >
            <Switch
              value={settings.emailNotifications}
              onValueChange={(value) => handleSettingChange('emailNotifications', value)}
              trackColor={{ false: '#e2e8f0', true: '#3b82f6' }}
              thumbColor={settings.emailNotifications ? '#ffffff' : '#f1f5f9'}
            />
          </SettingCard>

          <SettingCard 
            icon="✅" 
            title="Auto-approve Accommodations"
            subtitle="Automatically approve new accommodation listings"
          >
            <Switch
              value={settings.autoApproveAccommodations}
              onValueChange={(value) => handleSettingChange('autoApproveAccommodations', value)}
              trackColor={{ false: '#e2e8f0', true: '#3b82f6' }}
              thumbColor={settings.autoApproveAccommodations ? '#ffffff' : '#f1f5f9'}
            />
          </SettingCard>
        </View>

        {/* System Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ System Management</Text>
          
          <ActionCard
            icon="🧹"
            title="Clear Cache"
            subtitle="Clear all cached data and temporary files"
            onPress={clearCache}
          />

          <ActionCard
            icon="📤"
            title="Export Data"
            subtitle="Export system data for backup purposes"
            onPress={exportData}
          />

          <ActionCard
            icon="📊"
            title="System Reports"
            subtitle="View detailed system analytics and reports"
            onPress={() => console.log('Navigate to reports')}
          />
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔐 Account</Text>
          
          <ActionCard
            icon="🚪"
            title="Logout"
            subtitle="Sign out from your admin account"
            onPress={handleLogout}
            danger={true}
          />
        </View>

        {/* Save Button */}
        {hasChanges && (
          <View style={styles.saveContainer}>
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={saveSettings}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveButtonText}>💾 Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#64748b',
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  settingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  dangerCard: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  actionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  dangerText: {
    color: '#dc2626',
  },
  chevron: {
    fontSize: 24,
    color: '#94a3b8',
    fontWeight: '300',
  },
  saveContainer: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AdminSettingsScreen;
