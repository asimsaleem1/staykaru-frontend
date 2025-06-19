import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will be handled by auth context
    } catch (error) {
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A6572" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Not logged in</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileContainer}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{user.name ? user.name.charAt(0).toUpperCase() : '?'}</Text>
        </View>
        
        <Text style={styles.nameText}>{user.name}</Text>
        <Text style={styles.roleText}>{formatRole(user.role)}</Text>
        
        <View style={styles.infoContainer}>
          <InfoItem label="Email" value={user.email} />
          <InfoItem label="Phone" value={user.phone || 'Not provided'} />
          <InfoItem label="Gender" value={formatGender(user.gender)} />
          {user.createdAt && (
            <InfoItem label="Member Since" value={formatDate(user.createdAt)} />
          )}
        </View>
        
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

// Helper functions
const formatRole = (role: string): string => {
  if (!role) return 'User';
  
  const roles: { [key: string]: string } = {
    student: 'Student',
    landlord: 'Landlord',
    food_provider: 'Food Provider',
    admin: 'Administrator'
  };
  
  return roles[role] || role.charAt(0).toUpperCase() + role.slice(1);
};

const formatGender = (gender: string): string => {
  if (!gender) return 'Not specified';
  
  const genders: { [key: string]: string } = {
    male: 'Male',
    female: 'Female',
    other: 'Other'
  };
  
  return genders[gender] || gender.charAt(0).toUpperCase() + gender.slice(1);
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch (e) {
    return dateString || 'Unknown';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#4A6572',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    width: '80%',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4A6572',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  roleText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  infoContainer: {
    width: '100%',
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    width: '40%',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  infoValue: {
    width: '60%',
    fontSize: 16,
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
