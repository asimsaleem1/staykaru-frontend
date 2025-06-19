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
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Pakistan'
    }
  });

  const handleSubmit = async () => {
    try {
      if (formData.password !== formData.confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }

      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        university: formData.role === 'student' ? formData.university : undefined,
        address: formData.address
      };

      await register(userData);
      Alert.alert('Success', 'Registration successful!', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);    } catch (error: any) {
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

          <FormInput
            label="University (for students)"
            placeholder="Enter your university"
            value={formData.university}
            onChangeText={(text) => setFormData({ ...formData, university: text })}
          />

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

          <FormInput
            label="State"
            placeholder="Enter your state"
            value={formData.address.state}
            onChangeText={(text) => setFormData({ 
              ...formData, 
              address: { ...formData.address, state: text }
            })}
          />

          <FormInput
            label="Zip Code"
            placeholder="Enter your zip code"
            value={formData.address.zipCode}
            onChangeText={(text) => setFormData({ 
              ...formData, 
              address: { ...formData.address, zipCode: text }
            })}
          />

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
});

export default RegisterScreen;
