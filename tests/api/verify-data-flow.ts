import fetch from 'node-fetch';

async function testEndpoint(endpoint: string, method: string, body?: any) {
  console.log(`\n🔍 Testing ${method} ${endpoint}`);
  console.log('➡️  Request:', { method, body });

  try {
    const response = await fetch(`http://localhost:3000/api${endpoint}`, {
      method,
      headers: {
        'Authorization': 'Bearer test_token',
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    const data = await response.json();
    
    console.log('⬅️  Response:', {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      data
    });

    return { success: response.ok, data };
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error };
  }
}

async function verifyDataFlow() {
  console.log('🚀 Starting Data Flow Verification\n');

  // Test 1: Get Predefined Company Scenarios
  await testEndpoint('/scenarios/company/predefined', 'GET');

  // Test 2: Get Predefined Project Scenarios
  await testEndpoint('/scenarios/project/predefined', 'GET');

  // Test 3: Submit Company Custom Scenario
  await testEndpoint('/scenarios/company/custom', 'POST', {
    scenario: 'Revenue increases by 10% in Q3'
  });

  // Test 4: Submit Project Custom Scenario
  await testEndpoint('/scenarios/project/custom', 'POST', {
    scenario: 'Project timeline extends by 2 months',
    projectId: 'project-1'
  });

  // Test 5: Get Revenue Forecast
  await testEndpoint('/revenue/forecast', 'POST', {
    months: 12
  });
}

// Run tests
verifyDataFlow().catch(console.error);
