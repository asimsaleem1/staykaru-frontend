import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator } from 'react-native';
import apiClient from '../api/apiClient';

const TestBackendScreen = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const testBackendConnection = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      // Test if we can reach the backend
      console.log('Testing connection to backend:', apiClient.defaults.baseURL);
      
      // Try to make a simple GET request to the root endpoint
      const response = await apiClient.get('/');
      console.log('Backend connection successful:', response.data);
      setResponse(response.data);
    } catch (err) {
      console.error('Backend connection error:', err);
      setError(err.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const testAuthEndpoints = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      console.log('Testing authentication endpoints at:', apiClient.defaults.baseURL);
      
      // We'll just check if the endpoints exist by making OPTIONS requests
      // This won't actually send any data
      const loginCheck = await apiClient.options('/auth/login');
      const registerCheck = await apiClient.options('/auth/register');
      
      console.log('Auth endpoints accessible:', {
        login: loginCheck.status,
        register: registerCheck.status
      });
      
      setResponse({
        message: 'Authentication endpoints are accessible',
        endpoints: {
          login: `${apiClient.defaults.baseURL}/auth/login`,
          register: `${apiClient.defaults.baseURL}/auth/register`
        }
      });
    } catch (err) {
      console.error('Auth endpoints test error:', err);
      setError(err.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backend Connection Test</Text>
      <Text style={styles.subtitle}>API URL: {apiClient.defaults.baseURL}</Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Test General Connection" 
          onPress={testBackendConnection} 
        />
        
        <View style={styles.buttonSpacer} />
        
        <Button 
          title="Test Auth Endpoints" 
          onPress={testAuthEndpoints} 
          color="#4b7bec"
        />
      </View>
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Testing connection...</Text>
        </View>
      )}
      
      {response && (
        <View style={styles.responseContainer}>
          <Text style={styles.successText}>Connection Successful!</Text>
          <Text style={styles.responseText}>
            Response: {JSON.stringify(response, null, 2)}
          </Text>
        </View>
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Connection Failed</Text>
          <Text style={styles.errorDetails}>{error}</Text>
          <Text style={styles.helpText}>
            Possible issues:
            {'\n'}- Backend server is not running
            {'\n'}- API URL is incorrect
            {'\n'}- Network connectivity issues
            {'\n'}- CORS issues (if applicable)
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'column',
    marginBottom: 20,
  },
  buttonSpacer: {
    height: 10,
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  responseContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e6f7e6',
    borderRadius: 5,
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 10,
  },
  responseText: {
    fontSize: 14,
  },
  errorContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#ffebee',
    borderRadius: 5,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#c62828',
    marginBottom: 10,
  },
  errorDetails: {
    fontSize: 14,
    marginBottom: 15,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
  },
});

export default TestBackendScreen;
