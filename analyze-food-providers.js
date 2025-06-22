#!/usr/bin/env node

/**
 * Analyze food provider data structure and available endpoints
 */

const axios = require('axios');

const BASE_URL = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com';

const analyzeFoodProviders = async () => {
  console.log('🔍 Analyzing Food Provider Data Structure\n');

  try {
    console.log('📡 Getting food providers...');
    const response = await axios.get(`${BASE_URL}/food-providers`, {
      timeout: 10000
    });

    if (response.data && response.data.length > 0) {
      console.log(`✅ Found ${response.data.length} food providers\n`);
      
      const sample = response.data[0];
      console.log('📋 Sample Food Provider Structure:');
      console.log(JSON.stringify(sample, null, 2));
      
      console.log('\n📊 Available Fields:');
      console.log(Object.keys(sample));
      
      // Check if there are status-related fields
      console.log('\n🔍 Status-related fields:');
      Object.keys(sample).forEach(key => {
        if (key.toLowerCase().includes('status') || 
            key.toLowerCase().includes('active') || 
            key.toLowerCase().includes('approv') ||
            key.toLowerCase().includes('enabled')) {
          console.log(`- ${key}: ${sample[key]}`);
        }
      });

      // Test basic CRUD operations
      console.log('\n🧪 Testing Basic Operations:');
      
      const testId = sample._id || sample.id;
      
      // Test GET single food provider
      try {
        console.log(`📡 Testing GET /food-providers/${testId}`);
        const getResponse = await axios.get(`${BASE_URL}/food-providers/${testId}`, { timeout: 5000 });
        console.log(`✅ GET Status: ${getResponse.status} - Individual food provider endpoint works`);
      } catch (error) {
        console.log(`❌ GET Status: ${error.response?.status || 'Network Error'} - Individual endpoint failed`);
      }

      // Test if we can UPDATE a food provider with PATCH
      try {
        console.log(`📡 Testing PATCH /food-providers/${testId}`);
        const patchResponse = await axios.patch(`${BASE_URL}/food-providers/${testId}`, 
          { test: 'value' }, // Small test update
          { timeout: 5000 }
        );
        console.log(`✅ PATCH Status: ${patchResponse.status} - Update endpoint works`);
      } catch (error) {
        console.log(`❌ PATCH Status: ${error.response?.status || 'Network Error'} - ${error.response?.status === 401 ? 'Auth required' : 'Update failed'}`);
      }

      // Test if we can UPDATE a food provider with PUT
      try {
        console.log(`📡 Testing PUT /food-providers/${testId}`);
        const putResponse = await axios.put(`${BASE_URL}/food-providers/${testId}`, 
          sample, // Send the same data back
          { timeout: 5000 }
        );
        console.log(`✅ PUT Status: ${putResponse.status} - Update endpoint works`);
      } catch (error) {
        console.log(`❌ PUT Status: ${error.response?.status || 'Network Error'} - ${error.response?.status === 401 ? 'Auth required' : 'Update failed'}`);
      }

    } else {
      console.log('❌ No food providers found');
    }

  } catch (error) {
    console.error('❌ Failed to analyze food providers:', error.message);
  }
};

analyzeFoodProviders();
