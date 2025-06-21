import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardApiService from '../services/dashboard-api.service';
import webSocketService from '../services/websocket.service';
import { Alert } from 'react-native';

interface DashboardState {
  loading: boolean;
  error: string | null;
  data: any;
  lastUpdated: Date | null;
}

interface DashboardContextType {
  // Dashboard states for each role
  studentDashboard: DashboardState;
  landlordDashboard: DashboardState;
  foodProviderDashboard: DashboardState;
  adminDashboard: DashboardState;
  
  // Actions
  refreshDashboard: (role?: string) => Promise<void>;
  updateDashboardData: (role: string, data: any) => void;
  clearDashboard: (role: string) => void;
  
  // Real-time connection status
  isConnected: boolean;
  connectionError: string | null;
  
  // Notifications
  notifications: any[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
}

const initialDashboardState: DashboardState = {
  loading: false,
  error: null,
  data: null,
  lastUpdated: null
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const { user, authState } = useAuth();
  
  // Dashboard states
  const [studentDashboard, setStudentDashboard] = useState<DashboardState>(initialDashboardState);
  const [landlordDashboard, setLandlordDashboard] = useState<DashboardState>(initialDashboardState);
  const [foodProviderDashboard, setFoodProviderDashboard] = useState<DashboardState>(initialDashboardState);
  const [adminDashboard, setAdminDashboard] = useState<DashboardState>(initialDashboardState);
  
  // WebSocket states
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Notification states
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Setup WebSocket connection when user is authenticated
  useEffect(() => {
    if (authState.isAuthenticated && user && authState.token) {
      initializeWebSocket();
      
      // Load initial dashboard data based on user role
      refreshDashboard(user.role);
    } else {
      // Disconnect WebSocket and clear data when not authenticated
      webSocketService.disconnect();
      clearAllDashboards();
    }

    return () => {
      webSocketService.disconnect();
    };
  }, [authState.isAuthenticated, user, authState.token]);

  const initializeWebSocket = () => {
    if (!user || !authState.token) return;

    try {
      webSocketService.connect(authState.token, user.role);

      // Setup WebSocket event listeners
      webSocketService.on('connection_status', (status: any) => {
        setIsConnected(status.connected);
        if (!status.connected && status.reason) {
          setConnectionError(`Connection lost: ${status.reason}`);
        } else {
          setConnectionError(null);
        }
      });

      webSocketService.on('connection_error', (error: any) => {
        setConnectionError(error.message || 'Connection error');
      });

      // Real-time dashboard updates
      webSocketService.on('dashboard_update', (data: any) => {
        updateDashboardData(user.role, data);
      });

      // Real-time notifications
      webSocketService.on('notification', (notification: any) => {
        addNotification(notification);
      });

      // Role-specific subscriptions
      switch (user.role) {
        case 'student':
          webSocketService.subscribeAsStudent(user.id);
          setupStudentListeners();
          break;
        case 'landlord':
          webSocketService.subscribeAsLandlord(user.id);
          setupLandlordListeners();
          break;
        case 'food_provider':
          webSocketService.subscribeAsFoodProvider(user.id);
          setupFoodProviderListeners();
          break;
        case 'admin':
          webSocketService.subscribeAsAdmin();
          setupAdminListeners();
          break;
      }
    } catch (error) {
      console.error('WebSocket initialization error:', error);
      setConnectionError('Failed to establish real-time connection');
    }
  };

  const setupStudentListeners = () => {
    webSocketService.on('booking_status_updated', (booking: any) => {
      updateStudentDashboard({ type: 'booking_update', booking });
      addNotification({
        type: 'booking',
        title: 'Booking Update',
        message: `Your booking status has been updated to ${booking.status}`,
        data: booking
      });
    });

    webSocketService.on('order_status_updated', (order: any) => {
      updateStudentDashboard({ type: 'order_update', order });
      addNotification({
        type: 'order',
        title: 'Order Update',
        message: `Your order status has been updated to ${order.status}`,
        data: order
      });
    });
  };

  const setupLandlordListeners = () => {
    webSocketService.on('new_booking_request', (booking: any) => {
      updateLandlordDashboard({ type: 'new_booking', booking });
      addNotification({
        type: 'booking',
        title: 'New Booking Request',
        message: `New booking request for ${booking.accommodation?.title}`,
        data: booking
      });
    });

    webSocketService.on('booking_cancelled', (booking: any) => {
      updateLandlordDashboard({ type: 'booking_cancelled', booking });
      addNotification({
        type: 'booking',
        title: 'Booking Cancelled',
        message: `Booking cancelled for ${booking.accommodation?.title}`,
        data: booking
      });
    });
  };

  const setupFoodProviderListeners = () => {
    webSocketService.on('new_order', (order: any) => {
      updateFoodProviderDashboard({ type: 'new_order', order });
      addNotification({
        type: 'order',
        title: 'New Order',
        message: `New order received at ${order.restaurant?.name}`,
        data: order
      });
    });

    webSocketService.on('order_cancelled', (order: any) => {
      updateFoodProviderDashboard({ type: 'order_cancelled', order });
      addNotification({
        type: 'order',
        title: 'Order Cancelled',
        message: `Order cancelled at ${order.restaurant?.name}`,
        data: order
      });
    });
  };

  const setupAdminListeners = () => {
    webSocketService.on('new_user_registration', (user: any) => {
      updateAdminDashboard({ type: 'new_user', user });
      addNotification({
        type: 'system',
        title: 'New User Registration',
        message: `${user.name} registered as ${user.role}`,
        data: user
      });
    });

    webSocketService.on('new_accommodation_listing', (accommodation: any) => {
      updateAdminDashboard({ type: 'new_accommodation', accommodation });
      addNotification({
        type: 'system',
        title: 'New Accommodation',
        message: `New accommodation listed: ${accommodation.title}`,
        data: accommodation
      });
    });

    webSocketService.on('system_alert', (alert: any) => {
      addNotification({
        type: 'system',
        title: 'System Alert',
        message: alert.message,
        data: alert,
        priority: 'high'
      });
    });
  };

  const updateStudentDashboard = (update: any) => {
    setStudentDashboard(prev => ({
      ...prev,
      data: prev.data ? { ...prev.data, ...update } : update,
      lastUpdated: new Date()
    }));
  };

  const updateLandlordDashboard = (update: any) => {
    setLandlordDashboard(prev => ({
      ...prev,
      data: prev.data ? { ...prev.data, ...update } : update,
      lastUpdated: new Date()
    }));
  };

  const updateFoodProviderDashboard = (update: any) => {
    setFoodProviderDashboard(prev => ({
      ...prev,
      data: prev.data ? { ...prev.data, ...update } : update,
      lastUpdated: new Date()
    }));
  };

  const updateAdminDashboard = (update: any) => {
    setAdminDashboard(prev => ({
      ...prev,
      data: prev.data ? { ...prev.data, ...update } : update,
      lastUpdated: new Date()
    }));
  };

  const refreshDashboard = async (role?: string) => {
    const targetRole = role || user?.role;
    if (!targetRole) return;

    try {
      const setState = getStateSetterForRole(targetRole);
      
      setState(prev => ({ ...prev, loading: true, error: null }));

      let data;
      switch (targetRole) {
        case 'student':
          data = await DashboardApiService.student.getDashboard();
          break;
        case 'landlord':
          data = await DashboardApiService.landlord.getDashboard();
          break;
        case 'food_provider':
          data = await DashboardApiService.foodProvider.getDashboard();
          break;
        case 'admin':
          data = await DashboardApiService.admin.getDashboard();
          break;
        default:
          throw new Error(`Unknown role: ${targetRole}`);
      }

      setState(prev => ({
        ...prev,
        loading: false,
        data,
        lastUpdated: new Date(),
        error: null
      }));

    } catch (error: any) {
      console.error(`Error refreshing ${targetRole} dashboard:`, error);
      
      const setState = getStateSetterForRole(targetRole);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load dashboard data'
      }));

      // Show user-friendly error message
      Alert.alert(
        'Dashboard Error',
        'Failed to load dashboard data. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const getStateSetterForRole = (role: string) => {
    switch (role) {
      case 'student': return setStudentDashboard;
      case 'landlord': return setLandlordDashboard;
      case 'food_provider': return setFoodProviderDashboard;
      case 'admin': return setAdminDashboard;
      default: return setStudentDashboard;
    }
  };

  const updateDashboardData = (role: string, data: any) => {
    const setState = getStateSetterForRole(role);
    setState(prev => ({
      ...prev,
      data: { ...prev.data, ...data },
      lastUpdated: new Date()
    }));
  };

  const clearDashboard = (role: string) => {
    const setState = getStateSetterForRole(role);
    setState(initialDashboardState);
  };

  const clearAllDashboards = () => {
    setStudentDashboard(initialDashboardState);
    setLandlordDashboard(initialDashboardState);
    setFoodProviderDashboard(initialDashboardState);
    setAdminDashboard(initialDashboardState);
    setNotifications([]);
    setUnreadCount(0);
  };

  const addNotification = (notification: any) => {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep last 50 notifications
    setUnreadCount(prev => prev + 1);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
    
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const value: DashboardContextType = {
    studentDashboard,
    landlordDashboard,
    foodProviderDashboard,
    adminDashboard,
    refreshDashboard,
    updateDashboardData,
    clearDashboard,
    isConnected,
    connectionError,
    notifications,
    unreadCount,
    markNotificationRead,
    clearAllNotifications
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export default DashboardContext;
