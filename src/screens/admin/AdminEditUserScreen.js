import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { userAPI } from '../../api/commonAPI';
import { USER_ROLES } from '../../constants';

const AdminEditUserScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'student',
    status: 'active',
    gender: 'male',
    dateOfBirth: '',
    address: '',
    university: '',
    emergencyContact: '',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
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
        profile: {
          dateOfBirth: '1995-05-15',
          address: '123 Main St, City, Country',
          university: 'State University',
          emergencyContact: '+1 (555) 987-6543',
        },
      };

      setFormData({
        name: mockUser.name,
        email: mockUser.email,
        phone: mockUser.phone,
        role: mockUser.role,
        status: mockUser.status,
        gender: mockUser.gender,
        dateOfBirth: mockUser.profile.dateOfBirth,
        address: mockUser.profile.address,
        university: mockUser.profile.university || '',
        emergencyContact: mockUser.profile.emergencyContact,
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Validation Error', 'Email is required');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Validation Error', 'Phone is required');
      return false;
    }
    if (!formData.address.trim()) {
      Alert.alert('Validation Error', 'Address is required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      // API call to update user
      console.log('Updating user:', formData);
      
      Alert.alert('Success', 'User updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error updating user:', error);
      Alert.alert('Error', 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const PickerItem = ({ label, value, options, onChange }) => (
    <View style={styles.pickerContainer}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <View style={styles.pickerOptions}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.pickerOption,
              value === option.value && styles.pickerOptionActive,
            ]}
            onPress={() => onChange(option.value)}
          >
            <Text
              style={[
                styles.pickerOptionText,
                value === option.value && styles.pickerOptionTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
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
        <Text style={styles.headerTitle}>Edit User</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Ionicons name="checkmark" size={24} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <Input
            label="Full Name"
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            placeholder="Enter full name"
          />

          <Input
            label="Email Address"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Phone Number"
            value={formData.phone}
            onChangeText={(value) => handleInputChange('phone', value)}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />

          <PickerItem
            label="Gender"
            value={formData.gender}
            onChange={(value) => handleInputChange('gender', value)}
            options={[
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' },
              { label: 'Other', value: 'other' },
            ]}
          />

          <Input
            label="Date of Birth"
            value={formData.dateOfBirth}
            onChangeText={(value) => handleInputChange('dateOfBirth', value)}
            placeholder="YYYY-MM-DD"
          />
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <PickerItem
            label="Role"
            value={formData.role}
            onChange={(value) => handleInputChange('role', value)}
            options={[
              { label: 'Student', value: 'student' },
              { label: 'Landlord', value: 'landlord' },
              { label: 'Food Provider', value: 'food_provider' },
              { label: 'Admin', value: 'admin' },
            ]}
          />

          <PickerItem
            label="Status"
            value={formData.status}
            onChange={(value) => handleInputChange('status', value)}
            options={[
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
              { label: 'Suspended', value: 'suspended' },
            ]}
          />
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <Input
            label="Address"
            value={formData.address}
            onChangeText={(value) => handleInputChange('address', value)}
            placeholder="Enter full address"
            multiline
            numberOfLines={3}
          />

          <Input
            label="Emergency Contact"
            value={formData.emergencyContact}
            onChangeText={(value) => handleInputChange('emergencyContact', value)}
            placeholder="Enter emergency contact number"
            keyboardType="phone-pad"
          />

          {formData.role === 'student' && (
            <Input
              label="University"
              value={formData.university}
              onChangeText={(value) => handleInputChange('university', value)}
              placeholder="Enter university name"
            />
          )}
        </View>

        {/* Save Button */}
        <View style={styles.actionContainer}>
          <Button
            title={saving ? 'Saving...' : 'Save Changes'}
            onPress={handleSave}
            disabled={saving}
            style={styles.saveActionButton}
          />
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
  saveButton: {
    padding: theme.spacing.sm,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  pickerContainer: {
    marginBottom: theme.spacing.md,
  },
  pickerLabel: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  pickerOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  pickerOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  pickerOptionActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  pickerOptionText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  pickerOptionTextActive: {
    color: theme.colors.white,
  },
  actionContainer: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  saveActionButton: {
    marginBottom: 0,
  },
});

export default AdminEditUserScreen;
