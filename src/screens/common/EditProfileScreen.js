import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { userAPI } from '../../api/commonAPI';
import { useAuth } from '../../context/AuthContext';

const EditProfileScreen = ({ navigation }) => {
  const { user, isLoading: authLoading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    bio: '',
    university: '', // For students
    course: '', // For students
    year: '', // For students
    businessName: '', // For food providers
    businessAddress: '', // For food providers
    businessPhone: '', // For food providers
  });
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        address: user.address || '',
        bio: user.bio || '',
        university: user.university || '',
        course: user.course || '',
        year: user.year || '',
        businessName: user.businessName || '',
        businessAddress: user.businessAddress || '',
        businessPhone: user.businessPhone || '',
      });
    }
  }, [user]);
  const handleSaveProfile = async () => {
    setSaving(true);
    
    try {
      // Basic validation
      if (!formData.name || !formData.name.trim()) {
        Alert.alert('Validation Error', 'Name is required');
        setSaving(false);
        return;
      }
      
      if (!formData.phone || !formData.phone.trim()) {
        Alert.alert('Validation Error', 'Phone number is required');
        setSaving(false);
        return;
      }
      
      console.log('Attempting to update profile with data:', formData);
      
      const response = await userAPI.updateProfile(formData);
      console.log('Profile update successful:', response);
      
      // Update the user context if needed
      // We'll rely on the next profile fetch to update the user context
      
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
      
      let errorMessage = 'Failed to update profile';
      if (typeof error === 'object') {
        if (error.message) {
          errorMessage = error.message;
        } else if (error.error) {
          errorMessage = error.error;
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  if (authLoading) {
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <Input
              label="Full Name"
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              placeholder="Enter your full name"
              required
            />

            <Input
              label="Email"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              required
            />

            <Input
              label="Phone Number"
              value={formData.phone}
              onChangeText={(value) => updateFormData('phone', value)}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />

            <Input
              label="Date of Birth"
              value={formData.dateOfBirth}
              onChangeText={(value) => updateFormData('dateOfBirth', value)}
              placeholder="YYYY-MM-DD"
            />

            <Input
              label="Address"
              value={formData.address}
              onChangeText={(value) => updateFormData('address', value)}
              placeholder="Enter your address"
              multiline
              numberOfLines={3}
            />

            <Input
              label="Bio"
              value={formData.bio}
              onChangeText={(value) => updateFormData('bio', value)}
              placeholder="Tell us about yourself"
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Student Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Student Information</Text>
            
            <Input
              label="University"
              value={formData.university}
              onChangeText={(value) => updateFormData('university', value)}
              placeholder="Enter your university"
            />

            <Input
              label="Course/Program"
              value={formData.course}
              onChangeText={(value) => updateFormData('course', value)}
              placeholder="Enter your course or program"
            />

            <Input
              label="Year of Study"
              value={formData.year}
              onChangeText={(value) => updateFormData('year', value)}
              placeholder="e.g., Year 1, Year 2, etc."
            />
          </View>

          {/* Business Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Business Information</Text>
            <Text style={styles.sectionDescription}>
              For landlords and food providers
            </Text>
            
            <Input
              label="Business Name"
              value={formData.businessName}
              onChangeText={(value) => updateFormData('businessName', value)}
              placeholder="Enter your business name"
            />

            <Input
              label="Business Address"
              value={formData.businessAddress}
              onChangeText={(value) => updateFormData('businessAddress', value)}
              placeholder="Enter your business address"
              multiline
              numberOfLines={3}
            />

            <Input
              label="Business Phone"
              value={formData.businessPhone}
              onChangeText={(value) => updateFormData('businessPhone', value)}
              placeholder="Enter your business phone"
              keyboardType="phone-pad"
            />
          </View>

          {/* Save Button */}
          <View style={styles.saveSection}>
            <Button
              title={saving ? "Saving..." : "Save Changes"}
              onPress={handleSaveProfile}
              disabled={saving}
              style={styles.saveButton}
            />
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
  backButton: {
    padding: theme.spacing.xs,
  },  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  form: {
    padding: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  sectionDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  saveSection: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
});

export default EditProfileScreen;
