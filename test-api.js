// Test script for workforce planning API endpoints
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api/workforce';

// Test data
const testData = {
  forecast: {
    project_id: '123e4567-e89b-12d3-a456-426614174000',
    months: 12
  },
  feasibility: {
    project_name: 'Test Project',
    start_date: '2024-05-01',
    end_date: '2024-12-31',
    budget: 500000,
    required_skills: [
      {
        skill_id: '123e4567-e89b-12d3-a456-426614174001',
        required_level: 3,
        required_count: 5
      }
    ],
    description: 'A test project for API testing',
    priority: 'high',
    complexity: 'medium'
  },
  reallocate: {
    project_id: '123e4567-e89b-12d3-a456-426614174000',
    target_utilization: 90,
    implementation: false
  },
  attrition: {
    project_id: '123e4567-e89b-12d3-a456-426614174000',
    threshold: 70,
    include_factors: true
  },
  costOptimization: {
    project_id: '123e4567-e89b-12d3-a456-426614174000',
    time_frame: 'annual',
    include_outsourcing: true
  },
  succession: {
    project_id: '123e4567-e89b-12d3-a456-426614174000',
    performance_threshold: 85,
    include_development_plans: true
  }
};

// Helper function for API requests
async function testEndpoint(endpoint, data) {
  console.log(`\n--- Testing ${endpoint} ---`);
  
  try {
    const response = await fetch(`${BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    return { success: response.ok, data: result };
  } catch (error) {
    console.error(`Error testing ${endpoint}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Run all tests
async function runTests() {
  console.log('Starting API tests...');
  
  // Test forecast endpoint
  await testEndpoint('forecast/project', testData.forecast);
  
  // Test feasibility endpoint
  await testEndpoint('project-feasibility/enhanced', testData.feasibility);
  
  // Test reallocation endpoint
  await testEndpoint('reallocate', testData.reallocate);
  
  // Test attrition prediction endpoint
  await testEndpoint('attrition-prediction', testData.attrition);
  
  // Test cost optimization endpoint
  await testEndpoint('cost-optimization', testData.costOptimization);
  
  // Test succession planning endpoint
  await testEndpoint('succession-planning', testData.succession);
  
  console.log('\nAll tests completed!');
}

// Run the tests
runTests().catch(err => {
  console.error('Test script error:', err);
}); 