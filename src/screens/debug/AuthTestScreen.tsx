import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth.types';

export default function AuthTestScreen() {
  const { authState, login, register, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.STUDENT);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await login({ email, password });
      Alert.alert('Success', 'Login successful!');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await register({
        email,
        password,
        name,
        role: selectedRole,
      });
      Alert.alert('Success', 'Registration successful!');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      Alert.alert('Success', 'Logout successful!');
    } catch (error: any) {
      Alert.alert('Logout Failed', error.message);
    }
  };

  if (authState.isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>JWT Auth Test</Text>
      
      {authState.user ? (
        <View style={styles.userInfo}>
          <Text style={styles.subtitle}>User Information</Text>
          <Text style={styles.infoText}>Name: {authState.user.name}</Text>
          <Text style={styles.infoText}>Email: {authState.user.email}</Text>
          <Text style={styles.infoText}>Role: {authState.user.role}</Text>
          <Text style={styles.infoText}>ID: {authState.user.id}</Text>
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.authForm}>
          <Text style={styles.subtitle}>Authentication Test</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TextInput
            style={styles.input}
            placeholder="Full Name (for registration)"
            value={name}
            onChangeText={setName}
          />
          
          <View style={styles.roleSelector}>
            <Text style={styles.label}>Role (for registration):</Text>
            {Object.values(UserRole).map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.roleButton,
                  selectedRole === role && styles.selectedRole,
                ]}
                onPress={() => setSelectedRole(role)}
              >
                <Text
                  style={[
                    styles.roleText,
                    selectedRole === role && styles.selectedRoleText,
                  ]}
                >
                  {role.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {authState.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {authState.error}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: '#666',
  },
  userInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  authForm: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  roleSelector: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  roleButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 5,
    backgroundColor: '#f9f9f9',
  },
  selectedRole: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  roleText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
  },
  selectedRoleText: {
    color: '#fff',
  },
  loginButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  registerButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f5c6cb',
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
  },
});
