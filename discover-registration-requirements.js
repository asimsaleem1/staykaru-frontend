#!/usr/bin/env node

/**
 * Backend Registration Requirements Discovery
 * This script tests different registration payloads to understand backend requirements
 */

const https = require('https');

const API_BASE_URL = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'StayKaru-Registration-Test/1.0',
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testRegistrationRequirements() {
  console.log('🔍 DISCOVERING BACKEND REGISTRATION REQUIREMENTS');
  console.log('===============================================');
  
  // Test 1: Empty payload to see all required fields
  console.log('\\n1️⃣ Testing with empty payload to discover all required fields...');
  try {
    const response1 = await makeRequest(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: {}
    });
    
    console.log(`   Status: ${response1.statusCode}`);
    console.log(`   Required fields error: ${JSON.stringify(response1.data.message, null, 2)}`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }

  // Test 2: Minimal fields
  console.log('\\n2️⃣ Testing with basic fields...');
  try {
    const response2 = await makeRequest(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: {
        name: 'Test User',
        email: 'test.discovery@staykaru.com',
        password: 'TestPassword123!',
        role: 'student'
      }
    });
    
    console.log(`   Status: ${response2.statusCode}`);
    if (response2.statusCode !== 201) {
      console.log(`   Still missing: ${JSON.stringify(response2.data.message, null, 2)}`);
    } else {
      console.log(`   ✅ Success with minimal fields!`);
    }
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }

  // Test 3: Add phone and country code
  console.log('\\n3️⃣ Testing with phone and country code...');
  try {
    const response3 = await makeRequest(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: {
        name: 'Test User',
        email: 'test.discovery2@staykaru.com',
        password: 'TestPassword123!',
        role: 'student',
        phone: '+923001234567',
        countryCode: '+92'
      }
    });
    
    console.log(`   Status: ${response3.statusCode}`);
    if (response3.statusCode !== 201) {
      console.log(`   Still missing: ${JSON.stringify(response3.data.message, null, 2)}`);
    } else {
      console.log(`   ✅ Success with phone fields!`);
    }
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }

  // Test 4: Add gender
  console.log('\\n4️⃣ Testing with gender field...');
  try {
    const response4 = await makeRequest(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: {
        name: 'Test User',
        email: 'test.discovery3@staykaru.com',
        password: 'TestPassword123!',
        role: 'student',
        phone: '+923001234567',
        countryCode: '+92',
        gender: 'male'
      }
    });
    
    console.log(`   Status: ${response4.statusCode}`);
    if (response4.statusCode !== 201) {
      console.log(`   Still missing: ${JSON.stringify(response4.data.message, null, 2)}`);
    } else {
      console.log(`   ✅ Success with gender field!`);
    }
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }

  // Test 5: Complete payload based on previous errors
  console.log('\\n5️⃣ Testing with comprehensive payload...');
  try {
    const response5 = await makeRequest(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: {
        name: 'Complete Test User',
        email: 'test.complete@staykaru.com',
        password: 'TestPassword123!',
        role: 'student',
        phone: '+923001234567',
        countryCode: '+92',
        gender: 'male',
        dateOfBirth: '1995-01-01',
        university: 'Test University',
        address: {
          street: '123 Test Street',
          city: 'Karachi',
          state: 'Sindh',
          zipCode: '12345',
          country: 'Pakistan'
        }
      }
    });
    
    console.log(`   Status: ${response5.statusCode}`);
    if (response5.statusCode === 201) {
      console.log(`   ✅ SUCCESS! Complete registration payload works!`);
      console.log(`   User created: ${JSON.stringify(response5.data, null, 2)}`);
    } else if (response5.statusCode === 400 && response5.data.message?.includes('already exists')) {
      console.log(`   ✅ SUCCESS! Registration schema is correct (user already exists)`);
    } else {
      console.log(`   Response: ${JSON.stringify(response5.data, null, 2)}`);
    }
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }

  console.log('\\n📋 REGISTRATION REQUIREMENTS DISCOVERY COMPLETE');
  console.log('=================================================');
  console.log('Based on the tests above, update the frontend registration form to include all required fields.');
}

testRegistrationRequirements().catch(console.error);
