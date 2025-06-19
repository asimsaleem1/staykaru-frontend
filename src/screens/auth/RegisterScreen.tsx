import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { FormInput, FormButton } from '../../components/ui/FormElements';
import { useAuth } from '../../context/AuthContext';
import { AuthNavigationProp } from '../../types/navigation.types';

const RegisterScreen = () => {
  const navigation = useNavigation<AuthNavigationProp>();
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    gender: 'male',
    role: 'student',
    university: '',
    // Student specific fields
    studentId: '',
    course: '',
    yearOfStudy: '',
    // Landlord specific fields
    businessName: '',
    businessLicense: '',
    propertyCount: '',
    // Food Provider specific fields
    restaurantName: '',
    cuisineType: '',
    deliveryRadius: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Pakistan'
    }
  });
  const roles = [
    {
      id: 'student',
      label: 'Student',
      icon: 'school-outline',
      color: '#4CAF50',
      description: 'Looking for accommodation and food'
    },
    {
      id: 'landlord', 
      label: 'Landlord',
      icon: 'home-outline',
      color: '#2196F3',
      description: 'Provide accommodation to students'
    },
    {
      id: 'food_provider',
      label: 'Food Provider',
      icon: 'restaurant-outline',
      color: '#FF9800',
      description: 'Provide food services to students'
    }
  ];

  const genders = [
    { id: 'male', label: 'Male' },
    { id: 'female', label: 'Female' },
    { id: 'other', label: 'Other' }
  ];

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }
    if (!formData.dateOfBirth.trim()) {
      Alert.alert('Error', 'Please enter your date of birth (YYYY-MM-DD)');
      return false;
    }
    if (!formData.address.street.trim() || !formData.address.city.trim()) {
      Alert.alert('Error', 'Please enter your complete address');
      return false;
    }

    // Role-specific validation
    if (formData.role === 'student' && !formData.university.trim()) {
      Alert.alert('Error', 'Please enter your university name');
      return false;
    }
    if (formData.role === 'landlord' && !formData.businessName.trim()) {
      Alert.alert('Error', 'Please enter your business name');
      return false;
    }
    if (formData.role === 'food_provider' && !formData.restaurantName.trim()) {
      Alert.alert('Error', 'Please enter your restaurant name');
      return false;
    }

    return true;
  };

  const renderRoleSpecificFields = () => {
    switch (formData.role) {
      case 'student':
        return (
          <View style={styles.roleFieldsContainer}>
            <Text style={styles.sectionTitle}>Student Information</Text>
            <FormInput
              label="University/Institution *"
              placeholder="Enter your university name"
              value={formData.university}
              onChangeText={(text) => setFormData({ ...formData, university: text })}
            />
            <FormInput
              label="Student ID"
              placeholder="Enter your student ID"
              value={formData.studentId}
              onChangeText={(text) => setFormData({ ...formData, studentId: text })}
            />
            <FormInput
              label="Course/Program"
              placeholder="Enter your course or program"
              value={formData.course}
              onChangeText={(text) => setFormData({ ...formData, course: text })}
            />
            <FormInput
              label="Year of Study"
              placeholder="e.g., 1st Year, 2nd Year"
              value={formData.yearOfStudy}
              onChangeText={(text) => setFormData({ ...formData, yearOfStudy: text })}
            />
          </View>
        );

      case 'landlord':
        return (
          <View style={styles.roleFieldsContainer}>
            <Text style={styles.sectionTitle}>Landlord Information</Text>
            <FormInput
              label="Business Name *"
              placeholder="Enter your business name"
              value={formData.businessName}
              onChangeText={(text) => setFormData({ ...formData, businessName: text })}
            />
            <FormInput
              label="Business License"
              placeholder="Enter your business license number"
              value={formData.businessLicense}
              onChangeText={(text) => setFormData({ ...formData, businessLicense: text })}
            />
            <FormInput
              label="Number of Properties"
              placeholder="How many properties do you manage?"
              keyboardType="numeric"
              value={formData.propertyCount}
              onChangeText={(text) => setFormData({ ...formData, propertyCount: text })}
            />
          </View>
        );

      case 'food_provider':
        return (
          <View style={styles.roleFieldsContainer}>
            <Text style={styles.sectionTitle}>Food Provider Information</Text>
            <FormInput
              label="Restaurant/Business Name *"
              placeholder="Enter your restaurant name"
              value={formData.restaurantName}
              onChangeText={(text) => setFormData({ ...formData, restaurantName: text })}
            />
            <FormInput
              label="Cuisine Type"
              placeholder="e.g., Pakistani, Chinese, Fast Food"
              value={formData.cuisineType}
              onChangeText={(text) => setFormData({ ...formData, cuisineType: text })}
            />
            <FormInput
              label="Delivery Radius (km)"
              placeholder="How far do you deliver?"
              keyboardType="numeric"
              value={formData.deliveryRadius}
              onChangeText={(text) => setFormData({ ...formData, deliveryRadius: text })}
            />
          </View>
        );

      default:
        return null;
    }
  };
  const handleSubmit = async () => {
    try {
      if (!validateForm()) {
        return;
      }      let userData: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address
      };

      // Add role-specific fields
      if (formData.role === 'student') {
        userData = {
          ...userData,
          university: formData.university,
          studentId: formData.studentId,
          course: formData.course,
          yearOfStudy: formData.yearOfStudy
        };
      } else if (formData.role === 'landlord') {
        userData = {
          ...userData,
          businessName: formData.businessName,
          businessLicense: formData.businessLicense,
          propertyCount: formData.propertyCount
        };
      } else if (formData.role === 'food_provider') {
        userData = {
          ...userData,
          restaurantName: formData.restaurantName,
          cuisineType: formData.cuisineType,
          deliveryRadius: formData.deliveryRadius
        };
      }

      await register(userData);
      Alert.alert('Success', 'Registration successful!', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Registration failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join StayKaru Today</Text>
        </View>

        <View style={styles.form}>
          <FormInput
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />

          <FormInput
            label="Email"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
          />

          <FormInput
            label="Phone"
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
          />

          <FormInput
            label="Date of Birth"
            placeholder="YYYY-MM-DD"
            value={formData.dateOfBirth}
            onChangeText={(text) => setFormData({ ...formData, dateOfBirth: text })}
          />

          <FormInput
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
          />

          <FormInput
            label="Confirm Password"
            placeholder="Confirm your password"
            secureTextEntry
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
          />

          {/* Gender Selection */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Gender</Text>
            <View style={styles.optionsRow}>
              {genders.map((gender) => (
                <TouchableOpacity
                  key={gender.id}
                  style={[
                    styles.optionButton,
                    formData.gender === gender.id && styles.optionButtonSelected
                  ]}
                  onPress={() => setFormData({ ...formData, gender: gender.id })}
                >
                  <Text style={[
                    styles.optionText,
                    formData.gender === gender.id && styles.optionTextSelected
                  ]}>
                    {gender.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Role Selection */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>I want to register as:</Text>
            <View style={styles.rolesContainer}>
              {roles.map((role) => (
                <TouchableOpacity
                  key={role.id}
                  style={[
                    styles.roleCard,
                    formData.role === role.id && { borderColor: role.color, backgroundColor: '#f8f9ff' }
                  ]}
                  onPress={() => setFormData({ ...formData, role: role.id })}
                >
                  <Ionicons 
                    name={role.icon as any} 
                    size={32} 
                    color={formData.role === role.id ? role.color : '#666'} 
                  />
                  <Text style={[
                    styles.roleLabel,
                    { color: formData.role === role.id ? role.color : '#333' }
                  ]}>
                    {role.label}
                  </Text>
                  <Text style={styles.roleDescription}>
                    {role.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Address Information */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Address Information</Text>
            <FormInput
              label="Street Address"
              placeholder="Enter your street address"
              value={formData.address.street}
              onChangeText={(text) => setFormData({ 
                ...formData, 
                address: { ...formData.address, street: text }
              })}
            />

            <FormInput
              label="City"
              placeholder="Enter your city"
              value={formData.address.city}
              onChangeText={(text) => setFormData({ 
                ...formData, 
                address: { ...formData.address, city: text }
              })}
            />

            <View style={styles.addressRow}>
              <View style={styles.addressHalf}>
                <FormInput
                  label="State"
                  placeholder="Enter your state"
                  value={formData.address.state}
                  onChangeText={(text) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, state: text }
                  })}
                />
              </View>
              <View style={styles.addressHalf}>
                <FormInput
                  label="Zip Code"
                  placeholder="Enter zip code"
                  value={formData.address.zipCode}
                  onChangeText={(text) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, zipCode: text }
                  })}
                />
              </View>
            </View>

            <FormInput
              label="Country"
              placeholder="Enter your country"
              value={formData.address.country}
              onChangeText={(text) => setFormData({ 
                ...formData, 
                address: { ...formData.address, country: text }
              })}
            />
          </View>

          {renderRoleSpecificFields()}

          <FormButton
            title={isLoading ? "Creating Account..." : "Create Account"}
            onPress={handleSubmit}
            disabled={isLoading}
            loading={isLoading}
          />

          <TouchableOpacity 
            onPress={() => navigation.navigate('Login')}
            style={styles.loginLink}
          >
            <Text style={styles.loginText}>
              Already have an account? Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    flex: 1,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#2196F3',
    fontSize: 16,
  },
  roleFieldsContainer: {
    marginVertical: 20,
  },  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },  sectionContainer: {
    marginVertical: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  optionButtonSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  optionText: {
    fontSize: 16,
  },
  optionTextSelected: {
    color: '#fff',
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },  roleCard: {
    width: '48%',
    padding: 15,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    marginVertical: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  roleLabel: {
    fontSize: 16,
    marginVertical: 5,
  },
  roleDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addressHalf: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default RegisterScreen;
