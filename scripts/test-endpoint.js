const fs = require('fs');
const path = require('path');

// Check for arguments
if (process.argv.length < 3) {
  console.log('Usage: node test-endpoint.js <endpoint-path> [method]');
  console.log('Example: node test-endpoint.js /departments GET');
  console.log('Example: node test-endpoint.js /workforce/forecasting POST');
  process.exit(1);
}

// Get endpoint and method from arguments
const endpoint = process.argv[2];
const method = process.argv[3] || 'GET';

// Create a temporary test file
const TEST_FILE = path.join(__dirname, '..', 'tests', 'temp-endpoint-test.js');

// Determine request body based on the endpoint and method
function getRequestBody() {
  if (method !== 'POST' && method !== 'PUT' && method !== 'PATCH') {
    return null;
  }

  if (endpoint.includes('/workforce/forecasting')) {
    return {
      department_id: process.env.TEST_DEPARTMENT_ID || '550e8400-e29b-41d4-a716-446655440000',
      months: 6
    };
  }
  
  if (endpoint.includes('/workforce/skill-gap')) {
    return {
      department_id: process.env.TEST_DEPARTMENT_ID || '550e8400-e29b-41d4-a716-446655440000',
      skill_id: process.env.TEST_SKILL_ID || '550e8400-e29b-41d4-a716-446655440000'
    };
  }
  
  if (endpoint.includes('/workforce/workload')) {
    return {
      department_id: process.env.TEST_DEPARTMENT_ID || '550e8400-e29b-41d4-a716-446655440000'
    };
  }
  
  if (endpoint.includes('/workforce/project-feasibility')) {
    return {
      project_name: "Test Project",
      required_skills: ["JavaScript", "React"],
      estimated_duration: 3,
      deadline: "2023-12-31"
    };
  }
  
  // Default empty body for POST/PUT/PATCH
  return {};
}

// Generate test content
const requestBody = getRequestBody();
const requestBodyStr = requestBody ? `  requestBody: ${JSON.stringify(requestBody, null, 2)}` : '';

const testContent = `
const http = require('http');
const https = require('https');

describe('Test ${method} ${endpoint}', () => {
  test('should return valid response', async () => {
    const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
    const url = \`\${BASE_URL}${endpoint}\`;
    
    const options = {
      method: '${method}',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    console.log('Testing endpoint:', url);
    console.log('Method:', '${method}');
    ${requestBody ? `console.log('Request body:', ${JSON.stringify(requestBody, null, 2)});` : ''}
    
    const response = await new Promise((resolve, reject) => {
      const req = http.request(url, options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      ${requestBody ? `req.write(JSON.stringify(${JSON.stringify(requestBody, null, 2)}));` : ''}
      req.end();
    });
    
    console.log('Status:', response.status);
    
    let responseData;
    try {
      responseData = JSON.parse(response.data);
      console.log('Response:', JSON.stringify(responseData, null, 2));
    } catch (err) {
      console.log('Response (text):', response.data);
      responseData = response.data;
    }
    
    expect(response.status).toBeLessThan(500); // No server errors
    
    if (response.status >= 200 && response.status < 300) {
      expect(responseData).toBeDefined();
    }
  }, 30000);
});
`;

// Write test file
fs.writeFileSync(TEST_FILE, testContent);
console.log(`Created test file for ${method} ${endpoint}`);

// Run test using Node directly
console.log('Running test...');
process.env.NODE_ENV = 'test';
process.env.BYPASS_AUTH = 'true';

// Run Jest programmatically
require('jest').run(['--no-cache', TEST_FILE]);

// Clean up temp file on process exit
process.on('exit', () => {
  try {
    fs.unlinkSync(TEST_FILE);
    console.log('Removed temporary test file');
  } catch (err) {
    // Ignore errors on cleanup
  }
}); 