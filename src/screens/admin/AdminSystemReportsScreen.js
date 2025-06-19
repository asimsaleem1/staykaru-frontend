import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { theme } from '../../styles/theme';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/common/Card';
import { analyticsAPI } from '../../api/commonAPI';

const { width } = Dimensions.get('window');
const chartWidth = width - theme.spacing.md * 4;

const AdminSystemReportsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month'); // week, month, year

  useEffect(() => {
    setSelectedPeriod(validateSelectedPeriod(selectedPeriod));
    loadReportData();
  }, [selectedPeriod]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API calls
      const mockData = {
        overview: {
          totalUsers: 1248,
          totalBookings: 3456,
          totalOrders: 8924,
          totalRevenue: 156789.50,
          userGrowth: 12.5,
          bookingGrowth: 8.7,
          orderGrowth: 15.3,
          revenueGrowth: 22.1,
        },
        usersByRole: [
          { name: 'Students', count: 967, percentage: 77.5, color: theme.colors.primary },
          { name: 'Landlords', count: 143, percentage: 11.5, color: theme.colors.warning },
          { name: 'Food Providers', count: 125, percentage: 10.0, color: theme.colors.success },
          { name: 'Admins', count: 13, percentage: 1.0, color: theme.colors.error },
        ],
        monthlyGrowth: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          users: [850, 920, 1050, 1120, 1180, 1248],
          bookings: [2100, 2350, 2800, 3100, 3300, 3456],
          orders: [5200, 6100, 7200, 7800, 8400, 8924],
        },
        revenueBreakdown: {
          labels: ['Accommodations', 'Food Orders'],
          data: [65.3, 34.7],
          colors: [theme.colors.primary, theme.colors.warning],
        },
        topCities: [
          { name: 'New York', users: 234, bookings: 567, orders: 1234 },
          { name: 'London', users: 189, bookings: 432, orders: 987 },
          { name: 'Paris', users: 156, bookings: 345, orders: 765 },
          { name: 'Tokyo', users: 134, bookings: 298, orders: 654 },
          { name: 'Sydney', users: 123, bookings: 267, orders: 543 },
        ],
      };

      setReportData(mockData);
    } catch (error) {
      console.error('Error loading report data:', error);
      Alert.alert('Error', 'Failed to load report data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReportData();
    setRefreshing(false);
  };

  const validateSelectedPeriod = (period) => {
    const validPeriods = ['week', 'month', 'year'];
    return validPeriods.includes(period) ? period : 'month';
  };

  const PeriodButton = ({ period, label, isActive }) => (
    <TouchableOpacity
      style={[
        styles.periodButton,
        isActive && styles.periodButtonActive,
      ]}
      onPress={() => setSelectedPeriod(period)}
    >
      <Text
        style={[
          styles.periodButtonText,
          isActive && styles.periodButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const StatCard = ({ icon, title, value, growth, color }) => (
    <Card style={styles.statCard}>
      <View style={styles.statHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <View style={[styles.growthIndicator, { backgroundColor: growth >= 0 ? theme.colors.success : theme.colors.error }]}>
          <Ionicons 
            name={growth >= 0 ? "trending-up" : "trending-down"} 
            size={12} 
            color={theme.colors.white} 
          />
          <Text style={styles.growthText}>{Math.abs(growth)}%</Text>
        </View>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </Card>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>System Reports</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Period Selector */}
        <View style={styles.periodContainer}>
          <PeriodButton
            period="week"
            label="Week"
            isActive={selectedPeriod === 'week'}
          />
          <PeriodButton
            period="month"
            label="Month"
            isActive={selectedPeriod === 'month'}
          />
          <PeriodButton
            period="year"
            label="Year"
            isActive={selectedPeriod === 'year'}
          />
        </View>

        {/* Overview Stats */}
        <View style={styles.statsContainer}>
          <StatCard
            icon="people-outline"
            title="Total Users"
            value={reportData.overview.totalUsers.toLocaleString()}
            growth={reportData.overview.userGrowth}
            color={theme.colors.primary}
          />
          <StatCard
            icon="home-outline"
            title="Total Bookings"
            value={reportData.overview.totalBookings.toLocaleString()}
            growth={reportData.overview.bookingGrowth}
            color={theme.colors.warning}
          />
          <StatCard
            icon="restaurant-outline"
            title="Total Orders"
            value={reportData.overview.totalOrders.toLocaleString()}
            growth={reportData.overview.orderGrowth}
            color={theme.colors.success}
          />
          <StatCard
            icon="card-outline"
            title="Total Revenue"
            value={`$${reportData.overview.totalRevenue.toLocaleString()}`}
            growth={reportData.overview.revenueGrowth}
            color={theme.colors.error}
          />
        </View>

        {/* Users by Role Chart */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Users by Role</Text>
          <PieChart
            data={reportData.usersByRole.map(item => ({
              name: item.name,
              population: item.count,
              color: item.color,
              legendFontColor: theme.colors.text.secondary,
              legendFontSize: 12,
            }))}
            width={chartWidth}
            height={200}
            chartConfig={{
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </Card>

        {/* Growth Trends */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Growth Trends</Text>
          <LineChart
            data={{
              labels: reportData.monthlyGrowth.labels,
              datasets: [
                {
                  data: reportData.monthlyGrowth.users,
                  color: (opacity = 1) => theme.colors.primary,
                  strokeWidth: 2,
                },
                {
                  data: reportData.monthlyGrowth.bookings,
                  color: (opacity = 1) => theme.colors.warning,
                  strokeWidth: 2,
                },
              ],
              legend: ['Users', 'Bookings'],
            }}
            width={chartWidth}
            height={220}
            chartConfig={{
              backgroundColor: 'transparent',
              backgroundGradientFrom: theme.colors.surface,
              backgroundGradientTo: theme.colors.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => theme.colors.text.primary,
              labelColor: (opacity = 1) => theme.colors.text.secondary,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
              },
            }}
            bezier
            style={styles.chart}
          />
        </Card>

        {/* Revenue Breakdown */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Revenue Breakdown</Text>
          <BarChart
            data={{
              labels: reportData.revenueBreakdown.labels,
              datasets: [{
                data: reportData.revenueBreakdown.data,
              }],
            }}
            width={chartWidth}
            height={200}
            chartConfig={{
              backgroundColor: 'transparent',
              backgroundGradientFrom: theme.colors.surface,
              backgroundGradientTo: theme.colors.surface,
              decimalPlaces: 1,
              color: (opacity = 1) => theme.colors.primary,
              labelColor: (opacity = 1) => theme.colors.text.secondary,
              style: {
                borderRadius: 16,
              },
            }}
            style={styles.chart}
          />
        </Card>

        {/* Top Cities */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Top Cities by Activity</Text>
          {reportData.topCities.map((city, index) => (
            <View key={index} style={styles.cityItem}>
              <View style={styles.cityInfo}>
                <Text style={styles.cityName}>{city.name}</Text>
                <Text style={styles.cityStats}>
                  {city.users} users • {city.bookings} bookings • {city.orders} orders
                </Text>
              </View>
              <Text style={styles.cityRank}>#{index + 1}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.text.primary,
    flex: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  periodContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  periodButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  periodButtonText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: theme.colors.white,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  statCard: {
    width: (width - theme.spacing.md * 3) / 2,
    padding: theme.spacing.md,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  growthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  growthText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.white,
    marginLeft: 2,
    fontWeight: '600',
  },
  statValue: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  statTitle: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
  },
  chartCard: {
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    alignSelf: 'flex-start',
  },
  chart: {
    marginVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  cityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    width: '100%',
  },
  cityInfo: {
    flex: 1,
  },
  cityName: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  cityStats: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
  },
  cityRank: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: theme.typography.h4.fontWeight,
    color: theme.colors.primary,
  },
});

export default AdminSystemReportsScreen;
