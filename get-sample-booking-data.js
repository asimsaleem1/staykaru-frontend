#!/usr/bin/env node

/**
 * Get sample booking data to understand the actual structure
 */

const axios = require('axios');

const BASE_URL = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com';

const getSampleBookingData = async () => {
  try {
    console.log('📡 Fetching sample booking data...\n');
    
    const response = await axios.get(`${BASE_URL}/bookings`, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.data && response.data.length > 0) {
      console.log('📊 Sample booking data structure:');
      console.log(JSON.stringify(response.data[0], null, 2));
      
      console.log('\n📋 Available fields:');
      console.log(Object.keys(response.data[0]));
      
      console.log(`\n📈 Total bookings found: ${response.data.length}`);
    } else {
      console.log('📊 No booking data found');
    }
    
  } catch (error) {
    console.error('❌ Error fetching booking data:', error.message);
  }
};

getSampleBookingData();
