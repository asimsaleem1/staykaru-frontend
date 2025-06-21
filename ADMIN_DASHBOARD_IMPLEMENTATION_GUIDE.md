# 📊 ADMIN DASHBOARD IMPLEMENTATION GUIDE

## Overview

The backend has been updated to support a comprehensive admin dashboard with real-time data from the database. This guide outlines how to implement the admin dashboard in the frontend application.

## Available Endpoints

### 1. Dashboard Summary

```
GET /analytics/dashboard
```

Returns a comprehensive summary of all system data:

```json
{
  "counts": {
    "users": 150,
    "bookings": 75,
    "orders": 120,
    "reviews": 90,
    "revenue": 15000
  },
  "distributions": {
    "usersByRole": [
      { "role": "student", "count": 100 },
      { "role": "landlord", "count": 30 },
      { "role": "food_provider", "count": 15 },
      { "role": "admin", "count": 5 }
    ],
    "bookingsByStatus": [
      { "status": "pending", "count": 10 },
      { "status": "confirmed", "count": 45 },
      { "status": "cancelled", "count": 5 },
      { "status": "completed", "count": 15 }
    ],
    "ordersByStatus": [
      { "status": "pending", "count": 15 },
      { "status": "processing", "count": 25 },
      { "status": "completed", "count": 70 },
      { "status": "cancelled", "count": 10 }
    ]
  },
  "recent": {
    "bookings": [/* array of recent bookings */],
    "orders": [/* array of recent orders */]
  }
}
```

### 2. User Analytics

```
GET /analytics/users
```

Returns detailed analytics about users:

```json
{
  "totalUsers": 150,
  "usersByRole": [
    { "role": "student", "count": 100 },
    { "role": "landlord", "count": 30 },
    { "role": "food_provider", "count": 15 },
    { "role": "admin", "count": 5 }
  ],
  "recentUsers": [/* array of 10 most recent users */],
  "userGrowth": [
    { "period": "2025-1", "count": 15 },
    { "period": "2025-2", "count": 20 },
    { "period": "2025-3", "count": 25 },
    /* more months... */
  ]
}
```

### 3. Review Analytics

```
GET /analytics/reviews
```

Returns analytics about system reviews:

```json
{
  "totalReviews": 90,
  "averageRating": 4.2,
  "reviewsByTargetType": [
    { "targetType": "accommodation", "count": 60, "averageRating": 4.3 },
    { "targetType": "food_provider", "count": 30, "averageRating": 4.0 }
  ],
  "recentReviews": [/* array of 10 most recent reviews */]
}
```

### 4. Booking Analytics

```
GET /analytics/bookings?days=30
```

Returns booking analytics for the specified time period:

```json
{
  "totalBookings": 75,
  "totalRevenue": 12500,
  "averageBookingValue": 166.67,
  "bookingsByStatus": [
    { "status": "pending", "count": 10 },
    { "status": "confirmed", "count": 45 },
    { "status": "cancelled", "count": 5 },
    { "status": "completed", "count": 15 }
  ],
  "bookingTrends": [
    { "date": "2025-06-01", "count": 5, "revenue": 800 },
    { "date": "2025-06-02", "count": 7, "revenue": 1200 },
    /* more dates... */
  ]
}
```

### 5. User Management

```
GET /users/admin/all?role=student&search=john
```

Returns a list of users, with optional filtering by role and search term:

```json
[
  {
    "id": "60d21b4967d0d8992e610c85",
    "name": "John Smith",
    "email": "john@example.com",
    "role": "student",
    "phone": "+123456789",
    "gender": "male",
    "isActive": true,
    "createdAt": "2025-06-01T12:00:00.000Z"
  },
  /* more users... */
]
```

### 6. User Counts

```
GET /users/admin/count
```

Returns user counts by role and status:

```json
{
  "total": 150,
  "byRole": {
    "student": 100,
    "landlord": 30,
    "food_provider": 15,
    "admin": 5
  },
  "byStatus": {
    "active": 145,
    "inactive": 5
  }
}
```

### 7. Update User Role

```
PUT /users/admin/:id/role
{
  "role": "landlord"
}
```

Updates a user's role:

```json
{
  "id": "60d21b4967d0d8992e610c85",
  "name": "John Smith",
  "email": "john@example.com",
  "role": "landlord",
  /* other user data... */
}
```

### 8. Update User Status

```
PUT /users/admin/:id/status
{
  "isActive": false
}
```

Updates a user's active status:

```json
{
  "id": "60d21b4967d0d8992e610c85",
  "name": "John Smith",
  "email": "john@example.com",
  "isActive": false,
  /* other user data... */
}
```

### 9. Generate Reports

```
GET /analytics/reports/users
GET /analytics/reports/bookings?days=30
GET /analytics/reports/revenue?days=90
```

Returns detailed reports with complete data sets for each category.

## Admin Dashboard Implementation

### Dashboard Overview

The admin dashboard should include:

1. **Key Metrics**: Display counts of users, bookings, orders, reviews, and total revenue.
2. **User Management**: List, search, filter, and edit users.
3. **Analytics Charts**: Visualize data trends and distributions.
4. **Recent Activity**: Show recent bookings, orders, and user registrations.
5. **Reports**: Generate downloadable reports.

### Example Implementation

#### 1. Admin Dashboard Component

```jsx
import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { Card, Title, Text, Button, ActivityIndicator } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';
import apiClient from '../api/apiClient';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { useAuth } from '../context/AuthContext';
import MetricsCard from '../components/admin/MetricsCard';
import RecentActivityList from '../components/admin/RecentActivityList';

const AdminDashboardScreen = ({ navigation }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();
  const { user } = useAuth();

  // Check if user is admin
  useEffect(() => {
    if (user?.role !== 'admin') {
      navigation.navigate('Home');
    }
  }, [user, navigation]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/analytics/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchDashboardData();
    }
  }, [isFocused]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading && !dashboardData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  // Prepare chart data
  const userRoleData = {
    labels: dashboardData?.distributions?.usersByRole.map(item => item.role) || [],
    data: dashboardData?.distributions?.usersByRole.map(item => item.count) || [],
    colors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
  };

  const bookingStatusData = {
    labels: dashboardData?.distributions?.bookingsByStatus.map(item => item.status) || [],
    data: dashboardData?.distributions?.bookingsByStatus.map(item => item.count) || [],
    colors: ['#FF9F40', '#667eea', '#FF6384', '#4BC0C0'],
  };

  return (
    <ScrollView
      style={{ flex: 1, padding: 16 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Title style={{ fontSize: 24, marginBottom: 16 }}>Admin Dashboard</Title>
      
      {/* Key Metrics */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <MetricsCard
          title="Users"
          value={dashboardData?.counts?.users || 0}
          icon="account-group"
          color="#667eea"
          onPress={() => navigation.navigate('UserManagement')}
        />
        <MetricsCard
          title="Bookings"
          value={dashboardData?.counts?.bookings || 0}
          icon="calendar-check"
          color="#FF6384"
          onPress={() => navigation.navigate('BookingAnalytics')}
        />
        <MetricsCard
          title="Orders"
          value={dashboardData?.counts?.orders || 0}
          icon="food"
          color="#FFCE56"
          onPress={() => navigation.navigate('OrderAnalytics')}
        />
        <MetricsCard
          title="Reviews"
          value={dashboardData?.counts?.reviews || 0}
          icon="star"
          color="#4BC0C0"
          onPress={() => navigation.navigate('ReviewAnalytics')}
        />
      </View>
      
      {/* Revenue Card */}
      <Card style={{ marginVertical: 16 }}>
        <Card.Content>
          <Title>Total Revenue</Title>
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
            ${dashboardData?.counts?.revenue?.toFixed(2) || '0.00'}
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('RevenueAnalytics')}
            style={{ marginTop: 8 }}
          >
            View Details
          </Button>
        </Card.Content>
      </Card>
      
      {/* User Distribution Chart */}
      <Card style={{ marginVertical: 16 }}>
        <Card.Content>
          <Title>User Distribution</Title>
          {userRoleData.labels.length > 0 && (
            <PieChart
              data={userRoleData.labels.map((label, index) => ({
                name: label,
                population: userRoleData.data[index],
                color: userRoleData.colors[index],
                legendFontColor: '#7F7F7F',
                legendFontSize: 12,
              }))}
              width={300}
              height={200}
              chartConfig={{
                backgroundGradientFrom: '#FFFFFF',
                backgroundGradientTo: '#FFFFFF',
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          )}
        </Card.Content>
      </Card>
      
      {/* Recent Activity */}
      <Card style={{ marginVertical: 16 }}>
        <Card.Content>
          <Title>Recent Bookings</Title>
          <RecentActivityList
            data={dashboardData?.recent?.bookings || []}
            type="booking"
            onPress={(item) => navigation.navigate('BookingDetails', { id: item.id })}
          />
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('AllBookings')}
            style={{ marginTop: 8 }}
          >
            View All Bookings
          </Button>
        </Card.Content>
      </Card>
      
      <Card style={{ marginVertical: 16 }}>
        <Card.Content>
          <Title>Recent Orders</Title>
          <RecentActivityList
            data={dashboardData?.recent?.orders || []}
            type="order"
            onPress={(item) => navigation.navigate('OrderDetails', { id: item.id })}
          />
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('AllOrders')}
            style={{ marginTop: 8 }}
          >
            View All Orders
          </Button>
        </Card.Content>
      </Card>
      
      {/* Generate Reports Section */}
      <Card style={{ marginVertical: 16 }}>
        <Card.Content>
          <Title>Reports</Title>
          <View style={{ marginTop: 8, gap: 8 }}>
            <Button mode="contained" onPress={() => navigation.navigate('UserReport')}>
              User Report
            </Button>
            <Button mode="contained" onPress={() => navigation.navigate('BookingReport')}>
              Booking Report
            </Button>
            <Button mode="contained" onPress={() => navigation.navigate('RevenueReport')}>
              Revenue Report
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

export default AdminDashboardScreen;
```

#### 2. User Management Screen

```jsx
import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, Alert } from 'react-native';
import { DataTable, Searchbar, Chip, Button, Text, Title, Menu, Divider, ActivityIndicator } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';
import apiClient from '../api/apiClient';
import { showError } from '../utils/errorHandler';

const UserManagementScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [counts, setCounts] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const isFocused = useIsFocused();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let url = '/users/admin/all';
      
      // Add query parameters if filters are applied
      const params = [];
      if (roleFilter) params.push(`role=${roleFilter}`);
      if (searchQuery) params.push(`search=${searchQuery}`);
      if (params.length > 0) url += `?${params.join('&')}`;
      
      const response = await apiClient.get(url);
      setUsers(response.data);
      
      // Fetch user counts
      const countsResponse = await apiClient.get('/users/admin/count');
      setCounts(countsResponse.data);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchUsers();
    }
  }, [isFocused, roleFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleSearch = () => {
    fetchUsers();
  };

  const handleRoleFilter = (role) => {
    setRoleFilter(role === roleFilter ? '' : role);
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await apiClient.put(`/users/admin/${userId}/role`, { role: newRole });
      fetchUsers();
      Alert.alert('Success', 'User role updated successfully');
    } catch (error) {
      showError(error);
    }
  };

  const handleUpdateStatus = async (userId, isActive) => {
    try {
      await apiClient.put(`/users/admin/${userId}/status`, { isActive });
      fetchUsers();
      Alert.alert('Success', `User ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      showError(error);
    }
  };

  const showMenu = (user) => {
    setSelectedUser(user);
    setMenuVisible(true);
  };

  const hideMenu = () => {
    setMenuVisible(false);
  };

  if (loading && !users.length && !counts) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Title style={{ fontSize: 24, marginBottom: 16 }}>User Management</Title>
      
      {/* User Counts */}
      {counts && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16, gap: 8 }}>
          <Chip icon="account-group" selected>Total: {counts.total}</Chip>
          <Chip 
            icon="account" 
            selected={roleFilter === 'student'} 
            onPress={() => handleRoleFilter('student')}
          >
            Students: {counts.byRole.student}
          </Chip>
          <Chip 
            icon="home" 
            selected={roleFilter === 'landlord'} 
            onPress={() => handleRoleFilter('landlord')}
          >
            Landlords: {counts.byRole.landlord}
          </Chip>
          <Chip 
            icon="food" 
            selected={roleFilter === 'food_provider'} 
            onPress={() => handleRoleFilter('food_provider')}
          >
            Food Providers: {counts.byRole.food_provider}
          </Chip>
          <Chip 
            icon="shield-account" 
            selected={roleFilter === 'admin'} 
            onPress={() => handleRoleFilter('admin')}
          >
            Admins: {counts.byRole.admin}
          </Chip>
        </View>
      )}
      
      {/* Search Bar */}
      <Searchbar
        placeholder="Search users..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        onSubmitEditing={handleSearch}
        style={{ marginBottom: 16 }}
      />
      
      {/* User Table */}
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Name</DataTable.Title>
            <DataTable.Title>Email</DataTable.Title>
            <DataTable.Title>Role</DataTable.Title>
            <DataTable.Title>Status</DataTable.Title>
            <DataTable.Title>Actions</DataTable.Title>
          </DataTable.Header>

          {users.map(user => (
            <DataTable.Row key={user.id}>
              <DataTable.Cell>{user.name}</DataTable.Cell>
              <DataTable.Cell>{user.email}</DataTable.Cell>
              <DataTable.Cell>
                <Chip
                  icon={
                    user.role === 'student' ? 'account' :
                    user.role === 'landlord' ? 'home' :
                    user.role === 'food_provider' ? 'food' :
                    'shield-account'
                  }
                  size="small"
                >
                  {user.role}
                </Chip>
              </DataTable.Cell>
              <DataTable.Cell>
                <Chip
                  icon={user.isActive ? 'check-circle' : 'close-circle'}
                  size="small"
                  style={{ backgroundColor: user.isActive ? '#4caf50' : '#f44336' }}
                  textStyle={{ color: 'white' }}
                >
                  {user.isActive ? 'Active' : 'Inactive'}
                </Chip>
              </DataTable.Cell>
              <DataTable.Cell>
                <Button
                  icon="dots-vertical"
                  onPress={() => showMenu(user)}
                  compact
                >
                  Manage
                </Button>
              </DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </ScrollView>
      
      {/* Action Menu */}
      <Menu
        visible={menuVisible}
        onDismiss={hideMenu}
        anchor={selectedUser ? { x: 100, y: 100 } : undefined}
      >
        <Menu.Item
          title="View Details"
          icon="eye"
          onPress={() => {
            hideMenu();
            navigation.navigate('UserDetails', { id: selectedUser.id });
          }}
        />
        <Menu.Item
          title="Change Role"
          icon="account-convert"
          onPress={() => {
            hideMenu();
            Alert.alert(
              'Change User Role',
              `Select new role for ${selectedUser.name}`,
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Student', 
                  onPress: () => handleUpdateRole(selectedUser.id, 'student') 
                },
                { 
                  text: 'Landlord', 
                  onPress: () => handleUpdateRole(selectedUser.id, 'landlord') 
                },
                { 
                  text: 'Food Provider', 
                  onPress: () => handleUpdateRole(selectedUser.id, 'food_provider') 
                },
                { 
                  text: 'Admin', 
                  onPress: () => handleUpdateRole(selectedUser.id, 'admin') 
                },
              ]
            );
          }}
        />
        <Divider />
        <Menu.Item
          title={selectedUser?.isActive ? 'Deactivate User' : 'Activate User'}
          icon={selectedUser?.isActive ? 'account-cancel' : 'account-check'}
          onPress={() => {
            hideMenu();
            Alert.alert(
              selectedUser?.isActive ? 'Deactivate User' : 'Activate User',
              `Are you sure you want to ${selectedUser?.isActive ? 'deactivate' : 'activate'} ${selectedUser?.name}?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Confirm', 
                  onPress: () => handleUpdateStatus(selectedUser.id, !selectedUser.isActive) 
                },
              ]
            );
          }}
        />
      </Menu>
    </View>
  );
};

export default UserManagementScreen;
```

#### 3. Report Generation Screen

```jsx
import React, { useState } from 'react';
import { View, ScrollView, Share } from 'react-native';
import { Card, Title, Paragraph, Button, Divider, ActivityIndicator, Chip } from 'react-native-paper';
import { PieChart, LineChart } from 'react-native-chart-kit';
import apiClient from '../api/apiClient';
import { showError } from '../utils/errorHandler';

const RevenueReportScreen = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeFrame, setTimeFrame] = useState(30);

  const generateReport = async (days) => {
    try {
      setLoading(true);
      setTimeFrame(days);
      const response = await apiClient.get(`/analytics/reports/revenue?days=${days}`);
      setReport(response.data);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  const shareReport = async () => {
    if (!report) return;
    
    try {
      const message = `
StayKaru Revenue Report (${report.timeFrame})
Generated on: ${new Date(report.generatedAt).toLocaleString()}

Summary:
- Total Revenue: $${report.summary.totalRevenue.toFixed(2)}
- Number of Payments: ${report.summary.numberOfPayments}
- Average Payment Amount: $${report.summary.averagePaymentAmount.toFixed(2)}

Monthly Revenue Trends:
${report.trends.monthly.map(item => `- ${item.period}: $${item.revenue.toFixed(2)} (${item.count} payments)`).join('\n')}

Revenue by Source:
${report.trends.bySourceType.map(item => `- ${item.sourceType}: $${item.revenue.toFixed(2)} (${item.count} payments)`).join('\n')}
      `;
      
      await Share.share({
        message,
        title: 'StayKaru Revenue Report',
      });
    } catch (error) {
      console.error('Error sharing report:', error);
    }
  };

  // Prepare chart data for monthly revenue
  const monthlyRevenueData = {
    labels: report?.trends?.monthly?.map(item => item.period) || [],
    datasets: [
      {
        data: report?.trends?.monthly?.map(item => item.revenue) || [],
        color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  // Prepare chart data for revenue by source type
  const sourceTypeData = {
    labels: report?.trends?.bySourceType?.map(item => item.sourceType) || [],
    data: report?.trends?.bySourceType?.map(item => item.revenue) || [],
    colors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Title style={{ fontSize: 24, marginBottom: 16 }}>Revenue Report</Title>
      
      {/* Time Frame Selection */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16, gap: 8 }}>
        <Chip 
          selected={timeFrame === 7} 
          onPress={() => generateReport(7)}
        >
          Last 7 Days
        </Chip>
        <Chip 
          selected={timeFrame === 30} 
          onPress={() => generateReport(30)}
        >
          Last 30 Days
        </Chip>
        <Chip 
          selected={timeFrame === 90} 
          onPress={() => generateReport(90)}
        >
          Last 90 Days
        </Chip>
        <Chip 
          selected={timeFrame === 365} 
          onPress={() => generateReport(365)}
        >
          Last 365 Days
        </Chip>
      </View>
      
      <Button
        mode="contained"
        onPress={() => generateReport(timeFrame)}
        loading={loading}
        style={{ marginBottom: 16 }}
      >
        Generate Report
      </Button>
      
      {loading && (
        <ActivityIndicator size="large" color="#667eea" style={{ marginVertical: 32 }} />
      )}
      
      {report && (
        <>
          <Card style={{ marginVertical: 16 }}>
            <Card.Content>
              <Title>Revenue Summary</Title>
              <Paragraph>Generated on: {new Date(report.generatedAt).toLocaleString()}</Paragraph>
              <Paragraph>Time Frame: {report.timeFrame}</Paragraph>
              <Divider style={{ marginVertical: 8 }} />
              
              <View style={{ marginTop: 16 }}>
                <Paragraph style={{ fontSize: 18, fontWeight: 'bold' }}>
                  Total Revenue: ${report.summary.totalRevenue.toFixed(2)}
                </Paragraph>
                <Paragraph>
                  Number of Payments: {report.summary.numberOfPayments}
                </Paragraph>
                <Paragraph>
                  Average Payment Amount: ${report.summary.averagePaymentAmount.toFixed(2)}
                </Paragraph>
              </View>
            </Card.Content>
          </Card>
          
          {/* Monthly Revenue Chart */}
          <Card style={{ marginVertical: 16 }}>
            <Card.Content>
              <Title>Monthly Revenue Trends</Title>
              {monthlyRevenueData.labels.length > 0 && (
                <LineChart
                  data={monthlyRevenueData}
                  width={300}
                  height={220}
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    propsForDots: {
                      r: '6',
                      strokeWidth: '2',
                      stroke: '#667eea',
                    },
                  }}
                  bezier
                  style={{ marginVertical: 8, borderRadius: 16 }}
                />
              )}
            </Card.Content>
          </Card>
          
          {/* Revenue by Source Type */}
          <Card style={{ marginVertical: 16 }}>
            <Card.Content>
              <Title>Revenue by Source Type</Title>
              {sourceTypeData.labels.length > 0 && (
                <PieChart
                  data={sourceTypeData.labels.map((label, index) => ({
                    name: label,
                    population: sourceTypeData.data[index],
                    color: sourceTypeData.colors[index % sourceTypeData.colors.length],
                    legendFontColor: '#7F7F7F',
                    legendFontSize: 12,
                  }))}
                  width={300}
                  height={200}
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              )}
            </Card.Content>
          </Card>
          
          {/* Recent Payments */}
          <Card style={{ marginVertical: 16 }}>
            <Card.Content>
              <Title>Recent Payments</Title>
              <Divider style={{ marginVertical: 8 }} />
              
              {report.recentPayments.map((payment, index) => (
                <View key={payment.id} style={{ marginBottom: 8 }}>
                  <Paragraph>
                    <Text style={{ fontWeight: 'bold' }}>${payment.amount.toFixed(2)}</Text> - 
                    {payment.sourceName} ({payment.sourceType})
                  </Paragraph>
                  <Paragraph>User: {payment.user}</Paragraph>
                  <Paragraph>Date: {new Date(payment.createdAt).toLocaleString()}</Paragraph>
                  <Chip icon="check-circle" style={{ marginTop: 4 }}>
                    {payment.status}
                  </Chip>
                  {index < report.recentPayments.length - 1 && (
                    <Divider style={{ marginVertical: 8 }} />
                  )}
                </View>
              ))}
            </Card.Content>
          </Card>
          
          <Button
            mode="contained"
            icon="share"
            onPress={shareReport}
            style={{ marginVertical: 16 }}
          >
            Share Report
          </Button>
        </>
      )}
    </ScrollView>
  );
};

export default RevenueReportScreen;
```

## Navigation Setup

To include the admin dashboard in your navigation structure:

```jsx
// src/navigation/AdminNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import UserDetailsScreen from '../screens/admin/UserDetailsScreen';
import BookingAnalyticsScreen from '../screens/admin/BookingAnalyticsScreen';
import OrderAnalyticsScreen from '../screens/admin/OrderAnalyticsScreen';
import ReviewAnalyticsScreen from '../screens/admin/ReviewAnalyticsScreen';
import RevenueAnalyticsScreen from '../screens/admin/RevenueAnalyticsScreen';
import UserReportScreen from '../screens/admin/reports/UserReportScreen';
import BookingReportScreen from '../screens/admin/reports/BookingReportScreen';
import RevenueReportScreen from '../screens/admin/reports/RevenueReportScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const DashboardStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#667eea',
      },
      headerTintColor: '#fff',
    }}
  >
    <Stack.Screen 
      name="Dashboard" 
      component={AdminDashboardScreen} 
      options={{ title: 'Admin Dashboard' }}
    />
    <Stack.Screen 
      name="UserManagement" 
      component={UserManagementScreen} 
      options={{ title: 'User Management' }}
    />
    <Stack.Screen 
      name="UserDetails" 
      component={UserDetailsScreen} 
      options={{ title: 'User Details' }}
    />
    <Stack.Screen 
      name="BookingAnalytics" 
      component={BookingAnalyticsScreen}
      options={{ title: 'Booking Analytics' }}
    />
    <Stack.Screen 
      name="OrderAnalytics" 
      component={OrderAnalyticsScreen}
      options={{ title: 'Order Analytics' }}
    />
    <Stack.Screen 
      name="ReviewAnalytics" 
      component={ReviewAnalyticsScreen}
      options={{ title: 'Review Analytics' }}
    />
    <Stack.Screen 
      name="RevenueAnalytics" 
      component={RevenueAnalyticsScreen}
      options={{ title: 'Revenue Analytics' }}
    />
    <Stack.Screen 
      name="UserReport" 
      component={UserReportScreen}
      options={{ title: 'User Report' }}
    />
    <Stack.Screen 
      name="BookingReport" 
      component={BookingReportScreen}
      options={{ title: 'Booking Report' }}
    />
    <Stack.Screen 
      name="RevenueReport" 
      component={RevenueReportScreen}
      options={{ title: 'Revenue Report' }}
    />
  </Stack.Navigator>
);

const AdminNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: '#667eea',
      tabBarInactiveTintColor: 'gray',
    }}
  >
    <Tab.Screen
      name="DashboardTab"
      component={DashboardStack}
      options={{
        tabBarLabel: 'Dashboard',
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="dashboard" size={size} color={color} />
        ),
        headerShown: false,
      }}
    />
    <Tab.Screen
      name="UsersTab"
      component={UserManagementScreen}
      options={{
        tabBarLabel: 'Users',
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="people" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="ReportsTab"
      component={RevenueReportScreen}
      options={{
        tabBarLabel: 'Reports',
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="analytics" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

export default AdminNavigator;
```

Then update your main navigation to include the admin navigator:

```jsx
// In your MainNavigator.js
import AdminNavigator from './AdminNavigator';

// Inside your navigator structure
{user.role === 'admin' && (
  <Stack.Screen
    name="AdminDashboard"
    component={AdminNavigator}
    options={{ headerShown: false }}
  />
)}
```

## Additional Components

### MetricsCard Component

```jsx
// src/components/admin/MetricsCard.js
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title, Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

const MetricsCard = ({ title, value, icon, color, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Card style={[styles.card, { borderLeftColor: color }]}>
        <Card.Content style={styles.content}>
          <MaterialIcons name={icon} size={36} color={color} style={styles.icon} />
          <Title style={styles.value}>{value}</Title>
          <Text style={styles.title}>{title}</Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    marginBottom: 16,
  },
  card: {
    borderLeftWidth: 4,
    elevation: 4,
  },
  content: {
    alignItems: 'center',
    padding: 16,
  },
  icon: {
    marginBottom: 8,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 14,
    color: '#666',
  },
});

export default MetricsCard;
```

### RecentActivityList Component

```jsx
// src/components/admin/RecentActivityList.js
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, Divider, Avatar } from 'react-native-paper';

const RecentActivityList = ({ data, type, onPress }) => {
  const getIcon = (item) => {
    if (type === 'booking') {
      return item.accommodation?.title?.[0] || 'A';
    } else if (type === 'order') {
      return item.food_provider?.name?.[0] || 'F';
    } else if (type === 'user') {
      return item.name?.[0] || 'U';
    }
    return '?';
  };

  const getTitle = (item) => {
    if (type === 'booking') {
      return item.accommodation?.title || 'Unknown Accommodation';
    } else if (type === 'order') {
      return item.food_provider?.name || 'Unknown Food Provider';
    } else if (type === 'user') {
      return item.name || 'Unknown User';
    }
    return 'Unknown';
  };

  const getSubtitle = (item) => {
    if (type === 'booking') {
      return `By ${item.user?.name || 'Unknown'} • Status: ${item.status}`;
    } else if (type === 'order') {
      return `By ${item.user?.name || 'Unknown'} • Status: ${item.status}`;
    } else if (type === 'user') {
      return `${item.email} • Role: ${item.role}`;
    }
    return '';
  };

  const getDate = (item) => {
    return new Date(item.createdAt).toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      {data.map((item, index) => (
        <React.Fragment key={item.id || index}>
          <TouchableOpacity
            style={styles.item}
            onPress={() => onPress(item)}
          >
            <Avatar.Text
              size={40}
              label={getIcon(item)}
              style={styles.avatar}
            />
            <View style={styles.textContainer}>
              <Text style={styles.title}>{getTitle(item)}</Text>
              <Text style={styles.subtitle}>{getSubtitle(item)}</Text>
            </View>
            <Text style={styles.date}>{getDate(item)}</Text>
          </TouchableOpacity>
          {index < data.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  avatar: {
    marginRight: 12,
    backgroundColor: '#667eea',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
});

export default RecentActivityList;
```

## Required Dependencies

For the admin dashboard, you'll need to install:

```bash
npm install react-native-chart-kit
npm install react-native-svg
npm install @react-navigation/bottom-tabs
npm install @expo/vector-icons
```

## Authentication Enforcement

Ensure that all admin routes are protected:

```jsx
// In your MainNavigator.js or App.js
const { user } = useAuth();

useEffect(() => {
  // Redirect non-admin users away from admin screens
  if (user && user.role !== 'admin' && route.name.includes('Admin')) {
    navigation.navigate('Home');
  }
  
  // Redirect admin users to admin dashboard when they log in
  if (user && user.role === 'admin' && !route.name.includes('Admin')) {
    navigation.navigate('AdminDashboard');
  }
}, [user, route]);
```

## Conclusion

The admin dashboard now provides a comprehensive view of the application data with real-time information from the database. The implementation includes:

1. **Dashboard Summary**: Key metrics at a glance
2. **User Management**: Complete CRUD operations for users
3. **Analytics Visualization**: Charts and graphs for data trends
4. **Report Generation**: Detailed reports with export functionality

All API endpoints are protected with JWT authentication and role-based access control, ensuring that only admin users can access these features.

The backend is now fully prepared for admin dashboard functionality, with real-time data access from the database. Implement the frontend components as outlined above to create a powerful admin experience.
