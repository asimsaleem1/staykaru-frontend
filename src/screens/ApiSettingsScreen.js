import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import apiClient from '../api/apiClient';
import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Predefined URLs for testing
const TEST_URLS = [
  { name: 'Local (Emulator)', url: Platform.OS === 'android' ? 'http://10.0.2.2:3002' : 'http://localhost:3002' },
  { name: 'Local IP', url: 'http://192.168.1.100:3002' }, // Replace with your computer's IP
  { name: 'Production', url: 'https://api.staykaru.tech/api' },
];

const ApiSettingsScreen = ({ navigation }) => {
  const [customUrl, setCustomUrl] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [savedUrls, setSavedUrls] = useState([]);

  useEffect(() => {
    // Get the current API URL
    setCurrentUrl(apiClient.defaults.baseURL);
    loadSavedUrls();
  }, []);

  const loadSavedUrls = async () => {
    try {
      const saved = await AsyncStorage.getItem('savedApiUrls');
      if (saved) {
        setSavedUrls(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading saved URLs', error);
    }
  };

  const saveUrl = async (name, url) => {
    try {
      const newUrl = { name, url };
      const updatedUrls = [...savedUrls.filter(item => item.url !== url), newUrl];
      setSavedUrls(updatedUrls);
      await AsyncStorage.setItem('savedApiUrls', JSON.stringify(updatedUrls));
      Alert.alert('Success', `URL saved as "${name}"`);
    } catch (error) {
      console.error('Error saving URL', error);
      Alert.alert('Error', 'Failed to save URL');
    }
  };

  const setApiUrl = (url) => {
    apiClient.setBaseUrl(url);
    setCurrentUrl(url);
    Alert.alert('URL Updated', `API URL set to: ${url}`);
  };

  const testApiUrl = async (url) => {
    setTesting(true);
    try {
      console.log(`Testing connection to: ${url}`);
      const tempClient = axios.create({
        baseURL: url,
        timeout: 10000,
      });
      
      const response = await tempClient.get('/');
      Alert.alert(
        'Connection Successful', 
        `Connected to: ${url}\n\nResponse: ${JSON.stringify(response.data)}`
      );
      return true;
    } catch (error) {
      console.error('Connection test error:', error);
      Alert.alert(
        'Connection Failed', 
        `Error connecting to ${url}:\n${error.message}\n\nMake sure the server is running and the URL is correct.`
      );
      return false;
    } finally {
      setTesting(false);
    }
  };

  const promptSaveUrl = (url) => {
    Alert.prompt(
      'Save API URL',
      'Enter a name for this API URL:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Save', onPress: (name) => saveUrl(name, url) },
      ],
      'plain-text'
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current API URL</Text>
        <View style={styles.currentUrlContainer}>
          <Text style={styles.currentUrl}>{currentUrl}</Text>
          <Text style={styles.platformInfo}>Platform: {Platform.OS}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Predefined URLs</Text>
        {TEST_URLS.map((item, index) => (
          <View key={index} style={styles.urlItem}>
            <View style={styles.urlInfo}>
              <Text style={styles.urlName}>{item.name}</Text>
              <Text style={styles.url}>{item.url}</Text>
            </View>
            <View style={styles.urlActions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.useButton]} 
                onPress={() => setApiUrl(item.url)}
              >
                <Text style={styles.actionButtonText}>Use</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.testButton]}
                onPress={() => testApiUrl(item.url)}
                disabled={testing}
              >
                {testing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.actionButtonText}>Test</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {savedUrls.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved URLs</Text>
          {savedUrls.map((item, index) => (
            <View key={index} style={styles.urlItem}>
              <View style={styles.urlInfo}>
                <Text style={styles.urlName}>{item.name}</Text>
                <Text style={styles.url}>{item.url}</Text>
              </View>
              <View style={styles.urlActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.useButton]} 
                  onPress={() => setApiUrl(item.url)}
                >
                  <Text style={styles.actionButtonText}>Use</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.testButton]}
                  onPress={() => testApiUrl(item.url)}
                >
                  <Text style={styles.actionButtonText}>Test</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Custom URL</Text>
        <TextInput
          style={styles.customUrlInput}
          value={customUrl}
          onChangeText={setCustomUrl}
          placeholder="Enter custom API URL"
          placeholderTextColor="#999"
        />
        <View style={styles.customUrlButtons}>
          <TouchableOpacity 
            style={[styles.customUrlButton, styles.useButton]}
            onPress={() => setApiUrl(customUrl)}
            disabled={!customUrl}
          >
            <Text style={styles.actionButtonText}>Use</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.customUrlButton, styles.testButton]}
            onPress={() => testApiUrl(customUrl)}
            disabled={!customUrl || testing}
          >
            {testing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>Test</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.customUrlButton, styles.saveButton]}
            onPress={() => promptSaveUrl(customUrl)}
            disabled={!customUrl}
          >
            <Text style={styles.actionButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.helpSection}>
        <Text style={styles.helpTitle}>Troubleshooting Tips</Text>
        <Text style={styles.helpText}>
          • For Android Emulator, use 10.0.2.2 instead of localhost{'\n'}
          • For physical devices, use your computer's IP address{'\n'}
          • Make sure your backend server is running{'\n'}
          • Check that your device and backend are on the same network{'\n'}
          • Verify that the port is correct (usually 3002 for development){'\n'}
          • Try restarting both the Expo client and backend server
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  currentUrlContainer: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 6,
  },
  currentUrl: {
    fontSize: 16,
    color: '#0066cc',
    fontWeight: '500',
  },
  platformInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  urlItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
  },
  urlInfo: {
    flex: 1,
    marginRight: 8,
  },
  urlName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  url: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  urlActions: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  useButton: {
    backgroundColor: '#4b7bec',
  },
  testButton: {
    backgroundColor: '#3498db',
  },
  saveButton: {
    backgroundColor: '#26de81',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  customUrlInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  customUrlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  customUrlButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  helpSection: {
    marginTop: 8,
    marginBottom: 32,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
});

export default ApiSettingsScreen;
