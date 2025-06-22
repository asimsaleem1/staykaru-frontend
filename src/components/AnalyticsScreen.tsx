import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import DashboardApiService from '../services/dashboard-api.service';

const { width: screenWidth } = Dimensions.get('window');

interface AnalyticsProps {
  userRole: 'landlord' | 'food_provider' | 'admin';
  userId?: string;
}

const AnalyticsScreen: React.FC<AnalyticsProps> = ({ userRole, userId }) => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod, userRole]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      let data;

      switch (userRole) {
        case 'landlord':
          data = await DashboardApiService.landlord.getAnalytics(selectedPeriod);
          break;
        case 'food_provider':
          data = await DashboardApiService.foodProvider.getAnalytics(selectedPeriod);
          break;
        case 'admin':
          data = await DashboardApiService.admin.getSystemAnalytics();
          break;
        default:
          throw new Error('Invalid user role');
      }

      setAnalyticsData(data.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      Alert.alert('Error', 'Failed to load analytics data');
      
      // Set mock data for development
      setAnalyticsData(getMockAnalyticsData(userRole));
    } finally {
      setLoading(false);
    }
  };

  const getMockAnalyticsData = (role: string) => {
    const baseData = {
      revenue: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          data: [12000, 15000, 18000, 22000, 19000, 25000]
        }]
      },
      growth: 15.5,
      totalRevenue: 111000
    };

    switch (role) {
      case 'landlord':
        return {
          ...baseData,
          occupancyRate: 78.5,
          totalProperties: 5,
          totalBookings: 45,
          averageStayDuration: 28,
          bookingsByProperty: [
            { name: 'Studio Apt', bookings: 15, color: '#4b7bec' },
            { name: 'Single Room', bookings: 12, color: '#26de81' },
            { name: '2BR Flat', bookings: 10, color: '#fd9644' },
            { name: 'Shared Room', bookings: 8, color: '#f7b731' }
          ]
        };
        
      case 'food_provider':
        return {
          ...baseData,
          totalOrders: 320,
          averageOrderValue: 850,
          totalMenuItems: 45,
          popularItems: [
            { name: 'Pizza', orders: 85, color: '#4b7bec' },
            { name: 'Burger', orders: 70, color: '#26de81' },
            { name: 'Pasta', orders: 55, color: '#fd9644' },
            { name: 'Biryani', orders: 45, color: '#f7b731' }
          ],
          ordersByDay: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
              data: [35, 42, 38, 55, 65, 78, 52]
            }]
          }
        };
        
      case 'admin':
        return {
          ...baseData,
          userGrowth: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              data: [150, 180, 220, 280, 320, 380]
            }]
          },
          platformStats: {
            totalUsers: 380,
            totalProperties: 85,
            totalRestaurants: 45,
            totalTransactions: 1250,
            platformCommission: 15500
          }
        };
        
      default:
        return baseData;
    }
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(75, 123, 236, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#4b7bec'
    }
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {['week', 'month', 'year'].map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && styles.selectedPeriod
          ]}
          onPress={() => setSelectedPeriod(period as any)}
        >
          <Text style={[
            styles.periodText,
            selectedPeriod === period && styles.selectedPeriodText
          ]}>
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderRevenueChart = () => (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Revenue Trend</Text>
      <LineChart
        data={analyticsData.revenue}
        width={screenWidth - 40}
        height={220}
        chartConfig={chartConfig}
        style={styles.chart}
        bezier
      />
    </View>
  );

  const renderLandlordAnalytics = () => (
    <>
      {/* Key Metrics */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <FontAwesome5 name="percentage" size={24} color="#4b7bec" />
          <Text style={styles.metricValue}>{analyticsData.occupancyRate}%</Text>
          <Text style={styles.metricLabel}>Occupancy Rate</Text>
        </View>
        
        <View style={styles.metricCard}>
          <FontAwesome5 name="calendar-alt" size={24} color="#26de81" />
          <Text style={styles.metricValue}>{analyticsData.averageStayDuration}</Text>
          <Text style={styles.metricLabel}>Avg Stay (days)</Text>
        </View>
      </View>      {/* Bookings by Property */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Bookings by Property</Text>
        <PieChart
          data={analyticsData.bookingsByProperty.map((item: any) => ({
            ...item,
            legendFontColor: '#7F7F7F',
            legendFontSize: 14
          }))}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          accessor="bookings"
          backgroundColor="transparent"
          paddingLeft="15"
          style={styles.chart}
        />
      </View>
    </>
  );

  const renderFoodProviderAnalytics = () => (
    <>
      {/* Key Metrics */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <FontAwesome5 name="shopping-cart" size={24} color="#4b7bec" />
          <Text style={styles.metricValue}>{analyticsData.totalOrders}</Text>
          <Text style={styles.metricLabel}>Total Orders</Text>
        </View>
        
        <View style={styles.metricCard}>
          <FontAwesome5 name="dollar-sign" size={24} color="#26de81" />
          <Text style={styles.metricValue}>Rs. {analyticsData.averageOrderValue}</Text>
          <Text style={styles.metricLabel}>Avg Order Value</Text>
        </View>
      </View>      {/* Orders by Day */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Orders by Day</Text>
        <BarChart
          data={analyticsData.ordersByDay}
          width={screenWidth - 40}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={chartConfig}
          style={styles.chart}
          showValuesOnTopOfBars
        />
      </View>      {/* Popular Items */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Popular Menu Items</Text>
        <PieChart
          data={analyticsData.popularItems.map((item: any) => ({
            ...item,
            legendFontColor: '#7F7F7F',
            legendFontSize: 14
          }))}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          accessor="orders"
          backgroundColor="transparent"
          paddingLeft="15"
          style={styles.chart}
        />
      </View>
    </>
  );

  const renderAdminAnalytics = () => (
    <>
      {/* Platform Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <FontAwesome5 name="users" size={20} color="#4b7bec" />
          <Text style={styles.statValue}>{analyticsData.platformStats.totalUsers}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        
        <View style={styles.statCard}>
          <FontAwesome5 name="building" size={20} color="#26de81" />
          <Text style={styles.statValue}>{analyticsData.platformStats.totalProperties}</Text>
          <Text style={styles.statLabel}>Properties</Text>
        </View>
        
        <View style={styles.statCard}>
          <FontAwesome5 name="utensils" size={20} color="#fd9644" />
          <Text style={styles.statValue}>{analyticsData.platformStats.totalRestaurants}</Text>
          <Text style={styles.statLabel}>Restaurants</Text>
        </View>
        
        <View style={styles.statCard}>
          <FontAwesome5 name="exchange-alt" size={20} color="#f7b731" />
          <Text style={styles.statValue}>{analyticsData.platformStats.totalTransactions}</Text>
          <Text style={styles.statLabel}>Transactions</Text>
        </View>
      </View>

      {/* User Growth */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>User Growth</Text>
        <LineChart
          data={analyticsData.userGrowth}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          bezier
        />
      </View>

      {/* Commission Revenue */}
      <View style={styles.revenueCard}>
        <FontAwesome5 name="coins" size={28} color="#20bf6b" />
        <View style={styles.revenueInfo}>
          <Text style={styles.revenueAmount}>Rs. {analyticsData.platformStats.platformCommission}</Text>
          <Text style={styles.revenueLabel}>Platform Commission</Text>
        </View>
      </View>
    </>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <FontAwesome5 name="chart-line" size={40} color="#4b7bec" />
        <Text style={styles.loadingText}>Loading Analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics Dashboard</Text>
        {renderPeriodSelector()}
      </View>

      {/* Revenue Chart (Common for all roles) */}
      {renderRevenueChart()}

      {/* Growth Indicator */}
      <View style={styles.growthCard}>
        <FontAwesome5 
          name={analyticsData.growth >= 0 ? "arrow-up" : "arrow-down"} 
          size={20} 
          color={analyticsData.growth >= 0 ? "#26de81" : "#fc5c65"} 
        />
        <Text style={[styles.growthText, { 
          color: analyticsData.growth >= 0 ? "#26de81" : "#fc5c65" 
        }]}>
          {Math.abs(analyticsData.growth)}% {analyticsData.growth >= 0 ? 'increase' : 'decrease'} from last period
        </Text>
      </View>

      {/* Role-specific Analytics */}
      {userRole === 'landlord' && renderLandlordAnalytics()}
      {userRole === 'food_provider' && renderFoodProviderAnalytics()}
      {userRole === 'admin' && renderAdminAnalytics()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 15,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#f1f2f6',
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  selectedPeriod: {
    backgroundColor: '#4b7bec',
  },
  periodText: {
    fontSize: 14,
    color: '#636e72',
    fontWeight: '600',
  },
  selectedPeriodText: {
    color: 'white',
  },
  chartCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 15,
  },
  chart: {
    borderRadius: 12,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  metricCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
    marginTop: 10,
    marginBottom: 5,
  },
  metricLabel: {
    fontSize: 14,
    color: '#636e72',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    width: '48%',
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3436',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#636e72',
    textAlign: 'center',
  },
  revenueCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  revenueInfo: {
    marginLeft: 20,
  },
  revenueAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#20bf6b',
  },
  revenueLabel: {
    fontSize: 16,
    color: '#636e72',
    marginTop: 5,
  },
  growthCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  growthText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#636e72',
    marginTop: 15,
  },
});

export default AnalyticsScreen;
