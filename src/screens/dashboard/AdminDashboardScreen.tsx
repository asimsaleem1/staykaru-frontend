import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const AdminDashboardScreen = () => {
  const { authState } = useAuth();
  const { user } = authState;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome, {user?.name}
        </Text>
        <Text style={styles.roleText}>Admin Dashboard</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>User Management</Text>
          <View style={styles.cardContainer}>
            <TouchableOpacity style={styles.card}>
              <FontAwesome5 name="users" size={24} color="#4b7bec" />
              <Text style={styles.cardTitle}>All Users</Text>
              <Text style={styles.cardDescription}>
                Manage user accounts
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card}>
              <FontAwesome5 name="user-plus" size={24} color="#4b7bec" />
              <Text style={styles.cardTitle}>Create User</Text>
              <Text style={styles.cardDescription}>
                Add a new user account
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Content Management</Text>
          <View style={styles.cardContainer}>
            <TouchableOpacity style={styles.card}>
              <FontAwesome5 name="building" size={24} color="#4b7bec" />
              <Text style={styles.cardTitle}>Accommodations</Text>
              <Text style={styles.cardDescription}>
                Manage listed properties
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card}>
              <FontAwesome5 name="utensils" size={24} color="#4b7bec" />
              <Text style={styles.cardTitle}>Food Services</Text>
              <Text style={styles.cardDescription}>
                Manage food providers
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Analytics & Reports</Text>
          <TouchableOpacity style={styles.wideCard}>
            <FontAwesome5 name="chart-bar" size={24} color="#4b7bec" />
            <Text style={styles.cardTitle}>System Analytics</Text>
            <Text style={styles.cardDescription}>
              View platform usage statistics and generate reports
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

export default AdminDashboardScreen;
