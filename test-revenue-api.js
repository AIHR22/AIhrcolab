// Test script for revenue API endpoint with proper authentication
const fetch = require('node-fetch');

async function testRevenueTrendsEndpoint() {
  try {
    console.log('Testing /api/revenue/trends endpoint...');
    
    // Step 1: Login to get authentication cookies
    console.log('Step 1: Logging in to get authentication...');
    const loginResponse = await fetch('http://localhost:3000/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@test.com',  // Replace with valid test credentials
        password: 'password123'  // Replace with valid test credentials
      }),
      redirect: 'manual',
      credentials: 'include'
    });
    
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('Login response status:', loginResponse.status);
    
    if (!cookies) {
      console.log('No cookies received from login. Authentication might have failed.');
      return;
    }
    
    // Step 2: Call the revenue trends endpoint with cookies
    console.log('\nStep 2: Calling revenue trends endpoint with authentication...');
    const revenueTrendsResponse = await fetch('http://localhost:3000/api/revenue/trends', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({ 
        months: 12 
      }),
      credentials: 'include'
    });
    
    console.log('Revenue trends response status:', revenueTrendsResponse.status);
    
    if (revenueTrendsResponse.ok) {
      const data = await revenueTrendsResponse.json();
      console.log('\nResponse data:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('Error response:', await revenueTrendsResponse.text());
    }
    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test
testRevenueTrendsEndpoint();
