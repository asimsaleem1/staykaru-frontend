import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { authAPI } from '../api/apiClient';

const TestScreen = () => {
  const testBackendConnection = async () => {
    try {
      // Test register endpoint (this will fail for validation but proves connectivity)
      await authAPI.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpass',
        phone: '1234567890',
        gender: 'male',
        role: 'student'
      });
    } catch (error) {
      console.log('Backend response (expected error):', error);
      Alert.alert('Backend Test', 'Backend is accessible! ' + JSON.stringify(error.error || error.message));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>JWT Auth Test</Text>
      <TouchableOpacity style={styles.button} onPress={testBackendConnection}>
        <Text style={styles.buttonText}>Test Backend Connection</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4A6572',
    padding: 15,
    borderRadius: 5,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TestScreen;
