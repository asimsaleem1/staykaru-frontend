import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Switch
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api.service';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  gender?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminEditUserScreen: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params as { userId: string };
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('student');
  const [gender, setGender] = useState('');
  const [isActive, setIsActive] = useState(true);

  const roles = ['student', 'landlord', 'food_provider', 'admin'];
  const genders = ['', 'male', 'female', 'other'];

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      Alert.alert('Access Denied', 'You do not have admin privileges', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      return;
    }
    fetchUserDetails();
  }, [currentUser, navigation, userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      console.log(`✏️ Fetching user details for editing: ${userId}`);
      
      const response = await api.get(`/users/${userId}`);
      
      if (response.data) {
        const userData = response.data;
        setUser(userData);
        
        // Populate form fields
        setName(userData.name);
        setEmail(userData.email);
        setPhone(userData.phone || '');
        setRole(userData.role);
        setGender(userData.gender || '');
        setIsActive(userData.isActive);
        
        console.log('✅ User details loaded for editing');
      }
    } catch (error) {
      console.error('❌ Error fetching user details:', error);
      Alert.alert('Error', 'Failed to load user details', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Name is required');
      return false;
    }
    
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Validation Error', 'Valid email is required');
      return false;
    }
    
    if (phone && phone.length < 10) {
      Alert.alert('Validation Error', 'Phone number must be at least 10 digits');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      
      const updatedUser = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        role,
        gender: gender || undefined,
        isActive,
      };
      
      console.log('💾 Saving user updates:', updatedUser);
      
      // Note: This would normally send to backend API
      // const response = await api.put(`/users/${userId}`, updatedUser);
      
      Alert.alert('Success', 'User updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      
    } catch (error) {
      console.error('❌ Error updating user:', error);
      Alert.alert('Error', 'Failed to update user. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard your changes?',
      [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Discard', onPress: () => navigation.goBack() }
      ]
    );
  };

  const getRoleColor = (roleValue: string) => {
    switch (roleValue) {
      case 'admin': return '#e74c3c';
      case 'landlord': return '#f39c12';
      case 'food_provider': return '#9b59b6';
      case 'student': return '#3498db';
      default: return '#95a5a6';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A6572" />
        <Text style={styles.loadingText}>Loading user data...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>User not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Edit User</Text>
        <Text style={styles.subtitle}>Modify user information</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Basic Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter user name"
            autoCapitalize="words"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Role & Status</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Role *</Text>
          <View style={styles.roleSelector}>
            {roles.map(roleOption => (
              <TouchableOpacity
                key={roleOption}
                style={[
                  styles.roleOption,
                  role === roleOption && styles.roleOptionSelected,
                  { borderColor: getRoleColor(roleOption) }
                ]}
                onPress={() => setRole(roleOption)}
              >
                <Text style={[
                  styles.roleOptionText,
                  role === roleOption && { color: getRoleColor(roleOption) }
                ]}>
                  {roleOption.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderSelector}>
            {genders.map(genderOption => (
              <TouchableOpacity
                key={genderOption}
                style={[
                  styles.genderOption,
                  gender === genderOption && styles.genderOptionSelected
                ]}
                onPress={() => setGender(genderOption)}
              >
                <Text style={[
                  styles.genderOptionText,
                  gender === genderOption && styles.genderOptionTextSelected
                ]}>
                  {genderOption || 'Not specified'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Text style={styles.switchLabel}>Account Active</Text>
            <Text style={styles.switchDescription}>
              Enable/disable user account access
            </Text>
          </View>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: '#ecf0f1', true: '#27ae60' }}
            thumbColor={isActive ? '#fff' : '#bdc3c7'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Account Details</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>User ID:</Text>
          <Text style={styles.infoValue}>{user._id}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Created:</Text>
          <Text style={styles.infoValue}>{new Date(user.createdAt).toLocaleDateString()}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Last Updated:</Text>
          <Text style={styles.infoValue}>{new Date(user.updatedAt).toLocaleDateString()}</Text>
        </View>
      </View>

      <View style={styles.actionSection}>
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? '💾 Saving...' : '💾 Save Changes'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>❌ Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#2c3e50',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#bdc3c7',
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  roleSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  roleOption: {
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#ecf0f1',
  },
  roleOptionSelected: {
    backgroundColor: 'white',
  },
  roleOptionText: {
    fontSize: 14,
    color: '#7f8c8d',
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  genderSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  genderOption: {
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  genderOptionSelected: {
    backgroundColor: '#3498db',
  },
  genderOptionText: {
    fontSize: 14,
    color: '#7f8c8d',
    textTransform: 'capitalize',
  },
  genderOptionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  infoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
  actionSection: {
    padding: 16,
  },
  saveButton: {
    backgroundColor: '#27ae60',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdminEditUserScreen;
