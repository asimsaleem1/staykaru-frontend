import { io, Socket } from 'socket.io-client';

/**
 * WebSocket Service for Real-time Updates
 * Handles real-time notifications for orders, bookings, and system events
 */

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: { [event: string]: Function[] } = {};
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.listeners = {};
  }

  /**
   * Connect to WebSocket server
   */
  connect(token: string, userRole: string): void {
    try {
      this.socket = io('https://staykaru-backend-60ed08adb2a7.herokuapp.com', {
        auth: {
          token,
          role: userRole
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }

  /**
   * Setup socket event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      if (this.reconnectInterval) {
        clearInterval(this.reconnectInterval);
        this.reconnectInterval = null;
      }

      this.emit('connection_status', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
      this.emit('connection_status', { connected: false, reason });
      
      // Attempt to reconnect
      this.attemptReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.isConnected = false;
      this.emit('connection_error', error);
    });

    // Real-time event listeners for different user roles

    // Student-specific events
    this.socket.on('booking_status_updated', (booking) => {
      this.emit('booking_status_updated', booking);
    });

    this.socket.on('order_status_updated', (order) => {
      this.emit('order_status_updated', order);
    });

    // Landlord-specific events
    this.socket.on('new_booking_request', (booking) => {
      this.emit('new_booking_request', booking);
    });

    this.socket.on('booking_cancelled', (booking) => {
      this.emit('booking_cancelled', booking);
    });

    // Food Provider-specific events
    this.socket.on('new_order', (order) => {
      this.emit('new_order', order);
    });

    this.socket.on('order_cancelled', (order) => {
      this.emit('order_cancelled', order);
    });

    // Admin-specific events
    this.socket.on('new_user_registration', (user) => {
      this.emit('new_user_registration', user);
    });

    this.socket.on('new_accommodation_listing', (accommodation) => {
      this.emit('new_accommodation_listing', accommodation);
    });

    this.socket.on('new_restaurant_registration', (restaurant) => {
      this.emit('new_restaurant_registration', restaurant);
    });

    this.socket.on('system_alert', (alert) => {
      this.emit('system_alert', alert);
    });

    // Universal events
    this.socket.on('notification', (notification) => {
      this.emit('notification', notification);
    });

    this.socket.on('message', (message) => {
      this.emit('message', message);
    });

    this.socket.on('dashboard_update', (data) => {
      this.emit('dashboard_update', data);
    });
  }

  /**
   * Attempt to reconnect to WebSocket
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    if (this.reconnectInterval) return;

    this.reconnectInterval = setInterval(() => {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      if (this.socket) {
        this.socket.connect();
      }
    }, 5000);
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.isConnected = false;
    this.listeners = {};
  }

  /**
   * Subscribe to an event
   */
  on(event: string, callback: Function): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, callback?: Function): void {
    if (!this.listeners[event]) return;

    if (callback) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    } else {
      this.listeners[event] = [];
    }
  }

  /**
   * Emit an event to all listeners
   */
  private emit(event: string, data?: any): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket event handler for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Send data to server
   */
  send(event: string, data?: any): void {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket not connected. Cannot send:', event, data);
    }
  }

  /**
   * Join a room (for role-based broadcasting)
   */
  joinRoom(room: string): void {
    this.send('join_room', { room });
  }

  /**
   * Leave a room
   */
  leaveRoom(room: string): void {
    this.send('leave_room', { room });
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Role-specific subscription helpers
   */
  subscribeAsStudent(userId: string): void {
    this.joinRoom(`student_${userId}`);
    this.joinRoom('students');
  }

  subscribeAsLandlord(landlordId: string): void {
    this.joinRoom(`landlord_${landlordId}`);
    this.joinRoom('landlords');
  }

  subscribeAsFoodProvider(providerId: string): void {
    this.joinRoom(`food_provider_${providerId}`);
    this.joinRoom('food_providers');
  }

  subscribeAsAdmin(): void {
    this.joinRoom('admins');
    this.joinRoom('system_alerts');
  }

  /**
   * Real-time dashboard updates
   */
  requestDashboardUpdate(userRole: string): void {
    this.send('request_dashboard_update', { role: userRole });
  }

  /**
   * Order status updates (for food providers)
   */
  updateOrderStatus(orderId: string, status: string): void {
    this.send('update_order_status', { orderId, status });
  }

  /**
   * Booking status updates (for landlords)
   */
  updateBookingStatus(bookingId: string, status: string): void {
    this.send('update_booking_status', { bookingId, status });
  }

  /**
   * Send real-time notification
   */
  sendNotification(targetUserId: string, notification: any): void {
    this.send('send_notification', { targetUserId, notification });
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;

// Export types for TypeScript
export interface WebSocketNotification {
  id: string;
  type: 'order' | 'booking' | 'system' | 'message';
  title: string;
  message: string;
  data?: any;
  timestamp: string;
  read: boolean;
}

export interface OrderUpdate {
  orderId: string;
  status: 'placed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  estimatedTime?: number;
  message?: string;
}

export interface BookingUpdate {
  bookingId: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  message?: string;
}
