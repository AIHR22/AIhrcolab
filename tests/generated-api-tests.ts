import fetch from 'node-fetch';
import { expect, describe, test, beforeAll } from '@jest/globals';

// Base URL for API requests
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

// Authentication token (if needed)
let authToken: string | null = null;

// Define the test configuration type
interface TestConfig {
  name: string;
  endpoint: string;
  method: string;
  needsAuth: boolean;
  requestBody?: any;
  validateResponse?: (data: any) => void;
}

// Test configurations for different endpoints
const endpointTests: TestConfig[] = [
  {
    "name": "POST /ai/employee-insights",
    "endpoint": "/ai/employee-insights",
    "method": "POST",
    "needsAuth": false
  },
  {
    "name": "POST /ai/generate-org",
    "endpoint": "/ai/generate-org",
    "method": "POST",
    "needsAuth": false
  },
  {
    "name": "POST /assistant",
    "endpoint": "/assistant",
    "method": "POST",
    "needsAuth": false
  },
  {
    "name": "POST /auth/create-profile",
    "endpoint": "/auth/create-profile",
    "method": "POST",
    "needsAuth": false
  },
  {
    "name": "POST /auth/signout",
    "endpoint": "/auth/signout",
    "method": "POST",
    "needsAuth": false
  },
  {
    "name": "GET /auth/test",
    "endpoint": "/auth/test",
    "method": "GET",
    "needsAuth": false
  },
  {
    "name": "POST /courses/assign",
    "endpoint": "/courses/assign",
    "method": "POST",
    "needsAuth": false
  },
  {
    "name": "GET /courses",
    "endpoint": "/courses",
    "method": "GET",
    "needsAuth": false
  },
  {
    "name": "POST /courses",
    "endpoint": "/courses",
    "method": "POST",
    "needsAuth": false
  },
  {
    "name": "GET /employees",
    "endpoint": "/employees",
    "method": "GET",
    "needsAuth": false
  },
  {
    "name": "POST /employees",
    "endpoint": "/employees",
    "method": "POST",
    "needsAuth": false
  },
  {
    "name": "PUT /employees/[id]",
    "endpoint": "/employees/[id]",
    "method": "PUT",
    "needsAuth": false
  },
  {
    "name": "DELETE /employees/[id]",
    "endpoint": "/employees/[id]",
    "method": "DELETE",
    "needsAuth": false
  },
  {
    "name": "GET /job-postings",
    "endpoint": "/job-postings",
    "method": "GET",
    "needsAuth": false
  },
  {
    "name": "POST /job-postings",
    "endpoint": "/job-postings",
    "method": "POST",
    "needsAuth": false
  },
  {
    "name": "GET /payroll",
    "endpoint": "/payroll",
    "method": "GET",
    "needsAuth": false
  },
  {
    "name": "POST /payroll",
    "endpoint": "/payroll",
    "method": "POST",
    "needsAuth": false
  },
  {
    "name": "GET /payroll/[id]",
    "endpoint": "/payroll/[id]",
    "method": "GET",
    "needsAuth": false
  },
  {
    "name": "PUT /payroll/[id]",
    "endpoint": "/payroll/[id]",
    "method": "PUT",
    "needsAuth": false
  },
  {
    "name": "DELETE /payroll/[id]",
    "endpoint": "/payroll/[id]",
    "method": "DELETE",
    "needsAuth": false
  },
  {
    "name": "GET /projects/[id]",
    "endpoint": "/projects/[id]",
    "method": "GET",
    "needsAuth": false
  },
  {
    "name": "PUT /projects/[id]",
    "endpoint": "/projects/[id]",
    "method": "PUT",
    "needsAuth": false
  },
  {
    "name": "DELETE /projects/[id]",
    "endpoint": "/projects/[id]",
    "method": "DELETE",
    "needsAuth": false
  },
  {
    "name": "POST /revenue/forecast",
    "endpoint": "/revenue/forecast",
    "method": "POST",
    "needsAuth": false
  },
  {
    "name": "GET /revenue/metrics",
    "endpoint": "/revenue/metrics",
    "method": "GET",
    "needsAuth": false
  },
  {
    "name": "POST /revenue",
    "endpoint": "/revenue",
    "method": "POST",
    "needsAuth": false
  },
  {
    "name": "GET /revenue/[id]",
    "endpoint": "/revenue/[id]",
    "method": "GET",
    "needsAuth": false
  },
  {
    "name": "PUT /revenue/[id]",
    "endpoint": "/revenue/[id]",
    "method": "PUT",
    "needsAuth": false
  },
  {
    "name": "DELETE /revenue/[id]",
    "endpoint": "/revenue/[id]",
    "method": "DELETE",
    "needsAuth": false
  },
  {
    "name": "POST /seed",
    "endpoint": "/seed",
    "method": "POST",
    "needsAuth": false
  },
  {
    "name": "GET /seed-db",
    "endpoint": "/seed-db",
    "method": "GET",
    "needsAuth": false
  },
  {
    "name": "POST /setup/add-address-column",
    "endpoint": "/setup/add-address-column",
    "method": "POST",
    "needsAuth": false
  },
  {
    "name": "POST /setup/admin",
    "endpoint": "/setup/admin",
    "method": "POST",
    "needsAuth": false
  },
  {
    "name": "GET /setup/check-tables",
    "endpoint": "/setup/check-tables",
    "method": "GET",
    "needsAuth": false
  },
  {
    "name": "POST /setup/create-all-tables",
    "endpoint": "/setup/create-all-tables",
    "method": "POST",
    "needsAuth": false
  },
  {
    "name": "POST /setup/create-tables",
    "endpoint": "/setup/create-tables",
    "method": "POST",
    "needsAuth": false
  },
  {
    "name": "POST /setup/database",
    "endpoint": "/setup/database",
    "method": "POST",
    "needsAuth": false
  },
  {
    "name": "POST /setup/function",
    "endpoint": "/setup/function",
    "method": "POST",
    "needsAuth": false
  },
  {
    "name": "POST /setup/projects-tables",
    "endpoint": "/setup/projects-tables",
    "method": "POST",
    "needsAuth": false
  },
  {
    "name": "POST /setup/recreate-employees-direct",
    "endpoint": "/setup/recreate-employees-direct",
    "method": "POST",
    "needsAuth": false
  },
  {
    "name": "POST /setup/recreate-employees-pg",
    "endpoint": "/setup/recreate-employees-pg",
    "method": "POST",
    "needsAuth": false
  },
  {
    "name": "POST /setup/recreate-employees-simple",
    "endpoint": "/setup/recreate-employees-simple",
    "method": "POST",
    "needsAuth": false
  },
  {
    "name": "POST /setup/recreate-employees-sql-direct",
    "endpoint": "/setup/recreate-employees-sql-direct",
    "method": "POST",
    "needsAuth": false
  },
  {
    "name": "GET /setup",
    "endpoint": "/setup",
    "method": "GET",
    "needsAuth": false
  },
  {
    "name": "POST /setup",
    "endpoint": "/setup",
    "method": "POST",
    "needsAuth": false
  },
  {
    "name": "POST /setup/seed",
    "endpoint": "/setup/seed",
    "method": "POST",
    "needsAuth": false
  },
  {
    "name": "POST /setup/seed-employees",
    "endpoint": "/setup/seed-employees",
    "method": "POST",
    "needsAuth": false
  },
  {
    "name": "GET /setup/time-off-tables",
    "endpoint": "/setup/time-off-tables",
    "method": "GET",
    "needsAuth": false
  },
  {
    "name": "POST /setup/update-employees-simple",
    "endpoint": "/setup/update-employees-simple",
    "method": "POST",
    "needsAuth": false
  },
  {
    "name": "POST /setup/workforce-planning-tables",
    "endpoint": "/setup/workforce-planning-tables",
    "method": "POST",
    "needsAuth": false
  },
  {
    "name": "GET /setup-db",
    "endpoint": "/setup-db",
    "method": "GET",
    "needsAuth": false
  },
  {
    "name": "GET /test",
    "endpoint": "/test",
    "method": "GET",
    "needsAuth": false
  },
  {
    "name": "GET /test-llama",
    "endpoint": "/test-llama",
    "method": "GET",
    "needsAuth": false
  },
  {
    "name": "POST /workforce/forecasting",
    "endpoint": "/workforce/forecasting",
    "method": "POST",
    "needsAuth": false,
    "requestBody": {
      "department_id": process.env.TEST_DEPARTMENT_ID || "550e8400-e29b-41d4-a716-446655440000",
      "months": 6
    },
    "validateResponse": (data) => {
      expect(data).toHaveProperty('forecasting_results');
    }
  },
  {
    "name": "POST /workforce/project-feasibility",
    "endpoint": "/workforce/project-feasibility",
    "method": "POST",
    "needsAuth": false,
    "requestBody": {
      "project_name": "Test Project",
      "required_skills": [
        "JavaScript",
        "React"
      ],
      "estimated_duration": 3,
      "deadline": "2023-12-31"
    },
    "validateResponse": (data) => {
      expect(data).toHaveProperty('feasibility_analysis');
    }
  },
  {
    "name": "POST /workforce/workload-balancing",
    "endpoint": "/workforce/workload-balancing",
    "method": "POST",
    "needsAuth": false,
    "requestBody": {
      "department_id": process.env.TEST_DEPARTMENT_ID || "550e8400-e29b-41d4-a716-446655440000"
    },
    "validateResponse": (data) => {
      expect(data).toHaveProperty('workload_analysis');
    }
  }
];

// Helper function to make API requests
async function makeRequest(endpoint: string, method: string, body?: any) {
  const url = `${BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  const options: any = {
    method,
    headers,
  };
  
  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    if (response.ok) {
      if (response.headers.get('content-type')?.includes('application/json')) {
        return await response.json();
      }
      return await response.text();
    }
    
    // Handle error responses
    let errorBody;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = await response.text();
    }
    
    throw new Error(`API request failed with status ${response.status}: ${JSON.stringify(errorBody)}`);
  } catch (error) {
    console.error(`Error making request to ${url}:`, error);
    throw error;
  }
}

// Setup before all tests
beforeAll(async () => {
  // If you need to authenticate before running tests, do it here
  // For example:
  // const loginResponse = await makeRequest('/auth/login', 'POST', { email: 'test@example.com', password: 'password' });
  // authToken = loginResponse.token;
  
  // Or use environment variables
  authToken = process.env.AUTH_TOKEN || null;
});

// Dynamic tests for all endpoints
describe('API Endpoints', () => {
  test.each(endpointTests)('$name', async (testConfig: TestConfig) => {
    if (testConfig.needsAuth && !authToken) {
      console.warn(`Skipping test "${testConfig.name}" because it requires authentication`);
      return;
    }
    
    try {
      const response = await makeRequest(
        testConfig.endpoint, 
        testConfig.method, 
        testConfig.requestBody
      );
      
      // Basic validation - response should not be null or undefined
      expect(response).toBeDefined();
      
      // Run custom validation if provided
      if (testConfig.validateResponse) {
        testConfig.validateResponse(response);
      }
      
      console.log(`✅ Test passed: ${testConfig.name}`);
    } catch (error) {
      console.error(`❌ Test failed: ${testConfig.name}`, error);
      throw error;
    }
  }, 30000); // 30 second timeout for each test
});