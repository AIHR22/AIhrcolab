const fs = require('fs');
const path = require('path');

// Constants
const API_DIR = path.join(__dirname, '..', 'app', 'api');
const OUTPUT_FILE = path.join(__dirname, '..', 'tests', 'generated-api-tests.ts');

// Pattern for route handlers in Next.js
const ROUTE_HANDLER_PATTERNS = [
  { regex: /export\s+async\s+function\s+GET/g, method: 'GET' },
  { regex: /export\s+async\s+function\s+POST/g, method: 'POST' },
  { regex: /export\s+async\s+function\s+PUT/g, method: 'PUT' },
  { regex: /export\s+async\s+function\s+PATCH/g, method: 'PATCH' },
  { regex: /export\s+async\s+function\s+DELETE/g, method: 'DELETE' },
];

// Function to recursively find all route.ts files
function findRouteFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findRouteFiles(filePath, fileList);
    } else if (file === 'route.ts' || file === 'route.js') {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Function to extract HTTP methods from route file
function extractApiMethods(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const methods = [];

  ROUTE_HANDLER_PATTERNS.forEach(pattern => {
    if (pattern.regex.test(content)) {
      methods.push(pattern.method);
    }
  });

  return methods;
}

// Function to generate API endpoint path from file path
function getApiEndpointFromPath(filePath) {
  const relativePath = path.relative(API_DIR, filePath);
  const dirPath = path.dirname(relativePath);
  
  return '/' + dirPath.replace(/\\/g, '/');
}

// Function to generate mock request body based on the endpoint
function generateMockRequestBody(endpoint, method) {
  // Customize based on your API endpoints
  if (endpoint.includes('/workforce/forecasting') && method === 'POST') {
    return {
      requestBody: {
        department_id: "process.env.TEST_DEPARTMENT_ID",
        months: 6
      }
    };
  }
  if (endpoint.includes('/workforce/skill-gap') && method === 'POST') {
    return {
      requestBody: {
        department_id: "process.env.TEST_DEPARTMENT_ID",
        skill_id: "process.env.TEST_SKILL_ID"
      }
    };
  }
  if (endpoint.includes('/workforce/workload') && method === 'POST') {
    return {
      requestBody: {
        department_id: "process.env.TEST_DEPARTMENT_ID"
      }
    };
  }
  if (endpoint.includes('/workforce/project-feasibility') && method === 'POST') {
    return {
      requestBody: {
        project_name: "Test Project",
        required_skills: ["JavaScript", "React"],
        estimated_duration: 3,
        deadline: "2023-12-31"
      }
    };
  }
  
  return {};
}

// Function to generate a validation check for response
function generateValidationCheck(endpoint, method) {
  // Customize based on your API endpoints
  if (endpoint.includes('/departments') && method === 'GET') {
    return {
      validateResponse: `(data) => {
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0]).toHaveProperty('id');
        expect(data[0]).toHaveProperty('name');
      }
    }`
    };
  }
  if (endpoint.includes('/skills') && method === 'GET') {
    return {
      validateResponse: `(data) => {
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0]).toHaveProperty('id');
        expect(data[0]).toHaveProperty('name');
      }
    }`
    };
  }
  if (endpoint.includes('/workforce/forecasting') && method === 'POST') {
    return {
      validateResponse: `(data) => {
      expect(data).toHaveProperty('forecasting_results');
    }`
    };
  }
  if (endpoint.includes('/workforce/skill-gap') && method === 'POST') {
    return {
      validateResponse: `(data) => {
      expect(data).toHaveProperty('skill_gap_results');
    }`
    };
  }
  if (endpoint.includes('/workforce/workload') && method === 'POST') {
    return {
      validateResponse: `(data) => {
      expect(data).toHaveProperty('workload_analysis');
    }`
    };
  }
  if (endpoint.includes('/workforce/project-feasibility') && method === 'POST') {
    return {
      validateResponse: `(data) => {
      expect(data).toHaveProperty('feasibility_analysis');
    }`
    };
  }
  
  return {};
}

// Main function to generate the test file
function generateTestFile() {
  const routeFiles = findRouteFiles(API_DIR);
  const endpoints = [];

  routeFiles.forEach(file => {
    const apiEndpoint = getApiEndpointFromPath(file);
    const methods = extractApiMethods(file);

    methods.forEach(method => {
      const mockBody = generateMockRequestBody(apiEndpoint, method);
      const validation = generateValidationCheck(apiEndpoint, method);
      
      endpoints.push({
        name: `${method} ${apiEndpoint}`,
        endpoint: apiEndpoint,
        method,
        needsAuth: false, // Set to true if the endpoint requires authentication
        ...mockBody,
        ...validation,
      });
    });
  });

  // Generate the test file content
  const testFileContent = `import fetch from 'node-fetch';
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
const endpointTests: TestConfig[] = ${JSON.stringify(endpoints, null, 2)
  .replace(/"requestBody": {/g, '"requestBody": {')
  .replace(/"process.env.TEST_DEPARTMENT_ID"/g, 'process.env.TEST_DEPARTMENT_ID || "550e8400-e29b-41d4-a716-446655440000"')
  .replace(/"process.env.TEST_SKILL_ID"/g, 'process.env.TEST_SKILL_ID || "550e8400-e29b-41d4-a716-446655440000"')
  .replace(/"validateResponse": "(.*?)"/gs, (match, p1) => {
    return `"validateResponse": ${p1.replace(/\\n/g, '\n').replace(/\\"/g, '"')}`;
  })};

// Helper function to make API requests
async function makeRequest(endpoint: string, method: string, body?: any) {
  const url = \`\${BASE_URL}\${endpoint}\`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (authToken) {
    headers['Authorization'] = \`Bearer \${authToken}\`;
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
    
    throw new Error(\`API request failed with status \${response.status}: \${JSON.stringify(errorBody)}\`);
  } catch (error) {
    console.error(\`Error making request to \${url}:\`, error);
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
      console.warn(\`Skipping test "\${testConfig.name}" because it requires authentication\`);
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
      
      console.log(\`✅ Test passed: \${testConfig.name}\`);
    } catch (error) {
      console.error(\`❌ Test failed: \${testConfig.name}\`, error);
      throw error;
    }
  }, 30000); // 30 second timeout for each test
});`;

  // Write to the output file
  fs.writeFileSync(OUTPUT_FILE, testFileContent);
  console.log(`Test file generated at: ${OUTPUT_FILE}`);
  console.log(`Found ${endpoints.length} API endpoints`);
}

// Run the script
generateTestFile(); 