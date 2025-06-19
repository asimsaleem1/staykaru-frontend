import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const FoodProviderDashboardScreen = () => {
  const { authState } = useAuth();
  const { user } = authState;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome, {user?.name}
        </Text>
        <Text style={styles.roleText}>Food Provider Dashboard</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Manage Food Services</Text>
          <View style={styles.cardContainer}>
            <TouchableOpacity style={styles.card}>
              <FontAwesome5 name="utensils" size={24} color="#4b7bec" />
              <Text style={styles.cardTitle}>My Menu</Text>
              <Text style={styles.cardDescription}>
                Manage your food offerings
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card}>
              <FontAwesome5 name="plus-circle" size={24} color="#4b7bec" />
              <Text style={styles.cardTitle}>Add Items</Text>
              <Text style={styles.cardDescription}>
                Add new food items to your menu
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Orders</Text>
          <View style={styles.cardContainer}>
            <TouchableOpacity style={styles.card}>
              <FontAwesome5 name="shopping-cart" size={24} color="#4b7bec" />
              <Text style={styles.cardTitle}>Current Orders</Text>
              <Text style={styles.cardDescription}>
                View and process new orders
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card}>
              <FontAwesome5 name="history" size={24} color="#4b7bec" />
              <Text style={styles.cardTitle}>Order History</Text>
              <Text style={styles.cardDescription}>
                View past orders and analytics
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Special Offerings</Text>
          <TouchableOpacity style={styles.wideCard}>
            <FontAwesome5 name="tags" size={24} color="#4b7bec" />
            <Text style={styles.cardTitle}>Promotions & Deals</Text>
            <Text style={styles.cardDescription}>
              Create and manage special deals and meal plans
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

export default FoodProviderDashboardScreen;
