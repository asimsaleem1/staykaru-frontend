import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';

const HomeScreen = () => {
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Hello, {user ? user.name.split(' ')[0] : 'Guest'}!
        </Text>
        <Text style={styles.welcomeText}>
          Welcome to StayKaru
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Your StayKaru App</Text>
        <Text style={styles.sectionText}>
          This is a placeholder home screen. Replace this content with your app's main features.
        </Text>
        
        {/* Add your app's main content and features here */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4A6572',
    padding: 20,
    paddingTop: 40,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  welcomeText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  sectionText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 24,
  },
});

export default HomeScreen;
