// Simple test script to verify API endpoints are working
const BASE_URL = 'http://localhost:3000/api';

async function testEndpoint(endpoint, description) {
  try {
    console.log(`🔍 Testing ${description}...`);
    const response = await fetch(`${BASE_URL}${endpoint}`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log(`✅ ${description} - OK`);
      if (Array.isArray(data.data)) {
        console.log(`   📊 Returned ${data.data.length} items`);
      } else if (typeof data.data === 'object' && data.data !== null) {
        console.log(`   📊 Returned object with keys: ${Object.keys(data.data).join(', ')}`);
      }
    } else {
      console.log(`❌ ${description} - Failed:`, data.error || 'Unknown error');
    }
  } catch (error) {
    console.log(`❌ ${description} - Network error:`, error.message);
  }
}

async function runTests() {
  console.log('🚀 Testing API endpoints...\n');
  
  // Test core endpoints
  await testEndpoint('/users', 'Users API');
  await testEndpoint('/messages', 'Messages API');
  await testEndpoint('/tasks', 'Tasks API');
  await testEndpoint('/roles', 'Roles API');
  await testEndpoint('/permissions', 'Permissions API');
  
  // Test dashboard endpoints
  await testEndpoint('/dashboard/stats', 'Dashboard Stats');
  await testEndpoint('/dashboard/activities', 'Dashboard Activities');
  await testEndpoint('/dashboard/system-status', 'System Status');
  await testEndpoint('/dashboard/monthly-stats', 'Monthly Stats');
  
  console.log('\n✅ API testing completed!');
}

// Check if we're running in Node.js environment
if (typeof window === 'undefined') {
  // Node.js environment - use built-in fetch (Node.js 18+)
  if (typeof fetch === 'undefined') {
    console.log('❌ This script requires Node.js 18+ with built-in fetch support');
    process.exit(1);
  }
  runTests().catch(console.error);
} else {
  // Browser environment
  runTests().catch(console.error);
}