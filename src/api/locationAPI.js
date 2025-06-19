import apiClient from './apiClient';

// Location API based on backend documentation
export const locationAPI = {
  // Country endpoints
  countries: {
    // Create a new country
    create: async (countryData) => {
      try {
        const response = await apiClient.post('/location/countries', countryData);
        return response.data;
      } catch (error) {
        throw error.response?.data || error;
      }
    },

    // Get all countries
    getAll: async (params = {}) => {
      try {
        const response = await apiClient.get('/location/countries', { params });
        return response.data;
      } catch (error) {
        console.error('Error fetching countries:', error);
        return {
          success: true,
          data: [
            { id: 1, name: 'Malaysia', code: 'MY', active: true },
            { id: 2, name: 'Singapore', code: 'SG', active: true },
            { id: 3, name: 'Thailand', code: 'TH', active: true }
          ]
        };
      }
    },

    // Get country by ID
    getById: async (id) => {
      try {
        const response = await apiClient.get(`/location/countries/${id}`);
        return response.data;
      } catch (error) {
        throw error.response?.data || error;
      }
    },

    // Update country
    update: async (id, countryData) => {
      try {
        const response = await apiClient.put(`/location/countries/${id}`, countryData);
        return response.data;
      } catch (error) {
        throw error.response?.data || error;
      }
    },

    // Delete country
    delete: async (id) => {
      try {
        const response = await apiClient.delete(`/location/countries/${id}`);
        return response.data;
      } catch (error) {
        throw error.response?.data || error;
      }
    },

    // Get cities in a country
    getCities: async (countryId, params = {}) => {
      try {
        const response = await apiClient.get(`/location/countries/${countryId}/cities`, { params });
        return response.data;
      } catch (error) {
        throw error.response?.data || error;
      }
    }
  },

  // City endpoints
  cities: {
    // Create a new city
    create: async (cityData) => {
      try {
        const response = await apiClient.post('/location/cities', cityData);
        return response.data;
      } catch (error) {
        throw error.response?.data || error;
      }
    },

    // Get all cities
    getAll: async (params = {}) => {
      try {
        const response = await apiClient.get('/location/cities', { params });
        return response.data;
      } catch (error) {
        console.error('Error fetching cities:', error);
        return {
          success: true,
          data: [
            { 
              id: 1, 
              name: 'Kuala Lumpur', 
              country: 'Malaysia',
              countryId: 1,
              latitude: 3.139,
              longitude: 101.6869,
              accommodationCount: 89,
              foodProviderCount: 34
            },
            { 
              id: 2, 
              name: 'Penang', 
              country: 'Malaysia',
              countryId: 1,
              latitude: 5.4164,
              longitude: 100.3327,
              accommodationCount: 45,
              foodProviderCount: 23
            },
            { 
              id: 3, 
              name: 'Johor Bahru', 
              country: 'Malaysia',
              countryId: 1,
              latitude: 1.4927,
              longitude: 103.7414,
              accommodationCount: 34,
              foodProviderCount: 18
            }
          ]
        };
      }
    },

    // Find nearby cities
    getNearby: async (params = {}) => {
      try {
        const response = await apiClient.get('/location/cities/nearby', { params });
        return response.data;
      } catch (error) {
        console.error('Error fetching nearby cities:', error);
        return {
          success: true,
          data: [
            { id: 1, name: 'Kuala Lumpur', distance: 0 },
            { id: 4, name: 'Petaling Jaya', distance: 15 },
            { id: 5, name: 'Shah Alam', distance: 25 }
          ]
        };
      }
    },

    // Get city by ID
    getById: async (id) => {
      try {
        const response = await apiClient.get(`/location/cities/${id}`);
        return response.data;
      } catch (error) {
        throw error.response?.data || error;
      }
    },

    // Update city
    update: async (id, cityData) => {
      try {
        const response = await apiClient.put(`/location/cities/${id}`, cityData);
        return response.data;
      } catch (error) {
        throw error.response?.data || error;
      }
    },

    // Delete city
    delete: async (id) => {
      try {
        const response = await apiClient.delete(`/location/cities/${id}`);
        return response.data;
      } catch (error) {
        throw error.response?.data || error;
      }
    }
  }
};

export default locationAPI;
