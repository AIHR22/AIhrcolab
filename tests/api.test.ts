import fetch from 'node-fetch';
import { expect, describe, test, beforeAll } from '@jest/globals';

// Base URL for API requests
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';

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
  // Auth endpoints
  { 
    name: 'Auth Test', 
    endpoint: '/auth/test', 
    method: 'GET',
    needsAuth: false,
    validateResponse: async () => {
      try {
        await makeRequest('/auth/test', 'GET');
        throw new Error('Expected 401 response');
      } catch (error: any) {
        expect(error.message).toContain('401');
      }
    }
  },
  
  // Department endpoints
  { 
    name: 'Get All Departments', 
    endpoint: '/departments', 
    method: 'GET',
    needsAuth: false,
    validateResponse: (data: any) => {
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0]).toHaveProperty('id');
        expect(data[0]).toHaveProperty('name');
      }
    }
  },
  
  // Skills endpoints
  { 
    name: 'Get All Skills', 
    endpoint: '/skills', 
    method: 'GET',
    needsAuth: false,
    validateResponse: (data: any) => {
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0]).toHaveProperty('id');
        expect(data[0]).toHaveProperty('name');
      }
    }
  },
  
  // Workforce endpoints
  { 
    name: 'Workforce Forecasting', 
    endpoint: '/workforce/forecasting', 
    method: 'POST',
    needsAuth: false,
    requestBody: {
      department_id: process.env.TEST_DEPARTMENT_ID || '550e8400-e29b-41d4-a716-446655440000', // Example UUID
      months: 6
    },
    validateResponse: (data: any) => {
      expect(data).toHaveProperty('forecasting_results');
    }
  },
  
  { 
    name: 'Skill Gap Analysis', 
    endpoint: '/workforce/skill-gap', 
    method: 'POST',
    needsAuth: false,
    requestBody: {
      department_id: process.env.TEST_DEPARTMENT_ID || '550e8400-e29b-41d4-a716-446655440000', // Example UUID
      skill_id: process.env.TEST_SKILL_ID || '550e8400-e29b-41d4-a716-446655440000' // Example UUID
    },
    validateResponse: (data: any) => {
      expect(data).toHaveProperty('skill_gap_results');
    }
  },
  
  { 
    name: 'Workload Balancing', 
    endpoint: '/workforce/workload', 
    method: 'POST',
    needsAuth: false,
    requestBody: {
      department_id: process.env.TEST_DEPARTMENT_ID || '550e8400-e29b-41d4-a716-446655440000' // Example UUID
    },
    validateResponse: (data: any) => {
      expect(data).toHaveProperty('workload_analysis');
    }
  },
  
  { 
    name: 'Project Feasibility', 
    endpoint: '/workforce/project-feasibility', 
    method: 'POST',
    needsAuth: false,
    requestBody: {
      project_name: "Test Project",
      required_skills: ["JavaScript", "React"],
      start_date: "2025-05-01",
      end_date: "2025-07-31"
    },
    validateResponse: (data: any) => {
      expect(data).toHaveProperty('feasibility_analysis');
    }
  },
  
  // Scenario endpoints
  {
    name: 'Get Company Predefined Scenarios',
    endpoint: '/scenarios/company/predefined',
    method: 'GET',
    needsAuth: true,
    validateResponse: (data: any) => {
      expect(data).toHaveProperty('scenarios');
      expect(Array.isArray(data.scenarios)).toBe(true);
      if (data.scenarios.length > 0) {
        expect(data.scenarios[0]).toHaveProperty('id');
        expect(data.scenarios[0]).toHaveProperty('name');
        expect(data.scenarios[0]).toHaveProperty('impact_amount');
      }
    }
  },

  {
    name: 'Get Project Predefined Scenarios',
    endpoint: '/scenarios/project/predefined?project_id=test-project',
    method: 'GET',
    needsAuth: true,
    validateResponse: (data: any) => {
      expect(data).toHaveProperty('scenarios');
      expect(Array.isArray(data.scenarios)).toBe(true);
      if (data.scenarios.length > 0) {
        expect(data.scenarios[0]).toHaveProperty('id');
        expect(data.scenarios[0]).toHaveProperty('name');
        expect(data.scenarios[0]).toHaveProperty('impact_amount');
      }
    }
  },

  {
    name: 'Calculate Company Custom Scenario',
    endpoint: '/scenarios/company/custom',
    method: 'POST',
    needsAuth: true,
    requestBody: {
      parameters: {
        salary_increase: 10,
        headcount_change: 5
      }
    },
    validateResponse: (data: any) => {
      expect(data).toHaveProperty('impact');
      expect(typeof data.impact).toBe('number');
    }
  },

  {
    name: 'Calculate Project Custom Scenario',
    endpoint: '/scenarios/project/custom',
    method: 'POST',
    needsAuth: true,
    requestBody: {
      project_id: 'test-project',
      parameters: {
        timeline_extension: 2,
        resource_change: -1
      }
    },
    validateResponse: (data: any) => {
      expect(data).toHaveProperty('impact');
      expect(typeof data.impact).toBe('number');
    }
  },

  // Llama test
  { 
    name: 'Test Llama API', 
    endpoint: '/test-llama', 
    method: 'GET',
    needsAuth: false,
  },

  // Add more endpoints here as needed
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
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      errorBody = await response.json();
    } else {
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