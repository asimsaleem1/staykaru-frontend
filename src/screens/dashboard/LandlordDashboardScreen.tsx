import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const LandlordDashboardScreen = () => {
  const { authState } = useAuth();
  const { user } = authState;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome, {user?.name}
        </Text>
        <Text style={styles.roleText}>Landlord Dashboard</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Manage Properties</Text>
          <View style={styles.cardContainer}>
            <TouchableOpacity style={styles.card}>
              <FontAwesome5 name="plus-circle" size={24} color="#4b7bec" />
              <Text style={styles.cardTitle}>Add Property</Text>
              <Text style={styles.cardDescription}>
                List a new accommodation
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card}>
              <FontAwesome5 name="edit" size={24} color="#4b7bec" />
              <Text style={styles.cardTitle}>Edit Properties</Text>
              <Text style={styles.cardDescription}>
                Update your listed properties
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Bookings & Reservations</Text>
          <View style={styles.cardContainer}>
            <TouchableOpacity style={styles.card}>
              <FontAwesome5 name="calendar-check" size={24} color="#4b7bec" />
              <Text style={styles.cardTitle}>Current Bookings</Text>
              <Text style={styles.cardDescription}>
                Manage active reservations
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card}>
              <FontAwesome5 name="history" size={24} color="#4b7bec" />
              <Text style={styles.cardTitle}>Booking History</Text>
              <Text style={styles.cardDescription}>
                View past reservations
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Analytics</Text>
          <TouchableOpacity style={styles.wideCard}>
            <FontAwesome5 name="chart-line" size={24} color="#4b7bec" />
            <Text style={styles.cardTitle}>Performance Metrics</Text>
            <Text style={styles.cardDescription}>
              View statistics and insights about your properties
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

export default LandlordDashboardScreen;
