import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/common/Card';
import { theme } from '../../styles/theme';
import { analyticsAPI } from '../../api/commonAPI';
import { accommodationAPI } from '../../api/accommodationAPI';

const { width: screenWidth } = Dimensions.get('window');
const chartConfig = {
  backgroundColor: theme.colors?.white || '#FFFFFF',
  backgroundGradientFrom: theme.colors?.white || '#FFFFFF',
  backgroundGradientTo: theme.colors?.white || '#FFFFFF',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(74, 101, 114, ${opacity})`, // Primary color RGB
  labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`, // Text color RGB
  style: {
    borderRadius: theme.borderRadius?.md || 8,
  },
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: theme.colors?.primary || '#4A6572',
  },
};

const LandlordAnalyticsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('month'); // week, month, year
  const [analytics, setAnalytics] = useState({
    overview: {
      totalRevenue: 0,
      totalBookings: 0,
      occupancyRate: 0,
      averageRating: 0,
      activeProperties: 0,
    },
    revenueData: {
      labels: [],
      datasets: [{ data: [] }],
    },
    bookingsData: {
      labels: [],
      datasets: [{ data: [] }],
    },
    propertyPerformance: [],
    occupancyData: [],
    topProperties: [],
    recentActivity: [],
  });

  useEffect(() => {
    setTimeRange(validateTimeRange(timeRange));
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      const [overviewResponse, revenueResponse, bookingsResponse, propertiesResponse] = await Promise.all([        analyticsAPI.getLandlordAnalytics({ type: 'overview', timeRange }),
        analyticsAPI.getLandlordAnalytics({ type: 'revenue', timeRange }),
        analyticsAPI.getLandlordAnalytics({ type: 'bookings', timeRange }),
        accommodationAPI.getMyProperties(),
      ]);

      if (overviewResponse.success) {
        const overview = overviewResponse.data;
        const revenue = revenueResponse.success ? revenueResponse.data : { labels: [], data: [] };
        const bookings = bookingsResponse.success ? bookingsResponse.data : { labels: [], data: [] };
        const properties = propertiesResponse.success ? propertiesResponse.data : [];        // Process revenue data
        const sanitizeNumber = (num) => {
          if (typeof num !== 'number' || !isFinite(num) || isNaN(num)) {
            return 0;
          }
          return num;
        };

        const revenueData = {
          labels: revenue.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            data: (revenue.data || [1200, 1500, 1800, 1300, 1600, 2000]).map(sanitizeNumber),
          }],
        };

        // Process bookings data
        const bookingsData = {
          labels: bookings.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            data: (bookings.data || [5, 8, 12, 6, 10, 15, 7]).map(sanitizeNumber),
          }],
        };

        // Process property performance
        const propertyPerformance = (properties || []).map(property => ({
          name: property.title && property.title.length > 15 ? property.title.substring(0, 15) + '...' : (property.title || 'Property'),
          bookings: sanitizeNumber(property.totalBookings || 0),
          revenue: sanitizeNumber(property.totalRevenue || 0),
          occupancyRate: sanitizeNumber(property.occupancyRate || 0),
          rating: sanitizeNumber(property.averageRating || 0),
          color: getRandomColor(),
        }));        // Create occupancy pie chart data
        const occupancyRate = sanitizeNumber(overview.occupancyRate || 65);
        const occupancyData = [
          {
            name: 'Occupied',
            population: occupancyRate,
            color: theme.colors?.success || '#4ECDC4',
            legendFontColor: theme.colors?.text?.primary || '#333333',
            legendFontSize: 12,
          },
          {
            name: 'Vacant',
            population: sanitizeNumber(100 - occupancyRate),
            color: theme.colors?.warning || '#F9AA33',
            legendFontColor: theme.colors?.text?.primary || '#333333',
            legendFontSize: 12,
          },
        ];setAnalytics({
          overview,
          revenueData,
          bookingsData,
          propertyPerformance,
          occupancyData,
          topProperties: (propertyPerformance || []).slice(0, 3),
          recentActivity: overview.recentActivity || [],
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      Alert.alert('Error', 'Failed to load analytics data. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getRandomColor = () => {
    const colors = [
      theme.colors.primary,
      theme.colors.secondary,
      theme.colors.success,
      theme.colors.warning,
      theme.colors.info,
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAnalytics();
  };
  const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || !isFinite(amount) || isNaN(amount)) {
      return 'RM 0.00';
    }
    return `RM ${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
  };

  const timeRangeOptions = [
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'Year', value: 'year' },
  ];

  const validateTimeRange = (range) => {
    const validRanges = ['week', 'month', 'year'];
    return validRanges.includes(range) ? range : 'month';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analytics</Text>
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          {timeRangeOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.timeRangeButton,
                timeRange === option.value && styles.timeRangeButtonActive,
              ]}
              onPress={() => setTimeRange(option.value)}
            >
              <Text
                style={[
                  styles.timeRangeText,
                  timeRange === option.value && styles.timeRangeTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overview Cards */}
        <View style={styles.overviewContainer}>
          <View style={styles.overviewRow}>
            <Card style={styles.overviewCard}>
              <View style={styles.overviewContent}>
                <View style={[styles.overviewIcon, { backgroundColor: theme.colors.success + '20' }]}>
                  <Ionicons name="cash" size={24} color={theme.colors.success} />
                </View>
                <View style={styles.overviewTextContainer}>
                  <Text style={styles.overviewValue}>
                    {formatCurrency(analytics.overview.totalRevenue)}
                  </Text>
                  <Text style={styles.overviewLabel}>Total Revenue</Text>
                </View>
              </View>
            </Card>

            <Card style={styles.overviewCard}>
              <View style={styles.overviewContent}>
                <View style={[styles.overviewIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Ionicons name="calendar" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.overviewTextContainer}>
                  <Text style={styles.overviewValue}>{analytics.overview.totalBookings}</Text>
                  <Text style={styles.overviewLabel}>Bookings</Text>
                </View>
              </View>
            </Card>
          </View>

          <View style={styles.overviewRow}>
            <Card style={styles.overviewCard}>
              <View style={styles.overviewContent}>
                <View style={[styles.overviewIcon, { backgroundColor: theme.colors.warning + '20' }]}>
                  <Ionicons name="home" size={24} color={theme.colors.warning} />
                </View>
                <View style={styles.overviewTextContainer}>
                  <Text style={styles.overviewValue}>{analytics.overview.occupancyRate}%</Text>
                  <Text style={styles.overviewLabel}>Occupancy</Text>
                </View>
              </View>
            </Card>

            <Card style={styles.overviewCard}>
              <View style={styles.overviewContent}>
                <View style={[styles.overviewIcon, { backgroundColor: theme.colors.info + '20' }]}>
                  <Ionicons name="star" size={24} color={theme.colors.info} />
                </View>
                <View style={styles.overviewTextContainer}>
                  <Text style={styles.overviewValue}>
                    {(analytics.overview?.averageRating && typeof analytics.overview.averageRating === 'number') 
                      ? analytics.overview.averageRating.toFixed(1) 
                      : '0.0'}
                  </Text>
                  <Text style={styles.overviewLabel}>Avg Rating</Text>
                </View>
              </View>
            </Card>
          </View>
        </View>

        {/* Revenue Chart */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Revenue Trend</Text>
          <LineChart
            data={analytics.revenueData}
            width={screenWidth - 60}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </Card>

        {/* Bookings Chart */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Bookings Overview</Text>
          <BarChart
            data={analytics.bookingsData}
            width={screenWidth - 60}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars
          />
        </Card>

        {/* Occupancy Rate */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Occupancy Rate</Text>
          <PieChart
            data={analytics.occupancyData}
            width={screenWidth - 60}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        </Card>

        {/* Top Performing Properties */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Top Performing Properties</Text>
          {analytics.topProperties.map((property, index) => (
            <View key={index} style={styles.propertyItem}>
              <View style={styles.propertyRank}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <View style={styles.propertyInfo}>
                <Text style={styles.propertyName}>{property.name}</Text>
                <Text style={styles.propertyStats}>
                  {property.bookings} bookings • {formatCurrency(property.revenue)}
                </Text>
              </View>
              <View style={styles.propertyRating}>
                <Ionicons name="star" size={16} color={theme.colors.warning} />
                <Text style={styles.ratingText}>
                  {(property.rating && typeof property.rating === 'number') 
                    ? property.rating.toFixed(1) 
                    : '0.0'}
                </Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Property Performance Breakdown */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Property Performance</Text>
          {analytics.propertyPerformance.map((property, index) => (
            <View key={index} style={styles.performanceItem}>
              <View style={styles.performanceHeader}>
                <Text style={styles.performancePropertyName}>{property.name}</Text>
                <Text style={styles.performanceOccupancy}>{property.occupancyRate}%</Text>
              </View>
              <View style={styles.performanceStats}>
                <View style={styles.performanceStat}>
                  <Text style={styles.performanceStatLabel}>Revenue</Text>
                  <Text style={styles.performanceStatValue}>
                    {formatCurrency(property.revenue)}
                  </Text>
                </View>
                <View style={styles.performanceStat}>
                  <Text style={styles.performanceStatLabel}>Bookings</Text>
                  <Text style={styles.performanceStatValue}>{property.bookings}</Text>
                </View>
                <View style={styles.performanceStat}>
                  <Text style={styles.performanceStatLabel}>Rating</Text>                  <Text style={styles.performanceStatValue}>
                    ⭐ {(property.rating && typeof property.rating === 'number') 
                      ? property.rating.toFixed(1) 
                      : '0.0'}
                  </Text>
                </View>
              </View>
              <View style={styles.occupancyBar}>
                <View
                  style={[
                    styles.occupancyFill,
                    { width: `${property.occupancyRate}%`, backgroundColor: property.color },
                  ]}
                />
              </View>
            </View>
          ))}
        </Card>

        {/* Recent Activity */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {analytics.recentActivity.length > 0 ? (
            analytics.recentActivity.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons 
                    name={activity.type === 'booking' ? 'calendar' : 'cash'} 
                    size={20} 
                    color={theme.colors.primary} 
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>{activity.message}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No recent activity</Text>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  timeRangeButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  timeRangeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  timeRangeText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
  },
  timeRangeTextActive: {
    color: theme.colors.white,
  },
  overviewContainer: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  overviewCard: {
    width: '48%',
    padding: theme.spacing.md,
  },
  overviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overviewIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  overviewTextContainer: {
    flex: 1,
  },
  overviewValue: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  overviewLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  chartCard: {
    margin: theme.spacing.md,
    padding: theme.spacing.md,
  },
  chartTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  chart: {
    marginVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  sectionCard: {
    margin: theme.spacing.md,
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  propertyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  propertyRank: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  rankText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyName: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
  },
  propertyStats: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  propertyRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
    marginLeft: theme.spacing.xs,
  },
  performanceItem: {
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  performancePropertyName: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
  },
  performanceOccupancy: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  performanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  performanceStat: {
    alignItems: 'center',
  },
  performanceStatLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textLight,
  },
  performanceStatValue: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  occupancyBar: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  occupancyFill: {
    height: '100%',
    borderRadius: theme.borderRadius.sm,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
  },
  activityTime: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  noDataText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
  },
});

export default LandlordAnalyticsScreen;
