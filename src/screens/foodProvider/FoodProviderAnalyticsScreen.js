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
import { commonAPI } from '../../api/commonAPI';
import { foodAPI } from '../../api/foodAPI';

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

const FoodProviderAnalyticsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('month'); // week, month, year
  const [analytics, setAnalytics] = useState({
    overview: {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      customerRating: 0,
      menuItems: 0,
    },
    revenueData: {
      labels: [],
      datasets: [{ data: [] }],
    },
    ordersData: {
      labels: [],
      datasets: [{ data: [] }],
    },
    categoryPerformance: [],
    popularItems: [],
    orderStatusData: [],
    customerInsights: {
      newCustomers: 0,
      returningCustomers: 0,
      customerRetention: 0,
    },
    recentActivity: [],
  });

  useEffect(() => {
    setTimeRange(validateTimeRange(timeRange));
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      const [overviewResponse, revenueResponse, ordersResponse, menuResponse] = await Promise.all([
        commonAPI.getFoodProviderAnalytics('overview', { timeRange }),
        commonAPI.getFoodProviderAnalytics('revenue', { timeRange }),
        commonAPI.getFoodProviderAnalytics('orders', { timeRange }),
        foodAPI.getMyMenuItems(),
      ]);

      if (overviewResponse.success) {
        const overview = overviewResponse.data;
        const revenue = revenueResponse.success ? revenueResponse.data : { labels: [], data: [] };
        const orders = ordersResponse.success ? ordersResponse.data : { labels: [], data: [] };
        const menu = menuResponse.success ? menuResponse.data : [];

        // Process revenue data
        const revenueData = {
          labels: revenue.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            data: revenue.data || [800, 1200, 1000, 1500, 1300, 1800],
          }],
        };

        // Process orders data
        const ordersData = {
          labels: orders.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            data: orders.data || [12, 19, 15, 25, 22, 30, 18],
          }],
        };

        // Process category performance
        const categoryPerformance = overview.categoryPerformance || [
          { name: 'Rice', orders: 45, revenue: 1200, color: theme.colors.primary },
          { name: 'Noodles', orders: 32, revenue: 900, color: theme.colors.secondary },
          { name: 'Beverages', orders: 28, revenue: 600, color: theme.colors.success },
          { name: 'Desserts', orders: 15, revenue: 400, color: theme.colors.warning },
        ];        // Process popular items
        const sanitizeNumber = (num) => {
          if (typeof num !== 'number' || !isFinite(num) || isNaN(num)) {
            return 0;
          }
          return num;
        };

        const popularItems = overview.popularItems || (menu || []).slice(0, 5).map((item, index) => ({
          name: item.name || `Item ${index + 1}`,
          orders: sanitizeNumber(Math.floor(Math.random() * 50) + 10),
          revenue: sanitizeNumber(Math.floor(Math.random() * 500) + 100),
          rating: sanitizeNumber(parseFloat((Math.random() * 2 + 3).toFixed(1))),
        }));

        // Create order status pie chart data
        const orderStatusData = [
          {
            name: 'Completed',
            population: sanitizeNumber(overview.completedOrders || 65),
            color: theme.colors?.success || '#4ECDC4',
            legendFontColor: theme.colors?.text?.primary || '#333333',
            legendFontSize: 12,
          },
          {
            name: 'Pending',
            population: sanitizeNumber(overview.pendingOrders || 20),
            color: theme.colors?.warning || '#F9AA33',
            legendFontColor: theme.colors?.text?.primary || '#333333',
            legendFontSize: 12,
          },
          {            name: 'Cancelled',
            population: sanitizeNumber(overview.cancelledOrders || 15),
            color: theme.colors?.error || '#FF6B6B',
            legendFontColor: theme.colors?.text?.primary || '#333333',
            legendFontSize: 12,
          },
        ];

        setAnalytics({
          overview,
          revenueData,
          ordersData,
          categoryPerformance,
          popularItems,
          orderStatusData,
          customerInsights: overview.customerInsights || {
            newCustomers: 25,
            returningCustomers: 45,
            customerRetention: 68,
          },
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
                  <Ionicons name="receipt" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.overviewTextContainer}>
                  <Text style={styles.overviewValue}>{analytics.overview.totalOrders}</Text>
                  <Text style={styles.overviewLabel}>Total Orders</Text>
                </View>
              </View>
            </Card>
          </View>

          <View style={styles.overviewRow}>
            <Card style={styles.overviewCard}>
              <View style={styles.overviewContent}>
                <View style={[styles.overviewIcon, { backgroundColor: theme.colors.warning + '20' }]}>
                  <Ionicons name="trending-up" size={24} color={theme.colors.warning} />
                </View>
                <View style={styles.overviewTextContainer}>
                  <Text style={styles.overviewValue}>
                    {formatCurrency(analytics.overview.averageOrderValue)}
                  </Text>
                  <Text style={styles.overviewLabel}>Avg Order</Text>
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
                    {(analytics.overview?.customerRating && typeof analytics.overview.customerRating === 'number') 
                      ? analytics.overview.customerRating.toFixed(1) 
                      : '0.0'}
                  </Text>
                  <Text style={styles.overviewLabel}>Rating</Text>
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

        {/* Orders Chart */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Orders Overview</Text>
          <BarChart
            data={analytics.ordersData}
            width={screenWidth - 60}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars
          />
        </Card>

        {/* Order Status Distribution */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Order Status Distribution</Text>
          <PieChart
            data={analytics.orderStatusData}
            width={screenWidth - 60}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        </Card>

        {/* Popular Menu Items */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Top Performing Items</Text>
          {analytics.popularItems.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemRank}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemStats}>
                  {item.orders} orders • {formatCurrency(item.revenue)}
                </Text>
              </View>
              <View style={styles.itemRating}>
                <Ionicons name="star" size={16} color={theme.colors.warning} />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Category Performance */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Category Performance</Text>
          {analytics.categoryPerformance.map((category, index) => (
            <View key={index} style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryRevenue}>{formatCurrency(category.revenue)}</Text>
              </View>
              <View style={styles.categoryStats}>
                <Text style={styles.categoryOrders}>{category.orders} orders</Text>
                <Text style={styles.categoryAverage}>
                  {formatCurrency(category.revenue / category.orders)} avg
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(category.orders / Math.max(...analytics.categoryPerformance.map(c => c.orders))) * 100}%`,
                      backgroundColor: category.color,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </Card>

        {/* Customer Insights */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Customer Insights</Text>
          <View style={styles.insightsContainer}>
            <View style={styles.insightItem}>
              <Text style={styles.insightValue}>{analytics.customerInsights.newCustomers}</Text>
              <Text style={styles.insightLabel}>New Customers</Text>
            </View>
            <View style={styles.insightItem}>
              <Text style={styles.insightValue}>{analytics.customerInsights.returningCustomers}</Text>
              <Text style={styles.insightLabel}>Returning</Text>
            </View>
            <View style={styles.insightItem}>
              <Text style={styles.insightValue}>{analytics.customerInsights.customerRetention}%</Text>
              <Text style={styles.insightLabel}>Retention Rate</Text>
            </View>
          </View>
        </Card>

        {/* Recent Activity */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {analytics.recentActivity.length > 0 ? (
            analytics.recentActivity.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons 
                    name={activity.type === 'order' ? 'receipt' : 'star'} 
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
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  itemRank: {
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
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
  },
  itemStats: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  itemRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
    marginLeft: theme.spacing.xs,
  },
  categoryItem: {
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  categoryName: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
  },
  categoryRevenue: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  categoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  categoryOrders: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textLight,
  },
  categoryAverage: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textLight,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.borderRadius.sm,
  },
  insightsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  insightItem: {
    alignItems: 'center',
  },
  insightValue: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  insightLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
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

export default FoodProviderAnalyticsScreen;
