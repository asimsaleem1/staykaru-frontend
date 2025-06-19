import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const StudentDashboardScreen = () => {
  const { authState, logout } = useAuth();
  const { user } = authState;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome, {user?.name}
        </Text>
        <Text style={styles.roleText}>Student Dashboard</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Find Accommodation</Text>
          <View style={styles.cardContainer}>
            <TouchableOpacity style={styles.card}>
              <FontAwesome5 name="building" size={24} color="#4b7bec" />
              <Text style={styles.cardTitle}>Hostels</Text>
              <Text style={styles.cardDescription}>
                Browse available hostels and dormitories
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card}>
              <FontAwesome5 name="home" size={24} color="#4b7bec" />
              <Text style={styles.cardTitle}>Apartments</Text>
              <Text style={styles.cardDescription}>
                Find apartments near your campus
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Food Services</Text>
          <View style={styles.cardContainer}>
            <TouchableOpacity style={styles.card}>
              <FontAwesome5 name="utensils" size={24} color="#4b7bec" />
              <Text style={styles.cardTitle}>Campus Restaurants</Text>
              <Text style={styles.cardDescription}>
                Order from on-campus dining options
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card}>
              <FontAwesome5 name="shopping-basket" size={24} color="#4b7bec" />
              <Text style={styles.cardTitle}>Meal Plans</Text>
              <Text style={styles.cardDescription}>
                Browse and subscribe to meal plans
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>My Bookings</Text>
          <TouchableOpacity style={styles.wideCard}>
            <FontAwesome5 name="clipboard-list" size={24} color="#4b7bec" />
            <Text style={styles.cardTitle}>Manage Bookings</Text>
            <Text style={styles.cardDescription}>
              View and manage your current reservations
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
    backgroundColor: '#f5f6fa',
  },
  header: {
    backgroundColor: '#4b7bec',
    padding: 20,
    paddingTop: 40,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  roleText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  cardSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#2d3436',
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  wideCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
    color: '#2d3436',
  },
  cardDescription: {
    fontSize: 14,
    color: '#636e72',
    textAlign: 'center',
  },
});

export default StudentDashboardScreen;
