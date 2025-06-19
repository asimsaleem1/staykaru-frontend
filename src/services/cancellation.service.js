import AsyncStorage from '@react-native-async-storage/async-storage';

const CANCELLATION_REQUESTS_KEY = 'cancellation_requests';

export class CancellationService {
  // Store a cancellation request locally
  static async storeCancellationRequest(bookingId, reason) {
    try {
      const requests = await this.getCancellationRequests();
      const newRequest = {
        id: Date.now().toString(),
        bookingId,
        reason,
        requestedAt: new Date().toISOString(),
        status: 'pending',
        submittedToBackend: false
      };
      
      requests.push(newRequest);
      await AsyncStorage.setItem(CANCELLATION_REQUESTS_KEY, JSON.stringify(requests));
      return newRequest;
    } catch (error) {
      console.error('Failed to store cancellation request:', error);
      throw error;
    }
  }

  // Get all stored cancellation requests
  static async getCancellationRequests() {
    try {
      const storedRequests = await AsyncStorage.getItem(CANCELLATION_REQUESTS_KEY);
      return storedRequests ? JSON.parse(storedRequests) : [];
    } catch (error) {
      console.error('Failed to get cancellation requests:', error);
      return [];
    }
  }

  // Get cancellation request for a specific booking
  static async getCancellationRequestForBooking(bookingId) {
    try {
      const requests = await this.getCancellationRequests();
      return requests.find(req => req.bookingId === bookingId && req.status === 'pending');
    } catch (error) {
      console.error('Failed to get cancellation request for booking:', error);
      return null;
    }
  }

  // Update cancellation request status
  static async updateCancellationRequestStatus(requestId, status) {
    try {
      const requests = await this.getCancellationRequests();
      const requestIndex = requests.findIndex(req => req.id === requestId);
      
      if (requestIndex !== -1) {
        requests[requestIndex].status = status;
        requests[requestIndex].updatedAt = new Date().toISOString();
        await AsyncStorage.setItem(CANCELLATION_REQUESTS_KEY, JSON.stringify(requests));
        return requests[requestIndex];
      }
      return null;
    } catch (error) {
      console.error('Failed to update cancellation request status:', error);
      throw error;
    }
  }

  // Mark request as submitted to backend
  static async markAsSubmittedToBackend(requestId) {
    try {
      const requests = await this.getCancellationRequests();
      const requestIndex = requests.findIndex(req => req.id === requestId);
      
      if (requestIndex !== -1) {
        requests[requestIndex].submittedToBackend = true;
        requests[requestIndex].submittedAt = new Date().toISOString();
        await AsyncStorage.setItem(CANCELLATION_REQUESTS_KEY, JSON.stringify(requests));
        return requests[requestIndex];
      }
      return null;
    } catch (error) {
      console.error('Failed to mark request as submitted:', error);
      throw error;
    }
  }

  // Clear all cancellation requests (useful for testing)
  static async clearAllRequests() {
    try {
      await AsyncStorage.removeItem(CANCELLATION_REQUESTS_KEY);
    } catch (error) {
      console.error('Failed to clear cancellation requests:', error);
      throw error;
    }
  }

  // Get user-friendly status message
  static getStatusMessage(request) {
    switch (request.status) {
      case 'pending':
        return request.submittedToBackend 
          ? 'Your cancellation request has been submitted and is being reviewed by the landlord.'
          : 'Your cancellation request is saved locally. Please contact the landlord directly or our support team.';
      case 'approved':
        return 'Your cancellation request has been approved.';
      case 'rejected':
        return 'Your cancellation request has been rejected. Please contact support for more information.';
      default:
        return 'Cancellation request status unknown.';
    }
  }
}

export default CancellationService;
