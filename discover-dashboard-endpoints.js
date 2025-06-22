#!/usr/bin/env node

/**
 * Backend Endpoint Discovery for Dashboard APIs
 * This script tests various dashboard endpoints to see what's available
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
        'User-Agent': 'StayKaru-Dashboard-Discovery/1.0',
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

async function discoverDashboardEndpoints() {
  console.log('🔍 DISCOVERING DASHBOARD API ENDPOINTS');
  console.log('======================================');
  console.log(`Testing against: ${API_BASE_URL}`);
  
  // First, login to get admin token
  console.log('\\n🔐 Getting admin token...');
  try {
    const loginResponse = await makeRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: {
        email: 'final.test@staykaru.com', // Use our test user
        password: 'TestPassword123!'
      }
    });
    
    if (loginResponse.statusCode !== 200) {
      console.log('❌ Failed to get token. Testing without authentication.');
      return testEndpointsWithoutAuth();
    }
    
    const token = loginResponse.data.access_token;
    console.log('✅ Token obtained');
    
    await testEndpointsWithAuth(token);
    
  } catch (error) {
    console.log('❌ Login failed:', error.message);
    await testEndpointsWithoutAuth();
  }
}

async function testEndpointsWithAuth(token) {
  console.log('\\n📊 TESTING DASHBOARD ENDPOINTS WITH AUTH');
  console.log('==========================================');
  
  const dashboardEndpoints = [
    '/admin/dashboard',
    '/admin/dashboard/stats',
    '/admin/stats',
    '/dashboard',
    '/dashboard/admin',
    '/users',
    '/accommodations', 
    '/food-providers',
    '/admin/users',
    '/admin/accommodations',
    '/admin/food-providers',
    '/admin/analytics',
    '/admin/reports',
    '/admin/overview'
  ];
  
  for (const endpoint of dashboardEndpoints) {
    try {
      console.log(`\\n🧪 Testing: ${endpoint}`);
      const response = await makeRequest(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log(`   Status: ${response.statusCode}`);
      
      if (response.statusCode === 200) {
        console.log('   ✅ AVAILABLE - This endpoint works!');
        if (response.data && typeof response.data === 'object') {
          const keys = Object.keys(response.data);
          if (keys.length > 0) {
            console.log(`   📄 Response keys: [${keys.slice(0, 5).join(', ')}${keys.length > 5 ? ', ...' : ''}]`);
          }
        }
      } else if (response.statusCode === 401) {
        console.log('   🔒 UNAUTHORIZED - Need proper admin role');
      } else if (response.statusCode === 403) {
        console.log('   ⛔ FORBIDDEN - Admin access required');
      } else if (response.statusCode === 404) {
        console.log('   ❌ NOT FOUND - Endpoint does not exist');
      } else {
        console.log(`   ⚠️  Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
      }
      
    } catch (error) {
      console.log(`   💥 ERROR: ${error.message}`);
    }
  }
}

async function testEndpointsWithoutAuth() {
  console.log('\\n📊 TESTING DASHBOARD ENDPOINTS WITHOUT AUTH');
  console.log('=============================================');
  
  const publicEndpoints = [
    '/health',
    '/status', 
    '/api-docs',
    '/documentation',
    '/swagger',
    '/'
  ];
  
  for (const endpoint of publicEndpoints) {
    try {
      console.log(`\\n🧪 Testing: ${endpoint}`);
      const response = await makeRequest(`${API_BASE_URL}${endpoint}`);
      
      console.log(`   Status: ${response.statusCode}`);
      
      if (response.statusCode === 200) {
        console.log('   ✅ AVAILABLE');
      } else if (response.statusCode === 404) {
        console.log('   ❌ NOT FOUND');
      } else {
        console.log(`   ⚠️  Status: ${response.statusCode}`);
      }
      
    } catch (error) {
      console.log(`   💥 ERROR: ${error.message}`);
    }
  }
}

async function suggestWorkingEndpoints() {
  console.log('\\n💡 SUGGESTED FIXES');
  console.log('==================');
  console.log('Based on our authentication system, try these approaches:');
  console.log('');
  console.log('1. 🔧 Create Mock Dashboard Data:');
  console.log('   - Use local state instead of API calls');
  console.log('   - Generate realistic sample data');
  console.log('   - Add API integration later');
  console.log('');
  console.log('2. 🎯 Use Available Endpoints:');
  console.log('   - Use /auth/profile for user data');
  console.log('   - Create dashboard from available auth data');
  console.log('   - Build up functionality gradually');
  console.log('');
  console.log('3. 🚀 Backend Development:');
  console.log('   - Backend needs dashboard endpoints');
  console.log('   - Implement /admin/dashboard/stats');
  console.log('   - Add user management endpoints');
}

discoverDashboardEndpoints()
  .then(suggestWorkingEndpoints)
  .catch(console.error);
